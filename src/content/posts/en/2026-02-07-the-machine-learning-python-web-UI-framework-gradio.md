---
title: "Gradio: A Python Web UI Framework for Machine Learning"
slug: "2026-02-07-the-machine-learning-python-web-UI-framework-gradio"
description: "Gradio is currently one of the most popular and user-friendly Python Web UI frameworks in the fields of machine learning and data science. Simply put, its core mission is to let you build a visual demo interface for your machine learning model instantly with a very short amount of Python code (usually just a few lines). It is particularly ideal for rapid prototyping, showcasing model performance to teams/clients, or hosting demos on Hugging Face Spaces."
date: 2026-02-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory"]
draft: false
---


Gradio is currently one of the most popular and user-friendly Python Web UI frameworks in the fields of machine learning and data science. Simply put, its core mission is to let you build a visual demo interface for your machine learning model instantly with a very short amount of Python code (usually just a few lines). It is particularly ideal for rapid prototyping, showcasing model performance to teams/clients, or hosting demos on Hugging Face Spaces.


The official website of Gradio is: [Gradio](https://www.gradio.app/)


![image.png](/images/blog/机器学习领域的Python-Web-UI框架Gradio-1.png)


### Key Features of Gradio

- **Pure Python Experience (No HTML/CSS/JS):** No front-end knowledge is required. All components (input boxes, buttons, sliders, image uploaders, etc.) can be invoked through Python classes.
- **Lightning-Fast Construction:** For standard "input -> model -> output" workflows, 3-5 lines of code are usually enough to get the job done—making it very simple and easy to pick up.
- **Rich Component Library:** It comes with a large number of specialized components built specifically for machine learning scenarios, such as Image, Audio, Video, Dataframe, and Code.
- **Shareable Links:** After running `.launch(share=True)`, Gradio automatically generates a public temporary URL (valid for 72 hours) that you can directly send to clients or colleagues so they can test your model in their own browsers (while the model actually runs on your computer). _This feature is extremely convenient for temporary demo presentations, eliminating the time wasted on setting up cloud-based demo environments._
- **Ecosystem Integration:** Acquired and maintained by **Hugging Face**, it integrates tightly with the Hugging Face ecosystem (Spaces, Transformers).
> The one-click sharing feature mentioned above is exceptionally convenient for demonstrating and testing model demos. You just need to pass a `share=True` parameter when starting the web app, and external networks can directly access it via a generated public URL. There is no longer any need to waste time setting up cloud-based demonstration environments. *

## Development Environment Setup and Hello World


Installing the development environment for Gradio is very straightforward; you can install it directly using `pip`. If you need to use it within Jupyter notebooks, you also need to install `ipykernel`:


```bash
pip3 install gradio ipykernel
```


Generally speaking, Gradio offers two main ways to build UI interfaces:

- `gr.Interface`: Provides the highest level of abstraction, making it extremely simple to use and best suited for single-function workflows.
- `gr.Blocks`: More flexible. If you need more complex layouts (such as multi-column arrangements, multiple tabs, or controlling data flow between components), you can use `Blocks` like building blocks to control every display detail of the page.

The following code demonstrates the basic Hello World functionality using both approaches:


```python
import gradio as gr

def hello(name):
    return "Hello, " + name

# Interface mode
# demo = gr.Interface(
#    fn=hello,
#    inputs=['text'],
#    outputs="text",
# )

# Blocks mode
with gr.Blocks() as demo:
    name = gr.Textbox(label="Enter your name")
    output = gr.Textbox(label="Hello, name")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=hello, inputs=name, outputs=output)

demo.launch(share=True)
```


Once the above code is executed, you can view the Web UI interface in your local browser at [http://127.0.0.1:7860](http://127.0.0.1:7860). In addition, when the `share` option in `launch` is set to `True`, Gradio automatically generates a public URL accessible from the external network. This allows you to share the URL with colleagues or clients so they can test the model's functionality, while the model and its actual computations remain on your local machine (_in fact, Gradio simply creates a tunnel between the public URL service and your local computer, forwarding all traffic hitting the public URL to your local machine_). This public URL remains valid for 1 week, which is more than enough for demonstration and experiential testing.


```plain text
(sam3) PS D:\Code\sam3> & C:/Users/windl/anaconda3/envs/sam3/python.exe d:/Code/sam3/test/gradio_test.py
6.1.0
* Running on local URL:  http://127.0.0.1:7860
* Running on public URL: https://c5c263e07d4b02675c.gradio.live

This share link expires in 1 week. For free permanent hosting and GPU upgrades, run `gradio deploy` from the terminal in the working directory to deploy to Hugging Face Spaces (https://huggingface.co/spaces)
```


Below is the UI interface of the Blocks mode shown above:


![image.png](/images/blog/机器学习领域的Python-Web-UI框架Gradio-2.png)


## Main Components of Gradio


The use of the Gradio framework is primarily built upon four core concepts:

- **Blocks/Interface:** Responsible for layout management of the entire Web UI architecture.
- **Component:** Over 30 built-in UI components for conveniently handling inputs and outputs of text, audio, images, etc.
- **Functions:** Standard Python functional code that receives data from input components, performs various processing operations, and ultimately outputs and renders the results via output components.
- **Launch:** Kicks off the execution of the entire Gradio Web App.

Gradio includes over 30 well-packaged components built-in. These components can generally act as both inputs and outputs, depending on whether they are placed in the `inputs` parameter or the `outputs` parameter. They are categorized below by functional type:


### Text and Chat Classes


`gr.Textbox`: The most commonly used component, primarily for displaying text boxes.

- When used in input mode, it provides an interface for users to enter text, supporting options like `lines`, `placeholder`, and `type="password"` (password masking).
- When used in output mode, it displays processed text results.

`gr.Chatbot`: Essential for Large Language Models, specifically designed to display conversation history.

- Typically used as an output component, receiving a list of `(user_message, bot_response)` tuples.

`gr.Markdown`: Displays text content supporting Markdown syntax. Often used for introductory notes at the top of pages, formula rendering, or rich text output.


`gr.Code`: Specifically designed for showcasing code snippets, supporting syntax highlighting and a one-click copy button.


### Multimedia Classes (Video and Audio)


`gr.Image`: For uploading and displaying images.

- When used in input mode, it supports uploading static images, taking photos using a webcam, or providing a canvas for users to draw hand-drawn images. It can also automatically convert images into NumPy arrays or PIL objects.
- When used in output mode, it displays processed images.

`gr.Audio`: For uploading and playing audio files.

- When used in input mode, it supports uploading audio files or recording audio via microphone.
- When used in output mode, it plays synthetic speech (TTS) or music generated by functions, while providing a waveform display and download button.

`gr.Video`: Similar to the Image component, it supports uploading or recording videos, as well as playing generated video streams.


`gr.Gallery`: Used to display multiple images simultaneously in a grid layout, making it ideal for image generation models (generating 4 images at once) or image retrieval tasks.


### Numeric and Control Classes (Parameter Control)


These components are typically used as inputs to adjust model parameters or execution options.


`gr.Slider`: A slider component ideal for selecting numeric values within a specific range (such as a confidence threshold between 0 and 1).


`gr.Dropdown`: A drop-down menu component suitable for selecting a single value from a predefined list.


`gr.Radio`: A radio button group. Functions similarly to `Dropdown`, but all options are directly expanded and displayed.


`gr.Checkbox` / `gr.CheckboxGroup`: Checkboxes used as boolean switches (`True`/`False`) or multi-selection tags.


`gr.Number`: Used as a precise numeric input box.


### Data and File Classes (Analysis and General Purpose)


`gr.File`: General-purpose file upload/download. If you are handling PDFs, Zip archives, or specific file formats, you can use this component to upload them into your program. Multi-file uploads are supported.


`gr.Dataframe`:

- When used in input mode, it acts like an Excel-like table editor where users can manually enter data or paste CSVs.
- When used in output mode, it displays Pandas DataFrame data, supporting sorting and filtering.

`gr.Plot`: Specifically designed for displaying charts, offering seamless support for objects generated by plotting libraries like Matplotlib, Plotly, and Bokeh.


`gr.JSON`: Used to display JSON data or Python dictionaries cleanly in a tree structure, making it convenient to inspect complex API response results.


## Demonstrating OpenCV Image Blurring with Gradio


Below is a demonstration of a Web UI that uses multiple Gradio components and OpenCV to blur an input image and display the result. The code is shown below:


```python
import gradio as gr
import cv2
import numpy as np

def apply_gaussian_blur(image, blur_level):
    if image is None:
        return None

    img_cv = np.array(image) # Convert PIL image to OpenCV format
    ksize = int(blur_level * 2) + 1 # Ensure Gaussian kernel size is odd
    blurred_img = cv2.GaussianBlur(img_cv, (ksize, ksize), 0) # Apply Gaussian blur

    return blurred_img

# Create Gradio interface
with gr.Blocks() as demo:
    gr.Markdown("# OpenCV Image Gaussian Blur Demo")

    with gr.Row():
        # Left side: Input area
        with gr.Column():
            input_image = gr.Image(
                label="Input Image",
                type="pil",  # Use PIL format for better processing
                sources=["upload", "webcam"]  # Support upload and webcam
            )

            blur_slider = gr.Slider(
                minimum=0,
                maximum=20,
                value=5,
                step=1,
                label="Blur Level",
                info="Higher slider values result in a stronger blur effect"
            )

            process_btn = gr.Button(
                "Apply Blur",
                variant="primary"
            )

        # Right side: Output area
        with gr.Column():
            output_image = gr.Image(
                label="Processed Image",
                type="pil"
            )

    # Connect button click event
    process_btn.click(
        fn=apply_gaussian_blur,
        inputs=[input_image, blur_slider],
        outputs=output_image
    )

    # Add auto-update functionality when the slider changes
    blur_slider.change(
        fn=apply_gaussian_blur,
        inputs=[input_image, blur_slider],
        outputs=output_image
    )

demo.launch()
```


The final UI rendering effect looks like this:


![image.png](/images/blog/机器学习领域的Python-Web-UI框架Gradio-3.png)


## References

- [Gradio](https://www.gradio.app/)
- [Building User Interfaces For AI Applications with Gradio in Python | DataCamp](https://www.datacamp.com/tutorial/gradio-python-tutorial)