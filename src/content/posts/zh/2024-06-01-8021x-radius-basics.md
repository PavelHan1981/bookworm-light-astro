---
title: "802.1x与RADIUS认证的基础知识总结"
slug: "2024-06-01-8021x-radius-basics"
description: "本文总结了以WiFi接入方式增加802.1x Radius认证功能的一些基础知识，仅作为对该部分知识领域的扫盲。"
date: 2024-06-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["网络安全"]
tags: ["无线通信","WiFi"]
draft: false
---


![Untitled.png](/images/blog/802.1x与RADIUS认证的基础知识总结-1.png)

- 802.1x定义的Radius是一种企业级的、基于C/S架构的设备接入网络方面的认证管理协议，提供了比家用路由器常用的WPA/WPA2等更严格、更灵活的安全认证管理方式。但是这种认证管理模式的使用，需要配合在同一网络下部署一台专门的RADIUS server，由RADIUS Server的数据库或者数据文件对接入设备的权限进行管理。
- RADIUS：Remote Authentication Dial In User Sevice，远端用户拨入验证服务。RADIUS是一种在网络接入服务器（Network Access Server，简单理解就是我们使用的路由器AP）和共享认证服务器（简单理解就是RADIUS Server）之间对于网络接入访问进行认证和授权管理的通信协议。
- RADIUS Server会使用一个用户数据库，存储要接入的用户设备的用户名、密码、MAC地址、对应访问的资源类型和权限等。这样当用户接入时，RADIUS server会查询该数据库来决定是否接入，以及接入的权限控制。
- 802.1X RADIUS认证的完整工作流程：
    - 用户设备接入路由器，路由器向RADIUS server提交用户信息，包括用户名、密码、MAC地址等。其中用户密码使用公钥加密保护。
    - RADIUS服务器对用户名和密码等的合法性进行校验，在合法的情况下RADIUS Server向路由器返回Access-Accept消息允许接入，否则返回Access-Reject消息拒绝接入。
    - 在有计费需求且前一阶段允许接入的情况下，路由器进一步向RADIUS Server发出计费请求Account-Require，RADIUS Server相应Account-Accept开始进行计费。
    - 至此，用户设备可以正常使用网络。
- RADIUS Server与路由器之间的RADIUS协议使用UDP协议进行通信，UDP 1812端口负责认证，1813端口负责计费。
- RADIUS服务器的搭建一般直接使用普通的PC即可，在Linux系统下比较常用的RADIUS Server是开源软件FreeRadius。官方网址：https://freeradius.org/ 。目前最新版本是V3.2.4.
- 是802.1x，而不是802.11x。802.1x的这种企业级的认证方式不仅适用于对于wifi接入的管理，也可以用于对以太网方式接入的网络设备的管理。无论是wifi方式接入，还是有线网络方式接入，802.1x都用于控制接入设备对于内网资源的访问权限，接入时配合用户名、密码以及MAC地址等方式对接入设备的身份进行校验，决定是否允许访问内网资源，以及开放哪些资源和访问权限。
- 802.1x Radius认证模式在WiFi AP上的使用和配置：
    - 首先当然是要先在这个AP的局域网内搭建和配置一个RADIUS Server，为后续AP统一使用RADIUS认证打好基础。
    - 在路由器AP中设置使用802.1x Radius认证方式（或者WPA2企业版），一般需要在此设置Radius Server的IP地址，端口（默认是UDP 1812），AP与Radius server之间通信的共享密钥。
    - 接入设备端在具体的接入方式上，此时要选择802.11x或者WPA2企业版接入方式（在手机上实际上可以自动识别出来），认证方式（例如PEAP），以及认证所需要的用户名和密码。
        - 具体的认证方式、用户名、密码、AP与Radius Server之间的密钥等需要与Radius Server的设置保持一致。
