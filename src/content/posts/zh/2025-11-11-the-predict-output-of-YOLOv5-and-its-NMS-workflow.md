---
title: "YOLOv5模型的推理输出结果及其NMS算法解析"
slug: "2025-11-11-the-predict-output-of-YOLOv5-and-its-NMS-workflow"
description: "本文总结了YOLOv5模型对输入图片数据执行前向推理流程后，在其检测头部分输出的数据结构，以及在其输出数据上所执行的NMS算法流程。"
date: 2025-11-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["YOLO","CNN"]
draft: false
---


本文总结了YOLOv5模型对输入图片数据执行前向推理流程后，在其检测头部分输出的数据结构，以及在其输出数据上所执行的NMS算法流程。


## YOLOv5模型的输出数据


在[YOLOv5模型网络架构解读](https://www.pavelhan.tech/article/2025-10-26-the-summary-of-YOLOv5-model)一文中详细整理了该模型的网络架构，对于分析和总结YOLOv5模型的输出数据而言，最重要的就是其中的检测头部分的结构：


![image.png](/images/blog/YOLOv5模型的推理输出结果及其NMS算法解析-1.png)


从上图可以看到，YOLOv5采用了多尺度检测的机制，在检测头部分输出三个不同尺度的特征图，分别用于检测不同大小的目标。对于标准的640×640输入图像，其输出张量的形状为：

- 大尺度特征图（P3层）：[batch_size, 3, 80, 80, 5+NC]
- 中尺度特征图（P4层）：[batch_size, 3, 40, 40, 5+NC]
- 小尺度特征图（P5层）：[batch_size, 3, 20, 20, 5+NC]

每个输出张量的维度含义如下：

- batch_size：批处理大小，表示同时处理的图像数量。
- 3：每个网格单元预测的锚框数量（anchor boxes），YOLOv5模型默认为3个。
- H, W：特征图的高度和宽度（如80×80、40×40、20×20）。YOLOv5模型输入为640x640，分别在8倍、16倍、32倍尺度输出特征图，对应的特征图分辨率就是80x80，40x40以及20x20。
- 5+NC：每个预测框的输出维度。

每个预测框的输出所包含的信息如下：


![image.png](/images/blog/YOLOv5模型的推理输出结果及其NMS算法解析-2.png)


总结起来，对于P3层输出而言，共计输出80x80x3=19200个预测框；对于P4层输出，共计输出40x40x3=4800个预测框；对于P5层输出，共计输出20x20x3=1200个预测框。每个预测框都包含有（5+NC）长度的信息用于描述该预测框的信息。


## NMS算法


如上所述，YOLOv5模型对一张图像进行的推理，最终会在三个尺寸维度上总共输出超过两万个预测框，其中通常会为同一个物体生成大量重叠的预测框。因此要经过过滤后才会输出真正的检测框，这个从模型输出张量数据过滤出来最终检测框的过程就是NMS算法。**NMS算法的任务就是从重叠的框中筛选出最准确的一个，并抑制掉（删除）其他冗余的框，最终得到清晰、不重叠的检测结果。**


NMS算法的基本执行流程如下：

- 排序：将模型输出的所有预测框按照其置信度（Confidence Score）从高到低排序。
- 选取：选取置信度最高的框，将其添加到最终输出框的列表中。
- 抑制：以前一步骤选出来的最高置信度的预测框为基础，计算该框与剩余所有框的交并比（IoU）。删除那些IoU超过预设阈值（如0.5）的框，因为它们很可能指向的是同一个物体。
- 循环：重复步骤2和3，直到没有剩余的框。

YOLOv5在基础的NMS算法上做了一些改进：

- 多尺度预测框的统一处理。因为YOLOv5模型的推理输出包括三个不同特征图（P3, P4, P5）的预测框，在进行NMS算法处理时就把所有的预测框合并在一起，再统一进行NMS过滤。在这种情况下，无论一个预测框是来自负责小目标的P3层，还是来自负责大目标的P5层，只要它的置信度高，它就有机会被保留。最终选出来的就是针对这个目标的置信度最高的框。
- 可支持多标签与单标签检测。该选项通过multi_label参数进行控制。在multi_label=False的情况下（单标签），每个预测框只属于一个置信度最高的类别，这是最常见的目标检测模式。而如果multi_label=True（多标签），一个预测框可以同时属于多个类别（例如，一个物体既是汽车又是出租车），在具体实现上，它会将一个原始预测框根据超过阈值的类别数拆分成多个检测条目。
- Merge-NMS（加权框融合）。该步骤是一个可选的后处理步骤，通过merge参数控制。对于IoU超过阈值的预测框，不是删除低置信度的框，而是将它们与高置信度的框进行加权平均。此举理论上可以提升定位的精度，因为融合了多个框的位置信息。

## non_max_suppression源代码解读


以下结合YOLOv5源代码中的non_max_suppression函数来解释清楚对模型输出所进行的NMS过滤算法的执行逻辑和流程。

> YOLOv5源代码中的non_max_suppression函数在utils/general.py文件中。

non_max_suppression函数从YOLOv5模型得到的prediction预测数据是一个[batch_size, num_boxes, 5 + nc]结构的张量。其中的batch_size是一次送入模型进行推理的图片数量，则num_boxes对应于每张图片推理结果的预测框总数25200（19200+4800+1200），5+nc表示每个预测框的预测输出数据（center_x, center_y, width, height, object_confidence，class_1，...，class_n）。


以下对于non_max_suppression函数实现的重点流程代码截取出来进行解释。


```python
# NMS算法的实现
def non_max_suppression(
    prediction,
    conf_thres=0.25,
    iou_thres=0.45,
    classes=None,
    agnostic=False,
    multi_label=False,
    labels=(),
    max_det=300,
    nm=0,  # number of masks
):
```


以上就是YOLOv5源代码中non_max_suppression函数的声明，其中：

- prediction：模型推理输出的原始预测数据，包含了大中小三种尺度的所有检测框的信息。
- conf_thres：置信度阈值，用于在执行NMS算法时控制和过滤低置信度的检测框。只有当检测框的置信度（包括物体置信度和类别置信度）大于此阈值时，才会被保留进行后续处理。提高此值会减少检测框数量，但可能会遗漏一些真实物体；降低此值会增加检测框数量，但可能引入更多误检。基于对精确度和召回率的要求设置该值。
- iou_thres：IoU（交并比）阈值，用于NMS算法中判断边界框是否重叠。当两个检测框的IoU大于此阈值时，NMS会保留置信度较高的那个，移除置信度较低的那个。提高此值会保留更多重叠的检测框；降低此值会更积极地移除重叠框。
- classes：指定只保留特定类别的检测结果。如果设置为某个类别索引列表，函数将只返回这些类别的检测框，其他类别会被过滤掉。
- agnostic：控制是否进行类别无关的NMS处理。
    - 当为False（默认）时，NMS在每个类别内部独立执行，不同类别的重叠框不会相互抑制。
    - 当为True时，NMS将所有类别视为同一类，重叠的框会相互抑制，不管它们的类别如何。
- multi_label：控制是否允许多标签检测（即一个物体可能属于多个类别，如检测结果同时是人和男人）。
    - 设置为False（默认）时，每个检测框只保留置信度最高的一个类别。
    - 设置为True时，一个检测框可以保留所有置信度大于conf_thres阈值的类别。
- labels：用于自动标注模式，使用该参数传入先验标签信息。
- max_det：限制每张图像最多输出的检测框数量。默认情况下一张图像最多输出300个有效检测框。
- nm：指定掩码的数量，只用于分割模型。

```python
bs = prediction.shape[0]  # batch size
    nc = prediction.shape[2] - nm - 5  # number of classes
    xc = prediction[..., 4] > conf_thres  # candidates 置信度大于阈值的框为true，否则为false
```


从参数prediction中读取出来批量大小bs（batch size），模型可以一次对多张图像预测，其预测结果张量的第一个维度就是图像的张数bs。nc是模型输出的类别数量，其中的nm仅用于分割模型，对于常用的目标检测模型而言nm为0。xc是比较prediction输出的所有检测框的置信度与参数传递的置信度阈值conf_thres，置信度大于阈值的框被标记为true，否则为false。**实际上prediction输出的绝大多数预测框都在置信度阈值比较这一步被过滤掉了。**


```python
output = [torch.zeros((0, 6 + nm), device=prediction.device)] * bs
    # 遍历每个图像的推理结果
    for xi, x in enumerate(prediction):  # image index, image inference
```


声明一个output变量用于保存后续NMS过滤后的有效检测框，每个检测框的检测信息长度都是6（坐标位置+置信度+类别）。然后用一个for循环从prediction变量中取出每一帧图像进行单独处理，后续的操作都是在这个for循环中针对一帧图像的过滤。


```python
x = x[xc[xi]]  # confidence 只保留置信度大于conf_thres的检测框

        # If none remain process next image
        if not x.shape[0]:  # 如果当前图像没有检测框，则跳过对下一个图像进行处理
            continue
```


通过x = x[xc[xi]]就会在x中仅保留第xi张图片置信度大于conf_thres阈值的检测框，其他检测框都被去掉了。然后判断x列表中的检测框数量是否为0，为0的话就表示当前这一帧图像中没有检测到有效的目标，直接继续对下一帧图像进行处理。


此时，x列表中保存的就是当前图像帧中检测到的所有置信度>conf_thres阈值的检测框信息。


```python
# Compute conf 把每个检测框的置信度乘以类别置信度，得到每个检测框针对每个类别的最终置信度
        x[:, 5:] *= x[:, 4:5]  # conf = obj_conf * cls_conf

        # Box/Mask
        box = xywh2xyxy(x[:, :4])  # center_x, center_y, width, height) to (x1, y1, x2, y2)
```


对x列表中的所有检测框的信息进行处理：给所有类别的判断概率乘以整个检测目标的置信率，得到各个类别的绝对概率；把模型输出的xywh坐标信息转换为nms算法所需要的xyxy格式。


```python
# 整理检测矩阵x，其中包含有预测框的坐标位置，置信度以及类别置信度
        if multi_label: # 对于多标签，在cls部分保留所有类别置信度超过阈值的类别
            i, j = (x[:, 5:mi] > conf_thres).nonzero(as_tuple=False).T
            x = torch.cat((box[i], x[i, 5 + j, None], j[:, None].float(), mask[i]), 1)
        else:  # best class only 对于单标签，仅保留类别置信度最高且超过阈值的那个类别
            conf, j = x[:, 5:mi].max(1, keepdim=True)
            x = torch.cat((box, conf, j.float(), mask), 1)[conf.view(-1) > conf_thres]
```


以上代码整理给nms算法所需要的检测框列表信息，并且利用类别的绝对概率进行一轮过滤。此时分为多label和单label两种情况：

- 多label的情况下，比较各个类别的绝对概率与置信度阈值conf_thres，保留所有绝对概率大于阈值的类别。
- 单label的情况下，从所有类别中找出绝对概率最大的那个类别，然后与置信度阈值conf_thres进行比较。大于阈值的情况下保留。

**此时的x列表中的每个检测框中只包含有一个类别，其格式为[x1,y1,x2,y2,confidence,class]。如果一个检测框同时支持两个类别的话（multi_label开启的情况下），就会在x列表中有两个独立的检测框。**


```python
# Filter by class
        if classes is not None: # 只保留classes参数指定的类别，其他类别不考虑
            x = x[(x[:, 5:6] == torch.tensor(classes, device=x.device)).any(1)]

        # Check shape
        n = x.shape[0]  # number of boxes
        if not n:  # no boxes
            continue
```


如果设置classes参数的话，就在x列表中仅保留classes所指定的类别列表，其他检测框信息全部过滤掉。然后再检查一下当前剩下的检测框数量，如果等于0的话直接进行下一帧图像的处理。


```python
# 基于置信度对预测框进行排序，并且只保留前max_nms个预测框
        x = x[x[:, 4].argsort(descending=True)[:max_nms]]  # sort by confidence and remove excess boxes

        # Batched NMS
        # 根据agnostic参数的设置，决定后续的nms过滤是否需要区分不同类别
        c = x[:, 5:6] * (0 if agnostic else max_wh)  # classes
        boxes, scores = x[:, :4] + c, x[:, 4]  # boxes (offset by class), scores

        # nms的执行结果是一个索引数组，包含了NMS算法保留下来的预测框的索引
        i = torchvision.ops.nms(boxes, scores, iou_thres)  # NMS 调用torchvision的NMS函数
```


以上这部分就到了NMS算法的核心处理步骤了。首先对x列表中的所有检测框按照置信度进行降序排列，并且只保留前max_num个检测框；然后根据agnostic参数的设置，决定后续的nms过滤是否需要区分不同类别，在agnostic=false的情况下，给其类别乘一个很大的数字max_wh（默认为7680），确保各个类别在不同的空间中进行计算，这样就不会在NMS过滤中相互影响了。


最后从x列表中分别取出各个检测框的坐标boxes及其检测置信度scores，然后调用torchvision.ops.nms执行NMS过滤。**torchvision.ops.nms返回的是一个一维整型张量 ，其中包含了经过NMS算法处理后应该保留的边界框的索引，这些索引按照置信度从高到低的顺序排列。**


```python
i = i[:max_det]  # limit detections 最大只保留前max_det个nms输出
        if merge and (1 < n < 3e3):  # Merge NMS (boxes merged using weighted mean)
            # update boxes as boxes(i,4) = weights(i,n) * boxes(n,4)
            iou = box_iou(boxes[i], boxes) > iou_thres  # iou matrix
            weights = iou * scores[None]  # box weights
            x[i, :4] = torch.mm(weights, x[:, :4]).float() / weights.sum(1, keepdim=True)  # merged boxes
            if redundant:
                i = i[iou.sum(1) > 1]  # require redundancy

        output[xi] = x[i]
```


以上代码对torchvision.ops.nms的返回结果仅保留前max_det个结果作为最终的输出。在merge功能开启的情况下，基于IOU的比较对最终输出检测框的坐标位置进行精调，提升坐标位置的定位精度。


最后一步就是把NMS过滤后的检测框列表赋值给output作为non_max_suppression函数的最终输出。


## 参考资料

- [yolov5 极大值抑制 nms 代码详解 - 金色旭光 - 博客园](https://www.cnblogs.com/goldsunshine/p/18306670)
