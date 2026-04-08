---
title: "一文总结YOLOv5模型的自定义训练、测试与模型导出的全过程"
slug: "2025-08-28-the-training-predict-and-ONNX-export-of-YOLOv5"
description: "本文详细总结了基于用户自己指定的训练数据集，对训练数据集及其标注按照YOLO的格式进行预处理，然后对YOLOv5模型进行训练、测试以及ONNX导出等的完整流程。"
date: 2025-08-28T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["CNN","YOLO"]
draft: false
---


本文详细总结了基于用户自己指定的训练数据集，对训练数据集及其标注按照YOLO的格式进行预处理，然后对YOLOv5模型进行训练、测试以及ONNX导出等的完整流程。


## YOLOv5模型的下载和测试


要对YOLOv5模型进行自定义的训练和部署，首先要做的当然就是下载YOLOv5的源代码。在Github上搜索YOLOv5找到Ultralytics的源代码仓库：[ultralytics/yolov5: YOLOv5 🚀 in PyTorch > ONNX > CoreML > TFLite](https://github.com/ultralytics/yolov5) 。


可以看到尽管YOLOv5是比较早期的模型了，但是其开发和维护并没有停止，一直到现在仍然在持续更新中：


![image.png](/images/blog/一文总结YOLOv5模型的自定义训练、测试与模型导出的全过程-1.png)


通过Git Clone或者直接使用HTTPS下载最新版本的代码到本地。


下载下来以后，可以先使用默认训练好的模型调用其中的脚本进行一些测试。**对于YOLOv5模型的基本测试使用而言，主要用到其中的三个脚本文件：trian.py（训练）、detect.py（新样本数据推理）、export.py（模型导出）。**


train.py的主要调用参数：

- -weights : 初始权重文件路径，默认为 yolov5s.pt （官方基于COCO数据集预训练好的参数文件，首次使用时会自动下载），用于加载预训练模型
- -cfg : 模型配置文件 (model.yaml) 路径，定义网络结构。默认的模型配置文件在models目录下。
- -data：训练数据集配置文件。默认的数据集配置文件在data目录下。
- -batch-size：训练过程中每个mini batch的数量，一般是8或者16
- -epochs：训练的轮次数量
- -device : 指定 CUDA 设备，如 0 或 0,1,2,3 或 cpu

基于以上weights和cfg参数的设置情况，对于模型的训练可以分为以下情况：

- 基于YOLO官方提供的预训练模型参数进行训练：此时就只需要通过weights参数传递预训练模型的pt文件即可，其中已经包含了模型的配置信息。
- 基于YOLO模型从头开始训练：将 weights 参数设为空字符串，并提供 cfg 参数设置模型配置。
- 如果同时在命令中提供了 cfg 和 weights 参数，则会优先使用 cfg 定义的模型结构，并尝试加载 weights 中的权重参数（如果结构匹配）。

detect.py的主要调用参数：

- -weights : 指定模型的权重文件路径，默认为 yolov5s.pt 。
- -source : 推理数据的输入源路径，可以是单张图片、视频文件、目录、URL（rtsp、rtmp等）、摄像头索引(0)、屏幕（screen）等。
- -device : 运行设备，可指定为 cpu 或GPU索引(如 0，1 )，默认为自动选择。
- -classes : 指定要检测的类别索引列表，如 --class 0 2 3 ，默认为 None (检测所有类别)。
- -project : 推理结果保存的项目目录，默认为 runs/detect。
- -name : 实验名称(用于创建子目录)，默认为 exp。
- -conf-thres：置信度阈值。只有识别的置信度大于该阈值才会输出结果并标记出来。

export.py的主要调用参数：

- -data : 模型训练所使用的数据集配置YAML文件路径，默认为 data/coco128.yaml ，用于提供类别信息等元数据。
- -weights : 要导出的模型权重文件路径。
- -batch-size : 批处理大小，默认为 1。
- -include : 指定要导出的模型格式列表，默认为 torchscript ，支持的格式包括：
    - torchscript : PyTorch的TorchScript格式
    - **onnx : ONNX格式**
    - openvino : Intel OpenVINO格式
    - engine : NVIDIA TensorRT格式
    - coreml : Apple CoreML格式
    - saved_model : TensorFlow SavedModel格式
    - pb : TensorFlow GraphDef格式
    - tflite : TensorFlow Lite格式
    - edgetpu : TensorFlow Edge TPU格式
    - tfjs : TensorFlow.js格式
    - paddle : PaddlePaddle格式

YOLOv5源代码目录中的data子目录里面，包含了多个标准图像数据集的配置文件，可以先使用这些标准数据集及其配置文件测试YOLOv5模型的训练流程（此处使用coco128数据集）：


```bash
# 从头训练
python train.py --model models/yolov5s --weights '' --data data/coco128.yaml --batch-size 16

# 基于预训练模型yolov5s.pt进行训练
python train.py --weights yolov5s.pt --data data/coco128.yaml --batch-size 16
```

> 每次调用以上脚本进行的训练流程，都会在run/train下创建一个exp目录，其中包含有训练过程中所生成的各种中间文件。训练完成后，生成的权重参数文件就是这个目录下的weights/best.pt文件。

同样的，可以使用以下命令对Yolov5源代码中自带的图片，使用detect.py进行推理测试：


```bash
python.exe detect.py --source .\data\images --weight .\yolov5s.pt --project .\runs\detect\ --conf-thres 0.5
```


以上脚本会对data/images下的所有图片进行推理，推理生成的标注图片在runs/detect/exp目录下。


![image.png](/images/blog/一文总结YOLOv5模型的自定义训练、测试与模型导出的全过程-2.png)


## 训练数据集的准备


前面对Yolo模型的基本使用做了简单的测试。接下来，就是准备要准备自定义的数据集进行模型的训练了。


本文以口罩检测作为学习案例，网络上有大量的这类公共数据集可用，因此可以直接首先搜索可以满足训练需求的公共数据集。

- 网站kaggle，Roboflow，Huggingface等提供了大量的公开数据集，可以根据自己的需求在这些网站上搜索。

本文以Kaggle上的Face Mask Detection数据集对Yolov5模型进行训练：[Face Mask Detection](https://www.kaggle.com/datasets/andrewmvd/face-mask-detection)。该数据集对图片中的人是否戴口罩进行检测，整个数据集共853张图片，检测结果有三种：未戴口罩，戴口罩，未正确戴口罩。标注格式为Pascal VOC格式。


![image.png](/images/blog/一文总结YOLOv5模型的自定义训练、测试与模型导出的全过程-3.png)


Kaggle上的Face Mask Detection数据集下载后，需要首先对其图片及其标注信息进行预处理，预处理为Yolo模型所需要的格式。对于Face Mask Detection数据集而言，要做的预处理包括：

- 把该数据集所采用的Pascal VOC标注格式转换为Yolo格式。
- 把该数据集中的图片和标注集以85:10:5的比例切分为训练集、验证集、测试集三个部分。
- 按照Yolo模型训练所需要的训练数据集目录要求分别保存在train、valid、test三个子目录中。
- 准备该数据集用于Yolo训练的配置描述文件FaceMask.yaml。

Pascal VOC是一种常用的目标检测类型的标注格式，与Yolo模型训练所要求的标注格式大相迥异，所以我专门写了一个voc_to_yolo.py的脚本用于实现以上预处理流程的第1-3步：标注格式转换、数据切分、yolo训练目录结构建立。使用该脚本就可以实现从Pascal VOC数据集到Yolo训练数据集的转换：


```bash
python voc_to_yolo.py --voc_dir ..\datasets\FaceMask\annotations\ --images_dir ..\datasets\FaceMask\images\ --output_dir ..\datasets\FaceMask\yolo\ --class_names 'without_mask,with_mask,mask_weared_incorrect'
```


下图是Face Mask数据集转换前后的目录结构示意图。

- 转换前的原始数据集中，所有的图片在images目录下，所有的Pascal VOC标注格式的标注信息在annotations目录下。
- 转换后的完整yolo数据集在yolo目录下，其中包含有test、train、valid三个子目录，分别对应测试、训练和验证数据集，其下又包含各自的图片文件子目录和Yolo标注文件子目录。

![image.png](/images/blog/一文总结YOLOv5模型的自定义训练、测试与模型导出的全过程-4.png)


基于以上已经准备好的Yolo格式的训练数据集，整理与之对应的数据集描述配置文件FaceMask.yaml如下。后续在训练过程需要使用该文件指定训练数据集的路径、识别和检测类型名称数量等信息。


```yaml
path: ../datasets/FaceMask/yolo
train: train/images
val: valid/images

nc: 3
names:
  0: 'no-mask'
  1: 'mask'
  2: 'incorrect'
```


## 模型训练和测试


基于以上预处理好的数据集在Yolov5预训练模型上进行训练：


```bash
python.exe train.py --data FaceMask.yaml --weights yolov5s.pt --batch-size 8
--epochs 50
```


在CPU上进行训练的时间比较长，不到1000张图片，在我的Thinkpad X260笔记本上训练的时间超过了一天。训练完成后生成的模型参数文件在runs\train\exp9\weights目录下的best.pt文件。


使用以上训练生成的模型参数文件对前一阶段分割出来的测试数据集进行测试：


```bash
python.exe detect.py --source ..\datasets\FaceMask\yolo\test\images\ --weight .\runs\train\exp9\weights\best.pt --project .\runs\detect\ --conf-thres 0.5
```


以上脚本会对datasets\FaceMask\yolo\test\images\所指定的测试数据集中的所有图片进行推理，推理结果保存在runs/detect下的一个新建exp目录中，置信度大于0.5的识别结果会画框标记出来是否有正确的戴口罩。


![image.png](/images/blog/一文总结YOLOv5模型的自定义训练、测试与模型导出的全过程-5.png)


## 模型的ONNX导出


接下来就可以使用Yolov5源代码目录中的export.py，把前一步骤训练出来的best.pt参数权重文件导出为onnx标准模型文件，在onnxruntime等标准化的环境中进行部署了：


```bash
python.exe export.py --weights .\runs\train\exp9\weights\best.pt --data .\data\FaceMask.yaml --device cpu --include onnx
```


以上脚本执行后就会在best.pt相同路径下生成一个best.onnx文件，这就是模型导出的ONNX文件了。


## 参考资料

- [ultralytics/yolov5: YOLOv5 🚀 in PyTorch > ONNX > CoreML > TFLite](https://github.com/ultralytics/yolov5) 。
- [Face Mask Detection](https://www.kaggle.com/datasets/andrewmvd/face-mask-detection)
