---
title: "Summary of Mathematical Fundamentals for Deep Learning"
slug: "2025-07-22-the-maths-basics-of-deep-learning"
description: "This article summarizes the mathematical foundations required to learn and understand deep learning, focusing on theories such as differentiation, partial differentiation, and composite functions, along with simple Python code demonstrations."
date: 2025-07-22T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory"]
draft: false
---

This article summarizes the mathematical foundations required to learn and understand deep learning, focusing on theories such as differentiation, partial differentiation, and composite functions, along with simple Python code demonstrations.

## Differentiation

The theory of differentiation in mathematics is widely applied to solve various optimization problems in machine learning.

Through basic calculus, we can obtain the slope of a function at a specific point, or accurately evaluate the instantaneous rate of change of a function at that point. To understand the concept of differentiation, let's consider the speed of a driving car:

- By looking at the total distance traveled by the car over a period of time, we get the **average speed** during that interval.
- By differentiating the relationship between the vehicle's traveled distance and time over that period, we obtain the **instantaneous speed** of the vehicle at any given point in time.

Therefore, **the definition of differentiation is the instantaneous rate of change of a function at a specific point, which is essentially the slope of the function at that point**. Let us define a function as $f(x)$, and let $h$ be a number close to 0. Then the derivative of the function at point $x$ (which is effectively the slope at point $x$) can be calculated using the following expression:

$$
\frac{df(x)}{dx}=lim_{x \to 0} \frac{f(x+h)-f(x)}{h}
$$

The interpretation of the above definition for differentiation is simply: **How much change in the value of the function $f(x)$ will be caused by a tiny change in the input $x$.**

When using computer programs to calculate the derivative of a function, $h$ is often assigned a fixed value close to 0, and the change of the function at a certain point is then computed. This is known as numerical differentiation (as opposed to analytical derivation based on mathematical theory):

```python
def numerical_diff(f, x):
	h = 1e-4 # 0.0001
	return (f(x+h) - f(x)) / (h)

def function_1(x):
	return 0.01*x**2 + 0.1*x

numerical_diff(function_1, 5) #0.1999999999990898
numerical_diff(function_1, 10) #0.2999999999986347
```

For the derivation of mathematical differentiation, there are several commonly used properties that are crucial when studying deep learning theory.

The first property is that when $f(x)=x^n$, its derivative can be derived as the following expression:

$$
\frac{d(fx)}{dx}=nx^{n-1}
$$

In other words, the derivative of a standalone constant is 0 (which is natural, as a constant is a horizontal straight line whose slope is naturally 0), the derivative of $x$ is 1, the derivative of $x^2$ is $2x$, the derivative of $x^3$ is $3x^2$, and so on. This conclusion also holds for negative exponents; for example, the derivative of $x^{-4}$ is $-4x^{-5}$.

The second property is the linearity of differentiation. For functions $f(x)$ and $g(x)$, and a constant $a$, the following expressions hold:

$$
\begin{gather}
\frac{d(f(x)+g(x))}{dx}=\frac{df(x)}{dx} + \frac{dg(x)}{dx} \\
\frac{d(af(x))}{dx}=a \frac{d(f(x))}{dx}
\end{gather}
$$

Basically, mastering the above theoretical knowledge is more than enough for calculating and deriving single-variable functions.

## Partial Differentiation

The previous discussion on differentiation focused on single-variable functions with only one variable $x$. However, in practice, the real-world problems we face in deep learning theory are, in the vast majority of cases, multi-variable functions resembling the following:

$$
f(x_1,x_2,...,x_n)=a*x_1+b*x_2^2+...+i*x_n^n
$$

For such multi-variable functions, we need to compute partial derivatives: **When calculating a partial derivative, you only need to focus on the variable with respect to which you are differentiating, treating all other variables as constants.**

For example, let the function be $f(x_1,x_2)=x_1^2+x_2^3$. To find the partial derivative of this function with respect to $x_1$, we treat $x_2$ as a constant (for instance, fixing $x_2$ at 1). Since the derivative of an independent constant is 0, the partial derivative of $f(x_1,x_2)$ with respect to $x_1$ (note the change in the partial derivative symbol) is:

$$
\begin{gather}
f(x_1,x_2)=x_1^2+x_2^3=x_1^2+1^3=x_1^2+1 \\
\frac{∂f(x_1,x_2)}{∂x_1}=2*x_1 
\end{gather}
$$

Following the same logic to compute the partial derivative of $f(x_1,x_2)$ with respect to $x_2$:

$$
\frac{∂f(x_1,x_2)}{∂x_2}=3*x_2^2 \\
$$

The following code example demonstrates the logic of partial differentiation. The process of numerical differentiation remains the same, except that when computing the partial derivative for a particular variable, we ensure that only that variable changes. The following code demonstrates the partial derivatives of the function $x_1^2+x_2^2$ at the point $(3, 4)$:

```python
def numerical_diff(f, x):
	h = 1e-4 # 0.0001
	return (f(x+h) - f(x)) / (h)

def function_2(x):
	return x[0]**2 + x[1]**2
	# Or return np.sum(x**2)

# The following calculates the partial derivatives of function_2 at the point (3, 4)
def function_tmp1(x0):
	return x0*x0 + 4.0**2.0

def function_tmp2(x1):
	return 3.0**2.0 + x1*x1

numerical_diff(function_tmp1, 3.0) #6.00000000000378
numerical_diff(function_tmp2, 4.0) #7.999999999999119
```

Meanwhile, the gradient repeatedly mentioned in machine learning theory is actually the collection of partial derivatives of a function with respect to all its variables:

![image.png](/images/blog/深度学习的数学基础知识总结-1.png)

## Composite Functions

A composite function is a function formed by combining multiple functions, where one function appears as a variable inside another function. For example:

$$
\begin{gather}
g(x)=3+x  \\
f(x)=10+x^2 \\
f(g(x))=10+g(x)^2=10+(3+x)^2 \\
g(f(x))=3+f(x)=3+(10+x^2)
\end{gather}
$$

When differentiating composite functions—such as differentiating $f(g(x))$ with respect to variable $x$ in the above example—the chain rule can be applied: **If a function is expressed as a composite function, the derivative of that composite function can be expressed as the product of the derivatives of each individual function that makes up the composite function.**

The description of the chain rule above is relatively abstract, which can be better understood through the derivation process of the $f(g(x))$ example below:

$$
\begin{gather}
y=f(u) \\
u=g(x) \\
\frac{dy}{dx}=\frac{dy}{du} * \frac{du}{dx} \\
\frac{dy}{du}=\frac{d(10+u^2)}{du}=2u \\
\frac{du}{dx}=\frac{d(3+x)}{dx}=1 \\
\frac{dy}{dx}=2u * 1=2u=2g(x)=2(3+x)
\end{gather}
$$

Deep neural networks typically consist of many layers, and the goal of model training is to minimize the loss function of the final output layer as much as possible by adjusting the parameters of each layer. Therefore, from a broad perspective, the weights, biases, and other parameters of each layer can be viewed as variables of the loss function in the final layer. Minimizing the loss function requires determining the direction of parameter adjustment by calculating the partial derivatives (i.e., derivatives) of each parameter in every layer. The calculation of these partial derivatives relies on the aforementioned composite functions and the chain rule, working backward layer by layer from the output layer.

## References

- Appendix of *Math for Machine Learning in Plain English*
- Chapter 4 of *Deep Learning from Scratch: Learning and Implementation with Python*
- [Machine/Deep Learning - Basic Mathematics (Part 2): Gradient Descent | by Tommy Huang | Medium](https://chih-sheng-huang821.medium.com/%E6%A9%9F%E5%99%A8%E5%AD%B8%E7%BF%92-%E5%9F%BA%E7%A4%8E%E6%95%B8%E5%AD%B8-%E4%BA%8C-%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E6%B3%95-gradient-descent-406e1fd001f)