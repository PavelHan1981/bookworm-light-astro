---
title: "基于Software Token的Apple MFI认证及其工作流程"
slug: "2024-12-05-the-software-token-based-certification-on-apple-MFI-assessory"
description: "本文基于对MFI认证相关文档的学习，整理了MFI认证的两种类型（硬件加密芯片/Software Token），MFI认证的流程，以及Software Token Based MFI外设产品与Token认证和管理相关流程的技术细节。"
date: 2024-12-03T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["物联网"]
tags: ["MFI"]
draft: false
---


## Apple基于软件token的MFI认证介绍


众所周知，Apple对连接到其设备的第三方外设有着严格的质量标准、连接规范和安全要求。这确保了通过MFI认证的外设能为用户提供优质的体验和服务。因此，所有Apple产品外设在上市销售前都必须通过MFI认证。


Apple设备的MFI认证主要分为两类：基于硬件加密芯片的外设认证和基于Software Token的认证。其中：

- 基于硬件加密芯片的认证主要适用于通过物理接口（如USB或Lightning接口）连接到苹果设备的外设，包括充电头在内。这种认证所需的硬件加密芯片价格昂贵，给许多外设制造商带来了巨大的成本压力。虽然对某些产品（如充电头）使用加密芯片的必要性值得商榷，但这是Apple制定的游戏规则。
- 基于Software Token的MFI认证则适用于通过WiFi或BLE等无线方式连接的外设。根据Apple的《Introduction to Software Authentication》文档规定，三类产品可以使用软件token认证：Apple Find My Network、Airplay Audio和HomeKit。因此，如果配件属于这三类产品，制造商可以避免购买昂贵的MFI硬件加密芯片，转而采用基于软件Token的认证方式。

所谓的Software Token，实际上是写入苹果外设硬件产品固件中的一串唯一标识字符串。这个Token由Apple生成并统一管理。配件厂商在量产外设产品时，需要向Apple批量申请Token，并在生产线上逐一写入产品固件中，确保每个产品都有其独特的Token。当用户购买并使用这些产品时，苹果设备可以通过验证Token来确认产品的合法性。


## 以Homekit为例说明MFI产品认证流程


以下以 HomeKit 产品为例，说明这些基于软件Token的MFI外设硬件产品的认证工作流程：

- **Product Plan**：产品计划阶段。配件厂商需向 Apple 提交 HomeKit 外设的产品计划书并等待审核。审核通过后，Apple 会为该产品分配一个 PPID，用于后续申请 software token。
    - PPID 申请完成后，Apple 会为每个产品型号提供 1000 个软件 token，用于产品开发和测试。
- **Development**：产品开发阶段。配件开发商需学习《HomeKit Accessory Protocol Specification》和《Works with Apple Home Identity Guidelines for HomeKit》文档，并使用 Apple 维护的 HomeKit Accessory Development Kit (ADK) 进行产品开发。这些文档和开发包可从 Apple 的 MFI portal 账号下载。开发过程中，可使用 HomeKit Certification Assistant (HCA)、HomeKit Accessory Tester (HAT) 和 HomeKit Certification Test Cases 等测试工具进行调试。如果产品需要配套 APP，还可使用 HomeKit App Test Cases 进行 APP 测试。
    - 在此阶段需使用 PPID 申请时获得的 1000 个软件 token 进行开发测试。
- **Accessory Production-Ready Certification**：产品开发和自测完成后，提交至 Apple 进行 MFI 认证。需按照认证流程提交相关文档（HomeKit Product Compliance Questionnaire）和 5 个测试样品。如认证过程中发现问题，需反复整改直至通过认证测试。
- **Packaging Certification**：产品包装认证。按《Works with Apple Home Identity Guidelines for HomeKit》要求设计包装，并提交设计文件供 Apple 审核。
- **(If applicable) App Certification**：如产品需配套 APP，则需完成 APP 认证测试。
- **Mass Production**：量产阶段。对于基于 Software Token 的 HomeKit 产品，需在生产线上通过产测程序将从 Apple Server 申请的 token 写入产品固件。每个产品的 token 都是唯一的，并由 Apple Server 统一管理。该外设产品后续在使用过程中与苹果设备连接时，就可以通过验证 token来确认产品MFI认证的合法性。

到了这一步量产中所生产的产品就可以打上这个标了：


![1733389026260.png](/images/blog/基于Software-Token的Apple-MFI认证及其工作流程-1.png)


## 基于Software Token的MFI认证工作流程


### 1. 请求Token


按照Apple所设计的Software Token Based MFI产品的认证与工作流程中，这些产品中生成所需要写入的Software Token需要提前向Apple批量申请。这个申请过程需要配件生产商部署一个服务器，与Apple的MFI认证Token服务器进行通信，两个服务器之间通过基于HTTPS的Restful API进行通信，进行Software Token的批量申请、下载、注册以及销毁等操作。


每次进行的批量Token操作，都由配件厂商所部署的服务器发起请求（Apple对于配件厂商所部署的服务器也有一定的安全性和双向认证的要求，相关的认证证书需要按照流程向Apple申请并部署到自己的服务器上，才能与Apple Server进行有效的通信），Apple Server返回响应。申请到的Token保存在CSV文件中，包含在Apple Server的响应消息中，配件厂商应该妥善保管这些token并在后续的产品量产过程中写入产品固件中。


注意：每个MFI外设产品在立项通过Apple审核后拿到PPID，该产品在开发阶段可以申请1000个token用于产品的开发和测试。而产品量产后，单个型号的产品所能申请的Token数量默认最多为100万个。如果超过这个数量可以通过MFI Portal向Apple单独提出申请超额的token。


### 2. 量产阶段烧写Token到产品固件中


量产之前首先完成了该产品的MFI认证，并通过前一步骤向Apple Server申请到了本次量产所需要使用的Token列表。


量产过程中，配件生产商应该具有一定的产测手段，在生产中针对每个产品写入一个Token。


其实除了以上在量产阶段写入Token到固件中以外，Apple针对那些已经量产出货、但尚未写入token的产品，提供了一种基于APP的MFI Software Token写入的流程。大体上就是这个配件厂商需要针对这类产品开发一个iOS APP功能，在这个APP中使用iOS的performAccessorySetupUsingRequest API去发起这个所谓的In-Field Provisioning的过程，实现通过APP写入并注册Token到Apple Server上的完整流程。

- 这个基于APP的MFI Software Token写入流程只针对Homekit和Airplay Audio品类的产品，不支持Find My品类的产品。所以如果是Apple Find my品类的产品，一定是要在量产阶段提前写入token才行。

### 3. Token的注册


以上量产过程写入Token到量产的外设产品固件中以后，还需要按照Apple所定义的注册流程（Registration）把这批量产产品所使用的Token列表上报给Apple Server。这个上报过程同样是使用配件厂商所架设的服务器与Apple Server之间进行的HTTPS Restful API来实现。


只有已经在Apple Server中注册过的Token ID才能在后续用户使用的过程中，与用户的Apple Device进行绑定和激活。


### 4. Token的激活


Token的激活发生在用户购买这个外设产品，第一次与用户的Apple device进行配对和设置时发生。在用户通过自己的Apple设备绑定这个外设产品时，用户的Apple Device就会与Apple server配合对这个设备中所包含的Token的合法性进行验证，验证后即可加入到自己的外设产品列表之中正常使用。


需要注意的是，每个token在激活和绑定这个设备时只能够被使用一次。如果后续用户把外设产品恢复出厂设置时，用户的apple device就会给这个外设下发一个新的Token，外设需要把这个新的Token保存起来用于下一次所进行的新的外设配对和设置操作。


## 参考文档

- Introduction to  Software Authentication Release R3
- HomeKit Certification Process
- Software Token  Authentication Server  Specification Release R2.1
