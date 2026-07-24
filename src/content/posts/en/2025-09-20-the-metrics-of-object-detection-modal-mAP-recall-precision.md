---
title: "Detailed Explanation of Object Detection Model Evaluation Metrics: mAP, Recall, and Precision"
slug: "2025-09-20-the-metrics-of-object-detection-modal-mAP-recall-precision"
description: "In the field of object detection in computer vision, the primary evaluation metrics are mAP, Recall, and Precision. This article provides a detailed breakdown of the concepts and calculation logic of IoU, Precision, Recall, AP, and mAP."
date: 2025-09-20T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","YOLO"]
draft: false
---


In the field of object detection in computer vision, the primary evaluation metrics are mAP, Recall, and Precision. This article provides a detailed breakdown of the concepts and calculation logic of IoU, Precision, Recall, AP, and mAP.


## IOU


IoU: Intersection Over Union.


In the execution of object detection algorithms, every object to be detected in each training image is annotated with a bounding box corresponding to its location. This annotated bounding box is the ground truth detection region for the object. Meanwhile, the object detection algorithm performs detection and inference on the objects in the image, outputting a predicted bounding box. **The IoU metric evaluates the detection accuracy of an object detection algorithm for a given object based on the degree of overlap between two bounding boxes. The higher the degree of overlap between the ground truth bounding box and the predicted bounding box, the better the detection accuracy.**


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-1.png)


The following diagram provides a very intuitive explanation of how IoU is calculated. Specifically, it is the intersection of the object region detected by the system and the ground truth object region (the "Area of Overlap" or "Intersection" part in the diagram below), divided by the union of the two regions (the "Area of Union" or "Union" part in the diagram below).


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-2.png)


Therefore, for a given object to be detected in an image, its IoU metric is calculated as the intersection area of the predicted box and the ground truth box divided by the union area of the two boxes. The result of this calculation naturally falls between 0 and 1. A value of 0 indicates that the detection result has no overlap with the actual ground truth box, representing a complete detection failure, while a value of 1 indicates that the predicted box and the ground truth box completely overlap. Naturally, higher values are better for algorithm evaluation. Generally, $\text{IoU} = 0.5$ is used as a baseline to determine recognition rate; a value greater than this threshold indicates a valid detection, while anything lower is considered an invalid detection.


Building upon the concept of IoU above, performing object detection on multiple objects in a single image can yield several types of detection results:


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-3.png)

- TP (True Positive): The algorithm accurately detects an object in the image, and the IoU overlap between the two bounding boxes is greater than 0.5, making it a correct prediction.
- FP (False Positive): The bounding box output by the algorithm has an overlap of less than 0.5 with the ground truth boxes of all objects in the image. A typical example is identifying the background as an object, which represents a false detection.
- TN (True Negative): The region is actually background, and the algorithm does not output a corresponding bounding box. This is a normal occurrence and does not need to be considered when calculating object detection metrics.
- FN (False Negative): An object that the algorithm was supposed to detect was missed, representing a false negative (missed detection).

Categorizing and organizing the above detection results into a table yields:


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-4.png)


## Recall and Precision


Precision: Precision. Recall: Recall.


With the above understanding of IoU and the various types of detection results in object detection algorithms, the concepts and calculations of Precision and Recall become quite straightforward.


**Precision represents the proportion of correct detections—where both the category classification and location detection ($\text{IoU} > 0.5$) are correct—among all detection results output by the object detection algorithm.** The formula for Precision is shown in the figure below:


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-5.png)


**Recall represents the proportion of actual objects in the image that were correctly detected (correct category classification and $\text{IoU} > 0.5$) by the object detection algorithm.** The formula for Recall is shown in the figure below:


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-6.png)


Taking the teacup detection in the image above as an example, Precision represents the proportion of the algorithm's output teacup detections that are actually teacups. Recall represents the proportion of all teacups present in the image that were accurately detected by the algorithm.


## AP and mAP


AP: Average Precision, representing the detection accuracy for a single category. mAP: mean Average Precision, representing the average detection accuracy across all categories.


Let's use an example to explain the calculation process of AP in greater detail.


Suppose we are detecting dog targets using a certain dataset. There are 8 ground truth dog targets in the dataset, corresponding to GT1–GT8 (where GT stands for Ground Truth, representing the manually annotated locations of the actual dog targets). Meanwhile, the algorithm detects 10 dog targets and their locations, denoted as BB1–BB10 (where BB stands for the Bounding Box of each dog target detected by the algorithm).


Some bounding boxes from the algorithm's detection results on the dataset only captured the dog's head or paws, meaning their IoU is very low (e.g., BB3, BB4, BB5, BB7, and BB8 all have relatively low IoU outputs). Furthermore, two ground truth dog targets, GT6 and GT7, failed to be detected ($\text{FN} = \{\text{GT7}, \text{GT8}\}$), meaning these two ground truth targets were missed. Based on the above information, the execution results of the object detection algorithm are summarized as follows: **It is worth noting that each detection result output by an object detection algorithm contains not only the predicted category and the bounding box coordinates, but also a detection confidence score, which represents the probability that the detected target is correct.**


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-7.png)


As can be seen from the figure above, for a single ground truth dog target, the detection algorithm may output multiple independent detection results; for example, both BB1 and BB3 correspond to GT1. Generally, we consider an algorithm's output detection result to be a valid TP only when $\text{IoU} > 0.5$. Therefore, the 10 detection results ($\text{BB1–BB10}$) output by the algorithm are evaluated for IoU as follows:


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-8.png)


Next, according to the procedure, sort them based on their detection confidence (i.e., the probability of being a dog in the figure above):


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-9.png)


Then, following the sorted order, calculate the Precision and Recall at each rank:

- For Rank 1, $\text{Precision} = (\text{Number of TPs} \ge \text{rank 1}) / (\text{Total number of TPs} + \text{FPs} \ge \text{rank 1}) = 1 / 1 = 1$, and $\text{Recall} = (\text{Number of TPs} \ge \text{rank 1}) / (\text{Total number of TPs}) = 1 / 8 = 0.125$.
- For Rank 2, $\text{Precision} = 2 / 2 = 1$, and $\text{Recall} = 2 / 8 = 0.25$.
- For Rank 3, $\text{Precision} = 3 / 3 = 1$, and $\text{Recall} = 3 / 8 = 0.375$.
- For Rank 4, $\text{Precision} = 3 / 4 = 0.75$, and $\text{Recall} = 3 / 8 = 0.375$.
- By extension, Rank 5 has $\text{Precision} = 4 / 5 = 0.8$, $\text{Recall} = 4 / 8 = 0.5$.
- Rank 6: $\text{Precision} = 5 / 6 = 0.833$, $\text{Recall} = 5 / 8 = 0.625$.
- Rank 7: $\text{Precision} = 5 / 7 = 0.714$, $\text{Recall} = 5 / 8 = 0.625$.
- Rank 8: $\text{Precision} = 5 / 8 = 0.625$, $\text{Recall} = 5 / 8 = 0.625$.
- Rank 9: $\text{Precision} = 5 / 9 = 0.556$, $\text{Recall} = 5 / 8 = 0.625$.
- Rank 10: $\text{Precision} = 5 / 10 = 0.5$, $\text{Recall} = 5 / 8 = 0.625$.

Thus, based on the 10 detection results output by the object detection algorithm, 10 sets of Precision and Recall data are obtained as follows:


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-10.png)


Using these 10 sets of $(\text{Precision}, \text{Recall})$ values, we can plot the P-R curve corresponding to the algorithm's output results:


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-11.png)


**By definition, the AP metric is calculated as the area or integral under the blue P-R curve marked in the P-R plot above.** Since both Precision and Recall metrics fall between 0 and 1, the calculated AP metric naturally also falls between 0 and 1.


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-12.png)


Calculating the area or integral of the P-R curve directly can be complex, so the two discrete sequence formulas provided in the image above can be used to compute the AP metric.


In the first formula, $P(k)$ is the precision at the $k$-th rank, and $\Delta r(k)$ is the difference in recall between the $k$-th rank and the $(k-1)$-th rank. Therefore, calculating the AP metric using this formula gives:


$$
AveP=1*0.125+1*0.125+1*0.125+0.75*0+0.8*0.125+0.833*0.125+0.714*0+0.625*0+0.556*0+0.5*0=0.579
$$


In the second formula, $P(k)$ is the precision at the $k$-th rank, and $\text{rel}(k)$ is defined as 1 if the $k$-th rank is a valid detection (TP), and 0 otherwise. "Number of relevant documents" represents the total number of TPs, which is 8 here ($\text{GT1–GT8}$). Therefore, calculating the AP metric based on this formula gives:


$$
AveP=\frac{1*1+1*1+1*1+0.75*0+0.8*1+0.833*1+0.714*0+0.625*0+0.556*0+0.5*0}{10}=0.579
$$


As we can see, **although the two formulas above use different expressions, they lead to the same destination: the final calculated AP value is 0.579 in both cases.**


Now that the calculation of AP is complete, calculating mAP is relatively simple. The AP calculation performed above was only for the single category of dogs. Generally, object detection algorithms can output detection results for multiple different categories; for example, the COCO dataset contains annotation information for 80 categories. Thus, the mAP metric of an object detection algorithm is obtained by first independently calculating the AP detection metric for each category it supports, and then summing up all the AP values and taking their average to yield the mAP metric of the overall algorithm across all categories.


![image.png](/images/blog/目标检测模型的评价指标详解：mAP，召回率，准确率-13.png)


## References

- *Deep Learning with PyTorch Object Detection in Action*, 1.2
- [Yy's Program: What do IOU, AP, and mAP commonly used in image recognition mean?](https://yy-programer.blogspot.com/2020/06/iouapmap.html)
- [Learning Model: What is AP/mAP/IoU? [Reprint] | by Ryan Lu | AI Anti-Monster Castle | Medium](https://medium.com/ai%E5%8F%8D%E6%96%97%E5%9F%8E/learning-model-%E4%BB%80%E9%BA%BC%E6%98%AFap-map-iou-%E8%BD%89%E9%8C%84-dd586fe93189)