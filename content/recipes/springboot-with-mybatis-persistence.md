+++
categories = ["recipes"]
tags = ["[SPRING]"]
summary = "Recipe Summary"
title = "Springboot with MyBatis Persistence"
date = 2018-10-10T19:48:19-05:00
+++

This recipe outlines the steps needed to be followed in order to leverage `MyBatis` as part of the Persistence layer for a spring boot application.

## Include MyBatis Dependencies

In addition to any dependencies needed to connect to an external database, the following dependency is needed in order to leverage MyBatis.

```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>1.3.2</version>
</dependency>
```

## Define Mapper

The `Mapper` below is an example of how to define basic CRUD operations.
The `SELECT` statements exclude annotations to allow the definitions in the Mapper XML to be leveraged.
The `INSERT` statement shows how to leverage the database in order to inject the `id` for an entity.

```java
@Mapper
public interface ProductMapper {

    List<Product> findAllProducts();

    Product findProduct(String productId);

    @Insert("INSERT into product(prd_name,prd_price) values(#{name},#{price})")
    @SelectKey(statement = "SELECT LAST_INSERT_ID()", keyProperty = "id", keyColumn = "prd_id",
            before = false, resultType = Integer.class)
    void save(Product product);

    @Update("UPDATE product SET prd_name=#{name}, prd_price=#{price} WHERE prd_id =#{id}")
    void update(Product product);

    @Delete("DELETE from product where prd_id=#{productId}")
    void delete(String productId);
}
```

## Define Mapper XML

Mapper XML must be defined in the `resources` folder with a file name matching the Interface and within a folder structure matching the Interface package name.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!-- Mapper.java namespace -->
<mapper namespace="com.pivotal.jsf.product.ProductMapper">
    <!-- Product.java namespace -->
    <resultMap type="com.pivotal.jsf.product.Product" id="Product">
        <!-- map table "product" column to class "Product" property -->
        <id property="id" column="prd_id" />
        <result property="name" column="PRD_NAME"/>
        <result property="price" column="PRD_PRICE"/>
    </resultMap>

    <select id="findAllProducts" resultMap="Product">
        SELECT * FROM product
    </select>

    <select id="findProduct" parameterType="string" resultMap="Product">
        SELECT * FROM product WHERE prd_id =#{productId}
    </select>

</mapper>
```

## Leverage `Mapper` Interface

Mapper interface may be `@Autowired` into spring beans as needed.

```java
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    ...

}
```

## Connecting to Multiple Databases

### Configure Database Settings

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: none
  datasource:
      driver-class-name: com.mysql.jdbc.Driver

db-example-1:
  driver-class-name: ${spring.datasource.driver-class-name}
  url: "jdbc:mysql://localhost:3306/db_example?verifyServerCertificate=false&useSSL=false&requireSSL=false"
  jdbcUrl: "jdbc:mysql://localhost:3306/db_example?verifyServerCertificate=false&useSSL=false&requireSSL=false"
  username: "root"
  password: "****"

db-example-2:
  driver-class-name: ${spring.datasource.driver-class-name}
  url: "jdbc:mysql://localhost:3306/db_example2?verifyServerCertificate=false&useSSL=false&requireSSL=false"
  jdbcUrl: "jdbc:mysql://localhost:3306/db_example2?verifyServerCertificate=false&useSSL=false&requireSSL=false"
  username: "root"
  password: "****"
```

### Configuration for First Data Source

The initial data source should be declared as `Primary` as shown below.  This will allow spring to inject the beans for this source by default.

``` java
@Configuration
public class MySqlDb1Config {

    @Bean(name = "db1DataSource")
    @Primary
    @ConfigurationProperties(prefix = "db-example-1")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "db1DataFactory")
    @Primary
    public SqlSessionFactoryBean sqlSessionFactory(@Qualifier(value = "db1DataSource") final DataSource oneDataSource) throws Exception {
        final SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(oneDataSource);
        SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBean.getObject();
        sqlSessionFactory.getConfiguration().addMapper(ProductMapper.class);
        // Various other SqlSessionFactory settings
        return sqlSessionFactoryBean;
    }

    @Bean
    @Primary
    public MapperFactoryBean<ProductMapper> productMapper(@Qualifier(value = "db1DataFactory") final SqlSessionFactoryBean sqlSessionFactoryBean) throws Exception {
        MapperFactoryBean<ProductMapper> factoryBean = new MapperFactoryBean<>(ProductMapper.class);
        factoryBean.setSqlSessionFactory(sqlSessionFactoryBean.getObject());
        return factoryBean;
    }
}
```

### Configuration for Additional Data Source

The second data source needs to provide a uniquely named set of beans.

``` java
@Configuration
public class MySqlDb2Config {

    @Bean(name = "db2DataSource")
    @ConfigurationProperties(prefix = "db-example-2")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "db2DataFactory")
    public SqlSessionFactoryBean sqlSessionFactory(@Qualifier(value = "db2DataSource") final DataSource oneDataSource) throws Exception {
        final SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(oneDataSource);
        SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBean.getObject();
        sqlSessionFactory.getConfiguration().addMapper(LogMapper.class);
        // Various other SqlSessionFactory settings
        return sqlSessionFactoryBean;
    }

    @Bean
    public MapperFactoryBean<LogMapper> logMapper(@Qualifier(value = "db2DataFactory") final SqlSessionFactoryBean sqlSessionFactoryBean) throws Exception {
        MapperFactoryBean<LogMapper> factoryBean = new MapperFactoryBean<>(LogMapper.class);
        factoryBean.setSqlSessionFactory(sqlSessionFactoryBean.getObject());
        return factoryBean;
    }
}
```

Important to note.  In order to successfully inject `Mappers` from additional resources, the name of the method that declares the `MapperFactoryBean` bean must match the name of the field in the Class being wired.

For example, the config above uses the method name `logMapper` which then matches the field name as shown in the Controller below.

```java
@RestController
@RequestMapping("/logs")
public class LogController {

    @Autowired
    private LogMapper logMapper;

    @GetMapping
    public Collection<Log> getLogs() {
        return logMapper.findAllLogs();
    }
}
```
