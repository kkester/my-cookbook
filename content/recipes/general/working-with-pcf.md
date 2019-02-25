+++
categories = ["recipes"]
tags = ["[SERVICES]"]
summary = "Recipe Summary"
title = "Working With Pcf"
date = 2018-09-28T09:36:23-05:00
+++

## Working with PCFOne

1. Execute `cf login --sso -a api.run.pcfone.io`
1. Point your web browser to [https://login.run.pcfone.io/passcode](https://login.run.pcfone.io/passcode)
1. enter the Temporary Authentication Code

## Working with Local PCF Dev

1. cf dev start
1. cf login -a https://api.local.pcfdev.io --skip-ssl-validation
    ![pcf dev start](/images/pcf-dev-start.png)
1. cf logout
1. cf dev stop
