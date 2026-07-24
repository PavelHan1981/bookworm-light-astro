---
title: "Summary of Nordic nRF54L Series"
slug: "2024-11-27-the-summary-of-nordic-nrf54l-series"
description: "This article summarizes the specifications and parameters of the nRF54L series of Bluetooth chips officially released by Nordic in November 2024."
date: 2024-11-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["Bluetooth"]
draft: false
---


Around April or May, through communications with supply chain technical support, I learned that Nordic was expected to release a new Bluetooth chip series, the nRF54, in the third quarter, at which point development boards and SDKs could be requested. Over the past few days, I have continuously seen official release information regarding the Nordic nRF54L series, so I have studied and organized the relevant materials below.


![image.png](/images/blog/Nordic-nRF54L系列信息汇总-1.png)


## Summary of nRF54L Series Specifications and Parameters


Overall, the nRF54L is an iterative version of the previous nRF52 series. After all, having been released in 2015, the nRF52 has been used in consumer electronics applications for 10 years. Nordic urgently needs a new product line to offer better solutions in terms of processing performance, execution efficiency, power consumption, RF capabilities, and emerging application scenarios in recent years.


The currently released nRF54L series mainly includes three chips: nRF54L15, nRF54L10, and nRF54L05. Apart from differences in internal NVM and RAM capacities as well as slight variations in TX Power, these three chips have identical configurations and support capabilities in all other aspects.

- nRF54L15: NVM 1.5MB, RAM 256KB, TX Power 8dbm
- nRF54L10: NVM 1.0MB, RAM 192KB, TX Power 7dbm
- nRF54L05: NVM 0.5MB, RAM 96KB, TX Power 7dbm

![image.png](/images/blog/Nordic-nRF54L系列信息汇总-2.png)


Compared with the nRF52 series, the key specifications of the nRF54L series are as follows:

- The nRF52 series supports up to Bluetooth 5.3, whereas the nRF54L series supports the latest Bluetooth 6.0 version.
- The CPU core in the nRF52 series is a 64MHz ARM Cortex-M4, while the CPU core in the nRF54L series is a 128MHz ARM Cortex-M33 core, which offers lower power consumption and stronger processing capabilities.
- The ARM Cortex-M33 used in the nRF54L series supports TrustZone internally, allowing the integration of advanced security features including secure boot, secure firmware update, secure storage, and Trusted Execution Environments (TEE) supported by TrustZone. In contrast, restricted by the older core technology of the Cortex-M4, the nRF52 series does not support TrustZone, resulting in relatively weaker security.
- The biggest difference in the internal SoC architecture is that the nRF54L adds an internal 128MHz RISC-V coprocessor. This coprocessor is mainly used to run tasks with high real-time requirements, operating independently from the application tasks related to RF processing on the ARM core. This satisfies application scenarios with high demands for both real-time performance and wireless communication. As a result, designs for such high real-time applications no longer require an additional external MCU.
- In terms of 2.4GHz wireless protocol support, the nRF54L series supports everything that the nRF52 supports—including Bluetooth Low Energy, Bluetooth Mesh, Thread, Matter, Zigbee, Amazon Sidewalk, Apple Find My, Google Find My Device, and 2.4 GHz proprietary protocols—while also adding enhanced features such as support for data rates up to 4 Mbps (when using the 2.4GHz proprietary protocol) and new features under the Bluetooth 6.0 specification like Bluetooth Channel Sounding.
- Regarding the manufacturing process, the nRF54L series is built using TSMC's 22 nm process technology, whereas the nRF52 series—being a 10-year-old product—still utilizes the 55nm manufacturing process. The massive leap from 55nm to 22nm is crucial for achieving the low-power characteristics required by Bluetooth products.
- In terms of packaging, the nRF54L series provides two package sizes: a 6 x 6 mm QFN48 (31 GPIOs) and a smaller 2.4 x 2.2 mm WLCSP 300um (32 GPIOs). Smaller package sizes are extremely important for form-factor-sensitive applications such as wearables. Comparing the smaller WLCSP package, the chip packaging information for the nRF52 series is shown in the figure below. As can be seen, even the nRF54L15 is smaller in size compared to the lowest-end nRF52805 of the nRF52 series, and is 50% smaller when compared to the nRF52840. This is a critical advantage for wearable product designs.

![1733193512667.png](/images/blog/Nordic-nRF54L系列信息汇总-3.png)


## References

- [nRF54L15 - Nordic Semiconductor Official Website (Chinese)](https://www.nordicsemi.cn/products/nrf54l15/)
- **nRF54L15 | nRF54L10 | nRF54L05 Preliminary Datasheet**