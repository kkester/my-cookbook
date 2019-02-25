+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Bootifying a Java Application"
date = 2018-10-25T20:12:10-04:00
+++

This recipe outlines the steps to follow to convert a java application into a spring boot application.

## Generate New Spring Boot Application

Start by generating a new spring boot application using [spring initialzr](https://start.spring.io/).  
Typically the following are good dependencies to include:

- Web
- Actuator
- JPA (If the app is going to integrate with a database such as MySQL or Oracle)

### Defining Dependencies

Spring Initialzr will establish the initial set of dependencies needed for the spring boot application such as shown below.

```xml
<parent>
  <artifactId>spring-boot-starter-parent</artifactId>
  <groupId>org.springframework.boot</groupId>
  <version>2.0.6.RELEASE</version>
  <relativePath></relativePath>
</parent>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
  </dependency>

  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

+ Include [Lombok](/recipes/lombok) if needed.
+ Include any additional needed internal dependencies.
+ Configure build plugins to generate clean artifact names and expand actuator info details

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

### Application Implementation

Spring Initialzr will also generate the Application class similar to the defined below.

```java
@SpringBootApplication
public class SpringBootApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootApplication.class, args);
	}

}
```

Configure actuator endpoints so that health check endpoint (amongst others) are enabled.

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

## Migrate Legacy Code to Spring Boot Application

1. Copy a few of the existing classes at a time from legacy application to the new spring boot application.
1. Resolve compile errors.
1. Repeat until all code has been copied over.

## Convert Legacy Classes to Spring Beans as Needed

### Assign Appropriate spring `stereotype` to each of the classes

A stereotype is an annotation denoting the role of a type or method in the overall architecture of the application at
a conceptual level. Spring has four stereotype annotations:

1. Component
    * a general use stereotype that should be used with any non-obvious spring managed classes.
1. Service
    * a special stereotype denoting business logic components of a spring application
1. Controller / RestController
    * a special stereotype denoting controller component of a spring application
1. Repository
    * a special stereotype generally denoting the data access layer of a spring application

For more information on spring stereotypes, please refer to the [spring boot documentation](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/package-summary.html).

### Convert static method and variable definitions to instance based

Spring beans are initialized once upon startup and typically only one instance is created for the lifeclycle of the application. As a result, there is typically little need for static methods in a spring boot application.  However, since spring beans are essentially singletons, they are not able to contain fields other than other collaborators.  Any state in a spring bean must be thread safe and shouldn't change as behavior is executed.

### Autowire Spring Bean Dependencies

Review the legacy code looking for occurrences where collaborators are being instantiated directly within methods.  The instantiation of collaborators should be replaced with an instance that is dependency injected into the class.

### Example

The following example illustrates how the current applications were implemented and then shows how the code was modified in order to make the application a spring boot application.

#### Before

```java
public class Sample {

  private static String param1;
  private static boolean flag;
  private static int count;

  public void main(String[] args) {
      SampleData sampleData = this.create();
      LegacySample.performTask(sampleData);
  }

  private static void performTask() {
      Collaborator c = new Collaborator();
      return c.performTask(param1, flag, count);
  }
}
```

#### After

The changes to the `Collaborator` were excluded for brevity, but that class would also be given the `Component` sterotype.

```java
@Component
public class Sample {

    private Collaborator collaborator;

    public SpringSample(Collaborator collaborator) {
        this.collaborator = collaborator;
    }

    public void execute(String param1, String param2) {
        SampleData sampleData = this.create();
        collaborator.performTask(sampleData);
    }

    private SampleData create() {
        return SampleData.builder().build();
    }
}

@Value
@Builder
public class SampleData {
    private String param1;
    private boolean flag;
    private int count;
}
```

## Enhance Application to Enable Integration with Spring Cloud Data Flow (SCDF)

The steps outlined above should establish an initial set of `Components` and/or `Services`.  
The next step to enable the application to be integrated with SCDF is to define a `RestController`.
Further refinements can be made to define `Repositories` if the application needs to leverage a Data Source such a `PostgreSQL`

The following class diagram shows the design of a typical spring boot application.  The RestController acts as the entry point into the application which will delegate the processing of requests to a service layer which is responsible for performing the business logic. In simple cases the service may perform the logic itself or delegate and orchestrate to other components for more complex cases.  The Service (or perhaps the components) will interact with a Repository if information from a Database needs to be maintained.  

![UML](/images/StdSBDesign.png)
