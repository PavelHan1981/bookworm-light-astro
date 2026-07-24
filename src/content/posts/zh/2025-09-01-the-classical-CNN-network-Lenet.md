---
title: "CNN经典网络模型架构学习之LeNet"
slug: "2025-09-01-the-classical-CNN-network-Lenet"
description: "本文以用于进行手写数字识别功能的LeNet为例，分析该网络的结构以及典型的卷积神经网络的整体架构，对用于进行图像识别和处理的卷积神经网络建立初步认识。"
date: 2025-09-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---


本文以用于进行手写数字识别功能的LeNet为例，分析该网络的结构以及典型的卷积神经网络的整体架构，对用于进行图像识别和处理的卷积神经网络建立初步认识。


在[卷积神经网络CNN的架构解析入门](https://www.pavelhan.tech/article/2025-08-01-the-basic-summary-of-CNN-network-structure)一文中简单的总结了典型的卷积神经网络的结构和组成，本文以一个非常经典的、用于进行手写数字识别的LeNet-5网络为例，更为详细的解释卷积神经网络的结构和运行流程。


## LeNet简介


**LeNet是最早发布的卷积神经网络之一，也是架构最简单的卷积网络，非常适合作为入门网络结构用于建立卷积神经网络架构设计理论和运行流程的理解基础。**


LeNet模型是由贝尔实验室的研究员Yann LeCun在1989年首次提出并不断优化，其设计和应用的目的是用于识别手写数字（也就是对所谓的MNIST数据集进行的训练和识别）。 LeNet被广泛用于美国的邮政服务和自动取款机（ATM）机中，帮助识别处理手写的邮政编码数字和支票上的数字。 时至今日，一些自动取款机仍在运行Yann LeCun和他的同事Leon Bottou在上世纪90年代写的代码！


![image.png](/images/blog/CNN经典网络模型架构学习之LeNet-1.png)


LeNet的官网地址：[MNIST Demos on Yann LeCun's website](http://yann.lecun.com/exdb/lenet/)


## LeNet的网络架构说明


下图是LeNet的网络架构图：


![image.png](/images/blog/CNN经典网络模型架构学习之LeNet-2.png)


总体上看，以上的网络架构像所有的卷积神经网络一样，由两个部分组成：

- 特征提取层：包含两个卷积层+池化层（也就是上图中的汇聚层）的组合。
- 分类层：包含三个全连接层。

每个卷积块中的基本单元是一个卷积层、一个sigmoid激活函数和平均池化层。特征提取层的最后一个池化层的输出是16通道的5x5特征图，该特征图通过展平操作（Flatten）为16x5x5个元素的一维向量，这个一维向量在输入到全连接层执行分类任务，最后一个全连接层有10个神经元，对应0-9共10个数字的识别概率。


LeNet网络各层结构和参数量的详细信息总结如下：

- 输入数据为灰度28x28分辨率的图像，实际上也就是一个28x28的二维数组，只有灰度通道。
- 卷积层C1包含6个5x5x1的卷积核，padding为2，所以卷积层的输出为6张28x28分辨率的特征图，卷积计算结果的激活函数为Sigmoid。
    - 该层的参数数量就是6个5x5x1卷积核的权重和偏置，也就是6x(5x5x1+1)。
- 池化层S2采用2x2的平均池化操作，对卷积层C1的6通道28x28分辨率特征图进行池化计算，输出为6通道14x14分辨率的池化后特征图。
- 卷积层C3包含16个5x5x6的立体卷积核，padding为0，所以卷积层C3的输出为16张10x10分辨率的特征图，卷积计算结果的激活函数同样为Sigmoid。
    - 该层的参数数量就是16个5x5x6卷积核的权重和偏置，也就是16x(5x5x6+1)。
- 池化层S4仍然采用2x2的平均池化操作，对卷积层C3的16通道10x10分辨率特征图进行池化计算，输出为16通道5x5分辨率的池化后特征图。
- 第一个全连接层F5的输入为池化层S4输出特征图的一维展平向量，因此输入数据是一个5x5x16的一维向量，F5全连接层有120个神经元，激活函数仍然是Sigmoid。
    - 该层的参数数量就是120个神经元的输入权重和偏置，也就是120x(5x5x16+1)。
- 第二个全连接层F6的输入为F5的120个神经元的输出，F6全连接层有84个神经元，激活函数为Sigmoid。
    - 该层的参数数量就是84个神经元的输入权重和偏置，也就是84x(120+1)。
- 最后的输出层有10个神经元，各个神经元的输出对应于数字0-9的识别概率的大小。
    - 该层的参数数量就是10个神经元的输入权重和偏置，也就是10x(84+1)。

以下是LeNet在前向计算过程中各个层的输出向量的维度总结：


```plain text
Input shape:     torch.Size([1, 1, 28, 28])
Conv1 output shape:      torch.Size([1, 6, 28, 28])
Sigmoid1 output shape:   torch.Size([1, 6, 28, 28])
AvgPool1 output shape:   torch.Size([1, 6, 14, 14])
Conv2 output shape:      torch.Size([1, 16, 10, 10])
Sigmoid2 output shape:   torch.Size([1, 16, 10, 10])
AvgPool2 output shape:   torch.Size([1, 16, 5, 5])
Flatten output shape:    torch.Size([1, 400])
Fc1 output shape:        torch.Size([1, 120])
Sigmoid3 output shape:   torch.Size([1, 120])
Fc2 output shape:        torch.Size([1, 84])
Sigmoid4 output shape:   torch.Size([1, 84])
Fc3 output shape:        torch.Size([1, 10])
```

> **对于以上LeNet的网络结构而言，需要注意：**
> - 以上的网络结构图中，共包含7层：两个卷积层，两个池化层，三个全连接层。但是实际上一般意义上的LeNet指的是LeNet5，这个数字5表示整个网络中包含参数的层数（即两个卷积层+三个全连接层）。
> - 实际的卷积神经网络的实现中，卷积层的激活函数使用ReLU，池化层采用最大池化方式，在网络的实际表现中性能更好。但是无论是ReLU还是最大池化，在上世纪八九十年代均未出现。所以在原始的LeNet5架构中，卷积层的激活函数采用经典的Sigmoid，池化层则采用平均池化。
>

## LeNet的PyTorch实现


基于以上介绍的LeNet5模型的网络架构，在PyTorch框架下的该网络实现代码如下：


```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class LeNet(nn.Module):
    def __init__(self):
        super(LeNet, self).__init__()
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=6, kernel_size=5, padding=2, stride=1)
        self.conv2 = nn.Conv2d(in_channels=6, out_channels=16, kernel_size=5)

        self.fc1 = nn.Linear(in_features=16*5*5, out_features=120)
        self.fc2 = nn.Linear(in_features=120, out_features=84)
        self.fc3 = nn.Linear(in_features=84, out_features=10)

    def forward(self, x):
        x = F.sigmoid(self.conv1(x))
        x = F.avg_pool2d(x, kernel_size=2, stride=2)
        x = F.sigmoid(self.conv2(x))
        x = F.avg_pool2d(x, kernel_size=2, stride=2)
        x = x.view(-1, 16*5*5)
        x = F.sigmoid(self.fc1(x))
        x = F.sigmoid(self.fc2(x))
        x = self.fc3(x)
        return x
```


以上网络实现后导出为Onnx模型文件，在netron.app中的网络架构图如下所示：


![image.png](/images/blog/CNN经典网络模型架构学习之LeNet-3.png)


## 参考资料

- [6.6. 卷积神经网络（LeNet） — 动手学深度学习 2.0.0 documentation](https://zh.d2l.ai/chapter_convolutional-neural-networks/lenet.html)
- [MNIST Demos on Yann LeCun's website](http://yann.lecun.com/exdb/lenet/)
