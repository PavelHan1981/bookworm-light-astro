---
title: "通用智能家居生态系统Matter入门"
slug: "2024-07-23-matter-beginner-guide"
description: "本文对智能家居生态系统的通用标准协议Matter进行了学习和总结，通过本文可以建立对于Matter的初步完整了解。"
date: 2024-07-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["物联网"]
tags: ["智能家居"]
draft: false
---


## Matter的缘起


在Matter之前，智能家居产品的产业界存在的一个严重问题就是设备与生态系统的碎片化，不同厂家规划和生产的智能家居设备局限于自己独立的生态之中，只能使用自己的Cloud和APP访问，不同厂家的生态与设备之间无法互联互通。这样造成的后果就是：

- 对于用户而言，要构建一个完整的智能家居生态系统，最好的选择就是使用同一厂家的生态和硬件产品，这样的体验相对更好一些，但是一个厂家的产品所能够覆盖的应用场景毕竟是有限的，不可能满足用户的所有要求；
- 或者就是用户要接受生态碎片化的现实，使用不同的APP来控制不同的智能家居硬件产品，而且各个硬件产品没有办法有效的互联，从而达到更个性化的智能控制体验。

而对于智能家居产品的硬件厂商而言，生产智能家居硬件，就需要开发和部署与之配套的APP以及Cloud，才能够给用户提供必要的使用体验，或者选择同时接入到多家主流的智能家居生态中，来尽可能广泛的支持用户的需求，这无疑增加了硬件产品的开发难度，延长产品的上市时间。


针对以上问题，其实国外Apple的Homekit，Amazon的Alexa，以及国内的小米米家等，也都尽量去建立一个智能家居生态，开放给不同的硬件生产厂家接入，从而达到在不同来源的智能家居硬件产品之间的互通性。但是这种生态有某个公司把握的情况下，势必会产生几家独大、相互竞争的局面，其实并不利用生态的有机成长，所以从目前的局面来看，国内和国外基本上最后都形成了几大互联网巨头生态并行竞争和发展，相互无法互通的情况，并没有能够解决用户使用和硬件厂商开发智能家居产品的痛点。


因此，为了彻底解决以上问题，Amazon、Apple、Google、Nordic、Silicon Labs等几大巨头联合起来，发布了在所有的智能家居产品之间互联互通的开放协议-Matter。


2022年10月4日，Matter的1.0版本协议规范文件正式发布。


## Matter的技术实现框架


### Matter本质上就是基于IP网络的应用层协议栈


如下图所示，Matter实际上就是一套基于IP网络的协议栈，运行在IP网络的网络层和传输层之上。因此要能够运行Matter的前提条件，就是设备上需要运行完整的TCP/IP网络的协议栈，然后再在网络协议栈的基础上移植和适配Matter的应用层。。


![Untitled.png](/images/blog/通用智能家居生态系统Matter入门-1.png)


### Matter基于局域网，无需Cloud


与Homekit类似，Matter本质上也是工作于局域网之中的，在同一个局域网中的Matter设备可以相互通信，但是Matter本身并没有Cloud的支持，所以外网设备无法直接访问在局域内网中部署的Matter生态系统及其设备，必须通过一个专门的Hub才行。相当于使用一个专门的Matter Hub在内网的Matter生态与外网的Cloud以及手机APP进行控制命令和状态信息的中转。


Matter规范本身并没有定义Hub与外网Cloud/APP之间通信的细节，依赖于Hub设备、云服务和APP的厂商来进行具体的实现，所以Matter设备可以通过Apple的HomePod作为Matter Hub，与Apple iCloud以及Apple手机上的Home APP通信，同样对于使用Android生态的用户而言，也可以使用Google的Nest Hub作为Matter Hub，与Google Home生态进行外网通信。


### Matter支持的底层通信方式：WiFi，以太网，Thread


本质上，Matter的通信协议是基于IP网络的，所以在其设备上所使用的通信方式中，使用WiFi和以太网就很好理解了。Thread是一种物理层和数据链路层使用802.15.4，但其上层使用IP网络的近距离通信协议，因此应用层通信可以使用网络socket以及TCP/IP进行实现。


值得注意的是，Matter是不支持单独使用BLE进行通信的，但是有些蓝牙芯片，例如Nodic或者Silicon labs推出的一些蓝牙芯片，均可以支持多协议，既可以运行蓝牙协议，也可以运行Thread协议，那么就可以使用这类芯片来进行Matter设备的开发。


### Border Router


在Matter所支持的三种底层通信方式之中，当Matter设备接入同一个无线路由器时，无论是以WiFi方式接入，还是以以太网方式接入，都是可以直接互联的。但是他们与使用Thread通信方式的Matter设备自然是没有办法直接进行通信的，这种情况下，就需要部署一个叫做Border Router的设备，来实现Thread设备与Wifi/以太网设备之间通信数据的中转。


![Untitled.png](/images/blog/通用智能家居生态系统Matter入门-2.png)


因此，一个Matter网络中存在Thread设备的话，就一定需要额外增加一个Border Router设备才能实现与WiFi/以太网设备的互联互通。不过，好在现在Apple HomePod，Amazon Alexa，Google Hub等设备的硬件可以支持802.15.4，因此可以被部署作为家庭Matter网络中的Border Router，这样也就不需要额外购买和部署独立的Border Router设备了。


## 如何使用Matter


以下总结从用户的角度上，基于Matter搭建自己的智能家居生态系统的流程。


### 入口系统的选择


首先是，需要选择一个控制整个智能家居生态系统的入口系统，也就是Matter Controller，一般是不同品牌的智能音箱。


如上所述，Matter协议解决了不同厂家的智能家居硬件品牌设备之间的互联互通问题，但是Matter只是工作于局域网之内。因此从理论上讲，如果不考虑在外网中使用智能家居产品的话，只需要在手机上安装一个支持Matter协议的APP，接入家里的局域网，就能够基于Matter的局域网通信协议与同一网络下的所有Matter设备进行通信了。但是如果只能在局域网内使用的话，智能家居的使用体验就要大打折扣了。所以真正要有好的体验，就一定需要能够提供通过外网来访问家庭网络内部Matter智能家居生态的途径。要实现这个需求，就需要有一个Matter Controller对所有Matter设备进行管理，并且配合公网上部署的Cloud以及手机APP等，无论手机在内网还是外网，都可以通过公网Cloud+入口设备中转的方式，实现对内网Matter设备的状态获取和控制。


对于Matter生态推广有利的一点是，现在主流的智能家居生态基本上都支持了作为Matter Controller：

- Amazon Alexa智能音箱及其APP
- Apple HomePod音箱及其Apple Home APP
- Google Home APP及其旗下的Nest智能音箱
- 三星的SmartThings产品线及其APP

![smarthome-oekosysteme-1.jpg](/images/blog/通用智能家居生态系统Matter入门-3.jpg)


所以，只要用户有以上设备并且升级到较新的版本，都可以在这个系统中继续增加通过Matter认证的智能家居设备，并且仍然像之前使用封闭生态一样的方式继续使用Matter系统。不同的是，之前用户在这个系统中只能加入通过这个封闭系统认证的设备才能够被识别，现在只需要购买符合Matter协议的设备，就可以加入到任意生态之中。


值得注意的是，Matter可以支持在同一系统中包含有多个Matter Controller，这样也就意味着如果家里同时有Alexa和HomePod的话，那么就可以同时使用Amazon和Apple的入口和APP对这个智能家居系统进行控制。


### 如果有使用Thread通信的Matter设备，需要额外增加Border Router


如前所述，对于Matter所支持的三种通信方式而言，以太网和WiFi可以直接与家里的无线/路由器连接，不需要做额外的中转。但是如果Matter设备采用的是802.15.4的Thread通信方式，就一定需要在网络内部增加一个Border Router来实现802.15.4与以太网以及WiFi之间的中转。当然部分型号的智能音箱本身已经支持了802.15.4，那么它就可以同时作为Border Router。但是如果Hub不支持802.15.4的话，就需要额外部署一个Border Router，这样才能把Thread协议的Matter设备接入到Matter网络之中。


### Matter设备的设置


前面已经选择好了使用Matter智能家居系统的Matter Controller，对于新购买的Matter设备，拿到手以后做的第一件事情当然就是，通过这个生态系统对应的手机APP（例如Apple和Google的Home APP），通过扫描二维码等方式，把这个设备加入到Matter网络中，这个过程叫做Commissioning。


![Untitled.png](/images/blog/通用智能家居生态系统Matter入门-4.png)


每一个通过Matter认证的Matter设备在出厂的时候都会有一个二维码，使用符合Matter协议的APP扫码后会传输网络接入密钥以及后续在Matter设备之间进行通信的各种密钥对（Matter设备与Controller之间的通信都是使用这个密钥对进行加密保护的，所以即使是局域网内的通信，也可以保证是安全的），为这个设备指定房间等，就可以把这个设备加入到当前的Matter网络中了。


### Matter设备的控制和自动化


经过以上所谓的Commissioning操作以后，Matter设备已经成功的加入到了Matter网络之中，可以配合手机app以及智能音箱的语音命令工作了，手机APP和带屏的智能音箱上也能够显示出来当前已经加入到Matter网络中的设备及其状态了。后续对于Matter设备的控制操作，由手机APP和智能音箱按照Matter协议的定义，发出网络命令来进行控制。而智能家居领域常见的跟进场景自动化控制的功能，与Matter本身无关，由Matter Controller（实际上仍然是手机APP或者智能音箱）进行各种自动化场景的规划并按照Schdule和事件等触发条件自动发出命令对Matter设备发出控制命令。


### 利用Matter设备的厂商APP实现额外功能


如果Matter设备里面包含了一些更为复杂和个性化的功能，这些功能并没有在Matter协议支持的情况下，Matter厂商也可以针对这些功能的使用，提供自己的APP来实现对这些功能的支持。这一点实际上有些类似于Homekit，Homekit生态下的智能家居设备，既可以配合Homepod以及iPhone、iCloud等Apple生态使用，也可以支持使用设备厂商自己所提供的Cloud和APP，来使用一些Homekit无法支持的个性化功能。


## 参考文档

- [The Engineer’s Guide To Matter | by Ovyl](https://ovyl.io/blog-posts/matter-smart-home)
- [How to set up a smart home with Matter - step by step | matter-smarthome](https://matter-smarthome.de/en/practice/how-to-set-up-a-smart-home-with-matter-step-by-step/)
