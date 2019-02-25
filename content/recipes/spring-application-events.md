+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Spring Application Events"
date = 2018-10-14T11:13:09-05:00
+++

### Implement Event Publisher

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

### Implement Event Producer

```java
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EventPublisher eventPublisher;

    public void save(Product product) {

          productRepository.save(product);
          eventPublisher.publishEvent(ProductEvent.builder()
                  .type("product-created")
                  .subject(product.toString())
                  .date(new Date())
                  .build());
    }
}
```

### Implement Event Consumer

```java
@Component
public class ProductLogEventListener implements ApplicationListener<PayloadApplicationEvent<ProductEvent>> {

    @Autowired
    private LogService logService;

    @Override
    public void onApplicationEvent(PayloadApplicationEvent<ProductEvent> applicationEvent) {
        ProductEvent productEvent = applicationEvent.getPayload();
        Log log = new Log();
        log.setType(productEvent.getType());
        log.setDate(productEvent.getDate());
        logService.save(log);
    }

}
```
