---
title: "Image Sensor的MIPI CSI接口学习笔记"
slug: "2022-04-29-image-sensor-mipi-csi-interface"
description: "本文总结了Image Sensor常用的MIPI CSI接口在硬件连接和软件层面上进行图像数据传输的基础知识。"
date: 2022-04-29T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["Image Sensor","硬件"]
draft: false
---


## MIPI CSI接口及其连接基础


MIPI CSI是用于实现对image sensor和AP（Application Processor）或者ISP处理器之间，进行Image Sensor采集的图像数据进行传输的标准接口。


下图是一个典型的MIPI CSI接口的image sensor与AP之间的连接框图：


![Untitled.png](/images/blog/Image-Sensor的MIPI-CSI接口学习笔记-1.png)

- image sensor与AP之间的数据使用CSI Transmitter和Receiver来进行传输，使用差分串行的方式，一般包含一组差分Clock Lane和1组、2组、3组或者4组Data Lane；
- image sensor与AP之间不需要pixel clk、HD或者VD这类图像同步接口，这类控制信息通过CSI协议中定义的short packet来进行传输，AP在收到数据后解析可以得到行场同步信息；
- image sensor的寄存器设置仍然通过I2C或者SPI这类控制接口来进行设置；

## MIPI CSI的分层结构


MIPI CSI标准的定义上，实际上是一个如下定义的分层结构：


![Untitled.png](/images/blog/Image-Sensor的MIPI-CSI接口学习笔记-2.png)


### **Application Layer**


Application Layer用于把image sensor中的pixel data按照协议的要求进行封装。因为CSI接口是一个基于字节流进行传输和接口，最小的传输单位就是一个字节，对于Raw8和JPEG8这种类型的数据而言，可以直接把每个pixel data直接打包传输即可，但是对于像Raw10、Raw12、YUV422、RGB565等这类非8bit对其的数据而言，就需要按照规则把各个pixel data进行组织：

- YUV422 ：CB0Y0CR0 Y1 CB2Y2CR2 Y3 CB4Y4CR4 ………
- RGB565：{G[4:2], B[7:3]}, {R[7:3], G[7:5]} ………
- RGB555：{G[4:3],1’B0, B[7:3]}, {R[7:3], G[7:5]} ………
- RGB444：{G[4],2’B10, B[7:4], 1’B1}, {R[7:4], 1’B1, G[7:5]} ………
- Raw10 ：D0[9:2],D1[9:2],D2[9:2] D3[9:2], {D3[1:0],D2[1:0],D1[1:0] ,D0[1:0]}, D4[9:2],D5[9:2],D6[9:2],D7[9:2], D7[1:0],D6[1:0],D5[1:0] ,D4[1:0]} ……….. ………

### **Protocol Layer**


Protocol Layer使用长包long packet（用来发送pixel data数据）和短包short pakcte（用来发送命令和同步信息）的组合来实现Streaming Data的同步传输。

- 长包格式：一个长包由32位（4Byte）的包头，N字节的数据域，和16位的CRC构成，基本上就是一个固定字节的包头+可变长度的data field以及校验域的TLV结构；
- 短包格式：短包只包含一个32位（4Byte）包头；在包头中使用不同的cmd type来表示不同的数据命令类型。
- 包头格式：包头由8位数据标志符+16位计数值+8位ECC构成；

Protocol Layer的那些缩写定义：

- SoT：Start of Transmission；EoT：End of Transmission。
    - 无论是短包还是长包的传输，都用一个SoT序列表示传输的开始，用EoT序列表示传输的结束。
- FS：Frame Start；FE：Frame End。
    - FS表示一帧图像开始传输，FE则表示这帧图像结束传输。
- LS：Line Start；LE：Line End。
    - LS表示一行图像开始传输，LE表示这行图像结束传输。
- PH：Packet Header；PF：Packet Footer+Filler。
    - 在MIPI上传输的Pixel data使用Packet进行打包，每个包传输之前有一个PH序列，这个包传输完之后有一个PF序列。
- LPS：Low Power State。
    - 当MIPI上暂无数据需要传输的时候，进入低功耗LPS状态。

FS、FE、LS、LE这种同步的包都属于短包，而整帧图像的像素曝光数据则需要封装在Packet中，前加PH，后加PF，在长包中通过MIPI传输出去。


在MIPI上传输的各个传输包之间使用EOT-LPS-SOT序列隔开。


例如下面是一个VD同步也就是帧同步的传输示例：


![Untitled.png](/images/blog/Image-Sensor的MIPI-CSI接口学习笔记-3.png)

- 首先是一个FE也就是frame end short packet，表示前一帧传输结束；
- 然后是一个FS也就是frame start short packet，表示新的一帧数据开始传输；
- 此后就是有很多个pixel data long packet，用于传输所有的像素曝光数据；
- 可以看到，所有的short和long packet都使用EOT-LPS-SOT序列隔开；

下面是一个HD同步的传输示例：


![Untitled.png](/images/blog/Image-Sensor的MIPI-CSI接口学习笔记-4.png)

- 首先是一个LE也就是Line End short packet，表示前一行传输结束；
- 然后是一个LS也就是Line Start short packet，表示新的一行开始传输；
- 然后是一个data long packet，表示这行Pixel data的曝光数据；
- 所有的short和long packet都使用EOT-LPS-SOT序列隔开；

对于image sensor streaming data传输所必须要的HD和VD信号而言，使用short packet来实现：

- 帧同步短包（FS，FE）：每帧图象必须开始于帧开始包(FRAME START PACKET)，结束于帧结束包（FRAME END PACKET）；
- **行同步短包（LS，LE）是可选的：对于RGB、YUV、RAW数据格式，每个数据长包里面必须包含一整行图象数据，接收端收到的每一个data long packet就表示一行pixel data，所以不需要使用LS和LE来标示行的开始和结束。**

### **Lane Management Layer**


Lane管理层根据物理层lane的连接和配置情况，把Protocol Layer的数据分配搭到不同的lane上进行传输，与物理层接口的传输情况对应起来。相应的，接收端的lane management layer也是使用相同的规则把多个data lane上的数据重新组合起来。


![Untitled.png](/images/blog/Image-Sensor的MIPI-CSI接口学习笔记-5.png)


### **PHY Layer---D-PHY**


对于MIPI CSI的物理层而言，目前应用比较普遍的规范是D-PHY，实际上MIPI用于与显示器件接口的DSI规范所使用的物理层也是D-PHY，也就是说CSI和DSI接口的物理层是完全一样的。


D-PHY种的PHY是物理层（Physical）的意思，那么D是什么意思呢？在MIPI D-PHY的文档中有提到过，D-PHY的最初版本的设计目标是500Mbits/s，而D是罗马数字（拉丁文数字）中500 。同理C和M分别是罗马数字中的100和1000，也就是C-PHY和M-PHY中C和M的意思了。


![Untitled.png](/images/blog/Image-Sensor的MIPI-CSI接口学习笔记-6.png)


MIPI D-PHY协议定义了两种传输模式：高速模式（High Speed，HS）和低功耗模式（Low Power，LP），两种模式使用不同的传输电平和传输机制。其中，HS模式下，为差分信号传输，信号电平在100mV~300mV（200mV的压摆）；LP模式下，为单端信号传输，信号电平在0~1.2V（1.2V压摆）。HS模式下，信号传输速度可达80Mbps~1Gbps（v1.0）或80Mbps~1.5Gbps（v1.1），采用源同步的传输方式，由主机（Master）设备向从机（Slave）设备提供DDR时钟。LP模式下，信号传输速度为10Mbps，此时传输通道的差分线（HS模式下的）是两根独立的信号线。无论是HS模式还是LP模式，都采用LSB fisrt，MSB last的传输方式。


因为单个lane的传输带宽最高可以达到1.5Gbps，对于目前应用最为广泛的CSI-2标准而言，最高可以支持4个data lane，因此最高可以实现6Gbps的传输带宽。


## **参考资料：**

- [http://blog.csdn.net/liwei16611/article/details/68146912](http://blog.csdn.net/liwei16611/article/details/68146912)
- [http://blog.chinaaet.com/justlxy/p/5100052466](http://blog.chinaaet.com/justlxy/p/5100052466)
- [http://www.electronicdesign.com/communications/understanding-mipi-alliance-interface-specifications](http://www.electronicdesign.com/communications/understanding-mipi-alliance-interface-specifications)
- [https://wenku.baidu.com/view/980521c25901020206409ca3.html](https://wenku.baidu.com/view/980521c25901020206409ca3.html)
