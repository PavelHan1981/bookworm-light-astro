---
title: "CNN经典网络模型架构学习之NiN"
slug: "2025-09-10-the-classical-CNN-network-NiN"
description: "本文总结了卷积神经网络经典模型中的NiN（Network in Network）的设计理念、整体网络架构和具体的网络实现细节。"
date: 2025-09-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---


本文总结了卷积神经网络经典模型中的NiN（Network in Network）的设计理念、整体网络架构和具体的网络实现细节。


LeNet、AlexNet以及VGGNet这三种卷积神经网络模型的设计模式都是相同的：通过一系列的卷积层和池化层的组合进行特征提取，然后把提取到的特征数据展平（Flatten）后，送入一系列的全连接层进行分类操作，最终输出图像识别的概率。


以上这种经典的卷积神经网络设计模式存在两个主要的设计挑战：

- 基于特征数据进行图像分类任务的全连接层所包含的参数数量太多了。例如，在VGG16网络中，参数数量高达138MB，模型参数所占据的存储空间也超过了500MB。
- 无法在网络的前半段添加全连接层来增加非线性程度，这样做会破坏空间结构，而且需要更多的参数和内存。

针对以上两个网络结构设计上的问题，2013年由National University of Singapore的Min Lin所发表的Network in Network（简称NiN），对经典的卷积神经网络的架构设计理念提供了新的设计思路。


**NiN架构在传统CNN卷积网络的基础上最大的两个创新是MLP卷积层和全局平均池化层。**


## MLP卷积层


传统的卷积层的卷积计算逻辑在[详细解释卷积神经网络中的卷积与池化计算](https://www.pavelhan.tech/article/2025-07-15-the-summary-of-calculation-workflow-in-CNN)一文中已经有非常详细的描述，在此不再赘述，仅以一个卷积计算的动图来进行解释：


![CNN%E5%8D%B7%E7%A7%AF%E8%AE%A1%E7%AE%97%E5%8A%A8%E5%9B%BE.gif](/images/blog/CNN经典网络模型架构学习之NiN-1.gif)


总结起来，传统的卷积层计算公式如下图所示，(i,j) 是输入特征图中像素位置的索引，x_{i,j} 表示对应位置的像素，W 为卷积核的参数。那么卷积计算实际上就是 (i,j) 位置的像素及其周边像素与卷积核对应位置的权重之间的乘加结果，再通过ReLU激活函数进行处理，得到卷积计算的特征图。


![image.png](/images/blog/CNN经典网络模型架构学习之NiN-2.png)


在NiN网络的实现中，卷积计算按照MLP Block的方式来进行组织。一个MLP Block的典型结构如下图所示：


![image.png](/images/blog/CNN经典网络模型架构学习之NiN-3.png)


对于每一个MLP Block而言，其输入是原始的3通道RGB图像或者前一个MLP Block输出的多张特征图。每个MLB Block的内部包含有三个连续的卷积层，每一层的输入都是前一层的输出。其中第一个卷积层的卷积计算与普通的卷积计算别无二致，而后面的两个卷积层则是1x1卷积层，1x1的卷积计算仍然是计算特征图像素值与权重的乘加，然后使用ReLU激活函数进行非线性处理。


以下的代码解释了对于每个MLP Block的结构和计算逻辑：


```python
def nin_block(out_channels, kernel_size, strides, padding):
    return nn.Sequential(
        nn.LazyConv2d(out_channels, kernel_size, strides, padding), nn.ReLU(),
        nn.LazyConv2d(out_channels, kernel_size=1), nn.ReLU(),
        nn.LazyConv2d(out_channels, kernel_size=1), nn.ReLU())
```

> 每个MLP Block包含有3个卷积层，一个普通的卷积层+ReLU激活，再加上两个连续的1x1卷积层+ReLU激活。在网络架构上，一般每个MLP Block后面再跟一个最大池化层。

## 全局平均池化层


传统的卷积神经网络架构中，一般使用多个全连接层来实现特征分类的功能，其做法是把最后一个卷积层产生的特征图展平（Flatten）为一维向量，经过连续多个全连接层，最后使用一个softmax层进行逻辑回归分类。这种方式存在的主要问题是：全连接层的参数太多，以及多个全连接层造成的过拟合问题。


**NiN网络使用全局平均池化的操作来代替全连接层，以尝试解决经典卷积神经网络后半部分全连接层的参数过多和过拟合的问题**。全局平均池化操作具体的做法是最后一层卷积层输出特征图的数量，与分类类别的数量相同（例如对于ImageNet数据集就是1000个，对于MNIST数据集则是10个）。然后针对每张特征图取其平均值以后再输出成一个向量，对这个向量加上softmax操作（softmax操作的计算流程可以参考[Softmax分类器的计算流程详细总结](https://www.pavelhan.tech/article/2025-09-07-the-calculation-flow-of-softmax-classification)），最终输出各个类别的识别概率。


全局平均池化操作的流程如下图所示：


![image.png](/images/blog/CNN经典网络模型架构学习之NiN-4.png)


以ImageNet数据集（该数据集的图像分类结果有1000个类别）为例，全局平均池化层从其前面的MLP卷积层得到1000张特征图，那么在全局平均池化的计算中，就会对每一张特征图进行平均计算得到其平均值，最终得到由1000个平均值所组成的向量，然后对这个向量执行softmax操作，得到每个类别的识别概率输出。

> 可以看到，以上的全局平均池化层的计算与普通的平均池化的计算逻辑是类似的，因此完全不需要参数，这样就极大程度上减少了模型的参数数量（实际上经典卷积神经网络中的大部分参数都来自于全连接层），也可以避免传统的全连接层存在的过拟合问题。

## NiN的网络架构总结


NiN网络的总体结构如下图所示。图像输入仍然是224x224分辨率的RGB三通道图像，经过连续四个MLP Block的卷积处理，最后一个MLP Block输出1000张6x6尺寸的特征图，把这个特征图经过全局平均池化层的平均计算以及softmax激活后输出1000个类别的识别概率。


![image.png](/images/blog/CNN经典网络模型架构学习之NiN-5.png)


可结合下图对以上NiB架构图中各层的特征图尺寸和计算类型进行理解。尽管看起来NiN网络的层数比VGG网络多了不少，但是因为去掉了全连接层，NiN网络的参数数量比VGG少了很多。


![image.png](/images/blog/CNN经典网络模型架构学习之NiN-6.png)


基于以上定义的nin_block结构实现的完整NiN网络的实现代码如下：


```python
class NiN(d2l.Classifier):
    def __init__(self, lr=0.1, num_classes=10):
        super().__init__()
        self.save_hyperparameters()
        self.net = nn.Sequential(
            nin_block(96, kernel_size=11, strides=4, padding=0),
            nn.MaxPool2d(3, stride=2),
            nin_block(256, kernel_size=5, strides=1, padding=2),
            nn.MaxPool2d(3, stride=2),
            nin_block(384, kernel_size=3, strides=1, padding=1),
            nn.MaxPool2d(3, stride=2),
            nn.Dropout(0.5),
            nin_block(num_classes, kernel_size=3, strides=1, padding=1),
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten())
        self.net.apply(d2l.init_cnn)
```


## 参考资料

- [8.3. Network in Network (NiN) — Dive into Deep Learning 1.0.3 documentation](https://d2l.ai/chapter_convolutional-modern/nin.html)
- [卷积神经网络之-NiN 网络（Network In Network）-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1666965)
- [Review: Network In Network. 這篇論文是由National University of… | by Fan | Medium](https://medium.com/@chensheep1005/network-in-network-d847f9232846)
