---
title: "CMOS Sensor的曝光与读出时序"
slug: "2022-05-30-cmos-image-sensor-exposure-readout-timing"
description: "通过对网络上收集资料的学习，整理了CMOS Image Sensor的曝光和读出的时序。"
date: 2022-05-30T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["Image Sensor","硬件","音视频"]
draft: false
---


很长时间没有自己动手调试CMOS Sensor的驱动程序了，这两天开始配合调试Sony IMX662和IMX585两个Sensor DOL HDR模式下的驱动，关于CMOS工作时序的概念有点模糊了，在这里重新基于对网上资料的学习总结一下。


首先要搞清楚一个对于CMOS Sensor而言很重要的一个概念：Line Time。


**所谓的Line Time实际上很简单：实际上就是Sensor向ISP输出一行图像数据（包括每行前面和后面的Blank）所用的时间**。这个时间与很多因素有关，包括pixel clock、分辨率大小（尤其是图像宽度包含多少列像素）、每行前后blank数量多少、MIPI Lane的数量等等。

- Line Time最简单的计算公式：line_time = line_length / pclk。

Line Time之所以重要，是因为后续的曝光时间都是以Line Time为单位的，而不是以实际的us、ms等绝对时间为单位的。


自动曝光的AE算法因为要保证算法本身的通用性，所以一般AE算法计算出来的曝光时间都是以us等为单位的绝对时间。但是这个绝对时间要设置到Sensor的寄存器中，就需要做一个us到Line time的转换才行。


下图（来自参考文档1）就是CMOS Sensor像素曝光和读出的示意图，横坐标的T正是以上面介绍的Line Time为单位，而纵坐标则是图像的每一行：


![Untitled.png](/images/blog/CMOS-Sensor的曝光与读出时序-1.png)


可以看到对于CMOS图像而言，每一行像素的起始曝光时间、终止曝光时间和读出时间的时隙都是不同的。但是各行像素的曝光时长是一致的。

- 首先是第一行像素开始曝光，曝光时间长度为5个Line Time（T0-T5）；从T5开始这行像素向ISP的输出，输出时间就是1个Line time。因此在T6时间第一行时间完成向ISP的输出。
- 第一行像素开始曝光后的一个Line Time后，第二行像素开始曝光（T1），第二行像素的曝光时间窗口是T1-T6；第二行像素从T6时间开始向ISP输出（这个时候第一行像素刚好输出完成），经过一个Line Time后在T7时间完成向ISP的输出。
- 后面的像素行依次类推。

因此，总结起来，CMOS Sensor曝光和读出的时序就是：

- 每一行像素的开始曝光时间和停止曝光时间都是不同的，但是每一行像素的曝光时长是一样的，这就确保了在光源稳定的情况下各行得到的曝光量基本上是一致的。
- 每一行像素的开始曝光时间都比前一行像素晚一个Line Time，终止曝光时间同样比前一行像素晚一个Line Time；
- 每一行像素曝光完成后立即向ISP输出，每一行像素的输出时间都是固定的一个Line time。

## 参考文档：

- [CMOS图像传感器的曝光及读取时序_年少时的棉花糖的博客-CSDN博客_cmos曝光时间](https://blog.csdn.net/cchmsn/article/details/121054572#:~:text=Line,Time%E8%A1%A8%E7%A4%BA%E4%B8%80%E8%A1%8C%E6%95%B0%E6%8D%AE%E7%9A%84%E8%AF%BB%E5%8F%96%E7%94%A8%E6%97%B6%EF%BC%8C%E8%BF%99%E4%B8%AA%E6%A0%B9%E6%9C%AC%E4%B8%8A%E7%94%B1CMOS%E7%9A%84%E8%AF%BB%E5%8F%96%E7%94%B5%E8%B7%AF%E8%AE%BE%E8%AE%A1%E5%86%B3%E5%AE%9A%EF%BC%9B%E5%8F%AF%E4%BB%A5%E9%80%9A%E8%BF%87%E9%85%8D%E7%BD%AE%E7%9B%B8%E5%85%B3%E5%AF%84%E5%AD%98%E5%99%A8%E8%BF%9B%E8%A1%8C%E8%B0%83%E6%95%B4%E3%80%82)
- [sensor逐行曝光原理_乐正倩彦的博客-CSDN博客_sensor曝光时间](https://blog.csdn.net/qq_42261630/article/details/109161790)
