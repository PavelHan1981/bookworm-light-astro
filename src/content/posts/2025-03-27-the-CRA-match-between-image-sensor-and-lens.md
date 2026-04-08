---
title: "图像传感器和镜头的CRA参数解释及其匹配"
slug: "2025-03-27-the-CRA-match-between-image-sensor-and-lens"
description: "CRA：Chief Ray Angle，也就是主入射光线角度。对于镜头和Image Sensor而言，虽然两者都有CRA参数，但是其实际定义是明显不同的。
Lens的CRA参数则由镜头的设计本身决定，表示从镜心到成像面的光线角度分布模式。也就是就是镜头各个位置的主光线（过入瞳中心的光线）通过光学系统到达像面以后，与像面交点位置处的法线之间的夹角。"
date: 2025-03-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["Image Sensor","音视频","镜头"]
draft: false
---


CRA：Chief Ray Angle，也就是主入射光线角度。对于镜头和Image Sensor而言，虽然两者都有CRA参数，但是其实际定义是明显不同的。


## 镜头的CRA参数


Lens的CRA参数则由镜头的设计本身决定，表示从镜心到成像面的光线角度分布模式。也就是就是镜头各个位置的主光线（过入瞳中心的光线）通过光学系统到达像面以后，与像面交点位置处的法线之间的夹角。


如下图所示，镜头每个位置的主入射光线角度是不同的，因此也就意味着，镜头的CRA参数个固定值，而是根据镜头视场角位置的不同而不同。例如下图从上到下展示了ZEMAX镜头库Double Gauss 28 Degree Field光学系统在14°、10°以及0°视场对应的主光线角度。


![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-1.png)


从以上的镜头光线成像原理图上可以看出，镜头视场角越大，其对应的CRA的角度也越大。镜头中心位置即0度视场角，可以认为其CRA为0，越到镜头的边缘位置，CRA角度越大。我们通常意义上所说的镜头CRA角度，一般指的就是镜头边缘位置的CRA角度。


下图就是某个型号的镜头不同像面高度归一化后对应的CRA，镜头中心的CRA为0，镜头像面上不同高度的主光线角度不同，从而可以得到一条随像面高度变化的CRA曲线。


![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-2.png)


## 图像传感器的CRA参数


相比于镜头的CRA参数，Lens的CRA参数要稍微复杂一点。


首先，Image Sensor的每个像素上都有一个微小的微透镜（Micro Lens），用于把镜头透入的光线尽可能多的聚焦到其下的光电二极管，实现光电转换。从下图可以看到，在光电二极管的上面增加Micro Lens，可以把更多的光线通过这个微型透镜折射到感光面上，从而提升光电二极管上的光通量，这就是增加Micro Lens的主要作用。


![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-3.png)


按照以上微透镜的结构，如果从镜头透入的光线角度是垂直入射到微透镜上（例如图像传感器和镜头中心区域），那么这些光线就都可以通过微透镜进入像素阵列中的光吸收区域。但是，如果镜头投入的光线是以一定的角度斜射到到微透镜上（例如图像传感器和镜头的边缘位置），经过微透镜折射后，这些光线就会照射到像素内部的金属层上面（如上图的灰色区域），无法照射到中心吸收区域，这样就会使得光吸收区域光照强度下降，从而使边缘像素的灵敏度下降、光学串扰增加。如下图所示。


![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-4.png)


以上问题就引出了Micro Lens的平移设计。


### Micro Lens的平移设计


针对以上图像传感器边缘位置的像素感光问题（通过镜头的光线斜射到微透镜上），需要将微透镜平移一定的距离，这样可以使得光线经过折射以后，将未平移透镜之前损失的光线，重新聚焦到光吸收区域。如下图所示，把微透镜的位置向中心位置平移一定距离以后，以一定角度入射的光线会被微透镜折射到该像素的中心吸收区域。


![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-5.png)


从以上镜头CRA的光学理论了解到，通过镜头进入图像传感器感光面的主入射光线角度，与镜头以及Sensor感光面的位置有关。一般的光学应用中，镜头和Sensor的光轴中心是重合的，那么在Sensor的中心位置，从镜头透入的主光线角度基本上是垂直照射在Sensor中心像素的微透镜上，因此大部分光线就可以被微透镜折射到中心吸收区域。


而从中心向四周延展的过程中，镜头透入光线的主光线角度随之越来越大，此时就可以通过对Sensor四周区域像素的微透镜进行以上平移的处理。平移的方向和幅度大小应该跟这个位置上镜头主入射光线的角度相关。**这就是镜头与Sensor之间的CRA匹配的问题。**


### Sensor的CRA同样与像素所在位置相关


同样的逻辑，对于Image Sensor的设计而言，Sensor像素上微透镜的平移方向和幅度与其应接收到的透入光线的主光线角度匹配，这就是Sensor所要求的CRA参数。同样的，以Sensor中心为轴，Sensor中心的CRA为0，向四周延申的不同位置的Sensor区域的CRA不同，越到Sensor的边缘，CRA越大。


以下是GC4653的CRA数据，Sensor中心位置CRA为0，边缘位置接近10度。**而一般而言，我们在Sensor数据手册上看到的CRA数据就是其边缘位置最大的CRA角度。**



![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-6.png)


## Sensor和镜头的CRA匹配选型


在进行Image Sensor和镜头的选项流程中，需要特别注意两者CRA的匹配，最理想的情况为镜头的CRA和sensor的CRA产生了完美的匹配，此时光接收效率最高。但实际应用中很难做到两者的完美匹配，**此时应确保镜头CRA与Sensor CRA的差异控制在2-3度以内**。


![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-7.png)


如果Sensor和镜头的CRA不匹配的话，后期调试的图像效果会存在难以解决的问题：

- 当Lens CRA > Sensor CRA时，镜头射入的光线会超出Sensor微透镜的矫正能力，导致后期图像出现相邻像素串扰（Color Shading）的问题，具体表现为图像边缘偏色。
- 当Lens CRA < Sensor CRA时，镜头透入的光线无法覆盖像素边缘，造成感光面积损失（Luma Shading），具体的图像表现为四周暗角。

**实际进行图像IQ调试时，由于Color Shading（色彩偏差）比Luma Shading（亮度不均）更难以通过ISP在后期校正，所以在两者的选型方面，建议选择Lens CRA略小于Sensor CRA的方案。**


### CRA不匹配的图像问题


如上所述，当镜头和Sensor的CRA不匹配的时候，会产生一些图像方面的问题，那么这些图像方面的问题究竟是如何产生的呢？


![image.png](/images/blog/图像传感器和镜头的CRA参数解释及其匹配-8.png)


参考上图，当镜头CRA相比Sensor的CRA偏小过多的时候，会导致从镜头透入到Sensor边缘区域像素Micro Lens上的光线被折射到像素的不感光区域，感光区域能够吸收的光通量太小，因此也就会出现图像四周偏暗的情况，这就是Luma Shading的问题。


而如果镜头CRA相比Sensor的CRA偏大过多的时候，镜头透入到Sensor边缘区域像素的光线CRA过大，这些光线在Sensor边缘像素Micro Lens上折射后会折射到周边的其他颜色的像素上，导致像素之间出现干扰，这就是色彩阴影Color shading的问题。


## 参考资料

- [什么是 CRA ？](https://mp.weixin.qq.com/s?__biz=Mzg4MTU1OTIzNA%3D%3D&mid=2247484282&idx=1&sn=48bf68b03a424b1da13531feebad8685&chksm=cf6550d7f812d9c169b9605fa6784508969bc80c73864c596b0583d7a7ce629332d200b6fca4#rd)
- [LENS CRA和SENSOR CRA匹配问题解析](https://mp.weixin.qq.com/s?__biz=Mzg4MDYwNjM1Mw%3D%3D&mid=2247483841&idx=1&sn=85c18ea07a9ab2a101f4b0c7c80503b2&chksm=cefa166c1d1829e0317169f0bdcdf30148b335d3daf6c772cc52efd8f4d568c817e33f9a66be#rd)
- [浅谈探测器微透镜的设计](https://mp.weixin.qq.com/s?__biz=MzI1OTIxMDExMg%3D%3D&mid=2247484113&idx=1&sn=00f969ce70bb850dbbb44a31d119059c&chksm=eb9b3001083a293363d7ebd58c2cfedcb3d659c32f2f802d6e7c50c6a130c3fec2e930830bd0#rd)
