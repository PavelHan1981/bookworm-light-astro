---
title: "CNN经典网络模型架构学习之GoogleNet"
slug: "2025-09-11-the-classical-CNN-network-GoogleNet"
description: "本文对经典卷积神经网络存在的问题，以及计算机视觉图像识别领域经典的GoogLeNet架构设计的相关知识点进行了完整和详细的总结。"
date: 2025-09-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---


本文对经典卷积神经网络存在的问题，以及计算机视觉图像识别领域经典的GoogLeNet架构设计的相关知识点进行了完整和详细的总结。


## AlexNet和VGGNet存在的问题


在[CNN经典网络模型架构学习之AlexNet](https://www.pavelhan.tech/article/2025-09-04-the-classical-CNN-network-AlexNet)和[CNN经典网络模型架构学习之VGGNet](https://www.pavelhan.tech/article/2025-09-09-the-classical-CNN-network-VGGNet)两篇笔记中，分别总结了经典CNN网络中的AlexNet和VGGNet两种模型的架构和实现。


相对而言，AlexNet的层次和参数都比较少，这也就限制了该网络从数据中提取和学习复杂模式的能力，最终的识别和检测效率不高。


VGGNet加大了CNN神经网络的深度，参数层达到了16层和19层，但是因为深度而导致的其他问题也就应运而生：

- **首先是梯度消失问题**。众所周知，在神经网络的训练过程中，通过损失函数来评估模型的运行效果，根据损失值使用反向传递法+梯度下降法从输出层向前一层层更新其运行参数，通过这种方式来实现最终损失函数输出值的降低。但是，在网络深度加大的情况下，相同的损失值在反向向前一层传递的过程中会越来越小，最终导致网络中的参数（尤其是前半部分的参数）在训练中很难得到有效的更新。
- **其次是深度模型对算力要求过高。** 以VGG16网络模型为例，其参数高达138M，模型参数大小超过500MB，模型的训练和推理所需要的算力都比较高。

GoogLeNet的架构设计，对传统的CNN网络架构进行了重构，来尝试解决以上问题，并得到了较好的应用效果。GoogLeNet，也称为Inception-v1，首次在2014年提出，在2014年的ILSVRC竞赛中得到了第一名，Top-5 Error只有6.67%。_更为难能可贵的是，GoogLeNet的参数只有6.8M，比AlexNet少9倍，比VGG16更是少了20倍_。


**GoogleNet的最大创新点是引入了Inception模块，这也是GoogLeNet同样被称为InceptionNet的原因所在。**


## Inception Module


Inception模块是一种允许在多个尺度上并行处理数据的构建块，这使得网络能够比以前经典卷积神经网络架构更有效地捕获不同尺度的特征。


一个Inception模块通常由多个卷积层组成，每个卷积层使用不同的卷积核尺寸。而且不同于之前的网络模型，Inception Module中的多个卷积层以并行的方式工作，因此对于输入的同一张特征图，网络可以使用不同尺寸的卷积核进行计算。这些卷积层计算完成后，其输出结果拼接在一起，然后传递给一个池化层进行处理。以上就是Inception模块的总体设计理念。


从Inception的结构上看，GoogLeNet提出的Inception Module可以分为两种类型：Native类型和降维类型。


![image.png](/images/blog/CNN经典网络模型架构学习之GoogleNet-1.png)


两种Inception Module的共同特征是：Inception Module从前一层特征图得到的输入数据，并行进行1x1卷积、3x3卷积、5x5卷积以及3x3的最大池化处理，以上四个部分的处理结果拼接在一起，做为整个Inception的输出。而其不同点则在于：_降维版本的Inception Module在3x3卷积、5x5卷积之前，以及3x3最大池化之后分别增加一个一个1x1的卷积操作。_


其中：

- 1×1 卷积块用于在保持输入特征图分辨率不变的情况下，在特征图的像素级上捕捉局部细节。
- 3×3 卷积块从输入的特征图中捕捉中等范围特征。
- 5×5 卷积块则用于捕捉更大范围的特征。
- 独立的3×3最大池化块用于保留原始特征的显著响应（如边缘、纹理）。

如前所述，native模块和降维模块的差异，在于后者增加了三个1x1的卷积操作，分别位于3x3卷积和5x5卷积之前，以及3x3最大池化之后。_放在3x3卷积和5x5卷积操作之前的那两个1x1卷积操作，其目的是降低计算的复杂度和参数量；而放在3x3最大池化之后的1x1卷积操作，则用于控制3x3最大池化输出的通道数（否则池化后的通道数与输入的通道数相同，总的通道数就太多了）。无论如何，以上四条路径输出的特征图分辨率相同，这样后续四条并行处理路径输出的特征图才能方便的拼接在一起。_

> 由此可见，在降维版本的inception module中，独立路径中的1x1卷积操作，与其他路径中额外增加的1x1卷积操作的作用是完全不同的。

### 1x1卷积如何降低计算量？


**在降维Inception模块中的3x3以及5x5卷积操作之前，增加的1x1卷积的目的主要是用于降低参数量和计算量**。


以下图为例，在不使用1x1卷积的情况下，从14x14x480到14x14x48的特征图转换，使用5x5卷积的情况下，其计算量达到了：_(14×14×480)×(5×5）×48 = 112.9M_。


![image.png](/images/blog/CNN经典网络模型架构学习之GoogleNet-2.png)


而在两个特征图中间增加一个1x1卷积层，如下图所示，其计算量大幅度下降：


![image.png](/images/blog/CNN经典网络模型架构学习之GoogleNet-3.png)


其中1x1卷积的计算量为：（14x14x480）x(1x1)x16=1.5M，5x5卷积的计算量则为：（14x14x16）x（5x5）x48=3.8M。_两个加起来也只有5.3M，只有不增加1x1卷积计算的1/20！_


### Inception模块如何实现输出拼接？


如上所述，Inception模块对于输入数据而言，有四条独立的处理路径。输入数据经过这四条独立的处理路径处理以后，在Inception模块的输出部分要拼接在一起。**四条路径的处理结果要进行拼接，首要的条件也就是各个路径输出特征图的分辨率要相同。**


因此，四个独立通道在设计时已经统一设计为stride=1并且配好了相应的padding，来确保在相同输出数据维度的情况下，各个通道的输出数据的分辨率也是相同的：

- 1x1卷积路径：padding=0
- 3x3卷积路径：padding=1
- 5x5卷积路径：padding=2
- 3x3最大池化路径：padding=1

![image.png](/images/blog/CNN经典网络模型架构学习之GoogleNet-4.png)


在以上设置的情况下，可以保证四个通道对相同输入数据处理后，其输出特征图的分辨率相同，只不过各个通道的通道数（也就是各个通道的特征图数量）不同。**四个通道输出特征图的分辨率相同的情况下，对于四通道输出的拼接就比较简单了：只需要把四个通道输出的特征图并排堆积起来就好了。**


以GoogLeNet（Inception V1）论文中的第一个Inception模块（3a）为例进行解释。前一层的输入张量形状为，192x28x28，由前面的卷积+池化层处理后输出。


在Inception模块的四条路径中分别进行处理：

- 1x1卷积，输出64通道28x28分辨率的特征图（64x28x28）
- 3x3卷积，先通过1x1卷积降维到96通道（96x28x28），然后通过3x3卷积+padding为1输出128通道（128x28x28）
- 5x5卷积，先通过1x1卷积降维到16通道（16x28x28），然后通过5x5卷积+padding为2输出32通道（32x28x28）
- 3x3最大池化，先进行3x3最大池化（padding=1）继续输出192通道（192x28x28），然后通过1x1卷积把通道数降低到32通道（32x28x28）

最后把以上四个独立流程的输出拼接在一起，总共就得到了64+128+32+32=256通道28x28的特征图作为整个inception模块的输出。


## 全局平均池化


在传统的卷积神经网络架构中，使用连续的全连接层基于卷积层提取出来的特征数据，对图像进行分类操作。全连接层存在的最大问题就是参数太多，过拟合问题比较严重。针对这个问题，GoogLeNet采取了与Networ in Network相同的做法，使用全局平均池化的操作来代替全连接层，既解决了传统模型参数太多和过拟合的问题，而且从实际数据的测试结果来看，其分类的准确率也有了比较明显的提升。


下图是输入特征向量相同的情况下，全连接层与全局平均池化层不同的计算逻辑。有关全局平均池化更详细的内容可参考[CNN经典网络模型架构学习之NiN](https://www.pavelhan.tech/article/2025-09-10-the-classical-CNN-network-NiN)。


![image.png](/images/blog/CNN经典网络模型架构学习之GoogleNet-5.png)


## Auxiliary Classifier


GoogLeNet总共有22层，在网络深度较深的情况下，通过反向梯度传递和计算的过程中，梯度在反向传递的中间层逐级递减，最终导致梯度消失以致网络前半部分层的参数无法得到有效更新的问题。


GoogLeNet通过引入一个Auxiliary Classifier来尝试解决以上问题。Auxiliary Classifier的思路是：在网络的中间部分挂一个也能够进行分类操作的小网络（Auxiliary Classifier），这个小网络基于前面部分的特征图数据执行分类操作，得到自己的损失函数值。在进行模型训练的过程中，把这个损失值加到模型最终输出的损失值上，以增大梯度信号，缓解梯度消失的作用。


**Auxiliary Classifier仅用于训练过程，在训练完成的推理过程中只保留主干网络的输出，因此不会影响推理速度。**


在GoogLeNet的网络架构中，分别在4a和4d这两个inception module后面增加一个Auxiliary Classifier（可参考后续GoogLeNet的网络整体结构部分）。_每个Auxiliary Classifier的结构如下：_

- 输入为以上两个Inception Module所输出的特征图，例如512通道14x14分辨率的特征图
- 5x5平均池化：对输入的特征图首先进行5x5平均池化操作，stride=3，得到512通道4x4分辨率的特征图
- 1x1卷积：通过1x1卷积把通道数从512降低为128，输出128通道4x4分辨率的特征图
- 展平以上特征图以后。连接到一个1024神经元的全连接层，激活函数为ReLU
- 增加一个Dropout操作，dropout比例为0.7
- 连接到一个1000神经元的全连接层，对应ImageNet数据集的1000个类别。
- 1000个神经元的乘加输出，通过softmax操作得到1000维的预测向量。

以上Auxiliary Classifier的预测输出与标签值对比，得到这个Auxiliary Classifier的损失值。把网络中两个Auxiliary Classifier输出的损失值分别乘以权重0.3，增加到网络主干网络分类输出的损失值，得到整个网络的损失值：


$$
TotalLoss=Loss_{main}+0.3*Loss_{4a}+0.3*Loss_{4d}
$$


在进行网络参数训练的过程中，会把整个TotalLoss作为其损失值反向传递以更新网络参数。


## GoogLeNet的整体结构


有了以上信息储备，理解GoogLeNet网络的整体架构相对就比较容易了：


![image.png](/images/blog/CNN经典网络模型架构学习之GoogleNet-6.png)


从总体架构上可以看到：

- GoogLeNet的开头部分通过连续的卷积和池化操作实现输入图像分辨率的降低。
- 然后通过连续9个inception module不断提取图像特征，9个inception module分为3段（2+5+2）。每个inception段内的连续module直接连接，段之间通过一个3x3的最大池化进行连接。
- 最后一个inception module的输出再通过全局平均池化+全连接层实现最终的图像分类操作。
- 此外，在inception 4a和4d的输出上再各自通过一个Auxiliary Classifier得到用于辅助训练过程的阶段性损失值。

GoogLeNet中各层的数据维度以及参数数量等信息如下表所示：


![image.png](/images/blog/CNN经典网络模型架构学习之GoogleNet-7.png)


## 参考资料

- [GoogLeNet: A Deep Dive into Google’s Neural Network Technology | by Siddhesh Bangar | Medium](https://medium.com/@siddheshb008/googlenet-a-deep-dive-into-googles-neural-network-technology-f588d1b49e55)
- [Neutrino's Blog: GoogLeNet 簡介與小實驗](https://tigercosmos.xyz/post/2020/10/ai/googlenet/)
- [7.4. 含并行连结的网络（GoogLeNet） — 动手学深度学习 2.0.0 documentation](https://zh.d2l.ai/chapter_convolutional-modern/googlenet.html)
- [Understanding GoogLeNet Model - CNN Architecture - GeeksforGeeks](https://www.geeksforgeeks.org/machine-learning/understanding-googlenet-model-cnn-architecture/)
- [GoogLeNet: Revolutionizing Deep Learning with Inception](https://viso.ai/deep-learning/googlenet-explained-the-inception-model-that-won-imagenet/)
- [Inception-v1 (GoogLeNet) — Winner of ILSVRC 2014 (Image Classification) | by Moris | Computer Vision Note | Medium](https://medium.com/image-processing-and-ml-note/inception-v1-googlenet-winner-of-ilsvrc-2014-image-classification-15b1ea62cc11)
- [深度学习经典网络解析：6.GoogLeNet-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/2286718)
