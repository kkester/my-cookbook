+++
categories = ["recipes"]
tags = ["foo"]
summary = "Recipe Summary"
title = "Working With Concourse"
date = 2019-04-02T07:09:53-05:00
+++

### Launch Concourse

```
docker-compose up -d
```

Concourse URL: [http://127.0.0.1:8080/](http://127.0.0.1:8080/)

### Concourse CLI Login

```
fly -t {target} login
```

### Create a Pipeline

1. Define Pipeline <br>
  ```
  fly -t tutorial sp -c pipeline.yml -p {pipeline-name} -l {properties-file}
  ```
1. Unpause pipeline <br>
  ```
  fly -t tutorial up -p {pipeline-name}
  ```

### Shutdown Concourse

```
docker-compose down
```
