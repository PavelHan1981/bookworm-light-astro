---
title: "Summary of Common Loss Functions in Deep Learning Neural Network Architectures"
slug: "2025-07-19-the-summary-of-lost-function-in-AI-network"
description: "This article provides a detailed study and summary of commonly used loss functions in deep learning neural networks, organizing the characteristics and applicability of various loss functions to facilitate the future understanding of architectural designs in various deep neural networks."
date: 2025-07-19T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","LLM"]
draft: false
---


This article provides a detailed study and summary of commonly used loss functions in deep learning neural networks, organizing the characteristics and applicability of various loss functions to facilitate the future understanding of architectural designs in various deep neural networks.


## Definition of Neural Network Loss Functions


The so-called loss function can be regarded as an evaluation metric that characterizes the performance of the current neural network. In other words, it measures to what extent the processing result of the input data by the current neural network is inconsistent with the actual ground-truth result. Therefore, a smaller value of the loss function indicates better performance. **The goal of a neural network during the training process is to find the parameters (weights and biases of the neural network) that minimize the loss function.**


For example, as illustrated in the simple diagram below, we hope to train a neural network to fit a straight line $f(x)$ that reflects, to the greatest extent possible, the correspondence between a given sample data input $x$ and its corresponding output $y$. Later, based on this line and a new input $x$, we can find its corresponding $y$. Then, how do we evaluate how well this line fits the sample data? The answer is to use a loss function for evaluation.


In the figure below, the loss function is the sum of the differences $(f(x)-y)$ between $y$ and the corresponding output $f(x)$ of the fitted line across all training sample data. For all training sample data, a larger accumulated sum of differences indicates a larger loss function and a poorer fit; conversely, a smaller loss function indicates a better fit.


![image.png](/images/blog/盘点深度学习神经网络架构中的常用损失函数-1.png)

> There are two methods to calculate the difference between each sample point and the fitted line in the above figure. One is to use the absolute value of the difference $|f(x)-y|$. The other is the squared distance $(f(x)-y)^2$ (i.e., using the Mean Squared Error as the loss function). The latter is generally used because during subsequent parameter learning, we need to calculate the derivative of the loss function, and the derivative of a squared term is simpler to compute compared to an absolute value.

### Why Do We Need Loss Functions?


Taking the image classification task as an example, we are often puzzled: since the goal of training neural network parameters is to enable it to classify images more accurately, the most direct indicator for evaluating neural network performance is naturally the success rate of image classification and recognition. Why do we still need to introduce an additional loss function metric?


The main reason is that the neural network structures in practical application scenarios are often very complex, with a large number of layers and parameters. In this case, minor modifications to the network weights and parameters during each training iteration will not produce a noticeable change in the number of images correctly classified after being fed into the neural network for learning and training. Consequently, the next step regarding how to adjust the network weights and other parameters would lose its guiding direction. Therefore, **in practical neural network parameter learning, a more refined and smooth loss function in terms of output metric evaluation is required to assess the effect produced by each minor parameter adjustment, thereby determining the direction for the next parameter adjustment.**


## Mean Squared Error (MSE)


Mean Squared Error (MSE) is one of the most core loss functions in machine learning and statistics, making it particularly suitable for regression tasks (training models based on historical data to predict outputs corresponding to new input data).


Mathematically, the definition of Mean Squared Error is as follows:


$$
MSE=\frac{1}{n}\sum_{i=1}^{n} (y_i-\hat y_i)^2
$$


Where $n$ is the number of samples, $y_i$ is the true value corresponding to the $i$-th training sample, and $\hat y_i$ is the predicted value calculated by the current model parameters for the input of the $i$-th training sample.


Thus, $(y_i-\hat y_i)$ is the prediction error for each sample. By calculating it with the formula above, we obtain the arithmetic mean of the squared prediction errors across all samples, thereby reflecting the average error intensity of the model over the entire training dataset.


Example Python implementation code for training Mean Squared Error is shown below:


```python
import numpy as np
def mse(y_true, y_pred):
    return np.mean((np.array(y_true) - np.array(y_pred)) ** 2)

# Example
y_true = [3, 5, 2, 7]
y_pred = [2.8, 4.9, 2.1, 7.2]
print(mse(y_true, y_pred))  # Output: 0.0525
```


## Cross-Entropy Loss


Cross-entropy loss is primarily used to evaluate the difference between the true probability distribution $p$ provided by the sample data and the predicted probability distribution $q$ output by the model. Its calculation formula is as follows:


$$
L =-\sum_{i=1}^{C} y(x_i)log q(x_i)
$$


Where:

- $C$: Represents the total number of output categories of the model. For example, in handwritten character recognition, the recognition results are digits 0-9, so the total number of output categories $C$ is 10.
- $y(x_i)$: Represents the true probability that the current training sample belongs to category $i$, typically represented using one-hot encoding.
- $q(x_i)$: Represents the probability output by the current model that the predicted data belongs to category $i$, where the sum of probabilities across all categories is 1, meaning $\sum q(x_i)=1$.
> The so-called one-hot encoding is an array where only the label of the correct answer is 1, and all others are 0. For example, the one-hot encoding corresponding to the true probability of a handwritten digit 6 training sample is [0,0,0,0,0,0,1,0,0,0], where only the index position corresponding to the digit 6 has a probability of 1, and all others are 0.

Therefore, for multi-classification tasks, if the true probabilities of the current training samples use one-hot encoding, it actually means that during the cross-entropy loss calculation, only the term where the true category $y_i=1$ contributes to the error calculation, while all other categories are 0.


For example, for a certain multi-classification training task, if the true label of a training sample is $y=[0,0,1]$, and the probability predicted by the model for this sample input is $\hat{y}=[0.1,0.2,0.7]$, then the cross-entropy loss corresponding to this sample is calculated as: $L=-log(0.7) \approx 0.357$. In other words, you only need to take the log value of the predicted probability for the term where the true label probability is 1.


Example Python implementation code for the cross-entropy loss function is shown below. Note that because $\log(0)$ is mathematically undefined, cross-entropy implementation codes need to handle this case specially by substituting $\log(0)$ with a very small positive number.


```python
def categorical_cross_entropy(y_true, y_pred):
    # Clip predictions to ensure log(p) is valid
    y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)
    # Calculate loss for each sample (summing over the class dimension)
    loss_per_sample = -np.sum(y_true * np.log(y_pred), axis=1)
    # Return the average loss across all samples
    return np.mean(loss_per_sample)

# Example data (3 samples, 3 classes)
y_true = np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1]])  # One-hot true labels
y_pred = np.array([[0.7, 0.2, 0.1], [0.1, 0.8, 0.1], [0.2, 0.3, 0.5]])  # Predicted probabilities
loss = categorical_cross_entropy(y_true, y_pred)
print(f"Categorical Cross-Entropy Loss: {loss:.4f}")
```


## References

- "Neural Networks and Deep Learning: A Plain English Introduction" (《深入浅出神经网络与深度学习》)
- [Neural Network Algorithms - Loss Function_Neural Network Loss Function - CSDN Blog](https://blog.csdn.net/leonardotu/article/details/136541350)