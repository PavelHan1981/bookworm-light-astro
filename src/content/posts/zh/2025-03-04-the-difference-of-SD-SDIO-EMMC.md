---
title: "SD卡与SDIO接口、eMMC之间的联系与区别"
slug: "2025-03-04-the-difference-of-SD-SDIO-EMMC"
description: "SDIO（Secure Digital Input Output）和SD卡（Secure Digital Memory Card）同属于SD（Secure Digital）的标准体系，但二者的设计目标与功能实现有明显差异：SD卡是存储类的专用设备，而SDIO则为泛用型外设利用相同的SD接口以及类似的SD协议框架提供了高速扩展接口。简单的说，SDIO和SD卡两者在硬件物理层上完全兼容，但是具体的通信协议上各自发展出来自己的体系。"
date: 2025-03-04T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["SD"]
draft: false
---


工作中接触到的主控芯片中，在其支持的SD主控及其接口的支持上，大概率都会提到该SD主控可以支持SD协议、SDIO协议以及eMMC协议规范的不同版本。例如下图是君正T41的SD主控对于这些不同协议规范版本的支持情况：


![image.png](/images/blog/SD卡与SDIO接口、eMMC之间的联系与区别-1.png)


那么SD主控所支持的SD卡、SDIO以及eMMC等接口和规范协议之间的连续和区别是什么呢？


### SD卡与SDIO接口的联系与区别


SDIO（Secure Digital Input Output）和SD卡（Secure Digital Memory Card）同属于SD（Secure Digital）的标准体系，但二者的设计目标与功能实现有明显差异：SD卡是存储类的专用设备，而SDIO则为泛用型外设利用相同的SD接口以及类似的SD协议框架提供了高速扩展接口。简单的说，SDIO和SD卡两者在硬件物理层上完全兼容，但是具体的通信协议上各自发展出来自己的体系。


硬件物理层的相互兼容包括：

- 相同的引脚定义：SDIO设备与SD卡使用相同的物理接口（也就是9引脚 micro/SD接口）。
- 电气规范一致：SDIO设备和接口均遵循SD协会定义的电压范围（3.3V或1.8V UHS模式）与信号电平标准。

双方在协议层方面的差异：

- SD命令集分支：SD卡仅实现SD存储协议（侧重于块读写指令），而SDIO则扩展了SDIO协议用于支持通用设备的控制。
- 初始化流程：SD主控制器通过发送CMD5命令检测来插入设备是存储卡还是SDIO外设。

因此SD卡（存储）与SDIO（扩展外设）规范协议栈两者共享物理层，但核心功能与技术规范的演进方向相互独立发展，因此SD卡与SDIO的标准规范是独立的。这就是为什么大多数主控SOC在SD控制器的规格中都分别给出了SD和SDIO的规范支持版本。以下是SDIO协议规范的演进以及各个版本的重点支持特性：


![image.png](/images/blog/SD卡与SDIO接口、eMMC之间的联系与区别-2.png)


### SD卡与eMMC之间的联系与区别


SD卡和eMMC都是利用SD接口来解决存储存储的问题，不同的只是SD卡针对的应用场合是可移动、可插拔的使用场景，而eMMC针对的则是嵌入式焊接的方式固定到产品中的应用场景。

- 也就是说，SD卡是可以在产品的SD卡槽中可插拔使用，可以更换；而eMMC是直接焊接在产品的电路板上的，不可更换。但是两者都是通过SD接口连接到主控芯片上。

两者的技术根源类似（均衍生自MMC协议），所以大多数主控的SD控制都能够同时兼容SD卡、SDIO以及eMMC，但是SD卡和eMMC在使用方式上的差异还是会导致两者在物理层和驱动命令集方面的差异：

- 在物理层的电气信号上，SD卡要求更高的ESD防护（因为支持可插拔），而eMMC则依赖PCB信号的完整性设计。
- 两者支持的SD总线的时钟和规范也有差异，例如eMMC 5.1规范的HS400可支持200MHz DDR双边沿采样数据。
- SD协议通信的命令集方面，两者也有差异，并且包含一些各自独有的命令集。

最重要的是，SD卡和eMMC协议背后的组织不同。SD卡以及SDIO的相关协议规范的组织是SD协会（SD Association），而eMMC的协议规范则是由JEDEC来制定和维护。SD协会重点兼容历史设备（向后兼容SDHC插槽），而JEDEC则推动eMMC与UFS接轨（为UFS铺路），因此随着规范的演进，两者之间的差异会越来越大。

