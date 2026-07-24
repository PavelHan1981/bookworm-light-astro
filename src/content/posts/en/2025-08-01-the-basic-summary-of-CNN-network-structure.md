---
title: "Introduction to Convolutional Neural Network (CNN) Architecture"
slug: "2025-08-01-the-basic-summary-of-CNN-network-structure"
description: "Based on online resources, this article provides a detailed analysis and summary of the architecture, data calculation, and transmission process of a simple Convolutional Neural Network (CNN), serving as a foundation for understanding CNN architectures."
date: 2025-08-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---

Based on online resources, this article provides a detailed analysis and summary of the architecture, data calculation, and transmission process of a simple Convolutional Neural Network (CNN), serving as a foundation for understanding CNN architectures.

The most typical characteristic in the design of various network layers in a Convolutional Neural Network (CNN) architecture is the addition of convolutional layers and pooling layers to the classic neural network structure. For the operational logic and workflow of CNN convolution and pooling layers, please refer to the detailed summary in [Detailed Explanation of Convolution and Pooling Calculations in Convolutional Neural Networks](https://www.pavelhan.tech/article/2025-07-15-the-summary-of-calculation-workflow-in-CNN).

## Overall Architecture Design of Convolutional Neural Networks (CNN)

For artificial intelligence development in fields such as computer vision, image recognition, and image object detection, Convolutional Neural Networks (CNNs) are an almost unavoidable topic. Therefore, to understand AI model algorithms and parameter training in these fields, one must first have a clear understanding of the overall architectural design of CNNs, the functions of each layer, and the data calculation and transmission workflow.

The following figure shows a typical image recognition model based on a convolutional neural network: images are input from the input layer on the left, undergo a series of processing steps, and finally output results in the form of recognition probabilities at the output layer.

![cnn_banner.png](/images/blog/卷积神经网络CNN的架构解析入门-1.png)

From the overall network structure, it can be seen that the **entire network above can be divided into two parts: the feature extraction part and the image classification part**.

The structure of the feature extraction part is very regular. After 2D images are input from the input layer, they undergo convolution calculation (Convolution), followed by processing the convolution output with the ReLU activation function, and then pooling operations (Pooling). The convolution-ReLU activation-pooling process is repeated multiple times until a Flatten operation converts the multi-dimensional vectors into a one-dimensional vector for subsequent classification operations.

The image classification part is based on the 1D feature vectors extracted by the feature extraction part and converted via the Flatten operation. It implements image classification tasks using multiple fully connected layers, ultimately using Softmax as the activation function of the final output layer to output the probabilistic recognition results of the image classification.

> Compared to ordinary fully connected neural network structures, using convolutional neural networks for image data has inherent advantages. This is because fully connected neural networks do not consider the spatial structure of image data when inputting and processing data; for example, they treat distant and closely adjacent pixels equally, thus having to infer and learn the spatial structure inherent in the pixels solely from subsequent training data. In contrast, convolutional neural networks directly input and process data as 2D images, naturally accounting for the spatial structure between different pixel locations. Therefore, they are extremely suitable for 2D data structures such as images, enabling faster training and inference.

The processing workflows of each layer are summarized in detail below in the order of the complete network structure execution.

## Convolutional Layer

The primary role of the convolutional layer is to extract feature data from images, and subsequent classification layers distinguish and classify different images based on the feature data extracted by the convolutional layer.

The operation of the convolutional layer is shown in the animated diagram below. The original image or the feature map from the previous layer is scanned using a convolution kernel as a unit. Depending on whether the input for the convolution calculation is a single-channel image or a multi-channel image/feature map, planar convolution kernels or volumetric convolution kernels are used respectively to perform convolution calculations on multi-dimensional data. The article [Detailed Explanation of Convolution and Pooling Calculations in Convolutional Neural Networks](https://www.pavelhan.tech/article/2025-07-15-the-summary-of-calculation-workflow-in-CNN) provides a very detailed summary of how to perform planar and volumetric convolution calculations and can be referenced for further reading.

![image.png](/images/blog/卷积神经网络CNN的架构解析入门-2.png)

A complete scan (convolution calculation) of the input image/feature map using a single convolution kernel yields a new feature map. The number of convolution kernels determines the number of scans executed and the number of new feature maps output for subsequent pooling operations. For example, the figure below uses 16 independent convolution kernels to perform convolution operations on the input image data, generating 16 feature maps:

![image.png](/images/blog/卷积神经网络CNN的架构解析入门-3.png)

As mentioned above, the results of the convolution calculation must also be processed using the ReLU activation function before being passed to the next step for pooling operations. By applying the ReLU activation function to every pixel of the convolution calculation result, negative values are filtered out while preserving the shapes of the objects in the image.

![image.png](/images/blog/卷积神经网络CNN的架构解析入门-4.png)

## Pooling Layer

The pooling operation in a convolutional neural network is used to reduce the dimensionality of the feature map data extracted by the convolutional layer. Its purpose is to reduce the amount of data while retaining salient features, thereby lowering the parameter data volume of the CNN as well as the computational cost of training and inference.

The calculations performed by pooling are very simple. It only requires scanning the feature maps output by the previous convolutional layer in units of $n \times n$ using Max Pooling (selecting and outputting the maximum value) and Average Pooling (averaging all values). The stride after each scan is $n$, and it does not overlap with the previous scan (**this is distinctly different from the convolution operation**). Therefore, the final scanning result is a downscaled feature map reduced by a factor of $n$ in both horizontal and vertical directions.

Taking the figure below as an example, the feature map output by the preceding convolutional layer has a resolution of $4 \times 4$. The pooling operation scans the feature map in $2 \times 2$ blocks, and the final result of the pooling operation is a downscaled $2 \times 2$ feature map.

![image.png](/images/blog/卷积神经网络CNN的架构解析入门-5.png)

The pooling operation performs the aforementioned pooling calculations on a single feature map basis. Therefore, however many feature maps the preceding convolutional layer outputs, the pooling layer will output an equal number of downscaled feature maps.

For detailed pooling operations, please refer to the article [Detailed Explanation of Convolution and Pooling Calculations in Convolutional Neural Networks](https://www.pavelhan.tech/article/2025-07-15-the-summary-of-calculation-workflow-in-CNN).

## Flatten

As mentioned above, whether it is the convolutional layer or the pooling layer, their outputs can be considered as multiple 2D feature maps. After convolution and pooling processing, the CNN next converts the feature maps extracted in the previous stage into 1D data to facilitate processing in subsequent stages. This action of converting feature maps into 1D data is called Flatten.

The processing in the Flatten stage is very straightforward: it simply unfolds the 2D feature maps from top to bottom and left to right:

![image.png](/images/blog/卷积神经网络CNN的架构解析入门-6.png)

Of course, generally speaking, the output of the final pooling layer typically contains multiple feature maps. For such multi-feature-map Flatten operations, the first feature map is converted into a 1D format, and subsequent feature maps are sequentially unfolded right behind this 1D data in the same manner. Regardless, multiple feature maps are ultimately converted into a single 1D data sequence through the Flatten operation for subsequent classification operations.

![image.png](/images/blog/卷积神经网络CNN的架构解析入门-7.png)

## Recognition Layer

As mentioned above, after the Flatten operation, the multi-dimensional feature vectors detected in the convolutional and pooling layers are converted into 1D vectors for image classification tasks.

Compared to ordinary artificial neural network structures, the network in this recognition layer has nothing particularly special; it simply consists of multiple fully connected layers stacked with a final Softmax output layer:

![image.png](/images/blog/卷积神经网络CNN的架构解析入门-8.png)

The fully connected layer network portion in the CNN architecture takes the feature vectors extracted by the preceding convolution and pooling stages as input, utilizing a network composed of multiple fully connected layers to implement image classification functionality. The final layer of the fully connected layers uses the Softmax activation function to output the recognition results of the image for various categories in the form of probabilities.

Looking at the overall architecture of the CNN network above, the primary training parameters contained within the entire network are the convolution kernel weight parameters of the various convolutional layers in the feature extraction part, and the weight and bias parameters between the layers of the fully connected layers in the image classification part. During the training process of image recognition functions using the CNN network structure, based on the output of the network's final Softmax activation function and the training sample labels, the cross-entropy function is used as the loss function to train the convolution kernel weight parameters as well as the fully connected layer weight and bias parameters, until the network can output stable and correct recognition judgment results for input images.

- For content regarding deep learning activation functions and loss functions, you can refer to [Overview of Common Activation Functions in Deep Learning Neural Network Architectures](https://www.pavelhan.tech/article/2025-07-17-the-summary-of-activation-function-in-AI-network) and [Overview of Common Loss Functions in Deep Learning Neural Network Architectures](https://www.pavelhan.tech/article/2025-07-19-the-summary-of-lost-function-in-AI-network).

## References

- [Convolutional Neural Network | Deep Learning | Developers Breach](https://developersbreach.com/convolution-neural-network-deep-learning/)
- [Flattening CNN layers for Neural Network and basic concepts | by Muhammad Shoaib Ali | Medium](https://medium.com/@muhammadshoaibali/flattening-cnn-layers-for-neural-network-694a232eda6a)
- [[資料分析&機器學習] 第5.1講: 卷積神經網絡介紹(Convolutional Neural Network) - JamesLearningNote - Medium](https://medium.com/jameslearningnote/%E8%B3%87%E6%96%99%E5%88%86%E6%9E%90-%E6%A9%9F%E5%99%A8%E5%AD%B8%E7%BF%92-%E7%AC%AC5-1%E8%AC%9B-%E5%8D%B7%E7%A9%8D%E7%A5%9E%E7%B6%93%E7%B6%B2%E7%B5%A1%E4%BB%8B%E7%B4%B9-convolutional-neural-network-4f8249d65d4f)