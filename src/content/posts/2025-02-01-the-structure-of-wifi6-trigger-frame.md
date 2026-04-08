---
title: "WiFi6的触发帧（Trigger Frame）帧结构详解"
slug: "2025-02-01-the-structure-of-wifi6-trigger-frame"
description: "WiFi6（802.11ax）中OFDMA（正交频分多址接入）的实现依赖于触发帧（Trigger Frame, TF） 这一关键机制。本文从技术角度深入剖析其触发帧的详细细节。"
date: 2025-02-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


WiFi6（802.11ax）中OFDMA（正交频分多址接入）的实现依赖于触发帧（Trigger Frame, TF） 这一关键机制。本文从技术角度深入剖析其触发帧的详细细节。


## 触发帧整体结构


整体而言，触发帧是802.11ax所引入的一种控制帧类型（Type：Control，Subtype：2）。下图是802.11ax规范中定义的Trigger Frame的整体帧结构。


![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-1.png)


从以上触发帧的整体帧结构上可以看到，Trigger Frame的整体帧结构可以分为四个部分：

- MAC Header：包含Frame Control，Duration，RA，TA四个部分。其中触发帧的帧类型在Frame Control中指定。
- Common Info：紧随MAC Header之后的是一个Common Info部分，在其中定义了这个帧的全局参数配置信息。
- 连续多个User Info结构：每个User Info结构针对一个用户（也就是STA）的独立配置字段信息，在其中指定给这个STA分配的RU资源。
- Padding和FCS：最后是整个包结构的占位字段和校验字段。

对于触发帧而言，又可以按照Common Info中的Trigger Type指定，分为多种不同的子帧类型。



![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-2.png)

- Basic：用于常规上行OFDMA MU-MIMO传输，AP通过RU分配指定各STA的时频资源，启动各个STA向其上传数据。
- BSRP：在UL OFDMA通信中，AP使用BSRP帧请求STA上报缓冲区状态（有多少数据等待上传），以便于AP动态分配资源。
- MU-RTS：类似于RTS帧，但用于OFDMA通信中，用于协调多用户同时发送RTS帧，以减少信道竞争冲突。
- MU-BAR：用于上行OFDMA通信中，AP向所有的STA请求Block ACK应答消息。
> 另外需要注意的是，**在Wi-Fi6协议中，所有的触发帧（Trigger Frame）及其子帧都是AP专属的控制帧，只有AP有可能会发出触发帧，STA无法主动发送触发帧或其子类型**。STA仅在收到AP的触发帧后，按照RU分配和时间同步的要求进行响应（如发送数据或ACK），但STA无权主动发起触发帧。这种设计确保了信道资源的集中调度和冲突避免。
> 需要说明的是，对于各个子帧类型不同的触发帧，其中所包含Common Info和User Info的信息可能会有较大的差异。例如MU-RTS类型的触发帧中，Common Info和User Info里面的大部分字段都是不存在的。

## Common Info


以下对Common Info部分的重要字段进行解释：

- Trigger Type：这个4bit额字段用于说明这个触发帧具体对应的子帧类型，Basic，MU-RTS，BSPR等（可参考上面的表格理解）。
- UL Length：本次上行传输的总时长（也就是STA本次上行传输包含的符号数）。
- More TF：大部分情况下设置为0，主要用于TWT等低功耗模式。
- UL Bandwidth：此处指定上行传输的带宽（20/40/80/160MHz），AP在此带宽内分配给各个STA所使用的上行RU资源
- GI and LTF Type：指定保护间隔（GI）的时间长度
- RU Allocation：定义了每个RU在信道中的频域位置（例如26-tone、52-tone RU）。
- AP Tx Power：此处的AP Tx Power字段是建议所有STA使用的统一发射功率基准，此外User Info部分允许为每个STA指定个性化功率参数。
- HE-SIG-A Info：携带HE PHY头的参数（如是否使用LDPC、STBC等）。

![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-3.png)


## User Info


在触发帧的帧结构中，针对OFDMA进行RU分配的每个STA都有一个User Info数据结构。这个User Info中就包含了针对对应STA的独立配置信息。


以下对User Info部分的重要字段进行解释：

- AID（Association ID）：对应于目标STA的Association ID。
- RU Allocation Index：对这个STA分配的具体RU索引（根据标准预定义映射表）。
- UL MCS（Modulation and Coding Scheme）：指定上行数据传输的调制编码策略。
- UL DCM（Dual Carrier Modulation）：是否采用双载波调制方式来传输上行数据。
- SS Allocation：空间流数（仅适用于UL MU-MIMO）。
- UL Target RSSI：AP要求STA在上行发送数据过程中的发射功率（基于接收信号强度的反馈）。

![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-4.png)


## 参考资料

- [The 802.11ax Trigger Frame – SemFio Networks](https://semfionetworks.com/blog/the-80211ax-trigger-frame/)
- [Trigger Frames in 802.11ax | Hitch Hiker's Guide to Learning](https://www.hitchhikersguidetolearning.com/2023/03/31/trigger-frames-in-802-11ax/)
