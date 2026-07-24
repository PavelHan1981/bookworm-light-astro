---
title: "WiFi中的Beacon、TIM与DTIM概念总结"
slug: "2021-01-12-WiFi-Beacon-tim-dtim"
description: "本文中总结了802.11协议规范中定义的Beacon frame的格式以及TIM与DTIM帧的差异。"
date: 2021-01-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


## **Beacon Frame**

- AP默认每102.4ms向外广播一个Beacon Frame，每个Beacon Frame中都包含有一个TIM Field，其中描述了AP为哪些STA缓存了数据；
    - Beacon Frame的发送周期以及DTIM间隔可以在路由器的设置选项中进行设置（路由器支持设置的情况下）；
    - 注意：Beacon Frame在发送的时候也需要参与到信号竞争机制中，只有当AP竞争到发送Beacon Frame的发送时隙后，才会把Beacon Frame发送出去。因此理想情况下Beacon Frame会以Beacon Interval的设置为周期精准的发出，但是当信道比较繁忙的时候，这个发送时隙可能会与理论值稍有偏差；
- AP发出的Beacon Frame中包含一个固定8字节的TimeStamp field，其中包含了AP自己以us为单位的计数器的计数值，STA通过监听Beacon Frame的这个timestamp，可以实现两者通信的定期精准时间同步；
    - 当STA接收到AP的beacon帧后，提取Timestamp字段的时间戳，并且添加一下本地估算出来的延迟（从天线端口接收到最后处理的本地延迟），从而完成节点与AP时间同步的功能。
- 在802.11协议中，Beacon在发送的时候始终使用的是AP能够支持的最低速率，因为：
    - Beacon帧是一个广播帧，没有ACK反馈，也就无法设置重传机制；
    - Beacon的目标是希望广播AP上的基本信息，所以希望所有的节点（包括兼容那些比较老的设备）都能够收到这个信息，发送beacon的时候采用最低的传输速率能够支持那些比较老的无线设备接入；
    - 此外，速率越高，在无线信号解调的时候需要信号越好（即最低灵敏度越高），降低传输速率可以降低信号解调的要求，确保信号较差的设备也能够接收到这个信息；

## **Beacon Frame中TIM Field的作用**


Beacon Frame中的TIM Field主要用于配合实现802.11定义的低功耗运行逻辑。


在STA的低功耗运行模式下，STA会处于休眠状态，为了能够保持基本实时的网络连接，STA需要定时唤醒并打开RX监听AP的Beacon Frame，在这个Beacon的TIM Field中就包含有为哪些STA缓冲了单播帧的信息；STA收到后解析并判断AP中是否有自己的单播帧；

- 如果有的话通过向AP发出PS-POLL frame来申请自己的缓存单播帧；
- 如果没有的话就可以继续休眠。

通过以上基本的运行逻辑来保证低功耗和网络通信实时性的平衡。


## **Beacon Frame中的TIM Field详解**


![Untitled.png](/images/blog/WiFi中的Beacon、TIM与DTIM概念总结-1.png)

- Element ID：固定一个字节，元素识别码，用于表示Beacon Frame中包含的不同字段，对于TIM类型的字段而言这个ID是5；
- Length：固定一个字节，用来表示这个Field中所包含的数据的长度，以字节为单位；
    - 具体而言，Length表示的是以上DTIM Count、DTIM Period、Bitmap Control、Partial Virtual Bitmap这四个子域的长度，因此Length最小为4，最大为254；
- DTIM Count：固定一个字节，距离下一个DTIM还有几个Beacon Frame；
    - DTIM Count=0表示当前TIM为DTIM；
- DTIM Period：固定一个字节，每隔几个Beacon Frame发出一个DTIM信息，这个值由AP设置；
    - 如果DTIM Period设置为1，表示所有的TIM都是DTIM；0为保留值，不可设置；
- Bitmap Control：固定一个字节；
    - Bit0：为1表示AP中缓存有组播/广播帧，会在DTIM对应的Beacon Frame后发出来；为0表示AP中没有缓冲的组播/广播帧；
- Partial Virtual Bitmap：变长，长度在1-251个字节；
    - Bitmap Control的bit1-bit7以及完整的Partial Virtual Bitmap数据用于表示这个AP中为哪些进入低功耗的STA缓存有单播帧；STA收到这个信息以后解析，查询自己的AID对应的那个Bit是否为1，如果为1的话表示AP中有自己的缓存帧，此后STA就需要使用PS-POLL的机制来获取自己的缓存帧；如果为0的话表示没有自己的缓存帧，STA可以继续休眠；
    - 实际上每个连接到AP上的STA在Partial Virtual Bitmap中都有对应的一个bit，这个bit为1，表示AP上有为这个STA缓存的数据，为0表示没有；Partial Virtual Bitmap最大为251个字节，也就是最多可以包含2008个bit，刚好与一个AP能够连接的STA的数量一致；
    - 如何通过Bitmap Control的bit1-bit7以及Partial Virtual Bitmap数据来解析AP上是否有为某个STA缓存数据，在802.11协议中有一个Annex O：An example of encoding a TIM virtual bit map可供参考。
    - 既然Partial Virtual Bitmap中的每一个bit代表一个STA，直接就可以使用包含251个字节的Partial Virtual Bitmap来标识AP中的缓存数据情况，为什么要搞这么一份负责的算法呢？这是因为如果每个Beacon Frame都包含完整的251字节Partial Virtual Bitmap，那么这个Beacon Frame的长度就太长了，而Beacon Frame是使用最低速率发送的，发送频率又比较高，这样的话导致光是Beacon Frame的发送就占去了不少无线信道时隙。因此引入了Bitmap Control机制来达到既可以在TIM中包含所有的缓存信息数据又尽量减少Beacon包的大小的效果。

下图是一个TIM类型的Beacon TIM Field抓包数据：


![Untitled.png](/images/blog/WiFi中的Beacon、TIM与DTIM概念总结-2.png)


下图是一个DTIM类型的Beacon TIM Field抓包数据：


![Untitled.png](/images/blog/WiFi中的Beacon、TIM与DTIM概念总结-3.png)


## **TIM与DTIM的区别究竟是什么？**

- 其实TIM与DTIM的差异非常小，最重要的区别只是：
    - **DTIM类型的Beacon Frame后面会紧跟着发出AP上缓存的所有组播/广播帧，当然前提条件是AP中有缓存的组播/广播帧（即Bitmap Control=1）；**
    - 当AP中不包含有缓存的组播/广播帧（即Bitmap Control=0）的话，TIM实际上与DTIM一样，只不过DTM Beacon Frame中的DTIM Count=0而已。
- 因此在Beacon Frame内部，DTIM与TIM类型的数据结构基本上是完全相同的：
    - TIM的DTIM Count不等于0，DTIM的DTIM Count等于0；
    - TIM与DTIM的DTIM Period相同；
    - TIM与DTIM的Bitmap Control的Bit0都用于表示AP中是否有广播/组播缓冲帧；
    - TIM与DTIM的Bitmap Control的Bit1-Bit7以及Partial Virtual Bitmap都用于表示AP中为哪些STA缓存了单播帧；

## **参考资料**

- [802.11 ------ Beacon帧、Beacon Interval、TBTT、Listen Interval、TIM、DTIM](https://www.cnblogs.com/god-of-death/p/8098643.html)
- [802.11协议精读10：节能模式（PSM）](https://zhuanlan.zhihu.com/p/21623985)
- [802.11 – TIM and DTIM Information Elements](https://blogs.arubanetworks.com/industries/802-11-tim-and-dtim-information-elements/)
