---
title: "详细总结EddyStone BLE广播包协议规范"
slug: "2026-04-13-the-detailed-summary-of-Google-EddyStone-BLE-advertising-protocol"
description: "Eddystone 是专门针对蓝牙低功耗（BLE）广播包定义的数据格式。 它是由 Google 在 2015 年推出的开源 Beacon 协议，旨在提供比苹果 iBeacon 更开放、功能更丰富的广播标准。"
date: 2026-04-13T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["蓝牙"]
draft: false
---


## EddyStone简介


Eddystone 是专门针对蓝牙低功耗（BLE）广播包定义的数据格式。 它是由 Google 在 2015 年推出的开源 Beacon 协议，旨在提供比苹果 iBeacon 更开放、功能更丰富的广播标准。


![image.png](/images/blog/详细总结EddyStone-BLE广播包协议规范-1.png)


在蓝牙的协议栈中，Eddystone 运行在 GAP（Generic Access Profile） 层之上。它利用了BLE 广播包中 31 字节的载荷（Payload）进行通信，实际上也就是基于这个31字节的数据长度所规定的一套标准化的数据结构 。

- 因为是工作在 BLE 的广播模式之下，因此进行通信的设备双方不需要建立配对连接。在通信过程中，广播设备只是单向地定时向外发射信号，任何在其覆盖范围内的扫描设备负责监听这些信息 。
- 不同于 iBeacon 在广播通信的过程中只发出一组 ID，Eddystone 允许设备轮流广播不同类型的广播帧（Frames），这是 EddyStone的一大特色。

## EddyStone的四种主要的帧类型


### UID（身份与状态帧）


这种帧类型主要用于标识设备的身份 。其帧结构如下：

- **Namespace ID (10 Bytes)**：类似于设备的姓名，用于标识某个特定的公司或者产品类型/系列 。所以一般情况下某个公司生产的同一型号的设备的Namespace ID都是相同的。
- **Instance ID (6 Bytes)**：类似于设备的名称，用于标识具体的某台设备。即使是同一型号的设备，其Instance ID也是不同的，用于区分不同的设备。
- **自定义空间**：这部分空间可自定义其具体的含义 。

### TLM（遥测帧）


这个帧一般用于广播设备的状态，如电量、温度、开机时间等，是设备的状态帧。


### URL（网页跳转帧）


这个帧类型是 Eddystone 最著名的功能。它用于直接广播一个压缩后的 URL 地址（如 `https://goo.gl/...`）。


**其实这也是Beacon类型的蓝牙设备的典型应用场景**：

- 手机靠近某个公交站，会自动弹出附近的路线信息网页，无需安装 App。
- 手机靠近超市的某个区域，会收到一个网页URL，其中包含有这个区域对应商品的促销信息。

### EID（安全帧）


这个帧类型主要用于对 ID 进行加密处理，每隔一段时间变换一次 ID，防止设备被他人非法追踪。


## EddyStone的包结构


首先总结一下典型的BLE广播包的整体包结构。在空气中传输的原始数据包长度通常为 **8 到 47 字节**：


![affce66d-09d8-4bec-b2a5-72a72a1fe8d1.png](/images/blog/详细总结EddyStone-BLE广播包协议规范-2.png)


EddyStone的所有数据结构就包含在其中的Payload中。Payload部分的长度为6-37字节，其中包含了设备的 MAC 地址和实际的广播数据 (ADV Data) ，除去 6 字节的设备地址以外，剩下的 31 字节 就是用户可定义的广播数据区。它由多个 AD Structure 组成（如上图的AD 0到AD N），每个AD Structure结构的格式为：`[长度] [类型] [数据]`。


对于 Eddystone 协议而言，其通常包含以下三个标准的 AD Structure：

- Flags ：**对于所有的EddyStone设备而言，这部分是相同的**
用于告知扫描者该设备的物理特性（如：仅限发现模式、不支持经典蓝牙）。
• 字节流：`02 01 06`
    ◦ `02`: 后面数据的长度。
    ◦ `01`: 类型（Flags）。
    ◦ `06`: 数值（代表 LE General Discoverable Mode + BR/EDR Not Supported）。
- 16-bit Service UUID：**对于所有的EddyStone设备而言，这部分是相同的**
用于告知扫描者这是一个符合 Eddystone 标准的设备。
• 字节流：`03 03 AA FE`
    ◦ `03`: 后面数据的长度。
    ◦ `03`: 类型（16-bit Service UUID）。
    ◦ `AA FE`: Eddystone 的官方注册 UUID (`0xFEAA`)，采用小端序存储，所有的EddyStone设备都必须包含这个UUID。
- Service Data (核心载荷)：**这是广播协议存放实际数据的地方。**
• 字节流示例 (UID Frame)：`17 16 AA FE 00 xx xx xx`
    ◦ `0-17`: 长度可根据包内容长度变换，最长23 字节。
    ◦ `16`: 类型为Service Data，即0x16，固定不变。
    ◦ `AA FE`: UUID `0xFEAA`，固定不变。
    ◦ `00/10/20/30`: Eddystone Frame Type。
    ◦ 后续为不同的帧数据

因此，可以简单认为：**对于所有标准的 Eddystone 设备包和广播包，前 7 个字节（****`02 01 06 03 03 AA FE`****）是完全相同且固定的。各个设备真正的差异化竞争和业务逻辑的区分，全部集中在类型为 16 之后的 Service Data 载荷中。**


## EddyStone的帧类型与Service Data结构的对应


以上提到，对于所有的EddyStone设备的广播包而言，其广播包的Payload部分包含有三个AD Structure，其中前两个AD Structure的数据内容完全固定并且相同，只有最后一个AD Structure即Service Data部分真正用于承载差异化的数据。


Service Data部分的第一个字节为Length，其对应了这个部分的长度有多长；第二个字节固定为0x16，即代表这个部分为Service Data类型，因此是固定不变的；第3-4个字节同样为固定的UUID `0xFEAA`。所以 EddyStone 广播包真正的应用层差异主要体现在Service Data第五个字节及其以后的部分。


以下安装不同的EddyStone帧类型对其帧结构进行总结，**后续的解释以Service Data的第五个字节位置（即EddyStone Frame Time）为起始点**。


### UID帧（身份与状态帧）

- Byte 0，Frame Type，1 Byte，固定为 `0x00`
- Byte 1，TX Power，1 Byte，0米处的校准接收信号强度 (RSSI)，范围为 -100 到 +20 dBm
- Byte 2-11，Namespace ID，10 Bytes，用于区分不同的范围/组织/厂商/产品类型
- Byte 12-17，Instance ID，6 Bytes，用于标识具体的设备即设备ID，每个设备都不同
- Byte 18-19，Reserved，2 Bytes，官方规范预留，通常填充0

### URL帧（网页跳转帧）

- Byte 0，Frame Type，1 Byte，固定为 `0x10`
- Byte 1，TX Power，1 Byte，0米处的校准 RSSI 值
- Byte 2，URL Scheme，1 Byte，前缀编码（如0x00代表`http://www.` ，0x03代表`https://` 。
- Byte 3-19，Encoded URL，1-17 Bytes，经过压缩后的网址内容（非 ASCII，有专门的后缀压缩码）

### TLM (遥测帧)

- Byte 0，Frame Type，1 Byte，固定为 `0x20`
- Byte 1，TLM Version，1 Byte，协议版本（目前通常为0）
- Byte 2-3，VBATT，2 Bytes，电池电压，单位为毫伏 (mV)
- Byte 4-5，Temperature，2 Bytes，设备温度（8.8 固定小数点格式，单位摄氏度）
- Byte 6-9，ADV_CNT，4 Bytes，自重启以来发送的广播包总数
- Byte 10-13，SEC_CNT，4 Bytes，自重启以来的运行时间（单位 0.1 秒）

### EID（安全帧）

- Byte 0，Frame Type，1 Byte，固定为 `0x30`
- Byte 1，TX Power，1 Byte0米处的校准 RSSI 值
- Byte 2-9，Ephemeral ID，8 Bytes，随时间变化的 8 字节加密标识符

**补充1：以上提到的8.8固定小数点格式是什么意思？**


8.8 固定小数点格式是一种用 2 个字节（16 位）来表示带小数点的数值的高效方法。它将 16 位划分为两个相等的部分：高 8 位表示整数，低 8 位表示小数。


一个 16 位的字段被拆分为：
• 高 8 位 (Most Significant Byte, MSB)：有符号整数部分。采用补码形式（即大于0x80为负数，小于0x80为正数），范围是 -128 到 +127。
• 低 8 位 (Least Significant Byte, LSB)：无符号分数部分。它代表 256 分之几（即 n/256）。


**补充2：以上提到的Encoded URL的压缩流程是什么？**


在 Eddystone-URL 规范中，为了在蓝牙广播有限的 **31 字节** 空间内塞入尽可能长的网址，Google 并没有使用复杂的通用压缩算法，而是采用了一种**基于查表法的**字节替换技术。这种方法分为两部分：前缀压缩 和 后缀/常用词压缩。


前缀压缩。用 1 个字节代表网址的开头，常见的映射关系如下：

- 0x00：http://www.
- 0x01:   https://www.
- 0x02:   http://
- 0x03:   https://

后缀压缩。其他普通的 ASCII 字符（如 `a-z`, `0-9`, `-`）直接按原样存储。但对于顶级域名（TLD）和常用路径符号，规范定义了一套特殊的单字节替换码（通常在 `0x00` 到 `0x0D` 范围内）：

- 0x00：.com/
- 0x01：.org/
- 0x02：.edu/
- 0x03：.net/
- 0x07：.com
- 0x08：.org
- 0x0B：.net
