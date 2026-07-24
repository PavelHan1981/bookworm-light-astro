---
title: "YOLOv2特性总结-从YOLOv1的进化"
slug: "2025-10-15-YOLOv2-the-evolution-from-YOLOv1"
description: "本文对YOLOv2在YOLOv1基础上所进化的特性进行了完整的总结，解释模型在进化中各项指标得以提升的特性和工作逻辑。
YOLOv2模型在YOLOv2的设计基础上进行了多项模型设计、训练等方面的调整和优化，在VOC2007数据集上的mAP指标由63.4%大幅度提升到了78.6%，同时保持了YOLOv1 one-stage进行目标检测+类别识别的设计，推理速度依然很快，并且能够识别更多的物体类别。"
date: 2025-10-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["YOLO","CNN"]
draft: false
---


本文对YOLOv2在YOLOv1基础上所进化的特性进行了完整的总结，解释模型在进化中各项指标得以提升的特性和工作逻辑。


YOLOv2模型在YOLOv2的设计基础上进行了多项模型设计、训练等方面的调整和优化，在VOC2007数据集上的mAP指标由63.4%大幅度提升到了78.6%，同时保持了YOLOv1 one-stage进行目标检测+类别识别的设计，推理速度依然很快，并且能够识别更多的物体类别。

- 关于mAP指标的概念和计算逻辑，可以参考[目标检测模型的评价指标详解：mAP，召回率，准确率](https://www.pavelhan.tech/article/2025-09-20-the-metrics-of-object-detection-modal-mAP-recall-precision)

下图中总结了YOLOv2在YOLOv1基础上的所有改进项的列表，本文对其中的每一项展开描述：


![image.png](/images/blog/YOLOv2特性总结-从YOLOv1的进化-1.png)


## Batch Norm


YOLOv2为模型中的每一个卷积层之后都增加了批归一化的处理，所以从之前的卷积+LeakyReLU激活函数的形式，变成了卷积+批归一化+LeakyReLU激活函数的CBL块。


具体的细节在[YOLOv2模型网络架构解读](https://www.pavelhan.tech/article/2025-10-06-YOLOv2-model-structure)一文中有详细描述。


![image.png](/images/blog/YOLOv2特性总结-从YOLOv1的进化-2.png)


在加入了BN层之后，YOLOv1的性能得到了第一次提升。在VOC2007测试集上，其mAP性能从原本的63.4%提升到65.8%。


## Hi-res Classifier


因为ImageNet数据集有着海量的图像数据标注信息，所以大多数目标检测算法，都会首先基于ImageNet数据集对模型的主干网络部分进行预训练，把这个预训练出来的参数作为主干网络的初始参数，即所谓的Image Pretrained技术。


但是基于以上技术所进行的预训练过程，主干网络进行预训练的过程中，所接受的图像尺寸是224x224，这个小的分辨率，对于目标检测应用而言，很容易丢失一些小物体的细节，给后续的检测环节带来困难。所以在YOLOv2的设计上，采取了先使用ImageNet数据集在224x224分辨率上进行预训练，预训练完成后还要增加一个模型的微调（fine tune）阶段，在预训练的参数上，对网络使用448x448分辨率继续训练，使之适应更高分辨率的图像。


具体而言，YOLOv2模型预训练的流程是：

- 先使用224x224分辨率在ImageNet数据集上从头开始训练网络，大概训练160个epoch。
- 然后把模型的输入调整为448x448，继续在ImageNet数据集上，进行10个Epoch的训练就好了。

在这样的策略之下，YOLOv1的性能又一次得到了提升：mAP从65.8%提升到69.5%。

> 为什么不直接从448x448分辨率从头进行网络的训练，而要先使用224x224的小分辨率进行预训练，然后再使用448x448的大分辨率进行微调？一方面是因为从224x224到448x448，分辨率增大四倍，在当时算力的情况下模型的训练时间会拉长很多，另外一方面则是因为224×224分辨率是当时分类网络的标准输入，有大量预训练权重与超参数经验可供参考，因此先沿用成熟配置做热身，再小幅微调，在工程上最稳妥。

## 全卷积神经网络和Anchor先验框机制


在网络结构上的设计上，YOLOv2相比YOLOv1最大的变化，就是在网络的最后阶段去掉了全连接层，将其改成全卷积网络结构。具体的网络结构可参考[YOLOv2模型网络架构解读](https://www.pavelhan.tech/article/2025-10-06-YOLOv2-model-structure).


此外，YOLOv2借鉴了Faster R-CNN网络的思路，引进了先验框Anchor的机制，在图片的推理阶段，模型就只需要学习能够将先验框映射到待检物体目标框的尺寸的偏移量，无须再学习整个目标框的完整尺寸信息，这使得训练变得更加容易。YOLOv2导入的Anchor先验框的机制详细总结可参考[YOLOv2的Anchor锚框机制详解](https://www.pavelhan.tech/article/2025-10-12-the-Anchor-concept-in-YOLOv2)。


基于模型网络结构上的优化以及Anchor框的引入，最终由主干网络输出的特征图的尺寸由YOLOv1提升为YOLOv2的13x13，每个网格提前放置 K 个Anchor框（在YOLOv2模型中默认的Anchor框数量是5个），这样也就意味着整幅图可以输出13x13xK=169K个Bounding Box，并且每个Bounding Box的预测信息都是完全独立的，各个Bounding Box都有自己的中心点x和y坐标，Box的长宽w和h，预测置信度confidence以及各个类别的识别概率（在YOLOv1模型中一个网络的两个Bounding Box共享同一个类别识别概率，因此实际上每个Bounding Box只能检测一个物体）。所以**YOLOv2同一网格输出的各个Bounding Box的相互独立的，这样就可以解决两个物体的中心在同一个网格中会存在的漏检问题**。YOLOv1和YOLOv2模型的输出信息差异如下图所示：


![image.png](/images/blog/YOLOv2特性总结-从YOLOv1的进化-3.png)


## Multi-Scale training


经过对网络结构的改造，去掉全连接层，YOLOv2采取了全卷积网络的结构，网络中只有卷积层和最大池化层，这样的情况下，整个网络的输入分辨率就可以不再局限于只使用416x416的图片，可以使用各种不同分辨率的图像尺寸，因此，在训练过程中，也就可以不断更改输入图像的尺寸，使之适应不同分辨率的图像以及待检物体的大小。


YOLOv2模型主干网络即图像特征提取部分的的下采样步长为32倍，即由图像特征提取部分提取出来的特征图尺寸是输入图像分辨率的1/32，因此输入图像的分辨率需要是32的倍数（最小尺寸为320x320，最大尺寸为608x608）。因此在YOLOv2模型的训练过程中，每执行10个epoch迭代，模型就从320、352、384、416、448、480、512、544、576、608中依次选择一个新的图像尺寸，用作后续10个epoch训练的图像尺寸。如下图所示：


![image.png](/images/blog/YOLOv2特性总结-从YOLOv1的进化-4.png)


实践证明，这个Multi Scale Training的训练策略，可以使得同一个网络能够对不同分辨率的图片都可以更高的进行检测，从而提升了网络的检测性能。


## 参考资料

- [YOLOv2 詳細解讀. YOLOv2 是在 YOLOv1 的基礎上使用了上圖紅色框框裡的方法改進，在… | by Steven Meng | Medium](https://medium.com/@_Xing_Chen_/dyolov2-%E8%A9%B3%E7%B4%B0%E8%A7%A3%E8%AE%80-c62d8868b038)
- 《YOLO目标检测》杨建华，李瑞峰 第6章 YOLOv2
