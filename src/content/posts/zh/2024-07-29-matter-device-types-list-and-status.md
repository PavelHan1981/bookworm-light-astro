---
title: "Matter支持的智能家居设备类型及其现状"
slug: "2024-07-29-matter-device-types-list-and-status"
description: "本文基于对最新的1.3版本Matter规范文档的学习，整理了在最新的Matter生态协议中可以支持的设备类型，以及当前这些设备类型在平台和设备开发商中的支持现状。"
date: 2024-07-29T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["物联网"]
tags: ["智能家居","Matter"]
draft: false
---


## Lighting Device照明设备


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-1.png)


照明设备这部分，根据要控制的特性不同分为了四类，On/Off Light只支持对灯开关的控制，Dimmable Light在此基础上增加了对灯亮度的控制，Color Temperature Light则在之前基础上增加了对灯光色温的基本控制，Extended Color Light则更可以支持更高级的对灯光光源做亮度以及色彩方面的控制。


整体来讲，对于这些智能灯基本的开关、亮度、色温等方面的控制，市场上已经有不少硬件产品能够支持使用Matter来对这些特性进行基本的控制，所以用户在这方面的挑选余地还是比较大的，例如Philips Hue, Wiz, and Nanoleaf，以及国内的Yeelight，Aqara等厂家都提供了这方面的产品可供选择。但是其中一些相对比较特殊的功能，例如dynamic lighting scenes, security lighting等仍然需要使用厂家APP的私有协议才能控制。


## Smart plugs/outlets and other actuators智能插头/插座和其他执行器


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-2.png)


主要针对各种智能插头插座以及水泵/水阀品类的产品。


目前在智能插座插头的基本开关控制方面，市场上的平台都已经有了比较好的支持，而且可以选择的硬件产品也比较多。但是Matter协议中已经定义了对插座能源监测方面的功能，不少硬件产品也已经能够支持，但是目前所有的智能家居平台还不支持使用Matter来访问，所以如果要访问这类信息就需要使用硬件生产商自己的APP。


## Switches and controls开关和控制器


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-3.png)


该品类主要是配合智能灯等类型的产品提供开关和其他方面的控制功能，基本上跟以上两个品类类似，只不过以上的品类是把这个控制直接整合在产品里面去了。整体来讲目前智能家居平台和硬件产品对这些品类的支持都还是比较广泛的。


## Sensors各类传感器


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-4.png)


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-5.png)


这个品类主要是各种传感器。整体来看，无论是智能家居平台还是硬件产品，Matter在这方面的支持都是最好的，市面上也能够买到不少符合Matter协议的各种传感器产品。


## Closures


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-6.png)


这个品类主要对应的是智能门锁和自动窗帘及其对应的控制器方面的应用。


整体来看，Matter能够支持对门锁等应用基本开关功能的支持（高级一些的功能例如通过APP来设置PIN密码等，在Matter中仍然是不支持的），主要的智能家居平台APP基本上也都提供了在Matter协议下对于这类产品的支持，但是市场中完全支持Matter协议的智能门锁硬件产品仍然比较少。主要原因是大多数智能门锁产品都是基于WiFi或者蓝牙的，但是Matter协议到现在为止仍然不支持低功耗模式运行的WiFi产品，而蓝牙并非是Matter支持的底层协议。所以当前能够支持Matter的智能门锁产品主要是与其自家Hub相配合的蓝牙产品。


对于智能窗帘的各种控制而已，无论是平台和硬件产品，目前整体的支持都还是比较全面的，市场上可以选择的硬件也比较丰富。


## HVAC


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-7.png)


该品类主要对应与市场上暖通设备空调配套使用的恒温器，风扇以及空气净化器等类型的产品。


从具体的市场上看，恒温器方面市场上唯一能够支持Matter的就是Google的Nest Thermostat。风扇和空气净化器品类符合Matter规范的硬件产品也不多，加起来不超过10款。


## Media媒体设备


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-8.png)


这个品类主要对应的就是智能电视和普通的音箱产品。按照Matter协议规范的定义，如果电视产品遵从Matter协议的话，就可以使用APP作为遥控控制电视，以及向电视推流。


但截至目前为止只有Amazon的Fire TV产品可以支持作为Matter Device，使用Alexa APP利用Matter Casting功能向电视推流，其他主流的电视厂商尚无Matter产品。


## Robotic devices机器人设备


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-9.png)


扫地机器人设备目前Matter能够支持的功能主要包括远程开启设备，设置清扫模式，获取清扫状态以及机器本身的配件状态等。


智能家居平台方面，Apple和三星可以支持通过Matter对扫地机器人的管理，但是Google和Amazon Alexa仍然不支持。能够支持Matter的扫地机器人硬件产品到现在为止也只有3-4款而已，而且部分高级一些功能仍然需要使用厂商自己的APP。


## Appliances家用电器


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-10.png)


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-11.png)


从上图可以看到，在Matter的协议规划上，Matter能够支持的家用电器的品类还是非常广泛而全面的。尽管家用电器的主流厂商普遍加入了Matter组织，但可惜的是，截止到2024年7月份为止，市场上还无法买到完全符合Matter协议的以上大多数品类的家用电器产品，只有美的出了一款能够支持Matter的洗碗机和微波炉。


## Energy能源控制


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-12.png)


## Summary总结


尽管Matter的正式协议规范1.0版本在2022年10月份就已经发布，而且目前智能家居生态领域的主流玩家，例如Apple，Google，Amazon以及三星确实倾全力支持，生态系统软件以及这些生态系统的硬件Hub均在第一时间得到了Matter方面的更新支持，但是除了以上照明、开关、传感器等品类的发展较好之外，其他大部分品类发展并不是很顺利，市场上能够选择的支持Matter协议的硬件产品并不是很丰富。所以在Matter规范已经发展到1.3版本的今天，后续这个所谓的通用智能家居协议规范究竟能够走的有多远，仍然需要拭目以待。


如果要分析其原因的话，我认为是Matter的使命是作为一个通用的智能家居协议标准，打通不同厂家所生产的硬件产品之间的通信与交互，这样当然是方便了用户对于智能家居产品的使用和部署，但是这样也就消除了相同品类下，不同智能硬件产品之间的差异性，这一点是智能家居硬件生产商所不希望看到的，没有差异化的情况下就只能通过拼价格来获取更大的市场份额，所以这一点应该是各个智能家居硬件生产商不愿意投入太多精力去投入Matter协议接入的原因所在。换句话说，在单一品类上，Matter协议规范能够支持的功能越强大，这个领域能够实现的有效差异化价值就越少，硬件生产商的利润空间也就会越小，因此，单从这一点上看，Matter协议规范的发展方向，与硬件生产商的根本利益之间是相悖的。这个问题不解决，至少在硬件支持方面，Matter恐怕仍然不会推广的很快。


## 参考文档

- Matter Specification Version 1.3.0.1
- Matter Device Library Specification Version 1.3.0.1
- [Every device that works with Matter (July 2024) - The Verge](https://www.theverge.com/23568091/matter-compatible-devices-accessories-apple-amazon-google-samsung)
