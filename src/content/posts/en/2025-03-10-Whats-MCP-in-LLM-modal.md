---
title: "What is MCP in Large Language Models?"
slug: "2025-03-10-What’s-MCP-in-LLM-modal"
description: "MCP: Model Context Protocol, an open-source standard communication protocol released by Anthropic (the developer of Claude) in November 2024."
date: 2025-03-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["MCP","LLM"]
draft: false
---


## Introduction to MCP and Its Core Functions


MCP (Model Context Protocol) is a **standard communication protocol** open-sourced by Anthropic (the developer of the Claude large language model) in November 2024. Its purpose is to provide a standardized interface protocol for communication between Large Language Models (LLMs) and external services, achieving seamless connections with external data sources and tools to expand the capabilities of large models.


**In essence, MCP is a technical specification and protocol mutually agreed upon during the development of AI Agents and LLM-based applications. The major pain point it resolves is the excessively high technical threshold and severe fragmentation involved in invoking external tools during AI Agent and application development.**


![image.png](/images/blog/大模型的MCP到底是什么-1.png)


The core functions of the MCP communication protocol can be summarized as follows:

- It standardizes the communication interfaces and interaction standards between large models and external services. Through this universal socket-like protocol design pattern, it solves the problem of inconsistent data formats and interaction rules when large models communicate with different external services (such as GitHub, Slack, local databases, etc.).
- It effectively improves development efficiency. For developers of external services, they only need to develop an MCP Server once according to the MCP specification, and all MCP-compatible models or other types of clients can directly invoke it without repeated adaptation.
- It optimizes the working performance of large models. By dynamically loading context data during the interaction process, it can provide models with more precise context inputs, thereby enhancing the accuracy and utility of responses.

## MCP Client-Server Architecture


**The implementation of the MCP protocol is based on a client-server architecture.**


### MCP Client


The MCP Client is generally integrated into user-facing interactive programs (such as LLM-based applications, AI Agents, Chatboxes, etc.). It is responsible for communicating with the MCP Server to integrate the capabilities and services provided by the Server, driving the execution of application tasks.


The core functions included in the MCP Client are as follows:

- During initialization, the Client sends capability query requests to all configured MCP-Servers, collecting available tool list information (including tool names, descriptions, parameters, etc.) through their response messages.
- Based on the requirements of the task to be executed, the Client dynamically invokes appropriate tools and coordinates collaboration among multiple tools (for example, invoking a weather query service API and combining its results to generate a response).
- The Client can support connecting to various local and remote Server types through the MCP communication protocol, expanding capabilities without modifying code.

In summary, the MCP Client is the active consumer of MCP services. Based on the overall application design requirements and user-input data, it effectively invokes its registered combination of MCP services to achieve the application's design goals.


### MCP Server


The MCP Server is the callee, responsible for providing specific capability services or data interfaces to the outside world. Typical MCP services can include large model services (such as text and image generation), tools (local files, data reading, crawlers, database queries), and third-party API access (such as weather queries).


The core functions included in the MCP Server are:

- The MCP Server should be implemented according to the standardized interfaces defined by the MCP protocol and register its own capabilities with the Client (such as `tool_name`, `description`, parameter specifications). Based on this standard information, the MCP Client can understand what services the MCP Server can provide and how these services should be invoked.
- During runtime, the MCP Server provides external services, processing requests from the Client and returning results (such as executing Linux commands, querying databases, invoking large models to generate content, etc.).
- In addition, as a service provider, the MCP Server also needs to support resource control (such as restricting sensitive data access) and security management (such as identity authentication).

In summary, the MCP Server is the passive provider of MCP services, exposing other services according to the requirements of the MCP protocol standard. Clients can query the services provided by the MCP Server through standard interfaces and invoke those services through standard interfaces as well.


## MCP Communication Mechanisms


To accommodate both local and remote MCP Server invocation methods, the MCP protocol defines two communication mechanisms: `stdio` for local usage and HTTP/SSE communication for remote access, as shown in the figure below:


![image.png](/images/blog/大模型的MCP到底是什么-2.png)


### HTTP/SSE Method for Remote Access


SSE (Server-Sent Events) is itself an extension protocol of the HTTP protocol that supports long-connection communication. When SSE is enabled, the HTTP client sends a special HTTP GET request to the server, including the `Accept: text/event-stream` header in the request, indicating that the client expects to receive an SSE data stream. After responding, the server keeps the connection open and can continuously push data to the client. **Note that under an SSE connection, data can only be pushed unidirectionally from the server to the client; the client cannot use this connection to send data to the server.**


Once the client establishes a persistent connection via HTTP SSE, the server can continuously push data streams to the client through this connection whenever new data is available, achieving real-time unidirectional communication from the server to the client. When the client has a new request, it still needs to send requests to the server via independent HTTP POST messages, and the server continuously returns streaming responses to the client through the previously established HTTP SSE long connection.


All request and response data between the client and server adopt the JSON-RPC 2.0 specification to ensure structured data transmission.


### stdio Method for Local Access


For local access requirements between the MCP Server and Client, MCP defines a local inter-process communication transmission method called `stdio` (standard input/output).


In this mode, the MCP client directly starts the MCP server application as its child process locally during startup. Afterward, the two communicate using the operating system's standard input (`stdin`) and output (`stdout`) pipes. The communication process adopts a synchronous request-response interaction mechanism, where each request must wait for its corresponding response before returning. The client sends requests in JSON-RPC 2.0 format via `stdin`, and the server returns responses in JSON-RPC 2.0 format via `stdout`.


## Explanation of Typical MCP Workflows


The interaction process between a standard MCP Client and Server generally includes two phases: Initialization & Server Capability Negotiation, and Service Request & Response.


![image.png](/images/blog/大模型的MCP到底是什么-3.png)


### Initialization and Server Capability Negotiation


When the MCP Client application starts up, it first needs to send a `discover` request to all configured MCP Servers to obtain their list of available capability services, description information, call parameter details, etc.


Upon receiving the discovery request from the Client, the MCP Server returns structured tool description information. For example, the description of a weather query service might look like this: `{tool_name: "weather_query", description: "Query real-time weather", parameters: {city: str}}`.


After receiving this information, the MCP Client can invoke the service provided by this MCP Server according to the required parameter format whenever a weather query is needed during the subsequent execution of the application.


### MCP Service Request and Response


During the execution of the application, the MCP Client selects an appropriate tool based on the task execution requirements (the selectable tool list has already been queried during the previous initialization phase), and then sends a JSON-RPC request containing the access parameters to the MCP Server. For example: `{"method": "weather_query", "params": {"city": "Beijing"}}`.


Upon receiving the Client's request, the MCP Server performs operations corresponding to the invocation parameters (such as calling the OpenWeather API) and returns the results to the Client (such as temperature and humidity data).


After receiving the response from the Server, the MCP Client aggregates the returned results from multiple servers and finally passes them to the large model to generate the final response text message (such as generating a natural language reply containing weather suggestions).


## Differences Between MCP and Function Calling


First, let's clarify one point: **MCP is merely a framework for communication protocols and workflows; an AI large model is not strictly required in an MCP application.** Users can completely develop an independent MCP client and MCP server, and then communicate and interact between them based on the MCP protocol to achieve specific functions. However, when the AI large model supports the MCP protocol, introducing the participation of a large model into the MCP application can significantly enhance the application's intelligence level and user experience.


Secondly, **in MCP applications, large models typically play the role of the MCP Client.** Specifically:

- **MCP Client**: As the client, the large model can directly initiate requests to pre-defined MCP Servers via the MCP protocol, invoking external tools or data sources. In this process, the large model is responsible for parsing user needs, determining which tools need to be called, and interacting with the server providing the MCP service via the MCP protocol.
- **MCP Server**: A server application that provides external tool and data source access based on the MCP protocol. It encapsulates various resources and services into standardized interfaces for invocation by the large model (MCP Client).

From the perspective of the functions implemented by MCP, it is very similar to function calling, but there are fundamental differences between the two:

- **Execution subject of external tasks**: For MCP applications, the execution of external tasks is handled by the large model server itself by accessing the corresponding MCP Server based on the MCP protocol, and after obtaining the answer, returning it to the user in natural language. In contrast, with function calling, the user proposes a question in natural language, which the large model parses and returns to the user's application in the form of structured data; the user's application then locally executes the function, meaning the user application must handle the execution of external functions and the return of results itself.
- **Standardization of protocols and interactions**: MCP defines a standardized communication protocol and workflow, regularizing the interaction logic between the MCP Client (large model) and MCP Server (external tools and services), which makes interactions between different models and tools more uniform and efficient. On the other hand, the specific implementation of function calling usually relies on the user application's own definitions, and different applications may have different invocation methods and interface designs, making it difficult to reuse them across different applications.

## References

- [Practical Hands-On! Complete MCP Breakdown: Step-by-Step Guide to Developing Agents with Third-Party MCP Servers](https://mp.weixin.qq.com/s/QDmbNoixP4awOeZMAvxrlA)
- [Building an MCP Client and Server from Scratch! Detailed Guide to DeepSeek, Ollama, and vLLM MCP Integration Practice!](https://deepseek.csdn.net/67e28cf28393e26e265938ce.html)