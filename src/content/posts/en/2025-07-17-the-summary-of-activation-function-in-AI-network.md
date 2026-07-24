---
title: "An Overview of Commonly Used Activation Functions in Deep Learning Neural Network Architectures"
slug: "2025-07-17-the-summary-of-activation-function-in-AI-network"
description: "This article provides a detailed study and summary of commonly used activation functions in deep learning neural networks, organizing their characteristics and applicability to facilitate the future understanding of various deep neural network architectures."
date: 2025-07-17T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","LLM"]
draft: false
---

This article provides a detailed study and summary of commonly used activation functions in deep learning neural networks, organizing their characteristics and applicability to facilitate the future understanding of various deep neural network architectures.

## What is an Activation Function?

The architecture of a typical neuron in a neural network is shown in the figure below:

![image.png](/images/blog/盘点深度学习神经网络架构中的常用激活函数-1.png)

- The inputs of the input layer $[X_1,X_2,X_3,X_4]$ are multiplied by their respective weight parameters $[W_1,W_2,W_3,W_4]$, accumulated, and then added to the bias parameter of the neuron. This constitutes the input signal of the neuron.
- During internal processing, the neuron takes the above input signal as a parameter and executes its activation function $f(x)$. The output of the activation function serves as the output of the neuron.

Therefore, the so-called activation function of a neuron is essentially a non-linear mapping and transformation performed by the ganglion on the weighted sum of input signals. Through the mapping of the activation function, the computational output of the neural network can approximate any complex function (such as curved boundary segmentation or multi-target overlapping detection), solving complex problems in practical applications.

### Why Are Activation Functions Needed?

Without activation functions, regardless of the number of layers in a neural network, its output is merely a linear combination of the inputs. This makes it equivalent to a single-layer perceptron, rendering the number of layers (the so-called depth) meaningless. The problem that activation functions solve is the mapping from a linear space to a non-linear space.

> _Without activation functions, no matter how many layers a neural network has, its output is ultimately a linear transformation of the input data, making it incapable of handling complex non-linear problems. However, the problems we need to solve in real life are basically non-linear. By introducing non-linear mappings, activation functions enable neural networks to approximate arbitrarily complex non-linear functions._

## Step Function

The step function is the activation function used by perceptrons in the early days of neural network development. The step function uses a threshold (usually 0) as a boundary to output binary values: when the input is greater than or equal to 0, the step function outputs 1; otherwise, it outputs 0.

$$
f(x) = 
\begin{cases} 
  0       & \text{when } x < 0 \\
  1    & \text{when } x \ge 0
\end{cases}
$$

Its graph is shown below:

![image.png](/images/blog/盘点深度学习神经网络架构中的常用激活函数-2.png)

Main characteristics of the step activation function:

- Its output jumps in a step-like manner, being discontinuous at $x=0$ and forming an obvious "breakpoint."
- Its output range has only two states, 0 and 1 (corresponding to all-or-nothing situations), and cannot express intermediate states or probabilistic information. Therefore, it is relatively suitable for binary classification tasks.
- Because it forms a discontinuity at $x=0$, it cannot be differentiated (calculating derivatives requires the function to change smoothly in a local interval). Consequently, it cannot be used with gradient descent (which relies on calculating partial derivatives of the activation function) or backpropagation to train parameters.
> Imagine that when using a step function as an activation function, minor modifications to weights and biases in the neural network might completely flip the output, thereby causing complex and dramatic changes in how the neural network processes other input data. Therefore, in this case, it is difficult to optimize the accuracy of the neural network by gradually modifying the network's weights and bias parameters.

Because of characteristics such as having only two values in its output range and being non-differentiable, the step function is no longer used in the hidden layers of mainstream networks. It only finds limited applications in fields like theoretical teaching (perceptrons) and lightweight binary classification systems in embedded systems.

The Python implementation of the step function is as follows:

```python
def step_function(x):
	return np.array(x > 0, dtype=np.int)
```

## Sigmoid Function

The Sigmoid function, also known as the Logistic function, is an S-shaped curve function. It is one of the classic activation functions in neural networks, and has been widely used especially in **early deep learning and binary classification tasks**.

The mathematical expression of the Sigmoid function is as follows:

$$
h(x)=\frac{1}{1+e^{-x}}=\frac{1}{1+exp(-x)}
$$

Its graph is shown below:

![image.png](/images/blog/盘点深度学习神经网络架构中的常用激活函数-3.png)

> As seen from the graphical comparison, the Sigmoid activation function is similar to the step activation function; however, when using the Sigmoid activation function, minor changes in weights and biases will only cause minor changes in the output. This point is crucial for neural networks using sigmoid as an activation function to properly learn and adjust their parameters.

The main characteristics of the Sigmoid activation function are summarized as follows:

- Similar to the step function, the output value ranges between 0 and 1, and it is point-symmetric at the point $(0, 0.5)$, making it very suitable for representing probabilities.
- Strictly monotonically increasing as the input $x$ increases; the output approaches 1 as the input increases, and approaches 0 as it decreases.
- The curve is smooth and continuously differentiable everywhere, allowing successive approximation of extreme values through subsequent gradient descent.

The Sigmoid activation function was widely used in the early stages of neural network development, but due to numerous drawbacks, it is rarely used in current neural network architectures:

- Vanishing gradient problem. As can be seen from the Sigmoid graph above, when the input is greater than 5 or less than -5, the entire graph becomes almost flat, and the derivative approaches 0. This causes parameters to fail to update during the process of seeking the extreme values of the loss function using gradient descent, leading to training stagnation. This is especially pronounced when the network has many layers.
- Non-zero-centered problem. The output range of Sigmoid is between 0 and 1, and it is strictly monotonically increasing with the gain of input $x$. Therefore, regardless of the input, its output is always greater than 0. This restricts the direction of subsequent gradient-based parameter adjustments, causing the adjustment direction to oscillate back and forth, resulting in a convergence speed significantly lower than zero-centered activation functions (such as Tanh).
- High computational cost. Because it involves exponential operations, its computational cost is too high compared to modern activation functions like ReLU, dragging down training speed.

The Python implementation of the Sigmoid function is as follows:

```python
def sigmoid(x):
	return 1 / (1 + np.exp(-x))
```

## Tanh Function

The Tanh function, also known as the hyperbolic tangent function, can be considered a variant of the Sigmoid function (essentially, Tanh is a zero-centered improvement of Sigmoid). The biggest difference from the Sigmoid function is that the Tanh function ranges monotonically from -1 to 1 and has a zero mean. The mathematical expression of the Tanh function is:

$$
Tanh(x)=\frac{sinh(x)}{cosh(x)}=\frac{e^x-e^{-x}}{e^x+e^{-x}}
$$

Although its mathematical expression looks complex, its graph is very similar to Sigmoid. The graph of the Tanh function is shown below:

![image.png](/images/blog/盘点深度学习神经网络架构中的常用激活函数-4.png)

The main characteristics of the Tanh activation function are summarized as follows:

- The output range is between -1 and 1, and it is symmetric about the origin ($tanh(-x)=-tanh(x)$), which avoids the non-zero-centered problem of Sigmoid, making the input distribution of subsequent layers more balanced (no longer constantly positive) and thus accelerating the convergence of gradient descent.
- Like Sigmoid, the output increases monotonically and smoothly as the input increases, and the function is differentiable everywhere.
- In terms of gradient variation, compared to Sigmoid, the gradient is larger for the same input, which alleviates the vanishing gradient problem to a certain extent.

In summary, the Tanh function solves the non-zero-centered problem of Sigmoid, can accelerate the parameter training process based on gradient descent, and alleviates the vanishing gradient problem to some extent (though it still exists when the input deviates too far from 0). However, because it requires exponential calculations, the problem of excessively high computational cost remains.

The Python implementation of the Tanh function is as follows (in fact, numpy already has its own implementation of the tanh function):

```python
def tanh_manual(x):
	# Handle numerical stability for large absolute values
	safe_x = np.where(x > 100, 100, np.where(x < -100, -100, x))
	return (np.exp(safe_x) - np.exp(-safe_x)) / (np.exp(safe_x) + np.exp(-safe_x))
```

## ReLU Function

While Sigmoid was a widely used activation function in the early days of neural network development, the most widely used activation function in the deep learning era is ReLU (Rectified Linear Unit).

When the input is greater than 0, the ReLU function outputs the original value directly; when the output is less than 0, it returns 0 directly. Its output range is from 0 to positive infinity, and its mathematical expression is:

$$
f(x) = max(0,x)=
\begin{cases} 
  0       & \text{when } x < 0 \\
  x    & \text{when } x \ge 0
\end{cases}
$$

The graph of the ReLU function is shown below:

![image.png](/images/blog/盘点深度学习神经网络架构中的常用激活函数-5.png)

The main characteristics of the ReLU activation function are summarized as follows:

- Piecewise linear. The positive region remains linear with a constant gradient of 1, while the negative region is forced to zero.
- Computationally efficient. This is the biggest advantage of ReLU. It does not require any trigonometric or exponential operations, and its calculation speed is more than 10 times faster than Sigmoid and Tanh.
- Sparse activation. When the input is negative, the output is 0, at which point the neuron is in an inactive state. This is equivalent to allowing only some critical neurons to be active, forcing the entire network to prioritize the most important features.
- Solves the vanishing gradient problem. The gradient is constantly 1 in the positive region, which can be used to support ultra-deep networks. Moreover, the linear positive region avoids saturation, leading to larger gradient update magnitudes and a significantly faster convergence rate.

The biggest problem with ReLU is the dying ReLU problem. This refers to the phenomenon where certain neurons may permanently fail when using the ReLU activation function. During training, when a neuron's weight update causes its input to be constantly negative, the output of ReLU is constantly 0, and the gradient is also 0. This causes the neuron to no longer update its parameters and remain in a state of practical permanent failure. When the proportion of dead neurons in the model is large, it will significantly affect the working performance and accuracy of the entire network.

The Python implementation of the ReLU function is as follows:

```python
def relu(x):
	return np.maximum(0, x)
```

### Leaky ReLU

Leaky ReLU (Leaky Rectified Linear Unit) is an improved version of the ReLU activation function designed to solve the aforementioned dying ReLU problem. Leaky ReLU introduces a small positive slope $a$ (typically 0.01) for the negative region:

$$
f(x) = 
\begin{cases} 
  ax       & \text{when } x < 0 \\
  x    & \text{when } x \ge 0
\end{cases}
$$

Therefore, in the negative region, Leaky ReLU is no longer constantly 0, but a straight line with a slope of $a$, and its value range also becomes negative infinity to positive infinity.

![image.png](/images/blog/盘点深度学习神经网络架构中的常用激活函数-6.png)

The design above can effectively solve the dying ReLU problem: the negative-region slope $\alpha$ retains a tiny gradient, ensuring that weights can still be updated during backpropagation.

In addition, Leaky ReLU maintains the advantage of high computational efficiency. Its calculation requires only a single multiplication and comparison, and its computational complexity is similar to that of ReLU, which is far lower than the exponential operations of Sigmoid/Tanh.

## Softmax Function

The Softmax function is the core activation function used in neural networks to handle **multi-class classification tasks** (such as recognition classification tasks on the MNIST handwritten digit dataset). Its core role is to convert the raw outputs of a neural network into a probability distribution, making the probability values of each category non-negative and summing up to 1.

The primary function of the Softmax function is probability conversion for multi-class classification. Its input is a multi-class vector array $z=[z_1, z_2 ... z_K]$ (with a total of $K$ category outputs), and its corresponding mathematical expression is:

$$
\sigma(z)_i=\frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}
$$

In the softmax expression above, the numerator takes the exponent of the input $z_i$ for the $i$-th class to amplify the differences among categories; the denominator takes the sum of the exponents of all category inputs to achieve normalization, ensuring that the sum of the total output probabilities is 1.

![image.png](/images/blog/盘点深度学习神经网络架构中的常用激活函数-7.png)

The main characteristics of the Softmax activation function are summarized as follows:

- Probability normalization. The output values corresponding to all inputs range between 0 and 1, and the sum of all outputs is 1, satisfying the axioms of probability, which makes it very suitable for classification decisions.
- Amplification of differences. Through the exponential function in softmax calculations, the output weights of high inputs can be significantly amplified, making the model perform more decisively on high-confidence categories in the output and reducing ambiguous predictions.
- The Softmax activation function combined with the cross-entropy loss function is the standard combination for classification tasks, featuring efficient gradient calculation and fast convergence.

The Python implementation of the Softmax function is as follows:

```python
import numpy as np

def softmax(z):
    z_shifted = z - np.max(z)  # Subtract the maximum value for numerical stability optimization
    exp_z = np.exp(z_shifted)
    return exp_z / np.sum(exp_z)

# Example
logits = np.array([2.0, 1.0, 0.1])
probs = softmax(logits)  # Output: [0.659, 0.242, 0.099]
```

## References

- [Activation Functions in Neural Networks, Their Respective Pros and Cons, and How to Choose an Activation Function - CSDN Blog](https://blog.csdn.net/qq_40765537/article/details/106086418#:~:text=1.%E4%BB%80%E4%B9%88%E6%98%AF%E6%BF%80%E6%B4%BB%E5%87%BD%E6%95%B0%EF%BC%9F%20%E6%89%80%E8%B0%93%E6%BF%80%E6%B4%BB%E5%87%BD%E6%95%B0%EF%BC%88Activation%20Function%EF%BC%89%EF%BC%8C%E5%B0%B1%E6%98%AF%E5%9C%A8%E4%BA%BA%E5%B7%A5%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%E7%9A%84%E7%A5%9E%E7%BB%8F%E5%85%83%E4%B8%8A%E8%BF%90%E8%A1%8C%E7%9A%84%E5%87%BD%E6%95%B0%EF%BC%8C%E8%B4%9F%E8%B4%A3%E5%B0%86%E7%A5%9E%E7%BB%8F%E5%85%83%E7%9A%84%E8%BE%93%E5%85%A5%E6%98%A0%E5%B0%84%E5%88%B0%E8%BE%93%E5%87%BA%E7%AB%AF%E3%80%82%20%E6%BF%80%E6%B4%BB%E5%87%BD%E6%95%B0%E5%AF%B9%E4%BA%8E%E4%BA%BA%E5%B7%A5%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%E6%A8%A1%E5%9E%8B%E5%8E%BB%E5%AD%A6%E4%B9%A0%E3%80%81%E7%90%86%E8%A7%A3%E9%9D%9E%E5%B8%B8%E5%A4%8D%E6%9D%82%E5%92%8C%E9%9D%9E%E7%BA%BF%E6%80%A7%E7%9A%84%E5%87%BD%E6%95%B0%E6%9D%A5%E8%AF%B4%E5%85%B7%E6%9C%89%E5%8D%81%E5%88%86%E9%87%8D%E8%A6%81%E7%9A%84%E4%BD%9C%E7%94%A8%E3%80%82%20%E5%AE%83%E4%BB%AC%E5%B0%86%E9%9D%9E%E7%BA%BF%E6%80%A7%E7%89%B9%E6%80%A7%E5%BC%95%E5%85%A5%E5%88%B0%E6%88%91%E4%BB%AC%E7%9A%84%E7%BD%91%E7%BB%9C%E4%B8%AD%E3%80%82%20%E5%A6%82%E5%9B%BE%EF%BC%8C%E5%9C%A8%E7%A5%9E%E7%BB%8F%E5%85%83%E4%B8%AD%EF%BC%8C%E8%BE%93%E5%85%A5%EF%BC%88inputs%20%EF%BC%89%E9%80%9A%E8%BF%87%E5%8A%A0%E6%9D%83%EF%BC%8C%E6%B1%82%E5%92%8C%E5%90%8E%EF%BC%8C%E8%BF%98%E8%A2%AB%E4%BD%9C%E7%94%A8%E5%9C%A8%E4%B8%80%E4%B8%AA%E5%87%BD%E6%95%B0%E4%B8%8A%EF%BC%8C%E8%BF%99%E4%B8%AA%E5%87%BD%E6%95%B0%E5%B0%B1%E6%98%AF%E6%BF%80%E6%B4%BB%E5%87%BD%E6%95%B0%E3%80%82)
- [Comprehensive Analysis of Activation Functions - CSDN Blog](https://blog.csdn.net/wireless_com/article/details/127045934)