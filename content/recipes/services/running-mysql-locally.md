+++
categories = ["recipes"]
tags = ["[SERVICES]"]
summary = "Recipe Summary"
title = "Running Mysql Locally"
date = 2018-09-28T09:35:15-05:00
+++

## Starting Up MySQL Locally


## Connecting to MySQL

Launch the `Sequel Pro` Application 

```
spring.jpa.hibernate.ddl-auto=none
spring.datasource.url=jdbc:mysql://localhost:3306/db_example?verifyServerCertificate=false&useSSL=false&requireSSL=false
spring.datasource.username=root
spring.datasource.password=yourpassword
```

## Creating a Stored Procedure

```sql
DELIMITER //
CREATE PROCEDURE CREATE_USER(
   IN p_name VARCHAR(100),
   IN p_email VARCHAR(100),
   OUT p_total INT
)
  BEGIN
   DECLARE v_count INT;
   SELECT count(*) INTO v_count FROM user;

   INSERT INTO USER SET id = v_count+1, name = p_name, email = p_email;

   SELECT count(*) INTO p_total FROM user;

  END //
DELIMITER ;
```

## Shutting Down Local MySQL
