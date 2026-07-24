---
title: "Detailed Summary of the Calculation Flow of Softmax Classifier"
slug: "2025-09-07-the-calculation-flow-of-softmax-classification"
description: "The Softmax activation function is generally used for classifiers in multi-class classification problems. This article provides a detailed introduction and summary of the complete calculation flow for implementing neural network multi-class classifiers based on the Softmax activation function and the cross-entropy loss function.

In practical AI projects, multi-class classification problems are frequently encountered. The most typical examples are the MNIST handwritten digit recognition dataset, which classifies 10 handwritten digits from 0 to 9, and the ImageNet image dataset, which classifies 1,000 everyday objects. In the field of machine learning and artificial intelligence, the Softmax classifier is the most commonly used implementation for multi-class classification."
date: 2025-09-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---

The Softmax activation function is generally used for classifiers in multi-class classification problems. This article provides a detailed introduction and summary of the complete calculation flow for implementing neural network multi-class classifiers based on the Softmax activation function and the cross-entropy loss function.

In practical AI projects, multi-class classification problems are frequently encountered. The most typical examples are the MNIST handwritten digit recognition dataset, which classifies 10 handwritten digits from 0 to 9, and the ImageNet image dataset, which classifies 1,000 everyday objects. In the field of machine learning and artificialintelligence, the Softmax classifier is the most commonly used implementation for multi-class classification.

Softmax分类器的计算流程详细总结-Softmax多分类器.png

## Softmax Activation Function

**For multi-class classification applications in deep neural networks implemented via Softmax, the number of neurons in the fully connected layer at the very end of the network corresponds to the number of classes for the classification operation. The input to Softmax is the output of these neurons (known as logits), and the output of Softmax represents the probabilities of different classification decisions.**

The calculation flow of the Softmax operation is explained in detail below. Assume there are $n$ elements in array $a$:

$$
a=[a_1,a_2,...，a_n]
$$

The Softmax calculation flow for this array $a$ is as follows. First, take the exponential with base $e$ for each element in $a$ to obtain a new array $t$:

$$
t=[e^{a_1},e^{a_2},...,e^{a_n}]
$$

Next, sum all the elements in the array $t$ to obtain $s$:

$$
s=sum(t)=e^{a_1}+e^{a_2}+...+e^{a_n}
$$

Finally, divide each element in array $t$ by the $s$ calculated above to obtain a new array, which is the result of the Softmax calculation for $a$:

$$
softmax(a)=[\frac{e^{a_1}}{s},\frac{e^{a_2}}{s},...,\frac{e^{a_n}}{s}]
$$

Since $s$ is the sum of all elements in array $t$, the sum of all elements in the resulting Softmax output is 1, with each element corresponding to the recognition probability of that class for the multi-class classification output.

Therefore, the Softmax calculation flow is illustrated in the diagram below:

![image.png](/images/blog/Softmax分类器的计算流程详细总结-1.png)

The implementation code of the Softmax calculation flow in Python is as follows:

```python
import numpy as np

def softmax(x):
    t = np.exp(x)
    s = np.sum(t)
    return t / s

if __name__ == '__main__':
    x = np.array([1, 3, 5])
    print(softmax(x)) # [0.01587624 0.11731043 0.86681333]
    print(softmax(x).sum()) # 1.0
```

## One-Hot Encoding

One-hot encoding represents the probabilities corresponding to classification labels using only the numbers 0 and 1 in multi-class applications.

Taking three classification categories (dog, cat, and bird) as an example, these three categories can be represented in the label data as (1, 0, 0), (0, 1, 0), and (0, 0, 1) respectively:

![image.png](/images/blog/Softmax分类器的计算流程详细总结-2.png)

## Cross-Entropy Loss Function

In the implementation of deep network multi-class classifier applications, the Softmax activation function is generally applied to process the raw outputs of all neurons in the final fully connected layer to obtain the classification probabilities corresponding to each class. The loss function typically used for such applications is the cross-entropy loss function.

The expression of the cross-entropy loss function is shown in the diagram below:

![image.png](/images/blog/Softmax分类器的计算流程详细总结-3.png)

Here, $p(x)$ represents the one-dimensional vector of the training sample data represented in One-Hot encoding, where only the element corresponding to the correct class is 1, and all other elements are 0. $q(x)$ is the one-dimensional vector output after the deep network model's output is processed by Softmax, where each element corresponds to the model's predicted probability for each class.

Therefore, **the calculation of the cross-entropy loss function is essentially comparing the One-Hot classification results of the training sample labels with the classification prediction results for each class inferred by the model using the same sample. It determines how close the probability of the predicted correct class is to 1; the closer the predicted probability of the correct class is to 1, the smaller the loss function value.**

The Python code implementation of the cross-entropy function is as follows:

```python
def categorical_cross_entropy(y, y_hat):
    n_classes = len(y)
    loss = 0
    for i in range(n_classes):
        loss += - y[i] * np.log(y_hat[i])
    return loss

if __name__ == '__main__':
    y = [0,0,1]
    y_hat_1 = [0.1,0.1,0.8]
    y_hat_2 = [0.1,0.3,0.6]

    print(categorical_cross_entropy(y, y_hat_1)) # 0.2231435513142097
    print(categorical_cross_entropy(y, y_hat_2)) # 0.5108256237659907
```

As can be seen, the higher the probability corresponding to the correct class 2 in the predicted output (0.8 vs 0.6), the smaller the calculated result of the cross-entropy loss function.

## Implementation of the Softmax Classifier

> Multi-class application: The output of the final fully connected layer is processed using the Softmax activation, the training sample labels are encoded using One-Hot Encoding, and the loss function uses Cross Entropy.

The diagram below summarizes the calculation flow of the deep neural network implementing a multi-class classifier based on the Softmax activation function and the cross-entropy loss function.

![image.png](/images/blog/Softmax分类器的计算流程详细总结-4.png)

- The final fully connected layer of the deep neural network receives the input feature variables $x_m$ from the previous fully connected layer, performs a multiply-add operation with the weight coefficients $w_{m,k}$ and bias variables $b_k$ of the final layer, and obtains the net outputs of each neuron in the final layer.
- The net outputs of the neurons in the final layer, treated as a complete one-dimensional vector, undergo the Softmax operation to output the probability prediction list $t_k$ for each classification inference.
- The multi-class prediction output $t_k$ from the deep neural network is compared with the sample labels encoded in One-Hot encoding mode, and the loss is calculated using the Cross Entropy loss function.
- Based on the output of the cross-entropy loss function, backpropagation is performed to adjust the parameters at all levels of the entire network.

**In summary, compared to other activation functions (such as Sigmoid, Tanh, ReLU, etc.), the biggest difference in the calculation flow of the Softmax activation function is that other activation functions perform non-linear transformations on the multiply-add output of each individual neuron, whereas the Softmax activation function performs calculations across the multiply-add outputs of all neurons in the final layer simultaneously.**

## References

- "Python Deep Learning and Project Practice", Chapter 3: Softmax Multi-class Classifier
- [Learning Softmax Regression using TensorFlow | by Leo Chiu | Handwriiten Notes | Medium](https://medium.com/%E6%89%8B%E5%AF%AB%E7%AD%86%E8%A8%98/%E4%BD%BF%E7%94%A8-tensorflow-%E5%AD%B8%E7%BF%92-softmax-%E5%9B%9E%E6%AD%B8-softmax-regression-41a12b619f04)
- [Cross Entropy Loss: Intro, Applications, Code](https://www.v7labs.com/blog/cross-entropy-loss-guide)