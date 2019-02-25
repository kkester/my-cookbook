+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Recipe Summary"
title = "Spring Jpa"
date = 2018-10-19T09:35:11-05:00
+++

### Include Necessary Dependencies in Project

```xml
<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
		<groupId>org.postgresql</groupId>
		<artifactId>postgresql</artifactId>
		<version>42.2.2</version>
</dependency>
```

### Basic Example Entity Implementation

#### Define the Entity
```java
@Entity
@Table(name="USER")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String name;

    private String email;

    private String city;

    private String state;

}
```

#### Define Repository

```java
@Repository
public interface UserRepository extends CrudRepository<UserEntity, Long> {

}
```

### Define Basic Queries

```java
public interface UserRepository extends CrudRepository<UserEntity, Long> {
    List<UserEntity> findByStateEqualsOrCity(@Param("state") String state, @Param("city") String city);
}
```

Results when executing:
```java
userRepository.findByStateEqualsOrCity("MN", null);
```

id | name | city | state
------------- | ------------- | ------------- | -------------
1 | bob | EP | MN
2 | dan | null | null

### Implement Custom Queries

#### Option 1

```java
public interface UserRepository extends CrudRepository<UserEntity, Long> {

    List<UserEntity> findUsersByState(@Param("state") String state);

}
```

```java
@NamedNativeQuery(name = "User.findUsersByState",
        query = "select u.* \n" +
                "from user u \n" +
                "where lower(state) = :state",
        resultClass = UserEntity.class
)

@Entity
@Table(name="USER")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String name;

    private String email;

    private String city;

    private String state;

}
```

#### Option 2

```java
List<String> names = entityManager.createNativeQuery("select name from user").getResultList();
```

Results when executing:

id | name | city | state
------------- | ------------- | ------------- | -------------
1 | bob | EP | MN
2 | dan | null | null

#### Option 3 - Custom Queries for Non-Entity Data

Note: This option has issues and may not work when dealing with nullable columns

```java
@Entity
@IdClass(UserSummaryKey.class)
public class UserSummaryEntity {

    @Id
    private String name;

    @Id
    private String city;

    @Id
    private String state;

}

public class UserSummaryKey implements Serializable {

    private String name;
    private String city;
    private String state;

}
```

```java
List<UserSummaryEntity> results = this.entityManager.createNativeQuery("select name, city, state from user", UserSummaryEntity.class).getResultList();
```

Results when executing:

name | city | state
------------- | ------------- | -------------
bob | EP | MN
null | |
null | |
don | Waco | TX

#### Option 4

```java
List<Object[]> results = this.entityManager.createNativeQuery("select name, city, state from user").getResultList();
```

Results when executing:

name | city | state
------------- | ------------- | -------------
bob | EP | MN
dan | null | null
bill | null | null
don | Waco | TX

## Testing Strategies

### Option 1: Mocking Repositories

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class ProductDaoTest {

    @Autowired
    private ProductDao subject;

    @MockBean
    private  ProductRepository productRepository;

    @Mock
    private Product product;

    @Test
    public void testGetProductParametersByName() {

        // given
        String productName = "MTM50";
        when(productRepository.findById(productName)).thenReturn(Optional.of(product));

        // when
        Product product = subject.getProductParametersByName(productName);

        // then
        assertThat(product).isNotNull();
    }
}
```

### Option 2: Injecting H2 In-memory Database

1.  Include Dependency

	```xml
	<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>test</scope>
	</dependency>
	```
1. Define Configuration Properties

	Setting the ddl-auto property to update will allow spring jpa to generate the in-memory database tables upon test startup.
	```yml
	spring:
	  jpa:
	    hibernate:
	      ddl-auto: update
	    properties:
	      hibernate:
	        temp:
	          use_jdbc_metadata_defaults: false
	    database-platform: org.hibernate.dialect.H2Dialect
	  datasource:
	    url: jdbc:h2:mem:footprint;MODE=PostgreSQL
	    username: sa
	    password:
	    driver-class-name: org.h2.Driver
	    generate-unique-name: true
	```
1. Define Data SQL to Initialize Tables

	Creating a `data.sql` file within the test resource directory will allow H2 to insert the data into the in-memory database tables upon test startup.
	```sql
	INSERT INTO public.products(
	        product_name, bleed_edge, bleed_edge_template, chipping_buffer,
	        control_point_tolerance, coord_system, gridline_separate, neatline_separate,
	        ocr_chipping_buffer, ocr_masking_buffer, scale, tiff_resolution)
	VALUES ('MTM50', 'No', null, '425', 10, 'Transverse_Mercator', '58600,Black', '58600,Black', '600,300', '600,300', 50000, 1016);

	INSERT INTO public.neatline_methods(id, bleed_edge, corners, method_name, sequence, template, product_name) VALUES
	(1, 'No', 'UL,UR,LL,LR', 'Hough', 0, null, 'MTM50'),
	(2, 'No', 'UL,UR,LL,LR', 'Template', 1, 'templates/corner2.tif', 'MTM50');

	INSERT INTO public.control_points(id, location, spacing, template, product_name) VALUES
	(3, 'I', '5', 'templates/tick_1016.tif', 'MTM50'),
	(4, 'E', '5', 'templates/neatlineEdge.tif', 'MTM50');

	INSERT INTO public.hough_parameters(
	        lower_left_region, lower_right_region, upper_left_region,
	        upper_right_region, product_name)
	VALUES ('4, 75, 11, 5', '80, 75, 17, 5', '4, 2, 11, 7', '80, 2, 17, 7', 'MTM50');
	```
1. Implement Test

	```java
	@RunWith(SpringRunner.class)
	@SpringBootTest
	public class ProductDaoTest {

	    @Autowired
	    private ProductDao subject;

	    @Test
	    public void testGetProductParametersByName() {

	        // given
	        String productName = "MTM50";

	        // when
	        Product product = subject.getProductParametersByName(productName);

	        // then
	        assertThat(product).isNotNull();
	        assertThat(product.getMethods()).hasSize(2);
	        assertThat(product.getControlPoints()).hasSize(2);
	        assertThat(product.getHoughParameters()).isNotNull();
	    }

	    @Test
	    public void testGetProductParametersUsingInvalidName() {

	        // given
	        String productName = "XXX";

	        // when
	        Product product = subject.getProductParametersByName(productName);

	        // then
	        assertThat(product).isNull();
	    }
	}
	```

## Enabling Auto Configuration

Enabling auto configuration for the project is optional and is only needed to make the project a library that can be reused by other spring boot applications.

1. Include Dependencies

	```xml
	<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-autoconfigure</artifactId>
			<version>1.4.0.RELEASE</version>
	</dependency>
	```
1. Define `spring.factories` META-INF File

	```yml
	org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
	com.hexusfed.productconfigparameters.ProductParametersConfig
	```
1. Create Configuration Class

	```java
	@Configuration
	@ComponentScan
	@EntityScan("com.hexusfed.productconfigparameters")
	@EnableJpaRepositories
	public class ProductParametersConfig {
	}
	```
