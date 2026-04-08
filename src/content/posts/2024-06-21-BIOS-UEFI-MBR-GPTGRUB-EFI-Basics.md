---
title: "BIOS/UEFI/MBR/GPT/GRUB/EFI等概念的总结"
slug: "2024-06-21-BIOS-UEFI-MBR-GPTGRUB-EFI-Basics"
description: "本文总结了与PC操作系统启动流程相关的基本概念，对PC的启动流程、文件系统分区、多系统引导等相关的技术概念建立全面的理解。"
date: 2024-06-21T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Tech"]
tags: ["硬件","嵌入式","Linux"]
draft: false
---


## BIOS与UEFI


BIOS：Basic Input Output System。


UEFI：Unified Extensible Firmware Interface。


简单总结起来，无论是BIOS还是UEFI，本质上就是计算机的bootloader，而且这个bootloader还不是放在硬盘上的，而是固化在计算机主板的CMOS或者EEPROM存储器上：这是当然的道理，否则使用一块新的硬盘或者对之前的硬盘格式化以后，bootloader就不存在了，计算机也就没法正常启动了，因此BIOS和UEFI这两个固件一定是保存在主板上的其他非易失性存储器中，这样的话在硬盘上无论如何折腾，至少计算机是能够基本自检和正常启动的。

- **从这一点上，BIOS/UEFI就类似于各种嵌入式处理器上的Rom Loader，而不是Uboot。**Rom loader是固化在嵌入式处理器芯片内部的，芯片上电以后首先执行的就是Rom Loader的程序，Rom Loader负责把烧写在Flash中的Uboot加载到RAM中运行。

BIOS和UEFI实际上就是计算机上电以后执行的第一个程序，其主要的功能不外乎：

- CPU本身的初始化中断向量的设置；
- 对各种硬件外设进行的初始化；
- 系统自检，跟据自检结果输出提示信息以及决定是否继续启动系统；
- 加载并操作系统镜像或者第二阶段的Bootloader。

实际上，BIOS是自从PC诞生以后就成为默认的Bootloader，直到2010年以后逐渐被UEFI所替代。不过因为BIOS的使用时间很长，BIOS这个名字也已经深入人心，所以很多时候我们仍然使用BIOS来表示计算机的bootloader。


UEFI最终能够替代BIOS无非是因为BIOS的设计随着时代的发展已经跟不上潮流：

- BIOS最高只能支持2TB的硬盘，而UEFI理论最高则能够支持到ZB级别。
- UEFI的启动速度更快，原因是BIOS必须运行在CPU的16位模式下，而UEFI可以工作在CPU的32位或者64位工作模式下，执行速度更快。
- BIOS最高只有1MB的程序运行空间，所以BIOS的功能就没法做的非常复杂和强大。例如BIOS无法支持UEFI所能够支持的GUI图形界面和鼠标操作。
- UEFI能够支持安全启动和网络启动，这两点都是BIOS所不具备的。

正因为以上原因，BIOS在2010年后开始逐渐被UEFI所替代，但是UEFI的功能与BIOS实际上是大同小异的。


另外一点值得注意的是，UEFI的设计上提供了对BIOS的兼容性，所以UEFI包含一个legacy的模式，如果设置UEFI使用Legacy模式的话，那么其执行流程就跟BIOS没有区别了。


![Untitled.png](/images/blog/BIOS-UEFI-MBR-GPT-GRUB-EFI等概念的总结-1.png)


## MBR与GPT


MBR：Master Boot Record，硬盘主引导记录分区表


GPT：GUID Partition Table，全局唯一标识分区表


MBR和GPT的概念与硬盘的分区结构息息相关。无论是UEFI还是BIOS在启动的过程中，最终总是需要初始化硬盘以后，读取硬盘的分区结构，了解到硬盘是如何分区的，各个分区的大小和位置，操作系统启动分区在哪个地方。那么这样就要求硬盘需要按照BIOS或者UEFI的要求，把硬盘的分区信息按照BIOS/UEFI能够解析的结构放在固定的位置，这样BIOS/UEFI在启动的过程中才能顺利的找到硬盘分区信息，解析后加载操作系统正确的执行。


BIOS和UEFI这两种类型的bootloader，都分别定义了自己的硬盘分区信息结构，其中BIOS定义的硬盘分区结构就是MBR，而UEFI的规范中则定义了GPT结构。


### MBR：与BIOS配合使用


MBR分区信息模式，会在硬盘的开头存放一个固定大小的MBR分区，这个分区就是硬盘主引导记录，其中定义了整个硬盘的分区结构和引导分区的位置。不过MBR分区规范中最高只能支持2TB大小的硬盘（因为BIOS只支持MBR分区模式，所以这就是为什么BIOS最大只能支持2TB硬盘的原因），并且最多只支持4个主分区或者3个主分区+1个扩展分区，如果需要更多的分区，可以在扩展分区中再创建逻辑分区。


在使用MBR方式进行硬盘分区管理的情况下，会使用硬盘0号扇区保存MBR信息。整个0号扇区总共512字节，分为引导程序、磁盘签名、硬盘分区表、结束标志四个部分。


![Untitled.png](/images/blog/BIOS-UEFI-MBR-GPT-GRUB-EFI等概念的总结-2.png)

- 引导程序，占MBR分区的前面440个字节，负责加载并启动操作系统。
- 磁盘签名，4个字节，Windows格式化硬盘后写入的标签信息。
- 分区表，64个字节，保存了这个硬盘的分区信息。
- 结束标志，MBR分区的最后两个字节，固定位0x55，0xAA。

对于BIOS启动模式而已，BIOS程序负责加载硬盘0号扇区上的MBR记录，然后把CPU的控制权交给MBR引导代码，在MBR的引导代码中对分区表信息进行读取和解析，然后从引导分区读取操作系统镜像，并启动操作系统的运行。


### GPT：与UEFI配合使用


GPT分区模式则由UEFI的规范所定义的硬盘分区结构。不同于BIOS所使用的MBR分区结构，GPT分区结构不限制分区的数量和分区大小，只不过Windows系统限制最大只能支持128个GPT分区。


相比于MBR分区结构只使用0号扇区存储整个分区信息，GPT的分区结构要更复杂一些：


![Untitled.png](/images/blog/BIOS-UEFI-MBR-GPT-GRUB-EFI等概念的总结-3.png)

- 保护MBR。GPT分区结构的开头第一个扇区是保护性MBR，用于跟传统的MBR分区结构兼容。
- GPT头。其中包含了签名信息，GPT头结构的大小，备份GPT头所在的逻辑块地址，GPT分区表所在的逻辑块地址和大小，分区的数量，每个分区表条目的大小，CRC校验值等信息。UEFI对GPT头结构信息读取和解析后即可找到GPT分区表所在的位置并解析分区表的信息。
- GPT分区表。这部分是GPT分区结构的核心部分，定义整个硬盘中的GPT分区的分布情况，各个分区的类型/GUID，分区的物理地址和大小，以及属性。
- 用户分区。这部分就是各个分区所占据的实际存储空间，分区的位置与大小在分区表中定义。
- 备份GPT分区表和GPT头。这部分实际上是GPT头和GPT分区表内容的备份，以防止GPT头和分区表损坏后系统无非恢复。这一点是比MBR更安全的地方，MBR是没有备份机制的，所以MBR的第一扇区主引导记录一旦被破环就无法恢复正常启动了。

**值得注意的是，为了与UEFI配合起来使用，在GPT分区结构的用户分区中，必须包含一个实际上是FAT文件系统的ESP分区（EFI System Partition），这个分区中保存了真正用于加载和引导操作系统的二级bootloader文件**。UEFI在启动运行的过程中，会读取和解析硬盘的GPT头以及GPT分区表，从而可以正确的识别这个ESP分区。UEFI通过分区表中的GUID来判断某个分区是否是ESP分区，ESP分区的GUID固定是：C12A7328-F81F-11D2-BA4B-00A0C93EC93B。当识别到ESP分区后，UEFI按照FAT类型文件系统进行加载，并读取其中的二级bootloader文件，例如\BOOT\BOOTX64.EFI，后续操作系统的引导过程由这个二级bootloader文件来负责。


## Grub


如果独立安装Linux系统，或者在Windows系统的基础上再进一步安装Linux系统，并且实现双系统启动的话，在安装Linux系统的最后进行Grub的安装就是不可避免的了。


那么Grub到底在MBR和GPT的基础上做了什么事情，从而能够实现双系统甚至多系统的启动？


### BIOS+MBR结构


如前所述，在BIOS+MBR结构下，BIOS在启动运行的过程中，会把硬盘0号扇区的前446字节所包含的bootloader文件加载到内存中开始执行。所以这个446字节的bootloader就负责加载操作系统的镜像，在安装Windows系统以后，0号扇区的前446字节会被写入ntldr，由ntldr来引导和启动Windows系统；而如果安装的是Linux，使用Grub2作为bootloader的话，那么在安装Linux系统的最后阶段，则会把Grub2的stage 1 binary写入0号扇区的前446字节。


当然这个446字节的空间太小了，肯定不可能把Grub的所有功能全部包含进来，因此实际上Grub的启动分成了两个阶段：

- Stage1：写入0号扇区的446字节是第一阶段，其作用就是用来找到和加载真正的Grub bootloader主程序，也就是位于操作系统启动分区的Grub2第二阶段的程序。而且受限于446字节的大小，这个阶段的stage1 binary是没法包含文件系统功能的，所以Grub2第二阶段的位置是直接写死在MBR的446字节程序中的。Grub2 Stage1的镜像对应于boot.img，安装时写入硬盘0号扇区.
- Stage2：被加载Stage1加载后，解析/boot/grub2/grub.cfg配置文件，跟据该配置文件的定义，显示多系统的启动选择界面，或者直接加载Linux kernel和文件系统，然后就由Kernel来启动后续的过程。Grub2 Stage2的镜像对应于core.img，位置为/boot/grub2/i386-pc目录下。

![Untitled.png](/images/blog/BIOS-UEFI-MBR-GPT-GRUB-EFI等概念的总结-4.png)


### UEFI+GPT结构


如以上总结GPT分区结构部分的内容，UEFI firmware启动以后，会对GPT的分区结构进行解析，跟据专门的GUID找到一个特殊的ESP分区，这个分区类型实际上是一个FAT32文件系统，默认的系统启动器就是这个分区下的/efi/boot/bootx64.efi文件(32位的话是bootia32.efi)。


那么在UEFI+GPT分区结构的情况下，在安装Grub2到硬盘上的时候，实际上会在ESP分区下创建一个以操作系统名称命名的子目录（例如下面的ubuntu），在其中放入Grub2对应的efi文件和配置文件。同时会把Grub2的efi文件拷贝到/EFI/Boot目录下，并且重命名位bootx64.efi。这样下次UEFI启动的时候，找到ESP分区就从其Boot目录下找到bootx64.efi文件并运行以加载操作系统镜像或者提供多系统选择的界面，由用户选择需要启动的系统。


```javascript
pavelhan@ThinkPad-X260-9fe388ac:/dev$ sudo ls /mnt/EFI/Boot -l
总计 1872
-rwx------ 1 root root 960472  4月 18 23:15 bootx64.efi
-rwx------ 1 root root  88296  4月 18 23:15 fbx64.efi
-rwx------ 1 root root 860824  4月 18 23:15 mmx64.efi
pavelhan@ThinkPad-X260-9fe388ac:/dev$ sudo ls /mnt/EFI/ubuntu -l
总计 4332
-rwx------ 1 root root     108  4月 18 23:15 BOOTX64.CSV
drwx------ 5 root root    4096  4月 23 08:53 grub
-rwx------ 1 root root     105  4月 18 23:15 grub.cfg
-rwx------ 1 root root 2594696  4月 18 23:15 grubx64.efi
-rwx------ 1 root root  860824  4月 18 23:15 mmx64.efi
-rwx------ 1 root root  960472  4月 18 23:15 shimx64.efi
```

- 如上所述，实际上Grub2在ESP分区中的安装以及启动运行比以上更复杂一些。Grub2在ESP分区的/EFI/ubuntu下拷贝了多个efi文件，并且真正替换bootx64.efi文件的时其中的shimx64.efi。所以在安装Grub2以后，实际上UEFI最终首先会找到EFI/Boot下的bootx64.efi文件（实际上也就是shimx64.efi）启动运行，然后再链式加载运行EFI/ubuntu下面的grubx64.efi。以上过程涉及到Secure Boot的签名运算和安全校验的机制，启动过程中先运行由Microsoft签名shimx64.efi，再由shimx64.efi加载运行真正的grub镜像grubx64.efi文件。

## 参考资料

- [BIOS与UEFI介绍与使用-腾讯云开发者社区-腾讯云 (tencent.com)](https://cloud.tencent.com/developer/article/2128539)
- [详解MBR分区结构以及GPT分区结构-CSDN博客](https://blog.csdn.net/T146lLa128XX0x/article/details/81199488)
- [BIOS 与 UEFI 引导流程 - LARRY1024 - 博客园 (cnblogs.com)](https://www.cnblogs.com/larry1024/p/17645208.html)
- [Linux中GRUBX64.EFI和SHIMX64.EFI有什么区别？_ITPUB博客](https://blog.itpub.net/69955379/viewspace-2895985/)
