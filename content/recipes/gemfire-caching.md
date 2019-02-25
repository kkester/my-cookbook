+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Gemfire Caching"
date = 2019-02-08T16:07:36-06:00
+++

## Overview

Distributed caching can be an effective way to improve performance for micor-service application.  This recipe will outline the steps to follow to leverage `GemFire` as part of a distributed caching solution where the application would be pushed to PCF and be bound to PCC.

Additional information on Spring Data Cache can be found on [Spring IO](https://spring.io/guides/gs/caching-gemfire/)<br>
The complete code for this recipe is available [over on GitHUb](https://github.com/pivotalservices/voya-poc).

## Client Application

### Dependencies

- Ensure the application `pom` includes the following dependencies.  The last `test` dependency is needed for component testing.

```xml
<dependency>
     <groupId>org.springframework.data</groupId>
     <artifactId>spring-data-gemfire</artifactId>
 </dependency>
 <dependency>
     <groupId>org.springframework.cloud</groupId>
     <artifactId>spring-cloud-spring-service-connector</artifactId>
 </dependency>
 <dependency>
     <groupId>org.springframework.cloud</groupId>
     <artifactId>spring-cloud-cloudfoundry-connector</artifactId>
 </dependency>

 <dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-geode-test</artifactId>
    <version>0.0.1.M3</version>
    <scope>test</scope>
</dependency>
```

### Caching

- Ensure the Data POJO specifies the `@Region` annotation.
- Each Data POJO should specify it's own specific region.
- Ensure the POJO implements `Serializable`.

```java
@Region(name = "offers")
public class Offer implements Serializable {

    private String name;
    private String description;
    private List<String> salesPitches;

}
```

- Apply `@Cacheable` annotation to the entry method of a class.
- Ensure that method contains at least one parameter.

```java
@Service
@Slf4j
public class OfferService {

    @Value("${integration.offers.base-url}")
    private String offersBaseUrl;

    @Autowired
    private RestTemplateBuilder restTemplateBuilder;

    @Cacheable(value = "offers")
    public Collection<Offer> getOffers(String type) {

        log.info("Retrieving offers from external service");

        Collection<Offer> offers = Collections.emptyList();
        RestTemplate restTemplate = restTemplateBuilder.build();

        try {
            ResponseEntity<List<Offer>> response = restTemplate.exchange(
                    offersBaseUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Offer>>() {},
                    type
            );
            offers = response.getBody();
        } catch (Exception e) {
            log.error("Unexpected error occurred invoking call to get offers {}", e);
        }

        return offers;
    }
}
```

### Testing

Define configuration for GemFire caching.  The `@EnableGemFireMockObjects` will inject the appropriate mocks for the test so that a connection to the actual GemFire server is not needed.

```java
@Configuration
@EnableGemFireMockObjects
@Import(CloudCacheConfig.class)
@ActiveProfiles("test")
public class ApplicationTestConfig {

    @Primary
    @Bean(name="testCacheManager")
    GemfireCacheManager cacheManager(GemFireCache gemfireCache) {
        GemfireCacheManager gemfireCacheManger = new GemfireCacheManager();
        gemfireCacheManger.setCache(gemfireCache);
        return gemfireCacheManger;
    }

}
```

Create a `SpringBootTest` that contains an injected `GemFireCache` so that assertions can be made to validate the interactions with GemFire happened as expected.

```java
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProductApplicationServiceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GemFireCache gemFireCache;

    @Test
    public void shouldGetProducts() throws Exception {

        // when
        RequestBuilder requestBuilder = MockMvcRequestBuilders
                .get("/products")
                .accept(MediaType.APPLICATION_JSON);
        MockHttpServletResponse result = mockMvc.perform(requestBuilder).andReturn().getResponse();

        // then
        assertThat(result.getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(result.getContentAsString()).containsPattern(".*\"id\".*:.*9cfae4f0-e5fc-4d91-be83-3656a2776931");
        assertThat(gemFireCache.getRegion("products").get("all")).isNotNull();
    }
}
```

## Setting Up a GemFire Server

The following links have more details on how to setup and use gemfire

- [Quickstart](https://gemfire.docs.pivotal.io/96/gemfire/getting_started/15_minute_quickstart_gfsh.html)
- [Overview](https://gemfire.docs.pivotal.io/97/gemfire/tools_modules/gfsh/chapter_overview.html)

Follow the steps below to setup and start a local gemfire server for the client application to use.

1. Download and install the `GFSH` cli tool
1. Startup `GFSH`
1. Initiate a locator using `start locator`
1. Initiate a server using  `start server`
1. Establish a region using `create region --name=products --type=PARTITION_PERSISTENT`
1. Verify server structure
  - `list members`
  - `describe member --name={serverName}`
  - Ensure region is contained by server
1. Optionally launch pulse using `start pulse`
