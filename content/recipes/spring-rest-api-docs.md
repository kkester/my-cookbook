+++
categories = ["recipes"]
tags = ["[SPRING]"]
summary = "Recipe Summary"
title = "Spring Rest API Docs"
date = 2018-09-27T14:15:45-05:00
+++

> Guide to implementing Spring REST Docs for RESTful APIs

> Warning:  Lombok prevents certain features of Spring REST Docs from working properly.

## CONFIGURATION

Include dependencies needed to enable Spring REST docs and to generate javadoc for the application as shown below.

```groovy
configurations {
	jsondoclet
}

ext {
	snippetsDir = file("$buildDir/generated-snippets")
	javadocJsonDir = file("$buildDir/generated-javadoc-json")
}

dependencies {
	// Spring Boot
	compile('org.springframework.boot:spring-boot-starter-web')
	compile('org.springframework.boot:spring-boot-starter-actuator')

	// REST Docs
	compile("capital.scalable:spring-auto-restdocs-core:${springAutoRestDocsVersion}")
	testCompile("org.springframework.restdocs:spring-restdocs-core:${springRestDocsVersion}")
	testCompile("org.springframework.restdocs:spring-restdocs-mockmvc:${springRestDocsVersion}")
	jsondoclet("capital.scalable:spring-auto-restdocs-json-doclet:${springAutoRestDocsVersion}")

	testCompile('org.springframework.boot:spring-boot-starter-test')
}

task jsonDoclet(type: Javadoc, dependsOn: compileJava) {
	source = sourceSets.main.allJava
	classpath = sourceSets.main.compileClasspath
	destinationDir = javadocJsonDir
	options.docletpath = configurations.jsondoclet.files.asType(List)
	options.doclet = 'capital.scalable.restdocs.jsondoclet.ExtractDocumentationAsJsonDoclet'
	options.memberLevel = JavadocMemberLevel.PACKAGE
}


asciidoctor {
	sourceDir = file("src/docs")
	outputDir = file("$buildDir/generated-docs")
	options backend: "html", doctype: "book"
	attributes "source-highlighter": "highlightjs", "snippets": snippetsDir

	dependsOn test
}

asciidoctor.doLast {
	copy {
		from file("$buildDir/generated-docs/api")
		into file("$sourceSets.main.output.classesDir/public")
		include "index.html"
	}
}

test {
	systemProperty 'org.springframework.restdocs.outputDir', snippetsDir
	systemProperty 'org.springframework.restdocs.javadocJsonDir', javadocJsonDir

	dependsOn jsonDoclet
}

jar {
	dependsOn asciidoctor
}
```

## Implement REST API

Below is an example API implementation consisting of a single POJO and Controller.  Javadoc is key and will be injected into the generated API docs.

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Customer {

  /** Unique identifier of the Customer */
  private String id;
  /** The full name of the Customer */
  private String name;
  /** The email address of the Customer */
  private String email;
  /** The Customer's address information */
  private Address address;

}
```

```java
@RestController
public class CustomersApiController {

    private static final Logger log = LoggerFactory.getLogger(CustomersApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    public CustomersApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    /**
     * Retrieve a List of Customer resources
     * @return ResponseEntity
     */
    @RequestMapping(value = "/customers",
            produces = { "application/json" },
            method = RequestMethod.GET)
    public ResponseEntity<List<Customer>> getCustomers() {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<List<Customer>>(objectMapper.readValue("[ {  \"id\" : \"id\"}, {  \"id\" : \"id\"} ]", List.class), HttpStatus.OK);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<List<Customer>>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<List<Customer>>(HttpStatus.NOT_IMPLEMENTED);
    }

}
```

## Create Spring Boot Test

```java
import capital.scalable.restdocs.AutoDocumentation;
import capital.scalable.restdocs.jackson.JacksonResultHandlers;
import capital.scalable.restdocs.response.ResponseModifyingPreprocessors;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.restdocs.JUnitRestDocumentation;
import org.springframework.restdocs.cli.CliDocumentation;
import org.springframework.restdocs.http.HttpDocumentation;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation;
import org.springframework.restdocs.operation.preprocess.Preprocessors;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureRestDocs
public class DemoApplicationIntegrationTest {

    @Rule
    public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("build/generated-snippets");

    @Autowired
    private WebApplicationContext context;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    private MockMvc mockMvc;

    @Before
    public void setUp()  {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .alwaysDo(JacksonResultHandlers.prepareJackson(objectMapper))
                .alwaysDo(MockMvcRestDocumentation.document("{class-name}/{method-name}",
                        Preprocessors.preprocessRequest(),
                        Preprocessors.preprocessResponse(
                                ResponseModifyingPreprocessors.replaceBinaryContent(),
                                ResponseModifyingPreprocessors.limitJsonArrayLength(objectMapper),
                                Preprocessors.prettyPrint())))
                .apply(MockMvcRestDocumentation.documentationConfiguration(restDocumentation)
                        .uris()
                        .and().snippets()
                        .withDefaults(CliDocumentation.curlRequest(),
                                HttpDocumentation.httpRequest(),
                                HttpDocumentation.httpResponse(),
                                AutoDocumentation.requestFields(),
                                AutoDocumentation.responseFields(),
                                AutoDocumentation.pathParameters(),
                                AutoDocumentation.requestParameters(),
                                AutoDocumentation.description(),
                                AutoDocumentation.methodAndPath(),
                                AutoDocumentation.section()))
                .build();
    }

    @Test
    public void shouldGetCustomers() throws Exception {

        // when
        RequestBuilder requestBuilder = MockMvcRequestBuilders
                .get("/customers")
                .accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(requestBuilder).andReturn();

        // then
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }
}
```

## Define API Doc

1. Create `docs` folder under `src`
1. Create `index.adoc` file

	```asciidoc
	= Demo Spring REST Docs

	== Get Customers

	include::{snippets}/demo-application-integration-test/should-get-customers/auto-section.adoc[]
	```

## Build Application & Review API Docs

1. Clean and build the application.
1. Locate the `index.html` file generated within `/build/generated-docs`
1. Open `index.html` in browser
![reste api docs](/images/rest_api_docs.png)
