---
title: "2024 US主流消费类NVR功能与规格参数总结"
slug: "2024-12-13-the-suammary-of-the-feature-and-specification-of-consumer-NVR"
description: "通过对Amazon US市场上的主流消费类NVR产品相关宣传资料的学习，整理出来该行业中主流产品所具备的功能列表和规格参数。"
date: 2024-12-13T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["音视频"]
draft: false
---


对Amazon US市场上消费类NVR主流厂家在2024年主推的NVR型号所具备的基本功能和规格参数进行，从而梳理出来目前该市场和产品领域的典型产品形态。


从Amazon US以及网络搜索的相关资料看到，目前北美市场上的消费类NVR的主流厂家包括：Swann，Annke，Amecrest，Reolink。以下从各个品牌挑选一款主打的NVR产品进行功能和规格参数的汇总。


## 总结


支持的硬盘规格接口及其数量：一般都包含两个SATA接口用于连接机械硬盘，单块硬盘最大一般是6/8TB。


最大可以同时接入的摄像头数量：8/16/32路。


主流新产品接入图像流的最大分辨率目前已经普遍达到了12M（4096 x 3072），8M（3840 x 2160）。


视频编码：H.264，H.264+，H.265，H.265+。


NVR本地解码的最大分辨率：单路或者多路4K/12M 30fps视频解码。


与摄像头设备的连接方式上，目前来看主流NVR产品仍然是使用POE或者以太网接口连接摄像头，尤其是POE同时具备网线和供电的功能，对于有线摄像头接入NVR系统来讲，使用非常便利，基本上POE是目前NVR产品的主流接入方式。

- 也有部分NVR可以支持WiFi摄像头，但是考虑到WiFi的信号质量不确定性和传输速度，使用WiFi的情况下，会对接入图像流的分辨率、码率、同时接入的数量、录像模式（例如不支持7x24录像）等势必有所限制。
- Amazon也可以搜到部分主打Wireless WiFi的NVR，主要就是接入wifi摄像头，但是在支持的摄像头图像参数硬件规格上就要差很多，摄像头图像分辨率普遍是1080P的水平，销量也不是很高。

大部分型号NVR主要还是跟自家的摄像头配合使用。即使可以支持标准化协议的第三方厂家的摄像头接入，部分高级功能（例如各种AI功能）无法使用，还是与自家的摄像头配合的兼容性最好。


NVR的本地显示和回放接口基本上都是HDMI（4K/6K）和VGA（1080P），使用HDMI连接高清电视和显示器，可以用USB接口的鼠标或键盘直接操作NVR，查看IP Camera上的实时图像流，以及搜索和回放NVR上的历史视频文件。


目前主流的NVR产品，对于其硬盘上存储的摄像头视频文件的内容还会进行一次加密强度更高的二次加密，只能在用户输入正确的密码后调用专门的播放器才能正常播放出来。这样的话即使NVR上的硬盘被盗，也不用担心隐私数据泄露。


NVR所支持的AI功能主要包括：人形、车辆、人脸检测、人脸识别、电子围栏等。

- 关于AI功能的实现，其实我是有一个疑问：以上所罗列的AI功能，基本上在IPC方案上都已经支持的很好了。那么NVR在宣传中所讲的所谓AI势必和检测的功能，到底是在Camera上实现的还是在NVR上实现的？按照我自己的理解，没有任何必要在NVR上实现，因为一方面是这些AI对于IPC而言都可以支持，另外一方面则是NVR要做AI检测的话就需要把接收到的图像解码后，基于解码得到的YUV图像进行AI运算，对于多路Camera而言，这个loading是非常重的，当然也就会大大提升NVR本身的硬件成本。除非是NVR所采用的硬件方案AI算力更强大，所以能够实现和执行无法在IPC上运行的AI算法，在这种情况下把AI算法放在NVR上跑才是合理的。

## Swann SONVR-168580


![80eed8b7-2f92-4f59-b6f9-bd7d874e4616.png](/images/blog/2024-US主流消费类NVR功能与规格参数总结-1.png)


硬盘方面，该系统内置一块3TB SATA接口硬盘，最高可扩展到16TB（2 x 8TB）存储。


摄像头接入方面：

- 最高可支持16个Swann 4K POE摄像头，NVR上自带有16个支持POE的网口，不需要额外的POE交换机，POE摄像头直接通过POE网线接入NVR。
- 明确定义只支持Swann自家的摄像头接入，不兼容其他的第三方摄像头。

![1734070520773.png](/images/blog/2024-US主流消费类NVR功能与规格参数总结-2.png)


支持的AI功能包括：人形检测，车辆检测。


可通过Swann Security APP访问NVR，可以接收所有接入摄像头的实时流，推送事件通知，回放摄像头的历史视频文件。


其他功能：

- Swann NVR有一个很有特色的功能，就是可以把NVR中的摄像头视频文件保存在用户自己的dropbox账号中，相当于通过用户自己的dropbox的存储空间来做云存的实现，万一NVR本身被破坏，监控数据在云端也有备份。
- 支持通过Google Home、Echo Show这类带屏的智能音箱设备访问摄像头的实时图像。

价格：500$。


## **Amcrest 4K NV5232-EI/NV4232-EI**


![image.png](/images/blog/2024-US主流消费类NVR功能与规格参数总结-3.png)


硬盘规格：最大可以支持两块Sata硬盘接入，每块硬盘最高可达16TB。


解码能力方面：

- NV5232-EI：最高同时8路4K 30fps或者32路1080P 30fps规格的视频图像解码。
- NV5232-EI：最高同时2路4K 30fps或者32路1080P 30fps规格的视频图像解码。

摄像头接入方面：

- 最高支持32路1080p/3MP/4MP/5MP/6MP/4K/12MP分辨率的摄像头同时接入NVR进行存储。NV5232-EI型号最高支持384Mbps吞吐率，NV4232-EI最高支持256Mbps吞吐率。
- 支持Amcrest自家的WiFi和以太网摄像头接入，但NVR机身上不带以太网和POE接口，需要用户把摄像头用网线接到同一网段的路由器或者交换机上。对于支持32路摄像头接入的NVR产品而言，如果要在机身背后包含32个以太网或者POE接口，确实也是比较臃肿的设计，合理的做法干脆也就是把网口接入的功能下放到独立的交换机上更为合理。
- 未提到是否可支持其他厂家的兼容摄像头接入，网络上查到的资料相互矛盾：Supports all Amcrest WiFi and Wired IP cameras and limited compatibility with third-party brand IP cameras. The system will only work with Amcrest cameras/systems and support IP cameras.。

支持的AI算法：人形、车辆、人脸检测、人脸识别、电子围栏。部分AI功能只能与Amcrest特定的AI Camera配合使用才能支持。


通过Amcrest View APP远程访问和管理NVR，也可以通过Amcrest提供的web页面，使用浏览器接入远程访问。


其他功能：

- 可通过机身上的USB接口连接U盘，实现方便的数据备份功能。
- 可支持快速的AI搜索的功能，例如基于人形或者车辆检测算法的检测结果进行快速搜索。

价格（不带硬盘）：

- NV5232-EI：476$
- NV4232-EI：279$

## **ANNKE 16CH 4K PoE Security Camera System**


![image.png](/images/blog/2024-US主流消费类NVR功能与规格参数总结-4.png)


包含16通道4K POE Camera接入的NVR+内置4TB硬盘+8个POE 4K Camera的完整NVR监控系统。


最大可以同时接入16路4K（3840 x 2160）POE Camera。


NVR中内置4TB硬盘，包含两个SATA接口，最大可以自行扩展支持16TB（2 x 8TB）的硬盘存储空间。


支持POE Camera上的AI检测算法：人形检测，车辆检测。


可使用Annke Vision APP远程NVR连接的所有POE摄像头的实时图像，NVR中存储的历史视频文件，以及对AI检测到的人形、车辆等图像进行搜索回放。


价格：900$


## **REOLINK RLK16-800B8**


![image.png](/images/blog/2024-US主流消费类NVR功能与规格参数总结-5.png)


Reolink的RLK16-800B8是一套包含16通道4K NVR+4TB硬盘+16个4K POE Camera在内的完整NVR监控系统。


内置4TB硬盘，包含两个SATA接口，可以自行扩展最高支持16TB（2 x 8TB）硬盘空间。能够支持7x24小时录像或者检测事件触发录像的工作模式。


最高可以支持16路4K POE摄像头的接入。


机身背面包含16个POE接口，可以直接连接Reolink的POE Camera。


通过Reolink APP可以远程方案连接到该NVR上的所有POE摄像头的实时图像流，访问和回放NVR中存储的历史视频文件，以及收到NVR推送的触发事件消息。


**所有存储在NVR硬盘中的录像文件使用符合业界安全规范的加密算法进行加密存储。**


NVR本地回放显示接口支持HDMI 4K和VGA 1080P。本地回放过程中可以支持对1路4K 20fps或者对四路4Mp 20fps摄像头压缩视频进行解码。


AI功能方面，系统在包含的POE Camera本身可以支持人形检测和车辆检测算法。


价格：665$

