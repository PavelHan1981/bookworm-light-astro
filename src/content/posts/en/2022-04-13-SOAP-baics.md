---
title: "SOAP Fundamentals Study Notes"
slug: "2022-04-13-SOAP-baics"
description: "This article compiles basic study notes on SOAP (Simple Object Access Protocol) based on online reference materials, laying the foundation for ONVIF development."
date: 2022-04-13T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Software Engineering"]
tags: ["Onvif"]
draft: false
---


This post mainly compiles study notes based on Reference 1.


## What is SOAP?


SOAP: Simple Object Access Protocol.


SOAP defines a standard protocol specification for exchanging data between two web devices. It is a lightweight XML-based communication protocol (**not a network transport protocol, but a protocol for data encapsulation and parsing in inter-device communication**). Simply put, it adds a set of detailed constraints on top of the XML document format, making it easier for web devices to structure and parse exchanged data during communication.


In practice, SOAP is often applied in technology as one of the three core elements of Web Services (SOAP, WSDL, and UDDI), where SOAP defines the specific format of information exchanged between a Web Service client and server.

- The Web Service server uses the SOAP protocol to define and describe what service it offers, where it is located, and how it should be invoked. Upon receiving a SOAP message, the client parses it according to the standard SOAP protocol specification to retrieve this information.

So, what is the relationship between SOAP and XML? Given that XML is already widely used, why not use plain XML directly instead of SOAP?

- XML is essentially just a basic document format. If plain XML were used directly to transfer information between web devices, both parties would need to explicitly agree in advance on how the information structure within the XML document should be organized and parsed so that the receiver can correctly understand the content upon receipt;
- SOAP adds an encapsulation layer on top of XML. An XML document defined with SOAP relies on pre-defined document and data structures, allowing any SOAP message recipient to parse it using a standardized approach.

SOAP simply defines an XML-based format for data exchange between devices; **at its core, it is an XML file. Therefore, SOAP is not restricted to transmission over the HTTP protocol**. In fact, it can be combined with many existing Internet protocols and formats, including Hypertext Transfer Protocol (HTTP), Simple Mail Transfer Protocol (SMTP), Multipurpose Internet Mail Extensions (MIME), and more.


However, because HTTP is the most widely used protocol on web systems, transmitting SOAP data over HTTP has become a de facto standard. Here is an example of transmitting SOAP data over HTTP:


```xml
POST /InStock HTTP/1.1
Host: www.example.org
Content-Type: application/soap+xml; charset=utf-8
Content-Length: nnn

<?xml version="1.0"?>
<soap:Envelope
xmlns:soap="http://www.w3.org/2001/12/soap-envelope"
soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">

<soap:Body xmlns:m="http://www.example.org/stock">
......
</soap:Body>

</soap:Envelope>
```

- In the HTTP message above, the `application/soap+xml` Content-Type indicates that the payload contains a SOAP Message. Upon receiving it, the recipient can parse the data according to the SOAP specification.

The latest version of the SOAP protocol, version 1.2, became a W3C Recommendation on June 24, 2003, and is currently maintained by the W3C XML Working Group.


## SOAP Syntax Structure


In a Web Services architecture, information exchanged between web clients and servers is grouped into SOAP Messages, which are carried within the HTTP payload. A SOAP message is essentially an XML document.


A standard SOAP Message consists of the following elements:

- A mandatory root `Envelope` element that identifies the XML document as a SOAP message;
- An optional `Header` element;
- A mandatory `Body` element containing call and response details for the Web Service;
- An optional `Fault` element embedded within the `Body` element, which provides error information when an error occurs.

The following is the basic structure of a typical SOAP message:


```xml
<?xml version="1.0"?>
<soap:Envelope
xmlns:soap="http://www.w3.org/2001/12/soap-envelope"
soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">

<soap:Header>
...
</soap:Header>

<soap:Body>
...
  <soap:Fault>
  ...
  </soap:Fault>
</soap:Body>

</soap:Envelope>
```


### SOAP Envelope Element


This element is mandatory.


In a SOAP message structure, `soap:Envelope` is used to mark the XML document as a SOAP Message. The `Envelope` element also serves as the root element of the entire message.


### SOAP Header Element


This element is optional.


The `Header` element of a SOAP message typically contains application-specific information required for processing the Web Service (such as authentication credentials).


If a `Header` element is present in a SOAP message, it must be the first child element of the `Envelope`.


```xml
<?xml version="1.0"?>
<soap:Envelope
xmlns:soap="http://www.w3.org/2001/12/soap-envelope"
soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">

<soap:Header>
  <m:Trans xmlns:m="http://www.w3schools.com/transaction/"
  soap:mustUnderstand="1">234
  </m:Trans>
</soap:Header>
...
...
</soap:Envelope>
```


The SOAP Header above defines a child element named `Trans` with a value of `234`.


### SOAP Body Element


This element is mandatory.


The following SOAP request and response payloads transmitted over HTTP illustrate how the `SOAP Body` element is structured:


SOAP request sent by the client:


```xml
POST /InStock HTTP/1.1
Host: www.example.org
Content-Type: application/soap+xml; charset=utf-8
Content-Length: nnn

<?xml version="1.0"?>
<soap:Envelope
xmlns:soap="http://www.w3.org/2001/12/soap-envelope"
soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">

<soap:Body xmlns:m="http://www.example.org/stock">
  <m:GetStockPrice>
    <m:StockName>IBM</m:StockName>
  </m:GetStockPrice>
</soap:Body>

</soap:Envelope>
```

- In the SOAP request message above, inside the `Body` element, the client sends a Web Service call requesting the `m:GetStockPrice` method and passes the value `IBM` to the parameter `m:StockName` (i.e., requesting the current stock price for IBM).

SOAP response message returned by the Web Service provider:


```xml
HTTP/1.1 200 OK
Content-Type: application/soap+xml; charset=utf-8
Content-Length: nnn

<?xml version="1.0"?>
<soap:Envelope
xmlns:soap="http://www.w3.org/2001/12/soap-envelope"
soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">

<soap:Body xmlns:m="http://www.example.org/stock">
  <m:GetStockPriceResponse>
    <m:Price>34.5</m:Price>
  </m:GetStockPriceResponse>
</soap:Body>

</soap:Envelope>
```

- In the `Body` element of the SOAP response message above, the server embeds the return value of the `m:GetStockPrice` method call inside the `m:Price` child element, with a value of `34.5`.

Note that **the Body element merely provides a framework for Web Service invocation and response messages**. Elements like `m:GetStockPrice`, `m:StockName`, `m:GetStockPriceResponse`, and `m:Price` are defined by the application itself rather than the SOAP standard, so both client and server must handle their application-specific parsing accordingly.


### SOAP Fault Element


This element is optional and is used to describe error information that may occur during Web Service execution.


A SOAP message can contain at most one `Fault` element.


If present, the `Fault` element must be contained within the `Body` element.


Here is an example of a SOAP Message containing a `Fault` element:


```xml
<?xml version = '1.0' encoding = 'UTF-8'?>
<SOAP-ENV:Envelope
   xmlns:SOAP-ENV = "http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:xsi = "http://www.w3.org/1999/XMLSchema-instance"
   xmlns:xsd = "http://www.w3.org/1999/XMLSchema">

   <SOAP-ENV:Body>
      <SOAP-ENV:Fault>
         <faultcode xsi:type = "xsd:string">SOAP-ENV:Client</faultcode>
         <faultstring xsi:type = "xsd:string">
            Failed to locate method (ValidateCreditCard) in class (examplesCreditCard) at
               /usr/local/ActivePerl-5.6/lib/site_perl/5.6.0/SOAP/Lite.pm line 1555.
         </faultstring>
      </SOAP-ENV:Fault>
   </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

- In this example, the `Fault` element uses the `faultcode` child element to return `SOAP-ENV:Client`, indicating a client-side error. The `faultstring` child element describes the detailed reason: the server does not support the `ValidateCreditCard` method requested by the client.

## References

1. [SOAP Tutorial | RUNOOB.COM (runoob.com)](https://www.runoob.com/soap/soap-tutorial.html)
2. [SOAP Web Services Tutorial: What is SOAP Protocol? EXAMPLE (guru99.com)](https://www.guru99.com/soap-simple-object-access-protocol.html)