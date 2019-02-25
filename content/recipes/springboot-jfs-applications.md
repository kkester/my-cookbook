+++
categories = ["recipes"]
tags = ["[SPRING]"]
summary = "Recipe Summary"
title = "Springboot Jfs Applications"
date = 2018-10-10T19:48:02-05:00
+++

This recipe outlines the steps to follow that shows how JSF (Java Server Faces) can be integrated into a spring boot application.

## Include JSF Dependencies

```xml
<dependency>
  <groupId>org.apache.myfaces.core</groupId>
  <artifactId>myfaces-impl</artifactId>
  <version>2.2.12</version>
</dependency>
<dependency>
  <groupId>org.apache.myfaces.core</groupId>
  <artifactId>myfaces-api</artifactId>
  <version>2.2.12</version>
</dependency>
<dependency>
  <groupId>org.apache.tomcat.embed</groupId>
  <artifactId>tomcat-embed-jasper</artifactId>
</dependency>
<dependency>
  <groupId>org.ocpsoft.rewrite</groupId>
  <artifactId>rewrite-servlet</artifactId>
  <version>3.4.1.Final</version>
</dependency>
<dependency>
  <groupId>org.ocpsoft.rewrite</groupId>
  <artifactId>rewrite-integration-faces</artifactId>
  <version>3.4.1.Final</version>
</dependency>
<dependency>
  <groupId>org.ocpsoft.rewrite</groupId>
  <artifactId>rewrite-config-prettyfaces</artifactId>
  <version>3.4.1.Final</version>
</dependency>
<dependency>
  <groupId>org.primefaces</groupId>
  <artifactId>primefaces</artifactId>
  <version>6.1</version>
</dependency>
```

An optional dependency to consider including is `omnifaces`.  It provides a number of potentially useful utilities that make working with `JSFs` easier.
```xml
<dependency>
  <groupId>org.omnifaces</groupId>
  <artifactId>omnifaces</artifactId>
  <version>3.2</version>
</dependency>
```

## Modify Maven Build

Include an `outputDirectory` as part of the maven build process.

```xml
<build>
  <outputDirectory>src/main/webapp/WEB-INF/classes</outputDirectory>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

## Define `WebApp` Resources

### Web XML

  Define a `web.xml` file as shown below within the `/webapp/WEB-INF` directory.

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="3.1">
      <servlet>
          <servlet-name>Faces Servlet</servlet-name>
          <servlet-class>javax.faces.webapp.FacesServlet</servlet-class>
          <load-on-startup>1</load-on-startup>
      </servlet>
      <servlet-mapping>
          <servlet-name>Faces Servlet</servlet-name>
          <url-pattern>*.jsf</url-pattern>
      </servlet-mapping>
      <listener>
          <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
      </listener>
      <listener>
          <listener-class>org.springframework.web.context.request.RequestContextListener</listener-class>
      </listener>
  </web-app>
  ```

### Faces Configuration

  Create a `faces-config.xml` such as the one below within the `/webapp/WEB-INF` directory.

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <faces-config xmlns="http://xmlns.jcp.org/xml/ns/javaee"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
          http://xmlns.jcp.org/xml/ns/javaee/web-facesconfig_2_2.xsd"
                version="2.2">
      <application>
          <el-resolver>org.springframework.web.jsf.el.SpringBeanFacesELResolver</el-resolver>
      </application>
  </faces-config>
  ```

### Define Layout

  Create a `layout.xhtml` such as the one below within the `/webapp` directory.

  ```html
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml"
        xmlns:h="http://xmlns.jcp.org/jsf/html"
        xmlns:ui="http://xmlns.jcp.org/jsf/facelets"
        xmlns:f="http://xmlns.jcp.org/jsf/core"
        xmlns:p="http://primefaces.org/ui">
  <f:view>
      <h:head>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Product</title>
      </h:head>
      <h:body>
          <div class="ui-g">
              <div class="ui-g-12">
                  <p:toolbar>
                      <f:facet name="left">
                          <p:button href="/" value="List of Products" />
                          <p:button href="/product" value="New Product" />
                      </f:facet>
                  </p:toolbar>
              </div>
              <div class="ui-g-12">
                  <ui:insert name="content" />
              </div>
          </div>
      </h:body>
  </f:view>
  </html>
  ```

## Setup Configurations

Two beans need to be declared as shown below.  The first is the `ServletRegistrationBean` that establishes the `FacesServlet`.  The second is the `FilterRegistrationBean`.

```java
@Bean
public ServletRegistrationBean servletRegistrationBean() {
  FacesServlet servlet = new FacesServlet();
  return new ServletRegistrationBean(servlet, "*.jsf");
}

@Bean
public FilterRegistrationBean rewriteFilter() {
  FilterRegistrationBean rwFilter = new FilterRegistrationBean(new RewriteFilter());
  rwFilter.setDispatcherTypes(EnumSet.of(DispatcherType.FORWARD, DispatcherType.REQUEST,
      DispatcherType.ASYNC, DispatcherType.ERROR));
  rwFilter.addUrlPatterns("/*");
  return rwFilter;
}
```

## Implementation Example

### Start with a Simple POJO

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    private Integer id;

    private String name;

    private BigDecimal price;

}
```

### Define the ELBean Components

```java
@Scope(value = "session")
@Component(value = "productList")
@ELBeanName(value = "productList")
@Join(path = "/", to = "/product-list.jsf")
public class ProductListController {

    @Autowired
    private ProductRepository productRepository;

    private Collection<Product> products;

    @Deferred
    @RequestAction
    @IgnorePostback
    public void loadData() {
        products = productMapper.findAllProducts();
    }

    public Collection<Product> getProducts() {
        return products;
    }

}
```

```java
@Scope(value = "session")
@Component(value = "productController")
@ELBeanName(value = "productController")
@Join(path = "/product", to = "/product-form.jsf")
public class ProductController {

    @Autowired
    private ProductMapper productMapper;

    private Product product = new Product();

    public String save() {
        if (product.getId() == null) {
            productMapper.save(product);
        } else {
            productMapper.update(product);
        }
        product = new Product();
        return "/product-list.xhtml?faces-redirect=true";
    }

    public Product getProduct() {
        return product;
    }

    public String edit(String productId) {
        product = productMapper.findProduct(productId);
        return "/product-form.xhtml?faces-redirect=true";
    }

    public String delete(String productId) {
        productMapper.delete(productId);
        product = new Product();
        return "/product-list.xhtml?faces-redirect=true";
    }
}
```

### Implement the Product List Page

With the `ELBeans` declared, they can now be referenced as shown below by using `productList` and `productController` respectfully.

```xhtml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:ui="http://xmlns.jcp.org/jsf/facelets"
      xmlns:h="http://xmlns.jcp.org/jsf/html"
      xmlns:f="http://xmlns.jcp.org/jsf/core"
      xmlns:p="http://primefaces.org/ui">
<ui:composition template="layout.xhtml">
    <ui:define name="content">
        <h:form id="form">
            <p:panel header="Products List">
                <p:dataTable id="table" var="product" value="#{productList.products}">
                    <p:column>
                        <f:facet name="header"># Id</f:facet>
                        <h:outputText value="#{product.id}" />
                    </p:column>

                    <p:column>
                        <f:facet name="header">Name</f:facet>
                        <h:outputText value="#{product.name}" />
                    </p:column>

                    <p:column>
                        <f:facet name="header">Price</f:facet>
                        <h:outputText value="#{product.price}">
                            <f:convertNumber type="currency" currencySymbol="$ " />
                        </h:outputText>
                    </p:column>

                    <p:column>
                        <f:facet name="header">Actions</f:facet>
                        <p:commandButton id="edit" value="Edit" href="/product" action="#{productController.edit(product.id)}" />
                        <p:commandButton id="delete" value="Delete" action="#{productController.delete(product.id)}" />
                    </p:column>

                </p:dataTable>
            </p:panel>
        </h:form>
    </ui:define>
</ui:composition>
</html>
```

## Testing

Often times it is necessary to establish a `FacesContext` in order to be able to successfully execute Unit Tests.  The following examples shows how the context can be setup (via omnifaces) for Unit Testing.

```java
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.omnifaces.util.Faces;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import javax.faces.context.Flash;
import javax.servlet.http.HttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ProductApplicationTest {

  @Mock
  private FacesContext facesContextMock;

  @Mock
  private ExternalContext externalContextMock;

  @Mock
  private Flash flashMock;

  @Mock
  private HttpServletRequest requestMock;

  @Before
  public void setup() {
    Faces.setContext(facesContextMock);

    when(facesContextMock.getExternalContext()).thenReturn(externalContextMock);
    when(externalContextMock.getFlash()).thenReturn(flashMock);
    when(externalContextMock.getRequest()).thenReturn(requestMock);
  }

  @Test
  public void testGetCurrentFacesContextInstance() {
    assertThat(FacesContext.getCurrentInstance()).isNotNull();
  }

}
```
