---
title: "CNN经典网络模型架构学习之AlexNet"
slug: "2025-09-04-the-classical-CNN-network-AlexNet"
description: "本文对计算机视觉图像识别领域经典的AlexNet模型的组成架构以及在Pytorch中的实现进行了详细的总结。
在"
date: 2025-09-04T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---


本文对计算机视觉图像识别领域经典的AlexNet模型的组成架构以及在Pytorch中的实现进行了详细的总结。


在[CNN经典网络模型架构学习之LeNet](https://www.pavelhan.tech/article/2025-09-01-the-classical-CNN-network-Lenet)一文中，对Yann LeCun针对手写数字识别的LeNet5网络模型的结构进行了总结。接下来，继续学习计算机视觉领域中的那些经典模型的框架，本文总结了在ImageNet图像识别竞赛中脱颖而出的AlexNet。


## AlexNet历史简介


在2012年的ImageNet图像识别竞赛（ ImageNet Large Scale Visual Recognition Challenge ，ILSVRC）中，由Alex Krizhevsky, Ilya Sutskever和Geoffrey E. Hinton所提出的AlexNet赢得了冠军。在该竞赛最重要的Top-5 Error Rate指标上，AlexNet取得了断崖式的领先，相比第二名足足提高了10个百分点：


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-1.png)


正是因为AlexNet在该次竞赛中的卓越表现，开启了深度学习这种方式在人工智能计算机视觉领域的研究热潮。


## AlexNet的网络架构


AlexNet的网络架构图如下图所示：


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-2.png)


由上图可以看到，AlexNet的整体结构与[CNN经典网络模型架构学习之LeNet](https://www.pavelhan.tech/article/2025-09-01-the-classical-CNN-network-Lenet)所描述的LeNet-5网络架构非常类似，整体上可以分为两个部分：

- 图像特征提取部分：包含从输入层到最后一个最大池化层，这部分的输出是6x6x256维度的图像特征向量。
- 分类部分：包含最后的三个全连接层。

AlexNet网络的输入是RGB三通道227x227分辨率的图片，输出则是通过输出层的1000个神经元的SoftMax激活函数所输出的1000个分类的概率。之所以是1000个分类，主要是因为AlexNet设计的初衷就是为了参加ImageNet的图像识别竞赛，而ImageNet数据集中包含有1000个图像分类。


AlexNet的总体网络结构总共包含有五个卷积层，三个最大池化层，三个全连接层。

- 输入数据为RGB三通道227x227分辨率的彩色图像数据。
- 第一个卷积层包含有96个卷积核，卷积核为11x11x3的立体卷积核，步进Stride为4，激活函数为ReLU，最终产生96张55x55分辨率的特征图。
- 第一个池化层采用3x3，步进Stride=2的最大池化操作，输出96张27x27分辨率的特征图。
- 第二个卷积层包含有256个卷积核，卷积核尺寸为5x5x96，步进为1，padding为2，激活函数为ReLU，最终产生256张27x27分辨率的特征图。
- 第二个池化层采用3x3，步进Stride=2的最大池化操作，输出256张13x13分辨率的特征图。
- 第三个卷积层包含有384个卷积核，卷积核尺寸为3x3x256，步长为1，padding为1，激活函数为ReLU，最终产生384张13x13分辨率的特征图。
- 第四个卷积层包含有384个卷积核，卷积核尺寸为3x3x384，步长为1，padding为1，激活函数为ReLU，最终产生384张13x13分辨率的特征图。
- 第五个卷积层包含有256个卷积核，卷积核尺寸为3x3x384，步长为1，padding为1，激活函数为ReLU，最终产生256张13x13分辨率的特征图。
- 第三个池化层采用3x3，步进Stride=2的最大池化操作，输出256张6x6分辨率的特征图。
- 以上就是AlexNet的特征提取部分，最后一个池化层进行展平操作为6x6x256个元素的一维向量，最后分类网络层第一个全连接层的输入。
- 第一个全连接层有6x6x256共计9216个输入，有4096个神经元输出，激活函数为ReLU。
- 第二个全连接层接受4096个输入，有4096个神经元输出，激活函数为ReLU。
- 最后一个全连接层有1000个神经元输出，对应于ImageNet数据集的1000个识别分类的概率。

整个网络总的参数数量达到了6000万个，主要集中在最后的三个全连接层：9216x4096+4096x4096+4096x1000=59621952，可见全三个全连接层占去了所有参数总量的绝大多数。


整个网络结构各层数据的维度如下总结：


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-3.png)


### AlexNet的双层架构实现


另外，从部分资料上看到的AlexNet的架构图如下所示：


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-4.png)


可以看到，以上架构图把整个网络分为完全相同的上下两个部分，输入图像同时输入上下两个子网络，最后在输出层汇合。这个架构图实际上是AlexNet原始实现的架构图，因为当时的GPU配置和处理能力相对较低，如果使用一块GPU进行AlexNet+ImageNet数据集的训练的话，速度会非常慢。所以Alex把网络分为上下两个部分，两个子网络分别在两块显卡上并行运行，最后在输出层合并输出结果，这样可以大大加快训练和推理的速度。


但无论如何，从网络层次和结构设计的本质上，以上的这种上下两个子网络的结构与AlexNet网络的标准网络结构并没有区别。


## Alexnet的特点总结


### 激活函数


在AlexNet的网络架构设计中，激活函数由LeNet-5的Sigmoid变成了ReLU，这一修改可以解决在神经网络的层数过深或者梯度过小的情况下，Sigmoid激活函数所存在的梯度消失问题。同时，ReLU相比Sigmoid和Tanh等激活函数，还有着收敛速度更快、训练效率更高以及计算更为简单等优点。


以下是AlexNet论文中所演示在在CIFAR-10数据集上，ReLU相比Tanh激活函数在训练收敛速度上的巨大优势：


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-5.png)


### 最大池化


AlexNet与LeNet5另外一个明显的不同，是使用最大池化层代替了LeNet5所使用的平均池化层。


AlexNet所采用的3x3，stride=2的最大池化层，与LeNet5的2x2平均池化相比，更能够保留重要特征，并且因为stride < size(2 < 3)，也就是说池化层计算是会重叠，就可以重复扫描特征，避免重要特征被舍弃掉的情况发生。


### 过拟合问题的解决


在AlexNet的论文中，提到了多个解决和优化模型训练过拟合问题的对策。**所谓的过拟合问题，就是模型及其训练的参数在训练数据集上表现很好，但是在新的验证和测试数据集上表现欠佳的情况**。


例如在前两个全连接层的实现上，加入了dropout=0.5的操作。即在训练的过程中，每次训练对这两层的神经元随机的把50%的神经元的参数排除在训练过程的前向推理和反向梯度更新的流程之外，借此来提升模型及其参数的泛化能力。


例如图像增强（Data Augmentation）。为了提升训练的效率，增加训练的数据集是一个很好的办法。Data Augmentation简单来说，就是基于现有的训练图片集（即Imagnet数据集）利用一些变换，生成新的训练数据，相当于以低成本的方式快速增加训练数据集的数量。这里的数据增强方式包括把图像水平翻转、高斯扰动、对图像的颜色和光照做一些变化处理等（PCA）。


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-6.png)


例如输入图像的随机裁剪。ImageNet数据集中的图片尺寸大小是不固定的，在AlexNet训练的过程中，首先会把输入图片的短边缩放到256像素，然后再把长边从图像的中心向左右延申128像素，其他多余的部分裁剪掉，以256x256分辨率的图像作为训练的输入分辨率。如上所述，AlexNet网络的输入图像分辨率为227x227，那么在这个输入的256x256分辨率的基础上，每次训练的时候再将其随机裁剪为227x227分辨率，这样的做法就可以大大增加训练图像的数量（2048倍）。


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-7.png)


### 多GPU训练


如以上对AlexNet模型结构进行描述的部分所述，AlexNet的设计者为了加快模型的训练和推理的执行，把整个网络分为完全相同的两个子网络，使用了两块GTX580 GPU同时运行来加快训练的进程。因为GTX580只有3GB显存，无法负荷大量的运算，所以神经网络分成的两个独立的子网络独立地运行在两个显卡上，可以大幅加快训练速度。


## AlexNet的Pytorch实现


AlexNet基于Pytorch框架的代码实现如下所示：


```python
class AlexNet(nn.Module):
    def __init__(self, num_classes):
        super(AlexNet, self).__init__()
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=96, kernel_size=11, padding=2, stride=4)
        self.conv2 = nn.Conv2d(in_channels=96, out_channels=256, kernel_size=5, padding=2)
        self.conv3 = nn.Conv2d(in_channels=256, out_channels=384, kernel_size=3, padding=1)
        self.conv4 = nn.Conv2d(in_channels=384, out_channels=384, kernel_size=3, padding=1)
        self.conv5 = nn.Conv2d(in_channels=384, out_channels=256, kernel_size=3, padding=1)

        self.fc1 = nn.Linear(in_features=256*6*6, out_features=4096)
        self.fc2 = nn.Linear(in_features=4096, out_features=4096)
        self.fc3 = nn.Linear(in_features=4096, out_features=num_classes)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.max_pool2d(x, kernel_size=3, stride=2)
        x = F.relu(self.conv2(x))
        x = F.max_pool2d(x, kernel_size=3, stride=2)
        x = F.relu(self.conv3(x))
        x = F.relu(self.conv4(x))
        x = F.relu(self.conv5(x))
        x = F.max_pool2d(x, kernel_size=3, stride=2)
        x = x.view(-1, 256*6*6)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x
```


通过Netron.app导出的网络架构如下图所示：


![image.png](/images/blog/CNN经典网络模型架构学习之AlexNet-8.png)


## 参考资料

- [AlexNet and ImageNet: The Birth of Deep Learning | Pinecone](https://www.pinecone.io/learn/series/image-search/imagenet/)
- [AlexNet Architecture Explained. The convolutional neural network (CNN)… | by Siddhesh Bangar | Medium](https://medium.com/@siddheshb008/alexnet-architecture-explained-b6240c528bd5)
- [Understanding AlexNet | LearnOpenCV #](https://learnopencv.com/understanding-alexnet/)
- [卷積神經網絡 CNN 經典模型 — LeNet、AlexNet、VGG、NiN with Pytorch code | by 李謦伊 | 謦伊的閱讀筆記 | Medium](https://medium.com/ching-i/%E5%8D%B7%E7%A9%8D%E7%A5%9E%E7%B6%93%E7%B6%B2%E7%B5%A1-cnn-%E7%B6%93%E5%85%B8%E6%A8%A1%E5%9E%8B-lenet-alexnet-vgg-nin-with-pytorch-code-84462d6cf60c)
