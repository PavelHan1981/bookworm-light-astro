---
title: "LTE CAT 1bis、LTE-M、NB-IoT的对比"
slug: "2024-09-11-the-comparson-of-LTECAT1-LTEM-NBIOT"
description: "本文重点对LTE-M和NB-IoT两种LPWAN移动通信技术的应用特点做了总结，并对LTE CAT 1bis、LTE-M以及NB-IoT这三者在各个维度上进行了全面的比较。"
date: 2024-09-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["移动通信"]
tags: ["无线通信"]
draft: false
---


LTE CAT 1bis、LTE-M、NB-IoT这三种技术都是针对IoT领域的广域网LPWAN（Low Power Wide Area Network）无线通信技术，不过在功耗、通信速率、成本等方面有着显著差异。本文重点对比LTE CAT 1bis、LTE-M、NB-IoT这三种移动通信技术在应用上各自的特点。


在我的另外一篇技术总结中，我对LTE CAT 1以及CAT 1bis模块背后的技术做了简单的整理：。因此以下主要整理LTE-M和NB-IoT各自的应用技术特点，然后对其进行对比。


[link_to_page](https://www.notion.so/39a41002-72c1-44c8-a1d3-fca3a86f0895)


## LTE-M/eMTC


LTE-M技术的全称是 Long Term Evolution for Machines 。相比于NB-IoT而言，LTE-M是3GPP在不改变LTE自身技术体制的基础上，通过对LTE协议进行裁剪和优化得到的，因此LTE-M从技术的角度上与LTE更为接近，也更容易在现有的4G和5G基站上升级得到对LTE-M的支持。


LTE-M规范对应于3GPP在Release 12中定义的低成本machine type communication（MTC）以及在Release 13中定义的LTE-enhanced MTC（eMTC），因此LTE-M又可以称为MTC或者eMTC技术。


在3GPP的Release 14规范中，LTE-M标准使用1.4MHz的通信频宽，可以实现大致1Mbps的理论通信速率。在LTE CAT M2规范中，更是可以达到上行7Mbps，下行4Mbps的理论通信速率。


LTE-M可以作为Sigfox或者Lora这类工作在公共免License的频带的替代解决方案。

- LTE-M工作在需要申请license的频率范围，由国际组织3GPP定义和规范，适合由移动网络运营商主导来开展业务。Sigfox和Lora则均是商业公司（分别是法国的Sigfox公司以及美国的Semtech公司）的私有解决方案，工作在433M/868M/915M这类免license的Sub1G频段。

与LTE CAT 1技术类似，LTE-M也能够支持在网络基站之间进行的小区自动切换和漫游中保持连接的功能，因此非常适合部署在车辆上、时刻处于运动状态下的应用场景。并且LTE-M也能够支持语音功能和低延迟通信（15ms以内延迟）。


相比NB-IoT，LTE-M还有一个可定位的优势。基于TDD的LTE-M可以利用基站侧的PRS测量，在无需增加GPS芯片的情况下进行设备位置定位，这种低成本的位置定位技术和功能有利于LTE-M应用于物流、货物跟踪等对位置信息敏感的应用场景。


## NB-IoT


NB-IoT的全称是Narrow Band Internet of Things，即针对物联网IoT应用的窄带移动通信技术。


NB-IoT技术的定位是针对物联网应用的窄带、低功耗、低速率、低成本、广覆盖范围、大量设备连接的广域网通信技术。


NB-IoT首次于2015年在3GPP的Release 13中被提出。在该版本协议规范中，NB-IoT使用200kHz的频宽进行通信，上行速率最高62kbps，下行速率最高为26kbps，通信延迟时间在1.6-10s之间。在3GPP的Release 14中进一步提出了NB-IoT的升级版本LTE CAT NB2，这个新标准的上行速率最高达到了159kbps，下行限制则为127kbps，比之前Release 13中的速率还是有了比较大的提升。


NB-IoT的最大特点就是功耗低，仅为2G的1/10，终端模块保障电池甚至可以做到长达10年的使用寿命。


NB-IoT基站的覆盖范围很广，一方面得益于NB-IoT的信号本身具有很强的覆盖能力，在相同的频段下，NB-IoT相比当前的4G、5G基站的网络增益有20db的提升，理论覆盖面积扩大100倍。其次NB-IoT基站的一个扇区最多能够支持10万个连接，远超当前4G/5G基站能够支持的连接数量。


**需要注意，NB-IoT不支持在基站之间的小区自动切换和漫游功能，因此实际上是不适合处于运动状态下需要时刻在基站之间切换的场景，更适合部署安装以后固定不动的应用。**


## 三种移动通信技术的比较总结


![image.png](/images/blog/LTE-CAT-1bis、LTE-M、NB-IoT的对比-1.png)

- 功耗方面，三种技术的低功耗特性大同小异，但是在低功耗性能方面，NB-IoT与LTE-M的功耗差别不大，总体上短距离的情况下LTE-M功耗表现更好，NB-IoT则在远距离下通信的功耗更低，LTE CAT 1bis则要比前两者显著高一些。在具体的系统设计和选型中，就需要根据产品的供电情况进行取舍。
    - Nordic使用他们的nRF9160多模通信芯片做了LTE-M和NB-IoT之间的功耗对比测试：[LTE-M vs NB-IoT Field Test: How Distance Affects Power Consumption - Blogs - Nordic Blog - Nordic DevZone (nordicsemi.com)](https://devzone.nordicsemi.com/nordic/nordic-blog/b/blog/posts/ltem-vs-nbiot-field-test-how-distance-affects-power-consumption)
- 三种技术所支持的通信速率上，LTE CAT 1bis是最快并且功能最丰富的，LTE-M其次，NB-IoT就只能为一些通信数据量很低只需要几十Kbps的应用提供通信支持，这一点的对比刚好与功耗的对象相反。
- 在通信频段所占用的频宽上，LTE CAT 1跟普通的LTE一样都是20MHz，LTE-M是1.4MHz，NB-IoT则只有180kHz，所以NB-IoT占用的频段更少，对于运营商的部署成本就更低。
- 通信的延迟方面，LTE-M和LTE CAT1均可以做到100ms，差不多可以实时响应了，但是NB-IoT在功耗的设计上更加极致，也就导致其通信延迟高达10s，不太适合一些对通信数据实时性要求更高的应用。
- 从网络覆盖范围上，NB-IoT的MCL相比LTE CAT 1和LTE-M分别有了20db和10db的提升，相当于一个基站的覆盖范围得到了极大的提升。再加上NB-IoT基站的一个扇区最大可以支持10万个设备连接，比传统的移动通信有50-100倍的接入数量提升，因此在这些层面上NB-IoT有着压倒性的优势。
- 移动性的支持方面，LTE CAT 1bis和LTE-M均可以支持基站的小区切换和漫游功能，但是NB-IoT无法支持这个特性，因此NB-IoT更适合那些对于设备移动性要求不高的应用。
- 以上三种技术都是使用一根天线进行通信，这样既缩小了芯片和模块以及设备的尺寸，也简化了射频电路的设计，芯片的成本也就可以做的更低。
- 在硬件芯片和模块的成本上，成本与芯片内部技术实现的复杂性密切相关，在射频技术的复杂性上，LTE CAT 1bis虽然相比其他高规格的LTE类型已经做了很多的简化，但仍然是这三者中最复杂的，因此LTE CAT 1bis的模块价格也更贵，LTE-M次之，NB-IoT最便宜，非常适合需要大量部署对于硬件成本非常敏感的应用场景。
- 在对运营商所部属的现有4G基站的兼容性方面，LTE CAT 1及其CAT 1bis的兼容性自然是最好的，在现有的4G基站上基本上都不存在兼容性问题，但是LTE-M和NB-IoT要能够直接接入到现有的4G基站上，均需要对现有基站的软硬件做一些升级才能办得到，相比而言，LTE-M需要做的升级的工作量和成本相比NB-IoT更低一些。
- 三种技术在世界范围内各个国家和运营商的支持情况，LTE CAT1及其CAT 1bis因为可以直接连接现有基站，基本上不存在兼容性的问题，只不过对于1bis而言在部分基站上存在语音等功能受限的问题，但是LTE-M和NB-IoT则存在比较大的兼容性方面的问题，要么需要独立架设基站，要么需要对现有的基站在软硬件方面均做一些升级才能支持。尤其是各个国家对于LTE-M和NB-IoT技术的支持情况还各不相同，[Mobile IoT Deployment Map | Internet of Things (gsma.com)](https://www.gsma.com/solutions-and-impact/technologies/internet-of-things/deployment-map/)提供了一份当前世界上各个国家对于这两种技术的支持情况：目前中国主推的还是NB-IoT，三大运营商均已经针对NB-IoT有了比较成熟的布局；而北美和欧洲则是LTE-M和NB-IoT并行发展。

![image.png](/images/blog/LTE-CAT-1bis、LTE-M、NB-IoT的对比-2.png)


因此，LTE CAT 1bis自身的技术特征和竞争优劣势非常鲜明，而单纯比较LTE-M和NB-IoT的话，LTE-M在通信速率、支持语音通话、具备良好的可移动性以及支持定位方面具备明显的优势，而NB-IoT的相对竞争优势则是成本更低、基站覆盖范围更广、小区容量更大、静态续航能力更好等方面。


## 参考资料

- [LTE IoT standards: LTE Cat 1, LTE Cat 1bis, LTE-M, NB-IoT (onomondo.com)](https://onomondo.com/blog/lte-standards-for-iot-comparison/)
