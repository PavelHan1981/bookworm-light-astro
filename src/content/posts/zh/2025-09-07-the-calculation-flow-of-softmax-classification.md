---
title: "Softmax分类器的计算流程详细总结"
slug: "2025-09-07-the-calculation-flow-of-softmax-classification"
description: "Softmax激活函数一般用于多分类问题的分类器实现，本文详细介绍和总结了基于Softmax激活函数以及交叉熵损失函数来实现神经网络多分类器的完整计算流程。

实际的人工智能项目，经常会遇到多分类问题，最典型的就是基于MNIST手写数字识别数据集，对手写的0-9总共10个手写数字进行识别和分类，以及基于ImageNet的图片数据集，对日常生活中看到的1000个物体进行分类。在人工智能的机器学习领域中，最常用的多分类器的实现就是Softmax分类器。"
date: 2025-09-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---


Softmax激活函数一般用于多分类问题的分类器实现，本文详细介绍和总结了基于Softmax激活函数以及交叉熵损失函数来实现神经网络多分类器的完整计算流程。


实际的人工智能项目，经常会遇到多分类问题，最典型的就是基于MNIST手写数字识别数据集，对手写的0-9总共10个手写数字进行识别和分类，以及基于ImageNet的图片数据集，对日常生活中看到的1000个物体进行分类。在人工智能的机器学习领域中，最常用的多分类器的实现就是Softmax分类器。


Softmax分类器的计算流程详细总结-Softmax多分类器.png


## Softmax激活函数


**对于基于Softmax实现的深度神经网络的多分类应用而言，网络最后一层的全连接神经网络的神经元个数就对应了该网络实现分类操作的类别数量。那么Softmax的输入就是这些神经元的输出（也就是所谓的logits），Softmax的输出则是不同类别分类判断的概率。**


以下详细解释Softmax操作的计算流程。假设数组 a 中有 n 个元素：


$$
a=[a_1,a_2,...，a_n]
$$


那么针对这个数组 a 进行的Softmax计算的流程如下。首先，对 a 中的每个元素取以e为底数的幂，得到一个新的数组 t :


$$
t=[e^{a_1},e^{a_2},...,e^{a_n}]
$$


然后把 t 数组中所有元素相加得到 s:


$$
s=sum(t)=e^{a_1}+e^{a_2}+...+e^{a_n}
$$


最后，把数组 t 中的每一个元素除以以上计算出来的 s ，得到一个新的数组就是针对 a 的softmax的计算结果：


$$
softmax(a)=[\frac{e^{a_1}}{s},\frac{e^{a_2}}{s},...,\frac{e^{a_n}}{s}]
$$


因为 s 是 t 数组所有元素的和，所以以上softmax的计算结果中所有元素的和就是1，每个元素对应于多分类识别输出对应的该类别的识别概率。


因此Softmax计算的流程如下图所示：


![image.png](/images/blog/Softmax分类器的计算流程详细总结-1.png)


Softmax计算流程在Python中的实现代码如下所示：


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


## One-Hot编码


One-Hot编码，又称为独热编码，在多分类应用中，只用0和1两个数字来表示分类标签对应的概率。


以dog、cat、bird三种分类情况为例，这三种类别在标签数据上，可以分别使用(1，0，1)，(0，1，0)，（0，0，1）来表示：


![image.png](/images/blog/Softmax分类器的计算流程详细总结-2.png)


## 交叉熵损失函数


在深度网络多分类器应用的实现上，一般是在最后一个全连接层采用Softmax激活函数对该层所有神经元的原始输出进行处理，得到每个类别对应的分类概率，而这类应用一般采用的损失函数则是交叉熵损失函数。


交叉熵损失函数的表达式如下图所示：


![image.png](/images/blog/Softmax分类器的计算流程详细总结-3.png)


其中的 p(x) 表示以One-hot编码表示的训练样本数据对应一维向量，其中只有正确分类对应的元素为1，其他分类对应的元素均为0；q(x) 则是深度网络模型的输出经过Softmax处理后输出的一维向量，其中的各个元素对应了模型预测出来的各个分类的可能性。


所以**交叉熵损失函数的计算，本质上就是对训练样本标记的One-Hot分类结果，与模型使用相同样本推理计算出来的各个类别的分类预测结果之间进行比对，判断预测输出的正确分类结果的可能性有多接近1，预测输出的正确分类结果越接近1，损失函数越小**。


交叉熵函数的Python代码实现如下：


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


可以看到，预测输出结果的正确分类2对应的可能性越高（0.8 vs 0.6），交叉熵损失函数的计算结果越小。


## Softmax分类器的实现

> 多分类应用：最后一个全连接层的输出使用Softmax激活处理，训练样本的标签采用One-Hot Encoding进行编码，损失函数采用交叉熵Cross Entropy。

下图总结了深度神经网络基于Softmax激活函数和交叉熵损失函数实现多分类器的计算流程。


![image.png](/images/blog/Softmax分类器的计算流程详细总结-4.png)

- 深度神经网络的最后一个全连接层，从前一个全连接层接收输入的特征变量 x_m ,与最后一层的权重系数 w_{m,k} 以及偏置变量 b_k 进行乘加操作，得到最后一层各个神经元的净输出。
- 最后一层神经元的净输出，作为一个完整的一维向量，执行Softmax操作，输出各个分类推理输出的可能性预测列表 t_k 。
- 深度神经网络输出的多分类预测输出 t_k 与以One-Hot encoding模式编码的样本标签进行比较，使用交叉熵（Cross Entropy）损失函数计算损失。
- 根据交叉熵损失函数的输出反向传播调整整个网络的各级参数。

**总结起来，Softmax激活函数在计算流程上，与其他激活函数（如Sigmoid，Tanh，ReLU等）相比，最大的区别是：其他的激活函数都是对每个神经元的乘加输出进行非线性变换，而Softmax激活函数则是对最后一层所有神经元的乘加输出进行的计算**。


## 参考资料

- 《Python深度学习和项目实战》，第三章 Softmax多分类器
- [使用 TensorFlow 學習 Softmax 回歸 (Softmax Regression) | by Leo Chiu | 手寫筆記 | Medium](https://medium.com/%E6%89%8B%E5%AF%AB%E7%AD%86%E8%A8%98/%E4%BD%BF%E7%94%A8-tensorflow-%E5%AD%B8%E7%BF%92-softmax-%E5%9B%9E%E6%AD%B8-softmax-regression-41a12b619f04)
- [Cross Entropy Loss: Intro, Applications, Code](https://www.v7labs.com/blog/cross-entropy-loss-guide)
