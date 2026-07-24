---
title: "SD卡的CMD命令及其响应消息数据结构"
slug: "2025-03-02-the-summary-of-SD-command"
description: "众所周知，在SD卡与其控制器之间的SD接口上，有一个专门的CMD引脚。CMD与CLK引脚配合，在SD卡和其主控之间进行控制和配置命令的传输。每次命令模式的通信，SD主控向卡在CMD引脚上发出一个CMD命令结构，根据CMD命令的不同由SD卡给出该命令的答复消息Rx。"
date: 2025-03-02T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["SD"]
draft: false
---


众所周知，在SD卡与其控制器之间的SD接口上，有一个专门的CMD引脚。CMD与CLK引脚配合，在SD卡和其主控之间进行控制和配置命令的传输。每次命令模式的通信，SD主控向卡在CMD引脚上发出一个CMD命令结构，根据CMD命令的不同由SD卡给出该命令的答复消息Rx。

- 当然对于CMD6和CMD16等少数命令而言，除了在CMD引脚上，SD卡会给出响应消息以外，在DAT总线上也会有一些通信活动。

## CMD命令结构


所有Native模式（即非SPI模式）的SD卡命令都采用相同的48位（6字节）固定长度的传输结构：


![image.png](/images/blog/SD卡的CMD命令及其响应消息数据结构-1.png)

- 起始位（Start Bit）：固定为0（低电平），占1个CLK周期。
- CMD命令索引（Command Index）：占据6个bit的二进制值，用于定义命令类型（如CMD0=0x00, CMD8=0x08），其编码范围为0-63之间。
- 参数（Argument）：固定占据32位的CMD参数，在进行传输时MSB（bit31）优先传输，不同命令之间的参数结构差异极大。
- CRC7校验：7位循环冗余校验码，CRC运算覆盖命令索引和参数字段
- 结束位（End Bit）：固定为1（高电平），占1个CLK周期

## 响应消息Rx


而当SD卡接收到以上的CMD指令后，通过同样CMD引脚配合CLK的跳变，根据之前CMD的不同向SD主控发出不同的响应消息。

- 所有从SD卡到主控的命令响应均通过CMD引脚传输，单向串行通信。
- 所有响应均以Start Bit (0)开头，以End Bit (1)结束。这一点与CMD命令的结构类似。
- 时序方面，响应数据的传输由主控控制的CLK信号同步，采样点在CLK下降沿。
- SD卡与主控之间的通信中，针对各种CMD命令，**SD卡所发回的响应消息主要有R1，R1b，R2，R3，R6，R7这几种**。后续在初始化流程中对各个响应消息的数据结构进行说明。

### R1：普通应答消息


下图是R1响应消息的数据结构。整个响应消息长度为48bit，其中Command Index需要与这个响应消息前面的CMD命令的CMD Index相同，Card Index部分则包含一个32位的SD卡内部状态，这个SD卡状态在SD卡内部维护。



![image.png](/images/blog/SD卡的CMD命令及其响应消息数据结构-2.png)


### R1b：带busy bit的普通应答消息


R1b的消息结构与R1完全相同。只不过部分CMD命令要求SD卡响应R1消息的时候，同时在DAT0引脚上提供一个busy位，例如CMD12，在SD卡接收到这个命令以后，执行操作处于busy状态时，就会把DAT0拉低来提供这个busy状态信息给Host。


### R2：CID，CSD寄存器


当SD卡收到CMD2和CMD10的时候，通过这个响应消息发回CID寄存器；当SD卡收到CMD9的时候，通过这个响应消息发回CSD寄存器。下图是R2消息的数据结构：



![image.png](/images/blog/SD卡的CMD命令及其响应消息数据结构-3.png)

- 注意，R2的总长度是136bit，只有CID和CSD的bit127到bit1会包含在R2消息中，最后的bit0会被最后的end bit 1替代。

### R3：OCR寄存器


R3响应消息的长度为固定的48bit，用于响应ACMD41命令，向SD主控返回SD卡OCR寄存器的值。



![image.png](/images/blog/SD卡的CMD命令及其响应消息数据结构-4.png)


### R6：响应RCA地址


R6响应消息固定长度48bit，用于响应CMD3。其中Argument的高16位为SD卡自己生成的RCA地址，低16bit则是SD卡当前的部分状态位。



![image.png](/images/blog/SD卡的CMD命令及其响应消息数据结构-5.png)


### R7：卡接口状态


R7实际上就是当卡收到CMD8的时候，向SD主控返回卡支持的电压范围。R7响应消息的长度固定为48bit，其中最主要的就是bit19到bit16之间的Voltage Accepted的四个bit。



![image.png](/images/blog/SD卡的CMD命令及其响应消息数据结构-6.png)


## ACMD


SD卡与SD主控之间的命令通信，除了以上的CMD命令及其响应消息以外，还有一个ACMD命令。所谓的ACMD命令，就是Appilication CMD即应用模式CMD。SD协议中增加ACMD的原因主要是：

- CMD结构中的CMD Index总共只有6bit，能够支持的命令有限，通过这个ACMD模式可以在当前命令数据结构的条件下扩展命令的功能。
- 对SD命令进行分层，CMD负责处理硬件方面的操作，ACMD负责处理应用层面的功能。

在具体的ACMD通信流程上，ACMD的每次通信，需要先发出一个CMD55指令，要求SD卡进入应用模式，SD卡返回一个R1响应消息，在这个响应消息中用APP_CMD状态表示自己处于等待接收ACMD命令的状态中；SD主控接着发送ACMD命令，SD卡收到后，再按照ACMD命令要求返回与之对应的响应消息。每个ACMD命令的通信流程都如下所示：


```plain text
participant SD主控
    participant SD卡
    主控->>SD卡: CMD55 (声明即将发ACMD，要求SD卡进入应用模式)
    SD卡-->>主控: 通过R1消息应答，确认进入应用模式
    主控->>SD卡: ACMDX（主控继续发送ACMD命令）
    SD卡-->>主控: 执行ACMD命令所指定的扩展操作，返回响应
```


主控发出ACMD命令后，从SD卡读到的响应消息也是以上所总结出来的R1-R7的这几个消息。

