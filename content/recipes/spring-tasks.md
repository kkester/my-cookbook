+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Spring Tasks"
date = 2018-09-28T13:33:34-05:00
+++

## Include Spring Task in Project
```groovy
dependencies {
	compile('org.springframework.boot:spring-boot-starter-data-jpa')
	compile('org.springframework.cloud:spring-cloud-starter-task')
	compile('org.springframework.cloud:spring-cloud-task-core')

	// Use MySQL Connector-J
	compile('mysql:mysql-connector-java')
}

dependencyManagement {
	imports {
		mavenBom "org.springframework.cloud:spring-cloud-task-dependencies:${springCloudTaskVersion}"
	}
}
```

> Note: Spring Task requires JPA and a `DataSource`.  MySQL works good for POCs while Redis fails to work at all.

## Enable Spring Task for the Application

```Java
@SpringBootApplication
@EnableTask
public class TasksApplication {

	public static void main(String[] args) {
		SpringApplication.run(TasksApplication.class, args);
	}

}
```
