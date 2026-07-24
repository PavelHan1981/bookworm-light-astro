---
title: "安全摄像头的Webhooks和HTTP Push功能"
slug: "2026-07-22-the-webhooks-and-http-push-feature-of-security-camera"
description: "本文介绍了部分安全摄像头产品中所支持的WebHooks和HTTP Push的第三方报警平台的功能，以及该功能实现的架构与通信流程最佳实践。"
date: 2026-07-22T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["物联网"]
tags: ["音视频","网络","网络安全"]
draft: false
---


本文介绍了部分安全摄像头产品中所支持的WebHooks和HTTP Push的第三方报警平台的功能，以及该功能实现的架构与通信流程最佳实践。


## 摄像头Webhooks和HTTP Push告警功能


常规的摄像头，在通过 PIR 或者 AI（如人形检测、人脸识别、车牌识别）等方式检测到事件后，可以把这个事件的消息以及录像视频推送到自己的云平台，并由自己的云平台转发到用户的手机 APP 上。所有的事件推送流程以及与之相关的事件录像文件都局限于摄像头厂商的封闭生态之中。


相比于以上这种传统的只绑定自家 APP 的封闭生态，通过 Webhook 或者 HTTP Push 的功能对外推送事件通知，意味着这个摄像头设备可以直接接入第三方中控系统或安保报警平台。


_实际上，Webhook 本身并不是什么高深的新协议或新技术，它的底层逻辑实际上就是：__**当特定事件发生的时候，系统会自动向预先配置好的 HTTP Server 发送一条 HTTP 请求（通常是 POST）来告知事件信息而已。所以在某些系统的配置中，这个功能也被称之为HTTP PUSH、Alarm Upload。**_


![6f83a518-7eb6-4b00-b356-b3cf0b863d8f.png](/images/blog/安全摄像头的Webhooks和HTTP-Push功能-1.png)


**实际上，绝大部分面向企业级（B2B/SMB）和高端商用的品牌（如海康，大华，Axis，Meraki）都原生支持 Webhook/HTTP 请求推送，而面向纯C端消费级（B2C）的品牌（如Ring，Arlo，Nest，Eufy，Wyze）大多倾向于建立封闭生态，不原生开放 Webhook，这样可以把用户锁定在自己的 App 生态内，并推广自己的云存储订阅服务。**


以下是一个典型的安全摄像头系统的 Webhooks 的配置界面：


![c00a0634-a6f1-481c-af0e-44f589234235.png](/images/blog/安全摄像头的Webhooks和HTTP-Push功能-2.png)


## WebHook实现的两种架构方案


针对 WebHook 或者 HTTP Push 的具体实现，主要有端侧直推和云端转发两种技术方案，分别针对于不同的应用场景。


端侧直推


以下为端侧直推方案的架构：第三方告警服务器的 URL 直接设置到摄像头端，由摄像头内部的固件直接发起 HTTP POST 请求，通过自己的网络将数据直接推给第三方 URL。


![ca544108-6ceb-4f9b-8640-225d345f28e7.png](/images/blog/安全摄像头的Webhooks和HTTP-Push功能-3.png)


**这种方案的适用场景是对数据隐私要求极高（纯局域网或禁止数据过第三方云）、常电IPC设备。**  


其优点是设计架构最简单，该功能不需要依赖于厂商部署专门的云服务，客户数据不经过云服务器的中转，隐私性最好。


缺点也很明显，每次发生的告警事件都要在端侧建立 TLS/HTTPS 握手，这个过程对于低功耗电池 IPC 来说极其耗电。而且如果第三方服务器宕机，摄像头端侧的内部系统很难维持长时间的指数退避重试队列，很容易丢消息。


云端转发


以下是云端转发方案的架构：第三方服务器的URL设置到云端，摄像头通过轻量的长连接协议（如 MQTT、WebSocket）将告警信号发给厂商的云服务器，再由厂商云端服务器组织标准的 HTTP POST Webhook 推送给第三方客户服务器。


![19174867-adc4-4e9f-8e1e-a97065931363.png](/images/blog/安全摄像头的Webhooks和HTTP-Push功能-4.png)


**这种方案的适用场景是电池类低功耗摄像头、需要高可靠性消息触达的商业化项目。当然相比之下，也是更可靠的方案。**  


**其优点更省电，**摄像头端侧只需要发送很小的 MQTT Payload（甚至只发个触发信号），然后就可以快速重新进入休眠状态。而且云端拥有强大的消息队列处理能力（如 Kafka、RabbitMQ），可以轻松实现失败重试、死信队列，这样可以确保告警消息100%送达第三方服务器。另外，这种云云交互的方式安全性也更好，云端可以集中管理各个批次设备的 Webhook URL、密钥和证书等。


## WebHooks功能的安全机制


因为是与第三方服务器之间进行通信，那么第三方服务器在通过 Webhook 接收事件告警通知时，一个很大的安全性隐患就是被恶意伪造告警。


因此在这个第三方告警接入的系统设计上，必须至少包含有以下安全机制（主要有第三方告警服务器端来进行设计）：

- **基于HTTPS 强制加密**：也就是说，Webhook 目标 URL 地址必须是 [`https://`](https://xn--,,camera-l39ljlv5ccxg65igv9e4jt6w4b2g9enfiy9xyme7nb/)[，防止通信链路上的中间人攻击，Camera](https://xn--,,camera-l39ljlv5ccxg65igv9e4jt6w4b2g9enfiy9xyme7nb/) 和 ODM 厂商服务器与第三方告警服务器之间一定要通过 HTTPS 来对通信进行加密且验证服务器身份证的正确性。
- **通过签名机制 (HMAC-SHA256)对告警消息进行加密保护**：一般是在发送的 HTTP 消息的 Header 中带上一个 `X-Signature`字段。该字段的计算方式为：将 Request Body 与客户在后台设置的 `Secret Key` 进行 HMAC-SHA256 运算，第三方服务器收到后使用相同的密钥进行验签，确认消息确实来源于合法的设备或 ODM 厂商的云端。

Webhook 的 Payload 需要结构清晰，以方便服务器端收到后解析。此外，因为告警事件对应的事件缩略图和录像文件所占的体积较大，Webhook 的 JSON 结构中一般只包含缩略图 URL 或视频下载链接，第三方系统收到 Webhook 后，再通过Payload中包含的链接按需拉取媒体文件。


以下是目前业界标准的 JSON 定义参考：


```json
{
  "eventId": "evt_123456789",
  "timestamp": 1716382910,
  "deviceSn": "CAM-5G-889900",
  "eventType": "human_detection", // 事件类型：PIR, motion, human, vehicle, face
  "data": {
    "snapshotUrl": "https://cdn.your-odm.com/xxx.jpg", // 事件截图
    "videoClipUrl": "https://cdn.your-odm.com/xxx.mp4", // 事件录像文件
    "batteryLevel": 85, //电池电量
    "signalStrength": 4 // WiFi 信号强度
  }
}
```


## 参考资料

- [How-to Setup IP Camera API Webhook Events](https://videos.cctvcamerapros.com/support/topic/ip-camera-api-webbooks)
