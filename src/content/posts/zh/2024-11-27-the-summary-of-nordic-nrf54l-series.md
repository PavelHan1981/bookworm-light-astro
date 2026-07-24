---
title: "Nordic nRF54L系列信息汇总"
slug: "2024-11-27-the-summary-of-nordic-nrf54l-series"
description: "本文汇总了Nordic在2024年11月份最新发布的nRF54L系列蓝牙系列芯片方案的规格参数。"
date: 2024-11-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["蓝牙"]
draft: false
---


大概在四五月份跟供应链技术支持人员的沟通中了解到，Nordic预计在第三季度会发布新的蓝牙芯片系列nRF54，届时可以申请开发板和SDK。最近几天连续看到Nordic nRF54L这个系列正式发布的信息，因此对相关的资料进行以下学习和整理。


![image.png](/images/blog/Nordic-nRF54L系列信息汇总-1.png)


## nRF54L系列规格参数总结


总的来说，nRF54L是之前的nRF52系列的迭代版本，毕竟nRF52作为2015年发布的产品，在消费类电子的应用中已经用了10年，Nordic也亟需要有新的产品系列在处理性能、执行效率、功耗、RF能力以及近几年出现的新的应用场景中提出更好的解决方案。


目前发布的nRF54L系列主要包含三个芯片：nRF54L15，nRF54L10，nRF54L05。这三个芯片除了内包的NVM和RAM空间不同，以及TX Power稍有差异以外，其他方面的配置和支持能力完全相同。

- nRF54L15：NVM 1.5MB，RAM 256KB，TX Power 8dbm
- nRF54L10：NVM 1.0MB，RAM 192KB，TX Power 7dbm
- nRF54L05：NVM 0.5MB，RAM 96KB，TX Power 7dbm

![image.png](/images/blog/Nordic-nRF54L系列信息汇总-2.png)


与nRF52系列相对比，nRF54L系列的重点参数规格如下：

- nRF52系列最高能够支持蓝牙5.3版本，而nRF54L系列则可以支持最新的蓝牙6.0版本。
- nRF52系列内部的CPU核是64MHz的ARM Cortex-M4，而nRF54L系列的CPU核是128MHz的ARM Cortex-M33核心，功耗更低，处理能力更强。
- nRF54L系列使用的ARM Cortex-M4，该CPU核内部可支持TrustZone，因此可集成更高级的安全功能，包括安全启动、安全固件更新、安全存储、由TrustZone支持的可信执行环境等。而nRF52系列受限于Cortex-M4比较老的核心技术，不支持TrustZone，安全性相对较差。
- 在芯片SOC内部架构上最大的不同在于，nRF54L内部增加了一个128MHz RISC-V的协处理器，这个协处理器主要用于运行一些对于实时性要求比较高的任务，与ARM核上所允许的RF处理相关的应用程序任务分开独立运行，可以满足一些对于实时性和无线通信均有较高要求的应用场景。这样的话，针对这类实时性要求较强的应用的设计而言，就不需要额外增加其他MCU了。
- 在2.4GHz无线协议的支持方面，nRF54L系列除了能够支持nRF52也能够支持的低功耗蓝牙、蓝牙 Mesh、Thread、Matter、Zigbee、Amazon Sidewalk、Apple Find My、Google Find My Device 和 2.4 GHz专有协议以外，还能够支持高达 4 Mbps 数据传输速率（使用2.4GHz私有协议的情况下）等增强功能，支持蓝牙 6.0规范，包括蓝牙信道探测(Bluetooth Channel Sounding)等方面的新特性。
- 生产工艺方面，nRF54L系列使用台积电22 nm工艺技术制造，而nRF52系列因为是10年前的产品，仍然采用的是55nm的制造工艺。从55nm到22nm工艺的巨大提升，对于蓝牙产品所需要的低功耗特性非常重要。
- 封装方面，nRF54L系列提供了6 x 6mm的QFN48（31 GPIO）和更小的2.4 x 2.2 mm WLCSP 300um（32 GPIO）两种尺寸的封装。更小的封装尺寸对于该系列在可穿戴产品这类对产品外形尺寸非常敏感的应用中极其重要，以更小封装的WLCSP进行对比，下图是nRF52系列的芯片封装信息，可以看到，nRF54L15的尺寸即使是跟nRF52系列最低端的nRF52805相比仍然要小一些，如果跟nRF52840相比的话，更是要小50%，这一点对于可穿戴产品的设计而言非常重要。

![1733193512667.png](/images/blog/Nordic-nRF54L系列信息汇总-3.png)


## 参考资料

- [nRF54L15 - Nordic Semiconductor中文官网](https://www.nordicsemi.cn/products/nrf54l15/)
- **nRF54L15 | nRF54L10 | nRF54L05 Preliminary Datasheet**
