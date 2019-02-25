+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Spring Jpa Configured for Multiple Data Sources"
date = 2018-10-09T18:40:06-05:00
+++

### Configure Application Properties

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: none
  datasource:
      driver-class-name: com.mysql.jdbc.Driver

db-example-1:
  driver-class-name: ${spring.datasource.driver-class-name}
  jdbcUrl: "jdbc:mysql://localhost:3306/db_example?verifyServerCertificate=false&useSSL=false&requireSSL=false"
  username: "root"
  password: "yourpassword"

db-example-2:
  driver-class-name: ${spring.datasource.driver-class-name}
  jdbcUrl: "jdbc:mysql://localhost:3306/db_example2?verifyServerCertificate=false&useSSL=false&requireSSL=false"
  username: "root"
  password: "yourpassword"
```

As shown in the above example:

1. Both database sources are `MySql` and share the same `driver-class-name`.
1. Primary source is a `MySql` database named `db_example` while the secondary database is named `db_example2`;

### Configure Primary Datasource (ie Users)

```Java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        entityManagerFactoryRef = "entityManagerFactory",
        basePackages = { "com.example.mysqldemo.user" }
)
public class UserDbConfig {

    @Primary
    @Bean(name = "dataSource")
    @ConfigurationProperties(prefix = "db-example-1")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "entityManager")
    public EntityManager entityManager(@Qualifier("entityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return entityManagerFactory.createEntityManager();
    }

    @Primary
    @Bean(name = "entityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("dataSource") DataSource dataSource
    ) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.mysqldemo.user.model")
                .build();
    }

    @Primary
    @Bean(name = "transactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("entityManagerFactory") EntityManagerFactory
                    entityManagerFactory
    ) {
        return new JpaTransactionManager(entityManagerFactory);
    }

}
```

The above example illustrates:

1. Create unique package structure for entities supported by secondary database which in this example is `com.example.mysqldemo.user` and `com.example.mysqldemo.user.model`.
1. Provide unique names for beans which in this example are names prefixed with `task`.
1. Provide prefix for `DataSource` configuration properties that matches root name defined in `application.yml` which in this example is `db-example-1`.
1. An optional `EntityManager` Bean is declared in situations where it would need to be utilized by additional `Components`.

### Configure Secondary Datasource (ie Tasks)

```Java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        entityManagerFactoryRef = "taskEntityManagerFactory",
        basePackages = { "com.example.mysqldemo.task" }
)
public class TaskDbConfig {

    @Bean(name = "taskDataSource")
    @ConfigurationProperties(prefix = "db-example-2")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "taskEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("taskDataSource") DataSource dataSource
    ) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.mysqldemo.task.model")
                .build();
    }

    @Bean(name = "taskTransactionManager")
    public PlatformTransactionManager transactionManager(@Qualifier("taskEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

}
```

The above example illustrates:

1. Create unique package structure for entities supported by secondary database which in this example is `com.example.mysqldemo.task` and `com.example.mysqldemo.task.model`.
1. Provide unique names for beans which in this example are names prefixed with `task`.
1. Provide prefix for `DataSource` configuration properties that matches root name defined in `application.yml` which in this example is `db-example-2`.
