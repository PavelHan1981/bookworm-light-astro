---
title: "基于Wireshark+Acrylic WiFi Sniffer的WiFi空口抓包环境"
slug: "2021-01-18-wireshark-acrylic-sniffer"
description: "本文总结了使用Acrylic WiFi Sniffer+Wireshark，以及搭配必要的抓包无线网卡，进行WiFi空口包抓取环境的搭建过程。"
date: 2021-01-18T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi","Wireshark","无线通信"]
draft: false
---


## **前提条件：**

- 安装好wireshark和Acrylic WiFi Sniffer软件；
- 一个能够支持Monitor工作模式的无线网卡；
- 提前知道要抓包的AP信道；
- （如果需要对数据链路层以上的数据进行解密的话，需要）提前知道要抓包的AP SSID和密码；

## **安装Wireshark和Acrylic WiFi Sniffer**

- 在www.wireshark.org上下载wireshark的最新版本并安装即可；
- Acrylic WiFi sniffer
    - 下载地址：https://www.acrylicwifi.com/en/downloads-free-license-wifi-wireless-network-software-tools/download-acrylic-wi-fi-sniffer/#；
    - 免License的Acrylic WiFi Sniffer软件在进行抓包的时候，每次执行抓包只能抓1min的包，并且抓包5min后才能执行第二次抓包。如果要去掉以上限制，就需要购买License：1年期的软件使用授权费用是100美元，永久授权是220美元；
    - 安装后打开软件，Acrylic WiFi Sniffer软件就开始扫描连接到电脑上的无线网卡，并检测是否能够Monitor工作模式，并把能够支持Monitor模式的无线网卡列表罗列出来：

![Untitled.png](/images/blog/基于Wireshark+Acrylic-WiFi-Sniffer的WiFi空口抓包环境-1.png)

- 如果以上Compatible WiFi Devices中显示的结果是No WiFi devices found，就需要另外找一个能够支持Monitor工作模式的无线网卡；

## **Acrylic WiFi Sniffer支持的无线网卡**

- Acrylic WiFi Sniffer软件对无线网卡的支持情况在以下链接中查看：https://www.acrylicwifi.com/en/wlan-wifi-wireless-network-software-tools/sniffer-wifi-for-windows/acrylic-wi-fi-sniffer-requirements-and-compatibility/；
- 实际上以上连接中只是罗列出来一部分，例如可以确定磊科的NW392 USB无线网卡可以支持；

## **抓包前提前扫描AP所在的信道**


可以提前在手机上安装AP扫描软件对周围的AP状况进行扫描，例如Android平台的《WiFi分析助手》：


![Untitled.jpeg](/images/blog/基于Wireshark+Acrylic-WiFi-Sniffer的WiFi空口抓包环境-2.jpeg)


## **使用Wireshark进行WiFi空口包的抓包**


打开Wireshark后，在Wireshark捕获设备列表中选择Acrylic WiFi Sniffer软件找到的无线网卡：


![Untitled.png](/images/blog/基于Wireshark+Acrylic-WiFi-Sniffer的WiFi空口抓包环境-3.png)


点击前面的齿轮按钮选择正确的wifi信道，确认开始后即启动WiFi空口包抓包：


![Untitled.png](/images/blog/基于Wireshark+Acrylic-WiFi-Sniffer的WiFi空口抓包环境-4.png)

- 在Channel位置选择使用WiFi信道扫描工具扫描到的AP信道；

## **WiFi空口包的解密**

- 默认情况下，通过以上WiFi空口包抓包环境抓取的数据包的Protocol都是802.11，因此只能看到数据链路层包头部分的內容，之前的部分都以QoS Data的形式进行加密。这样我们在进行抓包分析的时候就没法知道其上层协议、端口等信息的具体內容。
    - 这是因为在空中传输的WiFi packet都是经过加密的，密钥在AP与STA进行Association操作的时候进行协商，此后的通信过程中，会使用协商的密钥对数据链路层以上的数据进行加密，只有这个packet的接收方才有正确的密钥来进行解密。
- 如果要实现对WiFi空口包抓包数据的解密操作，即能够看到802.11数据链路层以上的协议、数据、端口等內容，需要：
    - 提前知道抓包AP的SSID和Key，并在wireshark中设置：Edit -> Preferences -> Protocols -> IEEE802.11 -> Edit，设置选择wps-pwd，key填：KEY:SSID；例如SSID是R8000，Key是88888888：

![Untitled.png](/images/blog/基于Wireshark+Acrylic-WiFi-Sniffer的WiFi空口抓包环境-5.png)

- 能够抓取到一次完整的STA到AP的Association过程，这样才能够获取到这次STA与AP连接过程协商的加密密钥：

![Untitled.png](/images/blog/基于Wireshark+Acrylic-WiFi-Sniffer的WiFi空口抓包环境-6.png)

- 最重要的就是能够拿到以上完整密钥协商过程的四个key，只有四个key都监听到的情况下，后续这个STA与AP之间的通信包才能得到正确的解密。
- 从以上完整的Association过程的抓包过程来看，如果要能够对后续的通信包正确解密成功，需要在wireshark中抓包到以下序列：
    - STA向AP发出Authentication，并接收到应答Acknowledge；
    - AP向STA发出Authentication，并接收到应答Acknowledge；
    - STA向AP发出Association Request，接收到应答Acknowledge；
    - AP向STA发出Association Response，接收到应答Acknowledge；
    - AP向STA发出Key Message 1，接收到应答Acknowledge；
    - STA向AP发出Key Message 2，接收到应答Acknowledge；
    - AP向STA发出Key Message 3，接收到应答Acknowledge；
    - STA向AP发出Key Message 4，接收到应答Acknowledge；
    - 而实际的抓包测试中，可能会漏掉其中的某个key message，这样就会导致无法解密成功；
- 在遇到无法解密成功的情况下，需要检查一下：
    - 是否在802.11包解密设置中填写正确了SSID和Key信息；
    - 是否监听到一次完整的Association过程，即能够在抓包数据中看到完整的Key1-Key4的完整过程；
    - 如果仍然无法解密成功，尝试修改802.11包解密设置中的Assume Packets have FCS和Ignore the protection bit设置选项；
