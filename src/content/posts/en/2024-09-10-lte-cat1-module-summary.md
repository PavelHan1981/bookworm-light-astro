---
title: "Summary of LTE CAT 1 Technology Information"
slug: "2024-09-10-lte-cat1-module-summary"
description: "Based on online resources, this article compiles technical background information on LTE CAT 1 modules commonly used in projects, providing a brief summary of their selection pros and cons as well as working principles."
date: 2024-09-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Mobile Communications"]
tags: ["LTE"]
draft: false
---


## Characteristics and Main Application Fields of LTE CAT 1 Modules


The LTE CAT 1 specification was first introduced in 3GPP Release 8 in 2008. In terms of data specifications, it delivers communication capabilities of 10 Mbps downlink and 5 Mbps uplink. Its primary goal is to replace the declining 2G and 3G modules in IoT applications, providing a low-cost communication solution capable of connecting to 4G network base stations for applications with constrained computing resources that do not require high communication bandwidth.


The typical application characteristics of LTE CAT 1 modules make them ideal for various IoT applications:

- Provides medium-bandwidth communication capabilities.
- Low power consumption, especially compared to higher-throughput LTE specifications such as CAT 4 and above.
- Low module cost; currently, LTE CAT 1 modules are generally only about half the price of CAT 4 modules.
- Can connect to all 4G base stations, offering broader network coverage. In contrast, LTE-M and NB-LTE cannot connect to standard 4G base stations due to significant technical differences.
- Support for voice call functionality (LTE CAT 1 supports VoLTE), among other features.

Below is the evolution architecture diagram of cellular communication technologies:


![image.png](/images/blog/LTE-CAT-1技术的相关信息汇总-1.png)


## LTE vs. LTE-CAT 1 vs. LTE-M


Compared to LTE CAT 1, higher-spec LTE modules (such as CAT 4 and above) offer much higher communication performance, but come with higher power consumption, complexity, and consequently, higher hardware costs. On the other hand, LPWAN communication technologies (such as LTE-M) perform better in terms of power consumption and signal penetration, but generally suffer from lower communication speeds and limited coverage ranges. Therefore, LTE CAT 1 sits right between these two technologies, striking a better balance across all dimensions. This makes it more suitable for IoT applications that have certain requirements for communication bandwidth, cost, power consumption, network coverage, and voice call capabilities.


Below is a comparison of various performance indicators among LTE, LTE CAT 1, and LTE-M technologies:


![da4ad790-acad-450b-8fba-1aabc4300c08.png](/images/blog/LTE-CAT-1技术的相关信息汇总-2.png)

- In terms of basic communication parameters, LTE CAT 1 and its simplified version, LTE CAT 1bis, both utilize a 20 MHz bandwidth, with a downlink rate of 10 Mbps, an uplink rate of 5 Mbps, and communication latency of less than 100 ms.
- Compared to LTE CAT 1, the biggest drawback of LPWAN technologies like NB-IoT and LTE-M is their inability to access existing 4G base stations. They require independently deployed base stations or special software and hardware upgrades to current 4G base stations, posing significant compatibility issues and severely limiting their application scope and product domains.
- The LTE and 5G chips used in our smartphones easily deliver hundreds of megabits of communication throughput, but this also increases the hardware cost, system complexity, and power consumption of the LTE modules. In reality, the vast majority of IoT applications do not require such high communication speeds, yet they are quite sensitive to hardware costs and power consumption. Therefore, using LTE CAT 1 modules in these applications is much more appropriate.
- In most IoT applications, the traffic on LTE modules is predominantly uplink traffic (such as uploading audio, video, and sensor data collected by IoT devices to the network). To further reduce standby power consumption, LTE CAT 1 technology has specifically developed a Power Saving Mode (PSM), allowing modules to enter sleep mode when no data is being transmitted, thereby drastically reducing communication power consumption.

## LTE CAT 1bis


LTE CAT 1bis is a simplified version of LTE CAT 1, first introduced in the 3GPP Release 13 specification in 2017. **In fact, when we refer to LTE CAT 1 today, we are almost always talking about LTE CAT 1bis.**


Like LTE CAT 1, LTE CAT 1bis can seamlessly connect to all deployed 4G base stations. However, based on the standard LTE CAT 1, LTE CAT 1bis further simplifies the technology at the hardware level to reduce costs. **The technical simplification of LTE CAT 1bis is primarily the removal of the Rx diversity antenna found in CAT 1 modules, leaving only a single Rx antenna.**


![image.png](/images/blog/LTE-CAT-1技术的相关信息汇总-3.png)


The advantages of this design are simpler hardware architecture, a smaller module size due to the omitted antenna, and lower costs. Under good signal conditions, it can provide the exact same communication throughput as an LTE CAT 1 module. However, because the Rx diversity antenna is removed, the receiver sensitivity of the 1bis module is 3 dB lower than that of a standard CAT 1 module under identical conditions.


![image.png](/images/blog/LTE-CAT-1技术的相关信息汇总-4.png)


Another consideration when using CAT 1bis modules is that while standard CAT 1 modules have virtually no compatibility issues with the vast majority of network operators worldwide, 1bis modules are somewhat inferior to CAT 1 modules in terms of network access compatibility and comprehensive feature support. For example, some North American operators do not support VoLTE voice call functionality on 1bis modules.


## References

- [LTE Cat 1 | u-blox](https://www.u-blox.com/en/technologies/lte-cat-1)