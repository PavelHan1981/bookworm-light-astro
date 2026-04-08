---
title: "基于CV4003IoT Sensor实现Pre Roll电池摄像头方案"
slug: "2024-11-26-the-pre-roll-bpi-solution-using-cv4003IoT"
description: "本文总结了基于深圳创视微电子推出的CV4003IoT Image Sensor，实现完整的低成本pre roll电池摄像头的方案，与对比了该pre roll方案与AOV方案之间的优劣势。"
date: 2024-11-26T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["Image Sensor","低功耗","智能家居"]
draft: false
---


## 电池摄像头的Pre Roll工作模式


之前我在另外一篇笔记（[Ring Doorbell的Pre Roll功能及其工作原理](https://mp.weixin.qq.com/s/S-BWCYDzr7-RXVu9A71ucQ)）中详细总结和分析了Ring Doorbell中大力推广的Pre Roll模式的工作原理和系统设计框架。


在电池摄像头Pre Roll模式的宣传推广和技术产品演进过程中，OmniVision始终处于相对比较积极的状态之中，所以目前能够找到的关于Pre Roll模式设计方案的公开资料，大多数都来自于OmniVision。下图就是从OmniVision公网宣传资料上得到的一张关于pre roll模式的系统设计示意图：


![image.png](/images/blog/基于CV4003IoT-Sensor实现Pre-Roll电池摄像头方案-1.png)


相比于普通的BPI Camera产品而言，Pre Roll Camera在系统设计方面最明显的部分就是上图的Always On Camera Block部分，其他部分跟别的BPI Camera部分的设计别无二致。在Always On Camera Block中，主要包含了一个Image Sensor（OS04C）和一个Pre Roll图像协处理器OA7600，这两个部分在工作中都处于长期上电的状态，只不过Image Sensor设置为定时唤醒曝光一帧图像送入协处理器进行Motion判断和Pre roll存储，然后继续休眠以降低Sensor所产生的功耗，而OA7600这个Pre Roll协处理器就负责接收来自Image Sensor的time elapse图像帧，进行Motion判断并把图像帧滚动保存在其内部的RAM Buffer中。当协处理器的Motion判断有效的情况下，立即同时唤醒Image Sensor和后一级的应用处理器，并在后续工作中把Pre Roll RAM Buffer中缓存的time elapse图像帧传入应用处理器，与实时图像一起压缩存储为事件录影文件。


以上方案存在的问题是：Always On Camera Block部分的系统设计有些复杂了，导致产品的实现难度较大，成本也会比较高。这个问题使用创视微电子的CV4003IoT Image Sensor可以得到非常完美的解决。


## CV4003IoT Image Sensor的规格简介


CV4003IoT是创视微电子推出的一颗400万像素CMOS Image Sensor。相比于其他的图像传感器，其最大的特色是能够在Sensor内部支持Always On Pre Roll和Smart Motion Detection以及Wake on Motion应用。相当于是直接在Image Sensor内部独立的完成了以上OmniVision框图中Image Sensor+Pre Roll协处理器的工作，既简化了系统设计与实现的复杂性，也降低了开发难度和成本。


CV4003IoT的主要规格：

- 400万像素，2560x1440即2.5K。最高可通过MIPI接口输出2.5K 50fps的10bit Bayer RAW图像。
- Sensor尺寸1/3英寸，pixel size是2.0um。
- 图像接口：MIPI（1lane/2lane），DVP（8bit），SPI（2ch/4ch）
- 可支持stagger HDR
- 可支持水平和垂直方向翻转输出
- 可支持Window Cropping和bining模式输出
- 差异化特性：
    - Smart Motion Detect，可以在Sensor内部进行连续两帧之间的motion判断并给出结果
    - Fast AEC/AGC，要支持sensor独立实现pre roll模式，sensor就必须自己能够支持自动曝光特性，不依赖于ISP
    - Always On Pre Roll，支持pre roll模式，把time elapse frame保存在缓存中
    - Always On Wake On Motion，可以支持在Pre roll模式运行的过程中根据Motion判断唤醒应用处理器

![1732609349424.png](/images/blog/基于CV4003IoT-Sensor实现Pre-Roll电池摄像头方案-2.png)


以上CV4003IoT框图与普通Image Sensor的最大区别在于两点：

- 额外增加了一个Image Processing Block，应该是专门用于进行Motion、AEC、Pre Roll相关功能的处理。
- 支持的三组输出接口DVP、MIPI、SPI是分开独立的接口，具体的实现上可以使用MIPI与后一级的应用处理器SOC接口传输Sensor的图像数据，使用SPI与Pre Roll RAM buffer接口，用于保存time elapse video frame到buffer中。

## 基于CV4003IoT实现的Pre Roll电池机方案


从以上CV4003Iot所具备的规格参数以及结构框图上看，基本上可以认为CV4003IoT的作用就是OmniVision方案的Always On Image Sensor和协处理器的组合，把整个Always On Camera Block全部包在Sensor内部了。集成度更高的同时，简化了产品设计和开发的难度，也降低了整体的BOM成本。


以下是基于CV4003IoT来实现Pre Roll电池摄像头的方案框图：


![1732615009346.png](/images/blog/基于CV4003IoT-Sensor实现Pre-Roll电池摄像头方案-3.png)


可以看到，使用CV4003IoT以后，整个Always On Camera Block部分简化到只有一个CV4003IoT Image Sensor，再加上一个SPI接口的PSRAM用于作为Pre Roll Buffer缓存time elapse video frame。


实际运行的过程中，AV4003IoT Sensor和PSRAM始终处于上电状态，后级的SOC等电路则处于掉电状态以降低功耗。AV4003IoT Sensor按照设置每1-2s读取一个图像帧，进行Motion Detction的情况下同时通过SPI接口滚动保存在PSRAM中。


当Sensor内部的Motion Detection算法检测到Motion事件时，Sensor会唤醒SOC，SOC通过MIPI接口读取并压缩保存来自Sensor的实时图像流和缓存在PSRAM中的time elapse图像帧，记录完整的事件录像。


## 再次对比Pre Roll与AOV的实现


基于以上CV4003IoT方案再来思考一下，对于电池+/太阳能板供电的这类低功耗摄像头产品而言，这种Pre Roll工作模式相比于AOV工作模式的优劣势：

- 成本和实现复杂性。之前OmniVision的Pre roll方案因为对Sensor和应用处理器SOC都有要求，而且还要增加Pre Roll协处理器，整个系统设计相对比较复杂，导致成本也会比较高。创视微CV4003IoT的这个方案把Sensor和协处理器合并在一起，对应用处理器SOC也没有额外的要求，就是普通的能够支持MIPI接口的电池摄像头方案就可以，那么就可以采用类似君正T23、瑞芯微RV1103以及爱芯AX520这类low cost的BPI方案，整机的成本就可以做的比较低了。而AOV方案，目前相对比较成熟的，例如君正T41以及爱芯的AX620，相对价格还都比较高。所以在这一点上，采用CV4003IoT搭配low cost BPI方案的价格应该是可以做的更低。
- 功耗。Pre roll模式相比AOV在功耗方面当然是大幅降低了，按照CV4003IoT宣传资料给出的数据，即使Sensor端缓存的time elapse frame的分辨率是原图的4M尺寸，平均功耗也可以做到5mW，这个功耗基本上是目前主流AOV方案的1/10。所以基本上AOV脱离了太阳能板就很难提供良好的使用体验了，而Pre Roll模式在BPI的基础上增加5mW的待机功耗，搭配10000mAh的电池，产品的续航时间基本上还是能够覆盖大部分应用场景需求的。
- 快起、快连时间。Pre Roll模式下后一级的应用处理器SOC是处于完全掉电的状态的，每次Motion/PIR检测有效的情况下才唤醒SOC，整个Kernel、文件系统和应用程序要从头加载，而AOV模式下，DDR不断电，每次唤醒后直接从原来的代码执行位置继续执行，只需要重新加载wifi驱动即可，所以快起以及联网时间上Pre Roll相比于AOV肯定是比较差的。不过，无论pre roll模式还是AOV模式，因为time elapse的图像帧已经被缓存在buffer中了，所以这个时间上的延迟应该不会造成很大的用户痛点。
- Sensor选型限制。基于CV4003IoT的Pre roll方案的核心就在于这个Image Sensor，所以离开了这个Sensor整个方案也就不存在了，那么产品的图像效果、性能基本上都会受限于这个Sensor本身的能力和表现。而AOV方案中，只要能够支持suspend、resume模式的Image Sensor一般而言都是可以用的，所以相比之下，使用AOV方案，在Sensor挑选空间上就会比较大一些，可以根据自己应用的需求选择不同分辨率以及其他规格参数的Sensor。不过CV4003IoT在提供了Pre roll功能的情况下，价格只有1.x，也算是性价比非常好的方案了。

## 参考资料

- CV4003IoT CMOS Image Sensor Data Sheet
