---
title: "Stripe在线支付功能的工作流程和安全机制解析"
slug: "2026-05-23-the-workflow-and-security-solution-of-stripe"
description: "在 Web 世界，在线上支付流程中处理用户的信用卡号就是极高风险的操作。对于要在自己的应用程序中实现海外业务场景的全栈开发者而言，要处理跨国信用卡网络通信、3D Secure 动态认证以及严苛的 PCI-DSS 安全合规审查等。针对这个问题， Stripe 应运而生，其伟大之处在于，它通过极致优雅的 RESTful API 和基于 Webhook 的异步事件驱动模型，将极其混乱的现实资金流转，封装成了高度可预测的、开发者友好的接口。在这种情况下，开发者自己的服务器就可以"
date: 2026-05-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["云平台"]
tags: ["全栈开发","Android"]
draft: false
---


在 Web 世界，在线上支付流程中处理用户的信用卡号就是极高风险的操作。对于要在自己的应用程序中实现海外业务场景的全栈开发者而言，要处理跨国信用卡网络通信、3D Secure 动态认证以及严苛的 PCI-DSS 安全合规审查等。针对这个问题， Stripe 应运而生，其伟大之处在于，它通过极致优雅的 RESTful API 和基于 Webhook 的异步事件驱动模型，将极其混乱的现实资金流转，封装成了高度可预测的、开发者友好的接口。在这种情况下，开发者自己的服务器就可以永远不需要触碰、传递或保存用户的真实信用卡号（明文），只需要向 Stripe 发送指令，Stripe 处理完后返回一个 Token 告知支付业务指令的执行结果，极大的简化了这个支付业务的复杂程度。


## Stripe在线支付业务的执行流程解释


下图通过在一个Android APP上利用Stripe完成在线支付的流程图来解释Stripe在线支付的完整流程。整个支付流程可以分为四个阶段：

- 阶段1：建立支付会话
    - 首先是在Android APP上，由用户点击支付购买商品/服务的按钮启动整个支付流程，此时APP首先向开发者自己的后台Spring Boot服务器发起一个支付购买的请求。
    - 后台服务器收到请求后，在自己的数据库PostgreSQL上创建一个新的购买订单，因为此时支付还尚未启动，所以这个订单的状态是Pending。
    - 然后后台服务器向Stripe Cloud发起请求，创建一个支付会话请求。
    - Stripe服务器收到以后，会给后台服务器返回这个会话的URL和token ID。
    - 然后后台服务器再把以上的URL和token ID原样通过与APP之间的长连接转发给APP。
- 阶段2：客户端与Stripe服务器之间的支付环节
    - 经过第一阶段后，APP就收到了Stripe服务器的支付会话URL和token，此时APP就访问以上URL直接与Stripe的服务器之间会话完成真正的支付流程，这一步对于开发者的APP以及后台服务器而言都是完全透明的。
- 阶段3：支付完成后给后台服务器的通知
    - 当用户在APP中完成与Stripe的支付流程后，APP UI处于等待支持确认的页面，此时Stripe服务器向开发者的后台服务器发送支付确认信息。
    - 后台服务器收到支付确认后，修改PostgreSQL数据库中的购买订单状态为PAID，在数据库中修改用户的权益信息。
    - 最后后台服务器再通过websocket或者向APP的轮询请求发回购买完成的确认信息，APP刷新UI显示，给用户展示出来已经购买的商品或者服务信息。

![stripe-architecture-flow.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-1.png)


## Stripe服务器通知支付事件的Webhook机制


在以上的流程中，开发者的后台服务器向Stripe服务器发起请求创建支付会话请求（以上流程图的第3步）后，在后续的支付会话中，Stripe 服务器并不会与后台服务器之间开启和维持一个长连接会话（这样太浪费Stripe服务器的内存了），而是通过一个Webhook的机制在用户完成支付后，由Stripe服务器主动发起请求向开发者后台服务器注册的WebHook URL发出通知，告知支付完成的状态。


因此，为了支持这个Webhook机制，在开发者注册自己的Stripe账号时，需要在Stripe的开发者后台控制台里，把自己的服务器公网地址提前注册进去，这样后续在用户完成支付以后，Stripe服务器才能够知道WebHook的URL，并向其发出支付完成通知。


所以，开发者后台服务器与Stripe服务器之间的通信始终都是标准的RestFul无状态通信模式，每次开发者的后台服务器向Stripe服务器发起请求创建一个支付会话请求后，Stripe服务器返回一个支付会话的URL和Token ID以后，这个连接就关闭了。后续等待支付完成后，Stripe 服务器再通过这个Webhook的机制向开发者后台服务器发回事件完成通知。


以下是用户完成付款后，Stripe服务器向 WebHook URL 主动发起支付事件完成的流程图，其中包含了加密认证信息来确保通信的安全性，同时针对可能发生的 WebHook 通信失败的情况，Stripe 服务器也会在一段时间内重发事件告知的请求，以确保整个支付流程和通知的机制得到完整闭环处理：


![stripe-server-webhook.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-2.png)


## 前端与Stripe服务器之间的通信模式：Checkout vs Payment Element


对于前端（APP，Web）而言，在开启支付会话请求并且从后台服务器得到Stripe服务器返回的会话URL和Token ID以后，真正的支付流程是在前端和Stripe服务器之间的通信来完成的。此时前端与Stripe服务器之间的通信模式主要可以分为两种：Checkout和Payment Element。


### Checkout模式


Checkout模式的运行机制为，当后台服务器调用 Stripe API 创建支付会话后，Stripe 服务器会生成一个逻辑订单，并动态渲染一个专属于这笔订单的 SPA（单页面应用）网页，这个网页会部署在 Stripe 的域名下（通常是 `checkout.stripe.com`）。然后把这个Checkout URL返回给开发者的后台服务器并转发给前端。


在这种情况下，开发者只需要在自己的 App 或前端网页中，通过重定向 (Redirect) 或打开内置浏览器来访问这个 Checkout URL即可。


Stripe 在这个页面里注入了非常强大的功能。如果它探测到用户用的是 Safari，它会自动展示 Apple Pay；如果是 Chrome，展示 Google Pay；它甚至会自动根据用户的 IP 切换多国语言和本地货币（比如在欧洲自动显示 iDEAL 支付）。而这些复杂的探测逻辑，不需要开发者写一行代码，全部由 Stripe服务器自动处理。


### Payment Element 原生模式 


该模式的运行机制为，用户在支付页面中不离开开发者的域名或 App，需要开发者自己在 Web 页面或者 APP 的前端用 HTML/CSS 或者 Android 的原生组件画一个美观的结账页面（包含购物车、收货地址等），也就是说支付页面是由开发者自己设计并呈现给用户的。


当然，为了确保支付流程是安全隔离的，在这个前端支付页面需要用户输入信用卡号的那部分区域，必须通过集成 Stripe 的前端 SDK，向 Stripe 申请渲染一个 Payment Element 组件。这个组件在 Web 上本质上是一个跨域的 `<iframe>`（在 App 里则是一个安全视图）。


在这种设计的情况下，即使支付页面的输入框由开发者自行设计，用户敲击键盘输入银行卡号，是直接输入到了 Stripe 的 iframe/安全视图里，并直接发送给 Stripe 的金库，开发者自己实现的外层 JavaScript 或 Android 代码无法读取这些明文密码，这样就可以完美绕过 PCI 合规审查，并确保整个支付环节的流程及其安全性完全由Stripe负责。


以上两种模式的处理流程图如下图所示：


![stripe-checkout-vs-element.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-3.png)


那么对于Stripe来讲，它是如何区分这两种模式呢？


答案是：Stripe 根本不关注前端究竟使用了哪种模式，它只关心在支付请求发起的时候，开发者的后台服务器向 Stripe 服务器发起请求的时候采用的究竟是Checkout 模式的 API 还是 Payment Element的API。

- 使用 Checkout 模式时，后台服务器向 Stripe 发起的 API 请求对应的API是`POST /v1/checkout/sessions`，参考[https://docs.stripe.com/api/checkout/sessions](https://docs.stripe.com/api/checkout/sessions)。此时 Stripe server 会生成一个带支付界面的网页，并且把这个网页的URL返回给后台服务器。
- 使用 Payment Element 模式时，后台服务器向 Stripe 发起的 API 请求对应的API是`POST /v1/payment_intents`，参考[https://docs.stripe.com/api/payment_intents](https://docs.stripe.com/api/payment_intents)。此时 Stripe Server 会在内存里创建一个订单记录，并生成一个一次性密钥返回给后台服务器，此后前端会基于这个密钥与 Stripe Server 通信完成支付。

## Stripe的安全通信机制及其密钥


如以上流程图所示，在整个支付业务的通信过程中，涉及到了前端、后端以及Stripe服务器三方，为了确保整个支付业务在通信过程中的安全性，Stripe 提供了三组密钥用于确保通信过程中的身份认证和签名确认。这三组密钥在Stripe 的开发者控制台中生成：

- Publishable Key (公钥，以 `pk_` 开头)：硬编码在前端（App/网页）的代码中，是作用是让前端在与 Stripe 服务器通信的过程中，向 Stripe Server 证明“我是谁家的前端”。
- Secret Key (私钥，以 `sk_` 开头)：必须且只能安全地存储在后端服务器的环境变量中，绝对不能泄露给前端或提交到 Git 仓库。其作用是在后端调用 Stripe API（如创建订单、退款、查询账单）时，将其放在 HTTP 的 `Authorization: Bearer <sk_...>` 头部，Stripe Server 据此可以得知这个支付请求来自哪个商户。
    - 实际上除了 Secret Key以外，还有一个Restricted Key，功能类似于Secret Key，只不过是Secret key的功能子集，只具有Secret Key的部分权限，如果只需要创建支付会话的功能，就可以使用Restricted Key，避免更高权限的Secret Key泄露。
- Webhook Secret (签名密钥，以 `whsec_` 开头)：同样只能保存在后端服务器的环境变量中。其作用是专用于验证从 Stripe 发到后端服务器的 Webhook 请求是否被黑客中途篡改。

需要注意的是，整个 Stripe 支付流程业务的所有通信都是在 HTTPS/TLS 链接的基础上进行的，以上的三组密钥都是在 HTTPS 的加密信道中以明文传递，用于进行身份的认证，不会参与数据的加解密运算。


如下图所在，整个支付业务的流程中，分别使用了三组密钥来进行通信角色的身份认证和鉴权：

- 环节一：在后台服务器向 Stripe server 发起支付会话请求的通信中，后台服务器需要把SK/RK放在其HTTP消息中，这样Stripe Server收到后，通过查询这个SK/RK的身份归属以及确认其是否有创建会话的权限。
- 环节二：在前端与Stripe Server之间进行的实际支付业务的交互中，前端需要在其HTTP消息中把PK传递给Stripe Server，Stripe Server根据这个PK得到与其通信的前端的身份归属。
- 环节三：前端与 Stripe Server之间的支付流程结束后，Stripe Server要通过Webhook机制向后台服务器发出事件通知，后台服务器收到这个消息以后需要通过Webhook Secret密钥对消息的内容进行验签，确保这个消息是由Stripe Server发过来的。

![68951394-a233-4ed6-9d9b-76fd3a268714.png](/images/blog/Stripe在线支付功能的工作流程和安全机制解析-4.png)

