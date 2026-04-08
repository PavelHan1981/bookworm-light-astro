---
title: "SOAP基础学习笔记"
slug: "2022-04-13-SOAP-baics"
description: "本文基于对网络资料的学习，整理了SOAP（Simple Object Access Protocol）的基础学习笔记，为Onvif的开发做好基础。"
date: 2022-04-13T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["软件工程"]
tags: ["Onvif"]
draft: false
---


本文主要是对参考文档1的学习笔记整理。


## 什么是SOAP？


SOAP：Simple Object Access Protocol，简单对象访问协议。


SOAP定义了一种在两个WEB设备之间交换数据的标准协议规范，是一种基于XML的轻量级通信协议（**不是网络通信协议，而是设备间通信对数据进行封装和解析的协议**）。简单地说，就是在XML文档格式的基础上，再定义了一个更详细的约束条件，方便web设备在通信的时候更容易的组织和解析交互的数据信息。


在实践中，SOAP往往所作为Web Service的三要素（SOAP，WSDL，UDDI）之一应用在技术领域的，SOAP在其中规定了Web Service的客户端和服务器之间交换信息的具体格式。

- Web Service的服务器端使用SOAP协议来定义和描述自己提供的Service是什么，在哪儿，以及应该如何调用；而客户端则在收到SOAP消息后按照SOAP协议的标准规范进行解析，就能够得到以上信息。

那么SOAP与XML之间的关系是什么呢？XML的使用也已经很广泛了，为什么不直接使用XML而要使用SOAP呢？

- XML实际上只是一种文档的基本格式，如果直接使用XML在Web设备之间传输信息的话，需要设备双方提前明确的定义好XML文档中所包含的信息结构应该如何组织和解析，这样接收端收到以后才能正确的理解XML文档中所包含的信息是什么意思；
- SOAP实际上就是在XML的基础上做了一层封装，使用SOAP定义的XML需要有预先定义好的文档结构和数据结构，这样SOAP信息的接收端收到以后，就能够使用标准定义的形式去对SOAP信息进行解析。

SOAP只是基于XML定义了在设备之间进行数据传递的格式，**它的本质就是一个XML文件。因此SOAP并没有限定只能在HTTP协议的基础上进行传输**。实际上它可以和现存的许多因特网协议和格式结合使用，包括超文本传输协议（HTTP），简单邮件传输协议（SMTP），多用途网际邮件扩充协议（MIME）等。


只不过在WEB系统上HTTP协议的使用最为广泛，因此在HTTP协议上进程SOAP数据的传输就成为了一个事实上的标准。以下就是一个用HTTP协议传输SOAP数据的例子：


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

- 在上面的HTTP报文中，使用application/soap+xml这样的Content-Type，来表述这个报文的数据部分包含的是一个SOAP Message。这样接收到收到以后就可以按照SOAP定义的规范对其数据进行解析了。

最新版本的SOAP协议1.2版本在2003年6月24日成为了W3C的推荐版本，目前由万维网联盟的XML工作组负责进行维护。


## SOAP的语法结构


在Web Service的架构下，Web设备客户端与服务器之间交互的信息以SOAP Message为单位，放在HTTP协议的数据负荷中进行传输。一个SOAP message实际上就是一个XML文档。


一条标准的SOAP Message由以下元素组成：

- 开头必须的Envelope元素，使用这个元素标记这个XML文档是一个SOAP message；
- 可选的Header元素；
- 必须的Body元素，在其中包含有Web Service的调用和响应的信息内容；
- 可选的Fault元素，包含在Body元素之中。在发生错误的时候在其中提供错误信息。

以下就是典型的SOAP消息的基本结构：


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


### SOAP Envelope元素


该元素是必须的。


在SOAP消息结构中，使用soap:Envelope来标记这个xml文档是一个SOAP Message，同时这个Envelope元素也是整个消息的根元素。


### SOAP Header元素


该元素是可选的。


SOAP Message的Header元素中，通常可以包含Web Service执行的专用信息（例如认证信息等）。


如果在SOAP Message中包含有Header元素的话，它必须要是其中的第一个子元素。


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


以上SOAP Header中定义了一个名为Trans的子元素，这个子元素的value是234。


### SOAP Body元素


该元素是必须的。


以下面通过HTTP传输的SOAP请求和响应的报文内容来说明SOAP Body元素的组织


客户端发出的SOAP请求：


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

- 以上SOAP请求报文中，在Body元素中，客户端向服务器端发出一个web service的调用请求，请求访问m:GetStockPrice方法，给这个方法的参数m:StockName传递了一个IBM的值。即请求IBM的当前股价。

Web Service服务提供端发回的SOAP响应消息：


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

- 在以上SOAP消息的响应报文的Body元素中，服务器端把调用m:GetStockPrice方法返回的结果，包含在m:Price子元素中，value是34.5。

需要注意，**Body元素只是提供了一个web service调用和响应信息的框架**。其中的m:GetStockPrice、m:StockName、m:GetStockPriceResponse和m:Price等都是应用程序本身定义的元素，非SOAP标准定义的内容，所以需要客户端和服务器端分别进行解析。


### SOAP Fault元素


该元素是可选的。用于描述Web Service在调用过程中可能出现的出错信息。


一个SOAP Message中只能包含有一个Fault元素。


如果SOAP  Message中包含Fault元素的话，这个元素应该包含在Body元素中。


以下是一个包含有Fault元素的SOAP Message：


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

- 其中包含的fault元素，使用faultcode子元素返回SOAP-ENV:Client表示这是一条客户端的错误，使用faultstring子元素详细描述了错误的原因。服务器端不支持客户端请求的ValidateCreditCard方法。

## 参考资料

1. [SOAP 教程 | 菜鸟教程 (runoob.com)](https://www.runoob.com/soap/soap-tutorial.html)
2. [SOAP Web Services Tutorial: What is SOAP Protocol? EXAMPLE (guru99.com)](https://www.guru99.com/soap-simple-object-access-protocol.html)
