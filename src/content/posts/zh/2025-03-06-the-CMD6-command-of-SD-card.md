---
title: "SD通信命令协议解析之CMD6"
slug: "2025-03-06-the-CMD6-command-of-SD-card"
description: "在SD协议中，SD主控与SD卡之间交互流程中的CMD6是一个相对比较复杂的命令。其复杂性体现在：
- 同一个命令既可以实现对SD卡支持特性的读取，也可以对其进行设置。
- CMD6命令的执行及其从SD卡上读取的响应消息，双方不仅在SD的CMD pin上通信，也涉及到了在DAT引脚上传输部分数据，而其他CMD命令的交互执行基本上都只涉及到CMD pin。
- CMD6命令中所支持的功能比较多，包含多个function group，每个function group又包含多个function mode。

所以，本篇比较在较为深入的学习SD物理层协议规范文件（V6.00版本）的基础上，详细的整理出来CMD6命令交互的流程。

"
date: 2025-03-06T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["SD"]
draft: false
---


在SD协议中，SD主控与SD卡之间交互流程中的CMD6是一个相对比较复杂的命令。其复杂性体现在：

- 同一个命令既可以实现对SD卡支持特性的读取，也可以对其进行设置。
- CMD6命令的执行及其从SD卡上读取的响应消息，双方不仅在SD的CMD pin上通信，也涉及到了在DAT引脚上传输部分数据，而其他CMD命令的交互执行基本上都只涉及到CMD pin。
- CMD6命令中所支持的功能比较多，包含多个function group，每个function group又包含多个function mode。

所以，本篇比较在较为深入的学习SD物理层协议规范文件（V6.00版本）的基础上，详细的整理出来CMD6命令交互的流程。


**CMD6执行的前提就是，先要通过CMD7指令选中SD卡，让SD卡进入传输状态Transfer Mode。**


## CMD6命令的交互数据结构


CMD6命令的整体数据结构仍然遵守[[SD卡的CMD命令及其响应消息数据结构]]中对于CMD命令数据结构的定义，CMD Command Index为0x06，Argument的32bit则如下图所示。

- 最高的31bit用于表示该命令是要验证请求设置的数据对于SD卡是否合法，还是要把参数指定的function mode设置进去。
- bit30-bit24为预留位，全部为0。
- bit23-bit0的24个bit，以4个bit为一组，分为6个function group，对应于各个function group的设置参数，其中实际上只用到了前面4个group，group 5和6预留给未来的新group。

![image.png](/images/blog/SD通信命令协议解析之CMD6-1.png)


而Group 1-4这四个Group中，每个function可设置的function mode的值对应于下表所示。



![image.png](/images/blog/SD通信命令协议解析之CMD6-2.png)

- 4个function group的设置参数各自独立，分别占用其中的4个bit，所以可以在一条CMD6指令中同时设置或者检查多个function group的设置，例如可同时设置总线速度和驱动强度。
- 对于每个function group而言，同一时间只能选择一个function mode。function mode设置为0表示使用默认值，设置为0xF表示继续使用当前值。
- 每个function group的function 0是其上电后默认的配置，例如默认的SD卡读写总线时钟速度（Access Mode）为SDR12，也就是25MHz。

当处于Transfer Mode的SD卡收到以上CMD6消息时，SD卡会在CMD Pin上返回一个R1消息用于表示自己当前的内部工作状态，以及在DAT数据总线上返回一个512bit的状态消息（对于SD卡而言，就是一个标准的块读操作）。


## CMD6命令的执行流程


如上所述，CMD6命令的执行可以分为Check（Mode 0）和Switch（Mode 1）两种操作模式。

- 其中Check模式用于检查SD卡是否可以支持CMD6 Argument中所指定的function mode。
- Switch模式则用于把CMD6 Argument中所指定的function mode设置到SD卡中。

### CMD6 Check Operation


对于SD主控而言，在CMD6的Argument设置中，bit31设置为0表示该命令是一个check操作，并且在各个function group中设置要查询的function mode，通过这个命令查询SD卡是否支持指定的function mode。


当SD卡收到以上CMD6命令以后，从CMD pin上返回一个R1响应消息答复自己的当前工作状态，然后在DAT总线上发出一个512bit的信息结构，其中包含有SD卡是否支持指定function mode的信息（在512bit信息结构的bit399到bit376之间），如果支持就返回这个function mode的index，如果不支持就返回0xF。


![image.png](/images/blog/SD通信命令协议解析之CMD6-3.png)


### CMD6 Switch Operation


对于SD主控的Switch操作而言，与上面的Check操作类似。在CMD6的Argument设置中，bit31设置为1表示该命令是一个switch操作，然后在各个function group中设置要查询的function mode，通过这个命令来向SD卡设置指定的function mode。


当SD卡收到以上CMD6命令以后，从CMD pin上返回一个R1响应消息答复自己的当前工作状态，然后在DAT总线上发出一个512bit的信息结构，其中包含有SD卡是否支持指定function mode的信息（在512bit信息结构的bit399到bit376之间），如果支持就返回这个function mode的index，如果不支持就返回0xF。此外，在这个512bit的信息结构发出的8个clk以后，CLK以及DAT的总线工作时序就切换为function mode所设置的工作模式。


![image.png](/images/blog/SD通信命令协议解析之CMD6-4.png)

