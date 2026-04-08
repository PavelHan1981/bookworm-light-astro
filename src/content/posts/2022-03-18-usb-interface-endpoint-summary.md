---
title: "USB接口与端点的概念总结"
slug: "2022-03-18-usb-interface-endpoint-summary"
description: "本文基于对usb in a nutshell的学习，总结了USB标准协议中接口和端点的相关概念。"
date: 2022-03-18T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["USB"]
draft: false
---


## 端点EndPoint


从逻辑上看，端点可以认为是USB device端的FIFO，用于保存Host与Device之间的通信数据。


每个USBdevice上都包含有多个端点，所以可以认为USB device上会并行运行多个独立的FIFO队列，分别用于保存发送给Host或者Device的数据。**Host端通过device地址和端点号来对通信数据应该存取的端点FIFO进行定位**。

- 所有由Host发送给Device的数据，都会根据device地址和端点号定位要对应的OUT类型端点FIFO，然后把数据保存到FIFO中；等待Device端有空闲时从FIFO中读走。
- 所有由Device发送到Host的数据，都会先放到对应的IN类型端点FIFO中，然后在Host轮询USB总线上的端点数据的时候，使用一个IN Packet从这个FIFO中读走。

所有的USB device都必须有端点0，而且只有这个端点0是双向的，这个端点0用于接收所有的控制和状态类型的请求；其他所有的端点都是单向的，要么为IN，要么为OUT。

- IN和OUT是站在Host的角度来理解，所以尽管端点是device侧的FIFO，从Host发到Device的端点类型是OUT端点，从Device发到Host的端点类型是IN端点。

![Untitled.png](/images/blog/USB接口与端点的概念总结-1.png)


## 端点描述符


![Untitled.png](/images/blog/USB接口与端点的概念总结-2.png)

- bLength，表示这个端点描述符结构体的大小，固定为7；
- bDescriptorType，描述符类型，固定为5，表示是端点描述符；
- bEndPointAddress：端点的方向以及编号。
    - bit0-3为端点编号，因此一个USB Device最多有16个端点；
    - bit7为端点方向，0表示OUT，1表示IN，均从HOST的角度来作为参照。
    - 此外对于控制端点而言，固定使用端点0，并且因为是双向端点，不需要使用bit7作区分；
- bmAttributes：端点属性，用于定义这个端点是Control、Bulk、Iso、Interrupt中的哪一个，及其相关的属性信息；
- wMaxPacketSize：这个端点一次收发能够处理的数据大小；
- bInterval：对Bulk和Control端点没有意义，对于Interrupt和Iso端点，表示多长时间对这个端点进行一次轮询。
    - 这里设置的单位并非是时间，而是USB总线收发Frame的个数。因此对于USB2.0高速设备而言，这里的单位是125us。
    - Iso类型的端点设置值固定为1，Interrupt类型的端点设置值在1-255之间。

## 接口Interface


所谓的接口，可以认为是一组端点的集合，用于实现一个标准的独立功能。因此，一个USB设备一般有一个设备描述符，一个或多个（绝大多数情况下只有一个）配置描述符。而每个配置描述符下面可以包含多个接口描述符，每个接口描述符又可以包含有多个端点用于实现某项功能：


![Untitled.png](/images/blog/USB接口与端点的概念总结-3.png)


**注意：如果一个设备中包含有多个接口，这些接口可以同时并行独立工作，互不干扰。接口描述符中有一个bInterfaceNumber用于区分不同的接口。**


## 接口的Alternative Setting功能


接口可以使用Alternative Setting选项来动态改变接口的配置。


接口描述符专门有一个bAlternateSetting参数指定当前定义的接口描述符是第几个接口的第几个alternative配置。


如果一个接口不需要使能Alternative Setting功能，那么就只需要定义一个接口描述符，并把它的bAlternateSetting设置为0；


如果一个接口使能Alternative Setting功能，就需要按照它需要的Alternative Setting的数量定义多个接口描述符，这些接口描述符的bInterfaceNumber一样，表示都是针对同一个Interface的配置，而每个描述符的bAlternateSetting参数不同，Host可以在运行中对这个Interface选择和设置不同的Alternative Setting。


Alternative Setting功能最典型的应用就是对于包含有Iso类型端点的接口，可以使用Alternative Setting对这个接口设置多个不同的wMaxPacketSize选项，在运行中由Host根据USB总线情况动态选择。例如联想X260笔记本摄像头上读取到的UVC Video Streaming Interace就使用了Iso端点，并通过多个Alternative Setting定义了多个wMaxPacketSize选项：


```html
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
......
```


**默认情况下，一个接口的bAlternateSetting=0的描述符选项会被启用。但是Host可以在运行中通过使用Set Interface标准命令来指定某个接口设置其某个已定义的alternative setting。**


## 接口描述符


![Untitled.png](/images/blog/USB接口与端点的概念总结-4.png)

- bLength，表示这个接口描述符结构体的大小，固定为9；
- bDescriptorType，描述符类型，固定为4，表示是接口描述符；
- bInterfaceNumber，接口在配置描述符中的索引；
- bAlternateSetting，该接口描述符的alternative setting索引；
- bNumEndpoints：这个接口使用的端点数量。注意如果接口用到控制端点的话，这个端点数量不会把控制端点计算在内；
- bInterfaceClass，bInterfaceSubClass，bInterfaceProtocol：这三个参数用于指定这个接口实现的标准功能，由USB规范定义；
- iInterface：该接口对应的字符串描述符的索引。

## 参考资料：

1. [USB in a NutShell - Chapter 3 - USB Protocols (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb3.shtml)
2. [USB in a NutShell - Chapter 5 - USB Descriptors (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb5.shtml)
