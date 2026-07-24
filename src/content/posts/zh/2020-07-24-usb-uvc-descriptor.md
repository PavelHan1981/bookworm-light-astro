---
title: "USB复合设备及UVC Profile的描述符详解"
slug: "2020-07-24-usb-uvc-descriptor"
description: "在本文中简要的总结了USB Composite设备尤其是UVC Camera设备的USB描述符的结构。"
date: 2020-07-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["USB","UVC"]
draft: false
---


## **USB Composite Device**


所谓的USB composite device就是一个USB设备中包含有多项功能，每项功能的具体实现都包含一个或者多个相互独立的Interface，但是整个设备只有一个PID和VID。多个设备功能通过内部逻辑和接口组合的形式形成一个对外的设备。


USB Composite device可以分为两种情况：

- 该设备中的每个单独的功能function的实现都只用到一个Interface
    - 就是所谓的Composite device without multi-interface functions，例如：HID Transfer + MSC、 HID Transfer + HID Keyboard和HID Mouse + HID Keyboard；
    - 在这种情况下需要设置这个USB设备的设备描述符bDeviceClass、bDeviceSubClass、bDeviceProtocol这三个参数为0x00、0x00、0x00；
    - 这个设备的配置描述符中通过bNumInterfaces参数指定内部有多少个接口；
    - 然后在每个接口的接口描述符中通过bInterfaceClass、bInterfaceSubclass、bInterfaceProtocol三个参数指定这个接口提供的USB function的类型usb class；
- 该设备中的某项单独功能需要用到多个Interface的组合
    - 就是所谓的Composite device with multi-interface function，例如：VCOM + HID Transfer、VCOM + MSC、VCOM + HID Keyboard、Dual VCOM和Audio + HID Transfer。
    - 这种情况下需要使用IAD描述符把multi interface功能的多个接口组合在一起，此时就要设置这个USB设备的设备描述符bDeviceClass、bDeviceSubClass、bDeviceProtocol这三个参数为0xEF、0x02、0x01。

**USB Composite Device和USB Compound Device的区别**:

- USB Composite Device是一个USB设备，只有一个PID和VID，但是这个设备里面包含了多个功能，在内部逻辑上通过多个接口Interface来分别实现这些功能；
- USB Compound Device内部包含一个USB Hub和多个USB功能设备，这些设备通过内部Hub与外部的USB Host进行连接，每个USB设备都有自己的PID和VID，相当于每个设备都是一个独立的外设，因此一个USB Compound Device包含多组PID/VID；
- 在USB2.0的规范中定义如下：
    - When multiple functions are combined with a hub in a single package, they are referred to as a compound device.
    - A device that has multiple interfaces controlled independently of each other is referred to as a composite device.

## **IAD描述符**


USB的IAD描述符用于把一个USB设备中包含的多个interface合并为一个function提供出来。

- 因此可以把IAD描述符看成是对多个interface的分组操作，把多个interface分成一组来对外提供一个完整的功能function。

对于IAD设备而言，在这个USB设备的设备描述符中需要按照以下规则设置bDeviceClass、bDeviceSubClass、bDeviceProtocol等参数，USB Host才能够正确的识别和解析这个IAD设备后续的配置描述符信息：

- bDeviceClass：0xEF
- bDeviceSubClass：0x02b
- DeviceProtocol：0x01。

而这个IAD描述符所指定的Function功能即USB class则通过IAD描述符中的bFunctionClass、bFunctionSubClass、bFunctionProtocol这三个参数进行指定，例如如果这个IAD描述符定义的是一个USB Video class的function，需要按照如下参数设置IAD描述符的相关信息：

- bFunctionClass： 0x0E
- bFunctionSubClass： 0x03
- bFunctionProtocol： 0x00

IAD描述符各个选项参数的定义：


![Untitled.png](/images/blog/USB复合设备及UVC-Profile的描述符详解-1.png)

- bFirstInterface表示这个IAD描述符所使用的第一个Interface的编号
- bInterfaceCount表示这个IAD描述符需要包含的interface数量
- bFunctionClass、bFunctionSubClass和bFunctionProtocol定义的是这个描述符所实现的是USB哪个class的功能；

在USB规范中定义需要使用IAD描述符的USB device class主要有：

- USB Video Class Specification（class code=0x0E）
- USB Audio Class Specification（class code=0x01）
- USB Bluetooth Class Specification（class code=0xE0）

注意：

- IAD描述符中指定使用的多个Interface的编号必须要是连续的，即这个IAD下面的Interface Group的各个Interface的编号必须是连续的；
- 一个Composite USB设备中可以包含由多个IAD描述符，只需要使用IAD描述符中的接口配置信息定义清楚这个IAD功能所占用的接口，并且每个IAD描述符必须位于它所包含的多个接口描述符之前；

## **UVC设备的接口与IAD描述符**


所有的UVC设备都是多Interface设备，一个UVC设备最起码应该有两个Interface：VideoControl（VC）Interface和VideoStream(VS) Interface。 Spec明确要求一个具有可用的，具有实际UVC功能的设备要有一个VC Interface，一个或多个VS Interface。

- VCInterface用于进行配置，操控，设置UVC设备进入不同的功能状态；
- VSInterface则负责定义这个UVC设备所支持的各种视频流的格式以及视频数据流的传输；
- 完整的UVC功能需依赖VS Interface和VC Interface的配合才能实现。

因为UVC设备是需要把两个接口（VS+VC）结合在一起来提供音视频传输与控制的服务，因此UVC的Spec还明确要求UVC设备必须要使用一个Interface Association Descriptor（IAD）来描述这个包含了VC和VS的Interfaces集合。

- 在UVC的设备描述符中，也需要设置这个设备DeviceClass、Device Subclass以及Device Protocol为IAD设备；

## **Video Control Interface**


Video Control Interface中包含的主要组件：

- Input Terminal：描述这个设备的输入端，及其支持的功能；
- Output Terminal：描述这个设备的输出端，及其支持的功能；
- Camera Terminal：描述这个设备的相机功能，例如Focus、Zoom等功能；
- Select Unit：实际上就是Mux复用组件；
- Processing Unit：描述这个设备的图像处理功能，例如灰度、曝光、亮度控制的功能；
- Extension Unit：描述这个设备支持的额外扩展性功能，可有可无；

一个Video Control Interface的例子：


![Untitled.png](/images/blog/USB复合设备及UVC-Profile的描述符详解-2.png)


因此实际上Video Control Interface就是把上面的多种类型的Terminal和Unit连接起来组成的一个提供音视频流处理的pipeline，最终通过Output Terminal对外提供音视频流数据。


USB Host对UVC camera发送的所有控制类型的命令都是通过这个interface来完成的。


## **Video Streaming Interface**


Video Streaming Interface则专门负责用于传输UVC设备的Video数据到Host端。


一个UVC camera通常会支持多种不同的Format不同分辨率和帧率的图像传输格式，需要在Video Streaming Interface的接口描述中把支持的所有视频格式使用Video Streaming Frame Type描述符进行定义。

- 不同编码格式、分辨率、帧率对于USB传输带宽的要求各不相同，目前能够支持的主要的编码格式是YUV、MJPEG和H.264；
- 要能够支持高清高帧率图像的UVC传输，就只能使用MJPEG和H.264这类压缩数据格式；

每个Video Streaming Interface必须要包含一个ISO或者Bulk端点用于传输Video Streaming数据，以及一个可选的Bulk端点用于传输静态图片数据（在UVC Camera中已经实现了静态图片拍照的机制的前提下）。


## **一个USB接口UVC Camera+HID设备的例子**


参考资料USB Interface Association Descriptor中提供了一个包含有UVC Camera和HID功能的USB设备的例子。


该设备具有两部分功能：

- Video Class，即UVC功能
    - 该功能由一个IAD描述符定义，其中包含一个Video Control Interface（即Interface 0）和一个Video Streaming Interface（即Interface 1）；
    - USB Host端解析到这个IAD描述及其下面的VC和VS Interface描述符后，会加载video class driver进行处理。
- HID功能
    - 该功能包含有一个实现HID功能的Interface（即Interface 2）；
    - USB Host解析该接口对应的描述符会后自动加载Host端的HID class driver来进行处理；

该设备的USB描述符结构：


**设备描述符**


```plain text
BYTE  bLength      0x12
BYTE  bDescriptorType    0x01
WORD  bcdUSB      0x0200
BYTE  bDeviceClass     0xEF
BYTE  bDeviceSubClass   0x02
BYTE  bDeviceProtocol    0x01
BYTE  bMaxPacketSize0   0x40
WORD  idVendor      0x045E
WORD  idProduct      0xFFFF
WORD  bcdDevice     0x0100
BYTE  iManufacturer     0x01
WORD  iProduct      0x02
WORD  iSerialNumber    0x02
BYTE  bNumConfigurations  0x01
```

- 表示这是一个包含有IAD描述符的multi function composite USB device；

**配置描述符**


```plain text
BYTE  bLength      0x09
BYTE  bDescriptorType    0x02
WORD  wTotalLength    0x....
BYTE  bNumInterfaces    0x03
BYTE  bConfigurationValue  0x01
BYTE  iConfiguration     0x01
BYTE  bmAttributes     0x80 (BUS Powered)
BYTE  bMaxPower     0x19 (50 mA)
```

- bNumInterfaces为其内部包含的USB接口数量，其中UVC功能通过IAD描述符包含有2个Interafce，HID包含一个Interface；

**IAD描述符**


```plain text
BYTE  bLength      0x08
BYTE  bDescriptorType    0x0B
BYTE  bFirstInterface    0x00
BYTE  bInterfaceCount    0x02
BYTE  bFunctionClass    0x0E
BYTE  bFunctionSubClass   0x03
BYTE  bFunctionProtocol   0x00
BYTE  iFunction      0x04
```

- bInterfaceCount表示这个IAD描述符需要包含的interface数量，这里是2个，也就是Video Control Interafce和Video Streaming Interface；
- bFirstInterface表示这个IAD描述符所使用的第一个Interface的编号，这里是0，也就是说这个IAD用的两个Interface就是：Interface0和Interface1；
- 后续的bFunctionClass、bFunctionSubClass和bFunctionProtocol定义了这是一个Video class的功能；

**Video Control Interface描述符**


```plain text
BYTE  bLength      0x09
BYTE  bDescriptorType    0x04
BYTE  bInterfaceNumber   0x00    接口编号为0
BYTE  bAlternateSetting   0x00
BYTE  bNumEndpoints    0x01    这个接口使用一个通信端点
BYTE  bInterfaceClass    0x0E
BYTE  bInterfaceSubClass   0x01
BYTE  bInterfaceProtocol   0x00
BYTE  iInterface      0x05
```

- *******此后是Video Control Interface的内部描述信息（即这个VC Interface中包含的各个Terminal和Unit的组织情况）及这个接口的端点信息描述符；*******

**Video Streaming Interface描述符**


```plain text
BYTE  bLength      0x09
BYTE  bDescriptorType    0x04
BYTE  bInterfaceNumber   0x01    接口编号为1
BYTE  bAlternateSetting   0x00
BYTE  bNumEndpoints    0x01    这个接口使用1个通信端点
BYTE  bInterfaceClass    0x0E
BYTE  bInterfaceSubClass   0x02
BYTE  bInterfaceProtocol   0x00
BYTE  iInterface      0x06
```


**此后是Video Streaming Interface的内部描述信息（即这个VS Interface中包含的各种Video Format的详细信息列表）及这个接口的端点信息描述符；**


**HID功能对应的Interface描述符**


```plain text
BYTE  bLength      0x09
BYTE  bDescriptorType    0x04
BYTE  bInterfaceNumber   0x02    对应的Interface编号为2
BYTE  bAlternateSetting   0x00
BYTE  bNumEndpoints    0x01    这个interface使用一个通信端点
BYTE  bInterfaceClass    0x03    通过Interface配置信息标注这是一个HID设备功能
BYTE  bInterfaceSubClass   0x01
BYTE  bInterfaceProtocol   0x01
BYTE  iInterface      0x07
```


**最后是HID功能接口的详细配置信息及其对应的端点描述符信息；**


## **参考资料**

- [UVC（USB Video Class）协议讲解](https://blog.csdn.net/LinuxWorking/article/details/78419631?utm_source=blogxgwz9)
- [USB Video Class 簡介](http://pollos-blog.blogspot.com/2014/10/usb-video-class.html)
- [USB Interface Association Descriptor](https://docs.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-interface-association-descriptor)
