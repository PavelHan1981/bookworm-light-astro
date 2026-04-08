---
title: "Apple Find My的Unwanted Tracking Alert功能详细解析"
slug: "2024-05-25-apple-find-my-unwanted-tracking-alert"
description: "本文总结了Apple Find My Accessory的四种工作状态，以及重点描述了在Separated状态下Apple所设计的Unwanted Tracking Alert机制的实现流程。该机制可以在用户可能被跟踪的情况下发出Alert来提醒用户注意，从而避免用户的位置隐私信息泄露带来的危险。"
date: 2024-05-25T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["蓝牙","MFI"]
draft: false
---


最近因为公司一个新项目的开发需求，开始学习Apple MFI Find My Network的协议文档。


因为是基于BLE的，而且功能也比较简单（主要就是防丢，帮助用户快速找到自己设备的位置），整个协议的工作逻辑还是简单的。但刚开始学习的时候，还是对其中的Unwanted Tracking Alert的功能特性和使用逻辑不是很清楚。


## Apple Find My Accessory的四种工作状态


要搞明白Unwanted Tracking Alert，首先要弄清楚Apple Find My Accessory的四种工作状态：


![Untitled.png](/images/blog/Apple-Find-My的Unwanted-Tracking-Alert功能详细解析-1.png)


本质上，Apple Find My Accessory实际上就是一个基于BLE Beacon以及连接模式的位置跟踪器。那么对于任何的蓝牙设备而言，大致无非就是配对前的广播状态、配对后的广播状态（未连接），以及连接通信状态。所以以上的Unpaired和Connected状态是比较好理解的，但是Nearby和Separated是什么意思？区别是什么？


实际上Nearby和Separated这两种状态的区别就跟Unwanted Tracking Alert功能息息相关了。

- Unpaired：就是Find My Accessory的未配对模式，所有的这类设备出厂后刚开机的时候就处于这种状态下，持续的发出广播包等待与用户的Apple设备进行首次配对。
    - 除了一开始的初始状态以外，如果这个accessory解绑unpairing以后，每次开机也是处于这种状态之下。
- Connected：就是Accessory与用户Apple设备之间处于正常的连接状态，用户可以在apple设备的find my app上看到设备的位置，控制设置发出声音以更方便的进行定位。
- Nearby：当accessory和用户的apple设备之间的BLE连接断开后，总是首先会进入Nearby状态。这个Nearby状态本质上还是一种BLE的广播状态，这个状态的目的就是等待与用户的Apple设备重新建立连接。这种状态下不支持Unwanted Tracking Alert功能。
- Separated：Nearby状态下会维持一个倒计时器，当accessory处于Nearby状态的时间超过TNearBy（默认为15min，但是可以在apple device的find my app连接状态下修改）后，这个Accessory就会自动进入Separated状态。Separated状态与Nearby状态在实现上的最大区别就是，Separated状态有Unwanted Tracking Alert功能，而Nearby状态没有。

我自己对于以上状态的理解：

- 实际上对于Find My Accessory而言，经过pairing操作以后，正常使用中绝大多数状态应该就是Connected和Nearby。Connected当然就表示手机跟Accessory之间的距离很近，双方一直保持正常连接；而Nearby则是手机和Accessory之间短暂离开（离开时间不超过15min）的状态。
- Separated状态则是表示手机跟Accessory之间已经超过15min不在一起了，存在丢失的风险或者已经丢失了。所以处于丢失状态下的Find My Accessory实际上就是处于这种状态
- 可以理解Nearby状态是用户Apple device与Accessory的临时断开状态，如果断开的状态时间太长进入了Separated状态，就认为是进入丢失状态了。
- 后续完整的Unwanted Tracking Alert功能全部都是与Separated状态来进行设计的。

## 那么Unwanted Tracking Alert功能究竟是什么？


按照参考文档1第2.6.1 Unwanted Tracking Detection节的描述：

- Unwanted tracking detection (UT) notifies the user of the presence of an unrecognized accessory that may be traveling with them over time and allows them to take various actions, including playing a sound on the accessory if it’s in Bluetooth LE range.

也就是说，Find My Accessory的基本功能实际上就是一个BLE防丢器，配合Apple的Find My Server以及强大的苹果产品生态，可以为用户方便的定位这个Find My Accessory所在的准确位置。


但是，这个功能也很容易被人恶意用于跟踪，最典型的就是：跟踪者把一个与自己Apple账号绑定的Find My Accessory放入被跟踪者的车辆、背包等里面，然后无论这个被跟踪者到哪里，跟踪者都可以很容易的用自己的find my app查到到被跟踪者的精确位置。


因此Apple Find My Accessory中的这个Unwanted tracking detection或者alert的功能就是通过：

- Accessory在长时间进入Separated状态后，定期通过Motion Detector检测Motion，并主动发出告警声音。
- 以及在潜在被跟踪者的手机上监测到异常后弹出Alert的方式进行告警。

以上两种方式来提醒用户，以缓解和应对位置隐私信息泄露带来的危险。


## Find My Accessory端的Unwanted Tracking Alert功能实现


正是因为find my accessory很容易被人用于恶意的跟踪他人的位置，所以在Apple的find my accessory specfication里面明确要求，小尺寸的Find My Accessory一定要有Sound Maker（例如喇叭，蜂鸣器）和一个Motion Detector（例如g-sensor）用于辅助快速找到隐藏的跟踪设备。


如果不满足以下尺寸要求，就一定要有Sound Maker和Motion Detector来实现Unwanted Tracking Alert功能：


![Untitled.png](/images/blog/Apple-Find-My的Unwanted-Tracking-Alert功能详细解析-2.png)


而对于这个accessory而言，Unwanted Tracking Alert功能的大致实现流程如下：

- Accessory进入Separated状态后，等待TSEPARATED_UT_TIMEOUT时间（默认为3天），启用Motion Detector功能。
- 此后以TSEPARATED_UT_SAMPLING_RATE1为周期（默认为10s）使用Mition Detctor检测当前是否处于Motion。
- 如果检测到Motion，就通过Sound Maker播放一次声音，同时后续修改Motion Detector的检测周期为TSEPARATED_UT_SAMPLING_RATE2（默认为0.5s），同样每次检测到Motion就播放一次声音，以提醒用户注意。
- 如果已经播放过10次声音，或者以TSEPARATED_UT_SAMPLING_RATE2为周期连续检测到20秒Motion事件，则禁用Motion Dector一段时间 TSEPARATED_UT_BACKOFF（默认为6小时）。然后再周而复始。

通过以上流程，当Accessory处于Separated的状态下超过一定的时间后，就会定期的打开Motion Detector进行Motion检测，检测到Motion后再通过Sound Maker来提醒用户可能被跟踪。


## iOS手机端的Unwanted Tracking Alert功能特性


除了Accessory自身在Separated状态下，周期性的通过Motion Detection+Sound的方式提醒可能被跟踪以外，用户的Apple设备端（例如iOS手机）也会在判断周围有处于Separated状态的Find My Accessory持续跟踪的情况下，在手机系统中推送Alert消息如下。当系统收到Alert消息以后，点击进入Find My APP就会找到自己附近的Find My Accessory设备。此时还可以通过Play Sound来控制这个跟踪器发出声音，从而更快速的找到这个跟踪器的位置。


![Untitled.png](/images/blog/Apple-Find-My的Unwanted-Tracking-Alert功能详细解析-3.png)


![Untitled.png](/images/blog/Apple-Find-My的Unwanted-Tracking-Alert功能详细解析-4.png)


对于iOS手机系统如何判断自己是否被一个跟踪器持续跟踪，我的理解是：

- 手机的BLE打开的情况下持续的扫描周期的BLE设备，当然也就包括使用BLE的Find My Accessory设备。
- 如果手机系统检测到自己周围有一个处于Separated状态下的Find My Accessory设备，默认情况下会按照Find My Server运行的流程，从Find My Accessory设备BLE广播包中包含的密钥，加密自己所在的位置上报给Apple Find My Server。
- 但是如果手机系统检测到这个处于Separated状态下的Accessory在自己周围的时间过长，就会在系统上弹出Alert警告用户可能被跟踪。

这里值得注意的一点是，用户可以通过Find My APP控制周围处于Separated状态下的Accessory发出声音，来更快的找到这个Accessory所在的位置。既然要控制，那么用户的手机就一定要能够与这个Accessory建立BLE连接才行，Beacon模式肯定是没法实现控制的。因此在整个Find My的工作流程中，Non Owner的apple设备也就是手机，是可以与Find My Accessory建立连接并进行控制通信的。这个情况下这个控制指令，实际上使用的是Accessory中所实现的BLE Find My Network service中的Non Owner Control Point Characteristic：


![Untitled.png](/images/blog/Apple-Find-My的Unwanted-Tracking-Alert功能详细解析-5.png)


## 其他问题

1. Android设备对于Apple Find My Accessory的Unwanted Tracking Alert特性的支持情况？
- 实际上Google在这个方面也已经在仿效Apple打造自己的Find My Accessory生态，根据Nordic代理渠道得到的信息，目前国内已经有厂家使用Nordic的nRF52系列配合Google的find my协议需求完成了这部分功能的实现。
- 而根据参考文档2中Apple官方网站提供的描述，Apple和Google已经针对Find My的Unwanted Tracking Alert特性达成了协议一致性的产业标准（[draft-detecting-unwanted-location-trackers-01 - Detecting Unwanted Location Trackers (ietf.org)](https://datatracker.ietf.org/doc/draft-detecting-unwanted-location-trackers/01/)），以后无论用户是使用Android还是iOS的手机，都可以在触发Find My Unwanted Tracking Alert特性的情况下，在手机上收到可能被跟踪的警告信息。

![Untitled.png](/images/blog/Apple-Find-My的Unwanted-Tracking-Alert功能详细解析-6.png)

1. 当通过手机系统的Alert Message或者Accessory的周期性Motion Detection+Sound的机制发现跟踪设备后，如何处理？
- 从参考文档3给出的信息，除了把这个跟踪器扔掉以外，另外一个办法就是把这个跟踪器强制关机或者拔掉电池。

## 参考文档

- Find My Network Accessory Specification Release R2
- [Apple and Google deliver support for unwanted tracking alerts in iOS and Android - Apple (HK)](https://www.apple.com/hk/en/newsroom/2024/05/apple-and-google-deliver-support-for-unwanted-tracking-alerts-in-ios-and-android/)
- [How to find out if an AirTag is tracking you | ZDNET](https://www.zdnet.com/article/how-to-find-out-if-an-airtag-is-tracking-you/)
- [浅析 Find My 原理 - Yibin! - 博客园 (cnblogs.com)](https://www.cnblogs.com/yibin-cai/p/14705114.html)
