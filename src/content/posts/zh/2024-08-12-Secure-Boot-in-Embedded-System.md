---
title: "嵌入式产品SecureBoot的启动流程总结"
slug: "2024-08-12-Secure-Boot-in-Embedded-System"
description: "本文档对嵌入式系统中所使用的Secure Boot机制的作用，背后的工作流程和软硬件设计原理，以及完整的嵌入式系统Secure Boot启动流程进行了总结和学习。"
date: 2024-08-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["嵌入式"]
tags: ["加密技术","嵌入式"]
draft: false
---


Secure Boot在嵌入式产品中的运用，主要是为了确保在嵌入式硬件产品上所运行的固件必须这个硬件生产商所信任的固件文件，简单的讲，就是说这个嵌入式硬件上运行的软件镜像必须是由其生产厂商所正式发布的镜像文件，禁止其他第三方固件程序在这个硬件上的运行，以此来对硬件产品提供更高强度的安全和隐私保护。


## 典型的嵌入式系统FW的启动流程


以下是一个比较典型的嵌入式系统的启动流程：


![image.png](/images/blog/嵌入式产品SecureBoot的启动流程总结-1.png)

- 嵌入式系统的SOC上电后，首先会启动运行Boot Rom Loader。Boot Rom Loader是固化在芯片内部的一小段程序，在上电后首先运行这段程序，根据SOC芯片POC（Power On Configuration）引脚的配置情况选择启动方式，即下一步的启动镜像文件保存在什么地方，例如Nor flash，SD卡，UART，USB等；然后对POC所指定的启动媒介进行初始化，并从中读取一个很小的初级bootloader镜像（First stage bootloader，即FSBL）到芯片内部的SRAM中，然后把控制权交给First stage bootloader。
    - Rom Loader运行的时候，DDR还没有被初始化，所以这一步只能把First stage bootloader镜像读入芯片内部的SRAM中执行。而因为SRAM很小，所以这个First stage bootloader image也会非常小，功能很有限，这就是要把外存中的bootloader分为first stage和second stage的原因。
- First stage bootloader被读入芯片内部的SRAM中后开始运行，此时对系统做更充分的初始化，例如对DDR和NAND等进行初始化，一切准备就绪以后就把Second stage bootloader加载到DDR中执行。DDR的空间比较大，所以Second Stage bootloader就是全功能的bootloader，例如嵌入式系统中常用的Uboot。
- Second Stage bootloader的主要作用除了在bootloer阶段提供更为全面和强大的功能之外，主要的作用就是加载OS kernel和文件系统，然后启动操作系统的运行。
- 最后一步就是Second Stage bootloader把控制权交给OS kernel，然后整个操作系统（例如Linux系统）就正式完整的启动起来了。

以上就是一个比较典型的嵌入式系统的启动流程。实际产品中，会根据具体情况简化或者复杂化。

- 例如有些芯片里面直接内包DDR，那么就完全可以在ROM Loader阶段把DDR初始化好，然后直接把全功能的bootloader加载到DDR中运行，省掉了First Stage bootloader，也加快了系统的启动流程。
- 例如有些芯片内部是异构多处理器，包含有多个不同规格的处理器，运行不同的操作系统，那么这个启动过程就会更加复杂，需要协调和同步好各个处理器上的启动流程。

## 在嵌入式系统启动流程中实现Secure Boot的思路


**基于以上对嵌入式系统启动流程的理解，如果要保证这个嵌入式硬件上所运行的所有软件都是由硬件生产商所发布的软件，就必须要保证整个启动链条上的所有镜像文件全部由加密签名进行保护才行。**

- 这个启动链条上所要保护的启动镜像包括first stage bootloader，second stage bootloader，以及后续的OS Kernel和文件系统镜像等，不包含固化在芯片内部的Boot Rom Loder。

这是因为：

- 如果要保证OS kernel和文件系统部分必须是由硬件厂商所发布的正式镜像文件，就必须要在second stage bootloader阶段运行的时候，加载OS kernel和文件系统image到DDR中之后，对其加载的内容进行一定流程的检验，检验通过后才能正常启动。
- 以上检验OS kernel文件系统的流程功能必须要在second stage bootloader的运行中执行。而如果攻击者把second stage bootloader image替换成自己镜像文件，去掉这个校验环节，就可以把自己的OS kernel和文件系统镜像替换进去正常启动起来。因此也必须确保second stage bootloader部分的镜像也是由硬件厂商所发布的镜像文件才行，而确保的机制，则要依赖于First stage bootloader在加载Second stage bootloader image到DDR中开始运行时，做同样的校验，只有硬件厂商正式发布的second stage bootloader才能通过First stage bootloader的校验。
- 同样的道理，First stage bootloader部分的image也必须要确保是硬件厂商所发布的镜像文件，这个校验的流程则是在芯片内部的Rom Loader中执行。
- 以上完整流程要做到无懈可击，就需要保证整个启动链路的所有环节的镜像都进行校验，这就是Secure Boot机制要实现安全的保护一定要形成一个完整的链路才行。

以上的完整流程，会追根溯源到Rom loader阶段。而Rom Loader是固化在芯片内部的，因此首先就需要芯片在其内部设计中包含了Secure Boot机制才行。


因此基于以上分析，对于一个嵌入式SOC平台而言，要能够实现完整的Secure Boot保护，就至少需要以下两个条件缺一不可：

- 硬件SOC本身的设计能够在ROM Loder阶段支持Secure Boot，即RomLoader需要有加载镜像的验签机制和验签密钥。
- 硬件SOC方案的SDK能够支持生成各个阶段的Secure Boot签名镜像文件，以及能够支持对后一阶段镜像验签和校验的功能。

所以，能否支持Secure boot功能首先取决于系统SOC本身的硬件设计规格和SDK的设计与实现。如下为君正T23N的内部规格，明确表示可以支持Secure Boot功能。


![1723439804940.png](/images/blog/嵌入式产品SecureBoot的启动流程总结-2.png)


**从硬件的角度上简单考虑，Secure Boot的实现实际上就是一个校验的算法以及在生产产测阶段写入的一个密钥。**

- 对于硬件的生产而言，需要把这个Secure Boot的验签密钥在产测阶段写入到系统SOC中。
- 而同时各个阶段的生产或者OTA镜像文件，则需要同样基于这个密钥生成签名写入到镜像中，以支持后续启动过程中对镜像的验签操作。

## 嵌入式系统的Secure Boot启动流程


其实如果理解了以上所描述的在嵌入式系统中实现Secure Boot的思路，那么在这类系统中进行Secure Boot的启动流程也就呼之欲出了。


![1723441359194.png](/images/blog/嵌入式产品SecureBoot的启动流程总结-3.png)

- 第一步当然还是在上电后运行ROM Loder，ROM Loder负责加载First Satge Bootloader。不过在加载完成后，ROM Loader需要配合产测阶段写入的密钥，对加载的First Satge Bootloader进行验签，验签通过后First Satge Bootloader才能正常运行，并加载Second Stage Bootloader Image。
- 同样的，First Satge Bootloader加载Second Stage Bootloader镜像文件后，也需要配合之前写入的验签密钥对Second Stage Bootloader镜像进行验签，验签通过后Second Stage Bootloader开始执行，并且加载OS Kernel和文件系统。
- 相同的逻辑，Second Stage Bootloader同样对加载后的OS Kernel和文件系统镜像进行验签操作，验证通过后才能正常启动Kernel的运行。

因此，Secure Boot就是通过以上的流程保护了在这个嵌入式硬件上所能够正常启动的镜像文件，必须是由硬件生产商所提供的正式版本镜像文件。


## 参考文档

- [Boot Stages in an Embedded System | by M. Waseem Abbas | Medium](https://mwaseemabbas.medium.com/boot-stages-in-an-embedded-system-a51d1b7e2b1b)
- [Secure boot in Embedded Systems. Secure boot is a critical feature in… | by M. Waseem Abbas | Medium](https://mwaseemabbas.medium.com/secure-boot-in-embedded-systems-9b72754f4c16)
