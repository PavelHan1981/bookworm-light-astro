---
title: "CMOS Sensor Exposure and Readout Timing"
slug: "2022-05-30-cmos-image-sensor-exposure-readout-timing"
description: "A summary of CMOS Image Sensor exposure and readout timing, compiled and structured based on online resources and research."
date: 2022-05-30T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio and Video"]
tags: ["Image Sensor","Hardware","Audio and Video"]
draft: false
---


It has been a long time since I last debugged a CMOS sensor driver myself. Recently, I started working on debugging the DOL HDR mode drivers for the Sony IMX662 and IMX585 sensors. Since my understanding of CMOS operating timing had become a bit rusty, I decided to write this summary based on my recent study of various online resources.


First of all, we need to understand a very important concept for CMOS sensors: **Line Time**.


**In simple terms, Line Time is the time it takes for the sensor to output one row of image data (including the blanking periods before and after each row) to the ISP**. This duration depends on several factors, including the pixel clock (pclk), resolution (especially the number of pixel columns in the image width), the amount of horizontal blanking (H-Blank) per row, and the number of MIPI lanes, among others.

- The simplest formula to calculate Line Time is: `line_time = line_length / pclk`.

Line Time is crucial because subsequent exposure times are calculated in units of Line Time, rather than absolute time units such as us or ms.


To ensure the versatility of the algorithm itself, automatic exposure (AE) algorithms typically calculate exposure times in absolute time units like us. However, to write this value into the sensor registers, it must be converted from us to Line Time.


The diagram below (from Reference 1) illustrates the pixel exposure and readout process of a CMOS sensor. The horizontal axis, $T$, is in units of the Line Time described above, while the vertical axis represents each row of the image:


![Untitled.png](/images/blog/CMOS-Sensor的曝光与读出时序-1.png)


As shown, for a CMOS sensor, the start exposure time, end exposure time, and readout time slots are different for each row of pixels. However, the exposure duration (shutter speed) for each row remains identical.

- First, the first row of pixels begins exposure with an exposure duration of 5 Line Times (T0 to T5). At T5, this row begins outputting data to the ISP, which takes exactly 1 Line Time. Therefore, the first row completes its output to the ISP at T6.
- One Line Time after the first row begins exposure, the second row starts its exposure (T1). The exposure window for the second row is T1 to T6. At T6, the second row begins outputting to the ISP (just as the first row finishes its output). After 1 Line Time, it completes its output to the ISP at T7.
- The subsequent pixel rows follow this pattern sequentially.

In summary, the exposure and readout timing of a CMOS Sensor can be characterized as follows:

- The start and end times of exposure differ for each row, but the total exposure duration is identical. This ensures that the exposure level remains consistent across all rows under a stable light source.
- The exposure start time of each row is exactly one Line Time later than the preceding row, and its exposure end time is also one Line Time later than the preceding row.
- Each row outputs its data to the ISP immediately after completing its exposure, and the readout time for each row is fixed at exactly one Line Time.

## References:

- [CMOS Image Sensor Exposure and Readout Timing - CSDN Blog](https://blog.csdn.net/cchmsn/article/details/121054572#:~:text=Line,Time%E8%A1%A8%E7%A4%BA%E4%B8%80%E8%A1%8C%E6%95%B0%E6%8D%AE%E7%9A%84%E8%AF%BB%E5%8F%96%E7%94%A8%E6%97%B6%EF%BC%8C%E8%BF%99%E4%B8%AA%E6%A0%B9%E6%9C%AC%E4%B8%8A%E7%94%B1CMOS%E7%9A%84%E8%AF%BB%E5%8F%96%E7%94%A8%E6%97%B6%EF%BC%8C%E8%BF%99%E4%B8%AA%E6%A0%B9%E6%9C%AC%E4%B8%8A%E7%94%B1CMOS%E7%9A%84%E8%AF%BB%E5%8F%96%E7%94%A8%E6%97%B6%EF%BC%8C%E8%BF%99%E4%B8%AA%E6%A0%B9%E6%9C%AC%E4%B8%8A%E7%94%B1CMOS%E7%9A%84%E8%AF%BB%E5%8F%96%E7%95%B5%E8%B7%AF%E8%AE%BE%E8%AE%A1%E5%86%B3%E5%AE%9A%EF%BC%9B%E5%8F%AF%E4%BB%A5%E9%80%9A%E8%BF%87%E9%85%8D%E7%BD%AE%E7%9B%B8%E5%85%B3%E5%AF%84%E5%AD%98%E5%99%A8%E8%BF%9B%E8%A1%8C%E8%B0%83%E6%95%B4%E3%80%82)
- [Sensor Rolling Shutter Exposure Principle - CSDN Blog](https://blog.csdn.net/qq_42261630/article/details/109161790)