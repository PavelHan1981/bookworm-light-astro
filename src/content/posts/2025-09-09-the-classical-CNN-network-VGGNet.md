---
title: "CNN经典网络模型架构学习之VGGNet"
slug: "2025-09-09-the-classical-CNN-network-VGGNet"
description: "本文对计算机视觉图像识别领域经典的VGGNet模型的组成架构以及在Pytorch中的实现进行了详细的总结。"
date: 2025-09-09T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---


本文对计算机视觉图像识别领域经典的VGGNet模型的组成架构以及在Pytorch中的实现进行了详细的总结。


## VGGNet的网络架构简介


VGG：Visual Geometry Group。VGGNet最初的设计理念是通过加大卷积神经网络的深度，来提升模型的工作性能指标。VGGNet在2014年的ImageNet的图像识别和分类竞赛（ILSVRC）中得到了第二名（GoogleNet是当年竞赛的第一名），top-5 accuracy指标（模型预测出来的概率最高的前5个类别中，是否包含了真实的标签）达到了92.7%，在后续的一些其他模型中，VGGNet的网络结构也往往被用于backbone部分进行图像的特征识别。


VGGNet的网络架构中比较典型的VGG16，VGG19以及VGG34模型，其中的数字表示其模型架构分别包含有16个、19个以及34个参数层（即卷积层和全连接层）。


下图是VGG16的网络架构图：


![image.png](/images/blog/CNN经典网络模型架构学习之VGGNet-1.png)

- 以上VGG16的整个网络架构中，包含了13个卷积层，5个池化层，以及3个全连接层，其中的参数层（即卷积层和全连接层）共计16个。
- 模型的输入的分辨率为224x224的RGB三通道图像数据，最终的输出为针对1000个图像分类类别的预测概率（因为VGG16模型的设计是对ImageNet数据集进行预测，该数据集有1000个分类）。
- 从整个网络架构的设计上讲，仍然是标准的卷积神经网络。整个网络结构分为两个部分：前半部分是卷积层和池化层组成的图像特征提取部分，后半部分则是由全连接层组成的图像分类部分。因此，网络结构与[CNN经典网络模型架构学习之LeNet](https://www.pavelhan.tech/article/2025-09-01-the-classical-CNN-network-Lenet)以及[CNN经典网络模型架构学习之AlexNet](https://www.pavelhan.tech/article/2025-09-04-the-classical-CNN-network-AlexNet)所总结的LeNet以及AlexNet没有本质上的差别，只不过层次更多而已。**但因为层次相比较LeNet和AlexNet的层数加深了很多，VGG16的参数数量达到了138M。**

**VGG19 相比 VGG16 多了 3 个卷积层，在以上的conv3、conv4、conv5部分各加了一个卷积层**，其余部分（包括卷积核尺寸、通道数、池化策略、全连接层结构）完全相同。


在VGGNet的原始论文中，作者共提供了从A到E共6种网络配置。其中VGG16对应的是配置D，而VGG19对应的则是配置E。


![image.png](/images/blog/CNN经典网络模型架构学习之VGGNet-2.png)


从上表可以看到，A-E这6种配置的网络架构基本相同，差异只在于各个卷积层的数量不同而已。


## VGG16各网络层次参数配置


下图为VGG16网络架构中各个层次的超参数设置：


![image.png](/images/blog/CNN经典网络模型架构学习之VGGNet-3.png)

- 可以看到，以上VGG16网络结构的各个层次中，conv1、conv2、conv3、conv4/conv5部分的卷积核数量分别为64、128、256、512个，各个卷积区使用的卷积核的数量在每一层加倍，这是设计VGG16网络架构的一个重要原则。
- 所有卷积层的卷积核大小都是3x3（这一点与AlexNet所使用的更大尺寸的卷积核形成了鲜明的对比），卷积层的步进stride全部为1；所有池化层均为2x2最大池化，池化步进stride全部为2。
- 激活函数方面，除了最后输出层使用多分类的softmax激活函数以外，其他所有的卷积层和全连接层的激活函数均为ReLU。
- 最后的三个全连接层部分，前两个全连接层均有4096个神经元，最后的输出层对应ImageNet数据集的1000个类别的识别概率，包含有1000个神经元。

## VGGNet的Pytorch实现


VGG16网络结构基于Pytorch框架的代码实现如下所示：


```python
class VGG16(nn.Module):
    def __init__(self, num_classes=1000):
        super(VGG16, self).__init__()

        # 卷积层部分 - 5个卷积块
        # 卷积块1: 2个卷积层，输出通道64
        self.conv1_1 = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, padding=1)
        self.conv1_2 = nn.Conv2d(in_channels=64, out_channels=64, kernel_size=3, padding=1)
        # 卷积块2: 2个卷积层，输出通道128
        self.conv2_1 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
        self.conv2_2 = nn.Conv2d(in_channels=128, out_channels=128, kernel_size=3, padding=1)
        # 卷积块3: 3个卷积层，输出通道256
        self.conv3_1 = nn.Conv2d(in_channels=128, out_channels=256, kernel_size=3, padding=1)
        self.conv3_2 = nn.Conv2d(in_channels=256, out_channels=256, kernel_size=3, padding=1)
        self.conv3_3 = nn.Conv2d(in_channels=256, out_channels=256, kernel_size=3, padding=1)
        # 卷积块4: 3个卷积层，输出通道512
        self.conv4_1 = nn.Conv2d(in_channels=256, out_channels=512, kernel_size=3, padding=1)
        self.conv4_2 = nn.Conv2d(in_channels=512, out_channels=512, kernel_size=3, padding=1)
        self.conv4_3 = nn.Conv2d(in_channels=512, out_channels=512, kernel_size=3, padding=1)
        # 卷积块5: 3个卷积层，输出通道512
        self.conv5_1 = nn.Conv2d(in_channels=512, out_channels=512, kernel_size=3, padding=1)
        self.conv5_2 = nn.Conv2d(in_channels=512, out_channels=512, kernel_size=3, padding=1)
        self.conv5_3 = nn.Conv2d(in_channels=512, out_channels=512, kernel_size=3, padding=1)

        # 池化层
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # Dropout层
        self.dropout1 = nn.Dropout(p=0.5)
        self.dropout2 = nn.Dropout(p=0.5)

        # 全连接层
        self.fc1 = nn.Linear(in_features=512*7*7, out_features=4096)
        self.fc2 = nn.Linear(in_features=4096, out_features=4096)
        self.fc3 = nn.Linear(in_features=4096, out_features=num_classes)

    def forward(self, x):
        # 卷积块1
        x = F.relu(self.conv1_1(x))
        x = F.relu(self.conv1_2(x))
        x = self.pool(x)

        # 卷积块2
        x = F.relu(self.conv2_1(x))
        x = F.relu(self.conv2_2(x))
        x = self.pool(x)

        # 卷积块3
        x = F.relu(self.conv3_1(x))
        x = F.relu(self.conv3_2(x))
        x = F.relu(self.conv3_3(x))
        x = self.pool(x)

        # 卷积块4
        x = F.relu(self.conv4_1(x))
        x = F.relu(self.conv4_2(x))
        x = F.relu(self.conv4_3(x))
        x = self.pool(x)

        # 卷积块5
        x = F.relu(self.conv5_1(x))
        x = F.relu(self.conv5_2(x))
        x = F.relu(self.conv5_3(x))
        x = self.pool(x)

        # 展平操作
        x = x.view(-1, 512*7*7)

        # 全连接层
        x = F.relu(self.fc1(x))
        x = self.dropout1(x)
        x = F.relu(self.fc2(x))
        x = self.dropout2(x)
        x = self.fc3(x)

        return x
```


## 参考资料

- [Understanding VGG: The Backbone of Image Recognition](https://viso.ai/deep-learning/vgg-very-deep-convolutional-networks/)
- [VGG-Net Architecture Explained. The company Visual Geometry Group… | by Siddhesh Bangar | Medium](https://medium.com/@siddheshb008/vgg-net-architecture-explained-71179310050f)
- [VGGNet - HackMD](https://hackmd.io/@DPfv8ouFT1yy6t0JMM7WRA/B1cOMIHsU)
