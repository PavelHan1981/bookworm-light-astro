---
title: "短红外（SWIR）传感器的工作原理与应用总结"
slug: "2025-09-15-the-application-note-of-SWIR-sensor"
description: "本文简要总结了基于短波红外光频段成像的SWIR传感器及其成像系统的技术概念以及在工业和生活中的常见应用，为理解和在实际产品中应用该技术做好基础。"
date: 2025-09-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["音视频","硬件","Image Sensor"]
draft: false
---


本文简要总结了基于短波红外光频段成像的SWIR传感器及其成像系统的技术概念以及在工业和生活中的常见应用，为理解和在实际产品中应用该技术做好基础。


## SWIR技术简介


SWIR：Short Wave InfraRed Light，短波红外光。波长范围通常在0.9-1.7um波段（也有一种说法是0.9-2.5um波段）。


下图是红外光在频谱上所在的波段。总的来说，红外光波段可以分为SWIR短红外、MWIR中红外、LWIR远红外这几个部分。各个部分对应的波长范围大致如下图所示。


![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-1.png)


从曝光成像的工作原理上讲，SWIR传感器与我们常见的可见光谱的图像传感器的工作机理类似，都依赖于被拍摄物体材料的反射特性：外部光照中所包含的光子要么被物体反射，要么被物体吸收，从而产生高分辨率图像所需的对比度和阴影。

- 这一点与MWIR和LWIR波段的成像原理差异很大，MWIR和LWIR波段的成像依赖于物体本身的黑体辐射，辐射量与温度相关。_因此，可见光和SWIR的成像要依赖于外部的光照情况，外部光照照射到物体上被反射后进入镜头成像，因此其成像不是全天候的，晚上一般需要额外补光；而MWIR和NWIR成像依赖于物体本身的黑体辐射，因此可支持全天候24h成像。_

**因此，SWIR相机所产生的图像，在灵敏度和细节上与可见光相当，具有鲜明的阴影和高对比度。当然，SWIR的成像是单色的。**


## SWIR传感器的工艺及其限制


常见的可见光的图像传感器都是基于标准硅工艺生产的，因为硅元素的吸收系数在1100nm波长附近迅速下降，因此基于硅工艺的光传感器的实际有效检测的上限一般为1000nm。也就是说，硅对1000nm以上的光子吸收能力极弱，导致在该波长段的信号响应几乎为0，因此硅工艺不适合用于进行SWIR成像。


SWIR成像传感器一般采用InGaAs工艺，其对光子的探测波长上限为约1700nm，因此InGaAs传感器可以有效的吸收并且转换900-1700nm范围内的光子，是SWIR成像领域的主流选择。


InGaAs传感器的问题则在于：

- InGaAs不能直接在硅晶圆上生长，材料昂贵，工艺复杂且良率低，导致传感器的生产成本和价格均很高。
- InGaAs传感器的像素尺寸缩小以后会影响图像质量，难以做到CMOS一样的高集成度和大阵列。

## SWIR传感器的典型应用


### 夜视成像


夜间的图像监控对于普通的可见光相机而言始终是个难点。其主要的原因是夜里并非没有光线，而是处于可见光频段的光线能量太弱，进入可见光图像传感器的光子太少，不得不通过外部补光以及提升增益（图像质量变差）、增大pixel size和lens光圈（成本太高）的方式缓解问题。而在900-1700nm频段的短波红外光频段，大气辉光（nightglow）、星光和1.5 µm激光反射等仍然充足，SWIR 传感器（InGaAs）可以把这些人眼看不见的光转成高分辨率图像。


因此在夜视成像领域，SWIR相比普通的可见光相机而言，图像亮度要比可见光高5-7倍；而相比工作在LWIR频段的热成像仪而言，图像的分辨率又要高很多。


以下左图为可见光相机的成像，右图为相同环境下SWIR相机的成像：


![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-2.png)


### 水果水分/农产品拣选


水对900-1700nm频段的光线有着比较强的吸收特性，在1.45µm最强，1.95µm次之。一般的农产品和水70%都是水，含水量越高的情况下，该物体对于SWIR频段光线的反射率越低，呈现在SWIR图像中就越黑。而农产品和水果的任何生理变化（成熟、碰伤、腐烂、糖积累）都会改变其内部的水分分布或糖分浓度，于是在SWIR的图像里就会出现肉眼看不见的明暗反差。


![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-3.png)


### 穿透雾霾成像


在雾霾天气的情况下，雾霾的颗粒直径普遍在0.1-1um之间，该范围的雾霾颗粒对于可见光的反射最大，而对于SWIR波段的散射要小很多，因此更多SWIR频段的光线可以透射雾霾颗粒，在SWIR相机中成像的图像白雾层就会大幅减薄。因此，在浓雾、雾霾等天气状况中，使用SWIR成像系统在边境、机场、海岸等监控领域中，其成像比可见光相机要清晰很多。


![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-4.png)


### 高温检测


当物体的温度超过140摄氏度时，会越来越多地向外发射红外辐射，这些辐射的红外光可以通过SWIR技术检测到。当物体越热的时候，它发出的红外辐射就越多，物体在图像中就越亮。这就意味着可以使用SWIR技术在工业监测等领域中对温度检测提供竞争优势，因为它可以实现材料和产品的非接触式温度监测。这在传统温度测量方法不切实际或危险的环境中特别有用。


例如下图是电烙铁在400摄氏度的情况下，在普通的可见光相机（左图）以及SWIR相机（右图）下的对比图片。


![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-5.png)


## 参考资料

- [What is SWIR? | Edmund Optics](https://www.edmundoptics.com/knowledge-center/application-notes/imaging/what-is-swir/?srsltid=AfmBOor_oQHQ_oCLRToKSw-obkGtrHM9dq07XGViLlzLBH8Af4OZm4L9)
- [What is SWIR? | SWIR Vision Systems](https://www.swirvisionsystems.com/about/what-is-swir/)
- [Understanding SWIR: Applications and Benefits- Oxford Instruments](https://andor.oxinst.com/learning/view/article/understanding-swir)
- [Clear Align Knowledge Center-Optical Engineering Insights & Resources || Why SWIR is Ideal for Border Surveillance & Maritime Imaging](https://clearalign.com/knowledge-center/id/5/why-swir-is-ideal-for-border-surveillance-maritime-imaging)
