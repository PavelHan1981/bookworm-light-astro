---
title: "YOLOv4模型网络架构解读"
slug: "2025-10-21-the-model-structure-of-YOLOv4"
description: "YOLO模型的前三个版本v1（2015年6月），v2（2016年12月），v3（2018年4月）全都都是由Joseph Redmon提出和开发，但该作者因为YOLO模型不可避免地被用于军事领域，所以决定退出计算机视觉领域（为作者伟大的博爱精神点赞）。新的YOLOv4版本则于2020年4月由俄罗斯的Alexey Bochkovskiy以及中国台湾省的两名研究员廖弘源和王建尧联合推出。"
date: 2025-10-21T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","YOLO"]
draft: false
---


YOLO模型的前三个版本v1（2015年6月），v2（2016年12月），v3（2018年4月）全都都是由Joseph Redmon提出和开发，但该作者因为YOLO模型不可避免地被用于军事领域，所以决定退出计算机视觉领域（为作者伟大的博爱精神点赞）。新的YOLOv4版本则于2020年4月由俄罗斯的Alexey Bochkovskiy以及中国台湾的两名研究员廖弘源和王建尧联合推出。


下图是YOLOv4与YOLOv3以及EfficientDet等竞品模型在COCO2017数据集上的对比测试结果：可以看到，YOLOv4模型在检测速度FPS大体一致的情况下，检测精度AP指标相比YOLOv3版本有了接近10%的提升。


![image.png](/images/blog/YOLOv4模型网络架构解读-1.png)


YOLOv4官方源代码的仓库地址：[GitHub - AlexeyAB/darknet: YOLOv4 / Scaled-YOLOv4 / YOLO - Neural Networks for Object Detection (Windows and Linux version of Darknet )](https://github.com/AlexeyAB/darknet)。


同之前的YOLO版本相同，YOLOv4的网络架构也可以分为主干、颈部和检测头三个部分。

- 主干网络：YOLOv4的主干网络是CSP Darknet53，YOLOv3是Darknet53
- 颈部网络：YOLOv4的颈部网络是PANet，YOLOv3是FPN（特征金字塔）
- 检测头：YOLOv4沿用YOLOv3的检测头YOLO HEAD

## 主干网络CSPDarknet-53


在主干网络的设计上，YOLOv4借鉴了Cross Stage Partial Network(CSPNet)的设计理念，为YOLOv4构建出一个全新的高效且强大的主干网络：CSPDarkNet-53。**CSPDarkNet-53相比于YOLOv3的Darknet-53而言，结构上没有太大变化，主要的区别是使用CSP残差块代替了普通残差块，以及使用Mish激活函数替代了LeakyReLU激活函数。**


### CSP block


如[YOLOv3模型网络架构解读](https://www.pavelhan.tech/article/2025-10-17-the-structure-of-YOLOv3-modal)一文对YOLOv3主干网络结构Darknet-53的学习和总结，Darknet-53网络结构的设计引入了当时在Resnet中流行起来的残差结构，所以可以把Darknet-53网络看成是连续很多个残差块的堆积。CSPDarkenet-53则借鉴CSPNet的概念，用CSP残差块代替了普通的残差块。


下图是CSPDarknet-53所使用的CSP残差块的结构：


![image.png](/images/blog/YOLOv4模型网络架构解读-2.png)


从以上结构上可以看到，所谓的CSP残差块，实际上就是把输入的特征图分为两个部分C1和C2，C1不做任何处理，C2经过一个普通残差块的处理以后，与C1拼接聚合后输出。整个CSP残差块的输入和输出张量的维度完全相同，这一点跟Darknet-53中普通残差块的处理是相同的。


以上CSP结构的合理性在于：**卷积神经网络的特征图中往往存在很多冗余信息，尤其是不同的通道之间的信息很有可能是相似的，那么在这种情况下，对这些特征信息的处理就没有处理全部的信息，只需要处理其中一部分，另外一部分保持不变即可，这样既可以保证不损失模型的性能，还能够从很大程度上降低模型的计算量和参数量。**


具体到CSP残差块在CSPDartnet-53主干网络上的实现，可以参考下图：对于每个CSP残差块输入的特征图张量，先使用两个独立的1x1卷积块，得到两个通道数减半的特征图，其中一条不做任何处理，另外一条经过一个普通的残差块处理，然后把两部分在拼接合并在一起，最后再通过一个1x1卷积处理后作为输出。


![image.png](/images/blog/YOLOv4模型网络架构解读-3.png)


从以上的CSP残差块结构可以看到，这个结构比之前的普通残差块多增加了输入和输出环节的三个1x1卷积块。


### Mish激活函数


如[YOLOv2模型网络架构解读](https://www.pavelhan.tech/article/2025-10-06-YOLOv2-model-structure)一文所总结的，YOLOv2在卷积层的实现上导入了BN层，因此其基本的卷积块就是CBL块：卷积层+BN层+LeakyReLU激活函数。这一设计在YOLOv3中也得以继续沿用。在YOLOv4的主干网络中，则使用Mish激活函数代替了在之前版本中普遍使用的LeakyReLU激活函数。


Mish激活函数的公式为：


![image.png](/images/blog/YOLOv4模型网络架构解读-4.png)


该函数的曲线如下图所示：


![image.png](/images/blog/YOLOv4模型网络架构解读-5.png)


与ReLU相比，Mish在负值区域不是直接置零，而是保留一个较小的负值，这使得网络能够学习到更丰富的特征。而与LeakyReLU相比，Mish最大的区别是更为平滑的梯度流，尤其是在0点附近。由于其函数曲线是光滑的，在梯度的反向传播时就能提供更稳定、更平滑的梯度。这有助于缓解ReLU在负区间梯度为零所导致的神经元死亡问题，让权重更新更加顺畅，从而加速收敛并提升模型的泛化能力。


当然与ReLU和LeakyReLU相比，Mish函数的计算量明显加大，但其在深度神经网络中的应用显示了比ReLU更好的结果，所以被YOLOv4的作者导入到主干网络中。

> 需要注意，YOLOv4只是在主干网络中使用了Mish激活函数，在后面的网络部分仍然采用LeakyReLU激活函数。

下图就是YOLOv4主干网络CSPDarknet-53的网络架构。可以看到，这个网络架构与Darknet-53完全相同，区别就只是把其中的RES块替换成CSP块，把LeakyReLU激活函数替换成Mish激活函数而已。CSP残差块的堆叠结构仍然是跟Darknet-53一样的分为五个部分，每个部分的CSP块的数量仍然是经典的1，2，8，8，4。按照这个堆叠，主干网络仍然向后续的颈部网络输出8倍、16倍以及32倍的特征信息。


![image.png](/images/blog/YOLOv4模型网络架构解读-6.png)


## 颈部网络：SPP+PAN


YOLO模型中的颈部网络负责收集来自主干网络所输出的不同阶段、不同分辨率的特征图信息，经过融合处理以后，并将它们传递到头部进行目标位置检测和类别判断。


### SPP


SPP，Spatial Pyramid Pooling，空间金字塔池化，其核心思想在于：**使用不同大小的池化核来捕捉不同尺度的特征**。具体实现中，就是使用不同尺寸的最大池化层（在YOLOv4中通常是5x5, 9x9, 13x13）对输入的特征图同时进行处理，提取多个尺度的特征，最终这些不同尺度的特征在通道维度上融合，就形成一个融合了多尺度信息的丰富特征。如下图所示：


![image.png](/images/blog/YOLOv4模型网络架构解读-7.png)


在YOLOv4的网络结构中，主干网络所输出的特征信息，再经过这个SPP模块的并行多尺度池化处理，在不牺牲速度的前提下，有效扩大了模型的感受野并融合了丰富的上下文信息，从而显著提升了模型的特征表达能力和最终的目标检测性能，特别适用于大尺寸目标和复杂场景。


### PANet


颈部网络的另外一个改进是采用了路径汇聚网络（Path Aggregation Network，PANet）。


在YOLOv3版本的颈部网络中，其采用的传统特征金字塔结构（FPN），仅包含自顶向下（top-down）的特征融合结构，也就是说，只会把主干网络尾端输出的低分辨率深层特征图向中段输出的高分辨率浅层特征图部分融合，这样的情况下，浅层输出的高分辨率特征图中就包含了深层的特征信息，但网络深层输出的低分辨率特征图并不包含浅层的特征信息。


YOLOv4的颈部网络引入的PANet，在FPN的结构的基础上，增加了一条自底向上（bottom-up）的特征融合路径，这样的结构就可以让不同尺度的特征信息得到更加充分的融合，在所有的输出上都同时包含了深层和浅层的特征信息。


![image.png](/images/blog/YOLOv4模型网络架构解读-8.png)


## 检测头


YOLOv4的检测头与YOLOv3相同，都是在三路输出的最后使用一个1x1卷积层同时完成坐标、置信度和类别等信息的三部分预测。


## YOLOv4的完整网络结构


基于以上对于网络三个部分的详细总结，理解如下所示的YOLOv4整体网络架构就比较简单了：


![image.png](/images/blog/YOLOv4模型网络架构解读-9.png)


## 参考资料

- [YOLO演進 — 3 — YOLOv4詳細介紹. 之前有介紹過 YOLOv1… | by 李謦伊 | 謦伊的閱讀筆記 | Medium](https://medium.com/ching-i/yolo%E6%BC%94%E9%80%B2-3-yolov4%E8%A9%B3%E7%B4%B0%E4%BB%8B%E7%B4%B9-5ab2490754ef)
- [YOLOv4 中的 Mish 激活函数-腾讯云开发者社区-腾讯云](https://cloud.tencent.cn/developer/article/1693390?from=15425)
- YOLO目标检测》杨建华，李瑞峰 第8章 YOLOv4
