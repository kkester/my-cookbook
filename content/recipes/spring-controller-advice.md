+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Building API Applications with Controller Advices"
date = 2019-01-10T18:24:29-05:00
+++

Use the steps in this recipe to take advantage of spring controller advices for API applications.

### Error Handling

The below `ControllerAdvice` will be invoked when any type of exception is thrown within the application.  The single responsibility(SRP) of
this advice is to the handle the errors and transform them into the appropriate restful API response.

```java
@RestControllerAdvice
public class ApplicationExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplicationExceptionHandler.class);

    @ExceptionHandler(value = {Exception.class})
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    public List<ErrorMessage> handleError(Exception exception) {

        LOGGER.error("Unexpected error occurred {}", exception);

        ErrorMessage error = new ErrorMessage();
        error.setCode("operation-failed");
        error.setMessage(exception.getMessage());
        return Collections.singletonList(error);
    }

    @ExceptionHandler(value = {ResourceNotFoundException.class})
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public List<ErrorMessage> handleResourceNotFoundError(ResourceNotFoundException exception) {

        LOGGER.info("Resource not found error occurred {}", exception.getMessage());

        ErrorMessage error = new ErrorMessage();
        error.setCode("resource-not-found");
        error.setMessage(exception.getMessage());
        return Collections.singletonList(error);
    }

}

```

### Supporting Common Headers

Below `ControllerAdvice` captures common headers(in this case headers provided from WebSeal) and populates them in a POJO that is then
registered as a model attribute.  Doing this results in the POJO becoming available as a parameter to any `RestController` method.

```java
@RestControllerAdvice
@Profile("cloud")
public class CloudClientIdentityResolver {

    @Autowired
    private IdentityService identityService;

    @ModelAttribute
    public ClientIdentity resolveFrom(@PathVariable(name="profileId",required = false) String profileId, HttpServletRequest request) {


        String clientId = request.getHeader("client-id");
        String resolveValidProfileId = identityService.resolveValidProfileId(profileId, request, false);
        return new ClientIdentity(resolveValidProfileId, clientId);
    }
}
```
