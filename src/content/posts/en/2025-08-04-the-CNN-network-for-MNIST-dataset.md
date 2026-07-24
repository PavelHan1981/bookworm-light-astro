---
title: "Convolutional Neural Network for Handwritten Digit Recognition Based on PyTorch"
slug: "2025-08-04-the-CNN-network-for-MNIST-dataset"
description: "This article provides a detailed introduction and summary of the code workflow for implementing a Convolutional Neural Network (CNN) based on the PyTorch framework to recognize the MNIST handwritten digit dataset. It serves as an introductory foundation for practicing PyTorch and neural network programming."
date: 2025-08-04T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN"]
draft: false
---

This article provides a detailed introduction and summary of the code workflow for implementing a Convolutional Neural Network (CNN) based on the PyTorch framework to recognize the MNIST handwritten digit dataset, serving as an introductory foundation for practicing PyTorch and neural network programming.

> The code analysis for handwritten digit recognition on the MNIST dataset in this article heavily references the relevant code implementation in Chapter 5 of the book *"Deep Learning Principles and PyTorch Practice (Second Edition)"*. Essentially, it offers a more detailed interpretation of that code combined with my own understanding. The book provides very thorough and brilliant descriptions of the working principles of deep learning and neural networks across various fields, as well as their implementation using the PyTorch framework. It is an exceptional book for beginners in machine learning and neural networks, and I highly recommend it.

## The MNIST Handwritten Digit Dataset and Its Preparation

MNIST is a handwritten digit dataset, which can be said to be the "Hello World" resource repository for entering the fields of machine learning and deep learning. Based on this dataset, whether through classical fully connected neural networks or convolutional neural networks tailored for the image domain, one can very conveniently design, test, train, and validate network structures, thereby gaining a deeper understanding of the relevant theories in deep learning and neural networks through code practice.

Each sample in the MNIST dataset consists of a grayscale handwritten digit image (with a resolution of 28x28) and its corresponding digital label. The entire dataset contains 60,000 training samples and 10,000 test samples, so overall it can be divided into a training dataset and a test dataset.

![image.png](/images/blog/基于Pytorch实现手写数字识别的卷积神经网络-1.png)

PyTorch has built-in support for various popular open-source training datasets, including MNIST. By executing the following code, you can automatically download the MNIST dataset to the local `data` subdirectory in the current directory. When executing the following code for the first time, PyTorch will automatically create the `data` subdirectory and download the dataset into it. Subsequent calls to this code will load the MNIST dataset directly from the `data` subdirectory.

```python
import pytorch
import torchvision.datasets as dsets
import torchvision.transforms as transforms

train_dataset = dsets.MNIST(root='./data',  # Path to store files
                            train=True,   # Extract the training set
                            # Convert images to tensors; image preprocessing can be done during data loading
                            transform=transforms.ToTensor(),
                            download=True) # Automatically download when files are not found

test_dataset = dsets.MNIST(root='./data',
                           train=False,
                           transform=transforms.ToTensor())
```

As can be seen, the above code uses `train=True/False` to distinguish and respectively download/load the training dataset `train_set` and test dataset `test_dataset` of the MNIST dataset. In addition, because the raw data in the dataset is in the form of ordinary arrays after loading, the option `transform=transforms.ToTensor()` is used during the dataset loading process to convert them into PyTorch Tensors, which is the standard data format that PyTorch models can process.

## PyTorch Data Loaders

PyTorch specifically provides `DataLoader` and `sampler` to manage the loading and calling of training data, facilitating the efficient management and transfer of training data during subsequent batch training, testing, and validation of networks. Training and testing a neural network generally requires splitting the complete dataset into three completely independent parts to avoid mutual interference: the training set, the validation set, and the test set.

> **Why do datasets need to be split into independent training, validation, and test sets during use?** The training set is relatively easy to understand: training data is fed into the network, the difference between the output results and the training sample labels is compared, and the network parameters are adjusted based on this difference until the difference between the output results and the labels is minimized. The test set is also relatively easy to understand: after the parameters in the neural network are trained, an independent dataset completely unrelated to the training data must be used to test and validate the performance of the trained network. This independent dataset used to test and evaluate the trained network is the test set. The validation set is used during the training of network parameters to periodically test the network parameters currently undergoing training using this independent dataset, allowing real-time insight into the dynamic improvement of network performance during the training process.

The following code creates three independent data loaders based PyTorch's `DataLoader`, corresponding to the training dataset (the complete MNIST training dataset, totaling 60,000 samples), the validation dataset (the first 5,000 samples of the MNIST test dataset), and the test dataset (the last 5,000 samples of the MNIST test dataset). During subsequent simulated parameter training and testing, these three data loader objects can be called directly to access their corresponding datasets.

```python
# Training set loader, automatically splits data into batches and shuffles the order randomly
train_loader = torch.utils.data.DataLoader(dataset=train_dataset,
                                           batch_size=batch_size,
                                           shuffle=True)

indices = range(len(test_dataset))
indices_val = indices[:5000]
indices_test = indices[5000:]

sampler_val = torch.utils.data.sampler.SubsetRandomSampler(indices_val)
sampler_test = torch.utils.data.sampler.SubsetRandomSampler(indices_test)

validation_loader = torch.utils.data.DataLoader(dataset =test_dataset,
                                              batch_size = batch_size,
                                              shuffle = False,
                                              sampler = sampler_val
                                              )

test_loader = torch.utils.data.DataLoader(dataset=test_dataset,
                                          batch_size=batch_size,
                                          shuffle= False,
                                          sampler = sampler_test
                                          )
```

### `batch_size` and Mini-Batch

During the definition of the three `dataloader` variables above, a `batch_size` parameter is specified. This `batch_size` parameter is a constant used to specify the number of samples retrieved from the dataset each time. In this case, whether for subsequent training, validation, or testing, the number of samples read from the dataset each time will be `batch_size`.

For example, if `batch_size=100` is set, 100 samples can be read each time the dataset is accessed via the `dataloader` interface. These 100 samples are fed into the network all at once for forward network operations to obtain outputs. The differences between the outputs and labels for these 100 samples are compared, and based on these differences, the parameters in the network are updated using gradient descent and backpropagation. **In other words, the training of network parameters is carried out in units of this batch, rather than updating network parameters after calculating each individual sample. This is the concept of mini-batch in neural network training.** For the 60,000 samples of the MNIST training dataset, with a `batch_size` of 100, one epoch of training over the entire training dataset will be divided into 600 mini-batches, meaning the network parameters will be updated 600 times. Of course, generally speaking, training a neural network usually involves many epochs over the same training dataset to achieve satisfactory results.

## CNN Network Structure Design Based on PyTorch

Once the datasets for training, testing, and validation are prepared, the next step is to begin network design.

The PyTorch framework provides a `torch.nn.Module` class as the base class for neural network modules, and the networks we build based on the PyTorch framework should derive from this base class. The main methods to override in this class include `__init__` and `forward`. The former is used to declare the framework required for the network structure, i.e., the specification definitions for each layer; the latter implements the complete process of training samples from input to output, which is the definition of calculations for each layer and the connections between multiple layers.

The following code constructs a simple convolutional neural network based on `torch.nn.Module`. As seen from the code below, this neural network contains two sets of convolution + pooling layers, as well as two fully connected layers, finally outputting the recognition results for 10 digits via the `log_softmax` activation function.

- The first convolutional layer contains 4 convolution kernels with a size of 5x5. `padding=2` is used to ensure that the convolution operation does not reduce the spatial dimensions.
- The second convolutional layer contains 8 convolution kernels with a size of 5x5 and 4 channels (because the result of the previous convolution + pooling consists of 4 feature maps). Similarly, `padding=2` is used to ensure the dimensions do not shrink.
- The pooling layers used by both convolutional layers have the same specifications, and pooling calculations do not involve parameter training. Therefore, `__init__` contains only one pooling layer, adopting 2x2 max pooling with a stride of 2.
- The convolution + pooling layers are followed by two fully connected layers, with the final fully connected layer outputting recognition results via the `log_softmax` activation function.
- A flatten operation must be performed between the last pooling layer and the first fully connected layer to convert multi-dimensional feature maps into the one-dimensional vectors required by the fully connected layer. This conversion is implemented via the `x.view` operation in the `forward` function.
- The number of neurons in the first fully connected layer is 512, and the second fully connected layer has 10 neurons, corresponding to the 10 digits from 0 to 9.
- The activation function for both convolutional layers and the first fully connected layer is ReLU, while the activation function for the final fully connected output layer is `log_softmax`.

```python
depth = [4, 8] # Define the number of output feature maps for the two convolutional layers, i.e., the number of convolution kernels

class ConvNet(nn.Module):
    def __init__(self):
        super(ConvNet, self).__init__()

        self.conv1 = nn.Conv2d(1, 4, 5, padding = 2)
        self.pool = nn.MaxPool2d(2, 2) # 2x2 Max pooling with a stride of 2
        self.conv2 = nn.Conv2d(depth[0], depth[1], 5, padding = 2)
        self.fc1 = nn.Linear(image_size // 4 * image_size // 4 * depth[1] , 512)
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x): # This function performs the actual forward computation of the neural network, assembling components here
        x = self.conv1(x)  # First convolutional layer
        x = F.relu(x) # Use ReLU as the activation function to prevent overfitting
        x = self.pool(x) # Second pooling layer to downsample the image
        x = self.conv2(x) # Third convolutional layer with a 5x5 window and input/output channels of depth[0]=4, depth[1]=8 respectively
        x = F.relu(x) # Non-linear function
        x = self.pool(x) # Fourth pooling layer to reduce the image to 1/4 of its original size
        x = x.view(-1, image_size // 4 * image_size // 4 * depth[1]) # Flatten operation
        x = F.relu(self.fc1(x)) # Fifth layer is fully connected, using the ReLU activation function
        x = F.dropout(x, training=self.training)
        x = self.fc2(x) # Fully connected layer
        x = F.log_softmax(x, dim=1)
        return x

    def retrieve_features(self, x):
        feature_map1 = F.relu(self.conv1(x))
        x = self.pool(feature_map1)
        feature_map2 = F.relu(self.conv2(x))
        return (feature_map1, feature_map2)
```

In addition to the `__init__` and `forward` functions in the `torch.nn.Module` base class, the implementation of the convolutional neural network above also includes a custom `retrieve_features` method. By calling this function with a single sample data as input, the first and second layer feature maps of that sample under the current network parameter state can be retrieved, making it convenient for users to track the computational results of image data in the convolutional layers.

## PyTorch-Based Network Parameter Training Workflow

Once the convolutional neural network defined above is ready, the next step is to create an instance of this network and launch and execute the complete parameter training workflow.

First, define a variable based on the previously declared convolutional network class `ConvNet`, and then specify the loss function (CrossEntropyLoss) and gradient descent algorithm parameters to be used during the subsequent training process.

During the training of network parameters, one epoch corresponds to one complete training pass over all 60,000 samples of the training dataset. Training can be repeated for multiple epochs to improve the network's recognition performance, such as setting `num_epochs=20` or `30`.

During training, following the mini-batch training concept introduced above, each access to the training dataset yields a batch of training samples (e.g., 100 samples at a time). This mini-batch of samples is fed into the network all at once for computation to obtain output results. Then, the loss function specified earlier is used to evaluate the difference between the output results and the training sample labels, and based on this difference, gradient descent and backpropagation are used to update the network parameters. **The training of one mini-batch of samples corresponds to one update of the network parameters.**

In addition, during parameter training, you can also periodically (e.g., every 100 mini-batches) use an independent validation set to test and print the recognition performance of the current network parameter state, allowing you to monitor the improvement progress of network performance in real-time during training.

```python
net = ConvNet()
criterion = nn.CrossEntropyLoss() # Define loss function: Cross Entropy
optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)

record = [] # Container to record accuracy and other values
weights = [] # Record convolution kernels every few steps

# Main training loop: one epoch is one pass over the complete training set
for epoch in range(num_epochs):
    train_rights = [] # Container to record accuracy on the training set

	# Mini-batch training
    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.clone().requires_grad_(True), target.clone().detach()

        net.train()
        output = net(data) # The neural network completes one feedforward computation to get the predicted output
        loss = criterion(output, target) # Compare output with target labels to calculate error
        optimizer.zero_grad() # Clear gradients
        loss.backward() # Backpropagation
        optimizer.step() # One step of stochastic gradient descent

        right = rightness(output, target) # Calculate accuracy for the current batch
        train_rights.append(right) # Append calculation results to the train_rights list container

        if batch_idx % 100 == 0: # Print operation every 100 batches
            net.eval() # Mark the network model as being in evaluation mode
            val_rights = [] # Container to record accuracy on the validation set

            # Loop through the validation set to calculate validation accuracy
            for (data, target) in validation_loader:
                data, target = data.clone().requires_grad_(True), target.clone().detach()

                output = net(data)
                right = rightness(output, target)
                val_rights.append(right)

            train_r = (sum([tup[0] for tup in train_rights]), sum([tup[1] for tup in train_rights]))
            val_r = (sum([tup[0] for tup in val_rights]), sum([tup[1] for tup in val_rights]))

            # Print values, where accuracy is the average accuracy from the beginning of the current epoch up to the current batch
            print('Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}\tTraining Accuracy: {:.2f}%\tValidation Accuracy: {:.2f}%'.format(
                epoch, batch_idx * len(data), len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.data,
                101. * train_r[0]  / train_r[1],
                102. * val_r[0]  / val_r[1]))

            record.append((100 - 100. * train_r[0] / train_r[1], 100 - 100. * val_r[0] / val_r[1]))
            # Record the evolution process and historical states of convolution kernel parameters during training
            weights.append([net.conv1.weight.data.clone(), net.conv1.bias.data.clone(),
                            net.conv2.weight.data.clone(), net.conv2.bias.data.clone()])

print("Training completed. The next step is validation on test data.")
```

As can be seen from the code above, the complete process for the network can be divided into the parameter training process and the data testing/validation process, which correspond to the following code snippets respectively:

```python
# Parameter training process: Input samples - Forward calculation - Output data - Loss function calculation - Clear gradients - Loss function backpropagation - Parameter adjustment
net.train() # Network enters training mode
output = net(data)
loss = criterion(output, target)
optimizer.zero_grad()
loss.backward()
optimizer.step()

# Testing/Validation process: Input samples - Forward calculation - Output data
net.eval() # Network enters testing mode
output = net(data)
```

In addition, during the training and validation/testing process in the above code, a `rightness` function is defined to calculate the accuracy of the current sample batch by comparing the predicted outputs with the sample labels, returning the number of correct samples and the total number of samples:

```python
def rightness(predictions, labels):
    pred = torch.max(predictions.data, 1)[1]
    rights = pred.eq(labels.data.view_as(pred)).sum()
    return rights, len(labels)
```

## Model Testing and Validation

The final testing phase is relatively simple, largely identical to the periodic testing of network performance using the validation dataset during the training process mentioned above.

Similar to the validation step during parameter training, the network enters evaluation mode, reads samples from the test dataset in batches of `batch_size`, feeds them into the network for inference output, and calculates the prediction accuracy for each batch of samples. At the same time, printing the error rates of the training data and validation data during training allows one to observe the convergence of recognition accuracy throughout the training process.

```python
net.eval() # Mark that the model is currently in the operational phase
vals = [] # List to record accuracy

# Loop through the test set
for data, target in test_loader:
    data, target = data.clone().detach().requires_grad_(True), target.clone().detach()

    output = net(data) # Input feature data into the network to get classification outputs
    val = rightness(output, target) # Get the number of correct samples and total samples
    vals.append(val) # Record results

# Calculate accuracy
rights = (sum([tup[0] for tup in vals]), sum([tup[1] for tup in vals]))
right_rate = 1.0 * rights[0] / rights[1]
print(right_rate)

# Plot the error curves during training, showing error rates on the validation and test sets
plt.figure(figsize = (10, 7))
train_errors = [item[0] for item in record]
val_errors = [item[1] for item in record]
plt.plot(train_errors, label='Training Error Rate')
plt.plot(val_errors, label='Validation Error Rate')
plt.xlabel('Steps')
plt.ylabel('Error rate')
plt.legend()
plt.show()
```

With `num_epochs=20` and `batch_size=50`, training the network and subsequently testing it on the test dataset yields a recognition accuracy as high as 98% or more:

![image.png](/images/blog/基于Pytorch实现手写数字识别的卷积神经网络-2.png)

## References

- Chapter 5 of *"Deep Learning Principles and PyTorch Practice (Second Edition)"*
- [[Data Analysis & Machine Learning] Lecture 5.1: Introduction to Convolutional Neural Networks (CNN) - JamesLearningNote - Medium](https://medium.com/jameslearningnote/%E8%B3%87%E6%96%99%E5%88%86%E6%9E%90-%E6%A9%9F%E5%99%A8%E5%AD%B8%E7%BF%92-%E7%AC%AC5-1%E8%AC%9B-%E5%8D%B7%E7%A9%8D%E7%A5%9E%E7%B6%93%E7%B6%B2%E7%B5%A1%E4%BB%8B%E7%B4%B9-convolutional-neural-network-4f8249d65d4f)