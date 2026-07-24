---
title: "如何理解ONNX模型导出的Opset版本？"
slug: "2026-04-08-how-to-understand-the-opset-version-in-ONNX-export-process"
description: "在把PC或服务器上基于Pytorch训练好的模型导出为ONNX格式的时候，需要在导出的脚本中设置opset的版本，不同的opset版本设置会对后续的NPU适配过程造成很大的影响，那么这个opset的版本就是是个什么概念？不同的opset版本究竟有哪些差异，以及这些差异对后续的NPU适配过程如何造成影响？本文尝试回答以上问题。"
date: 2026-04-08T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["ONNX","NPU"]
draft: false
---


在把PC或服务器上基于Pytorch训练好的模型导出为ONNX格式的时候，需要在导出的脚本中设置opset的版本，不同的opset版本设置会对后续的NPU适配过程造成很大的影响，那么这个opset的版本就是是个什么概念？不同的opset版本究竟有哪些差异，以及这些差异对后续的NPU适配过程如何造成影响？本文尝试回答以上问题。


从总的概念上来讲，在嵌入式AI模型的部署流程中，**Opset（即Operator Set，算子集）** 是 ONNX（Open Neural Network Exchange）所定义的算子集合的版本标准。在将PC上训练好的 PyTorch（.pt/.pth）模型导出为 ONNX 格式时，设置正确的 opset 版本至关重要，因为它直接决定了导出的模型能否在后续的NPU板端模型转换工具成功转换，并高效运行在 NPU 上 。


![image.png](/images/blog/如何理解ONNX模型导出的Opset版本？-1.png)


要理解不同的Opset对后续的NPU模型适配和部署流程会造成什么样的影响，首先要深入的理解究竟什么是算子和什么是算子集。


## 什么是算子（Operator/Op）和算子集（Operator Set）？


**在 AI 模型的语境之中，算子（Operator）是模型里的最小执行单元。**一个典型的深度学习模型（例如 YOLO 模型），其本质就是一个巨大的有向无环计算图（DAG）。这个图由无数个节点组成，而每个节点就是一个算子。


这就有点类似于我们在写软件程序的时候，如果要实现某项功能，通常会把这个功能封装为一个函数来进行调用。那么_算子就类似于一个可被应用程序调用的标准库函数，对这个算子（函数）的调用，就相当于是在NPU上执行一次最小粒度的标准化操作。_


常见的算子包括：

- Conv (卷积)：提取特征，相当于嵌入式里的滤波算法。
- ReLU (激活函数)：实际上就是一个简单的 `if(x<0) x=0;` 逻辑。
- Pooling (池化)：降采样，缩小图片尺寸。
- Concat (拼接)：把两个内存 Buffer 的数据连在一起。

算子集就是所有的标准化算子的集合。而既然算子相当于是一个标准函数，那么**算子集就也就类似于标准函数库，例如C 语言的标准库（C89, C99, C11） 或者 ARM 指令集版本（v7, v8, v9）**。


随着 AI 技术的发展，新的算法以及其对应的底层算子层出不穷，原本的算子集很快就不够用了。于是，ONNX 组织就会定期更新这个标准算子库以支持这些最新的算法。例如：

- Opset 9：可能只定义了基本的加减乘除和卷积。
- Opset 11：增加了对动态缩放（Resize）更好的支持。
- Opset 16：增加了对更复杂的 Transformer 结构（如更智能的 GridSample）的支持。

以上就是不同的算子集版本要不断向前演进的原因所在。


### Opset不同版本的向后兼容？


以上提到，为了适应新的算法和模型对于底层算子的增加需求，ONNX 组织要不断地更新 Opset 的版本，这也就意味着新的Opset版本所能够支持的算子越来越多。


但是需要注意的是：Opset 版本的演进并非是简单的把新的算子增加进来，而是从多个维度上优化其中所包含的各个算子的设计:

- 算子的更新（Versioning）:ONNX 并不是给每一个微小的改动都取个新名字，有可能新版本中算子的名称相同，但是对算子的定义进行了更新，因此对于开发者来说，算子总数没变，但功能增强了。
- 算子的合并与泛化（Generalization）：为了保持简洁，ONNX 官方会把功能重复的算子合并。因此，旧的特定算子会被标记为 Deprecated（弃用），在新 Opset 版本中由功能更全的算子取代，可能会导致算子的总数下降。
- 算子的拆分（Decomposition）：有时为了让 NPU 硬件更容易实现，一个比较复杂的算子会在新版本中被拆解为几个基础算子的组合。

总而言之，ONNX Opset的向后兼容性是指：**高版本的推理引擎能够解析并运行低 Opset 版本的模型，而不是简单无脑的不断扩充新增加的算子类型。**


下图是ONNX Opset的每次演进新增加/更新的算子数量的统计图，从其中可以看到每一个演进版本的变化状况。目前主流 Opset 中活跃的算子总数通常在 150 - 200 个 之间。


![image.png](/images/blog/如何理解ONNX模型导出的Opset版本？-2.png)


## 模型 NPU 适配的 Opset 要求


AI 模型在嵌入式 NPU 上进行适配的开发流程中，ONNX 导出只是第一步，真正的挑战在于 NPU 的模型转换工具（编译器） 如何理解这个 ONNX 模型中所包含的算子。一般来讲，NPU的模型转换工具对于能够支持的Opset版本有严格的要求，那么在模型的 ONNX 导出时就需要考虑NPU模型转换工具的要求。


以下以瑞芯微的RK3588为例，来说明模型的 ONNX 导出与NPU板端适配之间的Opset版本对应关系。


在向 RK3588 中的 NPU上部署AI模型时，模型 ONNX 文件中的 Opset 版本的对应关系涉及到三个环节：

- 导出端 (PyTorch/ONNX)：决定了在导出为 ONNX 文件时的Opset版本，在 ONNX 导出的参数中进行设置。
- 转换端 (RKNN-Toolkit2)：模型的编译和转换器，把 ONNX 格式的模型转换为可以在 RK3588 上运行和调用的模型格式 rknn，对于Opset版本有自己的要求。
- 运行端 (RKNN Driver/Runtime)：这是 NPU 硬件的驱动，决定了转换后的 rknn 格式的模型能否在硬件上跑通。一般来讲，NPU 驱动和runtime版本应该与模型转换工具RKNN-Toolkit2的版本相一致。

 在具体的模型适配过程中，重点是要确保 ONNX 导出的 opset 版本不应高于 RKNN-Toolkit2 能够支持的版本，但是也不应过低。

- 当 ONNX 模型文件的 Opset 设置过高的话，板端模型转换工具如 RKNN-Toolkit2 遇到新版本中所定义的算子或者由于 Opset 版本变动导致的算子属性不匹配时，转换工具会抛出类似 `Meet unsupported operator` 或 `Invalid node` 的错误并终止运行 。
- 同时 Opset 的版本也不应该过低，早期版本的 ONNX 对某些复杂算子（如 `Upsample` 或 `Resize`）的定义比较模糊，转换器可能无法正确解析量化所需的参数，从而导致量化模型推理结果异常或者精度下降 。

因此，**对于 ONNX 模型导出 Opset 版本的黄金建议就是：参考NPU板端模型转换工具说明手册中，对于ONNX规范或者Opset版本的要求，严格遵循板端模型转换工具的要求来设置 Opset 的版本。**


在`02_Rockchip_RKNPU_User_Guide_RKNN_SDK_V2.3.2_CN`文档中提到的ONNX推荐版本是：


![b8b5dad5-bf6e-4eef-bcf4-f6c8340c207a.png](/images/blog/如何理解ONNX模型导出的Opset版本？-3.png)


而 ONNX 协议版本与其支持的 Opset 版本的对应关系如下：[https://onnxruntime.ai/docs/reference/compatibility.html](https://onnxruntime.ai/docs/reference/compatibility.html)


![ec2735c2-6129-4863-8193-7340e19dee94.png](/images/blog/如何理解ONNX模型导出的Opset版本？-4.png)


因此，在 Rockchip NPU的2.3.2版本的模型转换工具和板端NPU驱动上最高能够支持的Opset版本就是15。实际的部署过程中，最好的Opset版本设置应该是12或者13，避免版本过新有可能带来的稳定性和兼容性问题。


## 如何决定算子在NPU还是CPU中计算？


在嵌入式 NPU 上，一个即使经过完美适配和部署的模型，也并不是非黑即白地全部运行在 NPU 上，而是一场由板端模型转换工具和Runtime配合指挥的接力赛：一部分操作放在NPU上，一部分操作放在CPU上。


**那么对于最终在板端上调用NPU运算的 Runtime 而言，它是如何决定哪些算子应该在NPU上运行还是在CPU上运行呢？**


对于以上问题，首先要搞清楚板端模型转换工具（如RKNN-Toolkit2）在进行模型转换时，是如何处理不支持的算子的。大致可以把所谓的“NPU不支持的算子”分为三种情况：

- 算子语法级不支持的情况：板端转换工具会直接报错并退出。
    - 当因为 Opset 版本不一致所导致的算子无法识别、算子属性对应不成功等问题时，**板端转换工具会直接报错并退出执行，模型转换失败**。
- 算子逻辑级不支持的情况：该算子的计算会自动回退到 CPU。
    - 板端转换工具认识这个算子，也知道它的数学逻辑，但它知道当前 NPU 硬件无法加速执行这个逻辑。例如这些算子包含有复杂的逻辑分支（If-Else）、循环或非线性计算，不符合 NPU 并行流水线的硬件设计。**在这种情况下，模型转换会成功，但编译器会将这些算子标记为在 CPU 上运行。在后续由Runtime调度运行时，NPU 会把数据交还给 ARM CPU 来进行处理，算完后再传回 NPU。**
- 用户手动指定在 CPU 上执行的算子：当然会回退到CPU上运行
    - 有时算子虽然 NPU 支持，但因为量化精度的损失太大，用户可以在手动设置，强制让某些层跑在 CPU 上以保持精度。

因此基于以上理解，在模型板端执行工具对模型的转换过程中，会自动把每个算子应该放在 NPU 上运行还是放在 CPU 上运行建立了一个清单。这样，当这个模型文件在板端加载并运行后，板端Runtime (例如Rockchip的Librknnrt.so) 就会按照转换时所生成的调度表清单来进行执行。

- 对于在 NPU 上所进行的计算而言，数据进入 NPU 专用的内存区域（SRAM/DDR），在 NPU 上进行并行加速计算。
- 当遇到 NPU 不支持的算子时，NPU 必须停下，将中间结果写回CPU可以访问的内存，由CPU接管。
- CPU 通过 NPU 的内核驱动拿到数据，利用 Neon 或者其他 SIMD 指令集完成计算。
- 再把计算结果返回 NPU继续执行后面的层。

## ONNX 模型Opset版本检测以及算子统计


最后，提供以下代码用于统计 ONNX 模型文件所使用的Opset版本，该模型文件中所包含的算子类型以及数量：


```python
import onnx

model = onnx.load("_my_research/output/onnx/rtdetrv2_r18vd_120e_coco.onnx")
print(f"Opset version: {model.opset_import[0].version}")

# 统计算子类型
op_types = [node.op_type for node in model.graph.node]
from collections import Counter
print(Counter(op_types))
```


打印信息如下：可以看到，我当前的这个rtdetrv2的ONNX模型文件适应的Opset版本是version 13，可以通过该信息检查 ONNX 模型文件中所包含的算子类型与NPU板端模型转换工具的要求是否一致。


```python
(new-env) PS D:\Code\Github\RT-DETR> & D:/Anaconda/envs/new-env/python.exe d:/Code/Github/RT-DETR/_my_research/onnx_operator_calculate.py
Opset version: 13
Counter({'Constant': 1026, 'Mul': 485, 'Add': 466, 'Gather': 326, 'Transpose': 222, 'Identity': 211, 'Shape': 196, 'Reshape': 178, 'Sub': 141, 'MatMul': 109, 'Cast': 108, 'Concat': 101, 'Clip': 90, 'Unsqueeze': 87, 'Flatten': 72, 'Div': 64, 'Slice': 58, 'Conv': 57, 'Relu': 45, 'ReduceMean': 42, 'Expand': 38, 'Floor': 36, 'Sigmoid': 35, 'Pow': 21, 'Sqrt': 21, 'Softmax': 13, 'Gemm': 7, 'Split': 6, 'ReduceSum': 6, 'Log': 6, 'AveragePool': 3, 'Resize': 2, 'ConstantOfShape': 2, 'Tile': 2, 'GatherElements': 2, 'MaxPool': 1, 'Erf': 1, 'ReduceMax': 1, 'TopK': 1})
```


## 参考资料

- [ONNX Opset Operator Counts - Lei Mao's Log Book](https://leimao.github.io/blog/ONNX-Opset-Operator-Counts/)
- [https://github.com/onnx/onnx/blob/main/docs/Operators.md](https://github.com/onnx/onnx/blob/main/docs/Operators.md)
- [Compatibility | onnxruntime](https://onnxruntime.ai/docs/reference/compatibility.html)
