+++
categories = ["recipes"]
tags = ["[SERVICES]"]
summary = "Recipe Summary"
title = "Running Redis Locally"
date = 2018-09-28T12:41:40-05:00
+++

## Download and Install `Jedis` Redis

More instructions can be found [here](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298), but installing `Jedis` is easiestly done using `homebrew` as shown below.

```
brew install redis
```

## Launching Local Redis Service

```
redis-server /usr/local/etc/redis.conf
```

## Download and Install `RedisClient`

1. Download the JAR from [RedisClient OSX Github](https://github.com/caoxinyu/RedisClient/tree/OSX)
1. Launch `RedisClient`

    ```
    java -XstartOnFirstThread -jar redisclient-OSX.jar
    ```
