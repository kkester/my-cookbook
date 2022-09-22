+++
categories = ["recipes"]
tags = ["[foo]"]
summary = "Techniques for efficient UI to API integrations"
title = "React to REST API Integration Techniques"
date = 2019-02-08T16:07:36-06:00
+++

## Overview

### What

#### _Simplify API orchestration implementation in frontend applications_

With service oriented architectures, it is common for a single frontend application to have th need to consume APIs 
from several producer API applications.  This can introduce complexity for the frontend in terms of managing the 
various hosts for each API application across all environments.

### How

To simplify the configuration settings, the frontend should instead integrate with a single backend API application and
that application should manage the complexity of orchestrating the API requests to the various other API applications.
The following are two approaches for doing this:

1. Integrate frontend with SCG (Spring Cloud Gateway)
2. Bundle frontend with backend into one deployable (ie https://github.com/kkester/spring-react-gradle)

### What

#### _Single responsibility of frontend applications is to render views_

There are a number of common features implemented in frontend applications where similar logic must also be implemented 
in the backend API application.  A couple of common examples are features such as frontend form validation and user role
permissions. Rules such as which fields are required and which are view only must be implemented in the frontend as well 
as in the backend API.

Ideally this business logic should not be implemented in the frontend applications and all rules should
be written just once in the API. However, the frontend should maintain complete control of how things are rendered. 
Nothing in the backend response should indicate to the frontend how things should be rendered.

### How

In order to eliminate business logic from the frontend, all details about the business rules must be provided byt the API.
One way this can be done is by leveraging dynamic JSON schema. This can be provided to the frontend via its own API request 
or could be provided as part of the main resource response via a custom media type or by a standard type such as 
`application/json + schema`. The Jackson JSON utility has a nice extension that makes generating JSON schema very easy.
However, the extension did not become very popular and so it has not been maintained properly. Also, the other drawback
to JSON schema is that it van become very verbose. An example project showing an example of how this can be done can be 
found on [GitHub](https://github.com/kkester/sample-spring-react-drive).
