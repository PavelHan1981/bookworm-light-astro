---
title: "USB传输类型之Control Transfer"
slug: "2022-03-01-usb-control-transfer"
description: "本文基于对usb in a nutshell相关章节的学习，总结了控制传输类型的完整工作流程。并以USB设备描述符的读取通信过程加以说明。"
date: 2022-03-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["USB"]
draft: false
---


USB的控制传输通常用于传输控制命令和状态信息数据。USB最重要的功能枚举功能就是通过控制传输来完成的。


USB的控制传输最多包含有3个通信阶段：Setup Stage、可选的Data Stage和Status Stage。每个Stage都包含有多个USB事务和通信包。

- 实际上每个Stage也就是一个所谓的事务Transaction，这样的话一个控制传输也就包含3个Transaction。每个Transaction/Stage则包含有多个Packet。

## Setup Stage


Setup Stage包含有三个USB packet：Setup token packet，data packet和ack packet。


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-1.png)

- Setup Token：就是一个标准的Setup token packet，使用PID（0b1101）进行标记，其中包含有device端的设备地址和端点号；
- Data：Data部分实际上就是在内部包含了一个定长8字节的Setup Packet，在其中详细定义这个控制传输的请求类型；
- ACK：最后的ACK包用于标记Device是否已经成功接收并处理了前面的两个包。
    - 在device端成功接收并处理的情况下，会应答一个标准的ACK包；
    - 如果通信过程中出错的话Device不会发出NAK或者STALL包；

**注意：Setup Token和Data packet中包含的Setup Packet尽管名称很类似，但这两者是完全不同的概念。**


Setup Token是一个标准的USB token packet；其包结构为：


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-2.png)


而Setup Packet则是一个USB Data Packet；其包结构为：


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-3.png)


## Data Stage


Data Stage是可选的。


Data Stage中可以包含一个或者多个IN或者OUT类型的数据包。例如USB枚举过程中，一般USB配置描述符信息比较大，在一个Data IN Packet中容纳不下，就需要分为多个IN Packet对描述符信息进行传输。


Data Stage中要传输的数据长度，在Setup Stage中的Data Packet中包含的Setup Packet wLength Field中指定。如果要传输的数据长度超过单个IN或者OUT Packet的最大支持长度，就需要分为多个包进行传输。


在Data Stage具体是用IN还是OUT类型的传输，要看这个控制传输的具体使用场景是什么。一般SET类的控制传输请求都是使用OUT类型的Data Stage，而GET类的控制传输请求都是使用IN类型的Data Stage。


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-4.png)


IN类型的Data Stage：

- Host端在做好接收数据准备的情况下，发出一个标准的IN Token（PID=0b1011），其中包含有通信的目的device地址和端口号；
- Device发回一个Data packet；
- Host收到并正确处理后发出一个ACK信息；
    - 如果通信中Device端接收到的IN Token错误，Device端直接对其忽略，并不做任何响应；
    - 如果通信中Device端的IN端点发生错误，无法正确发出DATA packet的时候，Device会返回一个STALL Packet；
    - 如果通信中Device端的IN端点没有问题，但是目前Device端无数据可以发送，Device端会返回一个NAK Packet；
- **如果Host有多个Data Packet要读取的话，都需要按照以上的IN-DATA-ACK的流程进行通信**。

OUT类型的Data Stage：

- Host端首先发出一个标准的OUT Token（PID=0b0001），其中包含有通信的目的Device地址和端口号；
- Host端紧接着再发出一个Data Packet；
- Device端正确的接收并处理以后发出一个ACK Packet；
    - 如果通信中OUT Token和Data Packet出现任何错误，Device端直接对其忽略，不做任何响应；
    - 如果通信中Device端的OUT端点buffer正在处理之前接收的数据，尚无法接收新数据的时候，Device端会返回一个NAK Packet；
    - 如果通信中Device端的OUT端点发生错误，无法正确接收数据的时候，Device端会返回一个STALL Packet；
- **如果Host有多个Data Packet要发送的话，都需要按照以上的OUT-DATA-ACK的流程进行通信**。

## Status Stage


Sattus Stage用于对本次完整的控制传输通信业务再进行一次总的应答和报告，这样Host和Device两者都能清楚的知晓本次控制通信的业务是否完整、正确完成。


根据Data Stage阶段Host是从Device读取数据，还是向Device发出数据，Status Stage也分为两种类型的状态应答：


**IN：当Host在Data Stage阶段通过发出IN Token从Device端读取数据的时候，就需要在Status Stage向Device发出信息，告知自己已经正确的接收并处理数据。**


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-5.png)

- 具体的做法就是：Host端先发出一个OUT Token，然后紧跟着再发出一个长度为0的Data Packet。Device正确接收前面两个包以后，就会返回一个ACK packet。**至此这次控制传输至此就完整的完成了。**

OUT：**当Host在Data Stage阶段通过发出OUT Token向Device端发送数据的时候，Device就需要在Status Stage向Host发出信息，告知自己已经正确的接收并处理数据。**


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-6.png)

- 具体的做法就是：Host端先发出一个IN Token，然后紧跟着从Device端的IN端点上读取一个长度为0的Data Packet。如果以上通信正确，Host就会返回一个ACK packet。**至此这次控制传输至此就完整的完成了。**

## 读取设备描述符的完整控制传输例子


以Host在USB枚举阶段从Device端读取设备描述符的例子，来解释完整的控制传输的过程。


仍然是包括以上三个阶段：


1.Setup Stage


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-7.png)

- 这个阶段总共有3个包：Host发出的Setup Token Packet和Data Packet，以及Device的ACK Handshake Packet。
- 通信的目的device地址和端点号包含在Setup Token Packet中；
    - 因为是控制传输类型，所以这里的端点号固定为0；
- 读取设备描述符的请求是一个标准的Standard Setup Packet，定长8字节，封装在Data Packet中的Data0 Field中。
    - Device接收到Setup token以后，也就知道在其后面紧跟的Data Packet中包含的就是一个标准的Setup Packet；然后Device端对这个Setup packet进行解析，就能够知道这次控制传输请求的的目的是什么，而Data Stage要读取的数据长度则包含在Setup Packet的wLength Field中；

2.Data Stage


Device端接收到Setup Stage中包含的Setup Packet，并对其解析以后，就能够得知Host是要读取设备描述符。然后就在Data Stage中通过IN方式返回自己的设备描述符给Host。


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-8.png)

- 每个IN Data packet所包含的数据长度是有限制的，如果Host要读取的数据长度超过了这个限制，就需要分为多个IN Packet进行传输，而每个IN Packet的传输都需要包含IN Token-Data Pakcet-ACK Handshake三个阶段，直到所有数据全部发送完成。
- 上面的例子中，设备描述符的长度是12个字节，单个data packet的长度限制是8个字节，所以分为两个data packet发给host，第一个packet为8字节，第二个packet为剩下的4字节。

3.Status Stage


Host端成功读取device端的设备描述符以后，就需要通过发出一个0长度的OUT Data Packet通知Device，至此这个读取设备描述符的控制传输过程就完整的完成了。


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-9.png)


## 参考资料：

- [USB in a NutShell - Chapter 4 - Endpoint Types (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb4.shtml#Control)
