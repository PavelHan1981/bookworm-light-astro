---
title: "How to Understand the Opset Version in the ONNX Model Export Process"
slug: "2026-04-08-how-to-understand-the-opset-version-in-ONNX-export-process"
description: "When exporting a PyTorch-trained model from a PC or server to the ONNX format, you need to configure the opset version in the export script. Different opset versions heavily impact the subsequent NPU adaptation process. So what exactly is an opset version? What are the differences between opset versions, and how do these differences affect subsequent NPU adaptation? This article attempts to answer these questions."
date: 2026-04-08T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["ONNX","NPU"]
draft: false
---

When exporting a PyTorch-trained model from a PC or server to the ONNX format, you need to configure the opset version in the export script. Different opset versions heavily impact the subsequent NPU adaptation process. So what exactly is an opset version? What are the differences between opset versions, and how do these differences affect subsequent NPU adaptation? This article attempts to answer these questions.

Generally speaking, in the deployment workflow of embedded AI models, **Opset (Operator Set)** is the version standard for the set of operators defined by ONNX (Open Neural Network Exchange). When exporting a PyTorch model (`.pt/.pth`) trained on a PC into the ONNX format, setting the correct opset version is crucial because it directly determines whether the exported model can be successfully converted by subsequent NPU edge model conversion tools and run efficiently on the NPU.

![image.png](/images/blog/如何理解ONNX模型导出的Opset版本？-1.png)

To understand how different opsets affect the subsequent NPU model adaptation and deployment workflow, we must first deeply understand what operators and operator sets actually are.

## What are Operators (Ops) and Operator Sets (Opsets)?

**In the context of AI models, an operator (op) is the smallest execution unit within a model.** A typical deep learning model (such as a YOLO model) is essentially a massive Directed Acyclic Graph (DAG). This graph consists of countless nodes, where each node represents an operator.

This is somewhat similar to writing software programs: when implementing a certain functionality, we usually encapsulate it into a function and call it. Thus, *an operator is like a standard library function that can be called by an application, and invoking this operator (function) is equivalent to executing a minimum-granularity standardized operation on the NPU.*

Common operators include:

- Conv (Convolution): Extracts features, equivalent to a filtering algorithm in embedded systems.
- ReLU (Activation Function): Essentially a simple `if(x<0) x=0;` logic.
- Pooling: Downsampling to reduce image dimensions.
- Concat: Concatenating data from two memory buffers.

An operator set is a collection of all standardized operators. Since an operator is analogous to a standard function, **an operator set is analogous to a standard function library—such as the C language standard libraries (C89, C99, C11) or ARM instruction set versions (v7, v8, v9).**

With the development of AI technology, new algorithms and their underlying operators emerge endlessly, rendering original operator sets outdated quite quickly. Consequently, the ONNX organization regularly updates this standard operator library to support the latest algorithms. For example:

- Opset 9: May have only defined basic arithmetic and convolution.
- Opset 11: Added better support for dynamic scaling (`Resize`).
- Opset 16: Added support for more complex Transformer structures (such as the smarter `GridSample`).

This is why different operator set versions must continuously evolve.

### Backward Compatibility of Different Opset Versions?

As mentioned earlier, to adapt to the increasing demands for underlying operators driven by new algorithms and models, the ONNX organization constantly updates the Opset versions. This means newer Opset versions support a growing number of operators.

However, it is important to note that the evolution of Opset versions is not merely a naive accumulation of new operators; rather, it optimizes the design of various included operators across multiple dimensions:

- Operator Versioning: ONNX does not assign a brand-new name to every minor tweak. Sometimes an operator retains the same name in a newer version, but its definition is updated. Therefore, for developers, the total number of operators remains unchanged, but their functionality is enhanced.
- Operator Merging and Generalization: To maintain simplicity, the official ONNX organization merges operators with overlapping functions. Consequently, older specific operators are marked as `Deprecated` and replaced in newer Opset versions by more comprehensive operators, which may lead to a decrease in the total operator count.
- Operator Decomposition: Sometimes, to make it easier for NPU hardware to implement, a relatively complex operator is decomposed into a combination of several basic operators in newer versions.

In short, the backward compatibility of ONNX Opset means that **higher-version inference engines can parse and run models of lower Opset versions, rather than just blindly expanding newly added operator types.**

The chart below shows statistics on the number of newly added/updated operators in each evolution of ONNX Opset, illustrating the changes across versions. Currently, the total number of active operators in mainstream Opsets typically ranges between 150 and 200.

![image.png](/images/blog/如何理解ONNX模型导出的Opset版本？-2.png)

## Opset Requirements for Model NPU Adaptation

In the development workflow of adapting AI models to embedded NPUs, ONNX export is only the first step. The real challenge lies in how the NPU model conversion tool (compiler) interprets the operators contained within the ONNX model. Generally speaking, NPU model conversion tools have strict requirements for supported Opset versions, which must be taken into account when exporting the model to ONNX.

Taking Rockchip's RK3588 as an example, let's look at the correspondence of Opset versions between model ONNX export and NPU edge adaptation.

When deploying an AI model to the NPU in the RK3588, the Opset version correspondence in the ONNX file involves three stages:

- Export End (PyTorch/ONNX): Determines the Opset version when exporting to the ONNX file, configured via ONNX export parameters.
- Conversion End (RKNN-Toolkit2): The model compiler and converter that transforms the ONNX model into the `.rknn` model format that can run and be invoked on the RK3588. It has its own requirements for Opset versions.
- Runtime End (RKNN Driver/Runtime): The NPU hardware driver, which determines whether the converted `.rknn` model can run successfully on the hardware. Generally, the NPU driver and runtime versions should match the version of the model conversion tool, RKNN-Toolkit2.

During specific model adaptation, the key focus is ensuring that the ONNX export Opset version is neither higher than what RKNN-Toolkit2 supports nor excessively low.

- If the Opset version of the ONNX model file is set too high, edge model conversion tools like RKNN-Toolkit2 will encounter operators defined in newer versions or attribute mismatches caused by Opset version changes, throwing errors such as `Meet unsupported operator` or `Invalid node` and aborting execution.
- Meanwhile, the Opset version should not be too low either. Early ONNX versions had relatively vague definitions for certain complex operators (such as `Upsample` or `Resize`), which may prevent the converter from correctly parsing parameters required for quantization, resulting in abnormal quantized model inference results or accuracy degradation.

Therefore, **the golden rule for the Opset version of ONNX model exports is: consult the user manual of the NPU edge model conversion tool for its specifications regarding ONNX standards or Opset versions, and strictly follow those requirements when configuring the Opset version.**

The recommended ONNX version mentioned in the document `02_Rockchip_RKNPU_User_Guide_RKNN_SDK_V2.3.2_CN` is:

![b8b5dad5-bf6e-4eef-bcf4-f6c8340c207a.png](/images/blog/如何理解ONNX模型导出的Opset版本？-3.png)

The mapping between ONNX specification versions and their supported Opset versions can be found here: [https://onnxruntime.ai/docs/reference/compatibility.html](https://onnxruntime.ai/docs/reference/compatibility.html)

![ec2735c2-6129-4863-8193-7340e19dee94.png](/images/blog/如何理解ONNX模型导出的Opset版本？-4.png)

Therefore, the maximum Opset version supported by Rockchip NPU's version 2.3.2 model conversion tool and edge NPU driver is 15. In actual deployment, the optimal Opset version setting is typically 12 or 13 to avoid potential stability and compatibility issues introduced by overly new versions.

## How to Decide Whether an Operator Executes on the NPU or CPU?

On an embedded NPU, even a perfectly adapted and deployed model does not run entirely on the NPU in a black-and-white fashion. Instead, it resembles a relay race orchestrated by the edge model conversion tool and runtime: some operations are executed on the NPU, while others are handed off to the CPU.

**So, for the Runtime that invokes NPU computation on the edge device, how does it decide whether a specific operator should run on the NPU or the CPU?**

To answer this, we must first understand how edge model conversion tools (such as RKNN-Toolkit2) handle unsupported operators during conversion. "Operators unsupported by the NPU" can generally be divided into three scenarios:

- Syntactically Unsupported Operators: The edge conversion tool throws an error and exits directly.
    - When operators are unrecognized due to mismatched Opset versions or operator attributes fail to align, **the edge conversion tool throws an error and halts execution, causing model conversion to fail.**
- Logically Unsupported Operators: Computation of these operators automatically falls back to the CPU.
    - The edge conversion tool recognizes the operator and understands its mathematical logic, but it knows the current NPU hardware cannot accelerate execution for this logic. For example, if these operators contain complex logic branches (`If-Else`), loops, or non-linear computations that do not fit the hardware design of the NPU parallel pipeline, **the model conversion succeeds, but the compiler flags these operators to run on the CPU. During runtime scheduling, the NPU hands the data over to the ARM CPU for processing, and passes the results back to the NPU afterward.**
- Operators Manually Designated by the User to Run on the CPU: Naturally falls back to the CPU.
    - Sometimes, even if an operator is supported by the NPU, users may manually configure specific layers to run on the CPU to preserve accuracy if quantization accuracy loss is too severe.

Based on the understanding above, during model conversion, the edge execution tool automatically builds an inventory dictating whether each operator should run on the NPU or the CPU. Thus, when the model file is loaded and executed on the edge device, the edge Runtime (such as Rockchip's `librknnrt.so`) executes tasks according to this schedule generated during conversion.

- For computations executed on the NPU, data enters the NPU's dedicated memory region (SRAM/DDR) for parallel accelerated computing.
- When an operator unsupported by the NPU is encountered, the NPU must pause, write intermediate results back to CPU-accessible memory, and let the CPU take over.
- The CPU retrieves data via the NPU kernel driver, completes the computation using Neon or other SIMD instruction sets.
- It then passes the calculation results back to the NPU to continue executing subsequent layers.

## ONNX Model Opset Version Detection and Operator Statistics

Finally, the following code is provided to count the Opset version used by an ONNX model file, as well as the types and quantities of operators contained within it:

```python
import onnx

model = onnx.load("_my_research/output/onnx/rtdetrv2_r18vd_120e_coco.onnx")
print(f"Opset version: {model.opset_import[0].version}")

# Count operator types
op_types = [node.op_type for node in model.graph.node]
from collections import Counter
print(Counter(op_types))
```

The printed output is shown below. As we can see, the Opset version adapted by my current `rtdetrv2` ONNX model file is version 13. You can use this information to check whether the operator types contained in the ONNX model file match the requirements of the NPU edge model conversion tool.

```python
(new-env) PS D:\Code\Github\RT-DETR> & D:/Anaconda/envs/new-env/python.exe d:/Code/Github/RT-DETR/_my_research/onnx_operator_calculate.py
Opset version: 13
Counter({'Constant': 1026, 'Mul': 485, 'Add': 466, 'Gather': 326, 'Transpose': 222, 'Identity': 211, 'Shape': 196, 'Reshape': 178, 'Sub': 141, 'MatMul': 109, 'Cast': 108, 'Concat': 101, 'Clip': 90, 'Unsqueeze': 87, 'Flatten': 72, 'Div': 64, 'Slice': 58, 'Conv': 57, 'Relu': 45, 'ReduceMean': 42, 'Expand': 38, 'Floor': 36, 'Sigmoid': 35, 'Pow': 21, 'Sqrt': 21, 'Softmax': 13, 'Gemm': 7, 'Split': 6, 'ReduceSum': 6, 'Log': 6, 'AveragePool': 3, 'Resize': 2, 'ConstantOfShape': 2, 'Tile': 2, 'GatherElements': 2, 'MaxPool': 1, 'Erf': 1, 'ReduceMax': 1, 'TopK': 1})
```

## References

- [ONNX Opset Operator Counts - Lei Mao's Log Book](https://leimao.github.io/blog/ONNX-Opset-Operator-Counts/)
- [https://github.com/onnx/onnx/blob/main/docs/Operators.md](https://github.com/onnx/onnx/blob/main/docs/Operators.md)
- [Compatibility | onnxruntime](https://onnxruntime.ai/docs/reference/compatibility.html)