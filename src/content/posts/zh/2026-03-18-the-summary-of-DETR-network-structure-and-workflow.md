---
title: "DETR（DEtection TRansformer）网络架构与计算流程详细总结"
slug: "2026-03-18-the-summary-of-DETR-network-structure-and-workflow"
description: "本文详细介绍了Facebook在2020年提出的基于Transformer架构的图像目标检测模型DETR的网络结构及其数据在网络中的计算流程。"
date: 2026-03-18T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["DETR","Transformer","CNN"]
draft: false
---


本文详细介绍了Facebook在2020年提出的基于Transformer架构的图像目标检测模型DETR的网络结构及其数据在网络中的计算流程。


## DETR简介


DETR 是由 Facebook AI Research (FAIR) 在 2020 年提出的针对计算机视觉领域中**目标检测**方向的AI模型，首次把NLP领域中广泛应用的 Transformer 架构引入到了计算机视觉领域。它彻底改变了目标检测领域的传统设计范式，将目标检测任务从繁琐的各种组件和处理流程的堆砌简化为了一个真正的端到端的集合预测问题。


在 DETR 模型出现之前，在目标检测领域的主流检测器（如 Faster R-CNN, YOLO, SSD）都高度依赖各种设计组件：

- Anchor Boxes (锚框)：基于训练数据集的总体情况预设检测目标的不同尺度和比例。
- NMS (非极大值抑制)：用于在模型输出数据的后处理过程中消除重复的检测框。
- 极其复杂的正负样本匹配策略。

而DETR 的核心创新则在于：通过利用 Transformer 结构的全局建模能力，直接输出一个固定数量的预测集合（通常是 100 个），然后通过二分图匹配 (Bipartite Matching) 算法与真实标签（Ground Truth）进行一对一匹配。


从架构上讲，DETR 网络主要由三个部分组成：CNN Backbone，Tranformer编解码器，检测头。


![image.png](/images/blog/DETR（DEtection-TRansformer）网络架构与计算流程详细总结-1.png)


## CNN Backbone


DETR网络架构以卷积神经网络CNN结构的BackBone部分开始，Backbone网络采用标准的Resnet网络（原始论文中，作者使用的 Backbone 网络是Resnet50和Resnet101）。该Bonebone网络作为输入图像的特征提取器，用于处理原始输入图像以产生丰富的视觉特征向量。

- 有关 Resnet 的网络结构可参考：[CNN经典网络模型架构学习之Resnet](https://www.pavelhan.tech/article/2025-09-30-the-classical-CNN-network-Resnet)。

在图像处理的处理维度上，假设 Backbone 的输入图像尺寸为 (3, H, W)，那么该部分经过多阶段 Resnet 进行的特征提取后会输出一个降维后的特征图。在标准的 DETR 实现中，特征图下采样的倍数通常是 32 倍，因此输出特征图的维度是  (C, H/32, W/32)。而通道数 C 通常使用一个1x1卷积投影到256，用以匹配 Transformer 的输入维度。

- 如果输入图像分辨率为 800 x 800，输出特征图的分辨率就是 25 x 25。

参考ViT架构中Transformer在计算机视觉领域中的应用（[一文入门Vision in Transformer（ViT）模型的架构](https://www.pavelhan.tech/article/2026-02-25-the-strcture-of-ViT-Modal)），Transformer 接收的是序列数据（Sequence），而不是矩阵形式的向量。因此，Backbone 中Resnet网络所输出的 (25,25,256) 的特征图会被展平拉直成一个长度为 625 的向量序列，其中的每个元素为长度256的向量。


![image.png](/images/blog/DETR（DEtection-TRansformer）网络架构与计算流程详细总结-2.png)


### 位置编码


同样的，卷积神经网络本身由于平移不变性和局部感知，能隐式的感知位置信息。但 Transformer 处理的序列数据需要额外在展平的向量序列上增加位置编码信息，这一点跟自然语言处理中对文本信息增加位置编码信息是一致的。


DETR 对BackBack输出特征图序列的位置信息采用了固定正余弦二维位置编码（Fixed 2D Sinusoidal Positional Encodings）。大致的做法是：将特征图每个像素位置的编码信息分为 x 方向和 y 方向，分别进行编码，最后将它们拼接（Concatenate）起来。如上所述，特征图经过展平拉直后每个像素的向量长度为256，那么就分配 128 维来编码 x 坐标，另外的 128 维来编码 y 坐标，将两者拼接后形成最终的 256 维位置特征向量。


对于特征图上每个像素的 (x,y) 坐标，每个 x 对应一个 128 维的向量，这个向量由 64 组正余弦对组成，其正余弦对的计算公式分别为：


$$
PE(x, 2i) = \sin\left(\frac{x}{10000^{2i/d}}\right)
$$


$$
PE(x, 2i+1) = \cos\left(\frac{x}{10000^{2i/d}}\right)y 
$$


同样是由64组正余弦对组成的128维向量，采用相同的计算公式计算。两个128维向量再拼接得到一个256维的位置向量，这样得到的向量维度正好与经过 1 x 1 卷积后的特征向量维度对齐，位置编码信息的维度同样是长度为 625 的向量序列，其中的每个元素为长度256的向量。。


## Transformer Encoder-Decoder


如上所述，经过Backbone对图像的特征提取、特征图展平拉直以后，送入Transformer Encoder的数据维度就是长度为 625 的序列向量，序列中每个元素的维度维 256。**需要注意，BackBone 输出的数据与并不会与位置编码向量直接相加，而是在计算注意力时将位置向量注入到** **`Query`** **和** **`Key`** **的计算中，这一点是与标注的自然语言处理的Transformer计算流程不同的地方。**


下图是 DETR 的Transformer Encoder与Decoder的处理流程架构：


![image.png](/images/blog/DETR（DEtection-TRansformer）网络架构与计算流程详细总结-3.png)


### Encoder


Encoder的多头自注意力模块采用了 8 个 Head，因此每个 Head 的维度为 $d_k = 256 / 8 = 32$。每一个 Head 的Q、K、V矩阵的计算如下：

- Query (Q)：$(Src + Pos) \cdot W_Q$ → 维度: 625 x 32
- Key (K)： $(Src + Pos) \cdot W_K$  → 维度: 625 x 32
- Value (V)： $Src \cdot W_V$  → 维度: 625 x 32
> **注意**：在计算Query和Key的时候，把 Backbone 提取出来的特征向量 Src 与其位置编码 Pos 相加进行计算，Value 的计算不需要加入位置编码，因为 Value 负责提供内容信息，而 Q 和 K 负责定位和匹配。

接下来对于多头注意力模块的计算仍然遵循标准的计算流程，在[如何理解Transformer架构中的多头注意力机制？](https://www.pavelhan.tech/article/2026-02-23-how-to-understand-multi-head-attention-in-transformer)一文中已经非常详细的总结了多头注意力模块的计算步骤。


总之，从输入和输出数据的维度上讲，每个 Encoder 模块（上面架构图左侧虚线框部分）输入的特征图展平向量和位置编码向量的维度是 625 x 256 , 而其输出数据的维度同样是 625 x 256 。DETR 模型默认包含有连续的6个Encoder模块，最终 Encoder 部分输出的数据维度同样是 625 x 256 。


Encoder 的工作逻辑就是：**利用全局注意力机制，对前面的Backbone卷积网络提取的局部特征进行上下文建模，最终输出一个与输入尺寸相同的增强特征序列，其中每个点都包含了全局的上下文信息和语义特征。**


### Decoder


对于 Decoder 部分架构的理解，首先定义Decoder的输入。Decoder 的输入包含两个部分：

- Encoder的输出，这一部分比较好理解，就是前面最后一个 Encoder 模块输出的维度为 625 x 256 的张量。
- **Object Queries (对象查询向量)**：这是一个维度为 100 x 256 的张量。在训练阶段，它是可学习的参数（类似于 Embedding），训练完成后这个100 x 256维度的张量就作为固定的参数用于后续图片的推理流程。这 100 个向量就代表着 100 个候选框。

如下图所示的Decoder Block的架构，每个Decoder Block从下到上依次包含有三个部分：多头自注意力模块（Multi-Head Self-Attention），多头交叉注意力模块（Multi-Head Attention），前馈模块（FFN）。


![image.png](/images/blog/DETR（DEtection-TRansformer）网络架构与计算流程详细总结-4.png)


首先是自注意力模块（上图中的Multi-Head Self-Attention模块）。这个自注意力模块的计算流程与标准的Transformer自注意力的计算流程稍有差异：标准的Transformer自注意力模块的输入是增加了位置编码信息的输入向量，然后基于这个输入向量分别与 $W_Q,W_K,W_V $这三个参数矩阵运算得到 Q，K，V 向量；而以上自注意力模块的计算逻辑则是：


$$
V = Object\_Queries \cdot W_V
$$


$$
Q = (Object\_Queries \oplus Object\_Queries) \cdot W_Q
$$


$$
Q = (Object\_Queries \oplus Object\_Queries) \cdot W_Q
$$


**以上自注意力计算的逻辑，实际上把输入的Object Queries同时作为输入数据和其位置编码向量来使用，这就是为什么在自注意力计算Q和K的过程中要对Object Queries进行自加操作的原因所在。**

> 为什么是对相同的输入Object Queries进行自加，而不是对这个输入直接乘以2呢？这是因为，实际上Decoder部分有6个连续叠加的Decoder block，而只有第一层的decoder在计算Q和K的时候用的是Object Queries的自加作为输入，后续的decoder在进行自注意力模块计算的时候是使用Object Queries（作为位置向量信息）和前一层Decoder的输出相加来作为其输入的。

经过以上自注意力模块的计算后，其输出数据的维度为 100 x 256。


接下来是交叉注意力模块Multi-head Attention部分的计算。在交叉注意力模块中，Decoder 自注意力模块的输出扮演的是主动提问者的角色，而 Encoder 输出的特征图则是知识库。


交叉注意力模块的输入数据有三个部分：Decoder 自注意力模块输出的object_queries（维度为（100，256）），Encoder输出的特征图信息encoder_features（维度为（625，256）），以及与Encoder部分相同的空间位置编码信息（维度为（625，256））。在这种情况下，Q,K,V 三个张量的计算逻辑及其数据维度如下：

- Q (Query)： $(Object\_Queries + Query\_Pos) \cdot W_Q$  → (100, 256)
- K (Key)： $(Encoder\_Features + Spatial\_Pos) \cdot W_K$ → (625, 256)
- V (Value)：$Encoder\_Features \cdot W_V$ → (625, 256)

交叉注意力模块后续的计算逻辑以及前馈网络模块FFN仍然与标准的Decoder Block的计算流程相同，具体可以参考[一文彻底搞懂Transformer模型的Decoder结构与计算流程](https://www.pavelhan.tech/article/2026-03-09-the-summary-of-the-structure-and-workflow-of-transformer-decoder)，最终以上的整个Decoder Block的输出维度与其输入维度相同，都是（100，256）。DETR网络结构右侧的Decoder部分总共包含有6个连续叠加的Decoder Block，每个block的输出作为下一个block的object queries输入，最终整个Decoder部分的输出数据维度仍然是 (100,256)。


## 检测头


如上所述，经过整个 Decoder 部分的连续6个Decoder Block的叠加处理后，最终Decoder部分输出的数据维度是（100，256）。那么DETR模型最后的检测头部分的任务，就是将这 100 个高维向量映射为人类可读的类别标签和边界框坐标。


在检测头结构的设计上，DETR 采用了两个并行的 FFN（前馈神经网络）分支，它们共享 Decoder 的输出，但负责不同的任务。


![image.png](/images/blog/DETR（DEtection-TRansformer）网络架构与计算流程详细总结-5.png)


分类头 (Classification Head)的结构是一个简单的线性层（Linear Layer）。该线性层的输入数据维度为 100 x 256，输出数据为 100 x (K+1)。其中 K 是目标数据集的类别数（如 COCO 的 80 类），+1 代表背景类（no object）。最后的激活函数使用Softmax，它会为每个 Query 分配一个概率分布，指示该 Query 对应的物体属于哪一类。


回归头 (Bounding Box Regression Head)的结构是一个具有 3 个隐藏层的多层感知机（MLP），每层之间带有 ReLU 激活函数。整个回归头的输入数据维度为100 x 256，输出数据维度为 100 x 4。其数值的含义是归一化后的中心坐标及宽高$ (x_{center}, y_{center}, w, h)$。


在以上输出头结构的情况下，对于每张图片，DETR模型会输出100个检测框的坐标信息（回归头），每个检测框对应一个长度为 K+1 的分类信息。在进行背景框过滤时，只需要设定一个阈值（例如 0.5），过滤掉那些分类结果为背景类别（no object）或得分过低的预测框即可，不再需要YOLO模型非常复杂的NMS计算流程了。


## 参考资料

- [facebookresearch/detr: End-to-End Object Detection with Transformers](https://github.com/facebookresearch/detr)
- [Introduction to DETR - Part 1 | DigitalOcean](https://www.digitalocean.com/community/tutorials/introduction-detr-hungarian-algorithm-1)
