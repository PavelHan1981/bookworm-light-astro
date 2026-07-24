---
title: "An Interpretation of the YOLOv4 Model Network Architecture"
slug: "2025-10-21-the-model-structure-of-YOLOv4"
description: "The first three versions of the YOLO model—v1 (June 2015), v2 (December 2016), and v3 (April 2018)—were all proposed and developed by Joseph Redmon. However, due to the inevitable application of YOLO models in the military sector, the author decided to quit the computer vision field (hats off to the author's great altruistic spirit). The new YOLOv4 version was jointly released in April 2020 by Alexey Bochkovskiy from Russia and two researchers from Taiwan, China: Hong-Yuan Mark Liao and Chien-Yao Wang."
date: 2025-10-21T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","YOLO"]
draft: false
---

The first three versions of the YOLO model—v1 (June 2015), v2 (December 2016), and v3 (April 2018)—were all proposed and developed by Joseph Redmon. However, due to the inevitable application of YOLO models in the military sector, the author decided to quit the computer vision field (hats off to the author's great altruistic spirit). The new YOLOv4 version was jointly released in April 2020 by Alexey Bochkovskiy from Russia and two researchers from Taiwan, China: Hong-Yuan Mark Liao and Chien-Yao Wang.

The figure below shows a comparative test result of YOLOv4 against competing models such as YOLOv3 and EfficientDet on the COCO2017 dataset: As can be seen, while maintaining a generally similar detection speed (FPS), the detection accuracy (AP) of the YOLOv4 model has improved by nearly 10% compared to the YOLOv3 version.

![image.png](/images/blog/YOLOv4模型网络架构解读-1.png)

Official source code repository address for YOLOv4: [GitHub - AlexeyAB/darknet: YOLOv4 / Scaled-YOLOv4 / YOLO - Neural Networks for Object Detection (Windows and Linux version of Darknet )](https://github.com/AlexeyAB/darknet).

Similar to previous YOLO versions, the network architecture of YOLOv4 can also be divided into three parts: the backbone, the neck, and the head.

- Backbone: The backbone of YOLOv4 is CSP Darknet53, whereas YOLOv3 uses Darknet53.
- Neck: The neck of YOLOv4 is PANet, whereas YOLOv3 uses FPN (Feature Pyramid Network).
- Head: YOLOv4 retains the YOLO HEAD from YOLOv3.

## Backbone: CSPDarknet-53

In the design of the backbone network, YOLOv4 borrows the design concept of Cross Stage Partial Network (CSPNet) to build a brand-new, efficient, and powerful backbone network for YOLOv4: CSPDarkNet-53. **Compared with Darknet-53 in YOLOv3, CSPDarkNet-53 does not change much in structure; the main differences are the use of CSP residual blocks instead of regular residual blocks, and the replacement of the LeakyReLU activation function with the Mish activation function.**

### CSP block

As summarized in the article [An Interpretation of the YOLOv3 Model Network Architecture](https://www.pavelhan.tech/article/2025-10-17-the-structure-of-YOLOv3-modal) regarding the Darknet-53 backbone structure of YOLOv3, the design of the Darknet-53 network introduced the residual structure popular in ResNet at the time. Therefore, Darknet-53 can be viewed as the stacking of many consecutive residual blocks. CSPDarknet-53, drawing on the concept of CSPNet, replaces regular residual blocks with CSP residual blocks.

The figure below shows the structure of the CSP residual block used in CSPDarknet-53:

![image.png](/images/blog/YOLOv4模型网络架构解读-2.png)

As can be seen from the structure above, the so-called CSP residual block actually splits the input feature map into two parts, C1 and C2. C1 undergoes no processing, while C2 is processed through a regular residual block and then concatenated and aggregated with C1 for output. The dimensions of the input and output tensors of the entire CSP residual block are completely identical, which is consistent with the processing of regular residual blocks in Darknet-53.

The rationale behind the above CSP structure is: **There is often a lot of redundant information in the feature maps of convolutional neural networks, especially since information between different channels is likely to be similar. In this case, processing all of this feature information is unnecessary; we only need to process a portion of it while keeping the other portion unchanged. This not only ensures no loss in model performance, but also significantly reduces the computational load and parameter count of the model.**

Specifically regarding the implementation of the CSP residual block in the CSPDarknet-53 backbone network, refer to the figure below: For the feature map tensor input to each CSP residual block, two independent $1\times 1$ convolutional blocks are first used to obtain two feature maps with halved channel counts. One path undergoes no processing, while the other passes through a regular residual block. The two parts are then concatenated and combined, and finally processed through a $1\times 1$ convolution to serve as the output.

![image.png](/images/blog/YOLOv4模型网络架构解读-3.png)

As can be seen from the above CSP residual block structure, this structure adds three $1\times 1$ convolutional blocks at the input and output stages compared to the previous regular residual block.

### Mish activation function

As summarized in the article [An Interpretation of the YOLOv2 Model Network Architecture](https://www.pavelhan.tech/article/2025-10-06-YOLOv2-model-structure), YOLOv2 introduced the BN (Batch Normalization) layer into the implementation of convolutional layers, making its basic convolutional block the CBL block: Convolution + BN + LeakyReLU activation function. This design was also carried over into YOLOv3. In the backbone network of YOLOv4, the Mish activation function replaces the LeakyReLU activation function commonly used in previous versions.

The formula for the Mish activation function is:

![image.png](/images/blog/YOLOv4模型网络架构解读-4.png)

The curve of this function is shown in the figure below:

![image.png](/images/blog/YOLOv4模型网络架构解读-5.png)

Compared to ReLU, Mish does not set negative values directly to zero; instead, it retains a small negative value, allowing the network to learn richer features. Compared to LeakyReLU, the biggest difference of Mish is its smoother gradient flow, especially around zero. Because its function curve is smooth, it can provide more stable and smoother gradients during backpropagation. This helps alleviate the "dying ReLU" problem where gradients are zero in the negative region, making weight updates smoother, thereby accelerating convergence and enhancing the model's generalization capability.

Of course, compared to ReLU and LeakyReLU, the computational cost of the Mish function is significantly higher. However, its application in deep neural networks has shown better results than ReLU, which is why the authors of YOLOv4 introduced it into the backbone network.

> Note that YOLOv4 only uses the Mish activation function in the backbone network, while subsequent network parts still adopt the LeakyReLU activation function.

The figure below illustrates the network architecture of the YOLOv4 backbone network, CSPDarknet-53. As can be seen, this network architecture is identical to Darknet-53, with the only differences being the replacement of RES blocks with CSP blocks, and the replacement of the LeakyReLU activation function with the Mish activation function. The stacking structure of the CSP residual blocks is still divided into five parts, just like Darknet-53, and the number of CSP blocks in each part remains the classic 1, 2, 8, 8, and 4. Following this stacking structure, the backbone network continues to output feature information at scales of 8x, 16x, and 32x to the subsequent neck network.

![image.png](/images/blog/YOLOv4模型网络架构解读-6.png)

## Neck: SPP + PAN

The neck network in the YOLO model is responsible for collecting feature map information from different stages and resolutions output by the backbone network, fusing and processing them, and then passing them to the head for object location detection and category classification.

### SPP

SPP stands for Spatial Pyramid Pooling. Its core idea is: **Using pooling kernels of different sizes to capture features at different scales**. In specific implementations, maximum pooling layers of different sizes (typically $5\times 5$, $9\times 9$, and $13\times 13$ in YOLOv4) are used to simultaneously process the input feature map, extracting multi-scale features. Finally, these multi-scale features are fused along the channel dimension to form a rich feature representation incorporating multi-scale information, as shown in the figure below:

![image.png](/images/blog/YOLOv4模型网络架构解读-7.png)

In the network structure of YOLOv4, the feature information output by the backbone network is further processed through the parallel multi-scale pooling of this SPP module. Without sacrificing speed, this effectively expands the model's receptive field and fuses rich contextual information, thereby significantly enhancing the model's feature representation capability and ultimate object detection performance, making it particularly suitable for large objects and complex scenes.

### PANet

Another improvement in the neck network is the adoption of the Path Aggregation Network (PANet).

In the neck network of the YOLOv3 version, the traditional Feature Pyramid Network (FPN) structure adopted only contained a top-down feature fusion path. In other words, it only fused the low-resolution deep feature maps output at the end of the backbone network into the high-resolution shallow feature maps output in the middle stages. In this case, the high-resolution feature maps output from the shallow layers contained deep feature information, but the low-resolution feature maps output from the deep layers of the network did not contain shallow feature information.

PANet, introduced into the neck network of YOLOv4, adds a bottom-up feature fusion path on top of the FPN structure. Such a structure allows feature information at different scales to be fused more thoroughly, ensuring that all outputs simultaneously contain both deep and shallow feature information.

![image.png](/images/blog/YOLOv4模型网络架构解读-8.png)

## Detection Head

The detection head of YOLOv4 is identical to that of YOLOv3, utilizing a $1\times 1$ convolutional layer at the end of each of the three output paths to simultaneously predict three parts of information: coordinates, objectness confidence, and class probabilities.

## Complete Network Structure of YOLOv4

Based on the detailed summary of the three parts of the network above, understanding the overall YOLOv4 network architecture shown below is quite straightforward:

![image.png](/images/blog/YOLOv4模型网络架构解读-9.png)

## References

- [YOLO演進 — 3 — YOLOv4詳細介紹. 之前有介紹過 YOLOv1… | by 李謦伊 | 謦伊的閱讀筆記 | Medium](https://medium.com/ching-i/yolo%E6%BC%94%E9%80%B2-3-yolov4%E8%A9%B3%E7%B4%B0%E4%BB%8B%E7%B4%B9-5ab2490754ef)
- [YOLOv4 中的 Mish 激活函数 - 腾讯云开发者社区 - 腾讯云](https://cloud.tencent.cn/developer/article/1693390?from=15425)
- *YOLO Object Detection*, Yang Jianhua, Li Ruifeng, Chapter 8: YOLOv4