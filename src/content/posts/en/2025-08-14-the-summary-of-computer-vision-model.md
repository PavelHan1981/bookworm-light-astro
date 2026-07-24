---
title: "Summary of Computer Vision AI Application Domains and Their Mainstream Models"
slug: "2025-08-14-the-summary-of-computer-vision-model"
description: "This article summarizes the differences among the primary application directions of computer vision in the current AI field (image classification, image localization, object detection, image segmentation, semantic segmentation, instance segmentation) as well as the mainstream models existing in each application direction. Currently, image classification, object detection, and image segmentation are the three most fundamental and rapidly developing fields in computer vision."
date: 2025-08-14T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","YOLO"]
draft: false
---


This article summarizes the differences among the primary application directions of computer vision in the current AI field (image classification, image localization, object detection, image segmentation, semantic segmentation, instance segmentation) as well as the mainstream models existing in each application direction.


In the current field of computer vision, image classification, object detection, and image segmentation are the three most fundamental and rapidly developing domains.


## Image Classification


**The problem to be solved by the image classification task in the field of computer vision is: What is the category of the image contained within the image?** For example, in the image below, the image recognition task yields a result indicating that the image contains a dog:


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-1.png)


Therefore, for traditional image classification tasks, the recognition result corresponds to the category of the most prominent object in the image (such as the dog in the image above), and the entire picture is directly classified according to this most prominent object. Consequently, for image samples in classification tasks, there is generally a very prominent and easily classifiable salient object present. As shown in the sub-figures below, the category corresponding to each image (effectively the most prominent object contained within it) can be determined at a glance:


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-2.png)


Of course, it is very likely that an image submitted to the model for classification contains multiple relatively prominent objects to be recognized, such as an image containing both a dog and a cat simultaneously:


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-3.png)


For this type of image classification task, a Multi-Label Classifier is required. In fact, from the perspective of classification, machine learning classification algorithms can be divided into three types:

- Binary classification: Yes/No, True/False
- Multi-class Classification: Returns one from multiple categories
- Multi-Label Classification: Returns multiple from multiple categories

![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-4.png)


For Multi-Class and Multi-Label classification algorithms, the difference in the model's classification and recognition output is that Multi-Class outputs 1 category out of multiple, while Multi-Label outputs multiple categories out of multiple:


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-5.png)


**Regardless, the image classification task always focuses only on the categories of objects present in the image to be classified, and does not care about the locations or quantities of these objects in the image.**


Datasets used for model training in the field of image classification include: ImageNet, MNIST, CIFAR, etc.


Classic models in the field of image classification include:

- VGG, Visual Geometry Group at the University of Oxford
- GoogLeNet (Inception), Google
- ResNet, Microsoft Research
- EfficientNet, Google
- DenseNet, Cornell University
- MobileNet, Google

## Object Detection


If we need not only to identify the categories of objects in an image, but also to accurately locate their positions within the image, we need to use object detection tasks in computer vision.


As mentioned above, image classification applications merely assign a single label to an image through recognition. In contrast, object detection applications provide spatial coordinates (bounding boxes) and classification labels for each detected object in images and videos, making it possible to analyze and process visual data at a more granular level.

- The output of an image classification application is simply the label/labels of the objects contained in the image.
- The output of an object detection application must include the category labels of the objects contained in the image, as well as rectangular boxes marking the locations of those objects within the image.

If an image contains only a single most prominent target, and the application recognizes and locates this target, it is Image Localization. If an image contains many targets and the application must recognize and locate all of them, it is Object Detection:


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-6.png)


Classic models in the field of object detection include:


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-7.png)


## Image Segmentation


Image segmentation divides an image into distinct objects **at the pixel level** and distinguishes them using different color paint.


Image Segmentation applications can be further subdivided into Semantic Segmentation and Instance Segmentation. The differences between the two are:

- Semantic Segmentation: In the image segmentation process, all objects of the same category form a single class; therefore, all objects of the same category are colored with the same color.
- Instance Segmentation: During the image segmentation process, multiple different instances of the same category are treated as separate segments, meaning each object of the same class is considered distinct. Therefore, even if they belong to the same class, each independent object is painted with a different color.

The figure below is a typical example of semantic segmentation, where objects of different categories across the entire image are painted with different colors, but objects of the same category share the same color.


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-8.png)


The figure below is a typical example of instance segmentation. As can be seen, the three cats recognized in the image are segmented into distinct objects:


![image.png](/images/blog/计算机视觉类AI应用领域及其主流模型总结-9.png)


Mainstream models in the field of image segmentation:

- Mask R-CNN
- U-Net
- SegNet
- Deeplab
- PSPNet
- Vision Transformers (ViTs)

## References

- [What are tasks like image classification, object detection, semantic segmentation, and instance segmentation in artificial intelligence? - Zhihu](https://zhuanlan.zhihu.com/p/109999530)
- [Image Classification vs. Object Detection vs. Image Segmentation | by Pulkit Sharma | Analytics Vidhya | Medium](https://medium.com/analytics-vidhya/image-classification-vs-object-detection-vs-image-segmentation-f36db85fe81)
- [Object Detection Models - GeeksforGeeks](https://www.geeksforgeeks.org/computer-vision/object-detection-models/)
- [Image Segmentation Models - GeeksforGeeks](https://www.geeksforgeeks.org/computer-vision/image-segmentation-models/)