---
title: "总结Android Flutter项目中YOLO模型的执行流程"
slug: "2026-04-27-the-summary-of-YOLO-modal-workflow-in-android-flutter-project"
description: "之前基于 Flutter 实现了一个在Android APP中调用YOLO模型来实现图像目标检测功能，本文的 YOLO 模型的 TFLite 导出以及在 Android Flutter 项目中进行调用的完整执行流程进行总结。
在Android上跑AI模型，标准的做法是导出模型文件为 TFLite 格式，然后在 Android 的 TFLite+Interpreter+NCAPI 框架下执行AI模型的推理流程，与该框架相关的知识可参考 "
date: 2026-04-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["TFLite","Android","flutter","YOLO"]
draft: false
---


之前基于 Flutter 实现了一个在Android APP中调用YOLO模型来实现图像目标检测功能，本文的 YOLO 模型的 TFLite 导出以及在 Android Flutter 项目中进行调用的完整执行流程进行总结。


在Android上跑AI模型，标准的做法是导出模型文件为 TFLite 格式，然后在 Android 的 TFLite+Interpreter+NCAPI 框架下执行AI模型的推理流程，与该框架相关的知识可参考 [如何理解TFLite/LiteRT的核心概念和框架流程？](https://pavelhan.tech/article/2026-04-26-How-to-understand-the-core-concept-and-workflow-of-TFLite/)一文。


## YOLO模型的TFLite导出


因为 Ultralytics 项目中的模型导出的实现已经非常完备，所以可以直接在ultralytics项目中通过其export接口导出 `tflite` 模型文件即可，此处选择导出为`half`即float16的格式：


```python
model_path = "yolov8n.pt"
model = YOLO(model_path)

# 根据精度设置导出参数
if PRECISION == "float16":
    model.export(format="tflite", half=True)
    tflite_filename = f"{MODEL_NAME}_float16.tflite"
elif PRECISION == "int8":
    model.export(format="tflite", int8=True)
    tflite_filename = f"{MODEL_NAME}_int8.tflite"
else:  # float32
    model.export(format="tflite")
    tflite_filename = f"{MODEL_NAME}_float32.tflite"
```


此外，后续在Flutter项目中调用以上模型文件进行推理，还需要创建一个与模型对应的`label.txt`文件，其中包含有模型检出类别对应的类别名称字符串，按顺序每行一个。因为我测试中直接使用的是YOLO的预训练pt文件，预训练模型文件对应的是COCO数据集，所以这里的`label.txt`中包含的类别名称字符串大致就是如下80个类别：


```python
person
bicycle
car
motorcycle
airplane
...
```


## 依赖管理


因为要在 Android Flutter APP 增加跑AI模型的的能力，首先需要在项目根目录下的`pubspec.yaml`和 android/app 目录下的`build.gradle.kts`增加相关的依赖项。


flutter项目中的`pubspec.yaml`是该项目的元数据中心（Metadata Center）和依赖管理器（Dependency Manager）。其中包含的主要内容是：项目的基本配置信息，生产环境的依赖库，开发/测试阶段的依赖库，资源与资产等。对于以上提到的依赖项，每次在构建项目时，都会自动调用 `flutter pub get` 从pub.dev下载指定依赖库的源代码到本地。


该项目中需要对手机camera和本地图片的图像调用YOLO模型进行检测，所以`pubspec.yaml`中相关的设置项包括：


```yaml
dependencies:
  flutter:
    sdk: flutter

  camera: ^0.11.1 # 负责原始音视频流（YUV 数据）的采集。
  image_picker: ^1.2.1 # 用于从设备相册中选择图片或者拍照
  flutter_vision: ^2.0.0 # 集成的视觉框架，内部已经隐式依赖了 TFLite 的原生库（即C++ 层的 Interpreter）。
  flutter_riverpod: ^3.3.1 # 负责状态管理
  flutter_hooks: ^0.21.3+1 # 负责状态管理
  wakelock_plus: ^1.5.1 # 防止手机在跑 AI 模型时自动熄屏。

flutter:
  uses-material-design: true
  assets:
    - assets/models/ # 模型的tflite文件放到项目的该目录中
```


因此，**对于在 Android 项目中跑YOLO模型而言，以上配置文件最关键的就是其中导入了** **`flutter_vision`** **这个插件**。该插件内置了 TensorFlow Lite C SDK，并针对 YOLO 这种特定模型，包含了输入输出的 `ByteBuffer`、维度转换（Tensor Shape）和 NMS（非极大值抑制）等的相关处理，对于应用层程序而言，只需要调用 `vision.loadYoloModel()` 接口，它就可以在 Android 原生层创建 TFLite 的 `Interpreter`并执行推理任务。


## 模型在Flutter中的完整推理流程


与其他板端模型的完整推理流程类似，在Android Flutter项目中调用YOLO模型执行推理任务同样包含**模型加载、前向推理以及后处理**这三个环节。


### 模型加载


基于flutter_vision插件对AI模型进行加载的整体流程如下：


```dart
import 'package:flutter_vision/flutter_vision.dart';

			final FlutterVision _vision = FlutterVision();
			
			// 调用loadYoloModel创建一个模型加载的异步任务
      final loadFuture = _vision.loadYoloModel(
        modelPath: "assets/models/yolov8n_fp16.tflite", //模型文件
        labels: "assets/models/label.txt",  //label文件
        modelVersion: "yolov8", //模型的版本标识 ，必须设置正确，这样插件才能正确解析和处理模型输出
        numThreads: 1,
        useGpu: true, //使能GPU
      );

      // 等待以上的模型加载任务完成
      await loadFuture;
```


整体的模型加载过程很简单，调用flutter_vision的loadYoloModel接口创建一个模型加载的异步任务，传递模型文件和label文件等参数，然后等待这个异步任务执行完成即可。


需要注意的是，**flutter_vision 插件只能够支持ultralytics项目export接口直接以tflite格式导出的YOLOv5，YOLOv8，YOLOv11这几个模型**，而且参数中指定的模型文件与modelVersion的参数必须设置正确，否则后续的后处理流程会出错：


![074e2e0e-d2b9-48e6-b0b2-4a1f06769c23.png](/images/blog/总结Android-Flutter项目中YOLO模型的执行流程-1.png)


那么如果我们要在 Android APP 中跑其他模型呢？那就只能使用 `tflite_v2` 插件、`flutter_tflite`插件或者底层 TensorFlow Lite API。


## 前向推理和后处理


`flutter_vision`插件的前向推理过程主要就是调用其`yoloOnFrame`（针对摄像头的图像）和`yoloOnImage`接口（针对本地图片）。


```dart
List<Map<String, dynamic>> results = [];
      if (input is CameraImage) {
        results = await _vision.yoloOnFrame(  //摄像头图像
          bytesList: input.planes.map((plane) => plane.bytes).toList(),
          imageHeight: input.height,
          imageWidth: input.width,
          iouThreshold: 0.4,
          confThreshold: 0.35,
          classThreshold: 0.5,
        );
      } else if (input is Uint8List) {  //本地图片
        results = await _vision.yoloOnImage(
          bytesList: input,
          imageHeight: 640, 
          imageWidth: 640,
          iouThreshold: 0.4,
          confThreshold: 0.3,
          classThreshold: 0.5,
        );
      }
```


以上的推理接口执行中本身已经包含了YOLO不同版本的后处理流程，所以其输出结果是一个`<String, dynamic>`的数组。这个数组中的每一项都对应于一个最终检测框的类比和坐标+置信度，如下所示：


```dart
List<Map<String, dynamic>> results = [
  {
    "tag": "person",           // String: 检测类别标签
    "box": [x1, y1, x2, y2, confidence]  // List<double>: 检测框坐标和置信度
  },
  {
    "tag": "car",
    "box": [x1, y1, x2, y2, confidence]
  },
  // ... 更多检测结果
]
```


应用层拿到以上的这个数组以后，就可以对其中的内容进行解析并在图像上画框标注了。因为 yoloOnFrame 和 yoloOnImage 接口中已经包含了后处理的NMS等环节，所以不需要在应用层再执行后处理了。


## 参考资料

- [flutter_vision | Flutter package](https://pub.dev/packages/flutter_vision)
