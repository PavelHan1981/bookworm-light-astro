---
title: "Software Token-Based Apple MFI Certification and Its Workflow"
slug: "2024-12-05-the-software-token-based-certification-on-apple-MFI-assessory"
description: "Based on the study of MFI certification documentation, this article outlines the two types of MFI certification (Hardware Security Chip / Software Token), the MFI certification process, and the technical details regarding token authentication and management for Software Token-based MFI accessories."
date: 2024-12-03T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["IoT"]
tags: ["MFI"]
draft: false
---


## Introduction to Apple's Software Token-Based MFI Certification


As is well known, Apple enforces strict quality standards, connection specifications, and security requirements for third-party accessories connecting to its devices. This ensures that MFI-certified accessories provide users with an exceptional experience and service. Consequently, all peripherals for Apple products must pass MFI certification before hitting the market.


Apple's MFI certification for accessories is primarily divided into two categories: hardware security chip-based authentication and software token-based authentication. Among them:

- Hardware security chip-based authentication is mainly applicable to peripherals that connect to Apple devices via physical interfaces (such as USB or Lightning interfaces), including charging adapters. The hardware security chips required for this type of certification are expensive, posing a significant cost burden for many accessory manufacturers. While the necessity of using security chips for certain products (like charging adapters) is debatable, it is the rule of the game established by Apple.
- Software token-based MFI certification is suitable for accessories connected wirelessly via Wi-Fi or BLE. According to Apple's *Introduction to Software Authentication* document, three categories of products are eligible for software token authentication: Apple Find My Network, AirPlay Audio, and HomeKit. Therefore, if an accessory falls into one of these three categories, manufacturers can avoid purchasing expensive MFI hardware security chips and instead adopt the software token-based authentication method.

The so-called software token is essentially a unique identifier string written into the firmware of the Apple accessory's hardware. This token is generated and centrally managed by Apple. During mass production, accessory manufacturers need to request tokens in batches from Apple and write them into the product firmware one by one on the production line, ensuring that each product has its own unique token. When users purchase and use these products, Apple devices can confirm the legitimacy of the products by verifying the token.


## MFI Product Certification Workflow: A Case Study of HomeKit


Taking HomeKit products as an example, the certification workflow for these software token-based MFI accessory hardware products is illustrated below:

- **Product Plan**: The product planning stage. Accessory manufacturers must submit the HomeKit accessory product plan to Apple and await review. Once approved, Apple assigns a PPID to the product, which is used for subsequent software token applications.
    - After the PPID application is complete, Apple provides 1000 software tokens for each product model for product development and testing.
- **Development**: The product development stage. Accessory developers must study the *HomeKit Accessory Protocol Specification* and *Works with Apple Home Identity Guidelines for HomeKit* documents, and use the HomeKit Accessory Development Kit (ADK) maintained by Apple for product development. These documents and development kits can be downloaded from the Apple MFI portal account. During development, testing tools such as the HomeKit Certification Assistant (HCA), HomeKit Accessory Tester (HAT), and HomeKit Certification Test Cases can be used for debugging. If the product requires a companion app, HomeKit App Test Cases can also be used for app testing.
    - The 1000 software tokens obtained during the PPID application must be used for development and testing in this stage.
- **Accessory Production-Ready Certification**: After product development and self-testing are completed, submit it to Apple for MFI certification. Relevant documents (HomeKit Product Compliance Questionnaire) and 5 test samples must be submitted according to the certification process. If issues are found during the certification process, repeated rectifications are required until the certification test is passed.
- **Packaging Certification**: Product packaging certification. Design the packaging according to the requirements of the *Works with Apple Home Identity Guidelines for HomeKit* and submit the design files for Apple's review.
- **(If applicable) App Certification**: If the product requires a companion app, app certification testing must be completed.
- **Mass Production**: The mass production stage. For HomeKit products based on software tokens, tokens requested from the Apple Server must be written into the product firmware via the production test program on the production line. The token for each product is unique and centrally managed by the Apple Server. When the accessory product subsequently connects to an Apple device during use, the legitimacy of the MFI certification can be confirmed by verifying the token.

At this stage, products manufactured during mass production can carry this badge:


![1733389026260.png](/images/blog/基于Software-Token的Apple-MFI认证及其工作流程-1.png)


## Software Token-Based MFI Certification Workflow


### 1. Requesting Tokens


According to the authentication and workflow designed by Apple for software token-based MFI products, the software tokens required to be written into these products must be requested in batches from Apple in advance. This application process requires accessory manufacturers to deploy a server that communicates with Apple's MFI Authentication Token Server. The two servers communicate via HTTPS-based RESTful APIs to perform operations such as batch application, downloading, registration, and destruction of software tokens.


Each batch token operation is initiated by a request from the server deployed by the accessory manufacturer (Apple also has certain security and mutual authentication requirements for the servers deployed by accessory manufacturers; relevant authentication certificates must be applied for from Apple and deployed on their own servers to communicate effectively with the Apple Server). The Apple Server returns a response. The applied tokens are saved in a CSV file included in the response message from the Apple Server. Accessory manufacturers should properly store these tokens and write them into the product firmware during subsequent product mass production.


Note: After an MFI accessory product passes Apple's review during the project initiation phase and obtains a PPID, the product can apply for 1,000 tokens during the development phase for product development and testing. After mass production begins, the default maximum number of tokens that can be applied for a single product model is 1 million. If this quantity is exceeded, a separate application for extra tokens can be submitted to Apple via the MFI Portal.


### 2. Burning Tokens into Product Firmware During Mass Production


Before mass production, the MFI certification of the product must be completed, and the list of tokens required for the current mass production batch must be requested from the Apple Server through the previous step.


During mass production, accessory manufacturers should have appropriate production testing tools in place to write a unique token into each product during manufacturing.


In addition to writing tokens into the firmware during the mass production stage as described above, Apple also provides an app-based MFI software token provisioning workflow for products that have already been mass-produced and shipped but do not yet have tokens written into them. Generally speaking, the accessory manufacturer needs to develop an iOS app feature for these products, using the iOS `performAccessorySetupUsingRequest` API within the app to initiate this so-called "In-Field Provisioning" process, achieving the complete workflow of writing and registering tokens to the Apple Server via the app.

- This app-based MFI software token provisioning workflow is only targeted at HomeKit and AirPlay Audio category products; it does not support Find My category products. Therefore, for Apple Find My category products, tokens must be written in advance during the mass production stage.

### 3. Token Registration


After writing the tokens into the firmware of the mass-produced peripheral products during the mass production process, the list of tokens used by this batch of mass-produced products must also be reported to the Apple Server according to the registration process defined by Apple. This reporting process is also implemented using HTTPS RESTful APIs between the server set up by the accessory manufacturer and the Apple Server.


Only token IDs that have already been registered in the Apple Server can be bound and activated with the user's Apple device during subsequent user operation.


### 4. Token Activation


Token activation occurs when a user purchases the accessory product and pairs and sets it up with their Apple device for the first time. When the user binds the accessory product through their Apple device, the user's Apple device will cooperate with the Apple Server to verify the legitimacy of the token contained within the device. After verification, it can be added to the user's list of accessory products for normal use.


It should be noted that each token can only be used once when activating and binding the device. If the user subsequently performs a factory reset on the accessory product, the user's Apple device will issue a new token to the accessory, and the accessory must save this new token for the next new accessory pairing and setup operation.


## Reference Documents

- Introduction to Software Authentication Release R3
- HomeKit Certification Process
- Software Token Authentication Server Specification Release R2.1