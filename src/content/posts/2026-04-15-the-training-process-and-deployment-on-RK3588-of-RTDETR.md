---
title: "RT-DETR模型的自定义数据训练以及在RK3588上的适配"
slug: "2026-04-15-the-training-process-and-deployment-on-RK3588-of-RTDETR"
description: "本文完整的记录了基于Ultralytics项目中的 RT-DETR 预训练模型在自定义数据集上进行的训练、ONNX导出，以及在RK3588硬件平台上的适配流程。
对于 RT-DETR 模型的实现而言，目前主要有两套独立的实现，即 Baidu 的 PaddleDetection 和 Ultralytics (YOLOv8/v11 生态)。因为我自己对于 Ultralytics/YOLO 较为熟悉，所以本文以  Ultralytics/YOLO 的实现进行试验和记录。"
date: 2026-04-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["DETR","YOLO","Transformer"]
draft: false
---


本文完整的记录了基于Ultralytics项目中的 RT-DETR 预训练模型在自定义数据集上进行的训练、ONNX导出，以及在RK3588硬件平台上的适配流程。


对于 RT-DETR 模型的实现而言，目前主要有两套独立的实现，即 Baidu 的 PaddleDetection 和 Ultralytics (YOLOv8/v11 生态)。因为我自己对于 Ultralytics/YOLO 较为熟悉，所以本文以  Ultralytics/YOLO 的实现进行试验和记录。


![image.png](/images/blog/RT-DETR模型的自定义数据训练以及在RK3588上的适配-1.png)


## 1.自定义数据集的训练


**因为这里使用的是Ultralytics项目下的RT-DETR实现，所以其训练过程、训练所生成的中间文件组织结构以及对训练数据的表格格式、目录结构等都与YOLO模型没有任何区别**，只需要把之前在YOLO模型上训练所使用的数据集目录以及其 `data.yaml` 直接拷贝过来使用即可。所以如果对YOLO模型的训练流程有经验的话，在这个项目中训练RT-DETR就很容易上手了。可参考[一文总结YOLOv5模型的自定义训练、测试与模型导出的全过程](https://pavelhan.tech/article/2025-08-28-the-training-predict-and-ONNX-export-of-YOLOv5/)。


训练流程的代码也与Ultralytics项目下的其他YOLO模型类似，训练过程的代码如下：


```python
from ultralytics import RTDETR

def train_model():
    # 1. 加载预训练模型
    model = RTDETR('_my_research/pre_trained/rtdetr-l.pt') 

    # 2. 开始训练
    model.train(
        data='_my_research/rt_detr/data.yaml',
        epochs=100,
        imgsz=640,
        batch=4,
        lr0=0.0001,
        optimizer='AdamW',
        device=0,
        workers=2,  
        project='_my_research/runs',  # 指定输出目录
        name='rt_detr_train'  # 训练任务名称
    )

if __name__ == '__main__':
    train_model()
```


训练流程基本上与普通的YOLO没有多大区别，有两点注意事项：

- 在Windows环境中进行训练的话，训练代码需要包裹在__main__里面。这是因为在 Linux 系统中，进程的创建通常使用 `fork`，它会直接克隆当前的内存状态，不需要重新导入模块；而 Windows 不支持 `fork`，只能 `spawn`（冷启动一个新的 Python 解释器并导入以上脚本），这样的话，子进程启动时会再次运行一遍整个 `train.py`，从而又触发了一个新的训练请求，形成死循环。系统为了保护内存不被耗尽，主动抛出 `RuntimeError`来结束整个程序。而把训练代码包裹在__main__里面以后，只有主进程会执行`train_model`函数，子进程只负责执行训练过程，这样就不会进入反复新建子进程的死循环。
- batch和workers设置相对小一点，否则训练过程中很容易卡死。我一开始设置了batch为16，结果发现程序很容易卡死并报显存不足，所以如果出现训练过程稳定性问题的时候可以尝试把workers和batch这两个参数设置小一点。

以上的训练执行过程明显比使用相同数据集训练的YOLOv8模型耗时要长一些，应该是RT-DETR模型的计算复杂度要高于 YOLOv8。训练结果同样保存在runs目录下的`best.pt`文件。


## 2.Grid Sample算子的梦魇与Monkey Patch


在RK3588硬件上跑AI模型，大致的路径无非是：

- 在PC端基于Pytorch等框架完成模型的训练；
- 把训练的pt格式模型文件转换为更通用的ONNX格式；
- 使用瑞芯微的RKNN-Toolkit2工具进行板端模型转换，把ONNX格式的模型转换为RKNN格式；
- 在RK3588板端使用`rknn-toolkit-lite2` 工具（Python）或者C/C++语言把模型跑起来，在板端完成推理测试得到结果。

所以既然前面的训练过程已经完成，那么下一步自然就是进行ONNX格式的模型转换。但是这一步出现了一个由Grid Sample算子所导致的很大的问题：

- Grid Sample算子是在Opset 16中被支持的，所以要能够导出ONNX成功，必须要设置Opset版本为16。设置为低于16的Opset版本，在导出ONNX模型这一步会报错。
- 如果把Opset设置为16的话，使用RKNN-Toolkit2工具（2.3.2版本）确实可以成功导出RKNN模型，但是这个模型放在RK3588板端跑的话，配合2.3.2版本的librknnrt.so文件会出现段错误的问题，原因是2.3.2版本的librknnrt.so文件根本不支持Grid Sample这个算子。也就是说，**2.3.2版本的RKNN-Toolkit2工具认为Grid Sample算子是可以支持的，所以模型转换通过；而2.3.2版本的librknnrt.so文件根本就没有实现这个算子，所以板端运行会出现段错误的问题。瑞芯微的算法团队发布版本的时候不需要同步一下吗？**

对于以上问题，当然是可以修改模型的结构，使用其他更通用的算子替换掉Grid Sample算子，然后重新训练，就可以从根本上解决这个问题。


但是，如果不考虑算法在板端的运行速度的话，其实是可以用一个简单的办法绕过这个算子：**Monkey Patch**。


所谓的Monkey Patch就是对于要导出ONNX的模型，在导出之前，先把某个板端不支持的算子用更常用的算子替换掉，这样在ONNX导出的时候，根本就看不到这个Grid Sample算子。具体来讲，就是在导出ONNX模型之前先用以下的代码进行Grid Sample算子（F.grid_sample）的替换：


```python
def export_friendly_grid_sample(input, grid, mode='bilinear', padding_mode='zeros', align_corners=False):

    N, C, H_in, W_in = input.shape
    _, H_out, W_out, _ = grid.shape

    # 1. 提取归一化坐标 [-1, 1]
    ix = grid[..., 0]
    iy = grid[..., 1]

    # 2. 反归一化到像素坐标系
    if align_corners:
        ix = ((ix + 1) / 2) * (W_in - 1)
        iy = ((iy + 1) / 2) * (H_in - 1)
    else:
        ix = ((ix + 1) * W_in - 1) / 2
        iy = ((iy + 1) * H_in - 1) / 2

    # 3. 生成越界掩码 (用于彻底解决 padding_mode='zeros' 的问题)
    # 当坐标落在图像外部时，掩码为 0，否则为 1
    if padding_mode == 'zeros':
        valid_mask = (ix >= 0) & (ix < W_in) & (iy >= 0) & (iy < H_in)
        # 扩展掩码维度以匹配输出 (N, 1, H_out, W_out)
        valid_mask = valid_mask.unsqueeze(1).to(input.dtype)

    # 4. 坐标截断 (防止 gather 越界报错)
    ix = ix.clamp(0, W_in - 1)
    iy = iy.clamp(0, H_in - 1)

    # 5. 计算四个临近像素的整数坐标
    ix_nw = ix.floor().long()
    iy_nw = iy.floor().long()
    ix_ne = (ix_nw + 1).clamp(0, W_in - 1)
    iy_sw = (iy_nw + 1).clamp(0, H_in - 1)

    # 6. 计算双线性插值权重 (N, 1, H_out, W_out)
    nw_w = ((ix_ne.float() - ix) * (iy_sw.float() - iy)).unsqueeze(1)
    ne_w = ((ix - ix_nw.float()) * (iy_sw.float() - iy)).unsqueeze(1)
    sw_w = ((ix_ne.float() - ix) * (iy - iy_nw.float())).unsqueeze(1)
    se_w = ((ix - ix_nw.float()) * (iy - iy_nw.float())).unsqueeze(1)

    # 7. 将输入特征图展平，准备 Gather
    # (N, C, H_in * W_in)
    input_flat = input.reshape(N, C, -1)

    # 8. 计算 1D 内存索引，并扩展到所有通道
    # 基础索引 shape: (N, H_out, W_out)
    idx_nw = (iy_nw * W_in + ix_nw)
    idx_ne = (iy_nw * W_in + ix_ne)
    idx_sw = (iy_sw * W_in + ix_nw)
    idx_se = (iy_sw * W_in + ix_ne)

    # 扩展索引 shape: (N, C, H_out * W_out)
    def expand_idx(idx):
        return idx.unsqueeze(1).expand(N, C, H_out, W_out).reshape(N, C, -1)

    # 9. 收集四个角落的像素值并 reshape 回二维
    val_nw = torch.gather(input_flat, 2, expand_idx(idx_nw)).reshape(N, C, H_out, W_out)
    val_ne = torch.gather(input_flat, 2, expand_idx(idx_ne)).reshape(N, C, H_out, W_out)
    val_sw = torch.gather(input_flat, 2, expand_idx(idx_sw)).reshape(N, C, H_out, W_out)
    val_se = torch.gather(input_flat, 2, expand_idx(idx_se)).reshape(N, C, H_out, W_out)

    # 10. 混合权重
    out = nw_w * val_nw + ne_w * val_ne + sw_w * val_sw + se_w * val_se

    # 11. 应用越界掩码 (如果在视野外，强行置零)
    if padding_mode == 'zeros':
        out = out * valid_mask

    return out


# 替换 F.grid_sample
_original_grid_sample = F.grid_sample
F.grid_sample = export_friendly_grid_sample
```


## 3.ONNX模型的导出与RKNN转换


解决了以上的Grid Sample算子的问题，后续的ONNX导出就比较简单了。如[如何理解ONNX模型导出的Opset版本？](https://pavelhan.tech/article/2026-04-08-how-to-understand-the-opset-version-in-ONNX-export-process/)一文所总结的：**在 Rockchip NPU的2.3.2版本的模型转换工具和板端NPU驱动上最高能够支持的Opset版本就是15。实际的部署过程中，最好的Opset版本设置应该是12或者13，避免版本过新有可能带来的稳定性和兼容性问题。**


```python
model.export(
				format='onnx',
        imgsz=640,
        opset=13,         # RK3588 兼容的 opset 版本
        dynamic=False,    # RK3588 必须静态形状
        simplify=True,    # 开启简化
        device='cpu'
    )
```


以上导出的ONNX格式的模型就是能够在RK3588上得到良好支持的OPSet=13的版本，接下来就是使用RKNN-Toolkit2工具进行板端模型转换，把ONNX格式的模型转换为RKNN格式：


```python
def convert():
    rknn = RKNN(verbose=True)

    # 1. 配置：增加禁用规则以解决 RT-DETR 转换报错
    rknn.config(
        mean_values=[[0, 0, 0]],
        std_values=[[255, 255, 255]],
        target_platform='rk3588',
        disable_rules=[
            'fuse_mul_into_gemm',
            'convert_exmatmul_to_conv',
            'fuse_mul_into_conv',
            'reduce_tp_in_mesh_forward',
            'reduce_tp_in_mesh_backward',
            'swap_transpose_clip'
        ]
    )

    print('--> Loading model')
    ret = rknn.load_onnx(model=ONNX_MODEL)
    if ret != 0:
        print('Load model failed!')
        return

    print('--> Building model (FP16 mode)')
    # do_quantization=False 保持 FP16 浮点精度，不进行 INT8 量化
    ret = rknn.build(do_quantization=False)
    if ret != 0:
        print('Build model failed!')
        return

    print('--> Exporting rknn model')
    ret = rknn.export_rknn(RKNN_MODEL)
    if ret != 0:
        print('Export rknn model failed!')
        return
```


## 4.板端推理运行


最后在RK3588板端使用`rknn-toolkit-lite2` 工具进行板端推理就可以看到运行的结果了。不过感觉推理执行的速度比较慢，可能跟手动替换了Grid Sample算子有关：


```python
rknn_lite = RKNNLite()
print(f'--> Loading RKNN model: {RKNN_MODEL}')
rknn_lite.load_rknn(RKNN_MODEL)
print('--> Init runtime environment')
rknn_lite.init_runtime()

img_src = cv2.imread(IMG_PATH)
if img_src is None:
    print(f"Error: Could not load image {IMG_PATH}")
    exit()
        
h, w, _ = img_src.shape
    
# RKNN 输入预处理
img = cv2.cvtColor(img_src, cv2.COLOR_BGR2RGB)
img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
img = np.expand_dims(img, axis=0) 

print('--> Running forward propagation')
outputs = rknn_lite.inference(inputs=[img])

# 执行后处理并画框
boxes, classes, scores = post_process(outputs, CONF_THRESH, h, w)
```


![result_fp16_final.jpg](/images/blog/RT-DETR模型的自定义数据训练以及在RK3588上的适配-2.jpg)

