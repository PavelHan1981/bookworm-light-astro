---
title: "WSDL基础学习笔记"
slug: "2022-04-19-WSDL-basics"
description: "基于对网络上相关资料的学习，整理出WSDL的学习笔记，为下一步进行onvif协议的学习以及开发打好基础。"
date: 2022-04-19T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["软件工程"]
tags: ["Onvif"]
draft: false
---


WSDL：Web Services Description Language。由微软和IBM共同开发。


与SOAP一样，WSDL也是基于XML的规范。只不过WSDL是用于服务器端对Web Service进行描述，定义了这些Web Service应该如何被客户端远程调用和访问。


因此，**本质上WSDL就是一种使用XML所编写的文档。在这个文档中描述了某个 Web service所在的的位置，以及这个服务所提供的操作或方法**。


Web Service比较典型的使用流程就是：客户端应用程序与服务器端建立连接，读取服务器上的WSDL信息，解析后就可以得知这个服务器上提供的功能接口以及如何调用的详细信息；然后就可以通过SOAP Message的形式来调用在WSDL中所描述的那些功能接口。


## WSDL的文档结构


WSDL本身就是一个XML文档，它的文档结构如下所示：


```xml
<definitions>
 
<types>
  data type definitions........
</types>
 
<message>
  definition of the data being communicated....
</message>
 
<portType>
  set of operations......
</portType>
 
<binding>
  protocol and data format specification....
</binding>
 
</definitions>
```


在参考资料2中提供了一个真实的WSDL文档的例子：


```xml
<definitions name = "HelloService"
   targetNamespace = "http://www.examples.com/wsdl/HelloService.wsdl"
   xmlns = "http://schemas.xmlsoap.org/wsdl/"
   xmlns:soap = "http://schemas.xmlsoap.org/wsdl/soap/"
   xmlns:tns = "http://www.examples.com/wsdl/HelloService.wsdl"
   xmlns:xsd = "http://www.w3.org/2001/XMLSchema">
 
   <message name = "SayHelloRequest">
      <part name = "firstName" type = "xsd:string"/>
   </message>
	
   <message name = "SayHelloResponse">
      <part name = "greeting" type = "xsd:string"/>
   </message>

   <portType name = "Hello_PortType">
      <operation name = "sayHello">
         <input message = "tns:SayHelloRequest"/>
         <output message = "tns:SayHelloResponse"/>
      </operation>
   </portType>

   <binding name = "Hello_Binding" type = "tns:Hello_PortType">
      <soap:binding style = "rpc"
         transport = "http://schemas.xmlsoap.org/soap/http"/>
      <operation name = "sayHello">
         <soap:operation soapAction = "sayHello"/>
         <input>
            <soap:body
               encodingStyle = "http://schemas.xmlsoap.org/soap/encoding/"
               namespace = "urn:examples:helloservice"
               use = "encoded"/>
         </input>
		
         <output>
            <soap:body
               encodingStyle = "http://schemas.xmlsoap.org/soap/encoding/"
               namespace = "urn:examples:helloservice"
               use = "encoded"/>
         </output>
      </operation>
   </binding>

   <service name = "Hello_Service">
      <documentation>WSDL File for HelloService</documentation>
      <port binding = "tns:Hello_Binding" name = "Hello_Port">
         <soap:address
            location = "http://www.examples.com/SayHello/" />
      </port>
   </service>
</definitions>
```


## WSDL的元素类型


### definitions


definitions元素必须是WSDL文档的根元素，它定义了这个Web Service的名称。


WSDL文档中使用definitions根元素来包含其他的各种类型子元素。


以下例子使用definitions元素定义了一个名称为HelloService的Web Service。


```xml
<
definitions name="HelloService"

   targetNamespace="http://www.examples.com/wsdl/HelloService.wsdl"
   xmlns="http://schemas.xmlsoap.org/wsdl/"
   xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
   xmlns:tns="http://www.examples.com/wsdl/HelloService.wsdl"
   xmlns:xsd="http://www.w3.org/2001/XMLSchema">
   ................................................
</definitions>
```


### Types


用于对文档中使用的数据类型进行定义。为了尽可能保证对运行平台和编程语言的中立性，WSDL 使用 XML Schema 语法来定义数据类型。


这里定义的数据类型可能会在Message或者PortType等元素中被使用。


在实践中，Types主要用来定义Client和Server之间的需要交互的复杂类型的数据结构，如不同简单数据类型的组合。如果Client和Server之间的交互消息参数只用到一些简单的数据类型，如整型和字符串等，那就没有必要使用Types元素了。


以下WSDL文件片段中在Types元素中定义了两个数据结构：TradePriceRequest和TradePrice。这两个数据结构均只是对简单数据类型字符串和浮点型数据的简单封装。后续在Message和PortType元素中就可以直接引用这两个数据类型作为输入和输出消息的参数。


```xml
<types>
   <schema targetNamespace = "http://example.com/stockquote.xsd"
      xmlns = "http://www.w3.org/2000/10/XMLSchema">
		
      <element name = "TradePriceRequest">
         <complexType>
            <all>
               <element name = "tickerSymbol" type = "string"/>
            </all>
         </complexType>
      </element>
		
      <element name = "TradePrice">
         <complexType>
            <all>
               <element name = "price" type = "float"/>
            </all>
         </complexType>
      </element>
		
   </schema>
</types>
```


### Message


用于对文档中使用的消息进行定义。这里定义的消息会在PortType中的operation元素中引用，作为operation调用的输入或者输入参数。


例如上面的wsdl文档片段中，定义了一个名词为getTerm的operation，在这个operation中有一个输入消息参数和一个输出消息参数。这两个消息参数都是使用message元素定义的，实际上都是字符串类型。


```xml
<message name="getTermRequest">
  <part name="term" type="xs:string"/>
</message>
 
<message name="getTermResponse">
  <part name="value" type="xs:string"/>
</message>
 
<portType name="glossaryTerms">
  <operation name="getTerm">
    <input message="getTermRequest"/>
    <output message="getTermResponse"/>
  </operation>
</portType>
```


### PortType


portType是WSDL中最重要的元素。它用于描述一个web service中所包含的可执行操作，每个操作的输入参数和返回消息。


简单的说，可以把portType看作是传统编程语言中的一个函数库，其中包含有多个operation，每个operation就对应于函数库中的一个函数。


根据这个Operation中所包含的请求（输入）参数和响应（输出）参数的具体情况，Operation可以分为以下四种情况：


One-Way：这种类型的Operation中只有一个请求消息，没有响应消息


![Untitled.png](/images/blog/WSDL基础学习笔记-1.png)


```xml
<operation name="updateWeather">
  <input message="tns:updateWeather"/>
</operation>
```


Request-response：这是最常见的web service模式。包含一个请求参数，处理后给Client返回一个响应参数。


![Untitled.png](/images/blog/WSDL基础学习笔记-2.png)


```xml
<operation name="getSummary">
  <input message="tns:getSummary"/>
	<output message="tns:getSummaryResponse"/>
</operation>
```


Solicit-response：刚好与Request-response相反，是由Web Service的提供端发起，向Client端发出一个请求消息，然后从Client读回一个响应消息。


![Untitled.png](/images/blog/WSDL基础学习笔记-3.png)


```xml
<operation name="weatherUpdateRenew">
  <output message="tns:RenewRequest"/>
  <input message="tns:RenewResponse"/>
</operation>
```


Notification：这种类型的Web Service只是由Server端向Client端发出一个通知消息。


![Untitled.png](/images/blog/WSDL基础学习笔记-4.png)


```xml
<operation name="weatherNotification">
  <output message="tns:getSummaryResponse"/>
</operation>
```


### Binding


Binding元素用于指定PortType里面定义的那些operation，在具体的网络请求和访问中应该使用什么通信协议来进行传输。例如可以使用HTTP GET，HTTP PUT，SOAP等。

- 如果使用SOAP进行传输的话，应该设置binding属性为<soap:binding>，这个时候就应使用在HTTP协议基础上进行封装的SOAP消息来进行Web Service的访问。

在这个元素中还定义了operation所在的位置位置。


binding元素主要有两个属性：type用于指定这个binding元素要给哪个porttype绑定传输协议，name则是这个binding元素的名称。


下面的例子中定义了一个glossaryTerms的porttype，其中包含有一个名为getTerm的operation。然后使用binding元素指定glossaryTerms中的所有operation均采用SOAP协议进行传输，在soapAction属性中指定访问这个operation的字符串。


```xml
<message name="getTermRequest">
  <part name="term" type="xs:string"/>
</message>
 
<message name="getTermResponse">
  <part name="value" type="xs:string"/>
</message>
 
<portType name="glossaryTerms">
  <operation name="getTerm">
    <input message="getTermRequest"/>
    <output message="getTermResponse"/>
  </operation>
</portType>
 
<binding type="glossaryTerms" name="b1">
   <soap:binding style="document"
   transport="http://schemas.xmlsoap.org/soap/http" />
   <operation>
     <soap:operation soapAction="http://example.com/getTerm"/>
     <input><soap:body use="literal"/></input>
     <output><soap:body use="literal"/></output>
  </operation>
</binding>
```


## 参考资料

1. [WSDL 教程 | 菜鸟教程 (runoob.com)](https://www.runoob.com/wsdl/wsdl-tutorial.html)
2. [WSDL Tutorial (tutorialspoint.com)](https://www.tutorialspoint.com/wsdl/index.htm)
3. [Web 服务定义语言 （WSDL） (w3.org)](https://www.w3.org/TR/wsdl.html)
4. [Message Patterns in WSDL (perforce.com)](https://help.perforce.com/hydraexpress/4.3.0/html/rwsfexpwsfabricationug/9-2.html)
