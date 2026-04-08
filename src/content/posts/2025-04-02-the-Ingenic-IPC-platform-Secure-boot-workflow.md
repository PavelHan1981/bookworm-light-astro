---
title: "君正IPC平台的Secure Boot流程实现解析"
slug: "2025-04-02-the-Ingenic-IPC-platform-Secure-boot-workflow"
description: "本文对国产的君正Ingenic IPC平台上所使用的Secure Boot功能的运行流程进行完整的总结和说明。"
date: 2025-04-02T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["嵌入式"]
tags: ["SecureBoot","Ingenic","嵌入式","加密技术"]
draft: false
---


本文对国产的君正Ingenic IPC平台上所使用的Secure Boot功能的运行流程进行完整的总结和说明。


## 君正IPC平台的启动流程


与绝大多数嵌入式硬件平台的上电启动以及启动镜像加载并执行的流程相同，君正的IPC平台在上电后也存在多个阶段镜像的加载并执行的过程。


参考资料2中提供了一个很好的流程图，用于解释君正IPC平台的启动镜像加载流程。


![image.png](/images/blog/君正IPC平台的Secure-Boot流程实现解析-1.png)

1. 芯片上电后首先运行其内部固化的Rom Loader，在Rom loader中会根据当前的Power On Pin的检测决定启动方式（Flash，SD卡还是USB）。
2. 当Rom loader从Flash启动时，会首先从Flash的头部按照规则读取Flash中保存的第一阶段bootloader，也就是SPL Image。
3. Rom loader把SPL image加载到其内部的SRAM中，然后把控制权交给SPL。SPL负责执行更多的初始化，尤其是其中的DDR，完成初始化以后，再把Flash中的第二阶段bootloader，也就是Uboot加载到DDR中开始运行。
4. Uboot才是主要的bootloader，对系统执行更为全面的初始化设置，并加载Kernel和Rootfs镜像到DDR中，并且启动Linux Kernel的运行。至此系统就完整的启动起来了。

在Romloader和Uboot之间额外增加一个SPL的阶段，主要是因为君正芯片内部的SRAM空间太小，而Uboot image太大，SRAM容纳不下，所以需要一个中间的bootloader把更大空间的DDR初始化配置好，然后把Uboot镜像加载到DDR里面运行。后续的Kernel、Rootfs等镜像都是会被加载到DDR中运行的。


## 君正IPC Secure Boot流程中所使用的算法


在君正IPC方案所提供的Secure Boot实现中，主要用到了两种算法：

- RSA2048：非对称加解密算法。主要用于对镜像内容的SHA256摘要信息进行加解密以后再匹配比较验签。
- SHA256：哈希算法。用于对SPL Image以及RSA2048算法的公钥进行摘要运算。

因为SHA256哈希算法没有密钥信息需要存储，因此实际上存储到君正芯片Efuse内部的密钥相关信息只有RSA2048算法的公钥摘要信息。


## Flash和Efuse中信息结构


### 芯片Efuse中的信息结构


君正芯片内部的EFuse信息（也就是OTP）中，针对Secure Boot实现主要包含两部分内容：otp4的Secure boot enable配置信息，以及otp9的RSA算法公钥的SHA256摘要信息。


在芯片上电启动时，Rom loader会去检查ota4中写入的Secure boot enable配置信息，来决定是以Normal boot方式启动还是以Secure Boot方式启动。


而如上所述，整个Secure Boot实现中因为只用到了RSA2048和SHA256算法，SHA256没有密钥信息需要存储，因此OTP中就只需要保存RSA公钥相关的信息。


![image.png](/images/blog/君正IPC平台的Secure-Boot流程实现解析-2.png)


### Flash中与Secure Boot相关的信息结构


下图为启用Secure Boot模式的情况下，利用君正提供的PC端脚本所生成的SPL Image对应的Flash结构。其重点在于：

- SPL Image本身保存在Flash 0x800开始的位置，SPL Image并没有进行加密。
- Flash 0x300-0x400之间保存有RSA算法的公钥。
- PC端脚本在基于原始的SPL Image生成Secure Boot镜像文件时，对SPL Image内容进行SHA256摘要运算，并把摘要运算的结果再使用RSA算法的私钥进行加密。Flash 0x200-0x300之间就用于保存SPL Image的这个加密摘要，后续用于对SPL Image验签。

![image.png](/images/blog/君正IPC平台的Secure-Boot流程实现解析-3.png)


## 君正IPC平台的Secure Boot启动流程


基于以上信息，下面总结出君正IPC平台上电启动后，Rom Loader在Secue Boot模式下对SPL Image进行校验的启动流程。下图是其启动的完整流程图：


![image.png](/images/blog/君正IPC平台的Secure-Boot流程实现解析-4.png)


以上流程可以分为两个阶段：RSA公钥验证，SPL Image摘要签名验证。


### RSA公钥验证


Rom Loader在上电启动时，会检测OTP4中写入的Secure Boot配置信息，在Secure Boot启动模式下，读出OTP9中在生产阶段所烧写的RSA公钥的SHA256摘要信息。


然后Rom Loader再从Flash的0x300-0x400位置读取RSA公钥，对其进行SHA256运算，把这个运算结果与OTP9中读取出来公钥SHA256摘要进行比对。


以上比对一致的情况下，证明OTA烧写和Flash中的公钥是一致的，继续执行启动过程，否则启动失败。


### SPL Image摘要签名验证


接下来，Rom Loader会对SPL Image原始镜像的内容进行SHA256签名运算，得到Rom Loader自己的运算结果。


然后再从Flash的0x200-0x300读取经过PC端脚本使用RSA私钥加密后的摘要，使用Flash中读取的RSA公钥对其解密，得到解密后的SHA256摘要。


对以上两个摘要进行匹配比较，如果一致就表示SPL Image的验签通过，这个SPL Image确实是由硬件官方发布的镜像（因为只有官方才有对镜像文件进行加密签名的RSA私钥）。


## 总结


总体而言，相比于Novatek IPC平台所实现的较为完善和全面的Secure Boot功能，Ingenic平台的Secure Boot功能就要简单很多，要实现完整的Secure Boot需要下游开发者做不少事情。


相比于Novatek平台在其SDK中已经标配了对启动流程中一级bootloader、Uboot、Kernel镜像的全访问保护，君正平台的Secure Boot默认情况下只对SPL Image进行保护。当然，因为Secure Boot模式下，君正芯片内部的Efuse中已经保存了RSA验签密钥公钥相关的信息，所以对于下游开发者而言，完全可以基于相同的逻辑自行实现对Uboot、Kernel镜像的验签保护。只不过这个过程君正方案的SDK本身没有默认提供，需要开发者自行实现罢了。


此外，君正的原始Secure Boot的实现中，Efuse中只保存了RSA公钥，对镜像文件的内容只提供验签的保护，没有提供加密保护。这方面相比于Novatek平台而言，其安全程度也是不如的，Novatek平台会在验签的同时会对镜像文件的内容进行加密。


不过好在君正开放了Efuse中的部分存储空间给下游开发者使用，下游开发者可以利用这部分Efuse的存储空间进行自定义的Secure Boot开发，包括额外针对Uboot、Kernel等镜像增加加密的功能。


## 参考资料

- 君正Secure Boot使用说明
- [君正Zeratul开发(2)——uboot启动分析_君正t41 sdk包-CSDN博客](https://blog.csdn.net/li_wen01/article/details/115245258)
