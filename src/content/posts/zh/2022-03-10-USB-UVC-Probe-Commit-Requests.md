---
title: "UVC的视频格式协商流程-Video Probe&Commit Request"
slug: "2022-03-10-USB-UVC-Probe-Commit-Requests"
description: "本文对UVC协议下，Host与Device之间在传输Streaming之前进行媒体流格式、参数协商的Video Streaming Probe&Commit的过程做了一个简单地总结。"
date: 2022-03-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["USB","UVC"]
draft: false
---


UVC设备与Host之间进行视频传输格式协商的通信流程，是Host与UVC设备的Video Streaming Interface来进行通信的。两者之间的通信数据包的格式如[UVC协议SET/GET Request结构解析](/0e7651f9d27e4eee80b5f743cdb273fd)一文中的VideoStreaming Requests部分所述。


## Probe&Commit工作流程


Video Streaming Interface在Host和UVC camera之间使用一种Probe+Commit的方式来实现两者之间传输的视频格式协商流程的实现。


大致的流程是：

- UVC设备的USB描述符中，在Video Streaming Interface的声明上，包含了该设备所能够支持的所有YUV、MJPEG以及H.264等各种格式、不同分辨率帧率视频的列表，后续Host主要就是从这个列表中进行选择；
- 在协商过程中，Host端基于USB描述符中的format和分辨率、帧率等信息，以及自己的支持情况，选择一组期望的视频格式参数，通过Video Probe Control/SET_CUR命令发送给Device；
- Device收到以后Host发过来的视频格式参数后，对这个参数进行检查，看自己能不能完整支持：
    - 如果能够支持的话，就在这个参数结构中保持Host发过来的参数；
    - 如果无法支持就把对应的参数项设置为0，这样Host读回之后就会知道Device无法支持这个设置选项；
- 然后Host端再通过Video Probe Control/GET_CUR命令把Device检查过的参数读回来；
    - 如果Host读回的参数跟自己使用SET_CUR命令设置的参数完全一致的话，就表示两者已经协商一致，下一步就可以通过Commit命令向Device确认这个协商过的参数，并启动device开始按照这个参数发送图像流了；
    - 如果Host读回的参数有部分选项被Device修改为0，就表示Device无法支持该选项，这个时候Host就需要重新回到第二步，把Device无法支持的选项指标参数调低，然后再通过Probe/Get_cur和Probe/Set_Cur命令重新进行协商，直至达成一致；
- Host与Device按照以上Probe的协商流程达成一致后，就再通过Commit/SET_CUR指令向Device确认之前协商一致的参数，并启动图像流的传输；

简化版的工作流程如下图所示：


![Untitled.png](/images/blog/UVC的视频格式协商流程-Video-Probe&Commit-Request-1.png)

- 在以上流程中，Host与Device只进行了一次格式协商就达成一致；

更完整的协商流程图如下所示：


![Untitled.png](/images/blog/UVC的视频格式协商流程-Video-Probe&Commit-Request-2.png)

- 当Host读回的协商数据结构体出现不一致的情况下，就需要重新从头再进行协商。

## 协商数据结构体


| Offset | Field                      | Size | Description                                                                                                                                                                                                                                                                                              |
| ------ | -------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0      | bmHint                     | 2    | 这个参数用于指定在Host和Device在协商过程中，如果协商参数不一致、需要进一步协商的情况下，应该保持哪些属性不变。该参数由Host指定，对于Device而言是只读的。                                                                                                                                                                                                                   |
| 2      | bFormatIndex               | 1    | 本次协商Host所选择的格式索引（YUV/MJPEG/H.264），Device支持的格式列表及其索引在USB配置描述符中。该参数由Host指定。                                                                                                                                                                                                                                |
| 3      | bFrameIndex                | 1    | 本次协商Host所选择的图像帧分辨率索引，Device支持的分辨率参数列表及其索引在USB配置描述符中。该参数由Host指定。                                                                                                                                                                                                                                          |
| 4      | dwFrameInterval            | 4    | 本次协商Host所选择的帧率，以100ns为单位；                                                                                                                                                                                                                                                                                |
| 8      | wKeyFrameRate              | 2    | 本次协商Host所选择的关键帧间隔帧数量。                                                                                                                                                                                                                                                                                    |
| 10     | wPFrameRate                | 2    | 本次协商Host所选择的两个关键帧之间所包含的P Frame的数量。除了关键帧和P帧，剩下的就是B帧了。                                                                                                                                                                                                                                                     |
| 12     | wCompQuality               | 2    | 本次协商Host所选择的图像压缩质量即Compression Quality。取值范围为1（图像质量最低）-10000（图像质量最高）.                                                                                                                                                                                                                                     |
| 14     | wCompWindowSize            | 2    | 本次协商Host所选择的计算平均码率的图像帧数量。UVC1.5协议中提供了一个例子，设置目标平均码率为100Kbps的情况下，当把wCompWindowSize设置为10的话，就表示单个帧的大小可以大于或者小于100Kbps，但是连续计算10个图像帧的平均码率的话，这个平均码率大致就是100Kbps。                                                                                                                                                  |
| 16     | wDelay                     | 2    | 从视频图像采集，到显示出来的图像延迟。以ms为单位。                                                                                                                                                                                                                                                                               |
| 18     | dwMaxVideoFrameSize        | 4    | Device与Host在进行视频数据传输时，一个图像帧的数据量大小的最大值。                                                                                                                                                                                                                                                                   |
| 22     | dwMaxPayloadTransferSize   | 4    | Device与Host在进行视频数据传输的过程中，一次传输的packet中包含的数据大小的最大值。该参数由Device端设置，Host只读。                                                                                                                                                                                                                                   |
| 26     | dwClockFrequency           | 4    | Device端设置的时钟频率，以Hz为单位。在设备端发给Host的图像流的Payloader Header中依据这个参数来计算时间戳信息。这个参数由Device端设置，Host只读。                                                                                                                                                                                                              |
| 30     | bmFramingInfo              | 1    | 与Device发给Host的每一个图像帧数据的payload header的设置有关的位设置。                                                                                                                                                                                                                                                          |
| 31     | bPreferedVersion           | 1    | 该参数用于进行视频帧数据向Host传输的封装Payload格式的版本。每种Format可能会包含多个payload格式定义的版本，收发双方需要在这个版本上达成一致。Host端会把bPreferedVersion、bMinVersion和bMaxersion这三个参数在第一次进行Probe/Set的时候设置为0，具体的值由Device进行设置。然后Host在Probe/Get命令读取到Device端的设置值，在下次进行SET命令的时候设置自己期望使用的bPreferedVersion（min和max之间），但是bMinVersion和bMaxVersion必须保持为device设置的值。 |
| 32     | bMinVersion                | 1    | 参考bPreferedVersion的解释                                                                                                                                                                                                                                                                                    |
| 33     | bMaxVersion                | 1    | 参考bPreferedVersion的解释                                                                                                                                                                                                                                                                                    |
| 34     | bUsage                     | 1    | Device与Host传输图像视频的视频流模式，包括实时流、广播、文件存储等工作模式。                                                                                                                                                                                                                                                              |
| 35     | bBitDepthLuma              | 1    | bit_depth_luma_minus8 + 8                                                                                                                                                                                                                                                                                |
| 36     | bmSettings                 | 1    | temporally encoded video stream类型的传输流（例如H.264）专用，与这类图像流传输的Payload设置有关。                                                                                                                                                                                                                                   |
| 37     | bMaxNumberOfRefFramesPlus1 | 1    | Host端需要保存的最多参考帧的数量。                                                                                                                                                                                                                                                                                      |
| 38     | bmRateControlModes         | 2    | 码率控制模式设置。最多可以支持同时传输4条独立的视频流，每条流的码率控制模式都可以单独设置，控制模式用4bit表示，总共就是两个字节。如果这条流不支持码率控制，应该设置为0。                                                                                                                                                                                                                  |
| 40     | bmLayoutPerStream          | 8    | 视频编码算法的分层结构设置。最多可以支持同时传输4条独立的视频流，每条流的码率控制模式都可以单独设置，控制模式用2字节表示，总共就是八个字节。没有增强层的情况下，这个选项应该设置为0；                                                                                                                                                                                                             |


协商数据结构体是Host和Device之间使用Probe/Commit命令进行数据交换的格式。

- UVC1.5和UVC1.1的这个数据结构体的定义不同，UVC1.5是48字节，UVC1.1是34字节。以下以UVC1.5为准进行该结构体各个Field的说明。

## 问题


_**既然UVC设备对于视频格式的支持情况在其USB配置描述符中的Video Streaming Interface中已经包含了，对于Host而言，只需要从其中选择然后通过Commit直接设置即可，为什么还要通过这个来回反复的Probe/Set和Probe/Get命令来进行协商确定呢？**_


答案从以上协商数据中包含的各个Field的定义就可以看出来：通过Probe&Commit机制协商的视频图像参数，与USB配置描述符信息中所包含的信息并不一样。


这个媒体格式协商的机制就是在Device提供的Format和Frame的基础上进行选择，然后再在Probe&Commit的流程中对于可以协商的参数进行进一步明确和细化的完整通信流程。


## 参考资料：

1. UVC1.5 specification；
2. [AN75779 - How to implement an image sensor interface using EZ-USB FX3 in a UVC framework](https://www.infineon.com/dgdl/Infineon-AN75779_How_to_Implement_an_Image_Sensor_Interface_with_EZ-USB_FX3_in_a_USB_Video_Class_(UVC)_Framework-ApplicationNotes-v13_00-EN.pdf?fileId=8ac78c8c7cdc391c017d073ad2b85f0d)
3. [Getting video stream from USB web-camera on Arduino Due - Part 1: Getting Started - CodeProject](https://www.codeproject.com/Articles/863938/Getting-video-stream-from-USB-web-camera-on-Arduin)
