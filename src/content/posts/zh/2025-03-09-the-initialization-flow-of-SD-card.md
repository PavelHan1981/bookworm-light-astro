---
title: "SD卡插入检测后的完整初始化流程解析"
slug: "2025-03-09-the-initialization-flow-of-SD-card"
description: "本文对SD卡插入后，在SD主控和卡之间的完整初始化流程进行完整的分析和解释：对于一个支持SD卡的消费类电子产品而言，当SD卡插入该产品的SD卡插槽以后，SD主控与SD卡之间的完整初始化通信流程，如何通过这个初始化的设置流程做好进一步读写SD卡的准备。
• "
date: 2025-03-09T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["SD"]
draft: false
---


本文对SD卡插入后，在SD主控和卡之间的完整初始化流程进行完整的分析和解释：对于一个支持SD卡的消费类电子产品而言，当SD卡插入该产品的SD卡插槽以后，SD主控与SD卡之间的完整初始化通信流程，如何通过这个初始化的设置流程做好进一步读写SD卡的准备。

- **本文仅关注SD卡的SD模式，不考虑SPI模式。**

从SD卡插入卡槽，到最后主控对SD卡进行数据内容的读写之间，主要存在以下五个阶段。后续部分对这五个阶段进行详细的解释说明。

- 物理检测与上电阶段
- 卡识别初始化阶段（识别模式）
- 卡识别配置阶段
- 数据传输模式准备
- 数据通信阶段

对于本文的理解，需要首先建立SD卡与其主控之间通过CMD引脚在两者之间进行的CMD及其响应消息通信数据的理解，这方面可以参考另外一篇笔记：[[[SD卡的CMD命令及其响应消息数据结构]]](https://www.pavelhan.tech/article/2025-03-02-the-summary-of-SD-command)。


下图是从SD协议文档中对于UHS-I类型的SD卡进行初始化设置的整体流程图，本文的叙述框架就是对这个流程图的具体执行过程进行详细的总结和说明。


![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-1.png)


## 1. 物理检测与上电阶段


初始未插卡的状态下，由SD主控进行控制，SD引脚上的电源引脚未使能，CLK无时钟输出。在使用CD/DAT3引脚检测卡插入状态的设计中，此时CD引脚上拉为High电平。


当SD卡插入以后，CD引脚拉低触发SD卡的检测中断。

- 此时主控检测到SD卡插入后，控制SD引脚的电源引脚使能，给SD卡供电（默认给SD卡提供3.3V电源供应）。
- 同时，SD引脚开始输出慢速时钟用于对卡访问进行初始化，SD协议要求初始时钟<400kHz。

至此，SD主控控制SD引脚的电源引脚向SD卡提供3.3V电源供应，控制CLK引脚开始输出不高于400KHz的慢速时钟。


## 2. 卡识别初始化阶段（识别模式）


### CMD0


在该阶段，等到CLK引脚向外输出到第75个时钟开始，SD主控向SD卡发出一个CMD0命令。


参考以上CMD数据结构的理解，CMD0的命令索引为0，参数Arg部分的32bit全部为0，CRC7校验计算出来的校验值为0x97。当SD卡收到CMD0消息以后，SD卡会执行内部的复位操作并进入idle状态。同时根据SD规范的定义，SD卡收到CMD0消息以后需要在CMD引脚上回复一个R1消息用于返回SD卡当前的状态。


### CMD8


接下来SD主控向SD卡发出一个CMD8指令用于查询SD卡所支持的协议版本以及协商双方共同支持的电压情况。


CMD8的命令结构中，命令索引为8，命令参数的32个bit按照以下结构分为三个部分，其中Check pattern可以是任意的8bit数据（一般为0xAA），SD卡发回的响应消息中会包含相同的Check pattern字节；Reserved Bits为预留位，必须全部设置为0；唯一要关注的就是双方协商电压支持情况的Voltage Supplied部分，其中有两个bit分别用于表示SD主控是否支持3.3V和1.8V电压，支持为1，不支持为0。对于SD主控而言，支持3.3V是必选项，而对于1.8V的支持则是可选的。


![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-2.png)


当SD卡收到以上的CMD8命令以后，SD卡会响应一个R7数据结构。R7也是一个48bit的数据结构，专门用于响应主控发出CMD8指令。R7数据结构的细节如下图所示。其中bit\[15:8\]之间的Check pattern与其接收到的CMD8指令的Check pattern必须相同，否则SD主控会认为通信链路出现错误；bit\[19:16]则表示双方都支持的电压（3.3V或者3.3V+1.8V）。**如果卡不支持SD主控CMD8命令中所提供的电压，那么SD卡不会发出响应消息。**


![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-3.png)


### ACMD41


ACMD41的具体通信流程上，首先SD主控向SD卡发出一个CMD55，请求SD卡进入APP_CMD状态等待接收ACMD命令，SD卡收到后返回一个R1响应消息，用其中的APP_CMD状态位表示自己已经进入应用模式，等待接收ACMD命令；SD主控接着向SD卡发出一个ACMD41命令，SD卡收到以后会回一个R3响应消息。


ACMD41命令数据的结构如下图所示。此处要关注的主要是，对于可支持SDHC或者SDXC（目前绝大多数的SD主控都可以支持）HCS bit设置为1，S18R则用于指定是否需要切换到1.8V电压。



![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-4.png)


ACMD41命令的R3响应消息的结构如下。R3结构中使用CCS和UHS-II两个bit来表示自己的容量类别以及是否是UHS-II的卡，此外通过S18A bit来表示自己是否已经做好准备去切换到1.8V，SD主控收到这个S18A bit以后就可以决定是否切换到1.8V电压还是继续维持使用3.3V电压。

- 如果需要切换到1.8V电压，那么在ACMD41命令序列执行完成后，SD主控再通过CMD11-R1命令序列来执行这个电压切换的动作。如果继续维持3.3V，就不需要执行这个CMD11-R1的序列了。

![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-5.png)


此外还要关注R3的Busy Status，对于ACMD41的执行而言，必须要等待R3的Busy Status为0，才认为当前的初始化阶段完成。否则，SD主控需要重新执行CMD55-R1-ACMD41-R3的完整流程，重新检测Busy Status是否为1。直到这个Busy Status为0为止。


以上判断逻辑的C代码如下：


```c
uint32_t ocr = 0;
do {
    // 发送CMD55
    send_command(CMD55, 0x0000);
    if (response.app_cmd != 1) break; // 检查R1响应中的APP_CMD位

    // 发送ACMD41（即CMD41带HCS和电压参数）
    send_command(CMD41, 0x40100000); // HCS=1, Voltages=3.3V
    ocr = get_ocr_from_r3();
} while (ocr & 0x80000000); // 检查bit31（Busy标志）
```


等到R3消息返回的busy status bit为0后，卡识别初始化的阶段就完成了。


## 3. 卡识别配置阶段


这一步通过两个命令序列CMD2和CMD3分别来实现读取128bit卡标识和设置数据总线宽度的功能。


### CMD2：读取卡标识


CMD2命令用于请求SD卡的CID（Card Identification Register）寄存器，每个SD卡都有独一无二的128bit CID，其中包含了制造商、产品号等信息。注意，CID是SD卡内部的一个只读寄存器，由厂商在生产SD卡时烧写。应用中一个主控同时管理多张卡时，CID是用于识别不同类型卡的核心标识。


SD主控向SD卡发出的CMD2数据结构中，Command Index为2，参数Argument全部为0。SD卡收到CMD2命令结构后，向SD主控返回一个R2的响应消息，其结构如下图所示。


![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-6.png)


其中包含的CID和CSD寄存器的信息如下图。注意以下结构是128bit，在填充到R2消息响应结构中时，把最后的一个bit固定设置为1作为end bit。


![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-7.png)


### CMD3：读取RCA地址


接下来通过CMD3命令获取SD卡的RCA地址以支持多卡操作。CMD3的全称是SEND_RELATIVE_ADDR，其主要功能是由SD主控给SD卡分配一个相对地址（RCA），这个地址（而不是长达128bit的CID信息）在后续的数据通信中会被用来识别和区分不同的卡，这一点在多卡配置中极其重要，每个SD卡在初始化过程中必须被分配一个唯一的RCA，这样主控可以通过这个RCA地址发送命令给特定的卡，而不会与其他卡片冲突。

- 需要注意，CMD3命令序列中设置的RCA，并不是由SD主控生成的，而是由卡自动生成的。

CMD3的命令结构中，Command Index为0x3，Argument的32bit为全0（RCA不由主控生成）。SD卡收到CMD3以后，会发回一个R6的响应消息，其中包含有卡自己生成的RCA和卡当前的状态信息。R6响应消息的结构如下图所示。



![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-8.png)


可以看到R6的消息结构体中包含了两个部分：卡自己生成的16bit RCA，以及卡当前的状态信息。其中由卡生成的16位RCA地址的取值范围0x0001~0x7FFF，0x0000保留给初始化未完成卡，如果SD卡检测到两个卡的RCA冲突，需要对卡重新发送一次CMD3命令。


## 4.SD卡数据传输的准备阶段


在该阶段中，通过多项设置，设置选定的卡为传输状态，设置总线宽度、传输块大小，最后切换卡到高速模式，正式进入数据传输状态。


### CMD7：设置指定卡为传输状态


CMD7命令用于从SD总线上选择一个卡，并让其进入数据传输状态（Transfer State）。同一时间SD总线上只能有一个卡处于传输状态。


CMD7命令结构中，Command Index为0x07，32bit的Argument中高16位为要选定的SD卡的RCA地址（在前面的CMD3阶段已经读取到，如果为0表示所有的卡全部释放为非传输状态），低16bit为0。SD卡收到CMD7命令以后，切换状态到数据传输状态Transfer State，然后向SD主控返回R1响应消息，其中包含有自己的状态信息。


### ACMD6：配置通信状态的总线宽度


ACMD6指令用于设置数据传输过程中所使用的数据总线宽度，可选1bit和4bit，一般选择4bit。ACMD6指令的通信流程由ACMD命令的规范定义，包含CMD55-R1-ACMD6-R1的完整序列。


CMD55和R1的序列在前面已有描述，不再赘述。下图是ACMD6命令的数据结构，可以看到ACMD6的Command Index为6，32位Argument的高30位为填充位，强制为0，最低的两位为总线宽度设置位，0b00表示1bit数据总线，0b10表示4bit数据总线。SD卡收到ACMD6命令后，会返回R1响应消息，其中包含有自己的当前状态。

- SD卡的初始总线宽度默认为1bit，所以后续数据通信要使用4bit的话，此处一定要通过ACMD指令设置为4bit。

![image.png](/images/blog/SD卡插入检测后的完整初始化流程解析-9.png)


设置位4bit数据总线宽度以后，可以通过CMD13-R2命令序列读取SD卡的SCR寄存器，验证4bit数据宽度是否设置OK。


### CMD6：切换为高速模式


因为SD协议的CMD6命令（Switch Function Command）相对比较复杂，所以之前使用单独的一片笔记[[SD通信命令协议解析之CMD6]]对CMD6的执行流程进行了整理。


按照SD卡的初始化执行流程，接下来使用CMD6指令对其驱动强度、总线时钟速度等参数（function mode）进行设置。**以上CMD6流程执行完成后，SD总线的时钟就切换为高速模式（如25MHz，50MHz等）开始运行。**


除了CMD6以外，对于1.8V供电的UHS50和UHS104高速卡而言，还需要执行CMD19指令发送一个64字节的tuning block用于调整采样点。


至此，SD卡就已经完成了初始化设置的准备，进入了高速时钟和通信模式，做好了进行高速数据通信的准备了。


## 参考资料

- SD Specification Part 1 Physical Layer Simplified Specification Version 6.00
- [SD卡bus协议详解——SDIO协议入门与实践（二）_sd卡协议-CSDN博客](https://blog.csdn.net/weixin_43083491/article/details/142951677)
- [Secure Digital Card Info](https://chlazza.nfshost.com/sdcardinfo.html)
