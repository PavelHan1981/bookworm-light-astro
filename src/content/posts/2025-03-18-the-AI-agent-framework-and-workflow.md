---
title: "非专业人士的AI课5：AI Agent的框架与工作流程解析"
slug: "2025-03-18-the-AI-agent-framework-and-workflow"
description: "本系列文章的目标是从非AI从业者的角度出发，去尝试理解AI及其大模型在应用中的基本概念，争取通过对这些概念的深入理解和澄清，建立对大模型的工作机制流程以及应用框架方面的知识结构，从而在我们的生活和工作中更好的使用AI。"
date: 2025-03-18T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["神经网络理论","LLM"]
draft: false
---


本系列文章的目标是从非AI从业者的角度出发，去尝试理解AI及其大模型在应用中的基本概念，争取通过对这些概念的深入理解和澄清，建立对大模型的工作机制流程以及应用框架方面的知识结构，从而在我们的生活和工作中更好的使用AI。


## AI Agent是什么？


在AI的应用方面，目前最成熟和最广泛的仍然是以类似ChatGPT一样的对话应用，系统提供一个可支持文本输入或者语音输入的界面，用户在其中按照提示词工程的要求输入问题，AI系统对其进行学习研究、推理决策、生成答案，最后再通过文本框或者语音的形式把生成的答案展现给用户。


而AI Agent，也称为AI智能体或者AI智能代理，是一个具有一定程度自主性的人工系统。更具体地说，AI Agent是一个能够自动感知环境、做出决策并付诸行动的智能系统。


因此，相比于ChatGPT类型的对话方面的应用（重心在于能够回答用户所提出的问题），AI Agent系统所具备的自主性和适应性是其最大的特色。Agent能够自动通过对输入的分析感知环境、参数变量的变化，针对变化自主思考下一步的行动计划，并自行执行经过深思熟虑的思考后的行动，最终给出结果。

- ChatGPT类应用：会对话
- AI Agent：会做事

## AI Agent的架构


下图是参考资料1第二章所提出的一个AI Agent的框架图。从图中可以看到，一个典型的AI Agent包括四大元素：规划，记忆，工具，执行。


![image.png](/images/blog/非专业人士的AI课5：-1.png)


### 规划


AI Agent需要具备思考和规划的能力，而LLM所具备的推理能力很好的解决了这个问题，这也是LLM在推理方面逐渐成熟一下，AI Agent也随之爆发的原因所在。


对完整的复杂任务所进行的规划和思考，主要包含对子目标和任务的分解(Subgoal Decomposition)、连续的思考（即思维链）、自我反思和批评(Self-critics)，以及对过去行动的反思(Reflection)等。


### 记忆


AI Agent的记忆包含两个方面，短期记忆和长期记忆。


短期记忆与任务执行的上下文相关，属于提示工程的一部分，一般在AI Agent运行过程中整理在对话的上下文中传递给大模型服务器。


长期记忆，则用于对AI Agent要用的信息长时间保存并能够实现高效率的检索，最典型的就是能够支持外部知识库，把Agent运行任务需要的外部知识以向量化的方式保存在外部数据库中，并且能够支持高效的检索。


### 工具


由于大模型一旦完成预训练，其内部能力和知识边界就基本固定下来，而且难以拓展。此外作为基于文本和自然语言的处理和生成工具，大语言模型不太适合一些工作（例如复杂浮点数字的计算），因此就需要一些外部工具来扩展Agent的能力，使其能够执行这些它很难胜任的任务。


AI Agent系统可调用的外部工具，典型的包括网络搜索、日历时间、计算器、本地代码执行能力（Function Calling）等。


### 执行


AI Agent需要具备调用工具执行任务的能力，与外界互动，通过调用工具的方式来完成一个动作或者子任务。


从上图可以看到，AI Agent如何规划和决策制定过程，如何调用工具来执行行动的完整工作流程是其应用的核心所在，这部分工作逻辑就称为AI Agent的推理引擎或者认知框架。推理引擎决定了Agent如何从感知的环境中抽取信息，如何规划未来的任务，如何利用过去的经验，以及如何调用工具。


研究人员提出了多种智能Agent的推理逻辑，如CoT、ToT、LLM+P等。其中，ReAct框架脱颖而出。


## AI Agent的React框架


本质上讲，AI Agent的React框架就是一个思考-行动-观察这个完整序列所组成的循环。

- Thought：基于用户任务的总体目标、当前的状态以及可用的工具集，思考下一步的行动计划，确定下来行动方案。
- Action：基于思考的结果，决定具体要采取的行动并执行。
- Observation：收集并观察前一步的执行结果，对结果进行评估，决定下一轮次的思考方向。

![image.png](/images/blog/非专业人士的AI课5：-2.png)


以上的流程从概念上理解非常简单，但是应该如何与现实中的AI应用的具体实现来相关联呢？以下通过一个基于LangChain开发框架的示例代码进行说明。


在下面的例子中，使用LangChain框架开发一个简单的Agent。这个Agent的工作流程非常简单，大模型首先对用户输入的问题进行分析，如果需要执行浮点数加减乘除的运算时，就调用本地实现的浮点数运算的代码，然后把结果返回给大模型，由大模型来组织语言输出结果。


其实这个功能完全可以基于大模型的API来使用function calling的方式来实现。但是，通过这个例子的打印信息，可以看到大模型进行思考、决策、调用工具并返回结果的过程，其他更复杂的Agent应用实际上也是类似的工作流程和逻辑。


以下例子自测通过，使用月之暗面的Kimi作为LLM服务器，关于LLM模型的API Key设置以及通过API调用可参考[[[基于Python快速实现与Kimi的AI对话]]](https://www.pavelhan.tech/article/2025-02-27-the-communication-with-Moonshot-LLM-using-python)。


```python
import os
from typing import Any, Dict, List
from langchain.agents import AgentType, initialize_agent
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage

# 定义浮点数计算工具的实现，返回浮点数转换成字符串的结果
class FloatCalculatorTool(BaseTool):
    name:str = "float_calculator"
    description:str = "用于执行浮点数计算的工具，支持加减乘除等基本运算"

    def _run(self, expression: str) -> str:
        try:
            # 安全地执行计算，此处大模型已经把计算公式准备好了
            result = eval(expression) #直接计算即可
            if isinstance(result, (int, float)):
                # 如果结果是整数，返回整数字符串
                if isinstance(result, int) or result.is_integer():
                    return str(int(result))
                # 否则返回浮点数字符串，限制小数位数
                return f"{result:.8f}".rstrip('0').rstrip('.')
            raise ValueError("计算结果不是数字")

        except Exception as e:
            return f"计算错误: {str(e)}"

    def _arun(self, expression: str) -> str:
        # 异步实现可以直接调用同步实现
        return self._run(expression)

def get_api_key():
    api_key = os.getenv("MOONSHOT_API_KEY")
    if not api_key:
        raise ValueError("请设置 MOONSHOT_API_KEY 环境变量")
    return api_key

def main():
    try:
        # 初始化 Moonshot 模型
        llm = ChatOpenAI(
            model_name="moonshot-v1-8k",
            openai_api_key=get_api_key(),
            openai_api_base="<https://api.moonshot.cn/v1>"
        )

        # 创建工具列表
        tools = [FloatCalculatorTool()]

        # 初始化代理
        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            handle_parsing_errors=True
        )

        # 用户输入示例
        user_input = "计算3.14加上4.78，然后再除以2.5的结果"
        print(f"用户问题：{user_input}")

        # 执行代理
        result = agent.invoke(user_input)

        print(f"\\n计算结果：{result}")

    except Exception as e:
        print(f"发生错误：{str(e)}")

if __name__ == "__main__":
    main()
```


以上程序运行的结果是：


```plain text
用户问题：计算3.14加上4.78，然后再除以2.5的结果

> Entering new AgentExecutor chain...
To solve this problem, I need to perform two operations: first, add 3.14 and 4.78, and then divide the result by 2.5.

Action: float_calculator
Action Input: 3.14 + 4.78
Observation: 7.92
Thought:Now that I have the sum of 3.14 and 4.78, which is 7.92, I need
to divide this result by 2.5 to get the final answer.

Action: float_calculator
Action Input: 7.92 / 2.5
Observation: 3.168
Thought:I now know the final answer
Final Answer: 3.168

> Finished chain.

计算结果：{'input': '计算3.14加上4.78，然后再除以2.5的结果', 'output': '3.168'}
```


以上通过终端打印的信息很值得研究：

- 首先就是，在用户问题提出的连续计算的需求，被明确的分成了两步，首先计算加法，然后再计算乘法。每一步的计算逻辑都是：模型给出这一步的计算式，本地代码运行这个计算式，把结果以字符串形式返回模型，模型基于中间结果再执行下一个计算式，直到最终计算完成后输出结果。
- 大模型竟然把每一步的计算式都已经用字符串的形式整理好了，本地代码拿到这个计算式以后只需要使用eval进行计算就可以了，这确实太方便了。

## 参考资料

- 《大模型应用开发：动手做AI Agent》
