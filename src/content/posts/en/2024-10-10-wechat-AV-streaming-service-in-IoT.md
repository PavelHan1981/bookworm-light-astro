---
title: "Research on WeChat IoT Platform and Its Audio/Video Capabilities for IoT Product Integration"
slug: "2024-10-10-wechat-AV-streaming-service-in-IoT"
description: "Based on promotional materials for Tencent's WeChat IoT and IoT Video, this article compiles information on integrating IoT Video features (focusing on WeChat's two-way audio and video calling) into IoT products, particularly IP cameras (IPCs), to serve as a reference for future product planning."
date: 2024-10-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["IoT"]
tags: ["Audio/Video"]
draft: false
---

## Overview of the WeChat Ecosystem-Based IoT Platform

The WeChat IoT Platform is a comprehensive cloud and audio/video integration solution provided by Tencent's WeChat team. It caters to smart hardware-carrying scenarios such as consumer electronics, transportation, industrial energy, and retail/education, delivering industry value and business capabilities. Beyond providing a standard IoT platform, the solution's most distinctive feature is its native support for integrating WeChat Mini Programs and WeChat's built-in audio/video intercom capabilities into various types of hardware products.

The diagram below illustrates the application architecture and product matrix of the platform:

![1728610596859.png](/images/blog/对微信IoT平台及其音视频能力在物联网产品中接入的调研-1.png)

Looking at the three vertical components:

- **Part 1 (IoT Explorer):** This part differs very little from other IoT solutions like Alibaba Cloud, Amazon, or Tuya, which already offer mature device and platform onboarding. The differentiation of the WeChat IoT Platform lies primarily in the more streamlined handling of WeChat Mini Program integration. Ideally, users do not need to install an extra app; they can directly access and manage their IoT devices using a WeChat Mini Program. However, considering that hardware manufacturers can develop their own WeChat Mini Programs independently, coupled with the resource limitations of Mini Programs (which prevent overly complex features) and slower speeds and inferior user experience compared to native apps, this differentiation point seems to hold limited value.
- **Part 2 (IoT Video):** The introduction of IoT Video into the camera product category is arguably the platform's biggest highlight and differentiator. Integrating this IoT Video feature into camera hardware means:
    - Cameras can enable direct intercom with WeChat Mini Programs. On the user end, this presents as a standard WeChat voice or video call interface, offering extreme ease of use.
    - The audio/video intercom performance between the camera and the WeChat Mini Program is identical to that of regular WeChat voice and video calls, representing top-tier performance in push speed, call quality, and latency.
    - Furthermore, tailored to camera-specific business needs, the WeChat IoT Platform provides industry-standard cloud storage and cloud-based AI value-added services.
- **Part 3 (Yuntu):** This is a relatively independent module—actually a virtual mobile network operator (MVNO) business operated by the WeChat IoT team. Yuntu provides virtual SIM cards tailored for the IoT sector, supporting roaming across base stations of China's three major telecom operators to ensure more stable network connectivity and broader base station coverage.

In summary, for the product development and planning of IoT and camera hardware manufacturers seeking cloud business support via the Tencent IoT Platform, the cloud side can rely entirely on platform-provided support, eliminating the need for an in-house cloud development team. On the user end, both WeChat Mini Programs and standalone apps are viable options, with development planned around the Mini Program and App SDKs provided by the Tencent IoT Platform. This allows hardware manufacturers to focus their primary energy on hardware implementation and exploring differentiated value design using the extra features provided by the WeChat IoT Platform.

### Other Highlight Features

- **BLE Keep-Alive Anti-Loss Application:** The Tencent WeChat IoT Platform includes a Bluetooth Low Energy (BLE) keep-alive anti-loss application, similar to Apple's Find My app, which uses Bluetooth beacon frames to track and record device locations.
- **Smart Speaker Functionality:** Combined with cloud features, the device-side SDK of the WeChat IoT Platform enables ordinary audio-equipped IoT devices to function like smart speakers. Through audio recording and playback on the device interacting with cloud resources like QQ Music, this significantly lowers the development and integration threshold for smart speaker devices. For instance, basic smart speaker access can be incorporated into an IPC simply by integrating the SDK.
- **Tencent Lianlian and Device Certification:** Once a device connects to the WeChat IoT Platform and passes Tencent Lianlian certification, users can easily add the device to their list by scanning a QR code using the Tencent Lianlian Mini Program. This lowers the barrier for first-time device usage and enhances user experience.

## WeChat IoT Video

As mentioned above, the core of the IoT Video module is the integration of WeChat's two-way voice and video calling features into camera-equipped IoT products, supplemented by value-added features standard to IPC businesses, such as cloud storage and cloud AI analysis.

The main features included in IoT Video are: two-way calling, two-way audio/video communication, remote monitoring, local playback, cloud recording, and cloud AI video analysis. Thus, it provides a comprehensive cloud solution tailored for the IPC sector.

Thanks to extensive daily use by over 1.0 billion users and continuous optimization, WeChat's two-way audio and video call quality is undoubtedly top-tier across all performance dimensions under equivalent conditions. According to information from Reference Document 1:

- WeChat's two-way audio/video calls utilize TCP- and UDP-based P2P direct connections as well as relay network links. Transmission quality across paths is dynamically measured and evaluated to select the optimal link for audio/video transmission. In other words, the overall audio/video transmission still relies on the standard P2P direct connection + relay solution; successful P2P penetration indeed significantly reduces bandwidth and server costs.
- The P2P success rate can reach 80% (it is unclear whether this data applies domestically or internationally; achieving 80% in North America is not overly difficult, but reaching this in the domestic market would be a very impressive metric). Of course, this success rate holds greater significance and value for Tencent itself, as higher hole-punching success rates effectively reduce their own server and bandwidth costs.
- Performance metrics include a 1-second stream output time and 300–500ms latency, delivering a two-way intercom user experience identical to regular WeChat audio/video calls under the same network conditions.
- SDKs are provided for WeChat Mini Programs and Android/iOS apps, making it easy to integrate these features into users' custom apps and mini programs.
- To meet IPC business demands, event-based cloud storage solutions and 24/7 continuous cloud storage solutions are provided.
- The device-side SDK provided by WeChat IoT Video can run on Android, Linux, or even RTOS systems with very low resource consumption, making it ideal for low-cost, low-power IPC applications.

The general workflow for two-way video intercom between an IoT Video-based camera and a WeChat Mini Program is as follows:

![1728638712395.png](/images/blog/对微信IoT平台及其音视频能力在物联网产品中接入的调研-2.png)

As a cloud solution tailored for the IPC sector, various AI analyses of cloud recording data are naturally included. This differs very little from competing products:

![1728639610231.png](/images/blog/对微信IoT平台及其音视频能力在物联网产品中接入的调研-3.png)

## Fee Model Overview

Compared to other IoT Cloud or audio/video streaming service providers, the pricing model for WeChat IoT Video features is somewhat overly complex.

A rough summary is as follows:

- The 5-year account fee for remote P2P stream pulling for a standard IPC business is roughly RMB 5–7, which is relatively normal. However, utilizing WeChat's two-way audio/video intercom features incurs an additional annual fee of RMB 2–3, which pushes the price up.
- Regarding cloud storage, annual fees based on historical video retention periods range from RMB 30 (for 3 days of history) to RMB 180 (for 30 days of history) for event recordings, and roughly RMB 60 (3 days) to RMB 400 (30 days) for 24/7 recordings. For overseas deployments, these fees are multiplied by 1.5.
- Additionally, cloud AI features—which analyze 7x24 recordings or triggered event recordings uploaded by users to generate AI analysis results and summary videos—are billed separately per AI feature, with annual fees ranging from roughly RMB 20 to RMB 100.

Overall, apart from the differentiated WeChat two-way audio/video intercom provided by IoT Video, the pricing is relatively high relative to the value delivered (especially compared to competitors). Furthermore, according to preliminary information obtained by contacting WeChat IoT sales personnel, integrating IoT Video features requires an additional entry-level development fee of RMB 200,000 to 300,000. Compared to competitors (like Tuya, Agora, etc.), this is quite unfriendly to downstream device developers.

## Overseas Support

Given that the WeChat ecosystem is primarily used domestically, the practicality of features like WeChat Mini Programs and WeChat-based push notifications is significantly reduced when deploying IoT Video in IPC products targeting overseas markets. However, the exceptional two-way audio/video intercom performance of IoT Video still holds strong competitiveness. Consequently, the WeChat IoT Platform has laid out certain strategies for overseas application of its IoT cloud solutions:

- Tencent Cloud has deployed a massive cluster of servers across multiple overseas geographical nodes (such as popular regions like Europe, North America, and Southeast Asia) to support local access. This ensures optimal transmission quality for audio/video data over the internet, maintaining a good user experience for audio/video calls.
- Because the market share of WeChat app user engagement overseas is negligible, relying on Mini Programs for IoT device access and IoT Video usage is unfeasible. To address this, WeChat provides standalone App components, enabling hardware manufacturers to develop native apps based on these components to access IoT Cloud and IoT Video features.
- To integrate into overseas app ecosystems and user habits, the platform supports messaging channels such as Google's FCM and Apple's APNS, alongside control support for mainstream smart speakers like Alexa and Google Home.
- The WeChat team possesses deep understanding and tangible deployment practices regarding data compliance in overseas markets—particularly in Europe and North America—ensuring compliance in cloud applications and user data storage and access.

Objectively speaking, dropping Mini Program-based IoT Video invocation—alongside the fact that Tencent Cloud's overseas server deployment density is far lower than domestically, making it difficult for audio/video intercom performance to match domestic network conditions—is an unavoidable issue that significantly dampens the overseas competitiveness of IoT Video. Therefore, my personal outlook on promoting IoT Video (and the broader IoT platform) overseas remains somewhat pessimistic.

## References:

- Presentation: *"Tencent IoT Audio/Video Products Empower Customer Terminal Product Innovation"*
- [Connecting Hardware Capabilities / Audio and Video Calls (for Hardware) / Guide (qq.com)](https://developers.weixin.qq.com/miniprogram/dev/framework/device/device-voip.html)