---
title: "《Microsoft Skype for Business H.264 Video Encoder Specification》学习笔记"
slug: "2022-05-20-MS-skype-for-business-h264-video-encoder-specification"
description: "本文基于对微软Teams认证的官方文档《Microsoft Skype for Business H.264 Video Encoder Specification》的学习，整理出来进行Teams的H.264 Encoder认证的技术需求与流程。"
date: 2022-05-20T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["USB","H.264","UVC"]
draft: false
---


对于要通过Mircosoft的Teams或者Skype For Business认证的视频会议系统，要使用H.264来进行图像传输的情况，就需要对图像视频压缩所使用的H.264编码器进行Teams和Skype For Business的认证，才能打上对应的认证Logo。而这个对于H.264编码器进行认证的规范指导文件就是《Microsoft Skype for Business H.264 Video Encoder Specification》，文档编号为H105958。

- **注意：这个规范文件和认证流程针对的是单纯的H.264编码器，而不是整个摄像头系统。**所有的指标、功能性要求以及进行测试和验证的流程，都是针对链路上所使用的H.264编码器。

在该规范文档中，把要通过Teams和Skype For Business认证的H.264编码器分为以下三种情况：

- Category 1：USB Camera内部包含的H.264编码器；
- Category 2：笔记本、平板电脑和手机中集成的摄像头内部自带的H.264编码器；
- Category 3：通用的H.264硬件编码器。

如同其他所有的Teams认证的规范文档，通过Teams的H.264 Encoder的认证，同样存在Standard和Premium两种认证规格，后者的指标和功能要求更加严格一些。而只要通过Standard的指标要求，就可以打上Teams的认证Logo。


无论对于Standard还是Premium类型的认证而言，**对于H.264编码器的基本要求就是能够支持UCConfig Mode 1，也就是需要H.264编码器至少能够支持SVC的Temporal Layer**。所以那些不支持SVC模式的编码器就可以洗洗睡了：（4.1）Encoders must support UCConfig Mode 1 and the corresponding requirements outlined below in order to participate in the Skype for Business Logo program。另外要通过这个认证，需要编码器支持的最大分辨率至少要是1080P。

- UCConfig Mode 1的定义：SVC temporal scalability with hierarchical P with Simulcast (number of simulcast streams >= 1).

## H.264编码器进行Teams认证的测试流程


微软为了进行这个H.264编码器的一致性测试，专门提供了一个测试工具：Microsoft Skype Video Encoding Conformance (MLVEC) toolkit。这个工具主要分为两个部分：H.264的码流产生器（BitStream Generator）和码流一致性验证器（Conformance Verifier）。


![Untitled.png](/images/blog/《Microsoft-Skype-for-Business-H.264-Video-Encoder--1.png)


BitStream Generator：

- BitStream Generator的输入有两个：一个是Skype Business进行测试认证的录像片段（不同分辨率、不同场景），也就是上面的Skype Logo Clips；另外一个就是Config Scripts，在其中定义了测试编码器需要设置编码器的参数和工作流程，编码器按照该脚本的命令进行工作。
    - 对于USB Camera而言，要进行这个测试肯定就没那么容易了，因为没有办法很容易的把这些认证录像片段方便的送入USB Camera的编码器中进行编码。所以针对这个问题，文档中明确规定，**对于这类USB Camera的认证而言，Camera的生产厂家，要自己想办法（例如通过一个专门的开发板）把测试录像片段送入Camera内部的编码器，并按照要求自行完成码流的生成。（5.3）Tethered USB webcams usually don’t have a possibility to feed the pre-recorded clips into the hardware encoder. Due to this we are currently requiring these tests to be run on a development kit which allows feeding the pre-recorded clips into the encoder.**
- BitStream Generator的输出就是各种不同测试参数状态下的码流文件，以及运行中所产生的的log。

Conformance Verifier：

- Conformance Verifier读取BitStream Generator所产生的码率文件和运行log，基于其内部的功能性分析工具进行判断，看编码器所产生的的码率及其运行过程的指标性数据，是否符合Standard和Premium的标准，给出最终的测试判定报告。

## H.264编码器认证需求

- Aspect ratios and image resolutions：对于编码器能够支持的图像长宽比和分辨率的要求，三个Category的编码器有不同的长宽比和分辨率编码测试要求；

    ![Untitled.png](/images/blog/《Microsoft-Skype-for-Business-H.264-Video-Encoder--2.png)


    ![Untitled.png](/images/blog/《Microsoft-Skype-for-Business-H.264-Video-Encoder--3.png)

- Frame rate：不同分辨率下的编码帧率要求

    ![Untitled.png](/images/blog/《Microsoft-Skype-for-Business-H.264-Video-Encoder--4.png)

- Video preview：对于Preview视频的输出需求。内置H.264编码器的USB Camera需要能够同时提供一路小分辨率（640x480或者640x360 30fps）的YUV图像作为Preview的功能。
    - **不是很清楚对于USB UVC camere而言，如何能够在传输H.264 main Streaming的同时，把这个YUV的preview video也传过去？具体应该怎么做？**
- Encoder latency：编码延迟指标，对于编码进行编码导致的Pipeline延迟不应该影响帧率，或者造成图像在传输和解码回放时出现抖动。
- Dynamic resolution change：编码器应该能够支持在Pipelien的编码器正常运行的过程中，动态的调整分辨率。且有一定的调整延迟指标。
- Dynamic profile/level change：编码器应该能够支持在Pipelien的编码器正常运行的过程中，根据具体情况动态调整编码的profile和level的设置。且有一定的调整延迟指标。
- Dynamic add/remove temporal layers：对于支持SVC扩展的编码器而言，能够在编码过程中，动态的增加或者删除帧率扩展层（temporal layer），且有一定的调整延迟指标。
- Bitstream Conformance：这部分对于编码器在各种模式下输出的码率的设置有明确的的要求。
- Quality Conformance：对编码器产生的码率，经过解压缩以后的图像质量有明确的要求。

## 其他

- 对于USB Camera而言，如果要通过Teams的这个H.264 Video Encoder认证，需要在USB Camera中支持UVC1.5规范：实际上UVC1.1已经可以通过Frame Based的方式来支持H.264的Payload了，但是把H.264当成一种独立的payload来进行支持的话，只能使用UVC1.5规范。不过UVC1.5的兼容性不大好，只有在Win8及其以后的系统中才能够支持。

## 参考资料：

- Microsoft Skype for Business H.264 Video Encoder Specification，H105958
- Unified Communication Specification for H.264 AVC and SVC UCConfig Modes, V1.1
