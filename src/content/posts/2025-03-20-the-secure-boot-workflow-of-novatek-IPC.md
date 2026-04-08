---
title: "Novatek IPC平台Secure Boot流程详细解析"
slug: "2025-03-20-the-secure-boot-workflow-of-novatek-IPC"
description: "本文基于对Novatek NT98567相关资料的学习，整理出来该平台Secure Boot流程中对启动过程中各个阶段进行加解密操作和保护的完整过程，为更清楚的理解嵌入式系统Secure Boot的概念和流程提供了一个很好的实际案例。"
date: 2025-03-20T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["嵌入式"]
tags: ["加密技术","嵌入式","网络安全"]
draft: false
---


本文基于对Novatek NT98567相关资料的学习，整理出来该平台Secure Boot流程中对启动过程中各个阶段进行加解密操作和保护的完整过程，为更清楚的理解嵌入式系统Secure Boot的概念和流程提供了一个很好的实际案例。


之前通过另外一篇笔记详细的整理了Secure Boot的工作流程和概念：[**嵌入式产品SecureBoot的启动流程总结**](https://www.pavelhan.tech/article/2024-08-12-Secure-Boot-in-Embedded-System)**。**


## Novatek NT98567


下图是Novatek NT98567/98568的框图。大体上规格是双核ARM A7，内包最高2Gb DDR，ISP和编码能力最高5M 30fps，支持H.264、H.265，可支持独立双摄，0.5T算力。整体来讲，从规格上并没有太出彩的地方，比较特殊的一点就是能够支持EIS，这样就可以应用到Car DV、运动相机等领域。


![image.png](/images/blog/Novatek-IPC平台Secure-Boot流程详细解析-1.png)


## NT98567的ARM TrustZone支持


如上所述，NT98567/98568的CPU配置是ARM Cortex-A7双核，属于ARMv7-A架构。而该架构是可以完整支持ARM TrustZone安全规范的。因此可以在应用系统设计上把系统分为安全世界和非安全世界两个独立的子系统，也就是TEE实现。


Novatek NT98567/98568平台本身的SDK也是可以在ARM TrustZone架构支持下提供OPTEE的支持，只不过在SDK中，OPTEE是可选的。也就是说：

- 如果用户应用程序中需要有一部分隐私和安全性敏感的应用逻辑运行在安全世界的话，最好能够启用OPTEE，把这部分功能放在OPTEE的安全环境中实现，提供接口给非安全世界的Linux系统访问；
- 而如果只是要开启Secure Boot的话，那就没有必要打开OPTEE选项的支持了。

是否开启OPTEE与Secure Boot流程基本没有关系：


![image.png](/images/blog/Novatek-IPC平台Secure-Boot流程详细解析-2.png)


有关对于ARM TrustZone技术领域的相关知识，可以参考我的另外一篇笔记：[**一文入门TEE与ARM TrustZone安全技术**](https://www.pavelhan.tech/article/2024-11-15-ARM-Trustzone-Summary)**。**


## NT98567的EFuse结构


既然要开启Secure Boot，那么必须要把一些与该机制相关的密钥保存在芯片的安全存储器中，并且写入一次后无法取消或更改，这就是芯片内置的EFuse结构。


在NT98567的Secure Boot流程实现中，主要用到两种加解密算法及其密钥：

- AES128：对称密钥算法，密钥长度128bit，对于镜像文件的内容进行AES128加密保护。
- RSA2048：非对称密钥算法，密钥长度2048bit，用于对镜像文件的签名进行验签。

以上两个密钥在NT98567 EFuse中的存储结构如下：


![image.png](/images/blog/Novatek-IPC平台Secure-Boot流程详细解析-3.png)


此处需要注意的是，NT98567 EFuse单个block大小为16字节，所以AES128的密钥保存在第一个block中，而RSA2048密钥的长度过长，所以在EFuse中保存的支持该密钥公钥的SHA256签名，长度占了两个Efuse block。其实如果没有EFuse大小限制的话，此处应该要保存验签使用的RSA2048算法的公钥。


## 镜像文件的加密保护


对于在Secure Boot流程中加载的各级镜像文件，需要使用以上保存在EFuse中的两个密钥分别进行加密和签名保护：

- 使用EFuse中保存的AES128的密钥，对镜像文件的数据内容进行加密。
- 使用EFuse中保存的RSA2048公钥（实际上Efuse只保存了公钥的SHA256签名）对镜像文件内容的内容做基于非对称密钥算法的签名保护。

经过以上对于数据内容的加密以及签名操作以后，只要密钥不会泄露，那么就可以保证Secure Boot流程能够正常运行的各级镜像文件的内容既是加密的，也是由官方发布的。


具体的实现上，Secure Boot流程中的每个镜像文件都会被加上一个镜像文件头，其中保存了RSA2048签名算法的公钥，以及使用RSA2048私钥对镜像数据内容部分计算出来的签名：



![image.png](/images/blog/Novatek-IPC平台Secure-Boot流程详细解析-4.png)


以上镜像文件的包头中，最前面的Header是一个固定大小的结构体，其中主要包含的信息就是RSA2048的公钥、签名、加密数据在镜像文件中的地址偏移量，加密数据文件内容的大小，整个镜像文件的checksum等。


第二部分保存了RAS2048的公钥。那么如何验证这个公钥的合法性呢？可以对这个公钥进行SHA256签名运算，与EFuse中保存的公钥签名进行比对，如果一致就表示这个公钥是合法的。


第三部分是对这个镜像文件进行打包的时候，PC工具先对镜像数据内容的明文使用SHA256算法计算出来一个签名，然后把这个签名再用RSA2048算法的私钥进行加密得到这个Signature，写入镜像文件的包头信息中。


最后的第四部分就是使用Efuse中保存的相同的AES128密钥对镜像数据内容的明文进行加密保护的密文部分，也是整个镜像文件中最重要的部分。

> 因此，PC tool对原始镜像文件进行打包加密的时候需要：增加一个固定大小的Header，在其中包含公钥、签名以及数据内容的位置指针信息；把RSA2048算法的公钥部分放在包头的第二部分；基于原始镜像文件内容的明文计算SHA256签名运算，并且把签名结果用RSA2048的私钥加密放在包头第三部分；最后是对原始镜像文件的内容执行AES128加密，把密文放在第四部分。

## Secure Boot的启动流程


如第二部分对于NT98567支持的ARM TrustZone机制所述，在不使能OPTEE的情况下，整个Secure Boot的启动流程是：

- 上电开机后，首先运行NT98567内部的Rom Loader；
- Rom Loader加载Flash中保存的第一阶段启动镜像loader，对其进行解密和签名验证，然后加载Uboot；
- Loader加载Uboot以后，同样基于Efuse中的密钥以及Uboot镜像头部的密钥、签名等信息，对Uboot的内容进行解密、签名验证，验证通过后执行Uboot，Uboot再负责加载Kernel镜像；
- Uboot加载Kernel后，再同样基于Efuse中的密钥以及Kernel镜像头部的密钥、签名等信息，对kernel的内容进行解密、签名验证，验证通过后就可以正常启动Linux系统了。（此处Rootfs的镜像是不做Secure Boot保护的）

下一步以Uboot启动Kernel的流程来说明Uboot如何对Kernel的加密镜像就行解密和验签：


![image.png](/images/blog/Novatek-IPC平台Secure-Boot流程详细解析-5.png)


## 参考资料

- NT98567 Secure Boot Flow User Guide
- NT98567_Secure_boot_User_Guide_en
- [信息安全：RSA-2048性能 - 知乎](https://zhuanlan.zhihu.com/p/669220785)
