---
title: "AI Course for Non-Professionals 3: A Detailed Guide to the Typical Development Workflow of LLM Projects"
slug: "2025-03-14-the-basic-development-workflow-of-LLM"
description: "The goal of this series of articles is to help non-AI professionals understand the basic concepts of AI and its large language models (LLMs) in practical applications. By deeply understanding and clarifying these concepts, we aim to build a solid knowledge structure regarding the working mechanisms, workflows, and application frameworks of LLMs, enabling us to better utilize AI in our daily lives and work."
date: 2025-03-14T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory", "LLM"]
draft: false
---

The goal of this series of articles is to help non-AI professionals understand the basic concepts of AI and its large language models (LLMs) in practical applications. By deeply understanding and clarifying these concepts, we aim to build a solid knowledge structure regarding the working mechanisms, workflows, and application frameworks of LLMs, enabling us to better utilize AI in our daily lives and work.

Based on the study of reference materials, this article summarizes and explains each stage of the LLM development workflow in detail, establishing a preliminary knowledge structure for LLM development.

Overall, the typical development workflow for large language model projects in the commercial sector includes the following key aspects:

- Project requirements analysis and determination of project objectives
- Preliminary data preparation based on project objectives
- Model design and selection based on project objectives
- Model training using data
- Deploying the model into the application environment to provide pre-defined services for project requirements
- Operations and maintenance (O&M) of the model in practical applications

## 1. Determining Project Objectives

At the early stage of initiating any LLM-related project, the first step is to clarify the project objectives and construct the system framework. This is crucial because it influences the subsequent targeted selection of model architecture, algorithms, and training datasets.

Project requirements analysis and objective setting serve as the starting point for LLM project development, providing clear directions and constraints for subsequent data preparation, model design/selection, and model training. Therefore, **before officially launching an LLM project, one must first identify the knowledge domain and the specific problems the project aims to solve. Only when project objectives are clearly defined can appropriate models and training data be selected, leading to the design of an efficient system framework whose costs and benefits maximize project requirements.**

The diagram below illustrates the system design of a financial analysis model provided in Reference 1:

![image.png](/images/blog/非专业人士的AI课3：-1.png)

- Based on the functional and performance requirements of the system, an open-source model with an appropriate scale and cost is selected as the foundation for system design.
- Using publicly available financial reports and related data collected online as a foundation, the large model acts as a dataset generator. By learning from these few-shot annotated data, it automatically expands the dataset, providing more training samples for the subsequent training phases of the project.

## 2. Preparing Model Training Data

This stage actually consists of two main aspects: data collection and data preprocessing.

Depending on the training requirements specified in the project system design, developers can acquire training data from the internet, public datasets, user-generated content, internal company data, and other sources. For LLM training, data types include text, images, audio, etc. Developers should prioritize open-source datasets as well as publicly available online datasets related to the specific vertical domain the model aims to address.

The data preprocessing stage involves processing different types of data, such as text and images, separately, with the ultimate goal of constructing high-quality datasets:

- For text data, common processing methods generally include low-quality filtering (identifying and removing low-quality data), redundancy removal (stripping redundant elements from multiple granularity perspectives), and privacy elimination (identifying and removing personal/organizational privacy and sensitive information contained in the data).
- For image data, techniques such as image denoising, image resampling (resolution scaling), and image enhancement (improving contrast, brightness, etc.) are generally employed to enhance image data quality.

### Tokenization and Embedding

Once data processing is complete, the next step is tokenization. Tokenization is the process of splitting text into discrete, meaningful minimum language units, which are called tokens. The process of converting training text into tokens is performed using a tokenizer.

- When we interact with LLMs in our daily use, we can clearly see the model's output being generated sequentially word by word or character by character; each such unit is a token. When we call APIs to access LLMs, the cost is also billed based on the number of tokens involved in the interaction (including upstream input tokens from the user's prompt and downstream output tokens generated by the model).
- To facilitate text tokenization for developers, many mainstream development frameworks encapsulate tokenization functionality into tokenizer components or classes for developers to invoke. Tokenizers simplify the development workflow, improve code reusability, and ensure consistency throughout the process. Therefore, open-source tokenizers can be downloaded from Hugging Face and modified for custom needs.

![image.png](/images/blog/非专业人士的AI课3：-2.png)

After the tokenizer performs tokenization on the training text, the text sentences are split into individual minimum language units. However, these language units still cannot be recognized directly by the large model. At this point, a vectorization operation called embedding must be performed on each language unit. Embedding is the process of mapping words into numerical vectors. This allows the model to understand and process these vectors, performing calculations and analyses based on these numerical features, thereby achieving deep processing and understanding of natural language.

- The concepts of tokenization and embedding are also utilized in RAG (Retrieval-Augmented Generation) applications based on large models. Similarly, the contents of external files or text files searched from the internet undergo tokenization and embedding before being fed into the large model for subsequent processing.

![image.png](/images/blog/非专业人士的AI课3：-3.png)

## 3. Model Design and Selection

Basically, the foundation of almost all LLMs is the Transformer architecture, while image modules in multi-modal models generally adopt the Vision Transformer architecture. Overall, the development, design, optimization, and tuning of large models represent the most technically challenging parts of the entire system design and implementation process. Therefore:

- **From a realistic perspective, when small development teams or individual developers implement most AI business use cases, they no longer need to build models from scratch. Instead, they can choose open-source LLMs based on their task requirements, such as DeepSeek, Qwen, LLaMA, ChatGLM, Alpaca, etc.** This approach saves a significant amount of model design time and improves development efficiency.
- For teams with ample resources and capabilities who choose to develop models from scratch, they generally need to select a suitable deep learning framework before model construction. Current mainstream deep learning frameworks include TensorFlow and PyTorch. TensorFlow is an open-source framework developed by the Google team, PyTorch is an open-source framework developed by the Meta team, and domestic mainstream open-source frameworks include Baidu's PaddlePaddle. Next, they define the model structure, including layer hierarchy, parameter initialization, definition of loss functions, and selection of optimization algorithms.

## 4. Model Training

The training process of large models generally involves three basic steps: tokenizer training, pre-training, and fine-tuning.

Pre-training:

- Training the model based on large-scale corpora with the goal of enabling the model to acquire basic natural language understanding and generation capabilities, as well as rich and broad knowledge, laying a solid foundation for subsequent task execution.
- During the pre-training phase, a large amount of unlabelled data is acquired through low-cost channels and fed into the model. The model then learns common-sense knowledge from these data, forming a generalized understanding of language.

Fine-tuning:

- Fine-tuning is a model training technique that uses target task data to train a pre-trained language model further.
- During the fine-tuning phase, a small amount of annotated data in the target domain and direction (which generally comes with higher costs) is used to further train the Base Model from the pre-training phase, adapting it to the application requirements of the target domain and specific tasks.
> Currently, the "pre-training + fine-tuning" development paradigm is widely adopted in both computer vision and NLP fields. Generally speaking, especially for small and medium-sized teams, developers do not need to perform full pre-training on their own; instead, they can select a suitable open-source pre-trained model and fine-tune it according to the specific task requirements.

![image.png](/images/blog/非专业人士的AI课3：-4.png)

In addition, if the model's output needs to be made harmless (ensuring that the content generated by the LLM does not contain harmful, inappropriate, or unethical content), techniques such as RLHF (Reinforcement Learning from Human Feedback) or RLAIF (Reinforcement Learning from AI Feedback) must be employed to align the model with human values.

- RLHF (Reinforcement Learning from Human Feedback): The specific workflow involves sampling a portion of data from a prompt database, having the model generate multiple answers simultaneously, and then having human annotators score or rank these generated answers. Afterward, reinforcement learning algorithms are used to fine-tune the model. This entire process effectively uses the scoring or ranking information of multiple model-generated answers to better align the model with human values and intentions, producing more natural outputs that match human expectations.
- RLAIF (Reinforcement Learning from AI Feedback): RLAIF is an alternative to RLHF, aiming to use feedback generated by AI models to replace feedback provided by human annotators, thereby reducing the dependency on manual annotation during model training. Its workflow mainly involves using another more powerful LLM to evaluate and score the output answers of the model currently being trained (replacing the manual labor in RLHF during this step), and then fine-tuning the target model via reinforcement learning algorithms.

## 5. Model Deployment

Model deployment refers to the process of deploying a large model into actual application scenarios. **However, model deployment is not just a matter of simply placing a trained model onto a server.** In model deployment, operations such as model quantization, knowledge distillation, and model pruning are generally required based on the pre-trained model to achieve model compression and minimize the hardware resources required by the model.

## 6. Model Application and O&M

The final step is to open up the trained large model services to target users. For the utilization and O&M of large model services, easy-to-use and aesthetically pleasing frontend tools need to be provided. In addition, developers can leverage LLM development frameworks like LangChain to build more diversified LLM applications based on trained and deployed models, or use trained and deployed LLMs as central decision-making and reasoning modules to build more flexible and powerful AI Agent applications.

## References

- "Introduction to Large Models", by Chengwen Zhang
- [An Article Explaining Clearly What Pre-Training and Fine-Tuning Are](https://mp.weixin.qq.com/s/GFAl7UFKUujxwOmUimfLsA)