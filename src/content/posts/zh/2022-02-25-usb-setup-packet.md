---
title: "USB控制传输中的Setup Packet"
slug: "2022-02-25-usb-setup-packet"
description: "本文总结了USB标准定义的通用包中Setup Packet的结构和分类。"
date: 2022-02-25T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["硬件","USB"]
draft: false
---


Setup Packet一般用于Host对Device进行的检测、配置，和执行特定的控制功能，例如设置USB的device address，读取device端的USB描述符、检查端点的状态等。除了以上标准的操作命令的处理以外，某些USB Class Driver也使用Setup Packet进行一些Class类型的控制操作，最典型的：UVC设备就是通过Setup Packet来对UVC摄像头的内部工作参数（亮度、对比度等）进行SET和GET操作。


所有的USB设备都必须要在端点0上响应Host发出的Setup Packet。


## Setup Packet的结构


Setup Packet是固定的8字节长度，包含有5个Field：


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-1.png)

- bmRequestType：长度为1字节。用于定义这个Setup Packet的数据传输方向（从Host流出还是流入）、类型（标准/usb class/厂商自定义）和接收处理对象（设备、接口还是端点）；
- bRequest、wValue和wIndex三个Field根据不同的命令类型的定义各有不同；
- wLength：如有setup packet后面还有一个data stage的话，在此指定data stage的数据长度；

## 标准Setup Packet


### 标准设备请求包


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-2.png)


### 标准接口请求


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-3.png)


### 标准端点请求包


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-4.png)


## Class类型的Setup Packet


如上所述，bmRequestType的D6..5为0b01的时候，表示这个Setup Packet是一个Class类型的Setup Packet。在不同的USB Class中队Setup Packet各个field的定义不同。


以下为UVC 1.5规范“4.1 Request Layout”所描述的UVC SET与GET请求中定义的Setup Packet结构：


SET请求结构：


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-5.png)


GET请求结构：


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-6.png)


UVC协议是使用控制传输来实现对UVC camera进行控制命令和状态参数的读取，控制传输的第一个阶段就是Host发出一个Setup Packet，Host就通过这个Setup Packet来指定命令的目的地、具体的命令类型和后面第二个阶段的Data Packet中包含的数据长度。


## 参考资料：

- [USB in a NutShell - Chapter 6 - USB Requests (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb6.shtml#SetupPacket)
- UVC 1.5 specification, 4.1 Request Layout
