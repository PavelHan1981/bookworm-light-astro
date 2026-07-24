---
title: "Custom Dataset Training of RT-DETR Model and Its Adaptation on RK3588"
slug: "2026-04-15-the-training-process-and-deployment-on-RK3588-of-RTDETR"
description: "This article provides a complete record of training the RT-DETR pre-trained model based on the Ultralytics project using a custom dataset, exporting it to ONNX, and adapting it for the RK3588 hardware platform. For the implementation of the RT-DETR model, there are currently two independent implementations: Baidu's PaddleDetection and Ultralytics (YOLOv8/v11 ecosystem). Since I am more familiar with Ultralytics/YOLO, this article uses the Ultralytics/YOLO implementation for experimentation and documentation."
date: 2026-04-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["DETR","YOLO","Transformer"]
draft: false
---

This article provides a complete record of training the RT-DETR pre-trained model based on the Ultralytics project using a custom dataset, exporting it to ONNX, and adapting it for the RK3588 hardware platform.

For the implementation of the RT-DETR model, there are currently two independent implementations: Baidu's PaddleDetection and Ultralytics (YOLOv8/v11 ecosystem). Since I am more familiar with Ultralytics/YOLO, this article uses the Ultralytics/YOLO implementation for experimentation and documentation.

![image.png](/images/blog/RT-DETR模型的自定义数据训练以及在RK3588上的适配-1.png)

## 1. Custom Dataset Training

**Since this uses the RT-DETR implementation under the Ultralytics project, its training process, organization of intermediate files generated during training, and the tabular format and directory structure of the training data are completely identical to those of YOLO models.** You only need to directly copy over the dataset directory and its `data.yaml` used previously for YOLO model training. Therefore, if you have experience with the YOLO model training workflow, getting started with training RT-DETR in this project will be very straightforward. You can refer to [A Comprehensive Guide to Custom Training, Testing, and Model Export of YOLOv5 Models](https://pavelhan.tech/article/2025-08-28-the-training-predict-and-ONNX-export-of-YOLOv5/).

The training workflow code is also similar to other YOLO models under the Ultralytics project. The training code is as follows:

```python
from ultralytics import RTDETR

def train_model():
    # 1. Load the pre-trained model
    model = RTDETR('_my_research/pre_trained/rtdetr-l.pt') 

    # 2. Start training
    model.train(
        data='_my_research/rt_detr/data.yaml',
        epochs=100,
        imgsz=640,
        batch=4,
        lr0=0.0001,
        optimizer='AdamW',
        device=0,
        workers=2,  
        project='_my_research/runs',  # Specify output directory
        name='rt_detr_train'  # Training task name
    )

if __name__ == '__main__':
    train_model()
```

The training workflow is basically the same as regular YOLO, with two points to note:

- When training in a Windows environment, the training code must be wrapped inside `__main__`. This is because Linux systems typically use `fork` to create processes, which directly clones the current memory state without re-importing modules. Windows, however, does not support `fork` and must use `spawn` (cold-starting a new Python interpreter and importing the above script). As a result, when the child process starts, it will run the entire `train.py` script all over again, triggering a new training request and creating an infinite loop. To protect memory from being exhausted, the system actively throws a `RuntimeError` to terminate the entire program. By wrapping the training code inside `__main__`, only the main process executes the `train_model` function, while child processes are only responsible for executing the training process, thereby avoiding the infinite loop of repeatedly creating new child processes.
- Set `batch` and `workers` relatively small; otherwise, the program can easily freeze during training. I initially set `batch` to 16, only to find that the program frequently froze and threw out-of-memory (OOM) errors. Therefore, if you encounter stability issues during training, you can try reducing these two parameters (`workers` and `batch`).

The above training execution process visibly takes longer than training a YOLOv8 model with the same dataset, likely because the computational complexity of the RT-DETR model is higher than that of YOLOv8. The training results are likewise saved as the `best.pt` file in the `runs` directory.

## 2. The Nightmare of the Grid Sample Operator and Monkey Patch

Running AI models on RK3588 hardware generally follows this path:

- Complete model training on a PC using frameworks like PyTorch;
- Convert the trained `.pt` model file into the more universal ONNX format;
- Use Rockchip's RKNN-Toolkit2 tool to perform on-board model conversion, converting the ONNX model into RKNN format;
- Run the model on the RK3588 board using the `rknn-toolkit-lite2` tool (Python) or C/C++ language, completing inference testing on the board to obtain results.

Since the training process is complete, the next step naturally involves ONNX model conversion. However, this step introduces a major issue caused by the Grid Sample operator:

- The Grid Sample operator is supported starting from Opset 16. Therefore, to successfully export to ONNX, the Opset version must be set to 16. Setting it to an Opset version lower than 16 will result in an error during the ONNX model export step.
- If Opset is set to 16, the RKNN-Toolkit2 tool (version 2.3.2) can indeed successfully export the RKNN model. However, when this model is run on the RK3588 board along with the `librknnrt.so` file of version 2.3.2, a segmentation fault (segfault) occurs. The reason is that version 2.3.2 of `librknnrt.so` does not support the Grid Sample operator at all. In other words, **version 2.3.2 of RKNN-Toolkit2 considers the Grid Sample operator supported, so model conversion passes; whereas version 2.3.2 of `librknnrt.so` does not implement this operator at all, resulting in a segfault during on-board execution. Shouldn't Rockchip's algorithm team synchronize their releases?**

For the problem above, you can of course modify the model architecture, replace the Grid Sample operator with other more general operators, and retrain it to fundamentally solve the problem.

However, if runtime speed on the board is not a primary concern, you can actually bypass this operator using a simple method: **Monkey Patching**.

A Monkey Patch means that for the model you want to export to ONNX, before exporting, you replace any operator unsupported by the board with a more common one, so that the Grid Sample operator is completely absent during ONNX export. Specifically, before exporting the ONNX model, you use the following code to replace the Grid Sample operator (`F.grid_sample`):

```python
def export_friendly_grid_sample(input, grid, mode='bilinear', padding_mode='zeros', align_corners=False):

    N, C, H_in, W_in = input.shape
    _, H_out, W_out, _ = grid.shape

    # 1. Extract normalized coordinates [-1, 1]
    ix = grid[..., 0]
    iy = grid[..., 1]

    # 2. Denormalize to pixel coordinate system
    if align_corners:
        ix = ((ix + 1) / 2) * (W_in - 1)
        iy = ((iy + 1) / 2) * (H_in - 1)
    else:
        ix = ((ix + 1) * W_in - 1) / 2
        iy = ((iy + 1) * H_in - 1) / 2

    # 3. Generate out-of-bounds mask (to completely solve the padding_mode='zeros' issue)
    # When coordinates fall outside the image, the mask is 0, otherwise 1
    if padding_mode == 'zeros':
        valid_mask = (ix >= 0) & (ix < W_in) & (iy >= 0) & (iy < H_in)
        # Expand mask dimensions to match output (N, 1, H_out, W_out)
        valid_mask = valid_mask.unsqueeze(1).to(input.dtype)

    # 4. Coordinate clamping (prevent gather out-of-bounds errors)
    ix = ix.clamp(0, W_in - 1)
    iy = iy.clamp(0, H_in - 1)

    # 5. Calculate integer coordinates of the four neighboring pixels
    ix_nw = ix.floor().long()
    iy_nw = iy.floor().long()
    ix_ne = (ix_nw + 1).clamp(0, W_in - 1)
    iy_sw = (iy_nw + 1).clamp(0, H_in - 1)

    # 6. Calculate bilinear interpolation weights (N, 1, H_out, W_out)
    nw_w = ((ix_ne.float() - ix) * (iy_sw.float() - iy)).unsqueeze(1)
    ne_w = ((ix - ix_nw.float()) * (iy_sw.float() - iy)).unsqueeze(1)
    sw_w = ((ix_ne.float() - ix) * (iy - iy_nw.float())).unsqueeze(1)
    se_w = ((ix - ix_nw.float()) * (iy - iy_nw.float())).unsqueeze(1)

    # 7. Flatten input feature map, prepare for Gather
    # (N, C, H_in * W_in)
    input_flat = input.reshape(N, C, -1)

    # 8. Calculate 1D memory indices and expand to all channels
    # Base index shape: (N, H_out, W_out)
    idx_nw = (iy_nw * W_in + ix_nw)
    idx_ne = (iy_nw * W_in + ix_ne)
    idx_sw = (iy_sw * W_in + ix_nw)
    idx_se = (iy_sw * W_in + ix_ne)

    # Expand index shape: (N, C, H_out * W_out)
    def expand_idx(idx):
        return idx.unsqueeze(1).expand(N, C, H_out, W_out).reshape(N, C, -1)

    # 9. Gather pixel values of the four corners and reshape back to 2D
    val_nw = torch.gather(input_flat, 2, expand_idx(idx_nw)).reshape(N, C, H_out, W_out)
    val_ne = torch.gather(input_flat, 2, expand_idx(idx_ne)).reshape(N, C, H_out, W_out)
    val_sw = torch.gather(input_flat, 2, expand_idx(idx_sw)).reshape(N, C, H_out, W_out)
    val_se = torch.gather(input_flat, 2, expand_idx(idx_se)).reshape(N, C, H_out, W_out)

    # 10. Blend weights
    out = nw_w * val_nw + ne_w * val_ne + sw_w * val_sw + se_w * val_se

    # 11. Apply out-of-bounds mask (force to zero if outside field of view)
    if padding_mode == 'zeros':
        out = out * valid_mask

    return out


# Replace F.grid_sample
_original_grid_sample = F.grid_sample
F.grid_sample = export_friendly_grid_sample
```

## 3. ONNX Model Export and RKNN Conversion

Having resolved the Grid Sample operator issue, the subsequent ONNX export becomes relatively straightforward. As summarized in the article [How to Understand the Opset Version in ONNX Export Process?](https://pavelhan.tech/article/2026-04-08-how-to-understand-the-opset-version-in-ONNX-export-process/): **The highest Opset version supported by Rockchip NPU's version 2.3.2 model conversion tools and on-board NPU driver is 15. During actual deployment, the optimal Opset version to set is 12 or 13 to avoid stability and compatibility issues that may arise from overly recent versions.**

```python
model.export(
		format='onnx',
        imgsz=640,
        opset=13,         # Opset version compatible with RK3588
        dynamic=False,    # RK3588 requires static shapes
        simplify=True,    # Enable simplification
        device='cpu'
    )
```

The ONNX model exported above is the Opset=13 version with good support on the RK3588. Next, use the RKNN-Toolkit2 tool to perform on-board model conversion, translating the ONNX model into RKNN format:

```python
def convert():
    rknn = RKNN(verbose=True)

    # 1. Configuration: Add disable rules to resolve RT-DETR conversion errors
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
    # do_quantization=False maintains FP16 floating-point precision without INT8 quantization
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

## 4. On-Board Inference Execution

Finally, running on-board inference on the RK3588 using the `rknn-toolkit-lite2` tool allows you to see the execution results. However, the inference execution speed feels relatively slow, which might be related to the manual replacement of the Grid Sample operator:

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
    
# RKNN input preprocessing
img = cv2.cvtColor(img_src, cv2.COLOR_BGR2RGB)
img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
img = np.expand_dims(img, axis=0) 

print('--> Running forward propagation')
outputs = rknn_lite.inference(inputs=[img])

# Execute post-processing and draw bounding boxes
boxes, classes, scores = post_process(outputs, CONF_THRESH, h, w)
```

![result_fp16_final.jpg](/images/blog/RT-DETR模型的自定义数据训练以及在RK3588上的适配-2.jpg)