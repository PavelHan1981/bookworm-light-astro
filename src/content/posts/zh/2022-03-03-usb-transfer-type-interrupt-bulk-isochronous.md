---
title: "USB传输类型之Interrupt/Bulk/Isochronous Transfer"
slug: "2022-03-03-usb-transfer-type-interrupt-bulk-isochronous"
description: "本文基于对usb in a nutshell相关章节的学习，整理了三种usb传输类型的完整工作流程。"
date: 2022-03-03T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["USB"]
draft: false
---


本文是对usb in a nutshell相关章节的学习的基础上，整理出来的USB中断、Bulk和Isochronous三种类型的传输流程及其packet的组成。USB控制传输类型在[USB传输类型之Control Transfer](https://www.pavelhan.tech/2022-03-01-usb-control-transfer)一文中中总结。


简单总结起来，中断、Bulk和Isochronous这三种类型的传输，相比于控制传输而言，相对要简单一些。


控制传输的完整流程包含了三个阶段，每个阶段都包含由多个Packet；


而中断、Bulk和Isochronous这三种类型没有Stage的概念，完整的一个Transaction由连续的2-3个Packet组成。


## Interrupt


另外三种USB通信传输类型都是Host主动要向Device读取或者写入数据，中断类型为了解决Device有数据要向Host发送的应用场景，最典型的就是USB鼠标、键盘等类的应用，鼠标和键盘何时动作，没有办法提前预测，发生事件的时候Device能够马上知道，但是对于所有的通信都是由Host发起的USB通信总线而言，它是如何能够让Host尽快读走并处理数据以保证应用处理的实时性？这就是中断传输针对的应用场景。


简单的讲，对于注册到USB总线上的中断类型的端点，Host总线会预留通信带宽，按照USB枚举信息中定义的中断查询周期，定期对这个中断端点上的数据进行轮询。如果有数据的话立即读走处理，没有的话等待下个周期再读。如果这个定时查询的周期事件很短的话，就可以保证应用响应的实时性。


对于USB2.0高速设备而言，一次中断传输可以容纳的数据长度是1024字节。


中断端点的通信方向同样包含IN和OUT两种。但如以上应用场景所述，中断类型的传输主要是解决Device端有一些实时性数据需要及时向Host端上传的问题，因此最常用的中断端点传输类型是IN模式，它的OUT模式跟Bulk就比较类似了。


![Untitled.png](/images/blog/USB传输类型之Interrupt-Bulk-Isochronous-Transfer-1.png)

- Interrupt IN：
    - 正常的工作流程包括三个packet：IN Token+Data Packet+ACK packet。
    - Host按照中断端点描述符中定义的poll time定时对这个IN中断端点进行查询，看Device端是否有数据要发给Host：
        - 当Device端有数据要向Host发送的时候，就会回一个Data Packet，Host成功接收并处理以后，给Device回复一个ACK packet。整个传输就完成了；
        - 如果Device端在本次查询的时候没有数据要发送，就会直接回复一个NAK握手包。Host收到以后就等待下个轮询周期再去这个端点查询。
- Interrupt OUT：
    - Out类型的传输流程比较简单。当Host有数据要发给Device的话，先发一个Out Token Packet，然后再发一个Data Packet，Device端收到以后回复一个ACK。
    - 这样的话Interrupt OUT就跟Bulk Out的区别不大了，想不出来用Interrupt Out的理由何在。

## Bulk


Bulk类型的传输是USB的四种传输类型中应用最普遍的类型。


Bulk传输最大的特点就是可靠传输+Best Effort。

- 可靠传输也就意味着，无论是IN传输还是OUT传输，双方发出的Data Packet都会被接收方通过发出ACK来进行应答，这样数据的发送方就能够知道数据是否被成功接收。如果没有收到ACK的话，发送方可以再进行重传，以确保接收方总是按照顺序可靠、正确的接收到了数据包。
- Best Effort则意味着Bulk传输不会预留通信带宽，而是只要有数据收发需求+有带宽，就会全力的占用可用的带宽传输数据。这样的话，当USB总线上有更高优先级的数据要传输，例如中断传输和Isochronous传输，USB总线就会优先传输以上两种类型的数据。因此Bulk传输适用于那些有大量数据要传输，但是对数据传输的实时性要求不高的应用场合。

对于USB2.0高速设备而言，Bulk传输的每个Data Packet可以容纳的数据长度最大为512个字节。

- 当发送的数据长度小于512字节的话，不需要用0填充剩余的字节。

在Bulk传输中，接收端在以下三种情况下会认为本次Bulk传输已完成：

- 接收方接收到了它请求的数据大小；
- 本次接收到的data packet的长度小于512字节；
- 本次接收到的data packet是一个0字节长度的数据包；

![Untitled.png](/images/blog/USB传输类型之Interrupt-Bulk-Isochronous-Transfer-2.png)

- Bulk IN：
    - 正常的一次Bulk IN传输包含三个Packet：IN Token+data packet+Ack packet;
    - 当Host以Bulk IN的方式从Device读取数据的时候，首先发出一个IN Token，Device端回一个Data Packet，在其中包含有要发送给Host的数据，Host收到后通过ACK进行应答。整个通信过程完成。
    - 错误处理：
        - 如果Device接收到的IN Token错误，device端不做任何处理；
        - 如果这个IN端点发送错误，Device端回复一个STALL packet；
        - 如果这个IN端点暂时没有数据可以发给Host，Device端回复一个NAK packet；
- Bulk OUT：
    - 正常的一次Bulk OUT传输同样包含有三个packet：OUT Token+data packet+ACK packet；
    - 当Host以Bulk OUT的方式向Device发送数据的时候，首先发出一个IN Token，然后再发出一个Data Packet，在其中包含有要发送给Device的数据，deice收到后通过ACK进行应答。整个通信过程完成。
    - 错误处理：
        - 如果device接收到的OUT Token或者Data Packet有错误，device端不做任何处理，直接忽略；
        - 如果这个OUT端点工作状态发生错误，Device端回复一个STALL packet；
        - 如果这个OUT端点非空（例如之前的数据尚未被读走），无法处理本次的接收到的数据，Device端回复一个NAK packet；

## Isochronous


在USB传输的四种传输类型中，Isochronous类型是在接收到数据后唯一不需要发送ACK应答包的，这也就意味着这种类型允许一定数量的丢包。即使发生丢包也不需要重传，实际上数据的发送端根本不知道接收端是否有正确的接收到数据。这一点是Isochronous类型传输的最大特点。


因此，Isochronous类型传输比较适合用于传输实时音视频这类对于传输数据的实时性要求很敏感、但是对于丢包要求不是很严苛的应用场合。例如UVC摄像头的音视频流就可以通过这种方式向Host传输。


![Untitled.png](/images/blog/USB传输类型之Interrupt-Bulk-Isochronous-Transfer-3.png)


Isochronous IN和OUT传输的流程比较简单，就是一个由Host发出一个IN/OUT Token，然后紧接着是Host或者Device发出的Data Packet，数据的接收方不需要对接收数据做任何应答，发送方也就不清楚这个包是否被接收成功，因此不会有重传机制。


Isochronous类型一次数据传输可以容纳的数据长度在其端点描述符中进行指定，一般小于1024字节。**但是需要注意：这个数据包的长度并非越大越好。设置的越大，也就意味着一次Isochronous传输需要花的事件越长，占用的传输带宽就越多。那么在USB总线本身比较繁忙的情况下，出现丢包的可能性也就越高。**


因此，Host与Device之间进行Isochronous类型传输的丢包情况，由Host端根据USB总线的繁忙状态对其带宽进行管理决定。当总线比较繁忙的时候，Host就会选择给Isochronous传输设置较小的数据长度，避免占用过多带宽导致丢包；而总线空闲的时候，Host就会给Isochronous端点传输选择大一点的数据长度，来提升传输的效率。


**如前所述，Isochronous端点的数据payload长度是在其端点描述符中指定好的，那么Host如何来对这个payload进行选择/设置呢？**


答案就是，在isochronous类型的端点描述符声明中，一般需要通过alternative interface的方式，在包含有isochronous端点interface声明中，通过多个alternative interface+endpoint descriptor的方式来声明多个不同payload的端点配置，然后由Host进行选择并设置。


例如以下是Thinkpad X260自带的UVC摄像头的一部分USB枚举信息，其中在传输音视频数据的Video Streaming Interface就使用了Isochronous类型的端点，该端点的描述符信息定义如下：


```plain text
---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x01
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 01 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0080
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x00 (0 additional transactions per microframe -> allows 1..1024 bytes per packet)
Bits 10..0              : 0x80 (128 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 80 00 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x02
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 02 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0200
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x00 (0 additional transactions per microframe -> allows 1..1024 bytes per packet)
Bits 10..0              : 0x200 (512 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 02 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x03
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 03 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0400
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x00 (0 additional transactions per microframe -> allows 1..1024 bytes per packet)
Bits 10..0              : 0x400 (1024 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 04 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x04
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 04 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0B00
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x01 (1 additional transactions per microframe -> allows 513..1024 byte per packet)
Bits 10..0              : 0x300 (768 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 0B 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x05
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 05 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0C00
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x01 (1 additional transactions per microframe -> allows 513..1024 byte per packet)
Bits 10..0              : 0x400 (1024 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 0C 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x06
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 06 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x1380
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x02 (2 additional transactions per microframe -> allows 683..1024 bytes per packet)
Bits 10..0              : 0x380 (896 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 80 13 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x07
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 07 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x1400
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x02 (2 additional transactions per microframe -> allows 683..1024 bytes per packet)
Bits 10..0              : 0x400 (1024 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 14 01                              .......
```


可以看到，在Video Streaming Interface下面的这个isochronous端点描述符的定义上，包含了七组不同packet size的端点描述符，这样Host就可以根据当前的总线情况选择使用对应的packet size设置。


## 参考资料：

- [USB in a NutShell - Chapter 4 - Endpoint Types (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb4.shtml#Control)
