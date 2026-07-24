---
title: "一文入门Vision in Transformer（ViT）模型的架构"
slug: "2026-02-25-the-strcture-of-ViT-Modal"
description: "本文详细总结了Vision in Transformer模型的设计架构，以及图像其该模型架构中的完整处理流程，帮助建立对ViT模型的基础认识。

Transformer架构在自然语言处理领域（Natural Language Processing）中的各种大语言模型中的到了非常广泛的应用，而2020年Google的一篇论文《An Image is Worth 16×16 Words》，把Transformer架构引入了计算机视觉领域，利用其Patch Embedding和自注意力机制对计算机视觉领域中传统的卷积神经王CNN的统治地位造成了极大的冲击，从而在人工智能的各个领域中已经显示出一统江湖的态势。"
date: 2026-02-25T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Transformer"]
draft: false
---


本文详细总结了Vision in Transformer模型的设计架构，以及图像其该模型架构中的完整处理流程，帮助建立对ViT模型的基础认识。


Transformer架构在自然语言处理领域（Natural Language Processing）中的各种大语言模型中的到了非常广泛的应用，而2020年Google的一篇论文《An Image is Worth 16×16 Words》，把Transformer架构引入了计算机视觉领域，利用其Patch Embedding和自注意力机制对计算机视觉领域中传统的卷积神经王CNN的统治地位造成了极大的冲击，从而在人工智能的各个领域中已经显示出一统江湖的态势。


要理解ViT模型的架构及其图像数据在其中的处理流程，首先要对Transformer架构尤其是其中的Encoder部分的架构有较为清楚的理解和认识，可参考另外一篇笔记[[[一文彻底搞懂Transformer模型的Encoder结构与计算流程]]](https://www.pavelhan.tech/article/2026-02-22-transformer-encoder-structure-and-workflow)。


## ViT架构简介


Transformer 架构最初是为序列化数据（一维）设计的，而图像是高维的（宽 $\times$ 高 $\times$ 通道）。如果把图像数据送入到Transformer架构中进行处理，首先要解决的问题就是把图像的高维数据转换为Transformer可接受的一维序列化数据。针对这个问题，最直观的做法就是直接把图像中的每个像素都当作一个 Token 喂给模型，但这样存在的问题就是计算量会呈指数级爆炸。**因此ViT 的解决方案是：对图像进行切片操作（Patch），把切片后的结果序列化输入Transformer模型。**


因此。ViT 模型就是将输入图像分割为一系列固定大小的块（patch），并把这些块序列化以后应用Transformer模型的自注意力机制提取图像特征，这使得模型能够获取图像不同部分之间的长距离依赖关系，而无需依赖CNN的卷积运算。


下图是一个基于ViT架构的图像分类模型。可以看到，输入图像被分割为多个固定大小的块，这些块被序列化并且向量化以后，送入Transformer Encoder中提取特征，最终通过一个MLP Head输出检测结果。所以从模型的结构上讲，与自然语言语义提取的Transformer Encoder架构相比，两者最大的区别就只是ViT架构对图像所做的切片分块处理而已。


![image.png](/images/blog/一文入门Vision-in-Transformer（ViT）模型的架构-1.png)


以上这个基于ViT架构的图像分类模型的处理，可以分为多个步骤，以下注意解析和描述。


## 1. 图像切片Image Patching


这个步骤有点类似于Transformer在自然语言处理流程中的对语句段落分词（Tokenization）和嵌入（Embedding）的操作。


首先是对图像进行的切片操作（Patching）。例如将一张 224 x 224 的图像切成固定大小 16 x 16的方块（每个方块都是一个Patch），那么整幅图就会被切成 14 x 14 = 196 个块。


![image.png](/images/blog/一文入门Vision-in-Transformer（ViT）模型的架构-2.png)


因为一般来讲，每张输入图像都包含有RGB三个通道，所以经过切分以后的每个切片patch的维度就是 16 x 16 x 3 。这个切片仍然是一个三维的向量，而Transformer的自注意力机制运算需要在固定长度的一维向量上展开。所以下一步仍然需要把这个 16 x 16 x 3 的三维向量展平（Flatten）为一维向量。


在具体的工程实践中，对输入图像的切片以及对各个切片Patch展平的操作通常是通过一个步长(Stride)等于卷积核大小(kernel_size)的 2D 卷积来实现的。例如切片大小为 16 x 16 ，每个patch展平操作输出的一维向量长度是768，就可以使用以下2D卷积操作来执行切片和展平操作：


```python
Conv2d(in_chans=3, out_chans=768, kernel_size=16, stride=16)
```


因为卷积核的小大刚好是一个 Patch 的大小，那么卷积一次就提取了一个 Patch 的特征，这在 GPU 上的计算效率更高。


经过以上操作以后，一张224x224分辨率的输入图像，就被切分为196个patch，并且每个patch都被展平并映射为一个长度为768的一维向量。


## 2. 添加Cls Token


在对以上得到的196个切片向量进行进一步的处理之前，还需要为其额外增加一个相同长度（768）的分类向量，即Cls Token。这个分类向量不代表任何图片块，它的唯一任务是跟其他 196 个块建立联系，最后要从它的输出中读出整张图的分类结果。


具体的操作是：手动创建一个形状为 (1, 768) 的可学习向量，**放在前面得到的 196 个patch向量的最前面**。经过这一步处理以后，输入序列就变成了 196 + 1 = 197 个向量，每个向量的长度都是768。


## 3. 位置编码Positional Encoding


接下来的处理与自然语言文本序列的处理逻辑相同，为197个向量增加位置编码信息，以保留每个patch在原始输入图像中的位置空间感。与自然语言序列中各个字词的位置对于其语义的理解的重要性相同，每个patch位于图像的什么位置，对于整个图像的特征提取同样非常关键。所以在把各个patch的向量序列送入Transformer处理之前，需要为这些向量增加明确的位置信息。


位置向量的维度与输入矩阵（ 如197 x 768）的形状完全一致，这一步操作就是直接将这个位置向量矩阵加到（Addition）之前输入的 Patch 向量矩阵上。


![image.png](/images/blog/一文入门Vision-in-Transformer（ViT）模型的架构-3.png)


至此，输入图像数据经过前述的一系列处理以后，就已经做好了进入Transformer Encoder中进行注意力机制运算的准备了。一张 224 x 224 分辨率的图像变成了一个增加了位置编码的 （197，768）序列。


## 4. Transformer Encoder


在Transformer Encoder中的处理逻辑与流程与自然语言文本的处理没有没有任何区别。整个Transformer Encoder部分包含有连续L个相同的Encoder Block：


![image.png](/images/blog/一文入门Vision-in-Transformer（ViT）模型的架构-4.png)


每个Transformer Block中则包含有多头注意力模块、前馈网络模块、残差与归一化层等结构。整个Transformer Encoder的工作逻辑与计算流程可以参考[[[一文彻底搞懂Transformer模型的Encoder结构与计算流程]]](https://www.pavelhan.tech/article/2026-02-22-transformer-encoder-structure-and-workflow)，而其中的多头注意力模块的计算流程可以参考[[[如何理解Transformer架构中的多头注意力机制？]]](https://www.pavelhan.tech/article/2026-02-23-how-to-understand-multi-head-attention-in-transformer)。


每个Encoder的输入和输出数据维度保持不变，因此经过全部 Encoder 层的处理后，其输出依然是一个 (197, 768) 的矩阵。


## 5. 分类头MLP Head


如上所述，Transformer Encoder模块的输出为一个（197，768）的矩阵，其中包含了输入图像的完整特征提取信息。而在分类任务中，实际上只需要取出第一个位置CLS Token 向量（即我们在第二步所额外增加的那个向量）。


对于图像分类任务而言，分类头的作用本质上就是信息压缩与映射：将高度抽象的 768 维特征向量，转化为对具体类别的概率预测。因此通常情况下，ViT 模型的分类头一般由一个简单的多层感知机（MLP）组成。例如一个标准的分类头网络的结构就是两个线性层中间加一个激活函数以提升非线性映射能力，最后再通过Softmax概率化：

- 从Transformer Encoder输出的(197, 768)矩阵中，切片取出索引为 0 的向量。
- Linear (768 → 768)
- tanh 或 GELU 激活函数
- Linear (768 → K)，K 是分类数量
- Softmax

## 测试预训练的ViT图像分类模型


以下代码通过使用Huggingface的Transformers库下载一个基于ViT架构的图像分类预训练模型，并基于这个预训练模型执行前向推理，得到最终的推理结果：


```python
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch
import requests

image = Image.open('D:/test/cats+dogs/images/dog.jpg')

processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')

# Preprocessing the image so it gets it into the necessary format
inputs = processor(images=image, return_tensors='pt')

# Forward pass - with no backpropagation
with torch.no_grad():
    outputs = model(**inputs)

    logits = outputs.logits
    predicted_class = logits.argmax(-1)

    id2label = model.config.id2label
    predicted_label = id2label[predicted_class.item()]
	  print(f"Predicted class index: {predicted_class.item()}")
    print(f"Predicted class label: {predicted_label}")
```


其中：

- ViTImageProcessor用于对输入图像进行预处理，这个预处理包括resize、归一化等，最终把原始图像转换为ViT模型可以接受的格式。这个预处理过程有些类似于自然语言文本在进行Transdformer处理之前的分词流程。
- ViTForImageClassification是真正的ViT分类模型，其接收经过ViTImageProcessor预处理的图像Tensor输出，输出分类结果的logits数据，因此最终需要自行通过softmax得到分类识别的概率。

## 参考资料

- [Vision Transformers (ViT) Tutorial: Architecture and Code Examples | DataCamp](https://www.datacamp.com/tutorial/vision-transformers)
- [Building a Vision Transformer Model From Scratch | by Matt Nguyen | Toward Humanoids | Medium](https://medium.com/correll-lab/building-a-vision-transformer-model-from-scratch-a3054f707cc6)
- [Vision Transformer (ViT) Architecture - GeeksforGeeks](https://www.geeksforgeeks.org/deep-learning/vision-transformer-vit-architecture/)
