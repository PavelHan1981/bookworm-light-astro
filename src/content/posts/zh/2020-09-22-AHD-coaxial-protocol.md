---
title: "AHD模拟摄像头的反向控制协议-CoaxialProtocol"
slug: "2020-09-22-AHD-coaxial-protocol"
description: "本文总结了在AHD摄像头上通过使用同轴线缆对云台等设备进行反向控制的Coaxial协议。"
date: 2020-09-22T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["音视频","AHD"]
draft: false
---


## **缘起**

- 对于控制一个云台摄像头的镜头动作而言，使用IP协议来进行控制是很容易做到的：IP摄像头与控制主机之间可以通过IP协议建立全双工双向通信，云台控制的命令可以很方便的发送到摄像头端，在摄像头端进行镜头的旋转、缩放等控制；
- 但是对于模拟摄像头而言，要轻松的做到这一点就很麻烦了：因为模拟摄像头与DVR之间只有一条同轴电缆提供的模拟视频信号线，通过DVR如何能够简单的发送云台的控制命令呢？
- 传统的做法是：
- 

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-1.png)

- 即：在摄像头和DVR之间增加一个专门用于传输控制信息的Control Line，一般是RS485，这样DVR就可以通过这个Control Line像摄像头发送控制命令。
- 但是这样的方案因为要增加额外的走线，施工和安装上会麻烦很多，与之前已有的走线布局也不兼容。是否还有更方便的方案？

## **直接在同轴线缆上实现反向控制**

- **这种方案不同于以上提供的需要额外增加一根Control Line的方案，而是直接把控制信号耦合到传输模拟视频图像的同轴线缆中，并在摄像头端把这个信号解析出来，从而实现反向控制。**
    - 这样的话，就相当于是使用一根同轴线缆既传输模拟视频信号（CAM--->DVR），也传输反向控制的命令数据信号（DVR--->CAM）。
- Pelco是第一家提供同轴线缆耦合反向控制协议的厂商，该反向控制协议命名为Coaxitron。此后不同的常见也都基于同样的技术实现逻辑创建了自己的反向控制协议，因此一般在DVR上会实现多个版本的Coaxial协议，这样就可以与多个品牌型号的Camera兼容使用。

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-2.png)


## **PELCO Coaxitron Protocol**

- Pelco的Coaxitron协议有两种命令结构版本：
    - 标准协议版本，由一系列15个脉冲组成，在一个视频场的第18行Blanking周期中发出；
    - 扩展协议版本，由一系列32个脉冲组成，其中16个脉冲在第18行Blanking周期中发出，另外16个脉冲在第19行Blanking周期中发出；

## **Nextchip的反控逻辑实现参考**


分为DVR和Camera两个部分：

- DVR采用NVP6158C接收来自Camera的模拟视频图像，以及发出反控指令；反控指令耦合在模拟视频的同轴线缆中发回给Camera端；
- Camera端则采用NVP2470H，与数字CMOS图像图像传感器接口，通过内部ISP处理后进行DA转换为模拟图像，并把模拟图像通过同轴电缆传给DVR；
- **DVR NVP6158C**：NVP6158C中包含了一个Coaxial Communicator的模块，通过写入寄存器就可以控制其向芯片的MPP1-4引脚发出对应的反控指令：

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-3.png)

- **Camera NVP2470H**：NVP2470H也包含一个COAX Comm模块，该芯片的GPIO19实际上就是COAX RX引脚，在使用中配置为COAX工作模式，就可以配合芯片提供的coax_rx_done中断来接收和解析反控数据。

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-4.png)


## **参考资料：**

- [PTZ Camera Coaxial Control（How to set up）](https://learncctv.com/ptz-coaxial-control/)
- NVP6158C Datasheet Release v00 Chapter 4；
- NVP2470H Datasheet；
