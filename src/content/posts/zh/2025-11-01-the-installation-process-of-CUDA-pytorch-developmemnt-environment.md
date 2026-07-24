---
title: "安装Nvidia CUDA支持的Pytorch开发环境记录"
slug: "2025-11-01-the-installation-process-of-CUDA-pytorch-developmemnt-environment"
description: "本文基于Windows 11操作系统和Nvidia RTX5070Ti显卡硬件完成了Cuda+Pytorch开发环境的搭建与测试验证。"
date: 2025-11-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["LLM"]
draft: false
---


操作系统：Windows 11


硬件：HP暗夜精灵Max，Ultra9 275HX+5070Ti


## 检查Nvidia显卡驱动版本


在终端输入nvidia-smi：


```plain text
C:\Users\windl>nvidia-smi
Tue Nov  4 11:35:17 2025
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 577.03                 Driver Version: 577.03         CUDA Version: 12.9     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                  Driver-Model | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 5070 ...  WDDM  |   00000000:02:00.0 Off |                  N/A |
| N/A   40C    P8              5W /   96W |     108MiB /  12227MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A           10620    C+G   ...64__v10z8vjag6ke6\HP.myHP.exe      N/A      |
|    0   N/A  N/A           12128    C+G   C:\Windows\explorer.exe               N/A      |
|    0   N/A  N/A           12808    C+G   ....0.3595.53\msedgewebview2.exe      N/A      |
|    0   N/A  N/A           15908    C+G   ...crosoft\OneDrive\OneDrive.exe      N/A      |
|    0   N/A  N/A           20264    C+G   ...8bbwe\PhoneExperienceHost.exe      N/A      |
+-----------------------------------------------------------------------------------------+
```


可以看到以上显卡驱动支持的CUDA版本最高是12.9。

- 如果以上命令提示找不到，就需重新安装Nvidia的显卡驱动：[Download The Official NVIDIA Drivers | NVIDIA](https://www.nvidia.com/en-us/drivers/)

## 安装Pytorch的GPU版本


在Pytorch官方页面[Get Started](https://pytorch.org/get-started/locally/)根据当前的CUDA版本选择安装对应的torch版本：因为前面查到的当前CUDA版本是12.9，所以这里选择的版本应该是CUDA12.8的Pytorch版本，复制下面的安装命令安装pytorch library。

> CUDA版本的匹配规则：PyTorch的CUDA版本应≤驱动支持的版本

![image.png](/images/blog/安装Nvidia-CUDA支持的Pytorch开发环境记录-1.png)


## 测试验证Pytorch的环境


以上安装完成后使用下面的脚本测试当前环境是否已经安装好：


```python
import torch
print(torch.cuda.is_available())  # 应输出True
print(torch.version.cuda)        # 查看编译时的CUDA版本
print(torch.cuda.get_device_name(0))  # 查看GPU型号
```


正确的情况下，上面脚本执行后的打印消息为：


```plain text
PS D:\Code\yolov5> & C:/Users/windl/anaconda3/python.exe d:/Code/yolov5/test/test_cuda.py
True
12.8
NVIDIA GeForce RTX 5070 Ti Laptop GPU
```


## 参考资料

- [PyTorch CUDA支持错误：解决方案与安装指南_文心快码](https://comate.baidu.com/zh/page/bvxkedpetny)
