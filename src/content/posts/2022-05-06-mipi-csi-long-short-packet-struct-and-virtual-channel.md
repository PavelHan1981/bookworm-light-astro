---
title: "MIPI CSI接口的长短包结构与虚拟通道的概念"
slug: "2022-05-06-mipi-csi-long-short-packet-struct-and-virtual-channel"
description: "本文基于对参考文档的学习，整理了image sensor常用的MIPI CSI接口传输的长包和短包的数据结构，以及虚拟通道的概念。"
date: 2022-05-06T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["硬件","Image Sensor"]
draft: false
---


MIPI协议层在进行数据发送的时候，以数据包为单位进行通信。根据传输数据类型的不同，又可以分为长包和短包两种形式。其中长包用于传输图像数据，短包则用于传输同步信号、图像数据格式描述信息等数据。


MIPI协议层在进行数据通信的时候，无法发送的是长包还是短包，都是以SOT（Start Of Transmission）信号开始，以EOT（End Of Transmission）信号结束。


![Untitled.png](/images/blog/MIPI-CSI接口的长短包结构与虚拟通道的概念-1.png)

- 长短包数据传输的间隙是LPS状态，这个时候MIPI进入低功耗模式，不进行数据传输。

## 长短包的数据类型Data Type


在MIPI上传输的长包和短包的包头结构中，都包含有一个Data ID的filed用于定义这个包里面传输的数据类型究竟是什么。


在Data ID中所包含的Data Type Subfield长度为6个bit，因此取值范围为0x00-0x3F。


![Untitled.png](/images/blog/MIPI-CSI接口的长短包结构与虚拟通道的概念-2.png)


在这些数据类型中，比较常用的是：

- 0x00-0x07：表示该短包用于传输行同步和帧同步信息；

    ![Untitled.png](/images/blog/MIPI-CSI接口的长短包结构与虚拟通道的概念-3.png)

    - 因为一个长包通常就包含有一行图像数据，因此上面的行同步信息是可选的。
- 0x18-0x1F：表示该长包中包含的数据是YUV格式的图像数据，一般用于直接输出YUV数据的图像传感器；
- 0x20-0x27：表示该长包中包含的数据是RGB格式的图像数据，一般用于直接输出RGB数据的图像传感器；
- 0x28-0x2F：表示该长包中包含的数据是Bayer Raw Data格式的图像数据；

## MIPI协议层的短包结构


![Untitled.png](/images/blog/MIPI-CSI接口的长短包结构与虚拟通道的概念-4.png)


短包长度固定为四个字节：

- 首先是1个自己的DATA ID：
    - VC部分：其中的bit 7:6为虚拟通道的低2bit，虚拟通道的概念在下面继续总结；
    - DT部分：bit 5:0表示当前包的数据格式类型。
- 然后是2字节长度的短包数据field，也就是这个短包中包含的数据内容，由接收端收到以后进行解析；
- 最后是1个字节长度的校验字节：
    - VCX部分：其中的bit 7:6为虚拟通道的高2bit，虚拟通道的概念在下面继续总结；
    - ECC部分：bit 5:0为纠错码，能够实现对前面包头数据的1bit错误纠正，以及对2bit错误检测；

## MIPI协议层的长包结构


![Untitled.png](/images/blog/MIPI-CSI接口的长短包结构与虚拟通道的概念-5.png)


长包的长度是可变的，其数据负荷由其中的word count field来指定，但是其包头部分是固定的4个字节：

- 首先是1个自己的DATA ID，与短包结构定义的DATA ID相同；
- 然后是2字节长度的Word Count Field，表示数据负荷部分的字节长度；
- 然后是1个字节长度的包头校验字节，与短包结构定义的包头校验字节相同；
- 然后就是数据负荷部分，数据长度由Word Count Field指定；
- 最后是两个字节长度的CRC校验部分，提供对对整包数据的CRC校验值。

## 虚拟通道


为什么在MIPI CSI接口上要提供虚拟通道的概念？


原因是MIPI CSI接口的设计上，可以支持使用一个MIPI接口同时传输多路独立的图像流。例如，可以使用一片FPGA把多路图像经过转换后，通过一组MIPI接口传输给应用处理器，那么在同时传输的时候，如何对多路图像数据区分呢？也就是说，对于MIPI的接收端而言，在收到一包数据的时候，如何判定这包数据是哪一路图像的数据？


这里就要用到虚拟通道的概念。所谓的虚拟通道，实际上就是在长短包的packet header中所包含的Virtual Channel信息。对于MIPI CSI接口所使用的D PHY而言，最多可以支持16个虚拟通道，对应到Packet Header中，也就是4个bit，其中高2bit来自于校验字节的VCX Field，低2bit则来自于Data ID中的VC Field。


在这种情况下，不同路的图像数据，可以对Packet Header的Virtual Channel的4个bit设置不同的值，MIPI接口的接收到对这个Virtual Channel进行解析，就可以知道它接收到的每一包数据属于哪一路图像。


实际上，在一个MIPI CSI接口上同时传输多路独立的图像流在应用中并不是很常见。虚拟通道更常用的场景是配合实现Image Sensor的HDR功能。Image Sensor的HDR功能的实现，一般是通过对图像进行多次不同长短的曝光时间进行曝光，然后用MIPI接口把多次曝光的图像发送给ISP，在ISP上对多次曝光的图像进行合并处理来实现高动态范围的效果。在MIPI接口上同时传输多次不同曝光的图像，就需要用到virtual channel来对不同曝光的图像进行区分，这样ISP才能知道收到的每一包数据对应的是长曝光图像还是短曝光图像。


以SmartSens的SC450AI Sensor为例。该Sensor可以支持Stagger HDR模式，使用MIPI的Virtual Channel对多次曝光的图像进行区分：


![Untitled.png](/images/blog/MIPI-CSI接口的长短包结构与虚拟通道的概念-6.png)


## 参考资料：

- [深入浅出MIPI CSI|极客笔记 (deepinout.com)](https://deepinout.com/camera-terms/easy-to-understand-mipi-csi.html)
