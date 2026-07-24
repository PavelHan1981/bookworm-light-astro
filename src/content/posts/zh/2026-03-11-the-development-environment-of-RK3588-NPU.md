---
title: "瑞芯微RK3588 NPU开发环境搭建笔记"
slug: "2026-03-11-the-development-environment-of-RK3588-NPU"
description: "本文以RK3588+Debian Linux系统为基础，搭建瑞芯微平台的NPU开发环境与板端推理环境，并以Model Zoo中的Yolov5模型为例进行该模式上板运行流程的总结。"
date: 2026-03-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["NPU","嵌入式"]
draft: false
---


本文以RK3588+Debian Linux系统为基础，搭建瑞芯微平台的NPU开发环境与板端推理环境，并以Model Zoo中的Yolov5模型为例进行该模式上板运行流程的总结。


## 瑞芯微NPU应用开发框架


瑞芯微的NPU应用开发的整体开发流程上，基本上与君正AI应用开发的后处理流程（Post Processing）大致一致，首先是在PC上基于Pytorch或者tensorflow等进行模型的开发和训练，完成后把这个模型（如onnx格式或者pt格式）使用一个 RKNN-Toolkit2 的工具转换为RKNN格式，这个RKNN格式才是能够在瑞芯微芯片上跑起来的端侧模型格式，后续在生产环境中使用C/C++语言调用这个模型进行前向推理。


RKNN的软件框架如下图所示：


![image.png](/images/blog/瑞芯微RK3588-NPU开发环境搭建笔记-1.png)


RKNN-Toolkit2、RKNN-Toolkit-Lite2、RKNPU2 C++ API之间的关系：

- RKNN-Toolkit2用于把PC或者服务器上训练好的模型转换为可以在瑞芯微NPU上运行的RKNN格式，运行在PC端。
- RKNN-Toolkit-Lite2是一个可以在瑞芯微NPU上基于RKNN格式的模型进行前向推理的工具，运行在瑞芯微处理器上。
- RKNN-Toolkit-Lite2本质上是一个在瑞芯微处理器上运行的Python包，所以其执行的前向推理是在瑞芯微硬件上跑的python环境中运行。如果对性能有更高要求，应该使用RKNPU2的C++ API来运行AI而不是RKNN-Toolkit-Lite2。
- 所以：**RKNN-Toolkit2用于进行模型转换；RKNN-Toolkit-Lite2用于对转换后的模型在板端进行快速验证和测试；RKNPU2 C++ API才用于最终的项目实际落地。**
> 我自己的看法，在板端的推理上，C/C++代码的效率要远远高于Python。所以其实没有太大必要在板端用RKNN-Toolkit-Lite2的python脚本去做推理验证，直接用RKNN-Toolkit2进行模型转换，然后在板端用C/C++进行推理才是一步到位的最成熟的做法。当然，使用RKNN-Toolkit-Lite2的python脚本在板端去做推理验证，优势则在于有大量Python包的支持，而且与PC端环境一致，写推理代码更容易。

### RKNN-Toolkit2 能够支持的芯片平台列表：

- RK3588 Series
- RK3576 Series
- RK3566/RK3568 Series
- RK3562 Series
- RV1103/RV1106
- RV1103B/RV1106B
- RV1126B
- RK2118

如上所述，瑞芯微NPU应用开发主要依赖于RKNN生态。在瑞芯微芯片的NPU上进行应用开发主要依赖于以下两个在Github上维护的代码仓库：

- RKNN-Toolkit2： [airockchip/rknn-toolkit2](https://github.com/airockchip/rknn-toolkit2) ，模型转换工具。
- RK Model Zoo： [airockchip/rknn_model_zoo](https://github.com/airockchip/rknn_model_zoo) ，模型上板运行的支持示例。

## RKNN-Toolkit2开发环境的搭建


截至2026年初，最新的RKNN-Toolkit2的版本是2.3.2。


进行瑞芯微RKNN NPU生态的应用开发与测试，首先要进行RKNN-Toolkit2开发环境的搭建。从Github上下载RKNN-Toolkit2和RKNN Model Zoo仓库：


```bash
git clone https://github.com/airockchip/rknn-toolkit2.git --depth 1
git clone https://github.com/airockchip/rknn_model_zoo.git --depth 1
```


### 模型转换的Python环境


新建一个专门的rknn环境(Python版本指定为3.12)并安装RKNN-Toolkit2及其所有的依赖包（`rknn-toolkit2-master/rknn-toolkit2/packages/x86_64`）：


```bash
conda create -n rknn python=3.12
conda activate rknn
pip install -r requirements_cp312-2.3.2.txt
pip install rknn_toolkit2-2.3.2-cp312-cp312-manylinux_2_17_x86_64.manylinux2014_x86_64.whl
```

> 注意，按照以上流程安装的Python3.12环境，在后续在Model Zoo中把Yolov5的onnx文件转换为rkkn时会报错：AttributeError: module 'onnx' has no attribute 'mapping'，这是因为Python 环境中安装的 onnx 库版本过高，与当前的 `rknn-toolkit2 (v2.3.2)` 产生了不兼容。应该在requirements_cp312-2.3.2.txt修改onnx依赖版本为：`onnx==1.16.1`, 而不是安装onnx的最新版本。

### 交叉编译环境


板端C/C++代码的交叉编译工具（rk3588为aarch64架构，所以安装64位系统的编译工具）：[https://releases.linaro.org/components/toolchain/binaries/6.3-2017.05/aarch64-linux-gnu/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu.tar.xz](https://releases.linaro.org/components/toolchain/binaries/6.3-2017.05/aarch64-linux-gnu/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu.tar.xz) ，后续在编译模型上板推理的C/C++ demo时要用。


### 板端NPU驱动环境


此外，如以上RKNN的软件框架图所示，在RK3588板端上所执行的AI推理，同时还需要依赖于板端NPU的相关支持环境，包括板端kernel的NPU驱动、瑞芯微RKNN网络的运行时库以及其他的支持库。


首先一点，需要在板端的Kernel中启动NPU驱动支持，并且确保kernel的NPU驱动版本与RKNN-Toolkit2及其运行时库的版本相匹配。可以在Kernel的启动信息或者通过dmesg得到NPU驱动的版本信息：


![image.png](/images/blog/瑞芯微RK3588-NPU开发环境搭建笔记-2.png)


除了以上NPU驱动支持以外，板端应用程序在NPU上执行推理还需要运行时库`librknnrt.so`的支持。`librknnrt.so`在`rknn-toolkit2-master/rknpu2/runtime/Linux/librknn_api/aarch64`位置，在进行板端推理的C/C++ demo编译时应该链接到这个动态链接库，并且把这个库提前放到板端系统的LD_LIBRARTY_PATH路径中。


此外，对于模型上板推理的C/C++ demo运行，除了以上的NPU驱动以及NPU运行时支持动态链接库`librknnrt.ko`，可能还需要其他的多媒体与硬件加速库：

- RGA (Rockchip Graphics Architecture)：用于硬件加速的图像缩放、裁剪、格式转换（如从摄像头拿到的 YUV 转为 NPU 需要的 RGB）。需要 `librga.so` 库文件及其头文件。
- MPP (Media Process Platform)：用于进行硬件编解码（H.264/H.265），需要 `librockchip_mpp.so`。

至此，在瑞芯微平台上进行NPU开发的Python、C/C++交叉编译环境以及板端运行环境就已经准备好了。接下来通过Model Zoo中的Yolov5 demo对环境和NPU开发的流程进行总结。


## 基于Model Zoo中的YOLOv5进行上板测试


在前面已经下载的model zoo的仓库`rknn_model_zoo-main`的examples中，包含有多个已经在瑞芯微平台上适配好的模型案例，经过简单修改编译后即可上板运行测试。**整个流程可以分为两个步骤：模型转换和板端C/C++ demo编译。**


### 模型转换


在examples/yolov5/model目录下，执行download_model.sh，这个脚本的功能就是从指定的网络地址上下载一个onnx的yolov5s模型，所以这一步如果自己有已经训练好的yolov5s模型，完全可以使用自己训练的模型来替代。


接下来在examples/yolov5/python目录下，执行convert.sh脚本来进行模型转换（onnx->rknn）的动作。convert.sh脚本中指定了数据集描述文件路径DATASET_PATH和模型转换输出文件路径DEFAULT_RKNN_PATH，有必要的话可以对这两个值进行修改。然后执行`python convert.py ../model/yolov5s_relu.onnx rk3588`进行模型转换，转换后的模型会放到DEFAULT_RKNN_PATH所指定的路径中（以rknn为后缀）。


至此上板运行的模型文件就转换好了。


### C/C++推理demo


在`rknn_model_zoo-main`目录下有两个build脚本文件：build-linux.sh和build-android.sh，分别用于针对板端的Linux和Android环境编译C/C++推理demo。此处以RK3588的Debian Linux环境为例，所以首先修改build-linux.sh，在最前面增加交叉编译工具链的路径：


![image.png](/images/blog/瑞芯微RK3588-NPU开发环境搭建笔记-3.png)


然后调用build-linux.sh脚本进行yolov5板端推理demo程序的编译：`./build-linux.sh -t rk3588 -a aarch64 -d yolov5 -b Release`。build-linux.sh实际上会跳转到`examples/yolov5/cpp/`目录下，找到其中的CMakeLists.txt，调用cmake来执行完整的编译动作。


build-linux.sh的参数说明如下：


```plain text
./build-linux.sh -t <target> -a <arch> -d <build_demo_name> [-b <build_type>] [-m] [-r] [-j]

    -t : target (rk356x/rk3588/rk3576/rv1126b/rv1106/rk1808/rv1126)
    -a : arch (aarch64/armhf)
    -d : demo name
    -b : build_type(Debug/Release)
    -m : enable address sanitizer, build_type need set to Debug
    -r : disable rga, use cpu resize image
    -j : disable libjpeg to avoid conflicts between libjpeg and opencv
such as: ./build-linux.sh -t rk3588 -a aarch64 -d mobilenet
```


build-linux.sh执行完成后会在`rknn_model_zoo-main`目录下生成一个install目录，其中包含了demo在板端运行所需要的所有文件：demo可执行程序，运行时依赖库librknnrt.so，板端rknn模型文件，测试图片文件。所以只需要把这个install目录打包后上传到板端执行其中的demo程序即可：


```bash
cat@lubancat:~/install/rk3588_linux_aarch64/rknn_yolov5_demo$ ./rknn_yolov5_demo model/yolov5.rknn model/bus.jpg
load lable ./model/coco_80_labels_list.txt
model input num: 1, output num: 3
input tensors:
  index=0, name=images, n_dims=4, dims=[1, 640, 640, 3], n_elems=1228800, size=1228800, fmt=NHWC, type=INT8, qnt_type=AFFINE, zp=-128, scale=0.003922
output tensors:
  index=0, name=output0, n_dims=4, dims=[1, 255, 80, 80], n_elems=1632000, size=1632000, fmt=NCHW, type=INT8, qnt_type=AFFINE, zp=-128, scale=0.003922
  index=1, name=286, n_dims=4, dims=[1, 255, 40, 40], n_elems=408000, size=408000, fmt=NCHW, type=INT8, qnt_type=AFFINE, zp=-128, scale=0.003922
  index=2, name=288, n_dims=4, dims=[1, 255, 20, 20], n_elems=102000, size=102000, fmt=NCHW, type=INT8, qnt_type=AFFINE, zp=-128, scale=0.003922
model is NHWC input fmt
model input height=640, width=640, channel=3
origin size=640x640 crop size=640x640
input image: 640 x 640, subsampling: 4:2:0, colorspace: YCbCr, orientation: 1
scale=1.000000 dst_box=(0 0 639 639) allow_slight_change=1 _left_offset=0 _top_offset=0 padding_w=0 padding_h=0
rga_api version 1.10.1_[0]
rknn_run
person @ (209 243 286 510) 0.880
person @ (479 238 560 526) 0.871
person @ (109 238 231 534) 0.840
bus @ (91 129 555 464) 0.692
person @ (79 353 121 517) 0.301
write_image path: out.png width=640 height=640 channel=3 data=0x34f9c120
```

