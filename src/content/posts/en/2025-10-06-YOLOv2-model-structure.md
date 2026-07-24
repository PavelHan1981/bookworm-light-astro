---
title: "Decoding the YOLOv2 Model Network Architecture"
slug: "2025-10-06-YOLOv2-model-structure"
description: "This article provides a detailed summary and study of the YOLOv2 model's BN layer, the Darknet-19 backbone network, and its overall architecture."
date: 2025-10-06T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["YOLO"]
draft: false
---

This article provides a detailed summary and study of the YOLOv2 model's BN layer, the Darknet-19 backbone network, and its overall architecture.

## Introduction of the Batch Normalization (BN) Layer

The convolutional structures used in the backbone network of the YOLOv1 model still followed the traditional pattern of linear convolution + non-linear activation function, without incorporating the various normalization layer designs that became widely popular later on. Because Batch Normalization (BN) layers have been applied in an increasing number of models and their performance has been widely recognized by the industry, they have gradually become a standard configuration in convolutional neural networks. Consequently, the architectural design of the YOLOv2 model naturally introduced this thoroughly validated BN layer.

Specifically, the convolutional structure within the network architecture was changed from the previous pattern of linear convolution + non-linear activation function to a form consisting of a linear convolution layer + BN layer + non-linear activation function. This structure is also referred to as the CBL (Conv-BN-LeakyReLU) structure.

![image.png](/images/blog/YOLOv2模型网络架构解读-1.png)

## Darknet-19 Backbone Network

As introduced in [[[YOLOv1 Model Network Architecture Decoding]]](https://www.pavelhan.tech/article/2025-10-01-yolov1-model-structure), the backbone network of the YOLOv1 model adopted a design similar to GoogLeNet. By the YOLOv2 version, the authors designed a new network structure called Darknet-19 to replace the previous generation's backbone.

The Darknet-19 network contains 19 convolutional layers, and every single convolutional layer adopts the CBL structure described above, namely the form of convolutional layer + BN layer + activation function. The figure below shows the configuration parameters for each layer of the Darknet-19 network architecture:

- The feature map dimensions corresponding to the "Output" column in the table below correspond to images with an input resolution of 224x224. When Darknet-19 is used as the backbone network for YOLOv2 (with an input image resolution of 416x416), the output feature map dimensions of each layer change accordingly.

![image.png](/images/blog/YOLOv2模型网络架构解读-2.png)

> In the architecture diagram above, the Darknet-19 network can be divided into two parts: the first half is the feature extraction part, which, once pre-training is completed, will be used as the backbone network for YOLOv2; the final convolutional layer + global average pooling layer + Softmax portion constitutes the classification part, which is removed in the YOLOv2 model.

As can be seen, the Darknet-19 network architecture above contains a total of 19 convolutional layers (3x3 and 1x1 convolutions) and 5 max-pooling layers of 2x2. Finally, drawing inspiration from the NiN network approach (refer to [CNN Classic Network Model Architecture Learning - NiN]), it replaces fully connected layers with global average pooling layers, and uses Softmax in the final layer to output prediction results for 1,000 classification categories.

The authors of Darknet-19 trained the network parameters using the ImageNet dataset. In terms of final detection accuracy, the Darknet-19 network achieved levels comparable to the VGG network, but with a much smaller model size (only 25.5M parameters) and floating-point operations amounting to only about 1/5 of VGG, resulting in extremely fast computation speeds.

**After the Darknet-19 network is pre-trained on the ImageNet dataset, the final layers used for the classification task—including the final convolution, average pooling, and Softmax layers—are removed, and it is then used as the new backbone network for YOLOv2.**

## Passthrough and Reorg

In terms of backbone network design, aside from introducing the new Darknet-19 backbone, YOLOv2 also drew inspiration from the SSD model's design of using higher-resolution feature maps.

> Typically, different feature maps have different resolutions. The shallower the feature map, the fewer downsampling operations it undergoes, resulting in a higher resolution and finer grid divisions. This obviously helps in extracting more detailed information.

Regarding the backbone design of YOLOv2, in addition to the low-resolution feature map output by the final convolutional layer of the Darknet-19 feature extraction section (the 19th convolutional layer, indicated by the red arrow in the figure below), YOLOv2 also extracts a high-resolution feature map from the 13th convolutional layer of the Darknet-19 network (indicated by the green arrow in the figure below). It then merges these two feature maps together to serve as the feature extraction output of the entire backbone network. Under this setup, the feature output of the backbone network combines low-resolution features from the tail of the network and high-resolution features from the middle of the network, making the extracted information more complete. This is the so-called Passthrough architecture of the YOLOv2 model.

![image.png](/images/blog/YOLOv2模型网络架构解读-3.png)

Given an input image resolution of 416x416, the dimension of the high-resolution feature map output from the middle section of the backbone network is 26x26x512, while the dimension of the low-resolution feature map output from its tail is 13x13x1024. **How can feature maps of different resolutions be merged together for output? The answer is the Reorg operation.**

The low-resolution feature map at the tail of Darknet-19 has a dimension of 13x13x1024. After passing through a 3x3, stride=1 CBL convolution block, its dimension remains 13x13x1024.

Meanwhile, the high-resolution feature map from the middle section of Darknet-19 has a dimension of 26x26x512. It undergoes a reorg operation, where the total data volume remains unchanged, but the resolution is halved and the number of channels is quadrupled. The Reorg operation for a single-channel feature map (which is essentially a data rearrangement) is illustrated in the figure below, where one channel becomes four channels. Through this operation, the dimension of the middle section's high-resolution features becomes 13x13x2048.

![image.png](/images/blog/YOLOv2模型网络架构解读-4.png)

After undergoing their respective treatments above, the spatial resolutions of both the tail and middle feature maps become 13x13, making it possible to merge all the feature maps together. Therefore, after this merger, the number of channels in the output feature map is 1024 + 2048 = 3072 channels, resulting in an overall feature map data dimension of 13x13x3072.

## Overall Architecture of the YOLOv2 Model

The overall network architecture of the YOLOv2 model is shown in the figure below:

![image.png](/images/blog/YOLOv2模型网络架构解读-5.png)

> It is worth noting that there is a discrepancy between the overall network architecture diagram above and the network architecture diagram provided in the Passthrough section regarding the number of output channels after the backbone network's merge. In the diagram above, the middle high-resolution feature map passes through a CBL convolution block during the Passthrough processing to first reduce its channels to 64, and is then reorged into a 13x13x256 dimension, making the total merged output feature data dimension 13x13x1280. In contrast, the network structure diagram in the previous section does not reduce channels for the high-resolution feature data during Passthrough, directly reorging it into a 13x13x2048 dimension, which makes the total merged output feature data dimension 13x13x3072. However, regardless of whether the output after merging has 1280 or 3072 channels, subsequent steps pass it through a CBL convolution block to reduce the channel count to 1024. The actual feature data dimension ultimately used for final prediction is always 13x13x1024.

The input image has an RGB 3-channel resolution of 416x416. After being processed by the Darknet-19 backbone network and merging its tail and middle feature extraction data, the final output feature map has a dimension of 13x13x1024. Predictions for the categories and locations of the objects to be detected in the image are then made based on this 13x13x1024 dimensional feature data.

**This final prediction process is relatively straightforward: it performs a 1x1 convolution operation on the 13x13x1024 feature extraction data.** The final output data dimension is determined by the number of classes of objects to be detected. Each grid cell in YOLOv2 contains 5 prediction boxes (also referred to as anchors in YOLOv2 terminology), and the data contained in each box includes: center coordinates $x$ and $y$, width and height $w$ and $h$, confidence score, and the probabilities for each class (based on the number of object categories to be recognized).

- For the COCO dataset, which supports 80 object classes, the data volume for each anchor is 85. Since each grid cell contains 5 anchors, the total data volume per grid cell is 425. Thus, the data dimension of the model's inference output for the COCO dataset is 13x13x425.
- For the VOC dataset, which supports 20 classes, the data volume per grid cell is 125. Thus, the data dimension of the model's inference output for the VOC dataset is 13x13x125.

As can be seen from the overall YOLOv2 architecture diagram above, all network layers are convolutional networks. The fully connected layers of YOLOv1 have been completely removed, making YOLOv2 a fully convolutional network.

## References

- "YOLO Object Detection" by Jianhua Yang, Ruifeng Li, Chapter 6: YOLOv2
- [DAY28 Deep Learning - Convolutional Neural Networks - YOLO v2 (Part 2) - iT邦幫忙](https://ithelp.ithome.com.tw/articles/10252820)