---
title: "计算机视觉类AI应用领域及其主流模型总结"
slug: "2025-08-14-the-summary-of-computer-vision-model"
description: "本文总结了目前的人工智能领域中，针对计算机视觉方面的主要应用方向（图像分类，图像定位，目标检测，图像分割，语义分割，实例分割）的差异以及各个应用方向所存在的主流模型。
在当前的计算机视觉领域，图像分类、物体检测以及图像分割是最基础，也是目前发展最为迅速的三大领域。"
date: 2025-08-14T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","YOLO"]
draft: false
---


本文总结了目前的人工智能领域中，针对计算机视觉方面的主要应用方向（图像分类，图像定位，目标检测，图像分割，语义分割，实例分割）的差异以及各个应用方向所存在的主流模型。


在当前的计算机视觉领域，图像分类、物体检测以及图像分割是最基础，也是目前发展最为迅速的三大领域。


## 图像分类 Image Classification


**计算机视觉领域的图像分类任务，要解决的问题是：判断图像中所包含图像的类别是什么？** 例如，对于下图而言，图像识别任务给出的识别结果是这幅图中包含了一只狗：


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-1.png)


所以对于传统的图像分类任务而言，该任务识别结果对应的就是这幅图中最显著的物体所对应的分类（例如上图中的狗），并把这张图片直接按照这个最显著的物体来进行分类。因此，对于图像分类任务的图片样本而言，一般总是存在一个非常突出、最容易用于进行分类的显著物体存在，如下图的各个子图中均可以一目了然的判断该图片对应的分类（实际上也就是这个图片中所包含的最显著的物体）：


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-2.png)


当然，很有可能，我们提交给模型进行分类的图片中包含了多个较为显著的待识别物体，如下图中同时包含了一只狗和一只猫：


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-3.png)


针对这种图像分类任务就需要多目标分类（Multi Label Classfier）。实际上从分类的角度上看，机器学习的分类算法可以分为三种类型：

- Binary classification：有/无，是/非
- Multi-class Classification：从多个类别中返回一个
- Multi-Label Classification：从多个类别中返回多个

![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-4.png)


针对Multi-Class和Multi-Label类型的分类算法，模型进行分类识别的判断结果区别就是，Multi-Class的输出结果是从多个类别中的1个，而Multi-Label则是多个类别中的多个：


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-5.png)


**无论如何，图像分类任务始终只关注要进行分类的图像中存在的物体类别，并不关注这些物体在图像中的位置和数量。**


用于图像分类领域的模型训练数据集有：ImageNet，MNIST，CIFAR等。


图像分类领域的经典模型包括：

- VGG，Visual Geometry Group at the University of Oxford
- GoogLeNet (Inception)，Google
- ResNet，Microsoft Research
- EfficientNet，Google
- DenseNet，Cornell University
- MobileNet，Google

## 目标检测 Object Detection


如果不光要关注图片中物体的类别识别，还需要准确的找到这些物体在图片中的位置，那么就需要用到计算机视觉中的目标检测任务。


如上所述，图像分类应用只是通过识别给图像一个单独的标签，而与之相对的目标检测应用，则需要在图像和视频中对检测到的每个对象提供空间坐标（边界框）和分类标签，这使得在更详细的层面上分析和处理可视化数据成为可能。

- 图像分类应用的输出结果，就只是图像中所包含对象的标签/标签。
- 目标检测应用的输出结果，则需要包含图像中包含对象的标签类别，以及以矩形框标记该对象在图像中所在的位置。

如果是图像中只包含一个最显著的目标，对该目标进行识别并定位的应用，就是Image Localization；而如果图像中有很多目标，要对所有的这些目标进行识别和定位的应用，就是Object Detection：


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-6.png)


目标检测领域的经典模型包括：


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-7.png)


## 图像分割 Image Segmentation


图像分割是把图像中**以像素为单位**分割为不同的对象，并使用不同的色彩涂色进行区分。


图像分割应用（Image Segmentation）又可以细分为语义分割（Semantic Segmentation）和实例分割（Instance Segmentation）。这两者之间的区别是：

- 语义分割：图像分割的处理中，同一个类别的所有物体构成一个分类，因此，同一类别的所有物体都使用同一种颜色着色。
- 实例分割：在进行图像分割的处理过程中，同一个类别的多个不同实例被认为是单独的段，即同一类的每个对象被视为不同的。因此，即使属于同一类，每个独立的物体也会被涂上不同的颜色。

下图是语义分割的典型案例，整个图像中的不同类别的对象被涂以不同的颜色，但是同一类别的对象的颜色相同。


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-8.png)


下图是实例分割的典型案例，可以看到在该图片中识别到的三只猫被分割为不同的对象：


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-9.png)


图像分割领域的主流模型：

- Mask R-CNN
- U-Net
- SegNet
- Deeplab
- PSPNet
- Vision Transformers (ViTs)

## 参考资料

- [人工智能中图像分类、目标检测、语义分割和实例分割等任务是什么？ - 知乎](https://zhuanlan.zhihu.com/p/109999530)
- [Image Classification vs. Object Detection vs. Image Segmentation | by Pulkit Sharma | Analytics Vidhya | Medium](https://medium.com/analytics-vidhya/image-classification-vs-object-detection-vs-image-segmentation-f36db85fe81)
- [Object Detection Models - GeeksforGeeks](https://www.geeksforgeeks.org/computer-vision/object-detection-models/)
- [Image Segmentation Models - GeeksforGeeks](https://www.geeksforgeeks.org/computer-vision/image-segmentation-models/)
