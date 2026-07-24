---
title: "Thoughts on AI NVRs and Ingenic's AI NVR Platform A1"
slug: "2025-01-25-AI-NVR-and-Ingenic-A1-solution"
description: "Ingenic's A1 series is an integrated solution tailored for the NVR market. Compared to traditional NVR solutions, its standout feature is the integration of robust AI computing power. Therefore, Ingenic deliberately named this solution using the xVR format to emphasize its AI capabilities."
date: 2025-01-25T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio/Video"]
tags: ["Audio/Video","NVR"]
draft: false
---

Ingenic's A1 series is an integrated solution tailored for the NVR market. Compared to traditional NVR solutions, its standout feature is the integration of robust AI computing power. Therefore, Ingenic deliberately named this solution using the xVR format to emphasize its AI capabilities.

## Architecture and Basic Specifications of the A1 Solution

Below is the architecture diagram of the A1 solution:

![image.png](/images/blog/对AI-NVR的思考以及君正的AI-NVR平台A1-1.png)

- The main CPU is still Ingenic's XBurst2, deeply customized based on MIPS, featuring two CPU cores with a single-core clock frequency ranging from 1.0GHz to 1.4GHz.
- Built-in DDR. Depending on the specific model, the A1 series integrates 1Gb, 2Gb, or 4Gb of DDR, making system design and implementation much easier. For ordinary NVR products used solely for storage, 1Gb or 2Gb of DDR is generally sufficient. However, if concurrent multi-channel AI processing is required, or if multiple IPC video streams need to be decoded and stitched for display simultaneously, the input IPC streams must first be decoded, significantly increasing memory demand. Therefore, to support a larger memory space, the A1A model in the A1 series also supports external RAM expansion.
- The built-in AI Engine hardware is a major highlight that distinguishes the A1 solution from ordinary NVR solutions. The AI computing capability consists of two parts: the NNA (Neural Network Accelerator) supporting neural network convolution computations, and the CPU protocol processor supporting SIMD instructions. These compute resources can perform Video AI analysis and processing on the decoded IPC streams connected to the NVR, enabling video-related AI functions on the NVR. The A1 NNA unit delivers an AI computing performance of 1.4T@int8 or 5.6T@int4. Running Ingenic's Magik open AI platform, it supports numerous AI algorithms that Ingenic has deployed and applied in the IPC field for years. In addition to the NNA, the A1 also includes a SIMD512 coprocessor core. Some algorithms on the Magik platform likely utilize the SIMD instructions provided by this core to handle compute-intensive processing tasks.
- In terms of decoding capability, it supports up to 4K 90fps H.264/H.265 decoding. For performing AI processing on connected video streams and playing back real-time or historical video for single/multi-channel images on the NVR, the incoming streams must first be decoded using the A1's decoding capabilities before any further processing can take place. Consequently, supporting a higher number of concurrent channels and higher resolutions demands greater decoding performance.
- Regarding display interfaces and performance, it supports the HDMI 2.0 interface and 4K 60fps display. Correspondingly, it includes a Display Engine for scaling, stitching, and display enhancement processing on multi-channel decoded video images.
- For other external interfaces, it supports dual Gigabit Ethernet ports and dual SATA 3.0 interfaces for connecting two SATA hard drives, which are standard for NVRs. However, the USB interface is limited to USB 2.0. This is sufficient for connecting a mouse and keyboard, but if high-speed export of event recording files to a USB flash drive is required, the USB 2.0 speed becomes a major bottleneck.

Overall, Ingenic's A1 series mainly includes the following product lines: A1L, A1NT, A1X, and A1A.
- A1L is primarily targeting low-cost 4-8 channel NVR applications.
- A1NT is mainly aimed at mainstream, mature 16-channel NVR products.
- A1X and A1A are positioned for high-spec, differentiated 32-channel NVR product form factors.

![image.png](/images/blog/对AI-NVR的思考以及君正的AI-NVR平台A1-2.png)

## AI Support in the A1 Solution

A prominent feature of Ingenic's A1 solution is its built-in AI Engine computing power and the Magik AI framework, which is supported on top of this AI Engine hardware.

The computing performance provided by the A1 solution is 1.4T@int8 or 5.6T@int4. Strictly speaking, this level of computing power is quite competitive when deployed on an IPC—Ingenic's T40/T41 and Rockchip's RV1006 share roughly this specification. However, for NVR products, if the goal is to support AI video analysis across multiple IPC streams, this specification can comfortably handle 2-3 channels, but pushing beyond that would likely become strained.

Another point is that Ingenic's support for the AI Engine naturally builds upon its long-planned and deployed Magik platform ecosystem. This allows the overall planning and arrangement of AI for the NVR series to align with the IPC series, enabling NVRs to directly utilize the numerous video and image algorithms that have already matured on the IPC series. For NVR or IPC product developers, they can either choose algorithms already developed and trained by the Ingenic team based on this framework, or select algorithms developed by third-party teams on the Magik platform and Ingenic chips. Furthermore, if product developers possess a mature team and in-house AI development capabilities/models, they can easily port their pre-trained models to the Magik platform to run on Ingenic chips.

![image.png](/images/blog/对AI-NVR的思考以及君正的AI-NVR平台A1-3.png)

## Thoughts on Introducing AI Features to NVR Products

I previously conducted some research on the form factors and feature lists of several best-selling NVR products in the North American market in 2024 and compiled a set of notes. In summary:

- PoE/Ethernet connections still dominate the NVR market. Wired network connections offer greater stability, which is crucial when connecting more than 8 cameras. In fact, the market currently features some Wi-Fi NVR products like the Eufy Homebase; however, in the vast majority of cases, these are either event-based low-power IPC systems where multiple cameras rarely upload data concurrently, or they are limited to supporting a maximum of 4-6 camera connections. After all, supporting the simultaneous connection of 16 or even 32 channels of 4K-resolution IPCs remains a tremendous challenge for Wi-Fi. Therefore, it is expected that PoE and Ethernet connections will continue to be the mainstream choice for NVR products requiring a high number of connected IPCs.
- Some NVR products advertise support for AI processing, but their capabilities are generally quite limited. Their AI support either relies on the computing power of companion IPCs paired with the NVR, or is restricted to real-time analysis on the NVR side for just 2-3 cameras.
- NVR product form factors are exceptionally stable, lacking effective product concept innovation. The overall market competition is clearly defined, dominated by a few major NVR manufacturers that continuously iterate and micro-update their product models. On the whole, there is a lack of sustained focus on, and resolution of, critical user pain points and effective product application technologies within this category.

Perhaps adding edge AI capabilities to NVR products can still provide some room for imagination in breaking through this product form factor. Through this approach, features that require subscription fees on other brands can be realized using the onboard AI computing power of the NVR, significantly enhancing the NVR user experience.

However, the dilemma is that, fast-forwarding to today in 2025, low-cost market IPC solutions—such as AXera's AX520 and Rockchip's RV1003—already universally feature computing power around the 0.5T level. Meanwhile, mainstream IPC product solutions generally boast 1T to 2T of computing power. Consequently, the IPC edge can already implement most common algorithms for human detection, vehicles, pets, and even packages.

So, what is the significance of adding AI features to an NVR form factor?
- It can interface with non-smart, traditional cameras that lack AI capabilities, utilizing the NVR's computing power to process video data from these traditional cameras and add AI video analysis functions.
- An NVR should feature AI computing power far exceeding that of IPC platforms—for instance, 20 to 30 TOPS—enabling the NVR to run more complex AI algorithms and related functions that cannot be executed on IPCs.
- User demands and experiences related to video classification, searching, and location tracking native to NVRs can be enhanced using the AI NVR's computing power to generate smarter tags, helping users perform faster searches, target localization, and categorization during operation.

## References

- AI Introduction PPT From Ingenic