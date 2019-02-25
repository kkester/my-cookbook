+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Logging Solutions Leveraging AOP"
date = 2019-01-10T18:24:29-05:00
+++

Use the steps in this recipe to leverage AOP as part of an overall logging strategy for API applications.

### Dependencies

The following dependency is needed in order to leverage AOP functionality.

```XML
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

### Logging Implementation

The Aspect below defines a `PointCut` around all `RestController` methods so that the `logAround` method will be invoked instead of the
method defined in the `RestController`.  The method eventually calls the `proceed` method on the `JoinPoint` which will then invoke the
actual method on the RestController.  The end result of this aspect is to provide info logging to occur whenever a RestController receives
and HTTP Request.

```java
@Aspect
@Component
public class LoggingControllerRequestAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingControllerRequestAspect.class);

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controller() {
        // noop needed to define pointcut
    }

    @Pointcut("execution(* *.*(..))")
    protected void allMethod() {
        // noop needed to define pointcut
    }

    @Around("controller() && allMethod()")
    @SuppressWarnings("squid:S00112")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {

        log.info("Beginning processing of {}", joinPoint.getSignature());

        Object results = joinPoint.proceed();

        log.info("Completed processing of {}", joinPoint.getSignature());

        return results;
    }

}
```

### Conclusion

AOP and can certainly be used for a great many things other than just logging, but the logic described above can certainly be useful as means of simply implementing a logging once and have it be applied to all Rest Controllers eliminating the need to manually code info logging steps in each individual method.  
