---
title: "BLE设备之间安全密钥总结"
slug: "2024-12-16-the-summary-of-Keys-in-BLE-devices"
description: ""
date: 2024-12-16T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["蓝牙"]
draft: false
---


## BLE安全性保证的三大基础密钥


总的来说，BLE通信连接的安全性是建立在加密通信、签名、随机地址这三大基础之上。


为了保证BLE设备之间在通信过程中的加密通信，主要用到了三种类型的密钥。这三个密钥都是在设备完成配对以后在两个设备之间加密安全传输的。

- Long Term Key (LTK)：用于对加密连接通信情况下的数据进行加密保护。在两个设备的配对过程中产生和交换相同的LTK，配对和绑定流程执行完成后LTK会分别保存在两个设备之中。后续在两个设备的连接状态数据通信过程中，LTK会被用于产生对数据包使用AES-128算法进行加解密的会话密钥，确保连接后在双方之间传输的数据包都是加密的。
- Connection Signature Resolving Key (CSRK)：用于对非加密连接情况下的数据收发进行完整性和身份真实性的验证。在通信链路不使用加密机制的情况下，BLE通过数据签名机制来保证收到数据包的完整性和真实性。通过给每个数据包增加签名，确定这个数据包是完整的（没有被修改过），并且是由自己信任的通信对端（与自己配对过的设备）发过来的。CSRK密钥就用于这个数据签名的流程中，BLE连接通信的过程中，每个要发出的数据包，会使用CSRK密钥对这个数据包签名，然后把数据包和签名一起发给对方。对方收到以后对收到的数据包的内容使用系统的签名算法逻辑和CSRK密钥再进行一次运算，然后比较自己计算到的签名值与收到的签名值是否匹配。两个签名匹配的情况下，表示这个数据包是完整的，并且确实是由自己信任的通信对端发过来的。
- Identity Resolving Key (IRK)：用于对蓝牙外设设备的蓝牙MAC地址进行保护。针对恶意攻击者利用设备的蓝牙地址来尝试持续长时间跟踪用户蓝牙设备通信所存在的安全性隐患，BLE规范引入了一种Resolvable Private Addresses的随机地址对用户设备的真实蓝牙地址进行保护。蓝牙外设设备在运行过程中定期（默认为15min）使用这个128位的IRK产生一个随机蓝牙地址，与其他设备之间的通信空中包中使用这个随机MAC地址进行通信，而只有与这个蓝牙外设设备之前完成配对和绑定流程的蓝牙设备才能够从这个随机地址中解析出来外设蓝牙设备的真实地址，这样的话无论是广播还是连接状态下，外设蓝牙设备的MAC地址就总是处于周期性的变化之中，通过这个措施来实现对蓝牙通信过程中非授权跟踪和攻击的保护。

## **The Long Term Key ( LTK)**


![image.png](/images/blog/BLE设备之间安全密钥总结-1.png)


在BLE连接建立以后，BLE连接的通信双方会使用AES128加密算法对所有的通信包数据进行加解密。AES128算法的密钥基于LTK和双方本次建立连接时协商的随机数生成，因此每次连接通信所使用的AES加密key都是不一样的。

- 基于LTK生成临时密钥。在连接建立的过程种，通信双方会产生并交换一个随机数，使用这个随机数与两端各自在配对时保存的LTK配合生成一个随机密钥，用于本次后续连接中双方通信的加解密密钥。每次连接建立时所产生的随机数都是不同的，因此每次连接所使用的加解密密钥也就不同。这个密钥可以称之为是这次连接的Session Key。
- 加密数据。以上步骤生成Session Key以后，这次连接后续的相互通信都使用AES-CCM配合这个Session Key进行加解密操作。AES-CCM算法对数据包进行加密的过程中，同时还会生成这个包的四字节长度的消息完整性检查码MIC。然后把加密后的数据包及其MIC一起发给通信对端，来确保BLE通信数据的机密性和完整性。
- 解密数据。通信对端收到密文数据以后，使用相同的Session和AES算法进行解密得到明文，同时通过对这个数据包的MIC进行匹配比较，确认一致的情况下才表示收到了完整未被篡改的数据信息。

## **The Connection Signature Resolving Key (CSRK)**


需要注意的是，BLE连接模式下的通信，并非所有的数据都要进行加密传输，对于一些安全级别不高的数据和应用场景的情况下（例如一些非敏感的传感器数据），也可以直接传输明文数据。但需要在通信双方之间确保传输的数据是由自己信任的通信对端所传输的。在这种情况下，就要使用CSRK来确保双方通信数据的完整性及发送者身份的合法性。


BLE使用签名机制来实现以上两部分功能。具体的实现上，BLE的签名机制实现和运行依赖于CSRK和一个用于防止重放攻击的累进计数器。


![image.png](/images/blog/BLE设备之间安全密钥总结-2.png)


具体的实现上，BLE采用AES-CMAC算法来生成消息明文的消息验证码MAC（ Message Authentication Code）。这个MAC可以同时为数据包提供完整性和验真性两方面的确认功能。


对于AES-CMAC这个签名算法而言，需要有三个输入：

- 要进行签名计算的消息明文，可以是任意长度。
- CSRK密钥，128bit长度。
- SignCounter，一个32bit的累加计数器，每进行一次签名运算累加一次。

AES-CMAC运算的结果，就是这个明文消息的消息验证码MAC，MAC的长度是固定的。在BLE通信时，消息验证码、明文数据包以及MAC计数器SignCounter一起会被发到通信对端。


通信对端收到以后，把消息明文、SignCounter和MAC码分开（SignCounter和MAC的长度都是固定的），然后对明文使用相同的逻辑进行计算，得到自己计算出来的MAC码。然后比较两个MAC码，如果一致就表示收到的明文消息是完整的，并且确实是由自己所信任的通信对端发过来的。


此外，接收端还会去比较自己新收到的SignCounter以及上次计算所使用的SignCounter，如果新的SignCounter大于之前运行所使用的SignCounter（因为发送端的SignCounter每次运算都会累加1），表示这个消息进行MAC计算的SignCounter是合法的，否则就是非法的，以此来应对重放攻击。


## **The Identity Resolving Key (IRK)**


IRK也是两个BLE设备在配对过程中在配对双方之间共享的密钥，用于解析后续通信中所使用的蓝牙随机MAC地址，以避免恶意攻击者持续监听某个固定蓝牙MAC地址的通信。


BLE外设设备每隔一段时间会基于IRK生成一个新的随机MAC地址。具体的生成步骤和逻辑是，BLE外设设备先生成一个22bit随机数prand，这个随机数和配对过程中双方交换和保存的IRK密钥一起被用于产生一个可解析的随机私有地址RPA（Resolvable Private Address）。IRK的长度固定为128bit，随机数prand的固定长度为22bit，RPA的计算以IRK和prand为输入，计算算法使用蓝牙规范中定义的ah哈希算法：

- _hash = ah (IRK, prand)_, truncated to 24 bits

以上Hash计算的结果会被截断为24bit长度，然后与22bit的随机数prand、最高位的0b01（BLE MAC最高位为0b01表示这个地址是一个可解析私有地址）一起构成随机MAC地址RPA：


![image.png](/images/blog/BLE设备之间安全密钥总结-3.png)

- 这个可解析私有地址包含了两方面的信息，prand以及ah算法计算出来的hash值。

那么当包含这个RPA随机地址的数据包被Master设备收到的时候，就需要对其中包含的RPA进行解析，从中解析出来真正的外设MAC地址。如果解析失败，就说明这个数据包不是给自己的，直接丢弃就好了。


两个BLE设备进行配对时，双方都要交换一系列密钥，其中就包含外设设备的IRK密钥，这个外设真实的固定BLE MAC地址等信息。因此每个配对后的BLE设备都会维护一个地址解析表，包含有配对设备的IRK以及真实固定BLE MAC地址等信息。


![6782a46a-db27-49b7-8c83-19f3fdb22f06.png](/images/blog/BLE设备之间安全密钥总结-4.png)


BLE Master设备接收到数据包以后，如果这个包中包含的MAC地址是可解析私有地址类型（最高两个bit为0b01），就按照下面的流程确认这个包的发包设备的IRK信息是否包含在以上的解析表中，及其对应的真实BLE MAC地址是多少：


![76496ea7-d40b-4ce6-80cf-d4b2694aaf32.png](/images/blog/BLE设备之间安全密钥总结-5.png)

- 收到数据包的BLE设备，从数据包中取出其中包含的RPA可解析地址，分为两个部分，hash value和prand，然后从地址解析表中取出一个Peer IRK，使用相同的ah哈希算法计算（IRK，prand）的哈希值，然后与hash value相匹配。如果不匹配，就继续使用地址解析表中下一个表项里面的Peer IRK继续进行相同的计算和匹配比较，直到找到两个hash value匹配为止，然后就可以从这个表项中找到与其对应的真实BLE MAC地址（即Peer Device Identity Address）。如果轮询整个地址解析表，没有找到与之匹配的Peer IPK，那么就表示这两个设备之前没有配对过。这个数据包不是发给自己的，因此丢弃即可。

### RPA的定时更新


为了对BLE外设设备的安全性和隐私进行更严密的保护，除了以上对其BLE MAC地址进行随机数加密以外，这个BLE设备还会定时更新其RPA随机地址，避免随机地址使用时间过长的情况下被攻击者持续跟踪。


RPA随机地址的可用时长在BLE controller的_HCI_LE_Set_Resolvable_Private_Address_Timeout_ 命令中进行设置，可设置的时间范围在1s到11.5小时之间，超时后连接层就需要重新生成随机数并更新使用新的RPA通信地址。


BT规范中建议使用的RPA更新时间是15min。


## 参考资料

- [Understanding Security Keys in Bluetooth Low Energy - Technical Articles](https://www.allaboutcircuits.com/technical-articles/understanding-security-keys-in-bluetooth-low-energy/)
- [BLE 配对加密相关问题分享_ble安全等级 模式-CSDN博客](https://blog.csdn.net/Marchtwentytwo/article/details/144217848)
