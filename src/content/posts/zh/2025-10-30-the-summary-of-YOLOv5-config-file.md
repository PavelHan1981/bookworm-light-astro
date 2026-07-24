---
title: "YOLOv5模型的配置文件详解"
slug: "2025-10-30-the-summary-of-YOLOv5-config-file"
description: "本文配合YOLOv5模型的架构图，对该模型的yaml配置文件各个部分的配置参数细节内容进行了详细的总结和解释，有助于更细致的理解模型不同规模版本之间的差异。"
date: 2025-10-30T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["YOLO","CNN"]
draft: false
---


本文配合YOLOv5模型的架构图，对该模型的yaml配置文件各个部分的配置参数细节内容进行了详细的总结和解释，有助于更细致的理解模型不同规模版本之间的差异。


在YOLOv5之前的版本中，普遍采用cfg文件对其各种配置参数进行控制。从YOLOv5版本开始，正式采用了yaml配置文件格式。YOLOv5的配置文件在其源代码目录的models子目录下，该目录默认情况下包含有yolov5n.yaml、yolov5n.yaml、yolov5n.yaml、yolov5n.yaml、yolov5n.yaml共五个模型配置文件，分别对应各个不同规模的模型结构。

- 有关YOLOv5模型的不同版本之间的差异，可以参考[YOLOv5模型的不同版本总结](https://www.pavelhan.tech/article/2025-10-24-the-different-version-of-YOLOv5)。

![image.png](/images/blog/YOLOv5模型的配置文件详解-1.png)


从这个配置文件的结构上看，YOLOv5的配置参数信息可以分为全局参数部分和网络结构参数部分，而网络结构参数部分又可以分为backbone和head两个子部分。


## 全局参数


配置文件的全局参数部分如下所示：


```yaml
# Parameters
nc: 80 # number of classes
depth_multiple: 1.0 # model depth multiple
width_multiple: 1.0 # layer channel multiple
anchors:
  - [10, 13, 16, 30, 33, 23] # P3/8
  - [30, 61, 62, 45, 59, 119] # P4/16
  - [116, 90, 156, 198, 373, 326] # P5/32
```


### nc


nc(number of classes)这个参数比较简单，就是用于定义模型需要检测的目标类别数量。因为YOLOv5模型默认是使用COCO数据集训练的，所以这里默认的80就是COCO数据集所支持的目标类别数量。**如果要使用自定义数据集对YOLOv5模型进行从头训练的话，nc对应为自己数据集所支持的类别数量（在数据集配置文件中设置并覆盖网络模型配置文件中的nc设置值）。**


### depth_multiple


depth_multiple是一个缩放因子，用于实现对网络结构中主干网路和颈部网络每个CSPBlock（**在YOLOv5 v6.0中被称为C3模块**）中所包含的残差块（Bottleneck模块）的数量的控制。下图是YOLOv5网络中CSPBlock的结构。这里的depth_multiple就表示下图中n（也就是DarknetBottleneck残差块的数量）的数量。每个CSPBlock中包含的DarknetBottleneck残差块的数量越多，自然就表示网络的深度越深，这就是depth的由来。


![image.png](/images/blog/YOLOv5模型的配置文件详解-2.png)


与depth_multiple参数相关的计算代码如下：


```plain text
n = max(round(n * depth_multiple), 1) if n > 1 else n  # depth gain
```


`


其中的n是在配置文件中预设的模块重复次数，max()函数用于确保计算后的模块数是一个不小于1的整数。以YOLOv5s为例，主干网络部分第三个CSP Layer的配置为[-1, 9, C3, [512]]，即这个CSP Layer中包含有连续9个残差块DarknetBottleneck，YOLOv5s的depth_multiple为0.33，因此在YOLOv5s中该层实际的残差块数量 = max(round(9 * 0.33), 1) = max(round(2.97), 1) = 3。这意味着，在YOLOv5s中，这个位置原本设计重复9次的C3模块，最终只会堆叠3次。


YOLOv5各种不同规模模型的depth_multiple参数及其对应的CSP Layer残差块的数量如下图所示：


![image.png](/images/blog/YOLOv5模型的配置文件详解-3.png)


### depth_multiple


width_multiple的逻辑与depth_multiple类似，通用是以乘数因子的形式**控制着网络中所有卷积层和C3模块（包括主干网络和颈部网络部分）的输出通道数（即特征图的卷积核数量）**。在YOLOv5的模型构建过程中，width_multiple参数会与配置文件中的预设通道数相乘，然后通过`make_divisible`函数确保结果是8的倍数（为了GPU计算效率）：


```plain text
c2 = make_divisible(c2 * width_multiple, 8)
```


以YOLOv5s的第一个卷积层为例，在配置文件中的预设通道数：[64, 6, 2, 2]（表示默认设置的输出通道数为64），YOLOv5s对应的width_multiple参数为0.50，在这种情况下，第一个卷积层实际输出的通道数为：64 × 0.50 = 32，这就意味着在YOLOv5s中，原本设计输出64个通道的卷积层，实际上只输出32个通道。


下图是YOLOv5各个不同规模模型的默认width_multiple参数：


![image.png](/images/blog/YOLOv5模型的配置文件详解-4.png)


### anchor


与YOLOv3和v4版本相同，YOLOv5版本同样通过Anchor锚框机制来预设的目标检测边界框尺寸，以帮助模型更准确地定位和识别目标。YOLOv5模型的主干网络输出大中小三种尺寸分辨率的特征图，每个特征图的每个网格会放三个不同尺寸和长宽比的anchor框：


```yaml
anchors:
  - [10,13, 16,30, 33,23]  # P3/8 - 小目标检测
  - [30,61, 62,45, 59,119] # P4/16 - 中目标检测
  - [116,90, 156,198, 373,326] # P5/32 - 大目标检测
```

- 配置文件中的anchor配置信息总共三行，分别对应不同尺度的特征图：P3/8、P4/16、P5/32。
- 每行包含3组宽高值，每组代表一个anchor的[width, height]。
- 小特征图（P5/32）使用大anchor检测大目标，中特征图（P4/16）使用中等anchor检测中等目标，大特征图（P3/8）使用小anchor检测小目标

对比以上YOLOv5模型配置文件中提供的默认anchor参数，会发现其与[YOLOv3-输出、Anchor与损失函数的进化总结](https://www.pavelhan.tech/article/2025-10-19-the-output-anchor-and-loss-function-of-YOLOv3)中YOLOv3模型基于COCO数据集使用k-means机制统计出来的anchor框尺寸完全一致，也就是说，这个配置文件中所设置的anchor框的尺寸是基于COCO数据集的。


**实际上在使用自定义数据集进行训练的时候，YOLOv5模型会首先使用一个Auto Learning Bounding Box Anchors的机制，检查自定义数据集的anchor先验框的尺寸与配置文件中提供的anchor参数的设置值（基于COCO数据集）是否基本匹配。如果匹配的话继续使用参数文件指定的默认anchor框进行训练，如果不匹配就会重新使用k-means方法计算这个自定义数据集自身的anchor，并在后续训练过程中使用自己计算的anchor。**


### 与数据集配置选项的冲突


除了YOLOv5各个不同规模的模型配置文件之外，在调用train.py对模型进行自定义数据训练时，还需要设置自定义训练数据集的配置文件（数据集配置文件在data目录下）。**而各个数据集的配置文件中也有nc或者anchors等配置选项，那么数据集的这些配置选项与模型的配置选项之间是什么关系呢？**


答案是：**YOLO训练脚本会优先采用数据配置文件中的配置选项**。如果模型配置文件（如yolov5s.yaml）中的nc值与数据集配置文件中的nc选项不同，终端上会打印出警告信息：Overriding model.yaml nc=80 with nc=5。这表示程序正自动将模型输出层的类别数从默认值（例如COCO数据集的80类）覆盖成训练数据集的实际类别数（例如5类）。


在yolo.py源代码文件DetectionModel Class的实现中有以下代码，可以看到：在数据集配置文件中提供了nc和anchors参数的情况下，YOLO会使用数据集配置文件（如data/VOC.yaml）中的配置选项覆盖掉模型配置文件（如models/yolov5s.yaml）中的配置选项。


```python
# Define model
        ch = self.yaml["ch"] = self.yaml.get("ch", ch)  # input channels
        if nc and nc != self.yaml["nc"]:
            LOGGER.info(f"Overriding model.yaml nc={self.yaml['nc']} with nc={nc}")
            self.yaml["nc"] = nc  # override yaml value
        if anchors:
            LOGGER.info(f"Overriding model.yaml anchors with anchors={anchors}")
            self.yaml["anchors"] = round(anchors)  # override yaml value
```


## 网络结构参数


YOLOv5的网络结构通过如下列表的形式对网络的每一层进行定义：**[from, number, module, args]**。以下对各个参数做详细解释和总结。


**from**用于指定当前层的输入来自哪一层：


![b7e45d3d-2326-42fd-90b9-a1c3fbec9413.png](/images/blog/YOLOv5模型的配置文件详解-5.png)


主干网络backbone的设置，每一层基本上都是从上一层接收数据，因此这里的from设置为-1就可以了。在head部分中定义的颈部网络结构，包含有很多类似 [-1, 6]这样的设置，这表示将上一层（通常是上采样后的结果）与骨干网络中的第6层（一个高分辨率的特征图）进行拼接，用于融合深层语义信息和浅层位置信息。


**number**参数定义了当前模块需要重复堆叠的次数。对于普通的卷积层Conv和SPPF这类不需要重复堆叠的结构，该参数设置为1。对于C3模块，该参数与前面详细解释的depth_multiple参数协同工作，最终的堆叠次数= number× depth_multiple (结果四舍五入取整，且至少为1)。


**module**参数指定了该网络层使用的网络模块。在YOLOv5网络结构的定义上用到的网络模块的类型如下图所示：


![a84965e0-5355-429a-9b59-8c0836d384e2.png](/images/blog/YOLOv5模型的配置文件详解-6.png)


**args**通过列表的形式详细定义module所需要的模块参数。参数的具体含义取决于模块类型，其设置格式如下图所示。


![e57c69f2-d646-461b-b7b1-0a2fb3a08b22.png](/images/blog/YOLOv5模型的配置文件详解-7.png)


在配置文件的网络结构参数部分，分别使用Backbone和Head两个段定义了主干网络和颈部网络的结构。


### Backbone


主干网络结构的配置如下所示：


```yaml
# YOLOv5 v6.0 backbone
backbone:
  # [from, number, module, args]
  [
    [-1, 1, Conv, [64, 6, 2, 2]], # 0-P1/2
    [-1, 1, Conv, [128, 3, 2]], # 1-P2/4
    [-1, 3, C3, [128]],
    [-1, 1, Conv, [256, 3, 2]], # 3-P3/8
    [-1, 6, C3, [256]],
    [-1, 1, Conv, [512, 3, 2]], # 5-P4/16
    [-1, 9, C3, [512]],
    [-1, 1, Conv, [1024, 3, 2]], # 7-P5/32
    [-1, 3, C3, [1024]],
    [-1, 1, SPPF, [1024, 5]], # 9
  ]
```


对比以上主干网络的配置，与主干网络的结构图就比较好理解了，整个网络结构由上到下：

- 卷积块，6x6，stride=2，64通道
- 卷积块，3x3，stride=2，128通道
- C3块，128通道
- 卷积块，3x3，stride=2，256通道
- C3块，256通道
- 卷积块，3x3，stride=2，512通道
- C3块，512通道
- 卷积块，3x3，stride=2，1024通道
- C3块，1024通道
- 最后是一个SPPF模块，1024通道

![image.png](/images/blog/YOLOv5模型的配置文件详解-8.png)


### Head


Head部分实际上主要定义的是YOLOv5颈部网络的结构。以下为YOLOv5模型配置文件默认的head部分的参数：


```yaml
# YOLOv5 v6.0 head
head: [
    [-1, 1, Conv, [512, 1, 1]],
    [-1, 1, nn.Upsample, [None, 2, "nearest"]],
    [[-1, 6], 1, Concat, [1]], # cat backbone P4
    [-1, 3, C3, [512, False]], # 13

    [-1, 1, Conv, [256, 1, 1]],
    [-1, 1, nn.Upsample, [None, 2, "nearest"]],
    [[-1, 4], 1, Concat, [1]], # cat backbone P3
    [-1, 3, C3, [256, False]], # 17 (P3/8-small)

    [-1, 1, Conv, [256, 3, 2]],
    [[-1, 14], 1, Concat, [1]], # cat head P4
    [-1, 3, C3, [512, False]], # 20 (P4/16-medium)

    [-1, 1, Conv, [512, 3, 2]],
    [[-1, 10], 1, Concat, [1]], # cat head P5
    [-1, 3, C3, [1024, False]], # 23 (P5/32-large)

    [[17, 20, 23], 1, Detect, [nc, anchors]], # Detect(P3, P4, P5)
  ]
```


看上去比backbone部分稍微难理解一点，但是仍然结合YOLOv5模型网络架构图中的Neck网络部分就比较清楚了：


![image.png](/images/blog/YOLOv5模型的配置文件详解-9.png)


对于上面配置文件中配置信息的解读，从架构图左下角第10层的卷积块开始，这个卷积层的from参数为-1，表示从主干网络最后的SPPF层接收输入在第10层（也就是卷积层）进行卷积处理，然后送到第11层上采样模块Upsample 2来进行上采样......以此类推，直到最后在第23层即最后一个CSPLayer上输出。


配置文件的最后一句`[[17, 20, 23], 1, Detect, [nc, anchors]]`表示从17、20、23层这三层输出检测信息，用于最终在模型的检测头上输出最终的检测结果。


## 参考资料

- [YOLOv5 原理和实现全解析 — MMYOLO 0.6.0 文档](https://mmyolo.readthedocs.io/zh-cn/latest/recommended_topics/algorithm_descriptions/yolov5_description.html)
