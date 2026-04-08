---
title: "WiFi6的OFDMA特性详解"
slug: "2025-02-05-the-OFDMA-feature-of-WiFi6"
description: "OFDMA：全称是Orthogonal Frequency Division Multiple Access，即正交频分多址。

在WiFi6之前的WiFi4/WiFi5，甚至更早的802.11a协议中，已经导入了OFDM机制，即把整个通信信道的频宽划分为多个相互重叠但是正交的子载波，以尽可能提升数据传输速率以及频谱利用率，并且克服无线传输中存在的多径干扰问题。

但是单独OFDM的使用，WiFi AP和STA之间的每次通信都是针对单用户的，也就是说每次发送数据的时候，不管这个用户数据量的大小，与这个用户的通信每次都要占用全部的子载波进行通信。如果把整个信道全部的子载波整体看成一辆送货的小车，当用户要通信的数据量很小的时候，例如即时消息，浏览网页等，这些通信的数据量根本用不了全部的子载波，因此这个小车是装不满的，但根据OFDM的工作机制和流程，这个装不满的小车里面也只能装这个用户的数据，小车里多余的空间（即剩下闲置的子载波）就被白白浪费了。"
date: 2025-02-05T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi","无线通信"]
draft: false
---


OFDMA：全称是Orthogonal Frequency Division Multiple Access，即正交频分多址。


## OFDM vs OFDMA


在WiFi6之前的WiFi4/WiFi5，甚至更早的802.11a协议中，已经导入了OFDM机制，即把整个通信信道的频宽划分为多个相互重叠但是正交的子载波，以尽可能提升数据传输速率以及频谱利用率，并且克服无线传输中存在的多径干扰问题。


但是单独OFDM的使用，WiFi AP和STA之间的每次通信都是针对单用户的，也就是说每次发送数据的时候，不管这个用户数据量的大小，与这个用户的通信每次都要占用全部的子载波进行通信。如果把整个信道全部的子载波整体看成一辆送货的小车，当用户要通信的数据量很小的时候，例如即时消息，浏览网页等，这些通信的数据量根本用不了全部的子载波，因此这个小车是装不满的，但根据OFDM的工作机制和流程，这个装不满的小车里面也只能装这个用户的数据，小车里多余的空间（即剩下闲置的子载波）就被白白浪费了。


![image.png](/images/blog/WiFi6的OFDMA特性详解-1.png)


在WiFi6中引入的OFDMA机制则可以有效的改善以上情况。在WiFi6协议中，把整个信道带宽所包含的所有子载波划分为多个相互独立的资源单元RU（Resource Unit），在发送数据的时候，经过AP的统一协商和管理，不同用户的数据只会占用其中的某个RU而不是整个信道，这样的情况下，因为整个信道包含多个RU，那么就可以实现在同一时间使用不同的RU向多个用户同时发送数据的应用场景。如果仍然拿小车来举例的话，OFDMA相当于是在小车中划出专门的隔间，通过调度确定下来每个隔间用户放置不同用户的货物，这样小车跑一次就可以同时为多个接收方送货，当然是大大提升了运输效率（通信效率）。


![image.png](/images/blog/WiFi6的OFDMA特性详解-2.png)


以下是传统的OFDM与OFDMA之间的对比：



![image.png](/images/blog/WiFi6的OFDMA特性详解-3.png)


## RU（Resource Unit）的概念


如上所述，在WiFi6的OFDMA机制的运行过程中，RU是OFDMA的最小资源分配单位。RU由一组连续的子载波（Tone）组成。在WiFi6的OFDMA机制中，RU最小可包含26-tone（也就是26个子载波），其他类型的RU还包括52-tone、106-tone、242-tone等。RU中tone的数量与其所占频宽的对应关系是：（WiFi6的子载波间隔是78.125KHz，很好计算）

- 26-tone RU ≈ 2 MHz
- 52-tone RU ≈ 4 MHz
- 106-tone RU ≈ 8 MHz
- 242-tone RU ≈ 20 MHz（对于20MHz频宽而言，相当于是覆盖整个信道）

以2.4GHz频段20MHz频宽为例：

- WiFi6导入了更小的子载波间隔（78.125kHz），相比Wi-Fi4/5（312.5kHz）缩小了4倍。因此WiFi6在相同带宽下，可用的子载波数量大幅增加。
- 对于20MHz的信道频宽而言，整个信道的20MHz会被分割为256个子载波，其中234个用于数据传输，其余为保护子载波（11个）、空子载波（4个）和直流子载波（7个）。
- 在20MHz的信道中，最多可支持9个26-tone RU，即同时服务9个用户。

![image.png](/images/blog/WiFi6的OFDMA特性详解-4.png)


在具体的执行中，完整的20 MHz信道可以被灵活的动态分配为不同的RU组合，例如可以分为1个106-tone RU + 5个26-tone RU来同时支持6个用户；也可以分为4个52-tone RU同时支持4个用户。另外，AP在运行的过程中，还会周期性的探测当前连接的多个终端设备的数据流量类型（如视频、语音）和缓冲区状态等，在各个设备之间动态分配RU，进一步优化带宽利用效率。

> 但是需要注意，WiFi6的OFDMA对于RU的划分，只能够支持在同一时间周期内给一个STA分配一个RU，因此无论AP如何灵活的给其连接的STA分配RU资源，每个STA都只能使用其中的一个RU。

## 触发帧(Trigger Frame)结构


如上所述，在WiFi6 OFDMA机制的运行过程中，AP可以根据其连接的各个节点的通信需求在多节点之间动态的分配RU，那么这个动态分配RU的执行流程是什么呢？答案是：

- AP要依赖于触发帧（Trigger Frame）和管理帧交互机制来动态通知各个终端（STA）RU的分配结果。
- 而对于AP与STA之间的下行通信，如果不依赖于MU-RTS机制的话，各个STA的下行通信RU信息就直接包含在AP发出数据PPDU的HE-SIG-B字段中，这样对于下行OFDMA通信而言，就不需要依赖触发帧来分配RU资源了。但上行OFDMA通信（即多个STA利用各自的RU同时向AP发出数据）必须要依赖于触发帧进行RU的协商和同步。

触发帧是在802.11ax规范中引入的一种控制帧结构（Type=1，SubType=2）。有关触发帧的详细信息可以参考[[[WiFi6的触发帧（Trigger Frame）帧结构详解]]](https://www.pavelhan.tech/article/2025-02-01-the-structure-of-wifi6-trigger-frame)。


## 上行和下行OFDMA的运行流程


WiFi6的OFDMA在具体的应用上可以分为上行OFDMA和下行OFDMA两种应用场景和流程：

- 下行OFDMA(Downlink OFDMA)，是指AP可以同时使用多个RU向多个不同的STA传输数据，因此可以提高单位时间内的有效数据吞吐率，提升频谱的利用效率。
- 上行OFDMA(Uplink OFDMA)，是指多个STA可以通过利用自己分配的RU向AP传输数据，因此各个STA之间不再需要通过传统的竞争信道的方式来竞争无线传输媒介，减少了STA上传数据由于信道竞争而产生的时延和冲突次数。

以下总结下行OFDMA的通信流程：（AP同时向多个STA发送数据）

- AP发出一个MU-RTS Frame类型的触发帧。相比于传统的RTS(Request To Send) Frame，这个MU-RTS Frame中包含了多个目的STA的Association ID以及各个STA在本次会话通信中使用的RU等信息。在这个AP的BSS中，所有的STA都可以接收并解析这个MU-RTS Frame，从而了解到本次会话中AP是否有数据发送给自己，自己是否需要给AP发回CTS应答以及自己的数据在哪个RU。
- STA（MU-RTS中指定的那些STA）发回CTS Frame，确认信道可用于接收数据。因为在MU-RTS中指定了本次会话通信中各个STA的Association ID以及其占用的RU，所以这些STA收到MU_RTS Frame以后，就通过给自己分配的RU向AP发回CTS Frame进行应答。因此，多个STA占用的RU相互独立，可以同时向AP发回这个应答。
- AP同时向多个STA发出数据。这个阶段就是AP使用不同的RU向多个STA同时发出数据，各个STA也只需要接收自己的RU中所传输的数据。
- AP轮流向每个STA发出BAR(Block ACK Request)帧。数据发送完成后等待SIFS的时间，AP轮流向每个接收数据的STA发出一个BAR Frame用于请求各个其数据接收应答帧，以确认数据是否被正确接收。（**此处为什么不采用MU-BAR帧，主要是考虑兼容性方面的问题，确保不支持OFDMA和触发帧的其他STA也能够正常收到BAR帧并答复。**）
- 多个STA同时使用自己的RU向AP回复Block ACK帧。对于本次OFDMA下行通信过程中每个接收数据的STA，使用上行OFDMA机制在自己的RU中同时向AP返回Block ACK Frame，表示前面的数据已经被正常接收并解析。

![image.png](/images/blog/WiFi6的OFDMA特性详解-5.png)


**当然以上的MU-RTS和CTS环节是可选的流程，推荐在高密度部署或者敏感数据传输的应用场合中使用。在一般优化吞吐量的应用场景中，可跳过MU-RTS和CTS环节以降低控制开销，在这种情况下，本次下行传输中对各个STA的RU分配信息包含在下行数据PPDU前导码中，前导码中所包含的HE-SIG-A和HE-SIG-B字段描述了RU的分配信息，STA接收到前导码以后对其中的HE-SIG-B字段进行解析来判断自己数据所在的RU。**


对于上行OFDMA流程而言，相比下行通信要稍微复杂一点。在上行的流程中，AP需要先轮询各个STA的数据缓冲状态（是否有上行通信的需求），然后再根据各个STA的信息来分配RU资源。因此，在上行流程中，AP先发送BSRP触发帧，STA回复BSR（缓冲状态报告），然后AP再根据这些信息发送基本触发帧来调度资源。


以下总结上行OFDMA的通信流程：（多个STA同时向AP发送数据）

- 首先由AP发起下行OFDMA通信流程，AP向所有的STA发出BSRP(Buffer Status Report Poll)触发帧，通过这个触发帧来查询各个STA是否有数据要发送给自己。
- 每个STA通过自己分配的RU，向AP返回一个Qos Null Frame，其中包含有BSR信息(Buffer Status Report) ，告知AP自己是否有数据要发送。
- AP再向所有的STA发出MU-RTS Frame，用于确认各个STA是否已经准备好上传数据，以及各个STA的RU分配信息。
- 多个STA通过自己的RU同时向AP应答一个CTS Frame，表示自己已经准备好发送数据。
- AP再向所有的STA发出一个基本触发帧，通过这个基本触发帧来触发多个STA向其上传数据。各个STA收到这个基本触发帧以后，同时通过自己的RU向AP发出自己的数据。
- 最后AP再向所有的STA发出应答包Multi-STA Block ACK，表示自己已经成功的接收并解析上行数据。

![image.png](/images/blog/WiFi6的OFDMA特性详解-6.png)


同样的道理，以上的上行OFDMA流程中的MU-RTS和CTS部分也是可选的。


## 参考资料

- [Wi-Fi 6(802.11ax)解析2：OFDMA资源块 - RU - 知乎](https://zhuanlan.zhihu.com/p/24416610)
- [Wi-Fi技术简介（九）-- WIFI6高性能之OFDMA](https://mp.weixin.qq.com/s?__biz=MzU3NDA0NDUxOA%3D%3D&mid=2247485419&idx=1&sn=e531711e3c999ce43910b371546fab95&chksm=fc21ed40046f36fa215aba692857c6bd655f6d3474284337a4ce8d56975358347ce2c947e5ec#rd)
- [【WLAN从入门到精通-Wi-Fi 6】第2期——物善其用 OFDMA-云社区-华为云](https://bbs.huaweicloud.com/blogs/194368)
- [Wi-Fi 6(802.11ax)解析13-15：触发帧（Trigger Frames）和MAC接入机制、下行OFDMA接入机制（DL-OFDMA）、上行OFDMA接入机制（UL-OFDMA）_dl ofdma 80211-CSDN博客](https://blog.csdn.net/alangdangjia/article/details/140061953)
- [Wi-Fi6协议Triggle Frame在OFDMA中应用_wifi 6 ofdma-CSDN博客](https://blog.csdn.net/u010893529/article/details/145609635)
