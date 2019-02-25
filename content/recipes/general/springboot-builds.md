+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Springboot Builds"
date = 2018-12-28T06:49:00-06:00
+++

```xml
<build>
  <finalName>${project.artifactId}</finalName>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <executions>
        <execution>
          <goals>
            <goal>build-info</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
    <plugin>
      <groupId>pl.project13.maven</groupId>
      <artifactId>git-commit-id-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

```yml
management:
  endpoints:
    web:
      exposure:
        include:
        - "*"
  endpoint:
    health:
      show-details: "always"
```
