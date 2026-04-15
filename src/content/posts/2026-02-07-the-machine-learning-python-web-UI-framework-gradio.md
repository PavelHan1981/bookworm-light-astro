---
title: "机器学习领域的Python Web UI框架Gradio"
slug: "2026-02-07-the-machine-learning-python-web-UI-framework-gradio"
description: "Gradio是目前机器学习和数据科学领域最流行、最易上手的 Python Web UI 框架之一。简单来说，它的核心使命是：让你用极短的 Python 代码（通常只需几行），瞬间为你的机器学习模型构建一个可视化的演示界面。它特别适合用于快速原型设计、向团队/客户展示模型效果，或者在 Hugging Face Spaces 上托管 Demo。"
date: 2026-02-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["神经网络理论"]
draft: false
---


Gradio是目前机器学习和数据科学领域最流行、最易上手的 Python Web UI 框架之一。简单来说，它的核心使命是：让你用极短的 Python 代码（通常只需几行），瞬间为你的机器学习模型构建一个可视化的演示界面。它特别适合用于快速原型设计、向团队/客户展示模型效果，或者在 Hugging Face Spaces 上托管 Demo。


Gradio的官方网站是：[Gradio](https://www.gradio.app/)


![image.png](/images/blog/机器学习领域的Python-Web-UI框架Gradio-1.png)


### Gradio的重点特性

- **纯 Python 体验 (No HTML/CSS/JS):** 不需要任何前端知识。所有的组件（输入框、按钮、滑块、图像上传等）都可以通过 Python 类调用。
- **极速构建:** 对于标准的“输入 -> 模型 -> 输出”流程，通常 3-5 行代码即可完成，非常简单，容易上手。
- **丰富的组件库:** 针对机器学习场景内置了大量专用组件，如 Image（图像）、Audio（音频）、Video（视频）、Dataframe（表格）、Code（代码）等。
- **一键分享 (Shareable Links):** 运行 `.launch(share=True)` 后，Gradio 会自动生成一个公开的临时 URL（有效期 72 小时），你可以直接发给客户或同事，让他们在自己的浏览器里测试你的模型（虽然模型实际运行在你的电脑上）。_这个功能对于做一些demo的临时演示而言确实太方便了，不再需要浪费时间去搭建基于云服务的演示环境了。_
- **生态整合:** 它由 **Hugging Face** 收购并维护，因此与 Hugging Face 的生态系统（Spaces, Transformers）结合得非常紧密。
> 以上的这个一键分享的功能对于模型demo的演示和试用实在是太方便了，只需要启动web应用的时候，传递一个share=true的参数，外网就可以直接通过系统生成的一个public URL访问，不再需要浪费时间去搭建基于云服务的演示环境了。*

## 开发环境搭建与Hello World


gradio的开发环境安装非常简单，直接使用pip安装即可，如果需要在Jupyter notebooks中使用的话，还需要安装ipykernel：


```bash
pip3 install gradio ipykernel
```


总体上就，Gradio构建UI界面主要有两种构建方式：

- gr.Interface：提供最高级的抽象，使用起来最简单，比较适合单功能。
- gr.Blocks：更加灵活，如果需要更复杂的布局（例如多列排版、多个标签页、控制组件间的数据流向），可以使用 Blocks 像搭积木一样控制页面的每一个显示细节。

以下代码以两种方式分别演示基本的Hello World功能：


```python
import gradio as gr

def hello(name):
    return "你好，" + name

# Inferface模式
# demo = gr.Interface(
#    fn=hello,
#    inputs=['text'],
#    outputs="text",
# )

# Blocks模式
with gr.Blocks() as demo:
    name = gr.Textbox(label="请输入你的姓名")
    output = gr.Textbox(label="你好，姓名")
    greet_btn = gr.Button("打招呼")
    greet_btn.click(fn=hello, inputs=name, outputs=output)

demo.launch(share=True)
```


以上代码执行后，就可以在本地浏览器[http://127.0.0.1:7860看到Web](http://127.0.0.1:7860/%E7%9C%8B%E5%88%B0Web) UI界面。此外，在launch的share选项设置为True的情况下，Gradio还会自动产生一个外网可以访问的公开URL，这样就可以把这个URL分享给其他的同事或者客户，请他们体验当前模型的功能状况，而模型及其实际的运算仍然是在本地计算机上（_实际上Gradio只是在公共URL服务和本地计算机之间创建了一个tunnel，所有访问这个公共URL的流量都会被转发到本地计算机上_）。这个公开的URL可在1周内使用，对于演示和体验性的测试而言足够了。


```plain text
(sam3) PS D:\Code\sam3> & C:/Users/windl/anaconda3/envs/sam3/python.exe d:/Code/sam3/test/gradio_test.py
6.1.0
* Running on local URL:  http://127.0.0.1:7860
* Running on public URL: https://c5c263e07d4b02675c.gradio.live

This share link expires in 1 week. For free permanent hosting and GPU upgrades, run `gradio deploy` from the terminal in the working directory to deploy to Hugging Face Spaces (https://huggingface.co/spaces)
```


以下是上面的Blocks模式的UI界面：


![image.png](/images/blog/机器学习领域的Python-Web-UI框架Gradio-2.png)


## Gradio的主要组件


Gradio框架的使用主要建立在以下四个核心概念上：

- Blocks/Interface： 负责整个Web UI架构的布局管理。
- Component：超过30个内建的UI组件，用于方便地提供对文本、音频、图像等的输入和输出管理。
- Functions：标准的Python功能函数，从输入组件中得到数据，在functions中进行各种处理，最终通过输出组件输出和呈现出来。
- Launch：启动整个Gradio Web App的运行。

Gradio内置了 30 多种封装好的组件，这些组件通常既可以作为输入，也可以作为输出。具体取决于是将其放在inputs参数中还是outputs参数中。以下按照功能类型进行整理：


### 文本与对话类


gr.Textbox：最常用，主要用于显示文本框。

- 在输入模式中使用时，用于提供用户输入文本的界面，可支持设置 lines (行数)、placeholder (占位符)、type="password" (密码掩码)。
- 在输出模式中使用时，用于显示处理后的文本结果。

gr.Chatbot：大语言模型必备，专门用于显示对话历史。

- 通常作为输出组件，接收一个包含 (用户消息, 机器回复)元组的列表。

gr.Markdown：可支持 Markdown 语法的文本内容展示。常用于页面顶部的说明、公式渲染、或者富文本输出。


gr.Code：专门用于展示代码片段，支持语法高亮和一键复制按钮。


### 多媒体类 (Video和Audio)


gr.Image：上传和显示图片。

- 在输入模式中使用时，可支持上传静态图片、使用 Webcam 拍照或者提供画板 (canvas) 让用户手绘图像。且可以自动将图片转为numpy数组或PIL对象。
- 在输出模式中使用时，可用于展示处理后的图片。

gr.Audio：上传和播放音频文件。

- 在输入模式中使用时，可支持上传音频文件或者使用麦克风录音。
- 在输出模式中使用时，可用于播放Functions功能所生成的语音（TTS）或音乐，并提供波形图显示和下载按钮。

gr.Video：与Image组件类似，可支持上传或录制视频，以及播放生成的视频流。


gr.Gallery：用于以网格的形式同时展示多张图片，非常适合图像生成模型（一次生成 4 张图）或图像检索任务。


### 数值与控制类 (参数控制)


这部分组件通常作为输入，用于调节模型的参数或运行选项。


gr.Slider：滑动条组件，适合用于选择一定范围内的数值（如 0 到 1 之间的置信度阈值）。


gr.Dropdown：下拉菜单组件，适合从预定义的列表中选择一个值。


gr.Radio：单选按钮组。功能同 Dropdown，但所有选项直接展开显示。


gr.Checkbox/gr.CheckboxGroup：复选框，用于作为布尔值开关（True/False）或多选标签。


gr.Number：用于作为精确的数字输入框。


### 数据与文件类 (分析与通用)


gr.File：通用文件上传/下载。如果处理的是 PDF、Zip 包或特定格式的文件，可以用这个组件上传到程序中。可支持多文件上传。


gr.Dataframe：

- 在输入模式中使用时，类似 Excel 的表格编辑器，用户可以手动输入数据或粘贴 CSV。
- 在输出模式中使用时，可用于展示 Pandas DataFrame 数据，可支持排序和筛选。

gr.Plot：专门用于展示图表，可完美支持 matplotlib、plotly、bokeh等绘图库生成的对象。


gr.JSON：用于以树状结构漂亮地展示 JSON 数据或 Python 字典，可方便查看复杂的 API 返回结果。


## 基于Gradio演示OpenCV图像模糊化效果


下面使用Gradio的多个不同组件，演示一个使用Opencv实现对输入图像进行模糊化处理并显示出来的Web UI效果。代码如下所示：


```python
import gradio as gr
import cv2
import numpy as np

def apply_gaussian_blur(image, blur_level):
    if image is None:
        return None

    img_cv = np.array(image) # 将PIL图像转换为OpenCV格式
    ksize = int(blur_level * 2) + 1 # 确保高斯核大小是奇数
    blurred_img = cv2.GaussianBlur(img_cv, (ksize, ksize), 0) # 应用高斯模糊

    return blurred_img

# 创建Gradio界面
with gr.Blocks() as demo:
    gr.Markdown("# 基于OpenCV的图像高斯模糊处理演示")

    with gr.Row():
        # 左侧：输入区域
        with gr.Column():
            input_image = gr.Image(
                label="输入图像",
                type="pil",  # 使用PIL格式以便更好地处理
                sources=["upload", "webcam"]  # 支持上传和摄像头
            )

            blur_slider = gr.Slider(
                minimum=0,
                maximum=20,
                value=5,
                step=1,
                label="模糊程度",
                info="滑块值越大，模糊效果越强"
            )

            process_btn = gr.Button(
                "应用模糊",
                variant="primary"
            )

        # 右侧：输出区域
        with gr.Column():
            output_image = gr.Image(
                label="处理后的图像",
                type="pil"
            )

    # 连接按钮点击事件
    process_btn.click(
        fn=apply_gaussian_blur,
        inputs=[input_image, blur_slider],
        outputs=output_image
    )

    # 添加滑块变化时自动更新的功能
    blur_slider.change(
        fn=apply_gaussian_blur,
        inputs=[input_image, blur_slider],
        outputs=output_image
    )

demo.launch()
```


最终的UI显示效果如下：


![image.png](/images/blog/机器学习领域的Python-Web-UI框架Gradio-3.png)


## 参考资料

- [Gradio](https://www.gradio.app/)
- [Building User Interfaces For AI Applications with Gradio in Python | DataCamp](https://www.datacamp.com/tutorial/gradio-python-tutorial)
