---
title: "Automatic Differentiation and Computation Graphs in PyTorch Explained"
slug: "2025-11-15-the-explanation-of-pytorch-calculation-graph"
description: "Based on the study of PyTorch's fundamental data structure torch.Tensor, this article organizes the theory behind torch's gradient and automatic differentiation features, and uses examples to clearly illustrate the runtime logic of computation graphs and the training workflow within the PyTorch framework."
date: 2025-11-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory"]
draft: false
---


Based on the study of PyTorch's fundamental data structure `torch.Tensor`, this article organizes the theory behind PyTorch's gradient and automatic differentiation features, and uses examples to clearly illustrate the runtime logic of computation graphs and the training workflow within the PyTorch framework.


## Gradients and Automatic Differentiation in PyTorch


`torch.Tensor` is the core data structure in the PyTorch framework. The core design of this data structure is that it not only carries various data during computation but also has a built-in automatic differentiation mechanism, making the training of deep learning models efficient and flexible. _A deep understanding of the `torch.Tensor` type, along with its gradient and automatic differentiation mechanisms, forms the foundation for understanding deep learning and developing deep learning models using PyTorch._


A tensor in PyTorch is a multi-dimensional array, conceptually similar to NumPy's `ndarray`. **The key difference between the two is that PyTorch tensors support accelerated computation on GPUs and automatic differentiation.** Below is a brief summary of the core attributes contained within the `torch.Tensor` type in the PyTorch framework.


### data


`data` stores the actual data contained within the tensor. This is no different from NumPy's `ndarray`, and even the calculation and declaration APIs are very similar.


### device


`torch.Tensor` uses the `device` attribute to indicate which device the tensor is stored on, such as a CPU (`'cpu'`) or a GPU (`'cuda'`). You can specify the storage location of the tensor data via the `device` attribute when creating it, and during runtime, you can also transfer the storage location between different devices using methods like `to()`, `cpu()`, or `cuda()`.


Note that: **All tensors involved in an operation must reside on the same device. Attempting to perform operations on tensors located on different devices (e.g., one on the CPU and one on the GPU) will result in a RuntimeError**.


### dtype


The `dtype` attribute is used to represent the data type of the actual data stored in the tensor, such as `torch.float32`, `torch.int64`, `torch.int32`, etc. The default data type is 32-bit floating-point (`torch.float32`).


Note that **because model training typically requires the precision and dynamic range provided by floating-point numbers, only floating-point tensors can compute gradients**. Therefore, floating-point tensors are generally used during network construction and training, and after training, they are converted to INT-type tensors via quantization to facilitate model deployment.


### requires_grad


`requires_grad` is a boolean attribute that determines whether the tensor participates in gradient calculation during computations. When set to `True`, PyTorch tracks all operations performed on this tensor during runtime, thereby constructing a computation graph and preparing for subsequent gradient calculations.


By default, leaf nodes (i.e., Tensors created directly by the user) have their `requires_grad` attribute set to `False`, though it can be manually configured via the `requires_grad` attribute. For non-leaf nodes (i.e., intermediate computation result tensors based on leaf nodes), `requires_grad` is automatically inferred from the computation process: **if any operand requires a gradient, the non-leaf node resulting from the operation will also require a gradient**.


In summary, `torch.Tensor`'s `requires_grad` and its related gradient attributes are core to enabling neural networks to perform backpropagation, update parameters, and ultimately complete the model training process.


### grad


The `grad` attribute is used to store the gradient values obtained during the backpropagation process (i.e., when calling the `backward()` function) for the current `torch.Tensor`. When executing a model's backpropagation computation, the gradients of leaf tensors (created directly by the user rather than resulting from operations) accumulate here.


In the initial state of a tensor or when `requires_grad=False`, this attribute is `None`. **Every time `backward()` is executed on the computation graph, the computed results are accumulated into the tensor's `grad` attribute rather than replacing it**. This is why gradients must be manually zeroed out in the training loop using: `optimizer.zero_grad()`.


When executing a model's backpropagation `backward` computation, by default, **only the `grad` attribute of leaf tensors is automatically populated**. The `grad` attributes of intermediate tensors generated by operations (non-leaf nodes) remain `None` by default. This is primarily done to save memory, as they typically do not play a direct role in parameter updates. If you need to retain gradients for intermediate nodes, you can call the `retain_grad()` method on that tensor.


### grad_fn


The `grad_fn` attribute points to a `Function` object that records the operation performed to create this tensor. The `grad_fn` attribute of each node in the model actually represents an edge in the computation graph, recording the complete computation history of the model from input to output, thereby constructing the dynamic computation graph corresponding to the model. This makes it crucial for the Autograd system to backpropagate gradients.


For user-created leaf tensors, `grad_fn` is always `None`. For non-leaf nodes, the `grad_fn` attribute is a specific backpropagation function object, and its function name (such as `AddBackward`, `MulBackward`, etc.) indicates the type of forward operation used to create that tensor.


Here is a code example:


```python
import torch

x=torch.tensor(4.0,requires_grad=True)
print("x.grad:",x.grad)
print("x.grad_fn:",x.grad_fn)

z=x**2
print("z grad:",z.grad)
print("z.grad_fn:",z.grad_fn)

z.backward()
print("x.grad:",x.grad)
```


Corresponding printed output:


```bash
(base) PS D:\Code\python-test> & C:/Users/windl/anaconda3/python.exe d:/Code/python-test/test2.py
x.grad: None
x.grad_fn: None
d:\Code\python-test\test2.py:8: UserWarning: The .grad attribute of a Tensor that is not a leaf Tensor is being accessed. Its .grad attribute won't be populated during autograd.backward(). If you indeed want the .grad field to be populated for a non-leaf Tensor, use .retain_grad() on the non-leaf Tensor. If you access the non-leaf Tensor by mistake, make sure you access the leaf Tensor instead. See github.com/pytorch/pytorch/pull/30531 for more information. (Triggered internally at C:\actions-runner\_work\pytorch\pytorch\pytorch\build\aten\src\ATen/core/TensorBody.h:494.)
  print("z grad:",z.grad)
z grad: None
z.grad_fn: <PowBackward0 object at 0x000001A5B4E0E0E0>
x.grad: tensor(8.)
```

- The UserWarning output above indicates an error/warning when trying to print the gradient information of a non-leaf node. To save memory, gradients of non-leaf nodes are not automatically saved during computations.
- The `grad_fn` attribute of `z` is a function named `PowBackward0`, indicating that `z` originated from a power/exponent function.
- Before executing the `backward` operation, the gradient `grad` of the leaf node `x` is always `None`, and becomes `8.0` after execution. This is because $z = x^2$, so the derivative of $z$ with respect to $x$ is $2x$, making the gradient calculation result for node $x$ equal to `8.0`. For relevant theories on derivative calculations, you can refer to [Summary of Mathematical Basics for Deep Learning](https://www.pavelhan.tech/article/2025-07-22-the-maths-basics-of-deep-learning).

## Computation Graphs and Automatic Differentiation


PyTorch's automatic differentiation feature is its core competitive advantage as a deep learning framework. Therefore, when training and inferring models using PyTorch, you only need to focus on the execution logic of the forward pass; the framework will automatically complete gradient calculations, and then update parameters during the backpropagation process based on the magnitude of each parameter's gradient to achieve gradual convergence, as shown in the figure below.


![image.png](/images/blog/PyTorch中的自动微分特性与计算图解释-1.png)


Based on the forward and backward propagation workflows above, we can see that the core components of a complete model computation graph and PyTorch's automatic differentiation include:

- `torch.Tensor` data structures capable of carrying gradient information. As mentioned above, when `requires_grad` is set to `True`, this data structure maintains its own gradient information (`grad` attribute), and operations performed on it (`grad_fn`) are automatically tracked by the framework to build a complete computation graph.
- Computation Graph. During the forward pass (`forward`) of model code, the PyTorch framework dynamically generates a directed acyclic computation graph, which records the complete computational process from input to output.
- Automatic Differentiation Engine. When the backpropagation function (`backward`) is called on a model, the internal autograd engine maintained by PyTorch traverses the computation graph in reverse, executing the `backward()` method of each `Function`. Its role is to calculate the gradients of each node and then write the computed gradients into the `grad` attribute of the corresponding node's Tensor.
- Optimizer. The optimizer is responsible for updating the parameter values of each node based on the current gradient information of each node, the learning rate set by model hyperparameters, etc.

**The training process of deep learning models is essentially driven behind the scenes by automatic differentiation for iterative parameter optimization**. Below is the complete process during model forward and backward propagation where gradient information at each node is computed and updated based on the computation graph, and the optimizer continuously updates node parameters to achieve convergence:

- Forward Pass to Build Computation Graph: When performing operations on tensors with `requires_grad=True` (usually model parameters and input data), the PyTorch framework dynamically builds a complete computation graph in the background. This graph records all operational steps from input data to the final loss function (a scalar).
- Executing Backpropagation (`backward`): Once the loss value (a scalar) is obtained, call `loss.backward()`. This operation invokes the Autograd engine, starting from the root node and traversing the computation graph backwards. For each node in the graph, the engine calls its predefined `backward()` method to compute the local gradient of the operation with respect to its inputs, multiplies this gradient by the gradient coming from the output end (the chain rule), and passes it to the input nodes.
- Gradient Accumulation and Update: The final execution result of the aforementioned backpropagation process is to **accumulate** the computed gradients into the `.grad` attribute of each leaf tensor (i.e., model parameters).
    - Because it is cumulative, before each parameter update, you must call `optimizer.zero_grad()` to clear the gradients of all nodes first, preventing previous gradients from interfering with the current update calculation.
- Parameter Update: The final step uses an optimizer (such as `torch.optim.SGD`) to execute parameter updates based on the `.grad` attribute of each parameter calculated in the previous step (`optimizer.step()`), thereby reducing the loss step by step until convergence is reached.

## Complete Example


The following explanation is based on the training workflow of a simple network for recognizing the MNIST dataset, implemented in the article [Convolutional Neural Network for Handwritten Digit Recognition Based on PyTorch](https://www.pavelhan.tech/article/2025-08-04-the-CNN-network-for-MNIST-dataset).


```python
def model_training(net):
    criterion = nn.CrossEntropyLoss() # Define loss function: Cross-Entropy
    optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9) # Define optimizer

    record = [] # Container to record metrics such as accuracy
    weights = [] # Record convolutional kernels every few steps

    # Start training loop
    for epoch in range(num_epochs):

        train_rights = [] # Container to record training set accuracy

        ''' The enumerate below acts as an enumerator. When iterating over train_loader, enumerate automatically outputs a number indicating the loop count, recorded in batch_idx (equal to 0, 1, 2, ...). Each iteration of train_loader outputs a pair of data and target, corresponding to a batch of handwritten digit images and their corresponding labels respectively. '''
        for batch_idx, (data, target) in enumerate(train_loader):  # Loop over each batch in the container
            data, target = data.clone().requires_grad_(True), target.clone().detach()

            # Mark the network model to indicate it is training on the training set

            # This distinction is mainly to turn the net's training flag on/off, thereby deciding whether to run dropout

            net.train()

            output = net(data) # Neural network performs a forward computation to get the predicted output
            loss = criterion(output, target) # Compare output with target labels to compute error
            optimizer.zero_grad() # Clear gradients
            loss.backward() # Backpropagation
            optimizer.step() # Stochastic gradient descent step
            right = rightness(output, target) # Compute values needed for accuracy, returns (number of correct samples, total samples)
            train_rights.append(right) # Store calculation results in the train_rights list container
```


From the simple training workflow above, we can clearly see the role and execution steps of PyTorch's automatic differentiation and computation graph features during model training:

- `output = net(data)`: Perform a forward pass on the input data within the model to obtain the output. During this forward pass workflow, the computation graph of the entire model is built step by step.
- `loss = criterion(output, target)`: Compute an error scalar based on the output from the previous step and the target labels.
- `optimizer.zero_grad()`: Be sure to clear all parameter gradients across the entire network before executing backward computations to avoid gradient accumulation.
- `loss.backward()`: Execute a backward computation based on the error scalar. This backward computation traverses from the output to each leaf node of the model using the computation graph, writing the gradients of each node into its `grad` attribute.
- `optimizer.step()`: Finally, call the optimizer's `step` method to update node parameters using parameters such as each node's gradient (`grad` attribute) and learning rate. The parameter update for the current training step concludes here.

## References

- "PyTorch Deep Learning Application Practice" by Chen Zhaoming and Hong Jinkui, Section 3-3: Automatic Differentiation