---
title: "Nuvoton ISD9160本地语音识别解决方案"
slug: "2022-03-30-nuvoton-isd9160-audio-recognition-solution"
description: "本文基于对Nuvoton提供的ISD9160数据手册、Voice Recognition开发的相关资料和视频教学课程的学习，总结了使用ISD9160进行本地语音识别产品开发的大致流程。"
date: 2022-03-30T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["Audio"]
draft: false
---


Nuvoton的ISD9160处理器本身实际上只是一个基于ARM Cortex-M0核心的32bit通用低功耗处理器。与其他的ARM MCU相比，其最大的特色是内置有高精度的audio codec，因此比较适合应用于一些低成本音频录制和回放功能的产品应用场景。

- 最高运行主频50MHz，内置145KB Flash以及12KB SRAM。

ISD9160之所以能够实现本地语音识别的功能，除了它具备以上的硬件素质之外，最重要的是，第三方语音算法公司Cyberon专门开发的语音识别算法能够完整的运行在ISD9160上。并且Nuvoton基于该算法在ISD9160的基础上完成了一个完整的本地语音识别的解决方案。对于产品开发者而言，只需要做很少的工作就可以把本地语音识别的功能整合到自己的产品中。


![Untitled.png](/images/blog/Nuvoton-ISD9160本地语音识别解决方案-1.png)

- 使用ISD9160进行语音类型产品开发的外围电路非常简单，麦克风和Speaker分别直接接到芯片的MIC和SPK引脚上，另外需要外接一个Flash用于保存需要通过Speaker播放的音频文件。再加上晶振、电源等就构成产品的完整电路图了。
- 如果需要把ISD9160作为音频识别方案，整合到一个更复杂的产品中，可以把ISD9160与其他的处理器使用串口连接，音频的采集、识别和播放功能全部交给ISD9160来进行处理，语音识别的结果通过串口发给其他处理器。

## 基于ISD9160进行语音识别功能的大致开发流程

1. 基于每个产品要支持的语音识别功能的需求，在产品定义的时候要首先确定好支持的语音命令列表（例如打开灯、开始录影等）。然后由芯唐基于客户选定的语音命令列表生产一个Bin文件（..pack.bin），这个文件到时候要烧录到ISD9160内部Flash的指定位置；
2. 在产品运行的过程中，ISD9160从麦克风上以16bit、16KHz采样率、Mono的音频格式进行音频采集，然后在其应用代码中把采集的音频数据送入Cyberon的算法进行识别，基于识别结果执行不同的指令；
3. 在产品的开发过程中，pack文件是Cyberon基于用户的语音命令列表来生成的。如果要提升语音命令识别的成功率和准确率，还需要产品开发者在开发过程中进行一些调优，这个调优的过程也就是该方案所说的Adaptation的过程。

![Untitled.png](/images/blog/Nuvoton-ISD9160本地语音识别解决方案-2.png)


实际上如果产品对于音频识别的正确率要求不是很苛刻，或者用户的发音足够规范，那么直接使用芯唐/Cyberon提供的Video Recognition模型文件（pack文件）就可以了。但是如果对语音识别率有更高的要求，开发者就需要基于原厂提供的pack文件进行更多的优化，具体而言就是使用Cyberon提供的软件工具进行进一步的算法模型调优工作。


## Cyberon语音识别算法的运行要求


Cyberon的语音识别算法要能够正确的运行，对于送入算法的语音信号的信噪比有一定的要求：Cyberon要求语音信号的信噪比SNR大于10dB。


那么如何基于已经开发好的硬件进行Audio信号的信噪比，判断某种环境下的语音信号质量是否能够满足Cyberon的要求？

- 视频课程中提供了一个大致的办法，需要用到几个软件工具：
    - Nuvoton在ISD9160上开发的一个Record_16kHz_PCM_Uart sample，这个sample烧写到ISD9160中以后，会从麦克风上采集16bit、16KHz采样率、Mono的音频数据，通过串口传输出去（波特率921600）；
        - 对于测试音频数据的采集，需要关闭FW中MIC初始化的AGC功能，以避免AGC对于音量的影响；
    - Cyberon的VoiceRecorder，可以从串口接收以上sample发过来的音频数据，保存或者播放；
    - CoolEdit音频分析工具；
- 测试流程：在ISD9160上运行Record_16kHz_PCM_Uart sample，然后在PC上打开VoiceRecorder，从串口接收并保存ISD9160的测试语音录音；然后对保存的语音文件使用CoolEdit进行分析，比较背景音和语音命令的信噪比平均值，大概就能了解这种测试场景下的语音命令是否能够正确识别；

## 语音识别算法的调优流程


语音识别算法正确率优化需要用到的软件：

- Nuvoton Record_16kHz_PCM_Uart sample，可以从产品板上直接进行测试音频数据采集；
- Voice Collector，与以上的Nuvoton Record_16kHz_PCM_Uart sample配合，基于产品板进行Voice Recognition模型训练音频文件的采集、保存的自动化流程；
- AutoResampler，如果用于进行模型训练的音频数据是用其他工具采集到的，格式可能不符合模型训练工具的要求，就需要使用这个AutoResampler工具转换成标准的格式；
- CSpotter Offline Modeling Tool，Voice Recognition模型的离线优化工具，基于前面从产品板上采集的训练音频数据，或者从其他来源转换的训练音频数据进行模型优化；

模型优化流程：


![Untitled.png](/images/blog/Nuvoton-ISD9160本地语音识别解决方案-3.png)

- 训练数据的采集和准备：
    - 基于产品板+Nuvoton Record_16kHz_PCM_Uart sample+Voice Collector，针对要支持的每条命令进行多次语音采集，采集后的语音会自动保存在Voice Collector指定的目录中；
    - 如果语音模型训练的数据来自于其他方式采集的音频，使用AutoResampler工具进行转换；
- 把以上语音识别模型的训练数据，导入到Cyberon提供的CSpotter Offline Modeling Tool工具软件中，再针对每一条语音命令进行模型训练和对应参数的优化，通过这个Adaptation过程可以有效的提升识别率和降低误识别率。

其他优化策略：

- 对于提升识别率而言，9160最多能够支持20条语音命令的识别，但如果产品中用不到这么多，可以把发音类似的语音指向同一个命令，可以有效提升识别率；
- 对于降低误识别率而言，可以采用类似的思路，针对一些与实际语音命令发音相仿的语音，设置一个负数的rewared值，可以降低这个相仿语音所造成的误识别率；

## 回放音频文件的准备


除了应用于语音识别功能，在具体的产品设计中，可能也会用到ISD9160来播放一些固化到产品中的音频文件。


针对这些可以在产品中播放的音频文件，Nuvoton提供了一个Audio tool的工具来实现音频文件的转换和rom打包。


Audio tool可以实现把wav等格式的音频文件转换成md4格式的压缩音频数据，并把所有的md4音频数据打包成一个ROM包，后续把这个ROM包烧写到外部flash中，就可以在应用程序中指定音频文件的索引来播放对应的音频了。

- 也可以在keil中进行设置，在编译FW工程项目的时候自动调用audio tool进行音频格式转换以及音频文件打包的过程。
- wav格式的原始音频数据可以使用tts来生成，也可以使用上面的Record_16kHz_PCM_Uart sample+VoiceRecorder的方式自行录制。

## 参考资料

- Nuvoton ISD9160 Design Guide.
- Nuvoton ISD9160语音识别开发教学视频.
