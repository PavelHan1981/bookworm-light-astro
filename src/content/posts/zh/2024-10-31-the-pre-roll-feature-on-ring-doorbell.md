---
title: "Ring Doorbell的Pre Roll功能及其工作原理"
slug: "2024-10-31-the-pre-roll-feature-on-ring-doorbell"
description: "本文对Ring Doorbell以及OmniVision所主推的Pre Roll功能的工作原理进行了整理，基于OV的OA7600系统设计框架总结了Pre Roll模式下系统的完整工作流程，以及AOV与Pre Roll模式的优劣势对比。"
date: 2024-10-31T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["音视频"]
draft: false
---


## Ring Doorbell的Pre Roll和Advanced Pre Roll


Ring目前是北美和欧洲Doorbell市场的主流供应商，其有线以及无线门铃摄像头产品的Pre Roll和Advanced Pre Roll功能颇受用户好评。


对于无线门铃摄像头而言，正常的使用场景及其产品设计是通过PIR来检测门口人员的活动，在人接近的时候提前触发摄像头开始录像，并向用户的手机上推送消息和事件录像。但是PIR本身的工作特性限制下，摄像头的触发时间往往过晚，导致摄像头启动后的事件录影中缺失了人接近的完整过程记录，甚至遗漏掉关键的图像信息。Ring的Pre Roll和Advanced Pre Roll功能就是用来接近无线门铃摄像头产品的这个用户痛点。


![1730366850220.jpg](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-1.jpg)

- 上图红圈中圈选出来的部分就是在Ring APP中查看事件录像视频时同步显示出来的pre roll图像，可以清楚的看到快递员接近的过程。

无论是Pre Roll还是Advanced Pre Roll，解决门铃摄像头触发过慢导致图像信息不完整的方式，都是提前进行预录影，在事件触发的时候把预录影的4-6s图像与摄像头触发启动后的事件录像文件合并在一起，从而为用户提供更为完整的触发事件的图像记录。


Pre Roll与Advanced Pre Roll功能的比较如下所示：


![1730364630791.png](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-2.png)


总的来说，两者的区别就是：

- Pre Roll是记录和保存摄像头触发前4s的录像，Advanced Pre Roll则会提前预录6s。
- Pre Roll提前预录图像在本次实时对讲中的呈现方式是画中画，事件录像文件中则是保存在事件录像的最前面；Advanced Pre Roll则是把预录的6s包含在事件录像的最前面。
- Pre Roll的预录影部分的图像在大部分型号上是黑白、低分辨率以及无声音的视频片段；而Advanced Pre Roll的预录影部分是彩色、高分辨率以及有声音的视频片段。
- Pre Roll在低光照度例如晚上的情况下无法使用，因此实用性受到比较大的限制；而Advanced Pre Roll功能则可以支持在全天候的光线条件下工作。

## Pre Roll功能的工作原理分析


如上所述，无论是Pre Roll还是Advanced Pre Roll，都要依赖于摄像头被PIR触发之前所缓存的预录影图像，这样也就意味着这个无线门铃摄像头需要在即使没有触发的情况下，也要保持在后台不断的预录图像到内存中缓存起来（可循环缓存4-6s），这样才能在真正有PIR事件触发的时候，把缓存在内存中的录像片段作为pre roll的图像与触发后的事件录像文件拼接在一起，形成一个完整的事件录像记录。


那么问题来了，这样的工作方式对于有线门铃摄像头当然没有问题，摄像头实际上可以一直处于上电工作的状态。但是对于无线门铃摄像头产品而言就问题大了，如果摄像头始终保持在工作状态的话，这个产品上的电池是不可能支持其长时间持续运行的，电池电量很快就会被耗光。也就是说，**如何解决Pre Roll模式下的功耗问题呢？**


在网上花了一些时间去找Ring Doorbell Solution相关的资料，尤其是Pre Roll部分，但是始终无法找到很有效和可靠的信息。但是其实借助于OmniVision的OA7600 Pre roll设计相关的资料，也可以对Pre roll的工作逻辑和流程做一个大致的了解。即使Ring用的不是OV的方案，大体的工作流程还是一致的。


OV的OA7600是一个针对电池摄像头产品的图像协处理器，与DSP和Image Sensor配合专门用于实现AOV（Always On Video）和Pre Roll的功能。其具备的功能主要包括：

- 与支持Pre Roll模式的Image Sensor接口，接收相同FOV的小分辨率图像。
- 视频分析功能，可以支持Motion Detection。
- 内部的Video Buffer，用于缓存从Pre Roll Image Sensor上传过来的图像，可以以滚动覆盖存储的方式保存最近4-6s的图像数据。

以下是OA7600配合OV自家的OS04C Image Sensor（可支持Pre Roll模式）的系统框图：


![1730775113290.png](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-3.png)

- OA8000+PIR+MCU+WIFi+Battery配合Image Sensor实际上就形成了一个完整的普通电池摄像头产品的系统结构图。休眠时Image Sensor和OA8000、Flash、SD卡等处于掉电状态，MCU和WiFi则处于休眠状态，在PIR或者WiFi远程唤醒的情况下，通过MCU控制给DSP、Image Sensor系统上电。这个架构存在的问题就是，PIR唤醒+DSP系统上电所导致的延迟，等到图像系统ready以后人可能已经走过去了，缺失了人接近的过程记录。
- Pre Roll的方案就是增加了以上Always On Camera Block部分，把Sensor换成可以支持Pre Roll模式的Sensor。所谓的Pre Roll模式的image Sensor也就是能够通过两组独立的接口同时输出相同FOV不同分辨率的图像，高分辨率的图像提供给DSP进行触发后图像的压缩和记录，而低分辨率图像则提供给Pre Roll协处理器用于进行Motion Detection以及缓存在协处理器的Pre Roll Buffer中。
- 在Pre Roll方案的工作过程中，DSP、WiFi、PIR、MCU等部分的工作逻辑跟之前一样。但是Image Sensor就要处于持续工作的状态，只不过不需要太高的帧率，对于Doorbell这种应用场景而言一般3-5fps就足够用于进行过程记录了，而且帧率越低功耗也就越低。OA7600协处理器与Pre Roll Image Sensor配合工作，接收Pre Roll Image Sensor的小分辨率图像，一方面进行Motion Detection，检测到人接近的情况下触发启动后一级的完整Camera系统，另外一方面把图像滚动缓存在自己的Pre Roll Buffer中。当后级的完整Camera系统因为PIR或者Motion启动后，在立即启动从Pre Roll Image Sensor读取和保存高分辨率图像的同时，还会利用SPI等接口从OA7600协处理器上读取其Pre Roll Buffer中缓存的图像数据，然后把这些缓存图像数据放在Event Video Recording的开头，作为完整事件的图像记录。

因为Pre Roll Image Sensor和OA7600协处理器在工作中要保持上电的状态，因此这两个部分的功耗数据对于整个产品的功耗设计来讲就非常重要。以下是OV提供的一些参考功耗数据信息，配合不同的分辨率和帧率有不同的功耗表现。


![1730775947319.png](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-4.png)


总的来说，从以上数据可以看出来，Pre Roll Image Sensor+协处理器的整体运行功能大致在5mW以内，如果可以接受1fps或者5fps（实际上对于doorbell来讲已经足够用了）功耗甚至可以低至2-3mW。相比AOV参考设计动辄40-60mW的整体待机功耗而言，Pre Roll的待机功耗基本上只是AOV的1/10-1/20.


## Pre Roll功能的局限性及其与AOV的比较


从以上流程看起来，其实Pre Roll与AOV的功能逻辑非常类似，都是可以完美的解决BPI电池机、Doorbell产品触发过晚、无法记录完整接近过程等方面的用户痛点。但是在整体方案设计和实现上，两者则有着各自的优缺点。


首先Pre Roll存在的最大问题就是方案的实现太复杂，对Image Sensor、协处理器和后级图像处理器都有要求，都需要能够支持Pre Roll模式。Pre Roll协处理器对于Pre Roll模式的支持当然不是问题，但当前绝大多数Image Sensor（主推支持Pre Roll模式的也就是OV的几款Image Sensor）和IPC DSP处理器方案都不支持Pre Roll模式（明确支持Pre Roll模式方案可能也就是Novatek的NT98568，[Novatek的NT95968/NT95967规格总结](https://mp.weixin.qq.com/s/LToCviXuTtsPie0iGUYizw)），这样就给方案的选型带来的很大的问题。方案的实现越复杂，用量越小，也就意味着元器件采购成本越高，整机的BOM生产成本也就水涨船高，产品的竞争力也就会存在很大的问题。这一点跟AOV相比的话，目前绝大多数低功耗IPC方案都已经能够支持AOV模式了，而且AOV模式对于Image Sensor的要求也比较低，只需要能够支持suspend/resume就可以，所以AOV的工作逻辑和硬件成本等方面比Pre Roll要好很多。


除此以外两者相互比较的优缺点大致是：

- Pre Roll为了降低功耗，在Always On模式下输出的图像分辨率一般是小分辨率的图像，而AOV模式在待机情况下缓存图像的分辨率仍然是Full Resolution的分辨率，所以这一点的用户体验上肯定是AOV模式更好一些。
- AOV的待机功耗一般都在40-60mW，这个待机功耗基本上意味着很难脱离太阳能板以及其他一些涓流充电方式来单独使用了。而Pre Roll的待机功耗可以控制在5mW以内，虽然比普通的电池机和Doorbell功耗高，但是基本上配合大一点的电池，提供两个月以上的使用续航时间不是太大的问题。所以Pre Roll在功耗方面的优势还是比较明显的。

## 参考资料：

- [What is Ring Pre-Roll and will it come to all Video Doorbells?](https://www.pocket-lint.com/smart-home/news/ring/151404-what-is-ring-pre-roll-and-will-it-come-to-all-video-doorbells/)
- [SOI 超低功耗 always on 模式介紹 - 大大通(繁體站)](https://www.wpgdadatong.com/blog/detail/74487)
- OA7600 ASIC product brief
- [What is Ring Pre-Roll and will it come to all Video Doorbells?](https://www.pocket-lint.com/smart-home/news/ring/151404-what-is-ring-pre-roll-and-will-it-come-to-all-video-doorbells/)
