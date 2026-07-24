---
title: "UCConfig学习笔记之UCConfig Mode 1"
slug: "2022-05-27-ucconfig-mode-1-summary"
description: "本文基于对UCConfig规范定义文档和Teams认证对于H.264 Encoder的认证规范文档的学习，总结了UCConfig Mode 1的H.264编码结构和码流结构。"
date: 2022-05-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["H.264","音视频"]
draft: false
---


在参考文档1中，对UCConfig Mode 1的定义是：SVC temporal scalability with hierarchical P with Simulcast (number of simulcast streams >= 1)。也就是说需要编码器能够支持SVC模式的帧率扩展模式。即编码器输出的一路流中可以包含多种不同帧率的分层支持。


## 编码分层结构


为了能够支持以上的不同帧率的分层架构，需要在编码器的参考帧依赖结构上做一些针对性的设计，也就是文档1中所提到的Hierarchical P prediction structure。


按照分层的数量，Mode1可以分为两层、三层和四层帧率分层结构。


![二层帧率分层结构](/images/blog/UCConfig学习笔记之UCConfig-Mode-1-1.png)

- 可以在最大帧率和1/2最大帧率两种分层中进行切换。
- 在最大帧率为30fps的情况下，如果只接收Layer0（也就是Base Layer），那么接收的帧率就是15fps；如果同时接收Layer0（15fps）+Layer1（15fps），那么总的接收帧率就是30fps；

![三层帧率分层结构](/images/blog/UCConfig学习笔记之UCConfig-Mode-1-2.png)

- 可以在最大帧率、1/2最大帧率和1/4最大帧率三种分层中进行切换。
- 在最大帧率为30fps的情况下，如果只接收Layer0（也就是Base Layer），那么接收的帧率就是7.5fps；如果同时接收Layer0（7.5fps）+Layer1（7.5fps），那么总的接收帧率就是15fps；如果同时接收Layer0（7.5fps）+Layer1（7.5fps）+Layer2（15fps），那么总的接收帧率就是30fps。

![四层帧率分层结构](/images/blog/UCConfig学习笔记之UCConfig-Mode-1-3.png)

- 可以在最大帧率、1/2最大帧率、1/4最大帧率、1/8最大帧率四种分层中进行切换。
- 在最大帧率为60fps的情况下，如果只接收Layer0（也就是Base Layer），那么接收的帧率就是7.5fps；如果同时接收Layer0（7.5fps）+Layer1（7.5fps），那么总的接收帧率就是15fps；如果同时接收Layer0（7.5fps）+Layer1（7.5fps）+Layer2（15fps），那么总的接收帧率就是30fps；如果同时接收Layer0（7.5fps）+Layer1（7.5fps）+Layer2（15fps）+Layer3（30fps），那么总的接收帧率就是60fps。

## 码流结构需求


除了以上的编码结构以外，UCConfig Mode 1对于编码器输出的码流也有明确的要求：

- 每个包含IDR（NAL Unit Type=1）和non-IDR（NAL Unit Type=5）帧编码数据的NAL Unit之前，都必须要加一个Prefix NAL Unit（NAL Unit Type=14）。在这个Prefix NAL Unit中使用priority_id元素来标记其后面跟的图像编码数据分层的优先级：0表示Base Layer，1表示第一个扩展层，2表示第二个扩展层，以此类推。
    - 此外NAL Unit Type=2，3，20的这三种NAL Unit不能出现在这种类型的编码流中。
- 同时，在这个Prefix NAL Unit中，使用Temporal_id来指定帧率分层的结构：0代表Base Layer的数据，1代表第一个帧率扩展层的数据，2代表第二个帧率扩展层的数据。
    - 在文档2中定义，UCConfig Mode 1的码流中所包含的Prefix NAL Unit，其Temporal_id与priority_id元素的值必须相同。但是在文档1中并没有这个要求。但是客观地讲，对于UCConfig Mode 1的码流而言，因为其中只应该有帧率方面的扩展层，不应该包含其他的分辨率和图像质量等的分层，因此这个要求应该是合理的。
- 所有Prefix NAL Unit中的dependency_id和quality_id必须设置为0。no_inter_layer_pred_flag，discardable_flag和output_flag必须设置为1。use_ref_base_pic_flag必须设置为0.
- 这个Prefix NAL Unit是SVC扩展独有的NAL Unit类型，因此如果一个不支持SVC的Unit收到SVC的码流以后，会把这个Prefix NAL Unit直接丢弃，但是仍然能够成功的对SVC的码流进行解码播放。

## 参考资料

- Unified Communication Specification for H.264 AVC and SVC UCConfig Modes V 1.1；
- Microsoft Skype for Business H.264 Video Encoder Specification；
