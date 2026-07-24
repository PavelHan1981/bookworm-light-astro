---
title: "OBD-II Experts Software Stack学习总结"
slug: "2022-03-11-obdii-experts-stack-summary"
description: "本文是基于对OBD-II Experts Software Stack的官方技术文档进行的学习总结，大致理清楚这个软件栈的使用方式以及OBDII协议能够支持的功能。"
date: 2022-03-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["CAN","OBD","硬件"]
draft: false
---


本文实际上是对参考资料1的内容进行的学习总结。


OBD-II Experts是一个对车辆CAN、J1850等总线上通信的数据进行协议分析的软件组件，支持对目前车辆上应用广泛的OBD-II协议格式数据进行解析。这个软件组件是一个付费开放源代码的付费模式，采用简单的一次性付费模式。

- 购买后可以直接收到整个协议栈的完整源代码，C语言实现，可以方便的移植到用户自己的处理器上。

## 支持的基本功能和协议


该软件模块包含了对以下OBD-II和CAN、J1850、KWP等协议的解析和支持：

- CAN 15765-4
- KWP2000
- ISO 9141
- J1850 PWM
- J1850 VPW

能够支持的主要功能包括：

- VIN：Vehicle Identification Number，每辆车车辆识别码的读取和解析。
- 发动机冷却剂温度读取，实际上就是水温表上的显示温度。
- 发动机转速读取，可以用于判断发送机是否正在运行。
- MIL：Malfunction Indicator Lamp，故障灯显示状态读取和解析。
    - OBD-II协议中定义了很多种故障调试代码，根据读取到的MIL可以判断当前车辆的故障状态；
- 车辆速度读取。
- 油箱剩余油量读取。

**注意：以上所有的功能均有一定的车辆兼容性的问题，即在某些车辆上可以支持，在某些车辆上不支持。总的情况是生产年份越新的车辆支持的可能性越大。**


## 车辆对于OBD接口和协议的支持情况


**OBDII规范指定了5种不同的电气协议用于支持对车辆内部OBD II信息的访问，车厂可以选择其中一种协议来进行实现（这就是为什么OBD的J1962端子上要包含那么多pin的原因，因为需要把各种电气协议的接口都要能够支持）。**从2008年开始，基于CAN总线的ISO15765逐渐成为强制标准，所以2008年以后生产的车辆基本上都是使用CAN总线的ISO15765协议来实现OBD II信息的读取。


对于2008年之前的车辆，不同的车厂采用自己选择的电气接口和协议：


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-1.png)


车辆上的OBD接口遵守J1962规范（也就是说所谓的OBD接口实际上就是一个16pin的J1962端子）：


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-2.png)

- pin2和pin10用于J1850 PWM协议；
- 只使用pin2通信的话，就是GM J1850 VOW协议；
- pin7和pin15用于ISO 9141-2和ISO 14230（KWP2000）通信；
    - pin7就是所谓的K-Line，pin15就是所谓的L-Line；
- pin6和pin14是CAN接口（ISO15765-4协议）；
- pin16是蓄电池电源，pin4和pin5是底盘和信号地。

## 软件架构图


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-3.png)

- 从上图可以看到，这个OBDII Experts实际上不止支持目前车辆上使用比较广泛的CAN总线，还支持老式的或者更小众的J1850、J1939、PWM总线和KWP协议等。以此来尽可能提升本协议栈对所支持功能的兼容性。
- 应用软件的实现上，可以直接调用OBD API来访问自己需要的数据。
- 底层与硬件和接口方面的连接，则需要根据车型所使用的的OBD电气接口和协议进行连接以后，才能保证读取到正确的数据。

## 是否可以基于OBDII实现对车辆的反控？


下面的截图（来源于参考资料1）说的比较清楚了：


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-4.png)


总结起来也就是说，OBDII协议作为一个调试状态接口，并不包含有车辆反控的功能。但是OBD接口本身是连接到车辆的内部通信网络中，所以有可能利用OBD接口上的某个总线，发送某些数据后实现想要的控制。但是实际上，对车辆反控的通信协议，在各个车厂都是严格保密的，即使暴力破解协议也存在法律上的风险问题。此外，不同车辆的控制协议也是不同的。因此，在一辆车上能用的控制协议，放在另外一辆车上很有可能就无法使用了，兼容性非常差。


## 参考资料：

1. [OBD II Software | Ready-To-Use Protocol Stack & Source Code (obdexperts.co.uk)](https://www.obdexperts.co.uk/software/#1448366943815-e26d41b9-11c9)
