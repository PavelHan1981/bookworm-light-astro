---
title: "PANNs音频分类模型的预研信息汇总"
slug: "2026-03-26-the-summary-of-audio-tagging-model-PANNs"
description: "本文整理了经典的音频分类模型PANNs的基本情况，模型架构及其预训练参数文件的分类，开发环境的搭建和基本的推理测试，以及对该模型主推的CNN14模型的网络架构进行了说明。"
date: 2026-03-26T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","音视频"]
draft: false
---


本文整理了经典的音频分类模型PANNs的基本情况，模型架构及其预训练参数文件的分类，开发环境的搭建和基本的推理测试，以及对该模型主推的CNN14模型的网络架构进行了说明。


## PANNs模型简介


PANNs (Large-scale Pre-trained Audio Neural Networks），大规模预训练音频神经网络。该模型由Qiuqiang Kong等学者在 2019-2020 年间提出，其核心意义在于：它打破了音频领域“小样本、难训练”的僵局，为各种音频任务提供了一套强大的通用特征提取器。**从整体工作流程上讲，其工作原理就相当于是先对音频文件生成与之对应的梅尔刻度频谱图，然后再使用标准的卷积神经网络基于这个频谱图进行分类操作**。该模型在Github上的仓库地址：[qiuqiangkong/audioset_tagging_cnn](https://github.com/qiuqiangkong/audioset_tagging_cnn)


PANNs模型之所以强大，是因为它在Google的AudioSet数据集上进行了极其充分的训练，学会了分辨世界上几乎所有常见声音的频谱特征。该模型的预训练参数文件下载地址：[PANNs: Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition (Pretrained Models)](https://zenodo.org/records/3987831)。从以上的预训练参数下载文件列表中可以看到，该模型提供了多个不同网络模型和参数的预训练参数文件：


![image.png](/images/blog/PANNs音频分类模型的预研信息汇总-1.png)


这些预训练参数文件的命令格式大致是：`模型架构_采样率_嵌入向量长度_性能指标.pth`。

- 模型架构：支持的模型架构版本包括**CNN14**（推荐模型架构），CNN6/CNN10（轻量级版本），Resnet/MobileNet，Wavegram-Logmel-Cnn14（性能强大，但计算量大），DecisionLevelMax（适合用于Sound Event Detection推理模式）。
- 采样率：PANNs的官方实现中预置了对 8kHz、16kHz 和 32kHz 这三种采样率的支持，**默认为32KHz采样率**。
- 嵌入向量长度：进入检测头部分的嵌入向量的维度，**默认为2048**，官方的权重文件库中还提供了对 32、128、512这几种维度的支持。
- 性能指标：在Google的AudioSet数据验证集上测试到的mAP指标。

## 环境安装与基本推理测试


环境与依赖安装：


```bash
https://github.com/qiuqiangkong/audioset_tagging_cnn.git
pip install -r requirements.txt
pip install h5py  # 需要额外安装这个包，否则运行后续的demo会报错
```


从源代码目录的scripts/0_inference.sh脚本中可以看到，该模型的推理模式可以分为两种模式：**Audio Tagging和Sound Event Detection**。

- Audio Tagging (音频打标)：
    - 解决的问题是：**这段录音的内容是什么**。
    - 模型输出结果为整个音频片段的总体分类概率，对应于Google音频分类数据集AudioSet中的527个音频分类。
    - 其技术判断逻辑是对音频文件在整个时间维度上进行全局池化，只给出一个总的分类概率判断。
- Sound Event Detection (SED, 声学事件检测)：
    - 解决的问题是：**什么时候发生了什么音频事件**。
    - 模型的输出结果为一条时间轴，在这个时间轴上标注出异常声音出现的起始和结束时间。
    - 其技术实现逻辑是在Audio Tagging的基础上，保留了时间分辨率，然后像扫描仪一样逐帧判断整个时间周期上的音频事件。

audio_tagging推理模式测试：


```bash
(new-env) PS D:\Code\audioset_tagging_cnn> python ".\pytorch\inference.py" audio_tagging --model_type="Cnn14" --checkpoint_path="Cnn14_mAP=0.431.pth" --audio_path="resources/R9_ZSCveAHg_7s.wav" --cuda
GPU number: 1
Speech: 0.893
Telephone bell ringing: 0.754
Inside, small room: 0.236
Telephone: 0.183
Music: 0.092
Ringtone: 0.047
Inside, large room or hall: 0.028
Alarm: 0.014
Animal: 0.009
Vehicle: 0.008
embedding: (2048,)
```


## CNN14模型结构


如上所述，PANNs 并不是单一的一个模型，而是一系列不同网络架构的全家桶。可以在其模型预训练权重文件下载地址 Zenodo 页面看到的各种模型的预训练权重文件，对应了不同的网络深度和结构：

- CNN 系列 (CNN6, CNN10, CNN14)：这是PANNs最常用的系列。其中的 **CNN14** 是性能最强的旗舰型号，也是该项目主推的网络结构。
- ResNet 系列 (ResNet22, ResNet38, ResNet54)：借鉴了残差网络的结构设计，适合更深层次的特征提取。
- 轻量化系列 (MobileNetV1, MobileNetV2)：专为手机或嵌入式设备设计，牺牲少量精度换取极快的速度。
- 混合系列 (Wavegram-Logmel-CNN)：该网络架构不仅关注频谱图，还直接参考原始波形，捕捉更精细的时间信息。

以下是CNN系列的三种网络架构组成：


![image.png](/images/blog/PANNs音频分类模型的预研信息汇总-2.png)


以下是CNN系列不同架构配合不同的采样率、梅尔频谱刻度数量、数据增强策略的情况下的验证指标：


![image.png](/images/blog/PANNs音频分类模型的预研信息汇总-3.png)


对于CNN14的网络结构而言

- 首先是基于torchlibrosa库中的Spectrogram和LogmelFilterBank生成与音频文件相对应的梅尔刻度频谱图。
- 接着是连续6个卷积块：
    - 前5个卷积块的组成都是：3x3卷积+BN层+Relu激活函数+3x3卷积+BN层+Relu激活函数+2x2池化层。
    - 最后一个卷积块的组成是：3x3卷积+BN层+Relu激活函数+3x3卷积+BN层+Relu激活函数+1x1池化层。
    - 第一个卷积块输出64通道，第二个卷积块输出128通道，以此类推，最后一个卷积块输出2048通道。
    - 最后一个卷积块的输出维度数据为`[batch_size, channels, time_steps, freq_bins]`。默认情况下，channels为2048；time-steps为时间维度的步长，经过前面的5轮2x2池化以后就是音频采样帧数的1/32；freq_bins为频率特征，经过前面的5轮2x2池化后已经很小，甚至为1。**此时，每个时间段（连续32个音频采样帧）就对应一个 2048 维的特征向量，它就代表了该时刻声音的指纹信息。**
- 然后是在时间维度上，对以上连续卷积块提取的特征向量信息同时进行全局的最大池化和平均池化操作，把两者加起来，得到一个2048维的特征向量。
- 最后是一个从2048到num_classes的全连接层，用于基于2048维特征向量执行最后的分类操作，通过sigmoid给出分类判断的概率。

## 参考资料

- [【音频分类与检测】PANNs：用于音频模式识别的大规模预训练音频神经网络-CSDN博客](https://blog.csdn.net/wjinjie/article/details/128696453)
