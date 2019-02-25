+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Building Integration Tests with Cucumber"
date = 2019-01-10T18:24:29-05:00
+++

Use the steps in this recipe to implement integration tests for a micro-service.

### Overview

The integration testing strategy purposed below involves building a small suite of tests with the single responsibility of validating that a micro-service is integrating with external services successfully.  The tests are implemented and managed in the same source control repository as the micro-service.  The integration tests are designed and written to be executed as part of the build pipeline after a version of the application has been pushed to PCF.  

A typical build pipeline flow utilizing integration tests could look like something like below.

> Build => unit test => component test => deploy to a PCF Test space => integration test => end-to-end test => deploy to next higher level PCF space.

### Dependencies

The following dependencies are needed in order to implement integration tests with `Cucumber`.

```xml
<dependency>
    <groupId>info.cukes</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>${cukes.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>info.cukes</groupId>
    <artifactId>cucumber-junit</artifactId>
    <version>${cukes.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>info.cukes</groupId>
    <artifactId>cucumber-spring</artifactId>
    <version>${cukes.version}</version>
    <scope>test</scope>
</dependency>
```

### Build Plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <skipTests>${skip.unit.tests}</skipTests>
        <excludes>
            <exclude>**/*IT.java</exclude>
        </excludes>
        <argLine>${argLine}</argLine>
    </configuration>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <configuration>
        <includes>
            <include>**/*IT.java</include>
        </includes>
        <reportsDirectory>${project.build.directory}/failsafe-reports</reportsDirectory>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>integration-test</goal>
            </goals>
        </execution>
        <execution>
            <id>verify</id>
            <phase>verify</phase>
            <goals>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### IntelliJ Setup

If needed, it is highly recommended to install the Cucumber plugin into IntelliJ before starting development.  The plugin provides nice linking from steps defined within a feature to the steps implemented in the code.

### Define Cucumber Test

Tests are defined in terms of scenarios that are contained within feature files.  Typically this is done by creating a `features` folder under resources and implementing the needed `.feature` files.

```feature
Feature: the participant can not be retrieved
  Scenario: client makes a call to GET a participant
    When the client calls /pisp using "23338155-caa6-c556-e053-d22aac0a90e3" and "WEB"
    Then the client receives status code of 404
```

```java
@RunWith(Cucumber.class)
@CucumberOptions(features = "src/test/resources/features", glue = "integration/steps")
public class ParticipantEdgeApplicationIT {
}
```

```java
@SpringBootTest
@ContextConfiguration
@ActiveProfiles("int")
public class ParticipantStepDefs {

    @Autowired
    private RestApiFeature restApiFeature;

    @When("^the client calls /pisp using \"([^\"]*)\" and \"([^\"]*)\"$")
    public void the_client_issues_GET_participant(String particpantId, String controlType) {
        restApiFeature.executeGet("/pisp", particpantId, controlType);
    }

    @Then("^the client receives status code of (\\d+)$")
    public void the_client_receives_status_code_of(int status) throws IOException {
        assertThat(restApiFeature.getLastResponse().getResponse().getStatusCode().value()).isEqualTo(status);
    }

    @Then("^the client receives participant with name of \"([^\"]*)\"$")
    public void the_client_receives_participant_with_name(String name) {
        assertThat(restApiFeature.getLastResponse().getBodyJsonObject().has("name")).isTrue();
        assertThat(restApiFeature.getLastResponse().getBodyJsonObject().get("name").asText()).isEqualTo(name);
    }
}
```

### Build framework

The Cucumber testing framework itself only provides the features described above.  In order to build out the needed tests, code must be written to support the step definitions. With the spring extensions for Cucumber, this logic can be implemented using Dependency Injection and other techniques common amongst spring boot applications.


First step is to implement an application specific to the integration tests.

```java
@SpringBootApplication
public class PispEdgeIntegrationApplication {

	public static void main(String[] args) {
		SpringApplication.run(PispEdgeIntegrationApplication.class, args);
	}

}
```

If the application needs to make requests to external services, implementing a component like the one shown below can help make this done easier.  The component is registered as a spring bean the same as any other and can be injected into any step definitions as needed.

```java
@Component
public class RestApiFeature {

    private ThreadLocal<ResponseResults> lastResponse = new ThreadLocal<>();

    private ThreadLocal<ApiRequest> currentRequest = new ThreadLocal<>();

    private RestTemplate restTemplate;

    private ResponseResultErrorHandler responseResultErrorHandler;

    private String baseUri;

    public RestApiFeature(RestTemplateBuilder builder, @Value("${fw-service}") String uri) {
        responseResultErrorHandler = new ResponseResultErrorHandler();
        restTemplate = builder
                .errorHandler(responseResultErrorHandler)
                .build();
        this.baseUri = uri;
    }

    public ApiRequest getCurrentRequest() {
        return currentRequest.get();
    }

    public void setCurrentRequest(ApiRequest currentRequest) {
        this.currentRequest.set(currentRequest);
    }

    public ResponseResults getLastResponse() {
        return lastResponse.get();
    }

    public void executePostSubmitQuestionnare(String personaRule) {

        ApiRequest currentRequest = this.getCurrentRequest();
        String url = this.baseUri + "/fws/data/customers/" + currentRequest.getProfileId() + "/questionare/" + personaRule;

        ResponseResults results = restTemplate.execute(url, HttpMethod.POST,
                request -> {
                    HttpHeaders requestHeaders = request.getHeaders();
                    requestHeaders.addAll(currentRequest.getHeaders());
                    new StringHttpMessageConverter().write(currentRequest.getBody(), MediaType.APPLICATION_JSON, request);
                },
                response -> {
                    if (responseResultErrorHandler.hadError) {
                        return (responseResultErrorHandler.getResults());
                    } else {
                        return (new ResponseResults(response));
                    }
                });
        lastResponse.set(results);
    }

    public void executeGetRunRules(String personaRule) {

        ApiRequest currentRequest = this.getCurrentRequest();
        String url = this.baseUri + "/fws/service/customers/" + currentRequest.getProfileId() + "/runrules/" + personaRule;

        ResponseResultErrorHandler errorHandler = (ResponseResultErrorHandler) restTemplate.getErrorHandler();
        ResponseResults results = restTemplate.execute(url, HttpMethod.GET, null, response -> {
            if (errorHandler.hadError) {
                return (errorHandler.getResults());
            } else {
                return (new ResponseResults(response));
            }
        });
        lastResponse.set(results);
    }

    private class ResponseResultErrorHandler implements ResponseErrorHandler {

        private ResponseResults results = null;
        private Boolean hadError = false;

        private ResponseResults getResults() {
            return results;
        }

        @Override
        public boolean hasError(ClientHttpResponse response) throws IOException {
            hadError = response.getRawStatusCode() >= 400;
            return hadError;
        }

        @Override
        public void handleError(ClientHttpResponse response) throws IOException {
            results = new ResponseResults(response);
        }
    }

}
```

```java
public class ResponseResults {

    private ClientHttpResponse response;

    private ObjectMapper objectMapper;

    private JsonNode body;

    public ResponseResults(ClientHttpResponse response) throws IOException {
        this.response = response;
        objectMapper = new ObjectMapper();
        body = objectMapper.readTree(response.getBody());
    }

    public ClientHttpResponse getResponse() {
        return response;
    }

    public ObjectNode getBodyJsonObject() {
        return (ObjectNode)body;
    }
}
```

Similarly to how the above components work, the same technique can be used for verifying integrations with a database.

```java
@Component
public class DataSourceFeature {

    @Autowired
    private CalculationRepository calculationRepository;

    public void clearCalculationFor(String clientId, String profileId) {
        CalculationKey key = new CalculationKey(profileId, FWConstants.FW_GLOBAL_CALCULATION, clientId);
        Optional<Calculation> calculationOptional = calculationRepository.findById(key);
        if (calculationOptional.isPresent()) {
            calculationRepository.deleteById(key);
        }
    }

    public Calculation getCalculation(String profileId, String clientId) {
        CalculationKey key = new CalculationKey(profileId, FWConstants.FW_GLOBAL_CALCULATION, clientId);
        return calculationRepository.findById(key).get();
    }
}
```
