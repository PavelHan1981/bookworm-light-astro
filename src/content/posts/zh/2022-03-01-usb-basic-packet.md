---
title: "USB标准包类型总结"
slug: "2022-03-01-usb-basic-packet"
description: "本文基于对usb in a nutshell的学习，总结了USB通信中的基本数据包类型。"
date: 2022-03-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["USB"]
draft: false
---


**一次基本的USB通信业务（也就是所谓的USB Transaction）通常包含三个USB基本Packet**：

- Token Packet：由Host发起，其中包含有通信的意图、目的设备的device address、端点号等信息；
- Data Packet（可选）：由具体的通信意图确定，可能是从Host发给Device（Out Data Packet），也可能是Host从Device读取（IN Data Packet）；
- Status Packet：根据Data Packet的数据走向，由数据的接收方向发送方给出的应答包，告知数据是否被成功、正确的解释并处理。

因此本文对USB通信中用到的各种基本包类型进行总结。


**常用的USB基本包类型主要包括以下四种：**

- Token Packet；
- Data Packet；
- Handshake Packet；
- SOF Packet；

其中每种类型的包又可以分为多种子类型，而每个Packet内部又包含有多个Field。


## USB Packet中的那些通用Field

- Sync：
    - **所有的USB Packet都必须要从Sync开始。**
    - 在低速和全速设备上是8bit，在高速设备上是32bit。用于在Host和Device设备之间同步时钟，没有实质的通信意义。
- PID：Packet ID
    - 用于标记当前Packet的类型是什么。Packet ID实际上总共只有4bit，因此最多支持16种类型的packet，在具体通信的时候另外4bit是PID的反码，凑成一个8bit的PID字节。

    ![Untitled.png](/images/blog/USB标准包类型总结-1.png)

- ADDR：
    - USB Device的设备地址，长度为7bit，因此USB总线上最多可以支持127个设备。但是0号地址预留给枚举过程中尚未分配地址的设备，因此可用的Device address是126个。
- ENDP：
    - 通信的端点编号。长度为4bit，因此一个设备最多能够支持16个端点，其中的0号端点固定为控制传输端点，所有的控制传输通信都是与端点0进行通信。
- CRC：
    - 这个packet的CRC校验值。所有的Token Packet都使用5bit CRC校验值，所有的Data Packet都使用16bit校验值。

## Token Packet


Token Packet用于指示本次USB通信业务的具体类型和意图。


有3种类型的Token Packet：

- Setup Token：表示本次Host发起的通信业务是一个USB控制传输通信业务，例如读取设备、配置描述符，设置地址等。
- IN Token：表示本次Host发起的通信业务是期望从Device的指定IN端点读取数据；
- OUT Token：表示本次Host发起的通信业务是期望向Device的指定OUT端点写入数据；

Token Packet的格式固定为：


![Untitled.png](/images/blog/USB标准包类型总结-2.png)

- 因此Token Packet中包含的信息主要就是PID、设备地址、端点号。其中的PID在上面的Packet ID表中查询。

## Data Packet


Data Packet用于装载本次USB通信业务的数据负荷。


USB高速设备支持4种类型的Data Packet：Data0，Data1，Data2，MData。


USB高速设备支持的Data Packet中可以容纳的数据长度限制为1024个字节，超过这个限制就需要分为多个Data Packet进行传输。


Data Packet的格式为：


![Untitled.png](/images/blog/USB标准包类型总结-3.png)


## Handshake Packet


Handshake Packet用于向数据发送方提供接收数据的应答信息，是否在通信中发生错误的状态信息等。


有3种类型的Handshake Packet：

- ACK：向发送方应答数据已经成功接收并处理；
- NAK：表示当前端点繁忙，暂时无法处理新的数据；
- STALL：表示当前通信端点出错，需要Host端干预处理；

Handshake Packet的格式为：


![Untitled.png](/images/blog/USB标准包类型总结-4.png)


## SOF Packet


在USB高速总线上每125us由Host发出一个SOF packet：


![Untitled.png](/images/blog/USB标准包类型总结-5.png)


## 参考资料：

- [USB in a NutShell - Chapter 3 - USB Protocols (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb3.shtml#USBPacketTypes)
