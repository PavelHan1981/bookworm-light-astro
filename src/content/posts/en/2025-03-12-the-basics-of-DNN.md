---
title: "AI Course for Non-Professionals 1: Introduction to Deep Neural Network Learning"
slug: "2025-03-12-the-basics-of-DNN"
description: "The goal of this series of articles is to understand the basic concepts of AI and large models in application from the perspective of non-AI professionals. By gaining an in-depth understanding and clarification of these concepts, we aim to build a knowledge structure regarding the working mechanism, workflow, and application framework of large models, ultimately helping us better utilize AI in our daily lives and work."
date: 2025-03-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory"]
draft: false
---

The goal of this series of articles is to understand the basic concepts of AI and large models in application from the perspective of non-AI professionals. By gaining an in-depth understanding and clarification of these concepts, we aim to build a knowledge structure regarding the working mechanism, workflow, and application framework of large models, ultimately helping us better utilize AI in our daily lives and work.

## Deep Neural Networks Form the Foundation of All AI Models

Currently, almost all popular AI applications and their models are based on deep neural network topologies. As shown in the figure below, a deep neural network can be divided into three hierarchical layers: the input layer, a large number of intermediate hidden layers (which is why it is called a "deep" network), and the final output layer.

![image.png](/images/blog/非专业人士的AI课1：-1.png)

Every node in a neural network is a neuron. The calculation performed by each neuron can generally be broken down into the following two steps:

- Step 1: Perform a multiply-accumulate operation on all nodes from the previous layer using different weighting factors (Weights, such as the multiple $w$ parameters in the figure below), and then add different biases (bias, such as the $b$ parameter in the figure below) to the result to obtain the intermediate output of the first step.
- Step 2: Take the calculation result from the first step as the input and process it through an activation function (i.e., function $f$ in the figure below). There are several commonly used activation functions in current neural networks, and their output ranges depend on the specific type of activation function used. Different activation functions have different output ranges, with most continuous-valued activation functions outputting floating-point data between (-1, 1) or (0, 1).

![image.png](/images/blog/非专业人士的AI课1：-2.png)

## Parameter Count in Deep Neural Networks

**In deep neural networks, the number of parameters we refer to typically represents the total number of connection weights and biases between neurons, rather than the number of neurons themselves (i.e., the $w$ and $b$ parameters in the figures above).**

Below is a simple example of how to calculate the parameter count. Suppose we have a simple fully connected neural network with the following structure: $n$ neurons in the input layer, $m$ neurons in a single hidden layer, and $k$ neurons in the output layer.

From the input layer to the hidden layer:

- Number of weights: $n \times m$ (every input neuron connects to every hidden neuron)
- Number of biases: $m$ (each hidden neuron has one bias)
- Total parameters: $n \times m + m$

From the hidden layer to the output layer:

- Number of weights: $m \times k$ (every hidden neuron connects to every output neuron)
- Number of biases: $k$ (each output neuron has one bias)
- Total parameters: $m \times k + k$

Therefore, the total parameter count for the entire network is: $\text{Total Parameters} = (n \times m + m) + (m \times k + k)$.

![image.png](/images/blog/非专业人士的AI课1：-3.png)

Whether it is large language models like ChatGPT or object detection and classification models like YOLO, their implementations are essentially based on the deep neural network structures described above. Looking at this deep neural network architecture—whether during training in development or inference after deployment—data is fed into the input layer, processed and passed through the intermediate hidden layers, and finally output at the output layer. The primary operations involved are massive multiply-accumulate computations among neurons across various layers. Consequently, the larger the model, the more layers it has, and the more parameters it contains, the computation required for a single pass increases exponentially. This is why the training and inference of most large models demand substantial computing power (compute).

- **It can be considered that the massive amount of knowledge learned by an LLM (Large Language Model) is stored within the parameters of the neurons across all layers.**