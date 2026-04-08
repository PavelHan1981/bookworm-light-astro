---
title: "UCConfig学习笔记之UCConfig Mode 0"
slug: "2022-05-31-ucconfig-mode-0-summary"
description: "本文基于对UCConfig规范定义文档和Teams认证对于H.264 Encoder的认证规范文档的学习，总结了UCConfig Mode 0的H.264编码结构和码流结构。"
date: 2022-05-31T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["H.264","音视频"]
draft: false
---


在参考文档1中，对UCConfig Mode 0的定义是：Non‐scalable single layer AVC bitstream with Simulcast (number of simulcast streams >= 1).。也就是说UCConfig Mode 0不需要支持SVC的分层，常见的AVC编码器的码流可以归属于这一类。但是需要注意的是，尽管Mode0不需要支持SVC分层，但是同样对输出的码流NAL Unit的结构有明确的的要求，最显著的就是需要包含SVC特有的Prefix NAL Unit。


## 分层结构


UCConfig Mode 0对应的编码模式既然是AVC，也就不存在分层的概念。所以在编码的结构上只包含一个层。


![Untitled.png](/images/blog/UCConfig学习笔记之UCConfig-Mode-0-1.png)

- 实际上这种模式的编码结构也是H.264编码器最常见的编码结构：I帧后的第一个P帧的解码仅依赖于前面的P帧，此后的P帧则依赖于I帧和它之前的P帧，所以整个GOP中任何一个P帧丢失，这个GOP后面的P帧都无法正常解码了。

对应到SigmaStar的Webcam方案（如SSD268G、SSC9351等），实际上就是所谓的NormalP编码模式，这种编码模式也是该方案默认的编码模式：


![Untitled.png](/images/blog/UCConfig学习笔记之UCConfig-Mode-0-2.png)


## 码流结构需求


除了以上的编码结构以外，UCConfig Mode 0对于编码器输出的码流也有明确的要求：

- UCConfig Mode 0下，尽管不需要支持SVC的分层结构，但对于其输出的码流而言，同样要求在每个图像压缩数据所在的NAL Unit之前包含一个Prefix NAL Unit；使用这个Prefix NAL Unit中的priority_id来标记这个码流的相对优先级，0表示最高优先级，1表示次高优先级，以此类推。
    - 这样如果一个节点同时发送多路UCConfig Mode 0给中央服务器，服务器在收到多条流以后就可以通过这个priority_id来判断各条流的优先级；
- 在每个Prefix NAL Unit中，dependency_id, quality_id和temporal_id均必须为0；no_inter_layer_pred_flag，discardable_flag和output_flag必须为1；use_ref_base_pic_flag必须为1。
- 对于不支持SVC模式的解码器而言，接收到的Streaming流数据中如果遇到Prefix NAL Unit，解码器会直接把这个NAL Unit丢弃掉，因此不支持SVC的解码器也可以对符合UCConfig Mode 0规范的码流成功解码。

## 参考文档：

- H.264 AVC/SVC UCConfig Mode Specification V1.1
