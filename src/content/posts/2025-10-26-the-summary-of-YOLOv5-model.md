---
title: "YOLOv5模型网络架构解读"
slug: "2025-10-26-the-summary-of-YOLOv5-model"
description: "本文详细以YOLOv5的P3版本为基础，详细总结了该模块的整体网络架构、各个子模块的工作逻辑，可为后续更深入的学习YOLOv5模型打好基础。
"
date: 2025-10-26T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","YOLO"]
draft: false
---


本文详细以YOLOv5的P3版本为基础，详细总结了该模块的整体网络架构、各个子模块的工作逻辑，可为后续更深入的学习YOLOv5模型打好基础。


**注：本文所总结的YOLOv5版本为YOLOv5l，v6.0，P5版本**。具体各个版本的差异可以参考[YOLOv5模型的不同版本总结](https://www.pavelhan.tech/article/2025-10-24-the-different-version-of-YOLOv5)。


## 主干网络Backbone


在完整总结整个主干网络的结构之前，首先在下面以小节的形式整理主干网络中的各个子模块。


### Focus与6x6卷积


YOLOv5的早期版本在主干网络的起始部分，使用了Focus结构（一种切片操作）来减少计算量并保留信息。该模块主要用于图像的下采样和特征提取，在减少空间分辨率的同时，保留了更多的原始信息，这个操作的本质就是将空间信息（宽和高）转换到通道维度。


Focus模块的操作分为三个步骤：

- 切片操作（slice）：将输入图像在宽度和高度方向上每隔一个像素进行采样，得到4个互补的子特征图。
- 通道拼接：将4个子特征图在通道维度拼接在一起，实际上就是通道数x4。
- 卷积操作：对拼接后的特征图进行一次标准的卷积。

以YOLOv5s的结构为例，原始的608x608x3的图像输入Focus模块，经过切片操作，变成304x304x12的特征图，然后再经过一次32个卷积核的1x1卷积操作，变成304x304x32的特征图输出。


切片操作的处理如下图所示：**可以看到这个Slice操作跟YOLOv2模型（参考**[**YOLOv2模型网络架构解读**](https://www.notion.so/YOLOv2%E6%A8%A1%E5%9E%8B%E7%BD%91%E7%BB%9C%E6%9E%B6%E6%9E%84%E8%A7%A3%E8%AF%BB)**）中的Reorg操作完全相同。**


![image.png](/images/blog/YOLOv5模型网络架构解读-1.png)


Focus处理的流程如下图所示：


![image.png](/images/blog/YOLOv5模型网络架构解读-2.png)


**但在YOLOv5的后续版本（如v6.0之后）中，Focus结构被一个标准的、卷积核大小为6、步长为2的卷积层（Conv2d 6x6, stride=2）所取代**。这也就是我们在YOLOv5不同版本的架构图上看到有些是Focus模块，有些是6x6卷积模块的原因所在。尽管Focus模块在理论上可以减少信息丢失，但在实际应用中，一个精心设计的卷积层（使用较大的6x6卷积核）也能有效捕获类似的空间信息，并且在GPU等硬件上，标准卷积通常能得到极佳的优化，实际的推理速度可能反而更有优势或相当。因此，在YOLOv5的新版本中，使用通用的卷积层替换掉特殊的Focus结构，使得整体网络结构可以更加统一和简洁，减少了自定义模块，降低了代码的复杂性和维护成本。


### 激活函数


在YOLOv5的主干网络中，普遍使用SiLU激活函数（也称为Swish函数）代替了之前版本常用的LeakyReLU。相比于LeakyReLU，SiLU激活函数在0点附近更为平滑，有助于提升梯度的流动性和模型的表达能力。


SiLU激活函数的表达式为：


$$
f(x)=x * Sigmoid(x)
$$


其中的Sigmoid(x)就是标准的sigmoid函数，它的值在0-1之间。SiLU函数的特点是非线性，连续可导。


![image.png](/images/blog/YOLOv5模型网络架构解读-3.png)


下图是通过Netron查看YOLOv5的onnx文件，主干网络图像输入的前两个卷积块的结构。这个结构图中可以清楚的看到SiLU激活函数的计算流程，其计算可分解为两个清晰的步骤：

- **Sigmoid变换**：首先，将卷积层的输出送入到Sigmoid函数中。Sigmoid函数会将其中的每个元素的值映射到 (0, 1)的区间内。
- **逐元素乘法**：然后，将原始的输入与第一步得到的Sigmoid权重进行逐元素相乘。这一步就是下图中的 act/Mul 操作。其效果是：根据Sigmoid计算出的权重，对原始特征进行放大（权重接近1）、抑制（权重接近0）或部分保留（权重在0-1之间）。

![image.png](/images/blog/YOLOv5模型网络架构解读-4.png)


**但是仍然需要注意的是，YOLOv5的不同版本中使用的激活函数是不同的，其早期版本（如v1.0-v3.0）默认配置的激活函数仍然是LeakyReLU，所以可以看到这些早期版本的主干网络中仍然采用了大量的CBL（Conv-BN-LeakyReLU）块；从大约v5.0版本开始，官方将默认的激活函数全面切换为SiLU，CBL块也随之变为Conv-BN-SiLU。** 这就是网上看到的多数YOLOv5的模型架构图中仍然大量采用CBL块和LeakyReLU激活函数的原因所在。


![image.png](/images/blog/YOLOv5模型网络架构解读-5.png)


### CSPLayer


与YOLOv4相同，YOLOv5在主干网络的实现中也采用了CSP结构。也就是说，将特征图在通道维度上拆分为两部分，一部分进行复杂的卷积变换，另一部分直接抄近道走捷径，最后在输出之前将两部分结果合并。概念上与YOLOv4没有太大区别，与CSP处理的更详细解释可以参考[YOLOv4模型网络架构解读](https://www.pavelhan.tech/article/2025-10-21-the-model-structure-of-YOLOv4).


YOLOv5中的CSP块的结构如下图所示：可以看到，YOLOv5模型结构中使用的CSP块有两种类型：

- CSP1用于主干网络，其中的卷积变化处理部分使用Resnet的残差块结构（如下图中的DarknetBottleneck add=true部分）。
- CSP2用于颈部网络，其中的卷积处理部分就只是两个连续的卷积块而已（如下图中的DarknetBottleneck add=false部分）。

![image.png](/images/blog/YOLOv5模型网络架构解读-6.png)


### SPPFBottleneck


SPPF模块的全称是Spatial Pyramid Pooling-Fast（快速空间金字塔池化），本质上仍然是一个SPP模块，只不过是在计算速度和性能上进行了优化而已。


SPPF和SPP模块的核心目标都是要扩大特征信息的感受野，融合多尺度上下文信息。两者的区别只不过是：传统的SPP模块是在多个大池化核（如5x5, 9x9, 13x13）对输入的特征图并行处理并把处理结果拼接在一起，而SPPF模块则是使用同一个5x5池化核重复工作，多次池化，然后把不同阶段的池化结果拼接在一起。

- 有关SPP模块的工作逻辑，可以参考另外一篇笔记[YOLOv4模型网络架构解读](https://www.pavelhan.tech/article/2025-10-21-the-model-structure-of-YOLOv4)。

相比于前者，SPPF模块串联相同池化核的工作方式在硬件上更易优化，计算速度更快，可有效提升模型对不同尺度目标的适应性。在保持甚至提升模型性能的同时，实现更快的推理速度。


![image.png](/images/blog/YOLOv5模型网络架构解读-7.png)


至此，YOLOv5模型的主干网络部分就呼之欲出了：在输入图像为640x640分辨率的情况下，主干网络的输出仍然是以8倍，16倍，32倍的倍率分别输出三路分辨率和通道数不同的特征信息，由颈部网络对特征信息进行检测。


![image.png](/images/blog/YOLOv5模型网络架构解读-8.png)


总结起来，从上到下整个主干网络可以分为五个部分：

- Stem Layer：也就是上面所介绍的Focus模块，只不过在较新的模型版本中，Focus模块已经变成了6x6，步长为2的普通卷积网络。在输入图像分辨率为640x640x3的情况下，该模块的输出为320x320x64维度的特征图。
- 从Layer 1到Layer 3都是3x3卷积+多个连续CSP块的结构，前面的步长为2的3x3卷积模块负责把输入特征图的分辨率减半，通道数加倍。
    - Layer 1包含1个3x3卷积+连续的3个CSP块，其输出为160x160x128维度的特征图。
    - Layer 2包含1个3x3卷积+连续的6个CSP块，其输出为80x80x256维度的特征图。该层输出作为大尺寸分辨率特征图送入颈部网络。
    - Layer 3包含1个3x3卷积+连续的9个CSP块，其输出为40x40x512维度的特征图。该层输出作为中等尺寸分辨率特征图送入颈部网络。
- 最后的Layer 4，前半部分的处理仍然跟Layer1-3相同，包含有1个3x3卷积+连续3个CSP块，只不过在最后还额外增加了一个SPPFBottleneck模块进一步扩展输出特征图的感知野。该层的输出为20x20x1024维度的特征图。最终该层输出作为小尺寸分辨率特征图送入颈部网络。

## 颈部网络Neck


颈部网络部分是YOLOv5模型实现多尺度目标检测的核心组件，其工作目标是把主干网络提取的特征进行高效融合，使模型能够同时识别不同大小的目标。


整体来讲，YOLOv5和YOLOv4在颈部网络设计上的架构和思想没有太大变化，但其核心区别在于，YOLOv5在颈部网络中引入了上面主干网络部分所介绍的CSP2模块等方面的改进，显著加强了特征融合能力并提升了计算效率。


网络的整体架构上，YOLOv5的颈部网络仍然采用了与YOLOv4相同的FPN (特征金字塔网络) + PAN (路径聚合网络) 的双向结构。其中FPN负责自顶向下传递强语义特征，而PAN负责自底向上传递精确定位特征，形成强大的特征金字塔。

- FPN处理：在通道维度上通过Concat操作，将上采样（Upsample）后的深层特征图与对应的浅层特征图进行拼接，结合了浅层的细节信息和深层的语义信息。
- PAN处理：在PAN路径中，使用步长为2的卷积层，将融合后的特征图再次下采样（Downsample），以便与更高层级的特征进行进一步融合。

![image.png](/images/blog/YOLOv5模型网络架构解读-9.png)


## 检测头Head


检测头部分相比之前的版本仍然是没有太大差异，输出的三路特征图经过各自独立的1x1卷积处理，输出不同分辨率的检测结果张量。


![image.png](/images/blog/YOLOv5模型网络架构解读-10.png)


## YOLOv5模型的整体网络架构


最后再放一张YOLOv5模型的整体网络架构图，结合以上各个子模块的描述，理解整体的架构图就比较容易了：


![image.png](/images/blog/YOLOv5模型网络架构解读-11.png)


## 参考资料

- [深入浅出Yolo系列之Yolov5核心基础知识完整讲解 - 知乎](https://zhuanlan.zhihu.com/p/172121380)
- [YOLOv5 詳細解讀. 前言 | by Steven Meng | Medium](https://medium.com/@_Xing_Chen_/yolov5-%E8%A9%B3%E7%B4%B0%E8%A7%A3%E8%AE%80-724d55ec774)
- [YOLOv5 原理和实现全解析 — MMYOLO 0.6.0 文档](https://mmyolo.readthedocs.io/zh-cn/latest/recommended_topics/algorithm_descriptions/yolov5_description.html)
