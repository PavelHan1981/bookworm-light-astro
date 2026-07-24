---
title: "The Pre-Roll Feature on Ring Doorbell and How It Works"
slug: "2024-10-31-the-pre-roll-feature-on-ring-doorbell"
description: "This article reviews the working principles of the Pre-Roll feature promoted by Ring Doorbell and OmniVision. Based on OV's OA7600 system design framework, it summarizes the complete system workflow in Pre-Roll mode, as well as a comparison of the pros and cons between AOV and Pre-Roll modes."
date: 2024-10-31T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio & Video"]
tags: ["Audio & Video"]
draft: false
---


## Pre-Roll and Advanced Pre-Roll on Ring Doorbell


Ring is currently a mainstream supplier in the North American and European doorbell markets, and its wired and wireless doorbell camera products have received widespread acclaim for their Pre-Roll and Advanced Pre-Roll features.


For wireless doorbell cameras, the normal usage scenario and product design rely on a PIR sensor to detect human activity at the doorway. When a person approaches, the camera is triggered in advance to start recording, while pushing a notification and event video to the user's mobile phone. However, limited by the working characteristics of the PIR itself, the trigger time of the camera is often too late. As a result, the event recording after the camera starts lacks a complete record of the approach process, and may even miss critical image information. Ring's Pre-Roll and Advanced Pre-Roll features are designed to address this user pain point in wireless doorbell camera products.


![1730366850220.jpg](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-1.jpg)

- The portion circled in red in the image above is the pre-roll footage displayed synchronously when viewing event recordings in the Ring app, clearly showing the delivery person's approach process.

Whether it is Pre-Roll or Advanced Pre-Roll, the way to solve the problem of incomplete image information caused by delayed doorbell camera triggering is to perform pre-recording in advance. When an event is triggered, the 4-6 seconds of pre-recorded footage is merged with the event video file captured after the camera is triggered, thereby providing users with a more complete image record of the trigger event.


A comparison between the Pre-Roll and Advanced Pre-Roll features is shown below:


![1730364630791.png](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-2.png)


In summary, the differences between the two are:

- Pre-Roll records and saves 4 seconds of footage prior to camera triggering, whereas Advanced Pre-Roll pre-records 6 seconds.
- In a live two-way talk session, the pre-recorded images of Pre-Roll are presented as Picture-in-Picture (PiP), while in the event video file, they are saved at the very beginning of the recording; Advanced Pre-Roll includes the 6 seconds of pre-recorded footage directly at the very beginning of the event video file.
- On most models, the pre-recorded video segment for Pre-Roll is in black and white, low resolution, and without audio; whereas for Advanced Pre-Roll, the pre-recorded segment is in color, high resolution, and with audio.
- Pre-Roll cannot be used in low-light conditions such as at night, which significantly limits its practicality; whereas the Advanced Pre-Roll feature supports working under all-day lighting conditions.

## Analysis of the Working Principle of the Pre-Roll Feature


As mentioned above, both Pre-Roll and Advanced Pre-Roll rely on pre-recorded images cached before the camera is triggered by the PIR. This means that the wireless doorbell camera needs to continuously pre-record and cache images to memory in the background even when no trigger event occurs (circularly caching for 4-6 seconds). Only in this way, when a real PIR event is triggered, can the video clips cached in memory be spliced together with the post-trigger event video file as pre-roll images to form a complete event recording.


This raises a question: such a working method is certainly fine for wired doorbell cameras, as the camera can remain powered on and operational at all times. However, it poses a major problem for wireless doorbell camera products. If the camera were to remain in a working state constantly, the battery in the product could not support such long-term continuous operation, and the battery power would be depleted very quickly. In other words, **how to solve the power consumption problem in Pre-Roll mode?**


I spent some time searching online for materials related to the Ring Doorbell Solution, especially the Pre-Roll part, but was unable to find very effective and reliable information. However, by relying on OmniVision's (OV) OA7600 Pre-Roll design materials, one can still gain a rough understanding of the working logic and process of Pre-Roll. Even if Ring does not use OV's solution, the general workflow remains consistent.


OV's OA7600 is an image coprocessor targeted at battery-powered camera products, working in conjunction with a DSP and Image Sensor specifically to implement AOV (Always On Video) and Pre-Roll functions. Its key features include:

- Interfacing with Image Sensors that support Pre-Roll mode to receive low-resolution images with the same FOV.
- Video analysis capabilities supporting Motion Detection.
- An internal Video Buffer used to cache images uploaded from the Pre-Roll Image Sensor, storing the most recent 4-6 seconds of image data using a rolling overwrite storage method.

Below is the system block diagram of the OA7600 paired with OV's own OS04C Image Sensor (which supports Pre-Roll mode):


![1730775113290.png](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-3.png)

- OA8000 + PIR + MCU + WiFi + Battery combined with the Image Sensor actually forms a complete system block diagram of a standard battery camera product. During sleep mode, the Image Sensor, OA8000, Flash, and SD card are powered down, while the MCU and WiFi are in sleep mode. When woken up remotely by PIR or WiFi, the MCU controls the power supply to the DSP and Image Sensor systems. The problem with this architecture is the latency caused by PIR wake-up + DSP system powering on; by the time the imaging system is ready, the person may have already walked past, missing the record of the approach process.
- The Pre-Roll solution adds the aforementioned Always On Camera Block portion, replacing the standard sensor with one that supports Pre-Roll mode. The so-called Pre-Roll mode Image Sensor is an image sensor capable of simultaneously outputting images with the same FOV but different resolutions through two independent interfaces. High-resolution images are provided to the DSP for post-trigger image compression and recording, while low-resolution images are provided to the Pre-Roll coprocessor for Motion Detection and cached in the coprocessor's Pre-Roll Buffer.
- During the operation of the Pre-Roll solution, the working logic of parts such as the DSP, WiFi, PIR, and MCU remains the same as before. However, the Image Sensor must remain in a continuously operating state, though it does not need a very high frame rate. For application scenarios like a doorbell, 3-5 fps is generally sufficient for process recording, and lower frame rates result in lower power consumption. The OA7600 coprocessor works in tandem with the Pre-Roll Image Sensor, receiving the low-resolution images from the Pre-Roll Image Sensor. On one hand, it performs Motion Detection, triggering the downstream full Camera system when a person's approach is detected; on the other hand, it rolls and caches the images in its own Pre-Roll Buffer. When the downstream full Camera system is activated by PIR or motion, it immediately starts reading and saving high-resolution images from the Pre-Roll Image Sensor. At the same time, it uses interfaces such as SPI to read the cached image data from the Pre-Roll Buffer on the OA7600 coprocessor, and then places these cached image data at the beginning of the Event Video Recording as the image record of the complete event.

Since the Pre-Roll Image Sensor and OA7600 coprocessor must remain powered on during operation, their power consumption data is crucial for the overall power design of the product. Below is some reference power consumption data provided by OV, showing varying power performance under different resolutions and frame rates.


![1730775947319.png](/images/blog/Ring-Doorbell的Pre-Roll功能及其工作原理-4.png)


Overall, as can be seen from the above data, the overall operational power consumption of the Pre-Roll Image Sensor + coprocessor is roughly within 5mW. If 1 fps or 5 fps is acceptable (which is actually more than enough for a doorbell), the power consumption can even drop as low as 2-3mW. Compared to the overall standby power consumption of an AOV reference design, which easily hits 40-60mW, the standby power consumption of Pre-Roll is basically only 1/10 to 1/20 of AOV.


## Limitations of the Pre-Roll Feature and Comparison with AOV


Judging from the workflow above, the functional logic of Pre-Roll is actually very similar to AOV. Both can perfectly solve user pain points in battery-powered PIR and doorbell products, such as delayed triggering and the inability to record the complete approach process. However, in terms of overall solution design and implementation, the two have their respective pros and cons.


First, the biggest problem with Pre-Roll is that the implementation of the solution is too complex. It imposes requirements on the Image Sensor, coprocessor, and downstream image processor, all of which must support Pre-Roll mode. While support for Pre-Roll mode by the Pre-Roll coprocessor is certainly not an issue, the vast majority of current Image Sensors (with only a few OV Image Sensors actively promoting Pre-Roll support) and IPC DSP processor solutions do not support Pre-Roll mode (perhaps the only explicitly supporting solution is Novatek's NT98568, see [Novatek NT95968/NT95967 Specification Summary](https://mp.weixin.qq.com/s/LToCviXuTtsPie0iGUYizw)), which poses major challenges for solution selection. The more complex the solution implementation, the lower the shipment volume, which means higher component procurement costs, driving up the BOM production cost of the complete unit and severely hurting product competitiveness. Compared to AOV, currently the vast majority of low-power IPC solutions already support AOV mode, and AOV has lower requirements for the Image Sensor—only needing to support suspend/resume. Therefore, AOV's working logic and hardware costs are much better than Pre-Roll.


In addition, the general pros and cons when comparing the two are as follows:

- To reduce power consumption, Pre-Roll outputs low-resolution images in Always On mode, whereas AOV mode retains Full Resolution for cached images during standby. Therefore, user experience in this aspect is definitely better with AOV mode.
- AOV's standby power consumption is generally between 40-60mW, which basically means it is very difficult to operate independently without solar panels or other trickle-charging methods. In contrast, Pre-Roll's standby power consumption can be controlled within 5mW. Although it is slightly higher than ordinary battery cameras and doorbells, when paired with a slightly larger battery, providing over two months of battery life is not a major issue. Therefore, Pre-Roll still holds a distinct advantage in terms of power consumption.

## References:

- [What is Ring Pre-Roll and will it come to all Video Doorbells?](https://www.pocket-lint.com/smart-home/news/ring/151404-what-is-ring-pre-roll-and-will-it-come-to-all-video-doorbells/)
- [SOI Ultra Low Power Always On Mode Introduction - WPG Dadatong (Traditional Chinese Site)](https://www.wpgdadatong.com/blog/detail/74487)
- OA7600 ASIC product brief
- [What is Ring Pre-Roll and will it come to all Video Doorbells?](https://www.pocket-lint.com/smart-home/news/ring/151404-what-is-ring-pre-roll-and-will-it-come-to-all-video-doorbells/)