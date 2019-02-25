+++
categories = ["recipes"]
tags = ["[SCDF]"]
summary = "Recipe Summary"
title = "Spring Data Flow Custom Processor"
date = 2018-11-02T16:26:21-05:00
+++

## Create Custom Processor

### Import Dependencies

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
  </dependency>

  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
    <version>2.0.1.RELEASE</version>
  </dependency>

  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

### Define Processor

```java
@Component
@EnableBinding(Processor.class)
public class ProcessorListener {

    @Autowired
    private FileReader fileReader;

    @Transformer(inputChannel = Processor.INPUT, outputChannel = Processor.OUTPUT)
    public Message<?> process(Message< EventInputMessage > message) {

        EventInputMessage payload = message.getPayload();

        String contents1 = fileReader.readFile(payload.getFileName1());
        String contents2 = fileReader.readFile(payload.getFileName2());

        EventOutputMessage eventOutputMessage = new EventOutputMessage();
        eventOutputMessage.setProductName("" + payload.getProductName() + " Received");
        eventOutputMessage.setFileName1Contents(contents1);
        eventOutputMessage.setFileName2Contents(contents2);

        return MessageBuilder.withPayload(eventOutputMessage).build();
    }

}
```

## Testing Custom Processor

- Start up spring data shell

```
java -jar spring-cloud-dataflow-shell-{version}.RELEASE.jar
```

- Bulk Import Applications

```
http://bit.ly/Celsius-SR1-stream-applications-rabbit-maven
```

- Register Application

```
app register --name custom-processor --type processor --uri file:///Users/usr/workspace/{project-name}/target/{app-name}-0.0.1-SNAPSHOT.jar
```

- Create a Stream

```
http --port=7171 | custom-processor | file --directory=/Users/usr/out-temp
```

- POST Request to Stream

```
POST http:/localhost:7171
Content-Type: application/json
{
	"productName": "TF110",
	"fileName1": "/Users/usr/temp/hello.txt",
	"fileName2": "/Users/usr/temp/hello1.txt"
}
```
