---
title: "以代码案例来详细介绍Function Calling"
slug: "2025-03-11-the-code-example-of-LLM-function-calling"
description: "众所周知，大语言模型本身只是一个文本生成的工具，虽然有很强的文本生成能力和逻辑推理能力，但是"
date: 2025-03-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["LLM"]
draft: false
---


## 什么是Function Calling？


众所周知，大语言模型本身只是一个文本生成的工具，虽然有很强的文本生成能力和逻辑推理能力，但是**LLM并不具备直接去执行外部功能操作的能力**。因此，如果我们要把大模型用于实际产品的应用场景之中，只能利用大模型来生成文本信息的话，那么整个系统真正能够解决问题的能力就会大打折扣。


如果能够将大语言模型所具备的自然语言处理能力，与外部工具/API调用功能相结合的话，就能够显著增强大模型在实际应用场景中解决问题的能力。大模型所具备的function calling就提供了这样一种机制，能够把大模型处理文本的能力，与本地通过function调用的能力相结合，从而为大模型的实际运用提供了极大的拓展空间。

> 大语言模型function calling的工作逻辑，就是在以大语言模型为中心的人工智能系统中，利用大语言模型所具备的推理能力，在系统的运行过程中根据大模型的响应信息，自动调用本地/外部工具或API，从而达到扩展人工智能系统能力的目的。

## Function Calling的工作流程解析


以下借助于参考资料1中的一个流程图来对大模型的function calling的执行流程进行说明。


在该流程案例中，当用户向大模型查询”北京今日气温“相关的信息时，因为涉及到对实时信息的查询，因此LLM本身是不可能直接输出正确结果的。此时就需要借助于类似function calling这样的外部工具。


在这种情况下，function calling机制要能够工作，在用户查询这个实时天气信息相关的问题时，大模型需要先知道当遇到这类问题的时候，应该调用的外部函数名称和参数列表是什么。这个信息（也就是给大模型提供的外部工具集Tools参数）与问题一起传递给大模型。


大模型对用户问题（及Tools中包含的外部函数列表中包含的外部函数描述信息）解析时，判断该问题是否需要调用Tools参数中所传递的外部函数。当判断该问题需要调用外部函数时，大模型会在返回的文本信息中包含该外部函数的调用参数列表。如下图的第二步所示。


用户应用程序收到大模型给出的答复后，在本地按照大模型返回的参数列表调用指定的外部函数，得到执行结果，并把执行结果包含在Json结构中，重新返回给大模型。如下图的第三步和第四步所示。


大模型收到外部函数的执行结果后，对其进行数据格式转换，并按照用户问题的语义信息，结合外部函数返回的执行结果信息，重新生成最终的文本答复给用户。如下图的第五步和第六步所示。


![image.png](/images/blog/以代码案例来详细介绍Function-Calling-1.png)


## Function Calling的核心工作机制总结


以上所描述的Function Calling完整流程的正常运行，依赖于外部函数能力描述、大模型语义解析以及外部函数调用流程三个方面的支持。


### 外部函数能力描述


如果需要大模型在应用中能够针对特定的问题，自动生成对外部函数的调用信息，就需要首先向大模型传递外部函数的描述信息。因此，开发者需要预先定义好可供大模型应用在执行过程中可调用的函数清单，其中包含每个函数的API描述、参数规范（类型/格式说明）和返回结构等信息。这样，在大模型遇到相关问题的时候，才能够应该调用哪个外部函数，以及调用这个外部函数应该使用的参数列表。


以下是一个外部函数的描述信息，在向大模型发出问题请求时，在上下文中同时提供给大模型。该外部函数可以用于计算两个浮点数的乘积，调用时应该以字符串的形式提供两个浮点数参数。


```json
"function": {
	"name": "get_multiply_result",
	"description": "计算两个浮点数的乘积",
	"parameters": {
		"type": "object",
		"properties": {
			"str1": {
				"type": "string",
				"description": "第一个数字字符串"
			},
			"str2": {
				"type": "string",
				"description": "第二个数字字符串"
			}
		},
		"required": ["str1", "str2"]
	}
}
```


### 大模型语义解析


在这个环节，大模型应该对用户输入的问题及其上下文中包含的外部工具函数集的信息进行解析：

- 针对该问题，是直接按照传统LLM的流程来进行处理，还是需要调用问题上下文中中包含的外部函数来辅助？
- 针对该问题，如果需要调用外部函数，对用户问题和外部函数集中的函数描述信息进行解析，找到对应于该问题的外部函数。
- 针对该问题，如果需要并且找到解决该问题的外部函数，需要进一步分析语义，并且按照该外部函数描述中的参数信息，整理出来调用该函数的参数列表。

以上信息完整获取后，大模型在其应答信息中把该信息返回给应用程序，下一步要由用户应用程序在本地来执行大模型所指定的外部函数。


### 外部函数调用流程


这部分就是大模型与本地应用程序配合，能够支持本地应用程序在收到大模型给出的答复信息后，从答复信息中得到要执行的外部函数及其参数列表信息，在本地/通过API执行这个外部功能函数，并把执行结果以及前一步骤完整过程的上下文（**再强调一下，LLM没有记忆和状态，每次访问LLM都需要把完整的过程上下文一起上传，方便LLM对该过程有清楚完整的理解**）发给大模型，由大模型生成最终的答案并返回。


## Function Calling的例子

> Talk is stupid, show me the CODE。

以下以一个Python的代码例子来对大语言模型调用function calling的功能进行说明。该例子的大致运行流程如下。即对于传统LLM可支持的问题仍然通过传统的LLM工作流程来进行处理，但是对于LLM不支持且在function call tools已声明的应用中（此处的例子为查询当日天气、计算复杂浮点数相乘）调用function call功能在本地进行处理并把结果返回大模型，最终统一由大模型来输出答案。

- 蓝色部分模块由应用程序执行，红色部分模块由大模型执行。LLM-function-call-workflow.png

```python
import os
import json
import time
from openai import OpenAI

def get_api_key():
    api_key = os.getenv("MOONSHOT_API_KEY")
    if not api_key:
        raise ValueError("请设置 MOONSHOT_API_KEY 环境变量")
    return api_key

#定义乘法函数：将两个字符串转换为浮点数相乘，并返回结果字符串
def get_multiply_result(str1: str, str2: str) -> str:
    try:
        # 将字符串转换为浮点数
        num1 = float(str1)
        num2 = float(str2)

        # 计算乘积
        result = num1 * num2

        # 将结果转换回字符串
        # 使用字符串格式化去除不必要的小数位
        if result.is_integer():
            return str(int(result))
        return str(result)

    except ValueError as e:
        raise ValueError("输入的字符串无法转换为数字") from e

# 定义天气查询函数
def get_weather(location: str, unit: str = "celsius"):
    """模拟获取指定城市的天气信息"""

    # 这里使用模拟数据，实际应用中应该调用真实的天气API
    weather_data = {
        "北京": {"temperature": 20, "condition": "晴朗"},
        "上海": {"temperature": 25, "condition": "多云"},
        "广州": {"temperature": 30, "condition": "雨"},
    }

    if location not in weather_data:
        return f"抱歉，没有找到{location}的天气信息"

    temp = weather_data[location]["temperature"]
    if unit == "fahrenheit":
        temp = (temp * 9/5) + 32

    return f"{location}的天气{weather_data[location]['condition']}，温度{temp}{'°C' if unit == 'celsius' else '°F'}"

# 定义函数调用的参数模式
weather_function = {
    "name": "get_weather",
    "description": "获取指定城市的天气信息",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "城市名称，例如：北京、上海、广州"
            },
            "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "温度单位，可选摄氏度(celsius)或华氏度(fahrenheit)"
            }
        },
        "required": ["location"]
    }
}

def main(user_input):
    try:
        client = OpenAI(
            api_key=get_api_key(),
            base_url="https://api.moonshot.cn/v1"
        )

        # 用户输入
        #user_input = "3.567乘以25.345等于多少"
        print(f"用户问题：{user_input}")

        # 创建聊天完成请求
        response = client.chat.completions.create(
            model="moonshot-v1-8k",
            messages=[{
                "role": "user",
                "content": user_input
            }],

            tools = [{
                "type": "function",
                "function": {
                    "name": "get_multiply_result",
                    "description": "计算两个浮点数的乘积",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "str1": {
                                "type": "string",
                                "description": "第一个数字字符串"
                            },
                            "str2": {
                                "type": "string",
                                "description": "第二个数字字符串"
                            }
                        },
                        "required": ["str1", "str2"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "获取指定城市的天气信息",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "城市名称，例如：北京、上海、广州"
                            },
                            "unit": {
                                "type": "string",
                                "enum": ["celsius", "fahrenheit"],
                                "description": "温度单位，可选摄氏度(celsius)或华氏度(fahrenheit)"
                            }
                        },
                        "required": ["location"]
                    }
                }
            }],
            temperature = 0.3,
        )

        time.sleep(3) ## 避免访问LLM过于频繁报错

        print(response.choices[0].message.content)
        # 获取工具调用信息
        if response.choices[0].message.tool_calls:
            tool_call = response.choices[0].message.tool_calls[0]

            if tool_call.type == "function":
                # 解析函数参数
                args = json.loads(tool_call.function.arguments)

                if tool_call.function.name == 'get_weather':
                    # 调用函数并获取结果
                    result = get_weather(**args)
                elif tool_call.function.name == 'get_multiply_result':
                    # 调用函数并获取结果
                    result = get_multiply_result(**args)

				print(f"\n函数调用结果：{result}")

                # 将函数调用结果发送回AI继续对话
                final_response = client.chat.completions.create(
                    model="moonshot-v1-8k",
                    messages=[
                        {"role": "user", "content": user_input},
                        {"role": "assistant", "content": None, "tool_calls": [tool_call]},
                        {"role": "tool", "tool_call_id": tool_call.id, "name": "get_weather", "content": result}
                    ]
                )

                print(f"\nAI回复;{final_response.choices[0].message.content}")

    except Exception as e:
        print(f"发生错误：{str(e)}")

if __name__ == "__main__":
    main("陕西省的省会是哪个城市？")
    time.sleep(3)
    main("北京今天天气怎么样？")
    time.sleep(3)
    main("3.567乘以25.345等于多少")
```


以上代码执行的打印信息为：


```plain text
用户问题：陕西省的省会是哪个城市？
陕西省的省会是西安市。
用户问题：北京今天天气怎么样？

get_weather:{
    "location": "北京",
    "unit": "celsius"
}

函数调用结果：北京的天气晴朗，温度20°C

AI回复：北京今天的天气晴朗，温度为20°C。
用户问题：3.567乘以25.345等于多少

get_multiply_result:{
  "str1": "3.567",
  "str2": "25.345"
}

函数调用结果：90.405615

AI回复：3.567乘以25.345等于90.405615
```


可以看到，从该程序的运行流程来看完全符合设计预期：

- 当用户输入的问题是“陕西省的省会是哪个城市？”，这个问题是在大语言模型的知识范围和能力之内，因此大语言模型直接给出答案，不需要调用function calling功能。
- 当用户输入的问题是“北京今天天气怎么样？”，这个对于实时问题的查询明显超出了大模型的能力范围，再加上我们在大模型调用时提供了get_weather接口的描述信息，要求大模型在查询天气时，在响应的文本消息中返回调用该函数的参数列表。应用程序收到以后，自动调用get_weather函数并传递该参数列表，得到当前的天气状态，并提供给大语言模型生成最终的答案。
- 同样的道理，当当用户输入的问题是“3.567乘以25.345等于多少“这样的复杂浮点数乘法的计算，这也是明显超出大模型能力的应用，此时按照相同的逻辑，由大模型返回要调用的本次函数名称get_multiply_result和计算参数列表，自动调用本地的get_multiply_result函数得到计算结果以后，再返回给大语言模型生成最终的答案。

## 参考资料

- [不再混淆了！一文揭秘MCP Server、Function Call与Agent的核心区别](https://mp.weixin.qq.com/s/GhxTft6ccDLpqhJb0sKrzw)
