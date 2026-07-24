---
title: "基于Homekit的Video Camera生态调研总结"
slug: "2024-07-15-homekit-secure-camera-study-summary"
description: "本文基于对网络上Apple Homekit智能家居生态公开资料的学习，总结了Homekit生态使用和实现方面的技术背景，重点对其中针对智能家居摄像头所提供的Homekit Secure Video业务及其技术实现原理进行了描述。"
date: 2024-07-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["物联网"]
tags: ["MFI","音视频"]
draft: false
---


因工作需要，对Apple Homekit生态下的Video Camera进行调研和总结，判断是否可以作为下一个产品预研点的选项之一。因此以下资料仅包含对网络公开资料的学习和总结，尚未拿到Apple Homekit MFI认证相关的文档和资料，也没有进行实际设备在苹果Homekit生态中实际使用体验和测试。


## Homekit生态基本总结


Homekit是Apple在2014年6月份的全球开发者大会WWDC中发布的智能家居生态。Homekit本质上是苹果针对智能家居领域所定义的一套标准和规范，基于对标准规范的支持，该生态下的智能家居设备可以方便的通过苹果设备和语音助手Siri进行交互通信和自动化控制。


在Apple Homekit智能家居生态之中，苹果提供了这个生态与用户之间进行访问和交互的入口，定义了一套所有的设备与接口之间的通信协议和规范，由各个硬件厂商按照这个协议规范来实现不同类型的智能家居硬件，当然开始销售之前需要通过Apple Homekit类型的MFI认证（Works with Apple Homekit）。硬件厂商所开发的只能家居硬件一旦通过以上认证，就可以与同样遵守Apple Homekit规范的其他厂家所生产的智能家居设备在同一个生态下进行通信。

- 苹果的典型访问入口设备包括：iPhone，iPad，MAC，Homepod，Apple TV，Siri，甚至包括Apple Watch。
- 苹果自己并不生产智能家居硬件，而是提供了一套可与苹果设备进行交互的智能家居协议规范，由各个硬件厂家基于这个规范开发智能家居硬件产品，通过Homekit的MFI认证后即可加入苹果的Homekit智能家居生态。这样就避免了苹果自己生产制造硬件与各个硬件厂商之间的竞争关系，有利于生态的推广。

在苹果设备上，Homekit的访问入口是Home家庭APP。在Home APP中包含了对多种典型的智能家居设备类型的支持。比较典型的就是各种传感器（温湿度、气体、烟雾探测）、门锁、摄像头、灯、开关插座、家电等。


![Untitled.png](/images/blog/基于Homekit的Video-Camera生态调研总结-1.png)


### Homekit本质上是基于局域网的


按照我自己之前的理解，苹果的Homekit生态，应该就是Apple需要针对主流的智能家居产品的应用，搭建一个云服务，这样所有以wifi连接方式的智能家居产品就可以直接连接Apple的智能家居云服务。但是经过更深入的学习（尤其是参考链接4），才发现并非如此，**Apple的Homekit在网络通信层面上是基于局域网的，所有的消息都是在局域网内部流转的，Apple针对Homekit并没有提供完整的远端云服务层面上的智能家居支持**。这一点跟小米的米家还是有着非常大的区别，米家的所有设备都是直接连接小米的米家云服务平台的，所以可以通过小米的云服务来实现直接控制，因此实际上米家的设计在使用上更方便一些。


当然，Homekit生态工作在局域网之内的设计也有着诸多好处：

- 所有的用户数据都在局域网内，个人数据的隐私保护和安全性最好。
- 在局域网内使用，通信数据的收发速度很快，智能家居产品和服务在局域网内使用的情况下，响应速度很快。
- 只要局域网正常，即使外网断了（当然这种情况极少），在局域网内部使用Homekit的所有功能仍然是正常的。
- 其实对于大多数智能家居产品的使用场景而言，基本上都是在家内的局域网环境中使用的，所以其实在局域网内使用就可以满足绝大多数的要求。当然Apple当然也针对在外网对家庭内部的Homekit生态设备提供了解决方案。

那么针对需要在远端对Homekit生态下的智能家居设备进行远程访问和控制的话，应该怎么做呢？答案就是一定要在局域网内有一个Apple Homekit的控制中枢。这个控制中枢可以是苹果的HomePod智能音箱，Apple TV或者iPad（尽管目前仍然支持使用iPad作为控制中枢，但是Apple更建议使用Homepod或者AppleTV作为控制中枢，从网络上也能够查到使用iPad作为中枢存在一些不稳定性方面的问题）。在链接[将 HomePod、HomePod mini、Apple TV 或 iPad 设置为家居中枢 - 官方 Apple 支持 (中国)](https://support.apple.com/zh-cn/102557)中提供了设置以上设备为Homekit控制中枢的指南。


也就是说，HomeKit本身是基于局域网进行通信的，但是如果有远端访问家庭内智能家居设备的需求的话，就一定要先在自己的Home APP中设置一个Homekit控制中枢，并且保证这个控制中枢与自己所有的HomeKit智能家居产品处于同一个局域网内，并且保持通电状态，这样处于外网的iPhone和MAC等设备就可以通过苹果的iCloud服务把控制命令发给家里的Homekit控制中枢，然后再由控制中枢中转发给自己指定的智能家居设备。


## Homekit Secure Video System功能支持的基本情况


Homekit对于IP Camera支持的服务全称是 Apple’s HomeKit Secure Video system (HSV)，从名称上就可以看出来主打的就是安全。目前HomeKit摄像头产品所提供的支持来看，主要包含了indoor camera，outdoor camera以及doorbell camera这几个品类。Eufy，Logitech、Aqara、Eve等厂家都已经推出了可以支持Homekit生态的摄像头产品。


当然，为了能够流畅的使用Homekit生态下的Secure Video System服务，至少需要有一个Homepod/Apple TV/iPad作为控制中枢，以及需要iCloud订阅来上传和保存camera的事件录像片段。


目前Apple iCloud对于HSV Camera上传录像片段的订阅费用如下：

- **50 GB plan** ($1 or £1 a month): one camera.
- **200 GB plan** ($3 or £3 a month): up to five cameras.
- **2 TB plan** ($10 or £9 a month): unlimited cameras.

相比于Ring、Arlo这些动辄每月10$的订阅费用，应该来说这个价格还算是比较亲民的（当然Homekit对于这些IP Camera支持的专业性上还是要差很远），尤其是考虑上传的事件录像视频片段并不会占用iCloud的存储额度。


对于一个典型的智能家居摄像头而言，其基本功能无外乎：

- 事件录像功能：通过PIR或者图像检测等方式侦测触发事件，触发后拍一段录像存卡或者上传云端保存。
- 实时流功能：用户可以自己想要查看摄像头当前的实时流时，随时拿起手机打开APP查看实时流。

对于事件录像功能，摄像头本身仍然按照自己的工作逻辑检测事件并录像即可，但是在Homekit生态的实现下，额外就需要考虑如何上传事件录像文件到iCloud上。按照我的理解，因为Homekit本身是基于局域网的，所以事件录像文件上传iCloud，就只能依赖于家庭中枢设备才行：即由家庭中枢设备负责把收到的事件录像视频文件上传到iCloud，一旦上传iCloud以后，自然就可以在Home APP上回放观看这些事件录像文件了。


对于实时流功能大致应该也是如此。通过Home APP的实时拉流指令首先发到家庭中枢设备上，然后家庭中枢设备从Homekit摄像头上拉流再转发到Home APP上解码显示出来。


> 💡 此外，Apple并不限制摄像头硬件生产商在Homekit生态的基础上，额外增加自己的特殊功能、APP和Cloud业务的支持。因此，对于摄像头生产商而言，可以在产品设计中同时内置对于Homekit生态的支持，以及对于自己的APP+云业务的支持；而用户而言，也同时可以在同一个摄像头硬件上，打开Apple Home APP来使用Homekit的功能，而对于一些Homekit上无法支持的功能，则可以使用硬件厂商所提供的APP来实现。


## Homekit Secure Video的优缺点


### Strength：

- Apple在用户隐私数据的保护上口碑一直比较好，这一点对于摄像头而言尤其如此，这也是极其注重个人隐私的欧美用户青睐Apple生态的原因之一。按照Apple的宣传，所有的视频数据以及Video Live Streaming数据，都是端到端加密的，只有用户自己能看到，即使是摄像头的硬件厂商以及Apple自己都没法访问这些隐私数据。
- 可以支持基本的人脸识别、人形、车辆、包裹、宠物检测、Multiple Motion Zone等算法，可以基于这些检测结果设置不同的触发事件类型。

### Weakness：

- 基于Homekit的相关功能只能在苹果生态下使用，用户无法通过Android系统使用Home App。
- HSV只支持基于触发事件的视频录像数据上传到iCloud，不支持7x24连续录像。
- 最高只能支持1080P分辨率，这一点与较为专业的IPC相比，还是一个比较大的短板所在，现在主流厂家推广的新品基本上都是2K和2.5K了。
- 缺乏一些基本的功能支持，Siren，云台控制等。

## 参考资料

- [Apple HomeKit Secure Video: Pros and Cons | WIRED](https://www.wired.com/story/apple-homekit-secure-video-pros-and-cons/)
- [All Netatmo Smart Cameras now support HomeKit Secure Video](https://www.netatmo.com/en-gb/blog/camera-homekit-video-support)
- [HomeKit connection from Philips Hue requires a home hub - Hueblog.com](https://hueblog.com/2023/12/25/homekit-connection-from-philips-hue-requires-a-home-hub/)
- [从苹果生态环境的优越性来看看HomeKit有多厉害 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/73323549)
