+++
categories = ["recipes"]
tags = ["[REST]"]
summary = "Recipe Summary"
title = "Custom Resource Serialization"
date = 2018-09-28T07:51:43-05:00
+++


```java
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonDeserialize(using = CustomerDeserializer.class)
@JsonSerialize(using = CustomerSerializer.class)
public class Customer {

  /** Unique identifier of the Customer */
  private String id;
  /** The full name of the Customer */
  private String name;
  /** The email address of the Customer */
  private String email;
  /** The Customer's address information */
  private Address address;
  /** Custom Customer Data */
  private Map<String, Object> extendedAttributes;

}
```

```java
@Component
public class CustomerDeserializer extends JsonDeserializer {

    private ObjectMapper objectMapper;

    public CustomerDeserializer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public Object deserialize(JsonParser jsonParser, DeserializationContext ctxt) throws IOException {

        ObjectCodec objectCodec = jsonParser.getCodec();
        JsonNode jsonNode = objectCodec.readTree(jsonParser);

        HashMap<String, Object> extendedAttributes = new HashMap<>();
        Customer.CustomerBuilder builder = Customer.builder()
                .extendedAttributes(extendedAttributes);
        jsonNode.fields().forEachRemaining(e -> {
            if ("id".equals(e.getKey())) {
                builder.id(e.getValue().textValue());
            } else if ("name".equals(e.getKey())) {
                builder.name(e.getValue().textValue());
            } else if ("email".equals(e.getKey())) {
                builder.email(e.getValue().textValue());
            } else if (!e.getValue().isContainerNode()) {
                extendedAttributes.put(e.getKey(), e.getValue().textValue());
            }
        });
        builder.address(this.deserializeAddress(jsonNode.get("address")));

        return builder.build();
    }

    private Address deserializeAddress(JsonNode jsonNode) throws JsonProcessingException {
        return (jsonNode == null ? null : objectMapper.treeToValue(jsonNode, Address.class));
    }

}
```

```java
@Component
public class CustomerSerializer extends JsonSerializer {

    private ObjectMapper objectMapper;

    public CustomerSerializer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void serialize(Object value, JsonGenerator jsonGenerator, SerializerProvider serializers) throws IOException {
        Customer customer = (Customer)value;
        jsonGenerator.writeStartObject();
        jsonGenerator.writeStringField("id", customer.getId());
        jsonGenerator.writeStringField("name", customer.getName());
        jsonGenerator.writeStringField("email", customer.getEmail());
        jsonGenerator.writeObjectField("address", customer.getAddress());
        for (Map.Entry<String,Object> entry: customer.getExtendedAttributes().entrySet()) {
            jsonGenerator.writeStringField(entry.getKey(), String.valueOf(entry.getValue()));
        }
        jsonGenerator.writeEndObject();
    }
}
```
