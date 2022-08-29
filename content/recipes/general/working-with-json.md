+++
categories = ["recipes"]
tags = ["[SPRING]"]
summary = "Recipe Summary"
title = "Working with JSON"
date = 2018-09-27T11:01:33-05:00
+++

This recipe provides guidelines to validate and verify that a POJO can serialize and deserialize in JSON correctly.

### Dependencies Needed

Jackson JSON comes along with spring boot starter library.  The following dependency would only be added if XML support is needed.

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```

### Configuration Settings

Following setting excludes null attributes from serialized content.

```yaml
spring:
  jackson:
    default-property-inclusion: "NON_NULL"
    deserialization:
      fail-on-unknown-properties: false
```

The `FAIL_ON_UNKNOWN_PROPERTIES` setting prevents errors from occurring when unknown attributes are encountered when deserializing.  Instead of throwing errors, the unknown attributes are ignored.

```java
ObjectMapper objectMapper = new ObjectMapper();
objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```

## Testing

### Step 1

JSON testing support is included with spring boot starter test.
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

### Step 2
Define a POJO
```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Album {

    private String id;

    private String title;

}
```

### Step 3

Implement the test as shown in the example below. The test is defined using the `SpringRunner` along with the `@JsonTest` annotation.  This enables the `JacksonTester` to be injected into the test.

There are several techniques that can be used to verify the marshalling, but the example below does this by starting with a JSON string which is then deserialized into the POJO.  Next the POJO is then serialized back into a string.  Lastly the beginning JSON string is compared to the resulting JSON string using `JSONAssert` to validate the two are equal.   

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.JsonContent;
import org.springframework.test.context.junit4.SpringRunner;

import static org.skyscreamer.jsonassert.JSONAssert.assertEquals;

@RunWith(SpringRunner.class)
@JsonTest
public class AlbumJsonTest {

    @Autowired
    private JacksonTester<Album> json;

    @Test
    public void testSerialization() throws Exception {

        // given
        String content = "{\"id\":\"1234\",\"title\":\"Groovy\"}";

        // when
        Album album = this.json.parseObject(content);
        JsonContent<Album> albumJsonContent = this.json.write(album);

        // then
        assertEquals(albumJsonContent.getJson(), content, JSONCompareMode.STRICT);
    }

}
```

### Working with Inheritance

- The `visible = true` ensures that the key property is included in the serialized/deserialized process.

```java
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        visible = true,
        property = "configurationItemType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Dispenser.class, name = "dispenser"),
        @JsonSubTypes.Type(value = AuxiliaryFuel.class, name = "auxiliaryFuel"),
        @JsonSubTypes.Type(value = FuelOffload.class, name = "fuelOffload")
})
public class ConfigurationItem {
   ...
}
```
