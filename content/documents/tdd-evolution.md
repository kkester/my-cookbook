+++
categories = ["recipes"]
tags = ["[TEST-DRIVEN-DEVELOPMENT]"]
summary = "Recipe Summary"
title = "TDD Evolution"
date = 2018-09-26T16:32:55-05:00
+++

The intent of this recipe is to outline the various types of testing so as to help with defining the test pyramid most appropriate for any given system of applications.  This recipe attempts to do this by outlining the various types of testing available and show how testing strategies have evolved.

## Types of Application Testing

The table below shows a list of names of various types of testing that are commonly used to validate applications and/or groups of applications.  Many of these names however refer to the same type of testing which has lead to great amount of confusion.  The one common attribute to these types is that they refer to testing a defined scope of the overall system.

Type  | Description | Frameworks
------------- | ------------- | -------------
Manual  |  | None
Exploratory | manually exploring the system in ways that haven't been considered as part of the scripted tests. | None
Acceptance | | Varies
End-to-End | |
UI | | - Selenium <br> - Protractor
Functional | | - Soap UI <br> - Cucumber
Smoke | A non-exhaustive set of tests that aim at ensuring that the most important functions work. | Varies
Chaos | A process of testing a distributed computing system to ensure that the system can withstand unexpected disruptions in function by deliberately disabling random components within that system. | [Chaos Monkey](https://github.com/Netflix/chaosmonkey)
Integration | Integration Tests verify the integration of your application with all the parts that live outside of your application. | - Spring Boot Test <br> - REST Assured <br> - Cucumber
Service | |
Contract | Ensure that the implementations on the consumer and provider side conform to the defined contract. They serve as a good regression test suite and make sure that deviations from the contract will be noticed early. | Spring Contracts / WireMock
Slice | Test slicing is about segmenting the Spring Application Context that is created for the scope of the test. | - Spring Boot Test <br> - WireMock <br> - REST Assured
Component | Test that limits the scope of the exercised software to a portion of the system under test to exercise as much of the system as is reasonable. | - Spring Boot Test <br> - WireMock <br> - REST Assured
Unit | Ensure that a certain unit (typically a class under test) of your codebase works as intended | - Spring Boot Test <br> - Mockito / PowerMock <br> - Spock

## Traditional Testing Approach

Traditional testing techniques or for systems where automated testing was attempted to retrofitted typically resulted in a testing pyramid emerging represented by the image below.  This is commonly referred to as the inverted test pyramid.  The goal of agile methodologies is to flip the pyramid right side up.

![Traditional Test Pyramid](/images/Traditional.png)

## Agile Testing Approach

[Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)

![Practical Test Pyramid](/images/Practical.png)

## Microservice Testing Approach

As described by [Fowler](https://martinfowler.com/articles/microservice-testing/)

![Agile Test Pyramid](/images/Agile.png)

## AppTX Testing Approach
![AppTX Test Pyramid](/images/Pivotal.png)

## Conclusion

With the emergence of microservice architectures, test pyramid structures have become increasingly diverse.  There tends to be no single pyramid definition that is the standard or that works for all microservice systems.  Rather, each system could need a specific pyramid depending on the overall architecture.
