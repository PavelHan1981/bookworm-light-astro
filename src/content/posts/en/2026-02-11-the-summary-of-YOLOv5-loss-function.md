---
title: "Summary of YOLOv5 Model Loss Function Calculation"
slug: "2026-02-11-the-summary-of-YOLOv5-loss-function"
description: "Based on the v6.0/v6.1 version of the YOLOv5 model, this article provides a detailed summary and explanation of the calculation workflow for each part of the loss function."
date: 2026-02-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["YOLO","Neural Network Theory"]
draft: false
---


Based on the v6.0/v6.1 version of the YOLOv5 model, this article provides a detailed summary and explanation of the calculation workflow for each part of the loss function.


The loss function of the YOLOv5 model consists of three components:

- Bounding box localization loss (Box Loss)
- Object confidence loss (Obj Loss)
- Classification loss (Cls Loss)

Among them, the bounding box regression loss adopts CIoU (Complete IoU) loss, while both the object confidence and classification losses use Binary Cross-Entropy (BCE) loss.


## Object Confidence Loss (Obj Loss)


The object confidence loss (`Obj Loss`) in YOLOv5 is the only loss term that involves both positive and negative (background) samples in its calculation. Its core task is to teach the model to answer the question: "**Is there an object in this grid cell? If so, how reliable is this predicted box?**"


In addition, during the loss calculation process, within the positive sample list returned by `build_targets`, the confidence label values for all positive samples are not fixed to 1. Instead, they are set to the IoU between the predicted box (acting as a positive sample) and the ground truth box. In other words, the higher the overlap between the positive sample and the ground truth box, the higher its confidence label value. This is the soft label strategy adopted in YOLOv5's loss calculation:

- Target ($t_{obj}$) for all negative samples = 0
- Target ($t_{obj}$) for all positive samples = CIoU Score

The calculation of the overall object confidence loss $L_{obj}$ can be divided into four steps.


### 1. Preprocessing of Predicted Values ($p_{obj}$)


The forward inference process of the YOLOv5 model outputs prediction tensors at three feature layers (P3, P4, P5). For the confidence channel, the inference output consists of unactivated raw values (logits). Because binary cross-entropy (BCE) is used to compute the confidence loss, the logits output by the model must first be processed through a Sigmoid activation function to map the values into the $(0, 1)$ interval.


$$
p_{obj} = \sigma(\text{logits})
$$


### 2. Constructing Target Values ($t_{obj}$)


As summarized in the article [Summary of Background Information for YOLOv5 Model Loss Function](https://pavelhan.tech/article/2026-02-10-the-background-information-of-YOLOv5-loss-function/), the `build_targets` function within the `ComputeLoss` class (responsible for calculating the YOLOv5 model loss function) constructs and returns a list of positive samples based on the list of ground truth boxes and the anchor lists of each detection layer.


To calculate the object confidence loss here, target values $t_{obj}$ need to be constructed:

- First, initialize a zero-tensor with the exact same shape as the predicted feature map.
- Then, iterate through all positive samples returned by `build_targets`:
    - Calculate the CIoU value between the current predicted box (acting as a positive sample) and the ground truth box (GT Box).
    - Fill this CIoU value into the corresponding coordinate position $(b, a, gj, gi)$ in the zero-tensor.
- The resulting $t_{obj}$ is a target tensor where most positions are 0 (background) and a few positions are floating-point numbers between $0 \sim 1$ (foreground IoU).

### 3. Calculating Binary Cross-Entropy (BCE Loss)


With the predicted values $p_{obj}$ and target values $t_{obj}$ established, the binary cross-entropy loss can be calculated. YOLOv5 uses PyTorch's `BCEWithLogitsLoss`. For a single predicted box, the calculation formula is:


$$
L_{obj\_grid} = - [ t_{obj} \cdot \log(p_{obj}) + (1 - t_{obj}) \cdot \log(1 - p_{obj}) ]
$$

- For negative samples ($t_{obj}=0$): The first half vanishes, optimizing only the second half $\log(1-p_{obj})$ and forcing $p_{obj}$ to approach 0.
- For positive samples ($t_{obj}=\text{CIoU}$): Both halves are present, forcing $p_{obj}$ to approach the CIoU value.

Furthermore, as described in [Summary of Background Information for YOLOv5 Model Loss Function](https://pavelhan.tech/article/2026-02-10-the-background-information-of-YOLOv5-loss-function/), if the Focal Loss feature is enabled via hyperparameters, Focal Loss processing must also be applied. The purpose is to suppress the loss from negative background boxes and elevate the loss weight of positive samples.


The formula above calculates the confidence loss for a single predicted box. The confidence loss for an entire detection layer is the sum of the confidence losses of all predicted boxes output by that layer:


$$
L_{obj}^L = \sum_{b=1}^{B} \sum_{i=1}^{G} \sum_{j=1}^{G} \sum_{a=1}^{A} L_{obj\_grid}(b, i, j, a)
$$


Where $B$ is the Batch Size, $G$ is the grid size, and $A=3$ is the number of anchors set per grid cell (default is 3).


### 4. Layer Balancing


Because small targets contain fewer feature details, suffer from more background interference, and are harder to regress, the model requires stronger gradient signals to learn how to detect them. Therefore, when summing the confidence losses of the three detection layers to obtain the total confidence loss, weighted summation is applied across layers: a higher weight is multiplied to the P3 layer (which outputs small-target feature information), and a smaller weight is multiplied to the P5 layer (which outputs large-target feature information). This forces the model to pay more attention to prediction results on high-resolution feature maps (P3), thereby improving the recall and accuracy of small targets.


$$
L_{obj}^{total} = 4.0 \cdot L_{obj}^{P3} + 1.0 \cdot L_{obj}^{P4} + 0.4 \cdot L_{obj}^{P5}
$$


**To emphasize once again: only in the calculation workflow of the confidence loss are negative samples taken into consideration. The classification loss and bounding box localization loss detailed below do not consider negative samples.**


## Classification Loss (Cls Loss)


The goal of classification loss is crystal clear: **For predicted boxes identified as positive samples, they must correctly recognize which category the object belongs to.** The calculation workflow of the classification loss $L_{cls}$ has the following two key characteristics:

- **Only calculates positive samples:** Similar to the bounding box localization loss $L_{box}$, only positive samples assigned with ground truth boxes (i.e., the positive sample list returned by `build_targets`) participate in the calculation of the classification loss. The classification loss for the more than 20,000 negative sample detection boxes (i.e., background boxes) output by model inference is zero and does not participate in gradient backpropagation.
- **Multi-class support:** Its goal is to correctly identify the specific category of the target from all possible $C$ classes.

In YOLOv5, the classification loss also adopts standard binary cross-entropy (BCE) loss, but with clever engineering implementations that allow it to be applied to multi-class classification. Its detailed calculation workflow contains four steps.


### Preprocessing of Predicted Values ($p_{cls}$)


Similar to the confidence loss calculation workflow, the first step is to locate positive samples. Based on the output tensor from the model's forward inference and the preset anchor box lists for each prediction layer, the `build_targets` function is called to extract the list of all positive samples. Subsequent calculations of the classification loss are performed exclusively on these positive samples.


To perform BCE calculations, the class prediction logits contained within the positive sample list returned by `build_targets` are extracted, and Sigmoid activation is applied to these logits. For each predicted box, the model outputs a $C$-dimensional vector, where $C$ is the total number of classes (e.g., $C=80$ for the COCO dataset). The predicted values output for each class are passed through Sigmoid activation, independently mapping each class score into the $[0, 1]$ interval to obtain the predicted probability $p_{cls}$ for each class.


### Constructing Target Values ($t_{cls}$)


Construct a target tensor $t_{cls}$ with the same dimensions as the positive sample $p_{cls}$. Its dimension is $[\text{Num\_Pos\_Samples}, C]$. Assign values to the labels within it:

- For each positive sample, find the true class $k$ annotated by its corresponding ground truth box, assign 1 to the $k$-th position of the $t_{cls}$ vector, and assign 0 to all other $C-1$ positions.

The final result is a set of sparse one-hot encodings serving as the target values for the subsequent BCE calculation.


**In the loss calculation workflow of YOLOv5, to prevent the model from overfitting to the labels, a technique called label smoothing is also used during training.** Roughly speaking, this slightly decreases the target value set to $t=1$ for the true class and slightly increases the target values set to $t=0$.

- For example, for a certain positive sample's class label settings, instead of setting $t=\{1, 0, 0, \dots\}$, it is set to $t=\{0.95, 0.005, 0.005, \dots\}$.

The purpose is to encourage the model's predicted probabilities not to be overly absolute (such as 1.0), thereby enhancing the model's generalization ability and robustness.


### Calculating Binary Cross-Entropy (BCE Loss)


$L_{cls}$ **relies on BCE, but BCE is calculated independently for each class, followed by summing the losses across all classes.**


Assume $i$ is the index of the positive sample, $k$ is the class index, $p_{i,k}$ is the probability predicted by the model that the $i$-th sample belongs to class $k$, and $t_{i,k}$ is the ground truth label (0 or 1). Then the loss formula for a single class $k$ of a single sample is:


$$
L_{cls}(i, k) = - [ t_{i,k} \cdot \log(p_{i,k}) + (1 - t_{i,k}) \cdot \log(1 - p_{i,k}) ]
$$


Since $t_{i,k}$ is only 1 at the true class $k_{gt}$ and 0 at the other $C-1$ classes, this calculation can be simplified to:

- For the true class $k_{gt}$: The loss is $-\log(p_{i, k_{gt}})$, forcing the model to increase the predicted probability for the correct class.
- For incorrect classes $k_{wrong}$: The loss is $-\log(1 - p_{i, k_{wrong}})$, forcing the model to decrease the predicted probabilities for all incorrect classes.

### Aggregation of Total Classification Loss


Finally, the losses of all positive samples across all classes are aggregated (summing the losses across the $C$ classes for each positive sample) to obtain the final $L_{cls}$.


$$
L_{cls}^{total} = \sum_{i=1}^{\text{Num\_Pos\_Samples}} \sum_{k=1}^{C} L_{cls}(i, k)
$$


## Bounding Box Localization Loss (Box Loss)


In YOLOv5, the localization loss adopts CIoU Loss (Complete IoU Loss). Its core objective is: **For predicted boxes identified as positive samples, accurately adjust their position, size, and aspect ratio so that they overlap with the ground truth (GT) box as much as possible.**


Compared to standard IoU metrics, CIoU Loss not only focuses on the overlapping area between the predicted box and the ground truth box, but also introduces penalty terms for center point distance and aspect ratio consistency. This provides more comprehensive and stable gradient signals, greatly improving the model's localization accuracy. The complete definition of CIoU Loss is:


$$
L_{CIoU} = 1 - IoU + R_{CIoU}
$$


Where $R_{CIoU}$ is the penalty term of CIoU, composed of the center point distance term and the aspect ratio consistency term.


The calculation workflow of $L_{box}$ is described below.


### Filtering Positive Samples and Decoding


This step is identical to the classification loss calculation above. First, locate the positive samples—meaning extracting the corresponding predicted boxes (logits) solely from the list of positive samples generated by the `build_targets` function, and then decoding the offset values output by the model into true normalized coordinates $(x, y, w, h)$.


Similar to the classification loss, the calculation of the localization loss only considers the positive sample list returned by `build_targets`, ignoring other background negative samples.


### Calculating IoU and CIoU


Based on each positive sample's predicted box, calculate the IoU between this predicted box and the ground truth box, as well as the distance and aspect ratio penalty terms for the CIoU calculation workflow. Finally, substitute all terms into the CIoU Loss formula to compute the CIoU loss $L_{CIoU}$ for each positive sample.


### Aggregating Target Bounding Box Loss Values


Sum up (and typically average) the $L_{CIoU}$ values of all positive samples to obtain the total bounding box localization loss $L_{box}$.


## Total Loss


After the independent calculation of the above three components, the total bounding box localization loss $L_{box}$, total object confidence loss $L_{obj}$, and total classification loss $L_{cls}$ for a batch are obtained. The overall loss is the weighted sum of these three losses:


$$
L_{total} = \lambda_{box}.L_{box} + \lambda_{obj}.L_{obj} + \lambda_{cls}.L_{cls}
$$


Where $\lambda_{box}$, $\lambda_{obj}$, and $\lambda_{cls}$ correspond to the weighting weights of the three losses respectively, which are set in the hyperparameter file, corresponding to the `box`, `obj`, and `cls` settings in the hyperparameter file:


```python
lbox *= self.hyp["box"]
lobj *= self.hyp["obj"]
lcls *= self.hyp["cls"]
bs = tobj.shape[0]  # batch size

return (lbox + lobj + lcls) * bs, torch.cat((lbox, lobj, lcls)).detach()
```


At this point, the complete loss value for the inference output of a batch of images during the training process has been successfully calculated.