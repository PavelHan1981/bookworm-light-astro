---
title: "Pre-Roll Battery Camera Solution Based on CV4003IoT Sensor"
slug: "2024-11-26-the-pre-roll-bpi-solution-using-cv4003IoT"
description: "This article summarizes a complete, low-cost pre-roll battery camera solution based on the CV4003IoT Image Sensor launched by Shenzhen Chuangshi Microelectronics, and compares the pros and cons of this pre-roll solution against AOV solutions."
date: 2024-11-26T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio & Video"]
tags: ["Image Sensor", "Low Power Consumption", "Smart Home"]
draft: false
---


## Pre-Roll Working Mode in Battery Cameras


In a previous note ([Pre-Roll Function of Ring Doorbell and Its Working Principle](https://mp.weixin.qq.com/s/S-BWCYDzr7-RXVu9A71ucQ)), I detailed and analyzed the working principle and system design framework of the heavily promoted Pre-Roll mode in the Ring Doorbell.


During the promotion and technological evolution of the battery camera's Pre-Roll mode, OmniVision has consistently maintained a relatively proactive stance. Consequently, most public documentation available regarding Pre-Roll design solutions originates from OmniVision. The diagram below is a system design schematic of the Pre-Roll mode obtained from OmniVision's public promotional materials:


![image.png](/images/blog/基于CV4003IoT-Sensor实现Pre-Roll电池摄像头方案-1.png)


Compared to regular BPI (Battery Powered IoT) camera products, the most distinct part of a Pre-Roll camera's system design is the "Always On Camera Block" shown in the figure above, while the rest of the design is identical to standard BPI cameras. The Always On Camera Block primarily consists of an Image Sensor (OS04C) and a Pre-Roll image co-processor (OA7600). Both components remain continuously powered on during operation. Specifically, the Image Sensor is configured to periodically wake up, expose a single image frame, and send it to the co-processor for motion detection and Pre-Roll storage, before returning to sleep to minimize sensor power consumption. The OA7600 Pre-Roll co-processor is responsible for receiving the time-lapse image frames from the Image Sensor, performing motion detection, and rolling/buffering the image frames in its internal RAM buffer. When a valid motion event is detected by the co-processor, it immediately wakes up both the Image Sensor and the downstream application processor. In subsequent operations, it streams the time-lapse image frames cached in the Pre-Roll RAM buffer to the application processor, where they are compressed and stored together with the real-time images as an event recording file.


The problem with the above solution is that the system design of the Always On Camera Block is somewhat complex, resulting in high implementation difficulty and relatively high costs. This issue can be perfectly resolved by using Chuangshi Microelectronics' CV4003IoT Image Sensor.


## CV4003IoT Image Sensor Specifications Overview


CV4003IoT is a 4ppard-megapixel CMOS Image Sensor launched by Chuangshi Microelectronics. Compared to other image sensors, its standout feature is the native support for Always On Pre-Roll, Smart Motion Detection, and Wake-on-Motion applications directly inside the sensor. This effectively integrates the functions of the Image Sensor and Pre-Roll co-processor from OmniVision's block diagram into an independent unit within the Image Sensor itself, simplifying system design and implementation complexity while lowering development difficulty and costs.


Key specifications of the CV4003IoT:

- 4 Megapixels, 2560x1440 (2.5K). Supports a maximum output of 2.5K at 50fps 10-bit Bayer RAW images via the MIPI interface.
- Optical format: 1/3-inch, pixel size of 2.0µm.
- Image interfaces: MIPI (1-lane/2-lane), DVP (8-bit), SPI (2-channel/4-channel).
- Supports staggered HDR.
- Supports horizontal and vertical flip output.
- Supports Window Cropping and binning output modes.
- Differentiated features:
    - Smart Motion Detect: Performs motion detection between two consecutive frames internally within the sensor and outputs the result.
    - Fast AEC/AGC: To support the sensor in independently implementing the Pre-Roll mode, the sensor must support auto-exposure characteristics on its own without relying on an ISP.
    - Always On Pre-Roll: Supports Pre-Roll mode by caching time-lapse frames in a buffer.
    - Always On Wake-On-Motion: Supports waking up the application processor based on motion detection while running in Pre-Roll mode.

![1732609349424.png](/images/blog/基于CV4003IoT-Sensor实现Pre-Roll电池摄像头方案-2.png)


The major differences between the CV4003IoT block diagram above and a regular Image Sensor lie in two aspects:

- An additional Image Processing Block is included, specifically dedicated to processing motion, AEC, and Pre-Roll-related functions.
- The three supported sets of output interfaces (DVP, MIPI, and SPI) are independent. In actual implementation, MIPI can be used to transmit sensor image data to the downstream application processor SoC, while SPI interfaces with the Pre-Roll RAM buffer to save time-lapse video frames into the buffer.


## Pre-Roll Battery Camera Solution Based on CV4003IoT


Based on the specifications, parameters, and structural block diagram of the CV4003IoT mentioned above, it can essentially be considered that the CV4003IoT acts as a combination of the Always On Image Sensor and the co-processor found in OmniVision's solution, packing the entire Always On Camera Block inside the sensor. While offering higher integration, it simplifies product design and development difficulty and reduces overall BOM costs.


Below is the system block diagram of the Pre-Roll battery camera solution based on the CV4003IoT:


![1732615009346.png](/images/blog/基于CV4003IoT-Sensor实现Pre-Roll电池摄像头方案-3.png)


As can be seen, with the CV4003IoT, the entire Always On Camera Block is simplified to just the CV4003IoT Image Sensor, plus an SPI-interface PSRAM acting as a Pre-Roll buffer to cache time-lapse video frames.


During actual operation, the CV4003IoT sensor and PSRAM remain powered on all the time, while downstream circuits such as the SoC are powered off to reduce power consumption. The CV4003IoT sensor captures an image frame every 1–2 seconds according to configuration, performs motion detection, and simultaneously scrolls and saves it to the PSRAM via the SPI interface.


When the motion detection algorithm inside the sensor detects a motion event, the sensor wakes up the SoC. The SoC reads and compresses the real-time image stream from the sensor and the time-lapse image frames cached in the PSRAM via the MIPI interface, recording a complete event video.


## Re-evaluating Pre-Roll vs. AOV Implementation


Reflecting on the CV4003IoT solution for low-power camera products powered by batteries/solar panels, let's compare the pros and cons of this Pre-Roll working mode against the AOV (Always On Video) working mode:

- **Cost and Implementation Complexity:** OmniVision's previous Pre-Roll solution had requirements for both the sensor and the application processor SoC, and also necessitated an additional Pre-Roll co-processor. The overall system design was relatively complex, resulting in higher costs. Chuangshi Micro's CV4003IoT solution merges the sensor and co-processor, and places no extra requirements on the application processor SoC—any standard BPI solution supporting a MIPI interface will suffice. Consequently, low-cost BPI solutions like Ingenic T23, Rockchip RV1103, and Axera AX520 can be adopted, driving down the overall hardware cost significantly. In contrast, relatively mature AOV solutions such as Ingenic T41 and Axera AX620 remain quite expensive. Therefore, in this regard, using the CV4003IoT paired with a low-cost BPI solution can achieve a lower price point.
- **Power Consumption:** Compared to AOV, the Pre-Roll mode substantially reduces power consumption. According to the data provided in CV4003IoT's promotional materials, even when the resolution of the time-lapse frames cached at the sensor end is at the original 4M image size, the average power consumption can be kept around 5mW. This power consumption is roughly 1/10th of current mainstream AOV solutions. Thus, while an AOV solution struggles to deliver a good user experience without a solar panel, the Pre-Roll mode adds only 5mW of standby power consumption on top of a standard BPI setup. Paired with a 10000mAh battery, the product's battery life can still cover the demands of most application scenarios.
- **Startup and Connection Speed:** In Pre-Roll mode, the downstream application processor SoC is completely powered off and is only woken up when a motion/PIR detection event is triggered. The entire kernel, file system, and application must be loaded from scratch. In contrast, in AOV mode, the DDR remains powered on, and upon every wakeup, execution resumes directly from the previous code execution point, requiring only the Wi-Fi driver to be reloaded. Therefore, Pre-Roll is certainly inferior to AOV in terms of startup and networking speed. However, in both Pre-Roll and AOV modes, because time-lapse image frames are already cached in the buffer, this time latency should not cause a major pain point for users.
- **Sensor Selection Constraints:** The core of the Pre-Roll solution based on CV4003IoT lies entirely within this Image Sensor; without this sensor, the solution ceases to exist. Consequently, the product's imaging quality, effects, and performance are fundamentally constrained by the capabilities and performance of this specific sensor. On the other hand, AOV solutions can generally utilize any Image Sensor that supports suspend and resume modes. Therefore, by comparison, AOV offers a much wider selection space for sensors, allowing developers to choose sensors with different resolutions and other specifications based on their application requirements. Nevertheless, given that the CV4003IoT provides the Pre-Roll function at a price point of around 1.x USD, it represents an exceptionally cost-effective solution.

## Reference Materials

- CV4003IoT CMOS Image Sensor Data Sheet