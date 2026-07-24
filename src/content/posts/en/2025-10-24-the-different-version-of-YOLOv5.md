---
title: "Summary of Different Versions of the YOLOv5 Model"
slug: "2025-10-24-the-different-version-of-YOLOv5"
description: "This article summarizes the different versions of the YOLOv5 model and their differences across various dimensions, including model scale, algorithmic iteration, and output structure."
date: 2025-10-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["YOLO","CNN"]
draft: false
---


This article summarizes the different versions of the YOLOv5 model and their differences across various dimensions, including model scale, algorithmic iteration, and output structure.


The YOLOv5 model is an open-source model released by Glenn Jocher of Ultralytics. Its GitHub repository is available at: [GitHub - ultralytics/yolov5: YOLOv5 🚀 in PyTorch > ONNX > CoreML > TFLite](https://github.com/ultralytics/yolov5).


## Model Scale


Based on the number of parameters, the YOLOv5 model can be divided into five types: nano (1.9M parameters), small (7.2M parameters), medium (21.2M parameters), large (46.5M parameters), and X-large (86.7M parameters). As the parameter scale increases, the performance naturally improves as well. **Basically, if you are deploying to mobile devices or edge computing nodes with embedded processors, the only two viable choices are YOLOv5s and YOLOv5n.**

- _Model selection depends on the accuracy requirements for image recognition and detection_: For simple object presence detection, YOLOv5s may suffice. However, for complex scenarios that require distinguishing subtle differences or detecting small objects (such as medical imaging), a larger model like YOLOv5l or YOLOv5x is required.

![image.png](/images/blog/YOLOv5模型的不同版本总结-1.png)


The differences among the aforementioned model versions all stem from two core parameters in the YOLOv5 source code configuration files: `depth_multiple` and `width_multiple`. **These two parameters generate YOLOv5 models of varying complexities (n, s, m, l, x) by controlling the number of channels (i.e., width) of the convolutional layers in the Backbone and Neck, as well as the stacking count (i.e., depth) of the residual/convolutional layers within the CSP blocks**。

- `width_multiple`: This coefficient is mainly used to control the number of channels in the network feature maps. The larger the coefficient, the more channels each convolutional layer has, resulting in greater model width and parameter capacity, stronger learning capability, but also increased computational cost.
- `depth_multiple`: This coefficient primarily controls the repeated stacking times of certain key modules (such as the C3 modules in the backbone and neck networks). The larger the coefficient, the more network layers there are, deepening the model to extract more complex features, which naturally requires more computational resources.

## Algorithmic Iteration


Unlike the earlier generations of YOLO models, YOLOv5 was directly launched as a PyTorch-based software project. Over the years following its release in 2020, the specific implementation of this project has been continuously updated and optimized, forming an algorithmic iteration sequence from v1.0 to v7.0.


To date, the software versions corresponding to the YOLOv5 project, their release timeline, and key update features are illustrated in the figure below. **As can be seen, from the perspective of model architecture, the most significant update among these versions is v6.0**. This version includes: replacing the Focus module with a standard 6x6 convolutional network with a stride of 2, replacing SPP with SPPF on the small-resolution feature map output at the end of the backbone network, and replacing the previously default LeakyReLU with the SiLU activation function.


![image.png](/images/blog/YOLOv5模型的不同版本总结-2.png)


**For new projects and practical deployments, it is currently recommended to directly use the latest versions such as v6.0 or v7.0**. These versions not only incorporate all major architectural optimizations but generally offer better stability and more comprehensive documentation support.


## Output Structure


In addition to the differences in model scale and software project iterations mentioned above, YOLOv5 also provides two output structure configurations (P5 and P6) to further balance detection accuracy, model size, and inference speed, accommodating various application scenarios and hardware conditions. Under conditions with sufficient computing resources (such as intelligent driving and medical imaging), the P6 version can provide ultimate detection accuracy for the detection and recognition of numerous tiny targets. Of course, the P5 version remains the most widely used in industrial sectors today.


The differences between the P5 and P6 versions are illustrated in the figure below:


![image.png](/images/blog/YOLOv5模型的不同版本总结-3.png)


The figure below shows the network architecture diagram of the YOLOv5l P5 output structure:


![image.png](/images/blog/YOLOv5模型的不同版本总结-4.png)


The figure below shows the network architecture diagram of the YOLOv5l P6 output structure:


![fbd0e5d7-8c19-4e31-aba9-961e0077388a.png](/images/blog/YOLOv5模型的不同版本总结-5.png)


As seen from the architecture diagrams, the default input for the P5 version is an image with a resolution of 640x640x3, outputting three feature streams downsampled by 8x, 16x, and 32x respectively; whereas the default input for the P6 version is a higher-definition image with a resolution of 1280x1280x3, outputting four feature streams downsampled by 8x, 16x, 32x, and 64x respectively.


## Version Naming Convention and Task Types


Based on the multi-dimensional version differences of the YOLOv5 model summarized above, in practical use, the YOLOv5 model filenames contain information about these dimensions, **following a clear naming rule: `yolov5{scale}{output_structure}-{task}.pt`**.


For example:

- `yolov5s.pt`: A small-scale (`s`), P5 output structure model for object detection.
- `yolov5x6.pt`: An extra-large-scale (`x`), P6 output structure model for object detection.
- `yolov5m-seg.pt`: A medium-scale (`m`), P5 output structure model for instance segmentation applications.

The instance segmentation application mentioned above is supported because, in the latest versions of YOLOv5, in addition to basic object detection, image classification (`-cls`) and instance segmentation (`-seg`) are also supported via different task suffixes. These variants are typically developed based on the P5 structure.


## References

- [YOLOv5 Principle and Implementation Comprehensive Analysis — MMYOLO 0.6.0 Documentation](https://mmyolo.readthedocs.io/zh-cn/latest/recommended_topics/algorithm_descriptions/yolov5_description.html)