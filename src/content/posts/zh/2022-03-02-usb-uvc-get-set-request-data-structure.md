---
title: "USB UVC协议SET/GET Request结构解析"
slug: "2022-03-02-usb-uvc-get-set-request-data-structure"
description: "本文基于对UVC协议第四部分的学习，整理出来UVC Set/Get请求的数据结构，及其每个Field的解析和说明。"
date: 2022-03-02T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["USB","UVC"]
draft: false
---


本文主要是在对UVC 1.5协议第四章Class-Specific Requests学习的基础上，整理出来的UVC SET和GET请求的数据结构，方便对UVC通信协议的实现过程进行完整的理解。


## UVC Class Specific Request的通信流程


实际上UVC class specific request都是在端点0上进行的控制类传输（Control Transfer），按照Control Transfer的规范定义，这些请求主要包含由三个阶段组成：Setup Stage、Data Stage和Status Stage。而每个命令选项的SET和GET Request实际上也包含了以上三个阶段，都是从Host发出一个Setup Packet开始的：


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-1.png)


对于Set类请求而言（例如上图的SET_CUR），完整的通信流程是：

- Host先发出一个Setup Packet，其中包含有要设置的选项的定位信息、选项类型、设置数据长度（对于每一个选项而言，数据长度都是确定的，具体的数据在Data Packet中传输）等；
- 然后Host继续发出一个Data Packet，其中包含有具体的设置数据；
- 如果Device能够在10ms之内返回状态信息，就给Host直接在控制传输的Status Stage直接返回状态；如果大于10ms，则需要通过接口注册的中断端点向Host返回状态信息；

而对于Get类请求而言（例如上图的GET_CUR），完整的通信流程是：

- Host先发出一个Setup Packet，其中包含有要读取的选项的定位信息、选项类型、读取数据长度（对于每一个选项而言，数据长度都是确定的，具体的数据在Data Packet中传输）等；
- Device收到以后，会向Host发回一个Data Packet，其中包含有具体的选项数据读取；
- 最后Device继续在控制传输的Status Stage向Host返回状态包；

关于控制传输和Setup packet的内容可以参考：

- [USB传输类型之Control Transfer](https://www.pavelhan.tech/2022-03-01-usb-control-transfer)
- [USB控制传输中的Setup Packet](https://www.pavelhan.tech/2022-02-25-usb-setup-packet)

## 相关术语

- Control Selector：实际上就是要设置或者读取的具体选项类型。
- Entity：通信的目的实体，可以是一个接口Interface，也可以是接口中的一个单元Unit。一个Entity中可能有1个或者多个选项（Control Selector）可以存取。

## UVC class specific request的总体数据结构


UVC class specific request总体上可以分为两类：Set类请求和Get类请求。前者用于设置UVC camera中的运行参数；后者则用户读取当前运行参数、参数的设置范围、默认值等。


### Set Request


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-2.png)

- bmRequestType：
    - bit7为0表示这个这个Packet是由Host发给Device；
    - bit6..5为0b01表示这个setup packet是一个class级别的包；
    - bit4..0：为1表示这个setup packet是要发给接口，为2则是要发给端点；具体要看这个设置命令在协议中是如何定义的；
- bRequest：
    - 在UVC规范的Table A.8中有定义，因此此处的SET_CUR对应的就是0x01；

![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-3.png)

- wIndex和wValue配合起来用于定位本次Set请求是要发送到哪个接口/Unit/端点上，要设置具体的选项是什么；
    - 一般在wValue的高字节中传递要设置的选项的类型；如果通信目的的Entity有多个设置选项的话，使用wValue来定位是要设置哪个选项；如果Entity只有一个选项，可以把这个wValue用于传递其他的参数；
    - wIndex的低字节用于指定通信目的的接口编号或者端点地址，高字节用于指定要设置的Entity/Unit的编号或者0；
        - UVC Device收到的UVC Set/Get Request是发给Video Control interfac还是发给Video Streaming Interface的，就是由wIndex的低8位来决定。wIndex的低8位在此处就对应于Interface Index，与USB枚举信息中定义的两个接口的Index number相一致；
    - 所以结合wIndex和wValue就可以定位这个命令是要发送到什么地方，设置什么选项；
- wLength：Data Stage的数据长度，每个要设置的选项参数长度不同
- Data：具体的设置数据，包含在Data Packet中。Setup Packet只包含前面的5个field；

### Get Request


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-4.png)

- bmRequestType：与Set Request相同，区别是bit7为1，表示本次通信的Data Stage是要从Device端读取；
- bRequest：在UVC规范的Table A.8中有定义
- wIndex和wValue的定义与Set Request相同
- wLength：Data Stage的数据长度，每个要读取的选项参数长度不同
- Data：具体的读取数据，包含在Data Packet中。Setup Packet只包含前面的5个field；

## VideoControl Requests


对于Video Control Interface的Request而言，包含两类请求：接口级别的Interface Control Requests，和端子/单元级别的Unit and Terminal Control Requests。


### Interface Control Requests


这类命令是直接发给Video Control Interface，直接由interface来进行处理的：


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-5.png)

- wValue指定要设置的接口选项的id，video control interface支持的接口级别的选项只有两个：Power Mode Control和Request Error Code Control，分别对应CS=0和CS=1；
- wIndex设置为Video Control Interface的接口编号；
- 其他Field与通用的Set Request和Get Request中的描述保持一致

### Unit and Terminal Control Requests


这类命令是发给Video Control Interface下面的端子Terminal和各个单元Unit的，每个端子和单元所能支持的选项各自不同。


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-6.png)

- wValue指定要设置的选项id，Video Control Interface中包含的各个Terminal和Unit所支持的选项数量众多，通过这个CS（Control Selector）来区分是要对哪个选项进行操作；
    - ALL类型的request因为对整个Unit或者Terminal中包含的所有选项进行操作，所以直接设置wValue为0；
- wIndex指定要是这的Unit和Terminal的索引编号，在UVC的配置描述符中进行定义；
- 其他Field与通用的Set Request和Get Request中的描述保持一致

## VideoStreaming Requests


因为Video Streaming Interface没有Unit和Terminal的概念，所以所有的请求命令都是直接发给interface级别来直接进行处理的。


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-7.png)

- wValue指定要存取的接口选项id，UVC device通过这个id来分析这个命令要访问的Video Streaming Interface的选项是什么；
- wIndex设置Video Streaming Interface的接口编号；
- 其他Field与通用的Set Request和Get Request中的描述保持一致

## 参考文档：

- USB Device Class Definition for Video Devices V1.5：4 Class-Specific Requests
