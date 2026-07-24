---
title: "Amazon AWS之Cloudfront Service学习总结"
slug: "2026-06-10-The-summary-of-AWS-cloudfront-service"
description: "Amazon CloudFront Service的定位是 AWS 的全球内容分发网络（CDN）服务（目前已经在所有的AWS Region中处于全面可用/GA状态）。它的核心作用主要是缓存静态资源，通过 AWS 在全球部署的骨干网加速静态以及动态内容的传输与发布。"
date: 2026-06-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["云平台"]
tags: ["AWS","全栈开发"]
draft: false
---


## Cloudfront的工作流程


Amazon CloudFront Service的定位是 AWS 的全球内容分发网络（CDN）服务（目前已经在所有的AWS Region中处于全面可用/GA状态）。它的核心作用主要是缓存静态资源，通过 AWS 在全球部署的骨干网加速静态以及动态内容的传输与发布。


CloudFront Service的网络底层基于AWS部署的数百个遍布全球的 POP（边缘节点）。这种情况下，当用户或设备向其发起网络请求时，流量会被AWS Anycast 路由到其物理距离最近的节点，极大的加速静态和动态内容的传输。


以下使用一个从 AWS 东京Region的S3 Bucket中通过Cloudfront service下载文件的流程图，来对Cloudfront Service的工作流程进行解释。


终端用户每次向Cloudfront的URL发起请求，该请求首先会被AWS Anycast路由到距离请求发起方最近的Cloudfront网络节点。然后Cloudfront会去检查是否缓存命中（即CloudFront自身的缓存是否包含请求所需要的静态资源文件）：

- 在缓存命中，即CloudFront缓存包含有请求所需要的文件时，直接跳转到第四步，返回该文件给终端用户。
- 而如果缓存未命中，CloudFront会通过AWS在全球部署的骨干网络向部署在S3东京站的bucket发起回源请求，从S3 Bucket中读取该文件到CloudFront的缓存中，把这个文件返回给终端用户，同时保存在CloudFront的缓存中，这样后续再次访问的时候就可以缓存命中，直接从缓存中向终端用户返回文件。

![35808f53-88a2-425a-b6a0-4085d1b8d8ff.png](/images/blog/Amazon-AWS之Cloudfront-Service学习总结-1.png)


由以上流程可以看到，**Cloudfront 作为AWS的CDN服务最主要的作用就是：可以实现静态资源文件（尤其是热点资源）的全球网络加速分发服务**。热点资源在短时间内请求数量很多，使用CDN服务可以利用其分布在不同地理节点的缓存服务器把资源快速的分发给距离最近的用户终端，既有效的提升了用户体验，而且也避免了所有用户请求集中到同一节点所带来的稳定性和网络路由低效的问题。


即便是针对缓存未命中的动态资源，因为CND缓存服务器（CloudFront）与动态资源实际存储的回源服务器（如以上的东京Region的S3 Bucket）之间走AWS的内部骨干网络，相比用户直接访问回源服务器，用户请求响应的速度也得到很大程度的提升。


CloudFront是如何管理缓存的？


CloudFront 不限制存储在其边缘站点的单个文件（对象）的大小，因此可以缓存从几 KB 的脚本文件到几十 GB 的软件安装包。


AWS 拥有遍布全球的多个边缘站点，每个站点都有其特定的硬件存储容量方面的限制，CloudFront 当然不可能在其缓存服务器中一直保存之前访问的缓存文件。


**通常情况下，CloudFront 使用最少使用（LRU - Least Recently Used）的算法来动态管理其缓存服务器中所保存的文件**。如果一个文件在某个边缘站点存储时间很长且很少被访问，当前存储空间不足时，它就可能会被删除以腾出空间。这样的话，下次对这个文件发起的新请求又会被转发到回源服务器请求数据。


当然除了以上的 LRU 算法以外，缓存是否失效也与文件自己设置的 TTL 生命周期时长有关。


缓存时间限制TTL


**文件在 Cloudfront 缓存中的有效时间也可以通过源站点的 TTL 参数来进行设置。**


默认情况下，CloudFront 会遵循源站点（如 S3、EC2 或 API Gateway）返回的 HTTP 缓存标头参数`Cache-Control: max-age=<seconds>`和`Expires: <http-date>`来设置该文件在缓存中的有效时间。


因此，如果我们对于文件的时间有效性有特定的要求，可以在源站服务器配置或 S3 对象元数据中设置这些标头信息，以更精细地控制每个文件的缓存时间。


高 TTL (缓存时间长)：

- 优点：可增加缓存命中率。文件在边缘站点保留时间长，意味着当用户请求时，更有可能从边缘站点直接服务，从而大幅减少回源请求，这就减少了从源站到 CloudFront 的数据传输费用。
- 缺点：内容更新较慢，用户请求到的文件可能是过期的，因此如果对于文件本身的生命周期有较高要求，不应设置过高的TTL。

低 TTL (缓存时间短) 或 0 TTL (不缓存)：

- 优点：每次请求得到的数据文件的内容都是最新的。
- 缺点（更贵）： 会降低缓存命中率，这样大量用户请求会到回源服务器请求数据，请求数量和费用增加。

因此，究竟应该要设置高还是低 TTL 参数，要根据自己文件和应用的设计需求来定：如果对数据文件内容的时效性要求比较高，就应该选择低TTL，代价就是费用会较高，否则就应该选择高TTL的设置，尽可能减少回源请求的次数。


## Cloudfront的费用模型


以下通过从S3上下载文件的典型应用对比增加CloudFront的情况下，对于云服务使用成本的影响。


总体来讲，对从S3上下载文件的这个流程，与云服务使用成本费用相关的部分主要包含：存储、出向流量、请求（API/HTTP）。

- 存储 (Storage)：即 S3 上的静态对象存储费，按存储在 S3 中的数据量 (GB/月) 计费。Standard 存储类前 50 TB：$0.023/GB/月。
- 出口流量 (Data Transfer Out)：
    - DTO to Internet (出向流量费)：这是最大的费用块，数据从 AWS 的云服务发送到互联网的流量费用。
        - S3 直接下载的模式，按照阶梯计费，前 10 TB 为 $0.09 / GB。
        - Cloudfront 下载模式，按地区+阶梯计费。北美/欧洲环境中的费用为 $0.085 / GB (即比 S3 直接下载便宜 5.5%)。
    - S3 to CF (回源流量费)：数据从 S3 存储桶下载到 CloudFront 边缘站点的费用，这部分在AWS内部的流量是免费的。
- 网络请求费 (Requests)：
    - S3 API 请求费 (GET)：用户直接向S3 Bucket请求下载的情况下发起，按照对 S3 桶发起的 API 调用次数计费。例如 GET/HEAD 请求。费用为 $0.0004 / 1,000次请求。
        - CloudFront 模式下，如果缓存未命中，从 Cloudfront 向 S3发出的 API 请求费与以上相同。因此这部分费用与缓存命中的比例相关。高命中率下这项费用趋近于 0。
    - CF HTTP/HTTPS 请求费：按用户发送给 CloudFront 边缘节点的请求次数计费。HTTPS 请求在北美的费用为 $0.0010 / 1,000次请求，相比 S3 贵，但获得了 CDN 能力。

那么对于**直接从S3上下载**以及**通过Cloudfront从S3上下载**这两种情况的费用模式：

- 在存储费用上两者是完全相同的，只取决于在S3中存储的数据量。
- 在出口流量上，相同出口流量的情况下，从S3上下载比通过Cloudfront下载的这部分费用少5.5%.
- 而在网络请求费用上，通过Cloudfront下载的费用实际上要更高一些：
    - 从S3上直接下载，只包含用户发起的 S3 API请求次数的费用，费率是$0.0004 / 1,000次请求。
    - 而通过Cloudfront下载，这部分费用包含两个部分，一个是用户发起的Cloudfront API的请求费用，费率$0.0010 / 1,000次请求，相比S3 API要高一些；而且如果缓存不命中的情况下，还要包含向 S3 回源的请求费用。以上两者相加，这部分费用，Cloudfront 相比 直接访问S3就要高出不少，在缓存不命中的比例偏高的情况下尤甚。

但即使在两者成本持平甚至略高的情况下，依然推荐使用 CloudFront 模式：

- 性能提升： 用户网络访问的响应速度更快，用户体验更好。
- 安全性：可通过 WAF + OAC（源站访问控制）将 S3 设为私有，彻底杜绝恶意盗刷流量的财务安全漏洞。

## Cloudfront的固定费率定价方案


如果通过Cloudfront访问的流量比较大，还可以参与AWS的固定费率定价方案来进一步降低CloudFront的使用成本：


![dbf281d2-076a-40d9-bbae-f4a820e2e1a5.png](/images/blog/Amazon-AWS之Cloudfront-Service学习总结-2.png)


该定价方案中，AWS 提供了一个极低打包价格的固定费用模型，其中针对Cloudfront的使用包含了堪称海量的免费额度（无超额费用，若超出将被限速或要求升级），以每月支付 $15 固定费用的 Pro 用户为例，该套餐包种包含的免费额度包括：

- 出向数据流量传输 ： 高达 50 TB，这部分按照传统按需模式下的价值约 $4000+。
- 访问请求数： 10,000,000 次（1000 万次）。
- 增值安全 (免费送)： 强制开启并包含 AWS WAF（Web 应用防火墙），自带 25 条规则，并包含 DDoS 保护。
- S3 存储抵扣： 每月额外赠送 50 GB 的 Amazon S3 标准存储额度。

![ae7f5972-7413-4337-8b34-9eb8adfd1f54.png](/images/blog/Amazon-AWS之Cloudfront-Service学习总结-3.png)


在这个固定费率方案的加持下，使用CloudFront的费用成本将会大幅度降低，以下是一个S3存储容量1TB，每月出站流量10TB，请求数量1000万次，缓存命中率90%的情况下，对比直接访问S3、通过CloudFront访问S3（标准费率模式）、通过CloudFront访问S3（固定费率模式）这三种情况下的费用状况对比：


![21d886b9-5247-41e0-b905-17fc1aed910a.png](/images/blog/Amazon-AWS之Cloudfront-Service学习总结-4.png)


## 参考资料

- [https://aws.amazon.com/cn/s3/pricing/](https://aws.amazon.com/cn/s3/pricing/)
- [Amazon CloudFront CDN — 计划和定价 — 免费试用](https://aws.amazon.com/cn/cloudfront/pricing/)
- [CloudFront 固定费率定价方案 - Amazon CloudFront](https://docs.aws.amazon.com/zh_cn/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html)
