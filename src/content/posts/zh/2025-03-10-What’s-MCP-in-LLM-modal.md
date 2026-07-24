---
title: "大模型的MCP到底是什么"
slug: "2025-03-10-What’s-MCP-in-LLM-modal"
description: "MCP：Model Context Protocol，即模型上下文协议，是由Anthropic公司（也就是Claude大模型的开发商）在2024年11月份所开源的"
date: 2025-03-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["MCP","LLM"]
draft: false
---


## MCP简介及其核心作用


MCP：Model Context Protocol，即模型上下文协议，是由Anthropic公司（也就是Claude大模型的开发商）在2024年11月份所开源的**标准通信协议**，其目的是为大语言模型（LLM）与外部服务之间的通信提供一个标准化的接口协议，实现与外部数据源、工具等的无缝连接，从而扩展大模型的能力。


**从本质上讲，MCP是一种在智能体Agent和大模型应用程序开发过程中大家共同约定的一种技术规范和协议。它所解决的最大痛点问题，就是AI Agent及其应用开发中调用外部工具的技术门槛过高、碎片化严重的问题。**


![image.png](/images/blog/大模型的MCP到底是什么-1.png)


MCP通信协议的核心作用可以概括为：

- 统一大模型与外部服务之间的通信接口和交互标准。通过这种类似于通用插座的协议设计模式，解决了大模型与不同外部服务（如 GitHub、Slack、本地数据库等）通信数据格式和交互规则不统一的问题。
- 有效的提升了开发效率。对于外部服务的开发者而言，只需要按照MCP规范开发一次MCP Server，所有兼容 MCP 的模型或者其他类型的客户端均可直接调用，无需重复适配。
- 可以优化大模型的工作性能。通过在交互流程中动态加载上下文数据，可以为模型提供更精准的上下文信息输入，从而提升回答的准确性和实用性。

## MCP的客户端-服务器架构


**MCP协议的实现是基于客户端-服务器架构的**。


### MCP Client


MCP Client一般集成在用户交互英语程序（如基于大模型的应用程序、AI Agent、Chatbox等）之中，负责与MCP Server通信来整合Server所提供的能力和服务，驱动整个应用程序任务的执行。


MCP Client所包含的核心功能如下：

- Client在初始化时，要向所有配置的MCP-Server发送能力查询请求，通过其响应消息收集可用的工具列表信息（包括工具名称、描述、参数等）。
- Client根据要执行的任务需求，动态调用合适的工具，并协调多工具之间的协作（例如调用天气查询服务API后结合其结果生成回复）。
- Client可以通过MCP通信协议支持对接本地以及远程的多种Server类型，无需修改代码即可扩展能力。

总之，MCP Client是MCP服务的主动消费方，根据整体应用程序的设计需求以及用户输入的数据信息，有效的对其注册的MCP服务组合进行调用，达成应用的设计目标。


### MCP Server


MCP Server则是被调用方，负责向外提供具体的能力服务或者数据接口。典型的MCP服务可以包括大模型服务（例如文本、图像生成等）、工具（本地文件、数据读取、爬虫、数据库查询）以及第三方的API（例如天气查询）访问。


MCP Server所包含的核心功能包括：

- MCP Server应按照MCP协议所定义的标准化接口来实现，并向Client注册自身所具备的能力（如tool_name、description、参数规范）。MCP Client根据这些标准信息可以了解到MCP Server所能提供的服务，以及应该如何调用这个服务。
- 在运行过程中，MCP Server对外提供服务，处理来自Client的请求并返回结果（如执行Linux命令、查询数据库、调用大模型生成内容等）。
- 此外，作为服务的提供方而言，MCP Server还需要支持资源控制（如限制敏感数据访问）和安全性管理（如身份验证）。

总之，MCP Server是MCP服务的被动提供方，按照MCP协议标准的要求对外其他服务，Client既可以通过标准接口查询MCP Server所提供的服务，也同样可以通过标准接口来调用这些服务。


## MCP的通信机制


为适应本地调用和远程调用MCP Server两者方式，MCP协议定义了两种通信机制：针对本地的stdio以及针对远程访问的HTTP/SSE通信。如下图所示：


![image.png](/images/blog/大模型的MCP到底是什么-2.png)


### 针对远程访问的HTTP/SSE方式


SSE（Server Send Events）本身是针对HTTP协议支持长连接通信的一种扩展协议。使能SSE的情况下，HTTP客户端通过发送一个特殊的HTTP GET请求到服务器，请求中包含Accept: text/event-stream头，表明客户端期望接收SSE数据流。服务器响应后会保持连接打开，并可以持续向客户端推送数据。**需要注意，SSE连接的情况下，只能由服务器向客户端单向推送数据，客户端不能使用这个链接向服务器发送数据。**


当客户端通过HTTP SSE建立持久连接后，服务器就可在有新的数据的情况下，通过该连接向客户端持续推送数据流，实现从服务器到客户端的实时单向通信。而当客户端有新的请求时，仍然需要通过独立的HTTP Post消息向服务器发出请求，服务器则通过之前建立的HTTP SSE长连接向客户端持续返回流式响应。


客户端和服务器之间的所有请求和响应数据均采用JSON-RPC 2.0规范，以确保结构化数据传输。


### 针对本地访问的stdio方式


针对MCP Sever和Client之间的本地访问需求，MCP则定义了一种stdio（标准输入输出）的本地进程间通信的传输方式。


在这种模式下，MCP客户端在启动的过程中，直接在本地启动MCP服务器应用程序作为其子进程，此后两者之间使用操作系统的标准输入（stdin）和输出（stdout）管道来进行通信。通信流程采用同步交互的请求-响应机制，每条请求需等待对应响应后才返回，客户端通过stdin发送JSON-RPC 2.0格式请求，服务器端则通过stdout返回JSON-RPC 2.0格式的响应。


## MCP的典型工作流程解释


对于标准的MCP Client和Server之间的交互流程而言，一般包含两个阶段：初始化及Server能力协商，服务请求与响应。


![image.png](/images/blog/大模型的MCP到底是什么-3.png)


### 初始化与Server能力协商


在MCP Client应用程序启动时，需要首先向其配置的所有MCP Server发送discover请求，获取其所具备的能力服务列表、描述信息、调用参数详情等。


MCP Server在收到Client的discovery请求后，返回结构化的工具描述信息，例如以下是一个天气查询服务的描述信息：{tool_name: "weather_query", description: "查询实时天气", parameters: {city: str}}。


MCP Client在收到以上信息以后，就能够在后续应用程序的运行过程中需要进行天气查询的时候，按照参数格式的要求调用这个MCP Server所提供的服务。


### MCP服务请求与响应


MCP Client在应用程序的执行过程中，根据任务的执行需求来选择合适的工具（可选择的工具列表已经在前面的初始化阶段查询到），然后向MCP Server发送包含访问参数的JSON-RPC请求。例如{"method": "weather_query", "params": {"city": "Beijing"}}。


MCP Server收到Client的请求后，执行与调用参数对应的操作（例如调用OpenWeather API）并向Client返回结果（如温度、湿度数据）。


MCP Client收到Server的响应以后，将多个Server的返回结果整合，最后再传递给大模型以生成最终的响应文本消息（如生成包含天气建议的自然语言回复）。


## MCP与function calling的区别


首先明确一点，**MCP只是一个通信协议和流程的框架，在MCP应用中并不一定必须要存在AI大模型**，用户完全可以开发一个独立的MCP客户端和MCP服务器端，然后在客户端和服务器端基于MCP协议进行通信交互，实现特定的功能。只不过，在AI大模型能够支持MCP协议的情况下，在MCP应用中引入大模型的参与，可以显著提升应用的智能化水平和用户体验。


其次，**在MCP应用中，大模型通常扮演MCP Client的角色**。具体来说：

- **MCP Client**：大模型作为客户端，可直接通过MCP协议向预先定义MCP Server发起请求，调用外部工具或数据源。这个过程中，大模型负责解析用户的需求，决定需要调用哪些工具，并通过MCP协议与提供MCP服务的服务器进行交互。
- **MCP Server**：基于MCP协议对外提供外部工具和数据源访问的服务器应用，它将各种资源和服务封装成标准化的接口，供大模型（MCP Client）调用。

从MCP实现的功能上讲，它与function calling非常类似，但是两者有着本质上的区别：

- **外部任务的执行主体不同**：对于MCP应用而言，外部任务的执行由大模型服务器自行基于MCP协议访问对应的MCP Server，得到答案以后以自然语言返回给用户，而function calling是用户以自然语言提出的问题，大模型解析以后结构化数据的形式返回给用户的应用程序，由用户应用程序在本地执行function功能，因此用户应用程序需要自己处理外部函数的执行和结果的返回。
- **协议和交互的规范性**：MCP定义了一个标准化的通信协议和工作流程，规范了MCP Client（大模型）和MCP Server（外部工具和服务）之间的交互逻辑，这使得不同模型和工具之间的交互更加统一和高效；而function calling的具体实现通常依赖于用户应用程序的自行定义，不同的应用程序可能会有不同的调用方式和接口设计，很难在不同的应用之间复用。

## 参考资料

- [实操干货！MCP全解析，一步步教你借助第三方MCP Server开发Agent](https://mp.weixin.qq.com/s/QDmbNoixP4awOeZMAvxrlA)
- [从0手撕代码搭建MCP Client与Server！详解DeepSeek、ollama、vLLM接入MCP实战！_java_赋范大模型技术社区-DeepSeek技术社区](https://deepseek.csdn.net/67e28cf28393e26e265938ce.html)
