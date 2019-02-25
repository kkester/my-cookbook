+++
categories = ["recipes"]
tags = ["[SERVICES]"]
summary = "Recipe Summary"
title = "Spring Streams"
date = 2018-09-28T09:34:54-05:00
+++

## Include Dependencies in Project

```groovy
dependencies {
	compile('org.springframework.boot:spring-boot-starter-amqp')
	compile('org.springframework.cloud:spring-cloud-stream')
	compile('org.springframework.cloud:spring-cloud-stream-binder-rabbit')

  testCompile('org.springframework.cloud:spring-cloud-stream-test-support')
}
```

```xml
```

## Configuration

```yml
spring:
  application:
    name: sample-spring-integration
  cloud:
    stream:
      bindings:
        input:
          destination: si-input-topic
        output:
          destination: si-output-topic
```

## Implementation

```java
@Component
public class EventPublisher {

    private ApplicationEventPublisher eventPublisher;

    public EventPublisher(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void publishEvent(Object payload) {
        eventPublisher.publishEvent(new PayloadApplicationEvent<>(this, payload));
    }
}
```

```java
@Service
@EnableBinding(Processor.class)
public class GreetingStreamService implements ApplicationListener<PayloadApplicationEvent<GreetingMessage>> {

    private Processor processor;

    private EventPublisher eventPublisher;

    public GreetingStreamService(Processor processor, EventPublisher eventPublisher) {
        this.processor = processor;
        this.eventPublisher = eventPublisher;
    }

    @StreamListener(Processor.INPUT)
    public void handle(GreetingMessage message) {
        eventPublisher.publishEvent(message);
    }

    @SendTo(Processor.OUTPUT)
    public void sendMessage(GreetingMessage message) {
        processor.output().send(MessageBuilder.withPayload(message).build());
    }

    @Override
    public void onApplicationEvent(PayloadApplicationEvent<GreetingMessage> event) {
        GreetingMessage greetingMessage = event.getPayload();
        this.sendMessage(greetingMessage);
    }
}
```

## Unit Testing

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class ProducerApplicationTest {

	@Autowired
	private TestRestTemplate testRestTemplate;

	@Autowired
	private Source source;

	@Autowired
	private MessageCollector collector;

	@Test
	public void testMessagePublished() {
		// given
		Customer customer = new Customer();

		// when
		ResponseEntity<Customer> customerEntity = testRestTemplate.postForEntity("/customers", customer, Customer.class);

		// then
		BlockingQueue<Message<?>> messages = collector.forChannel(source.output());
		assertThat(messages.size(), equalTo(1));
		assertThat(messages, receivesPayloadThat(is("foo")));
	}
}
```

## Working with RabbitMQ

### Starting Up Local RabbitMQ

> Start rabbitmq server with `rabbitmq-server`

### Accessing Local RabbitMQ

> Access local rabbitmq with http://localhost:15672 <br>
  Login guest:guest

### Shutting Down RabbitMQ

> Shutdown rabbitmq with `rabbitmqctl shutdown`
