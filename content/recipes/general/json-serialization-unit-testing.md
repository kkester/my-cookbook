+++
categories = ["recipes"]
tags = ["[SPRING]"]
summary = "Recipe Summary"
title = "Json Serialization Unit Testing"
date = 2018-09-27T11:01:33-05:00
+++

This recipe provides guidelines to validate and verify that a POJO can serialize and deserialize in JSON correctly.

## Step 1
Enable json support into pom or gradle by including spring boot starter test.
```groovy
testCompile('org.springframework.boot:spring-boot-starter-test')
```

## Step 2
Define a POJO
```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Album {

    private String id;

    private String title;

}
```

## Step 3
Implement the test.
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
