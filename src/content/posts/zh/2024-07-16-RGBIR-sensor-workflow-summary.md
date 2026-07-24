---
title: "RGBIR Sensor的工作原理和流程总结"
slug: "2024-07-16-RGBIR-sensor-workflow-summary"
description: "本文对比了IPC领域中常用的Bayer RGB图像传感器与RGB-IR类型的图像传感器的差异，基于RGB-IR传感器图像处理系统的组成，以及比较典型几种RGB-IR图像应用，对RGB-IR图像传感器的技术工作原理和应用做了一个初步的总结。"
date: 2024-07-16T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["Image Sensor","音视频"]
draft: false
---


一般情况下，IPC摄像头行业绝大多数情况下都采用白天全彩，夜视切换为黑白的工作模式。这种方案采用白天和晚上两套滤光片，使用SOC的GPIO来控制IRCUT机构件对滤光片进行切换：白天模式下，ISP设置为全彩模式，IRCUT切换为白天的滤光片，关闭IR灯，出彩色图像；黑夜模式下，ISP设置为黑白模式，IRCUT切换为晚上的滤光片，打开IR灯，出黑白图像。白天和晚上两套滤光片的差异主要是，白天的滤光片带宽范围更窄，把更多的红外光滤掉，色彩还原更真实；晚上滤光片的带宽更宽，主要是增加了更多的红外光部分，这样IR灯发出的红外光就可以进入滤光片补光。

- 当然也有部分例外的就是目前逐渐兴起的所谓夜视全彩，星光全彩等方案，ISP端可以采用AI-ISP来实现更好的降噪效果，但是最重要的是Lens和Image Sensor也都要采用能够支持夜视全彩的组合，Lens的光圈越大越好，F1.2甚至F1.0，Image Sensor的Pixel Size在1.8um以上。最终的结果就是这个光学方案的价格很高，200万像素一般需要6-7$，2.5K超清的方案更是达到了10$左右。

RGBIR Image Sensor相比于一般摄像头所使用的Bayer Sensor，最大的区别是，进入滤光片后，Sensor所产生的图像不仅包含了RGB三原色，还有IR图像，相当于Sensor同时产生彩色图像和IR的黑白图像给后端的ISP和编码器，省掉了对IRCUT这个机械机构的依赖。


## RGBIR vs Bayer


目前市场上绝大多数各类摄像头所使用的图像传感器都是输出Bayer格式的图像数据到ISP中进行进一步的处理。


![image.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-1.png)

- Bayer图像阵列中，每4个像素组成一个模块，其中包含有一个蓝色B像素，一个红色的R像素，以及两个绿色的G像素。

而RGB-IR类型的Image Sensor的图像阵列则如下所示：


![image.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-2.png)

- RGB-IR Image Sensor中，一个模块包含4x4=16个像素。其中包含有两个红色的R像素，两个蓝色的B像素，八个绿色的G像素，以及4个专门对于红外频谱感光的IR像素。

也就是说，在RGB-IR像素中，实际上是牺牲了红色像素和蓝色像素的数量，增加了专门对红外频谱感光的IR像素。


## 支持RGB-IR的前提条件


### Image Sensor

- 首先当然是要选择支持RGB-IR的sensor。如上所述，目前绝大多数CMOS的Image Sensor，基本上都是输出Bayer格式的图像数据。所以如果要做RGB-IR的图像系统，首先要选择输出RGB-IR格式图像的图像传感器。

### 滤光片

- 对于普通的Bayer格式的摄像头而言，白天使用的滤光片仅允许处于可见光波段的光线进入，而夜晚所使用的滤光片则仅允许红外光波段的光线进入。也就是说，白天的滤光片和晚上的滤光片都是单波段的带通滤波器。
- 而对于RGB-IR类型的Image Sensor而言，因为在Sensor上要同时进行可见光和红外光两个波段的过滤，所以这类图像传感器配合的滤光片应该设计为双波段的带通滤波器。如下图所示的同时运行400-650nm的可见光和800-950nm的红外光进入传感器。

![image.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-3.png)


### ISP

- 在ISP方面，ISP的Vin接口必须要能够支持正确的接收并解析RGB-IR Image Sensor所传过来的图像数据，将其中包含RGB和IR的图像数据分离到两个不同的图像帧中。而且ISP必须能够同时处理RGB图像帧和IR图像帧，而且还应该有一个算法模块用于处理掉RGB通道上叠加的IR污染以确保RGB图像帧输出正确的颜色。
- ISP还应该有能力根据系统的要求同时输出处理过的RGB或IR帧，相当于从RGB-IR上读取的一个图像帧，在ISP的处理后总是会生成一个RGB图像帧和一个IR图像帧。

![image.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-4.png)


## RGB-IR Sensor的对比与典型应用


相比于目前主流的Bayer格式的RGB摄像头，RGB-IR存在的缺陷显而易见：

- 在Bayer BGGR图像阵列中增加了IR像素，减少了B和R像素，这样毫无疑问会降低图像的色彩还原度，所以如果对于图像的色彩还原要求较高的话，RGB-IR明显是不合适的。
- 尽管现在有不少的Sensor和ISP厂商已经推出了支持RGB-IR的产品，但是仍然是非主流，所以这类产品避免不了价格更高，开发难度更大，注定只能做一些小众化的市场。

当然，RGB-IR的优势也是很明显的：它可以在任何光照条件下同时输出彩色图像和IR的黑白图像。因此重点就是找到对于这个特性有需求的应用场景。


### 基于红外图像在全黑环境下AI图像检测


![image.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-5.png)


大多数AI算法都是针对光线较好情况下的彩色图像进行AI检测，在光线不足的情况下，图像中物体边缘的锐度严重下降以及层出不穷的各种噪点会严重劣化AI算法判断的精度。此时使用RGB-IR Sensor输出的IR图像进行检测，效果就会好很多。当然，这种应用在普通的使用IR CUT切换IPC上也可以做到，但是RGB-IR的优势则在于去掉了对IRCUT这个机械器件的依赖，产品运行更稳定，寿命也更长。


### 利用IR光的穿透性提供与彩色图像的差异化功能


例如940nm波段所发出的红外光线，人眼看不到，因此不会对用户的使用体验有直接的干扰和影响，但是这个波段的红外光穿透性更强，配合对应的RGB-IR Sensor以及滤光片，可以看到一些可见光环境下无法看到的场景。例如穿透墨镜或者部分口罩材质。


![image.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-6.png)


### 利用IR隐藏在可见光下看不到的标识


针对一些特殊领域的标识或者防伪信息方面的应用，市场上存在一些涂料，只有特定波段的IR光照射于其上，并且IR摄像头才能看到。例如下图中在可见的交通标识中隐藏一个二维码，以及在安全带上隐藏字符串等信息。


![1723602416386.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-7.png)


![image.png](/images/blog/RGBIR-Sensor的工作原理和流程总结-8.png)


## 参考文档

- [What is an RGB-IR camera? How does an RGB-IR camera work? - e-con Systems](https://www.e-consystems.com/blog/camera/technology/what-is-an-rgb-ir-camera-how-does-an-rgb-ir-camera-work/?srsltid=AfmBOopgkNoWHKs8mnqCySndsBGd1e10S-9DvRzPRwCR_YWEL-Tugr6S)
- [人工智慧車載更敏銳的視覺方案 - RGB-IR攝影機 | 茂綸股份有限公司 (macnica.com)](https://www.macnica.com/apac/galaxy/zh_tw/products-support/technical-articles/rgb-ir-camera/)
