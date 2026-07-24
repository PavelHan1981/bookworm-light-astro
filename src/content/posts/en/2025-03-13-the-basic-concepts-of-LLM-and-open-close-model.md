---
title: "AI Course for Non-Professionals 2: Summary of Large Model Multimodality, Open-Source, and Closed-Source Concepts"
slug: "2025-03-13-the-basic-concepts-of-LLM-and-open-close-model"
description: "The goal of this article series is to help non-AI professionals understand the basic concepts of AI and large language models in practical applications. By deeply understanding and clarifying these concepts, we aim to build a knowledge structure regarding the working mechanisms, workflows, and application frameworks of large models, enabling us to better utilize AI in our daily lives and work."
date: 2025-03-13T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory", "LLM"]
draft: false
---

The goal of this article series is to help non-AI professionals understand the basic concepts of AI and large language models in practical applications. By deeply understanding and clarifying these concepts, we aim to build a knowledge structure regarding the working mechanisms, workflows, and application frameworks of large models, enabling us to better utilize AI in our daily lives and work.

## What Exactly is an LLM (Large Language Model)?

Currently, the large models we refer to are fully known as LLMs (Large Language Models). The "large" refers to the massive scale of parameters contained within these models; mainstream LLMs in the market today feature parameter counts exceeding the hundreds of billions. "Language" refers to natural language, meaning these models can interact directly with humans using natural language (rather than code understood only by computers and programmers). Users input their requests into the model using natural language, and the model responds and replies in natural language as well.

When a user inputs natural language text information into a model, and the model generates natural language text content that the user can understand, this type of model is referred to as a single-modal large language model.

The most typical single-modal LLM is OpenAI's GPT-3.5, which ignited the AI wave with a staggering 17.5 billion parameters. Such a massive parameter scale delivers exceptional performance and strong learning capabilities, but it also imposes higher demands on computing and storage resources, driving up the costs of training and inference.

### Single-Modality vs. Multimodality

In the current development trend of large models, the most popular ones are predominantly multimodal models. Multimodality means that the model's inputs and outputs support not only the natural language text information handled by single-modal models like GPT-3.5, but also content such as images, audio, and even video—for example, text-to-image, text-to-video, and generating descriptive text based on images.

![image.png](/images/blog/非专业人士的AI课2：-1.png)

Several popular multimodal large models currently offered by OpenAI in the market include GPT-4 and higher versions which can recognize images, the text-to-image model DALL-E 3, the text-to-video model Sora, and the speech-to-text model Whisper. Meanwhile, domestic models such as Alibaba's Qwen, Tencent's Hunyuan, Baidu's Ernie Bot, and ByteDance's Doubao have also largely achieved multimodal support for images, audio, and more.

### YOLO

In addition to LLMs, there are other specialized AI models focused on solving specific types of problems. For example, the YOLO model is used for object detection in videos and images (such as detecting people, vehicles, and pets). Such models typically have tens of millions of parameters, emphasizing lightweight design and real-time performance, making them suitable for edge computing scenarios. They can analyze input images to generate bounding boxes and category predictions. Currently, about 78% of autonomous driving companies and 65% of smart camera manufacturers choose YOLO as their primary detection framework, though specific versions are adjusted based on hardware performance. For instance, in-vehicle systems often use YOLOv8m (balancing accuracy and speed), while access control cameras lean toward YOLOv5s (lower power consumption).

## Open-Source vs. Closed-Source Large Models

**The commercial business model chosen by a large model—whether open-source or closed-source—determines whether its core resources, such as source code, model weights, training data, and training processes, are fully public and permit anyone to view, modify, and distribute them (under traditional open-source licenses like Apache 2.0).** For example, the DeepSeek-R1 model adopts the Apache 2.0 license, allowing developers to freely build commercial applications based on its code. This openness fosters collaborative innovation among global developers, forming a "community-driven" ecosystem model.

The table below lists the current open-source and closed-source status of mainstream large models:

![image.png](/images/blog/非专业人士的AI课2：-2.png)

As can be seen, Meta's Llama, Alibaba's Qwen, and the recently skyrocketing DeepSeek have all chosen open-source business models. In fact, since the surge of DeepSeek, various domestic large model manufacturers such as Tencent and Kimi have also chosen to open-source the large models they developed. So, why do these manufacturers choose an open-source business model?

### Advantages of the Open-Source Model for Large Models

- The greatest benefit brought by open-sourcing a large model is the rapid establishment of its own technical ecosystem, attracting more small and medium-sized developers and enterprises to quickly participate in the improvement and optimization of the open-source model. For instance, after Meta's Llama series was open-sourced, it quickly spawned multiple vertical-domain models, accelerating technological iteration.
- The maturation of the open-source ecosystem can also rapidly drive cooperation and adaptation among upstream and downstream manufacturers. For example, after DeepSeek open-sourced its models, it quickly gained traction and integration from cloud providers, communities, and chip manufacturers.
- The open-source model can attract more users and developers, thereby enhancing brand awareness and industry influence. For example, DeepSeek's open-source initiative not only promoted technological popularization but also reshaped the competitive landscape of the large model market. Compared to Kimi, which has similar technical competitiveness but adopts a closed-source model—despite spending over 900 million RMB on marketing in 2024—its promotional effectiveness falls far short of the impact generated by DeepSeek's open-source approach.
- The commercial monetization pathways of the open-source model are more diversified. Open-source does not mean entirely free; manufacturers can profit by providing value-added services (such as enterprise-level solutions, customized services, and API interfaces) and can also monetize data and traffic, such as through advertising and user data analysis.
- Of course, while open-sourcing large models, companies also employ mechanisms like patents to protect their core technologies. For instance, DeepSeek has filed patent applications in multiple key areas, covering large model training optimization, system stability optimization, network and hardware optimization, and more. This dual-track strategy of "open-source + patents" both protects core technologies and prevents competitors from preemptively registering patents or committing infringement.

After a large model is released as open-source:

- Competitors and teams with large model development capabilities can study the related source code, participate in improving and optimizing the model, and conduct customized development and training for specific vertical domains.
- Cloud service providers can deploy the trained large models onto their own cloud servers and provide services to users via APIs or other methods for commercial gain.
- Small-to-medium teams and individual developers can perform private deployments based on open-source large models and conduct customized training and fine-tuning tailored to the needs of their current industries and institutions.

### Hugging Face

When it comes to open-source large models, it is impossible to omit Hugging Face ([www.huggingface.co](http://www.huggingface.co/)), the renowned website in the field of AI large model development. Hugging Face is akin to the GitHub of the AI model world, maintaining the code and open-source training data for nearly all open-source large models globally. As of March 2025, close to 1.5 million large models and over 300,000 open-source training datasets have been uploaded to Hugging Face. Therefore, this provides immense convenience for small teams and individual developers to independently deploy and train open-source large models.

![image.png](/images/blog/非专业人士的AI课2：-3.png)

**In fact, for the vast majority of small development teams or individual developers looking to engage in large model development, there is no need to build models from scratch when tackling most artificial intelligence tasks. A more realistic approach is to select open-source large models on demand—such as DeepSeek, Tongyi Qwen, LLaMA, ChatGLM, and Alpaca—based on the type of task they need to solve. By downloading the corresponding open-source large models, training datasets, and other training and deployment assets from websites like Hugging Face, they can base their customized industry application development and training on this foundation. This approach can save a substantial amount of model design time and boost development efficiency.**