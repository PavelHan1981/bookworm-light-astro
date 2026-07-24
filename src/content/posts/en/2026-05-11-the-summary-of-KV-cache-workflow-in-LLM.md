---
title: "Summary of KV Cache Workflow in Large Language Model Interactions"
slug: "2026-05-11-the-summary-of-KV-cache-workflow-in-LLM"
description: "By describing the interaction process between agents and large language models (LLMs), this article explains in detail the difference between Input Tokens and Cached Tokens. Understanding this distinction makes it easy to grasp the differences in computing power requirements and pricing between these two types of tokens. When purchasing token quotas from various LLM vendors, we often see three different prices: input price (cache hit), input price (cache miss), and output price. While the concepts of input and output tokens are straightforward, what is the difference between cache hit and cache miss here? Similarly, when using various agents such as Claude Code or Gemini CLI, upon exiting a session, the agent outputs usage statistics for input tokens, cached tokens, and output tokens. What exactly is the difference between Input Tokens and Cache Reads here?"
date: 2026-05-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["LLM","Neural Network Theory"]
draft: false
---

By describing the interaction process between agents and large language models (LLMs), this article explains in detail the difference between Input Tokens and Cached Tokens. Understanding this distinction makes it easy to grasp the differences in computing power requirements and pricing between these two types of tokens.

## The Difference Between Input Tokens and Cached Tokens

When purchasing token quotas from various LLM vendors, we often see three different prices: input price (cache hit), input price (cache miss), and output price. While the concepts of input and output tokens are straightforward, what is the difference between cache hit and cache miss here?

![b8e61c06-b89d-4e35-ae1a-41f50eca9547.png](/images/blog/大模型交互中KV-Cache的工作原理总结-1.png)

Similarly, when using various agents such as Claude Code or Gemini CLI, upon exiting a session, the agent outputs usage statistics for input tokens, cached tokens, and output tokens. What exactly is the difference between Input Tokens and Cache Reads here?

![28145375-6db3-447c-a161-6ec65851c5d6.png](/images/blog/大模型交互中KV-Cache的工作原理总结-2.png)

## What If There Were No Cached Tokens?

To simplify the problem first: without considering any caching mechanisms, communication between an agent and a large language model is always an absolute stateless functional interaction. **The LLM has no memory whatsoever**, and every interaction and call is a completely brand-new process to it.

During a conversational interaction between an agent (or a web page chatting with an LLM) and the LLM, their respective roles and divisions of labor are as follows:

- **Agent (Intelligent Agent):** A piece of code running on a local machine or a cloud server, serving as the business control center for the entire application session. It is responsible for maintaining the dialogue history between both parties, managing tools (API interfaces), and controlling the execution flow.
- **LLM (Large Language Model):** The logical reasoning engine in the cloud. It is responsible for only one thing: receiving a piece of pure text input from the agent via the HTTP protocol, and **predicting and outputting the next block of text based on probabilities**.

Precisely because the LLM lacks any memory throughout the interaction process, no matter how many turns the conversation lasts, the agent must accumulate and send all historical records (both the agent's questions and the LLM's responses) to the LLM at the start of every new conversation turn. Only then can the LLM understand the historical dialogue from the beginning and return a corresponding response to the new question. Consequently, **as the number of conversation turns increases, the historical session records sent by the agent to the LLM naturally snowball and grow larger and larger:**

![%E5%AE%8C%E7%BE%8E%E5%AF%B9%E9%BD%90%E7%89%88_%E4%B8%8A%E4%B8%8B%E6%96%87%E6%BB%9A%E9%9B%AA%E7%90%83%E6%95%88%E5%BA%94.png](/images/blog/大模型交互中KV-Cache的工作原理总结-3.png)

This introduces two major problems:

**Problem 1: Bandwidth and Payload Size Explosion:** In every interaction, the agent must resend tens of kilobytes or even megabytes of historical conversation records over HTTP. If the session records contain a codebase or PDF files, the required code and memory space after many rounds of accumulation becomes catastrophic.

**Problem 2: Extreme Waste of Computing Power (The Snowball Effect Causing Input Tokens to Skyrocket):** The LLM itself is stateless. By the $N$-th turn of the dialogue, the LLM has already computed the text of the first $N-1$ turns $N-1$ times. However, without a cache, it must mechanically recalculate the matrix multiplication for all this text all over again, wasting computational resources in vain.

To address these two issues, it is essential to cache the KV Cache on the LLM server side.

## How Does KV Cache Solve the Problem?

Currently, mainstream large language models adopt the Transformer architecture. For details on the internal calculation process within the Transformer architecture, refer to the two articles: [Comprehensive Guide to the Encoder Structure and Calculation Process of the Transformer Model](https://www.notion.so/30ca5f648c7f80deb2f0d1a878be468e) and [Comprehensive Guide to the Decoder Structure and Calculation Process of the Transformer Model](https://www.notion.so/31ea5f648c7f80b29189cad13bc6078b).

To summarize simply: when the vector token corresponding to each word enters the Transformer architecture for attention calculation, its word vector $X$ is multiplied by three different weight matrices $W_Q, W_K, W_V$ respectively, yielding the precise semantic $Q, K, V$ vectors of the word in the current context.

**When the model generates the next word during its operation, it generates the current** $Q$**, and uses this current** $Q$ **vector to perform dot-product calculations (calculating correlation scores) against the** $K$ **vectors of all preceding historical tokens.** After calculating the correlation scores, it computes a weighted sum of the $V$ vectors of all historical tokens based on these scores.

In the attention calculation process described above, the $Q$ of historical tokens is not used, but their $K$ and $V$ vectors will be reused repeatedly in the generation of subsequent tokens. What the KV Cache stores is: <u>_all_</u> $K$ <u>_and_</u> $V$ <u>_vectors calculated via matrix multiplication when the input text passes through each layer of attention computation._</u>

Thus, when the next new conversation turn arrives, the KV values for all tokens in the historical conversation do not need to be recalculated; they can be read directly from memory. We only need to compute the KV values for the new conversation content, and then merge/concatenate them with the historical KV cache. This eliminates the step of recalculating all tokens of the historical conversation text during LLM processing.

The following flowchart explains the workflow of the KV Cache caching mechanism:

- **Phase 1** performs a full-scale attention calculation (totaling 1,000 tokens) on the entire session context, and saves the resulting KV Cache upon completion.
- **Phase 2** no longer requires full-scale attention calculation on the contextual text content when generating each word. Instead, it uses the new $Q$ vector to compute with the cached contents of the KV Cache to obtain the output, and then appends the $K$ and $V$ vectors corresponding to the newly generated word to the KV Cache for use in subsequent steps.

![LLM%E5%8F%8C%E9%98%B6%E6%AE%B5%E6%8E%A8%E7%90%86_Prefill%E4%B8%8EDecode.png](/images/blog/大模型交互中KV-Cache的工作原理总结-4.png)

This is how caching the KV Cache on the LLM server side can drastically reduce the demand for and waste of GPU computing power.

## Implicit Caching and Explicit Caching Issues

As mentioned above, caching the KV Cache on the server side can effectively solve the problem of wasted computing power (i.e., Problem 2 above). However, one important point to note is that server memory is a limited and extremely expensive resource. Massive requests from massive users require maintaining a large amount of cache on the server side, which means these caches cannot be retained indefinitely and must have a time-to-live (TTL) expiration policy.

If the storage duration of the server-side KV Cache exceeds its time limit (for example, if the agent or user has no new requests in the current session for over an hour), the KV Cache will be deleted. Under such circumstances (**when the KV Cache is deleted due to expiration**), if the user sends a new request to the LLM server, how will the LLM handle it?

Mainstream large language models currently have two solutions to this problem: implicit caching and explicit caching.

### 1. Implicit Caching

In this architecture, during every round of interaction between the agent and the LLM, the agent dutifully packages all historical dialogue records, the system prompt, and the latest dialogue request into a giant JSON object, sending it to the LLM via HTTP.

Once this giant JSON arrives at the cloud LLM server, its API gateway quickly calculates the prefix hash value of this text.

- If it discovers via this prefix that its memory already contains the KV Cache of the historical session (i.e., a cache hit), the LLM will directly skip the Transformer matrix operations for this portion of the text in subsequent calculations, computing only the newly added request content at the tail. In this scenario, only the newly added request portion is counted toward Input Tokens.
- If it fails to find the KV Cache for this historical session record in memory via the prefix (i.e., a cache miss), the LLM is forced to perform a full Transformer calculation on the complete historical dialogue records, system prompt, and latest dialogue request contained in the JSON.

Therefore, under this mode with a cache hit, the cost of network I/O remains very high (because the complete session history still needs to be sent over every time), but the computing power (GPU calculation time) is saved. Consequently, LLM vendors offer discounted pricing for cache tokens, and the response speed of LLM computations becomes faster.

- **This mode solves Problem 2 above (the problem of wasted computing power) but fails to solve Problem 1 above (the network bandwidth I/O issue).**

### 2. Explicit Caching

The other mode is explicit caching. In this mode, for heavy **static context** that does not change frequently (such as the software and hardware architecture documentation of an entire project, long API specification documents, technical manuals, or complex system prompts), the agent only needs to upload it once at the very beginning. Once the server receives and finishes computing the KV Cache, it returns a resource identifier (Cache ID).

During subsequent recurring dialogues between the agent and the LLM, the agent's JSON payload no longer needs to contain that heavy static context. Instead, it only needs to include a short string: `"cached_content": "caches/12345-abcde"`, along with the session records between both parties.

After receiving the request sent by the agent, the LLM server first checks whether the KV Cache corresponding to the Cache ID in the request packet still exists in memory. If there is a cache hit, the KV Cache can be used directly, performing Transformer calculations solely on the session records uploaded by the agent, and then concatenating the KV values to generate the new context.

However, if the KV Cache corresponding to the Cache ID has expired and been deleted, the LLM server will immediately return a 404 error, with an attached message stating `Cached content not found`. At this point, the agent must resend all locally cached static context materials to the LLM, execute a dense Transformer computation across all contexts, and return a new Cache ID to the agent.

Therefore, this explicit caching workflow can solve both Problem 1 and Problem 2 simultaneously. Only when the cache expires and misses is it necessary to send the bulky static context to the LLM to execute a full Transformer computation.

![%E9%9A%90%E5%BC%8F%E7%BC%93%E5%AD%98vs%E6%98%BE%E5%BC%8F%E7%BC%93%E5%AD%98%E5%AF%B9%E6%AF%94.png](/images/blog/大模型交互中KV-Cache的工作原理总结-5.png)