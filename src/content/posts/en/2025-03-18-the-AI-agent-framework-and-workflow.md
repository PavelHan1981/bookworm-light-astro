---
title: "AI Course for Non-Professionals 5: Analysis of AI Agent Frameworks and Workflows"
slug: "2025-03-18-the-AI-agent-framework-and-workflow"
description: "The goal of this article series is to help non-AI professionals understand the basic concepts of AI and Large Language Models (LLMs) in practical applications. By deeply understanding and clarifying these concepts, we aim to build a knowledge structure regarding the working mechanisms, workflows, and application frameworks of LLMs, enabling us to better utilize AI in our daily lives and work."
date: 2025-03-18T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["Neural Network Theory","LLM"]
draft: false
---

The goal of this article series is to help non-AI professionals understand the basic concepts of AI and Large Language Models (LLMs) in practical applications. By deeply understanding and clarifying these concepts, we aim to build a knowledge structure regarding the working mechanisms, workflows, and application frameworks of LLMs, enabling us to better utilize AI in our daily lives and work.

## What is an AI Agent?

In terms of AI applications, the most mature and widespread are still conversational applications similar to ChatGPT. The system provides a text- or voice-input interface where users enter questions according to prompt engineering requirements. The AI system then studies, reasons, makes decisions, and generates answers, which are finally presented to the user via a text box or voice.

An AI Agent, also known as an AI intelligent agent, is an artificial system with a certain degree of autonomy. More specifically, an AI Agent is an intelligent system capable of automatically perceiving its environment, making decisions, and taking actions.

Therefore, compared to conversational applications like ChatGPT (whose primary focus is answering user-submitted questions), the autonomy and adaptability of an AI Agent system are its most defining features. An Agent can automatically perceive the environment and changes in parameter variables through input analysis, independently plan its next steps based on these changes, execute deliberate actions, and ultimately deliver the results.

- ChatGPT-like applications: Can converse
- AI Agent: Can get things done

## The Architecture of an AI Agent

The diagram below illustrates the AI Agent framework proposed in Chapter 2 of Reference 1. As seen in the figure, a typical AI Agent consists of four core elements: Planning, Memory, Tools, and Execution.

![image.png](/images/blog/非专业人士的AI课5：-1.png)

### Planning

An AI Agent needs the ability to think and plan. The reasoning capabilities of LLMs solve this problem exceptionally well, which is why the explosion of AI Agents has coincided with the maturation of LLM reasoning capabilities.

Planning and reasoning for complex, complete tasks mainly include subgoal decomposition, continuous thought (i.e., Chain of Thought), self-criticism, and reflection on past actions.

### Memory

The memory of an AI Agent comprises two aspects: short-term memory and long-term memory.

Short-term memory is related to the context of task execution and is part of prompt engineering. It is typically organized and passed to the LLM server within the conversation context during the running of the AI Agent.

Long-term memory is used for the long-term preservation and high-efficiency retrieval of information required by the AI Agent. The most typical approach is supporting external knowledge bases, where external knowledge needed for the Agent's tasks is stored in vector format within an external database, enabling efficient retrieval.

### Tools

Once an LLM completes pre-training, its internal capabilities and knowledge boundaries are largely fixed and difficult to expand. Furthermore, as text- and natural-language-based processing and generation tools, LLMs are not well-suited for certain tasks (such as complex floating-point calculations). Therefore, external tools are needed to extend the Agent's capabilities, enabling it to perform tasks it would otherwise struggle with.

Typical external tools that can be invoked by an AI Agent system include web search, calendar/time, calculators, and local code execution capabilities (Function Calling).

### Execution

An AI Agent must have the ability to invoke tools to execute tasks, interact with the outside world, and complete actions or sub-tasks through tool invocation.

As shown in the figure above, the complete workflow of how an AI Agent plans, makes decisions, and invokes tools to take action is the core of its application. This logic is referred to as the Agent's reasoning engine or cognitive framework. The reasoning engine determines how the Agent extracts information from the perceived environment, plans future tasks, utilizes past experiences, and invokes tools.

Researchers have proposed various reasoning logics for intelligent agents, such as CoT, ToT, and LLM+P. Among them, the ReAct framework stands out.

## The ReAct Framework of an AI Agent

Essentially, the ReAct framework of an AI Agent is a complete sequence loop consisting of Thought, Action, and Observation.

- Thought: Based on the overall objective of the user task, the current state, and the available toolset, the Agent thinks about the next action plan and determines the course of action.
- Action: Based on the results of the thought process, it decides and executes a specific action.
- Observation: It collects and observes the execution results of the previous step, evaluates the results, and determines the direction of the next round of thinking.

![image.png](/images/blog/非专业人士的AI课5：-2.png)

While the above workflow is conceptually simple, how does it relate to the concrete implementation of real-world AI applications? The following example code, developed using the LangChain framework, illustrates this.

In the example below, a simple Agent is developed using the LangChain framework. The workflow of this Agent is straightforward: the LLM first analyzes the user's input question. If a floating-point calculation (addition, subtraction, multiplication, or division) is required, it invokes a locally implemented floating-point calculation function, returns the result to the LLM, and lets the LLM organize the language to output the final result.

In fact, this functionality could be fully implemented using function calling via the LLM's API. However, through the print logs of this example, we can observe the process of the LLM thinking, making decisions, invoking tools, and returning results. More complex Agent applications actually follow a similar workflow and logic.

The example below has been tested and verified, using Moonshot's Kimi as the LLM server. For instructions on setting up the LLM API Key and making API calls, please refer to [[[Quickly Implementing AI Dialogue with Kimi Using Python]]] (https://www.pavelhan.tech/article/2025-02-27-the-communication-with-Moonshot-LLM-using-python).

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

The output of the above program when executed is:

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

The terminal print information above is well worth studying:

- First, the continuous calculation requirement proposed in the user's question is explicitly broken down into two steps: first calculating the addition, and then calculating the division. The calculation logic for each step is: the model provides the calculation formula for that step, the local code runs this formula and returns the result to the model as a string, and the model executes the next calculation formula based on the intermediate result until the final calculation is complete and the result is output.
- The LLM actually formats the calculation formula for each step into a string. Once the local code receives this formula, it only needs to use `eval` to compute it, which is remarkably convenient.

## References

- "LLM Application Development: Hands-on AI Agents"