---
title: "QWen3-VL-4B多模态大模型在RK3588上的适配流程记录"
slug: "2026-03-21-the-deployment-process-of-Qwen3VL-on-RK3588"
description: "本文详细记录了在瑞芯微RK3588上进行Qwen3-VL-4B-Instruct多模态大模型的完整适配记录，以及在适配过程中容易出现问题的重点事项。"
date: 2026-03-21T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["ViT","LLM"]
draft: false
---


本文详细记录了在瑞芯微RK3588上进行Qwen3-VL-4B-Instruct多模态大模型的完整适配记录，以及在适配过程中容易出现问题的重点事项。


## QWen3-VL-4B模型的下载与测试


阿里在 2025 年 9 月推出了Qwen3-VL 系列视觉语言模型。相较于其前代产品（如 Qwen2-VL），Qwen3-VL 的发布标志着多模态大模型从简单的视觉感知正式跨越到了深层的逻辑推理与自主 Agent 交互的新阶段。Qwen3-VL 延续了阿里的开源精神，推出了涵盖从端侧到云端的多种规模模型。


![image.png](/images/blog/QWen3-VL-4B多模态大模型在RK3588上的适配流程记录-1.png)


要进行Qwen3-VL-4B-Instruct这个模型在瑞芯微平台上的适配，首先需要下载模型文件，并在PC端进行基本的推理测试，验证下载到的模型文件的正确性，这部分工作在[详解QWen3-VL模型的测试以及vLLM生产环境部署流程](https://www.pavelhan.tech/article/2026-03-04-the-test-and-deployment-workflow-on-Qwen3VL)一文中已有详细介绍。


Qwen3-VL-4B-Instruct模型在HuggingFace中的链接路径如下，按照上文使用transformers库从huggingface上下载并执行本地的推理验证：


![image.png](/images/blog/QWen3-VL-4B多模态大模型在RK3588上的适配流程记录-2.png)

> 注：下文中我已经下载好的本地模型文件的路径为/mnt/d/HuggingFace/hub/models--Qwen--Qwen3-VL-4B-Instruct/snapshots/ebb281ec70b05090aa6165b016eac8ec08e71b17/

## 环境的搭建


多模态大模型在瑞芯微平台NPU上的适配，需要同时用到瑞芯微的`rknn-llm`和`rknn-toolkit2`工具包。截至2026年1月份，这两个工具包在github上的最新版本是：

- rknn-llm：1.2.3
- rknn-toolkit2：2.3.2

以下工作就基于这两个版本展开。**比较奇葩的是，这两个工具包的最新版本，对于python环境的版本要求是相互冲突的。所以最好基于上面的两个工具包分别搭建各自的开发环境rknn和rkllm，在后续的不同步骤切换到不同的环境中执行。**


rknn-toolkit2的环境搭建可以参考[瑞芯微RK3588 NPU开发环境搭建笔记](https://www.pavelhan.tech/article/2026-03-11-the-development-environment-of-RK3588-NPU)，rkllm的环境搭建流程可以参考[轻量级LLM模型QWen2.5-0.5B在RK3588上的适配流程记录](https://www.pavelhan.tech/article/2026-03-16-the-Qwen2.5-0.5B-model-deployment-on-RK3588)。


_整体来讲，QWen3-VL-4B-Instruct这个模型在RK3588开发板上的适配，主要是基于rknn-llm这个仓库中的__`rknn-llm-main/examples/multimodal_model_demo`__目录中所包含的文件展开。_

- 该目录下有一个README.md可以作为参考，但是其中缺少一些细节。

## 模型转换


针对QWen3-VL-4B-Instruct这类多模态模型的转换，实际上分为两个步骤，分别对应rknn模型和rkllm模型的转换。最终上板运行的demo，既需要同时加载独立的rknn模型文件和rkllm模型文件，也需要依赖于各自的运行时库：librkllmrt.so和librknnrt.so。


### rknn模型的转换


**这部分转换操作在rknn环境（即安装rknn-toolkit2工具包的环境中）执行。** 这部分分为两个子步骤：模型的Vision部分转换为onnx文件，在从onnx格式的模型文件转换为上板运行的rknn模型文件。


在`rknn-llm-main/examples/multimodal_model_demo`目录下的export子目录中执行export_vision.py脚本转换模型的Vision部分到onnx文件中：


```bash
conda activate rknn
cd export
python export_vision.py --path=/mnt/d/HuggingFace/hub/models--Qwen--Qwen3-VL-4B-Instruct/snapshots/ebb281ec70b05090aa6165b016eac8ec08e71b17/ --model_name=qwen3-vl --height=448 --width=448
```


以上执行完成后会在当前export目录下生成一个onnx子目录，其中包含有转换好的模型Vision部分的onnx文件：


```bash
(rknn) pavelhan@LAPTOP-P7UARMK0:~/rkllm/rknn-llm-main/examples/multimodal_model_demo/export$ ls -l onnx/
total 1623076
-rw-rw-r-- 1 pavelhan pavelhan 1662022334 Jan 28 16:11 qwen3-vl_vision.onnx
```


接下来，继续使用相同目录下的export_vision_rknn.py脚本把这个onnx文件转换为板端可运行的rknn模型文件：


```bash
python export_vision_rknn.py --path=./onnx/qwen3-vl_vision.onnx --model_name=qwen3-vl --height=448 --width=448
```


以上执行完成后会在当前export目录下生成一个rknn子目录，其中包含有转换好的模型Vision部分的板端运行的rknn模型文件：


```bash
(rknn) pavelhan@LAPTOP-P7UARMK0:~/rkllm/rknn-llm-main/examples/multimodal_model_demo/export/rknn$ ls -l
total 848888
-rw-rw-r-- 1 pavelhan pavelhan 869260061 Jan 28 16:22 qwen3-vl_vision_rk3588.rknn
```


至此模型Vision部分的rknn上板运行的模型文件`qwen3-vl_vision_rk3588.rknn`就已经准备好了。


### rkllm模型的转换


**这部分转换操作在rkllm环境（即安装rknn-llm工具包的环境中）执行。** 这部分同样可以分为两个子步骤：校准数据的准备，rkllm板端模型的转换。


校准数据准备的这部分工作主要在data子目录中进行，该目录下包含一个`make_input_embeds_for_quantize.py`脚本用于准备校准数据，但是这个脚本是针对Qwen2-VL的，直接在Qwen3-VL模型上使用会报错，所以我基于上面的脚本文件修改了一个`make_input_embeds_for_quantize_qwen3-vl.py`专门用于生成Qwen3-VL模型的校准数据，然后在export下执行：


```bash
python ./data/make_input_embeds_for_quantize_qwen3-vl.py --path=/mnt/d/HuggingFace/hub/models--Qwen--Qwen3-VL-4B-Instruct/snapshots/ebb281ec70b05090aa6165b016eac8ec08e71b17/
```


以上执行完成后会在data/inputs.json和data/inputs_embeds/生成校准数据，后续rkllm板端模型的转换过程要用到这个校准数据。


接着就是模型转换的最后一步，也是最耗时的一步（主要原因是我的显卡型号比较新，与rkllm环境中的torch和cuda版本有冲突，所以只能使用CPU来执行模型转换）：rkllm板端模型文件的转换。主要用到export下的`export_rkllm.py`脚本：


```bash
python export/export_rkllm.py --path /mnt/d/HuggingFace/hub/models--Qwen--Qwen3-VL-4B-Instruct/snapshots/ebb281ec70b05090aa6165b016eac8ec08e71b17/ --target-platform rk3588 --num_npu_core 3 --quantized_dtype w8a8 --device cpu --savepath ./export/save/qwen3-vl-4B_rk3588.rkllm
```


注意，以上脚本执行的过程中对内存需求巨大，如果在WSL中执行的话会在运行在出现Killed的问题，原因就是内存OOM了，此时需要修改WSL的内存和虚拟内存的配置：在自己的用户目录C:\Users[用户名]下创建一个.wslconfig文件，写入以下内容然后重启WSL，然后重新执行以上转换命令即可：


```plain text
[wsl2]
memory=24GB  # 尝试分配 24GB 或更多
swap=16GB    # 增加交换空间作为缓冲
```


以上执行完成后会在当前目录下生成rkllm的板端执行文件`_w8a8_rk3588.rkllm`：


```bash
(rkllm) pavelhan@LAPTOP-P7UARMK0:~/rkllm/rknn-llm-main/examples/multimodal_model_demo/rkllm$ ls -l
total 4733196
-rw-rw-r-- 1 pavelhan pavelhan 4846784612 Jan 28 17:26 _w8a8_rk3588.rkllm
```


至此，板端推理demo运行所需要的两个板端模型文件`qwen3-vl_vision_rk3588.rknn`和`_w8a8_rk3588.rkllm`就准备好了。


## 板端推理应用程序编译


板端通用的推理应用程序代码在deploy目录下，需要注意RKLLM v1.2.3版本要求交叉编译的gcc版本在10.2以上，需要先下载工具链gcc-arm-10.2-2020.11-x86_64-aarch64-none-linux-gnu：


![image.png](/images/blog/QWen3-VL-4B多模态大模型在RK3588上的适配流程记录-3.png)


在deploy目录下，修改其中的build-linux.sh文件中的交叉编译工具链路径GCC_COMPILER，然后执行build-linux.sh脚本编译板端执行文件即可。这个编译过程完成后会把所有上板运行的文件（除以上两个板端模型文件以外）放入一个install目录下。


## 上板运行测试


上板运行测试的过程，把以上的install目录、两个板端模型文件`qwen3-vl_vision_rk3588.rknn`和`_w8a8_rk3588.rkllm`上传到板子的models目录下上。然后执行：


```bash
cd /home/cat/install/demo_Linux_aarch64
export LD_LIBRARY_PATH=./lib
./demo ./demo.jpg ./models/qwen3-vl_vision_rk3588.rknn ./models/_w8a8_rk3588.rkllm 2048 4096 3 "<|vision_start|>" "<|vision_end|>" "<|image_pad|>"
```


最终demo在rk3588上运行的效果如下图所示：


![image.png](/images/blog/QWen3-VL-4B多模态大模型在RK3588上的适配流程记录-4.png)


## 参考资料

- [airockchip/rknn-llm](https://github.com/airockchip/rknn-llm?tab=readme-ov-file)
- [airockchip/rknn-toolkit2](https://github.com/airockchip/rknn-toolkit2)
- [【硬核部署】Qwen3-VL 在 RK3588 上的部署-CSDN博客](https://blog.csdn.net/qq_42910179/article/details/154960511?spm=1001.2014.3001.5501)

---


尝试从底层原理的角度去理解和解释技术问题：音视频/摄像头/智能家居/蓝牙/WiFi/无线通信/AI。
敬请关注微信公众号：Pavel Han。

