---
title: "Interpretation of the MFI Software Token Authentication Server Specification"
slug: "2024-12-05-the-suammray-of-MFI-software-token-authentication-server-specification"
description: "This article provides an in-depth interpretation of Apple's 'Software Token Authentication Server Specification,' offering a comprehensive overview of the deployment requirements for accessory manufacturers' servers in Apple MFi certification, as well as the interaction workflow between accessory servers and Apple servers."
date: 2024-12-05T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["IoT"]
tags: ["MFi"]
draft: false
---


This article is a learning summary of the Apple MFi certification document, "Software Token Authentication Server Specification." By thoroughly understanding this document, one can clearly grasp how all Apple peripheral products utilizing software tokens apply for and manage tokens during the MFi certification and production generation processes, as well as how to complete token writing and registration on the production line.


## Overview of Software Token-Based MFi Certification Requirements


For Apple MFi-certified peripheral products, the following three categories of products are permitted to use software tokens (instead of MFi hardware encryption chips) for verification and authentication during use:

- HomeKit
- AirPlay 2 audio
- Find My network

Naturally, while this saves the hardware cost of an MFi encryption chip, accessory manufacturers must invest extra effort into figuring out how to apply to Apple for these tokens—which need to be embedded in the accessory firmware—and how to properly manage them.


For the manufacturing of such software token-based accessories, Apple's specification outlines the following requirements:

- Before developing and manufacturing a product model, an application must first be submitted to Apple. Once approved, Apple will issue a PPID (Product Plan ID) for this product model. With the PPID, the accessory manufacturer can apply to Apple for tokens.
- Accessory manufacturers must deploy a dedicated server to communicate with Apple Servers, using pre-defined HTTPS RESTful APIs to batch-apply for tokens from Apple Servers. Manufacturers must be capable of managing these applied tokens and writing them into the product firmware via production test software during mass production. Since the tokens for each mass-produced unit are unique, manufacturers must manage them properly; upon completion of production, they must also report the list of tokens written on the production line back to Apple Servers.
- Furthermore, for any unused tokens remaining from production, manufacturers must also batch-report these unused token lists to Apple Servers for revocation.

Therefore, for the production and development of such products, accessory manufacturers must first deploy a server capable of communicating with Apple Servers according to the HTTPS RESTful APIs defined by Apple.


## Application for Server Mutual Authentication Certificates


First and foremost, before communication is established, the accessory manufacturer's server must perform mutual authentication (two-way TLS authentication) with the Apple Server. True business communication can only commence after mutual authentication succeeds. To complete mutual authentication, the manufacturer must apply to Apple for a mutually authenticated certificate signed by Apple prior to server-to-server communication, and deploy it on their own server.


The application process for the manufacturer's server mutual authentication certificate is as follows:

- First, the accessory manufacturer needs to use the `keytool` utility to generate a Certificate Signing Request (CSR) file. This request file should include the manufacturer's company name string and MFi account number (which should be a 6-digit number).
- Log in to the MFi Portal account, navigate to the Resources page under Software Authentication Certificate Request, and click the "+New Request" button to submit the CSR certificate to Apple for review. Once approved, the Apple Server will return a signed certificate. At this point, the manufacturer should deploy this certificate on the server that communicates with the Apple Server to facilitate subsequent mutual authentication communication between the two servers.
    - Note: The validity period of this Apple-signed certificate is two years. Manufacturers should renew the certificate in the MFi Portal before it expires. The renewal process is identical to applying for a new signature certificate, and the renewed certificate must be deployed to the server immediately upon receipt.
- Once the Apple-signed certificate is successfully deployed on the manufacturer's server, you can attempt to send requests and communicate with the Apple Server using Apple's pre-defined HTTPS RESTful APIs.

## Summary of the Interaction Workflow Between the Accessory Manufacturer's Server and Apple Server


For the three categories of MFi peripherals supporting software token-based MFi certification mentioned above, the Apple Server URLs used to apply for software tokens vary depending on the product type:

- HomeKit: [https://sauth-external.apple.com](https://sauth-external.apple.com/)
- AirPlay 2 Audio: [https://swa.apple.com](https://swa.apple.com/)
- Find My network: [https://swa.apple.com](https://swa.apple.com/)

Therefore, accessory manufacturers must select the appropriate URL corresponding to their developed and manufactured MFi accessory type to communicate and apply for tokens.


Communication between the accessory manufacturer's server and the Apple Server follows standard HTTPS-based RESTful API access patterns. Every communication is initiated by a request from the manufacturer's server, to which the Apple Server returns a response. Each request corresponds to an operation, and the operations required for communication primarily include the following:

- Batch application for tokens
- Retrieving the list of CSV filenames containing tokens
- Downloading CSV files based on the retrieved CSV file list
- Registering the list of tokens used by mass-produced products with the Apple Server
- Batch revoking the list of unused tokens

### 1. Batch Application for Tokens


Once the accessory manufacturer's project application for the development and production of this accessory model is approved by Apple, Apple will provide a Product Plan ID (PPID) for this accessory model, along with a default allocation of software tokens (1,000 for the development phase, and 1 million for the mass production phase). At this point, the manufacturer can batch-apply to the Apple Server for tokens to be used in development or mass production.


The RESTful API for batch token application is: `api/v1.0/external/authEntityRequests`. The request message must also pass the product's PPID and the desired quantity of tokens in JSON format.


After acknowledging the request message, the Apple Server returns a Request ID in its response message (this Request ID will subsequently be used to download the tokens), along with a timestamp string indicating when this batch of token lists becomes downloadable. The manufacturer must wait until after this time to make a further request to the Apple Server to download the token list.


### 2. Retrieving the CSV Filename List and Downloading


The token list applied for from the Apple Server is stored by the Apple Server in a CSV file, where each line corresponds to a single token.

- Format of each token contained in a line of the CSV file: `<PPID>,<TOKENID>,<Base64-encoded Token>,<CRC32 in HEX>,<CRLF>`

Each CSV file can store a maximum of 2,000 tokens. Therefore, if a large number of tokens is requested at once, the Apple Server will generate multiple CSV files for that request.


Consequently, the token list download step actually involves two APIs: retrieving the list of CSV filenames and downloading the specified CSV file.


First, obtain the filename list of the CSV files storing this batch of tokens using the following API: `api/v1.0/external/authEntities/{request_id}`. Here, the Request ID returned by the Apple Server during the batch token application process must be used as a parameter to initiate the request to the Apple Server.


In response to the CSV filename list request, the Apple Server will return the number of CSV files and a list of CSV filenames in JSON format.


Next, the manufacturer's server needs to download the CSV files from the Apple Server using the following API: `api/v1.0/external/authEntities/{request_id}/{file_name}`. Here, `request_id` is the Request ID returned by the Apple Server in the batch token application step, and `file_name` is the filename contained in the CSV filename list retrieved in the previous step. Therefore, however many CSV files the Apple Server generated for this token application, the file download API must be called that many times to download the files one by one.


At this point, the process of applying for tokens and downloading them from the Apple Server is complete. The next step requires the manufacturer to write these tokens one by one into the firmware of the products being shipped on the mass production line.


### 3. Batch Registration of Used Tokens with the Apple Server


Next, after this production batch is completed, the manufacturer must report the list of tokens used during this production process to the Apple Server, indicating that these tokens have been integrated into mass-produced products. This ensures that these shipped accessories can successfully pass verification by Apple Devices and bind to the user's Apple account when end users pair and use them for the first time.


The API for the manufacturer's server to report and register the list of used tokens to the Apple Server is: `api/v1.0/external/bulk/usedAuthEntities`.


The request message should include the accessory's PPID and the list of tokens being reported. The Apple Server will then return a Request ID for this request.


It is worth noting that each token element in the token list included in the request message takes the form of `Token ID : UUID`. Where does this UUID come from?


In fact, all tokens are applied for from the Apple Server and returned to the manufacturer's server. During mass production, aside from writing the token into the accessory product's firmware, a unique UUID generated and managed by the manufacturer must also be written into the firmware.


In other words, for every single token, the manufacturer's server should simultaneously generate a unique UUID compliant with the RFC 4122 Type 4 specification. A one-to-one correspondence between the token and the UUID must be established and written into the product firmware concurrently during production. This one-to-one relationship between the token and the UUID must also be reported to the Apple Server after mass production.


Why make it so complicated? Can't the verification of peripheral products be achieved simply through the uniqueness of the token? In fact, this design is related to potential factory reset operations that users might perform later. The token written during the production line phase is used for the user's first-time use and binding process. According to Apple's security design, each token can only be used once during initial activation and binding. Therefore, if a user performs a factory reset on the accessory, the Apple Device will issue a new token to the accessory, replacing the previously used token (i.e., the one written on the production line) so it can be used for subsequent re-pairing with a new Apple account. In other words, the token may be modified during the subsequent usage lifecycle of the accessory. At this point, a fixed, unchanging ID is needed to identify the accessory product; this ID is the UUID that the manufacturer must write into the firmware synchronously with the token during mass production. During subsequent use, the token may change, but the UUID will never change.


### 4. Batch Revocation of Unused Tokens with the Apple Server


Aside from the standard workflow described above, Apple also provides a token revocation process for scenarios where too many tokens were applied for and not all of them were consumed during the mass production run, thus preventing token wastage.


If the accessory manufacturer still has excess, unused tokens remaining after a production batch concludes, they should use the following API on their server to request the revocation of these unused tokens: `api/v1.0/external/bulk/unusedAuthEntities`. The request payload of this API should include the accessory product's PPID and the IDs of the tokens to be revoked (since these tokens were not used in production, there are no corresponding UUIDs). Correspondingly, upon receiving this request, the Apple Server will return a Request ID.


## Accessory Activation Process


Regarding the production and usage of MFi accessories, aside from the interaction between the manufacturer's server and the Apple Server, writing tokens and UUID information during mass production, and reporting them to the Apple Server as described above, there is also an initial activation process when the accessory is used for the first time.


After production, accessories enter the market for sale, having had tokens and manufacturer-generated UUIDs pre-written during the production stage. When a user activates this device for the first time and attempts to pair and bind it with their Apple device and account (using the Apple Home app or Find My app), the Apple device requests to read the token from the accessory. Upon reading it, the Apple device must further communicate with the Apple Server, sending this token to the Apple Server for cloud-side checking and verification to confirm that it is a legitimate MFi peripheral device. Only when the Apple Server verifies it successfully can the device complete the binding process and function normally.


## Reference Documents

- Software Token Authentication Server Specification Release R2.1