+++
categories = ["recipes"]
tags = ["[SPRING]"]
summary = "Recipe Summary"
title = "Spring Data Flow"
date = 2018-09-28T09:56:43-05:00
+++

## Launching SCDF Locally

1. Launch a local RabbitMQ service
1. Launch a local MySQL service
1. Launch a local Redis service
1. Download and Launch a local spring data flow server <br>
    [SCDF Local ](http://repo.spring.io/snapshot/org/springframework/cloud/spring-cloud-dataflow-server-local)

    ```
    java -jar spring-cloud-dataflow-server-local-<VERSION>.jar
        --spring.datasource.url=jdbc:mysql://localhost:3306/scdf
        --spring.datasource.username=root
        --spring.datasource.password=yourpassword
        --spring.datasource.driver-class-name=com.mysql.jdbc.Driver
        --spring.rabbitmq.host=127.0.0.1
        --spring.rabbitmq.port=5672
        --spring.rabbitmq.username=guest
        --spring.rabbitmq.password=guest
    ```

    Verify SCDF launched succssfully by opening the [dashboard](http://localhost:9393/dashboard)

### Build a Simple SCDF Stream

1. Bulk import apps
    ```
     http://bit.ly/Celsius-SR1-stream-applications-rabbit-maven
    ```

1. Create a Stream
    ```
    http --port=7171 | transform --expression=payload.toUpperCase() | file --directory=/Users/keithkester/scdf
    ```

## Working with Data Flow Shell

1. Download version of Spring Data Shell from [here](https://repo.spring.io/release/org/springframework/cloud/spring-cloud-dataflow-shell).
1. Launch shell

    ```
    java -jar spring-cloud-dataflow-shell-1.6.3.RELEASE.jar
    ```
1. Connect shell to Spring Data Flow

    ```
    server-unknown:>dataflow config server http://data-flow-server.local.pcfdev.io
    Shell mode: classic, Server mode: classic
    dataflow:>
    ```
1. Create a Stream

    ```
    stream create --name uppercase-payload --definition "http --port=7171 | transform --expression=payload.toUpperCase() | file --directory=/Users/me/scdf"
    stream deploy --name uppercase-payload
    ```
1. Test Stream

    ```
    curl -X POST \
    http://localhost:7171/ \
    -H 'Cache-Control: no-cache' \
    -H 'Postman-Token: 3295279a-5218-4c1a-b414-2d692bcc1b33' \
    -d 'this is my first day'
    ```

## Deploying SCDF to PCF

- Choose a version of SCDF to deploy <br>
    [SCDF for PCF](http://repo.spring.io/snapshot/org/springframework/cloud/spring-cloud-dataflow-server-cloudfoundry)
- Define a Manifest

  ```
  ---
  applications:
  - name: data-flow-server
    host: data-flow-server
    memory: 2G
    disk_quota: 2G
    instances: 1
    path: spring-cloud-dataflow-server-cloudfoundry-1.7.0.BUILD-SNAPSHOT.jar
    env:
      SPRING_APPLICATION_NAME: data-flow-server
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_URL: https://apps.run.pcfbeta.io
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_ORG: pivot-kkester
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_SPACE: development
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_DOMAIN: apps.run.pcfbeta.io
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_USERNAME: admin
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_PASSWORD: admin
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_STREAM_SERVICES: my-rabbitmq-service
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_TASK_SERVICES: my-spring-db
      SPRING_CLOUD_DEPLOYER_CLOUDFOUNDRY_SKIP_SSL_VALIDATION: true
      SPRING_APPLICATION_JSON: '{"maven": { "remote-repositories": { "repo1": { "url": "https://repo.spring.io/libs-release"} } } }'
  services:
  - my-sql-db
  - my-redis-db
  - my-rabbitmq-service
  ```

- Push to PCF

  ```
  cf push
  ```
