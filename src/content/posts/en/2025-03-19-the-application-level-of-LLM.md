---
title: "AI Course for Non-Professionals 6: Typical Application Levels of LLMs"
slug: "2025-03-19-the-application-level-of-LLM"
description: "This series of articles aims to help non-AI professionals understand the basic concepts of AI and its large language models (LLMs) in practical applications. By deeply understanding and clarifying these concepts, we aim to build a knowledge structure regarding the working mechanisms, workflows, and application frameworks of LLMs, enabling us to better utilize AI in our daily lives and work."
date: 2025-03-19T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory","LLM"]
draft: false
---

This series of articles aims to help non-AI professionals understand the basic concepts of AI and its large language models (LLMs) in practical applications. By deeply understanding and clarifying these concepts, we aim to build a knowledge structure regarding the working mechanisms, workflows, and application frameworks of LLMs, enabling us to better utilize AI in our daily lives and work.

The application of Large Language Models (LLMs) in specific industries and domains can be roughly divided into several levels, as shown in the figure below. Designing and building an LLM completely from scratch carries the highest difficulty and barrier to entry. In contrast, the simplest application is what we call Prompt Engineering, which involves carefully organizing the language structure of queries (Prompts) when interacting with an LLM, so that the model's output aligns more closely with our specific requirements.

![image.png](/images/blog/非专业人士的AI课6：-1.png)

## Building a Model from Scratch

For applications that involve building an LLM from scratch, the entire process follows what is described in [[[3. Detailed Explanation of the Typical Development Workflow for LLM Projects]]](https://www.pavelhan.tech/article/2025-03-14-the-basic-development-workflow-of-LLM). It starts with project requirements analysis and definition, followed by planning, selecting appropriate technical approaches or optimizing based on open-source LLM frameworks, preparing training data in advance for model and application development needs, using data for pre-training and fine-tuning model parameters, and finally deploying the model to servers to roll out to target users.

The entire process places extremely high demands on team capabilities, computing resources, data, and development cycles. Therefore, this development model also represents the highest barrier to entry in LLM applications.

### Private Deployment and Fine-Tuning of Open-Source LLMs

Compared to developing an LLM from scratch, this approach is somewhat simpler. It basically involves the private deployment of an open-source LLM that has already completed pre-training (such pre-trained models are also referred to as Base Models), followed by fine-tuning using specialized annotated datasets corresponding to the target application domain. The workload after fine-tuning is quite similar to the model-building-from-scratch approach.

This development model bypasses the design and development of the LLM itself, as well as the costly pre-training phase based on massive general semantic data. It only requires fine-tuning, which significantly reduces the requirements for team capabilities and computing resources. Consequently, this development mode is relatively friendly to small- and medium-sized teams and individual developers.

## Instruction-Tuned LLMs

First, let's distinguish between Base LLMs and Instruction-Tuned LLMs.

- A Base LLM is a language model pre-trained via large-scale self-supervised learning, relying primarily on massive text data to learn language structures and patterns. While such models possess powerful text generation capabilities, they often lack the explicit instruction-understanding ability required to execute specific tasks. In other words, a model that has completed pre-training as described in [[[3. Detailed Explanation of the Typical Development Workflow for LLM Projects]]](https://www.pavelhan.tech/article/2025-03-14-the-basic-development-workflow-of-LLM) but has not yet undergone fine-tuning is a Base LLM. It possesses a comprehensive understanding of semantic rules and foundational knowledge of language, but lacks the ability to comprehend user-input instructions.
- In contrast, an Instruction-Tuned LLM undergoes additional instruction tuning based on a Base LLM. The goal is to make it more adept at handling task instructions provided by humans, thereby improving its practicality and interactive experience. Compared to a Base LLM, after instruction tuning using an instruction dataset, the model acquires stronger task-execution capabilities, enabling it to more accurately generate valuable content that matches user expectations.

Starting from a Base LLM and fine-tuning it with an instruction dataset allows the Base LLM to evolve into an Instruction-Tuned LLM. Instruction datasets generally contain complete sequences of instruction-context-response. Therefore, instruction tuning has high data requirements, typically incorporating a large volume of task examples written by human annotators for instruction-tuning tasks, which are used to train the model to understand task instructions and generate expected responses.

Below is a typical example of an instruction-tuning dataset:

![image.png](/images/blog/非专业人士的AI课6：-2.png)

- Datasets used for instruction tuning have relatively strict requirements regarding data content and format. `databricks-dolly-15k` is an open-source instruction-tuning dataset containing instruction-following records generated by thousands of Databricks employees. This dataset can be downloaded from HuggingFace.

After fine-tuning the Base LLM with such instruction datasets, the model can recognize and execute user-input instructions and output responses that better align with the user's anticipated needs. To further constrain the model's outputs, some models also employ Reinforcement Learning from Human Feedback (RLHF) to ensure that the generated answers conform more closely to human values and ethical preferences.

- This process is already described in detail in [[[3. Detailed Explanation of the Typical Development Workflow for LLM Projects]]](https://www.pavelhan.tech/article/2025-03-14-the-basic-development-workflow-of-LLM).

**In fact, the meaning of "fine-tuning" often extends beyond the instruction tuning highlighted here. In practical applications, we also curate targeted fine-tuning training data based on the specialized knowledge required by specific industries and application scenarios. By fine-tuning the Base LLM on these specific industry domains, we make it better suited for application in those fields. This fine-tuning process is largely similar to instruction tuning; both involve utilizing additional training data on top of a Base LLM to make it align more closely with application requirements and expectations.**

> **Everything above this point can be referred to as AI Model Development, while everything below can be referred to as AI Application Development.**

## RAG and AI Agents

RAG (Retrieval-Augmented Generation) and AI Agents are currently the hottest directions in the field of AI application development.

For information regarding RAG, please refer to [[[4. A Comprehensive Guide to the Workflow of RAG and Its Differences from Fine-Tuning]]](https://www.pavelhan.tech/article/2025-03-15-the-workflow-of-RAG), which provides a very detailed explanation and description and will not be repeated here.

For information regarding AI Agents, please refer to [[[5. Analysis of the Framework and Workflow of AI Agents]]](https://www.pavelhan.tech/article/2025-03-18-the-AI-agent-framework-and-workflow), which provides a very detailed explanation and description and will not be repeated here.

## Prompt Engineering

Both few-shot prompting and zero-shot prompting discussed below fall under the umbrella of prompt engineering. Prompt engineering is the linguistic art of carefully designing and optimizing input information to guide AI in generating high-quality, accurate, and targeted responses. If your prompt-writing skills are lacking, the AI's response will often resemble a pile of correct yet empty corporate jargon (text garbage); conversely, its response can be astonishingly good. Therefore, when querying the same model with the same question, the quality of the model's output is strongly correlated with the input prompt.

There is no single definitive answer on how to write a good prompt. However, considering the working principles and processes behind LLM information inference, a well-crafted prompt should ideally include at least three parts: role definition, providing context, and defining the objective/asking the question. Below is a framework for writing good prompts referenced from three sources. By carefully organizing your questions and requests to the LLM according to this framework, you can effectively solve a vast number of problems in your work and life.

![image.png](/images/blog/非专业人士的AI课6：-3.png)

### Few-Shot Prompting

Few-shot prompting refers to scenarios where we encounter slightly complex problems that are difficult to express clearly using language alone. In such cases, when querying the large model, we provide a few examples so that the model can analyze the structure, logic, and tone of the examples on its own, and generate similar content based on what it has learned.

Below is a classic example of few-shot prompting. The prompt entered by the user into the LLM is:

![image.png](/images/blog/非专业人士的AI课6：-4.png)

The result returned by the model based on the above prompt is:

![image.png](/images/blog/非专业人士的AI课6：-5.png)

### Zero-Shot Prompting

Zero-shot prompting refers to the model's ability to complete tasks instructed by the user without including any examples in the prompt. This type of prompt is generally used for relatively simple tasks with clear objectives and processes, and it also requires the user's prompt to be extremely explicit, relying on the LLM's strong capability to understand user needs.

In summary, for relatively simple tasks with clear objectives, zero-shot prompting can be used by defining the task you want the model to perform as explicitly, clearly, and thoroughly as possible to facilitate model comprehension.

## References

- *Large Model Application Development: Hands-on AI Agents*
- *Large Model RAG in Action: RAG Principles, Applications, and System Building*
- *AI Efficiency Handbook: Unlocking High Performance with ChatGPT*
- [A Comprehensive Guide: What are Base LLMs and Instruction-Tuned LLMs?](https://mp.weixin.qq.com/s?__biz=MzI4MjE1Nzc2MQ%3D%3D&mid=2649037721&idx=1&sn=9f4209975d2be3fdc1a580fbd3c86730&scene=21#wechat_redirect)