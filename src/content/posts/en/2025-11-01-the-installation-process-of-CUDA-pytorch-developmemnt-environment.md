---
title: "Installing PyTorch Development Environment with Nvidia CUDA Support"
slug: "2025-11-01-the-installation-process-of-CUDA-pytorch-developmemnt-environment"
description: "This article documents the setup and verification of a Cuda + PyTorch development environment on Windows 11 with an Nvidia RTX 5070 Ti GPU."
date: 2025-11-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["LLM"]
draft: false
---

Operating System: Windows 11

Hardware: HP OMEN Max, Ultra 9 275HX + 5070 Ti

## Check Nvidia Graphics Driver Version

Type `nvidia-smi` in the terminal:

```plain text
C:\Users\windl>nvidia-smi
Tue Nov  4 11:35:17 2025
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 577.03                 Driver Version: 577.03         CUDA Version: 12.9     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                  Driver-Model | Bus-Id          Disp..A | Volatile Uncorr. ECC |
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

As shown above, the maximum CUDA version supported by the graphics driver is 12.9.

- If the above command indicates that the command cannot be found, you need to reinstall the Nvidia graphics driver: [Download The Official NVIDIA Drivers | NVIDIA](https://www.nvidia.com/en-us/drivers/)

## Install the GPU Version of PyTorch

Go to the official PyTorch [Get Started](https://pytorch.org/get-started/locally/) page and select the appropriate torch version corresponding to your current CUDA version. Since the current CUDA version checked earlier is 12.9, the version to choose here should be the PyTorch version for CUDA 12.8. Copy the installation command below to install the PyTorch library.

> CUDA Version Matching Rule: The CUDA version of PyTorch should be ≤ the version supported by the driver.

![image.png](/images/blog/安装Nvidia-CUDA支持的Pytorch开发环境记录-1.png)

## Verify the PyTorch Environment

After completing the installation above, use the following script to test whether the current environment has been successfully set up:

```python
import torch
print(torch.cuda.is_available())  # Should output True
print(torch.version.cuda)        # View the CUDA version used at compilation
print(torch.cuda.get_device_name(0))  # View the GPU model
```

Under normal circumstances, the output printed after executing the script above will be:

```plain text
PS D:\Code\yolov5> & C:/Users/windl/anaconda3/python.exe d:/Code/yolov5/test/test_cuda.py
True
12.8
NVIDIA GeForce RTX 5070 Ti Laptop GPU
```

## References

- [PyTorch CUDA Support Errors: Solutions and Installation Guide_Baidu Comate](https://comate.baidu.com/zh/page/bvxkedpetny)