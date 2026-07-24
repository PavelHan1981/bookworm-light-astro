---
title: "WiFi WPA/WPA2四步握手认证机制详解"
slug: "2024-06-07-wifi-wpa2-4way-handshake-details"
description: "本文对WiFi WPA/WPA2认证模式下的Key结构以及认证和密钥交换相关的4步握手机制做了较为详细的总结。"
date: 2024-06-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


## STA与AP之间建立连接的过程


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-1.png)


在AP设置为WPA-PSK或者WPA2-PSK加密模式的情况下，STA与AP之间建立连接的流程，主要可以分为以下四个部分：

- 阶段1：STA扫描到AP的Beacon Frame或者通过Probe Request找到AP
    - 被动模式：AP周期性的（一般为102.4ms）对外广播Beacon Frame，STA打开WiFi后尝试在各个信道监听周围环境的Beacon Frame，扫描到要连接的AP在哪个信道。通过对Beacon Frame的数据解析了解到这个AP使用的是哪种加密认证方式。
    - 主动模式：除了监听Beacon Frame以外，STA也可以在各个信道主动发出包含有想要连接的AP信息的Probe Request Frame，AP收到后会发回Probe Response frame。这种扫描的方式不需要被动等待Beacon frame，连接速度可以更快。
- 阶段2：STA以Open Authentication的方式连接AP
    - 这个环节包含Open Authentication和Association两步，每一步都涉及到STA发出请求包和AP发回应答包的收发过程，总共两次交互四个包。
    - WPA和WPA2的这一步是Open Authentication，所以没有密码或者密码输错的STA在这一步也可以认证成功并与AP建立连接。但通过了这一步认证，STA只是与AP建立了连接，还无法访问网络。真正的安全性认证通过后才能访问网络。
    - Open Authentication：STA向AP发出一个Authentication Request Frame，AP返回一个Authentication Response Frame。
    - Association：STA向AP发出一个Association Request Frame，AP返回一个Association Response Frame。
    - 以上环节确保STA与AP建立了连接，但还尚未进行安全性认证的内容。
- 阶段3：WPA/WPA2的四次握手完成安全性认证并交换通信密钥
    - 由AP发起，AP与STA之间基于EAPOL协议进行四次交互通信，在对预共享密钥PSK认证通过的情况下，完成单播和多播通信密钥的交换。
    - 所以这个环节包含两个部分的功能：安全性认证，交换单播和多播密钥。
- 阶段4：加密通信阶段
    - 以上WPA/WPA2的四步握手认证通信完成后，STA就与AP之间通过了安全认证并且交换了通信密钥，此后的通信内容使用密钥进行加密保护。

## WPA认证加密中的Key解析

- 对于这些加密通信中的Key是如何生成的，因为我自己并非从事安全行业，只需要了解大致的工作流程即可，因此没有太大必要弄得非常清楚。

先说结论，经过WPA 4-Handshake的安全认证以及密钥交换环节后，实际上在AP和STA之间交换了两个密钥PTK和GTK：

- PTK用于对后续AP和STA之间的所有单播一对一通信进行加密保护。PTK仅在AP和某个STA之间共享，所有STA的PTK都是不一样的。
- GTK则用于对AP和STA之间的所有广播和多播也就是一对多的通信进行加密保护。GTK则在这个AP的整个局域网内部的所有STA之间共享，GTK由AP维护，在四步握手的第三步由AP加密传输给STA。
    - 因为GTK在整个局域网内共享，为了进一步保证GTK的安全性，在AP维护GTK时会定期刷新GTK并通知给各个STA，同时在某个STA断开连接后，AP也会刷新GTK避免过期的GTK被重复使用。

WPA通信中所使用到的各个Key的简单解释如下：

- MSK (Master Session Key)：在我们常用的WPA-PSK/WPA2-PSK预共享密钥验证方式中实际上没有用到，仅用于802.1x认证体系，AP与Radius Server之间生成的第一个加密Key。
- PMK (Pairwise Master Key)：在我们常用的WPA-PSK/WPA2-PSK预共享密钥验证方式中，可以认为等同于在AP和STA两端设置的预共享密钥，也就是wifi密码；在802.1x认证体系中，是由AP与Radius Server协商到的AAAkey。
- GMK (Group Master Key)：由AP生成的随机数，用于进一步生成GTK。
- PTK (Pairwise Transient Key)：在4 handshake过程中基于PMK、ANounce、SNounce、双方MAC地址、SSID等生成，用于对AP和STA的单播流量进行加密。
- GTK (Group Temporal Key)：由AP定期生成刷新并加密发给各个STA，在整个AP的局域网内共享相同的GTK，用于对多播和广播流量进行加密。
- ANonce：AP所产生的随机数
- SNonce：STA所产生的随机数
- MIC：AP和STA的MAC地址。

以下附图是WPA加密通信Key的架构图。


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-2.png)


对上图的简单总结起来就是：

- PTK是依赖于PMK生成的，PMK又依赖于AP和STA之间设置的预共享密钥，以及802.1x体系下AP与Radius Server协商的AAA密钥。
- GTK则是依赖于GMK生成的，而GMK本质上则来源于AP定时刷新生成的随机数。

那么接下来就是详细看PTK和GTK究竟是如何生成的。


首先看GTK。

- 如上所述，GTK是由AP独立生成和维护的，不需要在AP和STA之间交换随机数，只需要在与STA建立连接的时候，把这个GTK加密后传递给STA即可，以及定时或者在有STA离开网络时及时更新GTK。
- GTK的生成依赖于GMK。而GMK实际上就是一个由AP定期生成和刷新的伪随机数。GMK并不会被直接发给各个STA，而是由GMK进一步生成的GTK才会被用于发给STA进行多播和广播流量的加密。
- AP有了GMK以后，就会使用PRF算法生成GTK，并且把GTK加密后发给各个STA。

其次是我们常用的预共享密钥WPA-PSK/WPA2-PSK模式下如何生成PTK。

- PTK的生成公式是：PTK = PRF (PMK + Anonce + SNonce + Mac (AA)+ Mac (SA))。也就是说，PTK依赖于PMK、AP端生成的随机数Anounce，STA端生成的随机数SNounce，STA和AP的MAC地址。其中STA和AP的MAC地址肯定是在双方进行第一次通信的时候就能知道的，Anounce和Snounce则分别在4-way handshake的第一个和第二个message分别由AP发给STA以及由STA发给AP。所以要生成PTK，就剩下一个PMK是未知的。
- 而本质上，对于WPA/WPA2的PSK认证模式而言，PMK实际上就是对AP和STA两端分别设置的wifi预共享密钥（也就是所谓的WiFi密码）进行PBKDF2算法运算后生成的256bit密钥。因为这个预共享密钥AP和STA都是知道的，所以它们就可以分别独立的计算出来相同的PMK。
- 至此，对于PTK而言，只要在AP和STA之间成功的交换了SNonce和ANounce，就可以分别生成PTK，用于后续的单播流量的加密。

再次简单总结起来：

- 对于多播流量加密所需要的GTK而言，由AP生成和维护，只需要在4-way handshake过程中把GTK加密发送个要接入网络的STA即可。
- 而对于单播流量加密所需要的PTK而言，需要在AP和STA两端分别各自生成。因为预共享密钥已经提前在AP和STA两端分别设置，所以PMK不是问题；AP和STA的MAC地址也不是问题；重点就是ANounce和SNonce应该如何安全的交换。
- 此外就是，在4-way handshake的过程中，AP是如何验证STA是一个合法的接入设备呢？这一点当然归根结底是要验证两者设置的预共享密钥是否一致了。

关于WPA以及WPA2各个Key的生成，有一篇非常好的参考文档可以进一步深入学习：[networklessons.com...](https://networklessons.com/cisco/ccnp-encor-350-401/introduction-to-wpa-key-hierarchy#Group_Master_Key_GMK) 。我自己在这里只是把简单的逻辑流程整理清楚。


## WPA四步握手的流程


按照以上对于WPA Key框架的分析，下一步在4way-handshake阶段要解决的问题就是：

- 如果安全的交换SNounce和ANounce，在AP和STA之间分别生成相同的PTK，用于对后续两者之间的单播流量进行加密。
- 如果把AP端的GTK加密发送给STA，用于对后续的多播和广播流量进行加密。
- AP端如何能够验证STA接入设备的合法性。

WPA 4-way handshake的流程共包含AP和STA之间的4个消息，由AP发起，如下图所示。


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-3.png)


### Message 1:


Message 1是由AP发送给STA，主要的作用就是向STA发送自己的随机数ANounce。


注意：

- 因为在这个阶段，AP和STA之间还没有交换其他密钥（AP和STA上分别设置的wifi密钥也就是预共享密钥PSK会在Message 2上使用），所以此时的ANounce是以明文形式由AP发给STA的。
- Message 1中发送的ANounce也是没有MIC校验的。

![Untitled.jpeg](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-4.jpeg)


简单总结：Message 1就是AP向STA以明文方式发出自己所产生的随机数ANounce。


### Message 2：


STA在Message 1中收到AP的ANounce以后，就可以按照以下公式计算出来PTK：PTK = PRF (PMK + Anonce + SNonce + Mac (AA)+ Mac (SA))。

- PMK在WPA-PSK/WPA2-PSK中是由用户输入的wifi连接密码字符串生成的。
- ANounce是Message 1由AP发过来的，SNounce是自己产生的。
- Mac(AA)和Mac(SA)分别是STA和AP的密码，这个在AP和STA上都可以解析到。

STA计算出来自己的PTK以后，就需要在Message 2里面把自己产生的SNounce随机数发给AP。

- 因为这个时候AP需要收到SNounce以后才能计算出来自己的PTK，所以Message 2里面的SNounce当然也是以明文的方式发送给AP的。

但是与Message 1不同的是，Message 2消息里面除了SNonce明文以外，还包含了这个SNounce随机数的MIC。所以在这个报文的Key Information中设置了Key MIC flag。


这个MIC是如何计算的呢？

- Now WPA2 PSK uses HMAC-SHA1 to generate the MIC and it uses the **KCK** as a secret to generate the **MIC**. 也就是说，Message 2的MIC值会使用HMAC-SHA1算法计算，MIC计算的密钥是KCK。

那么KCK是什么呢？KCK就是签名STA已经计算出来的PTK的前16个字节，后续通信中专门用于计算MIC。下图是PTK的结构，KCK就是PTK的前128bit。


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-5.png)


当AP收到Message 2以后，首先取出其中包含的SNounce明文，结合自己之前产生的ANounce明文，以及双方MAC地址，AP中设置的预共享密钥等信息，计算出来自己的PTK。然后拿出这个PTK的前16个自己，也就是KCK，作为密钥调用HMAC-SHA1算法对Message 2中的SNounce明文进行MIC计算，并且与Message 2中的MIC值进行比较。如果一致就表示双方PTK的交换成功，至此双方有了相同的PTK，可以使用这个PTK对后续的单播流量进行加密了。

- 因此Message 2中的这个MIC隐藏了两个作用，一个是验证Message 2中传递的SNounce的完整性以及是否被人修改，另外一方面也是通过计算MIC所使用的KCK（KCK来源于PTK，而PTK则与PMK也就是预共享密钥相关）验证了AP和STA双方设置的预共享密钥是否一致。

![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-6.png)


简单总结：Message 2就是STA向AP发出自己的SNounce，双方计算出自己的PTK，并通过MIC的匹配计算判断PTK乃至预共享密钥是否一致。


至此，AP和STA已经完成了预共享密钥认证，并且已经交换了双方后续单播通信的密钥PTK。后续的Message 3和4主要就是用于交换对广播和组播流量进行加密的GTK了。


### Message 3:


因为前面的Message 1和Message 2阶段已经交换了PTK，所以后续的Message 3和Message 4的通信都使用PTK来进行保护。


Message 3的主要作用就是由AP向STA发出自己的GTK。GTK是由AP独立维护，并且在AP的整个局域网内共享，所以AP只需要把GTK使用前面已经协商好的PTK加密传输给STA即可。


Message 3报文中最重要的就是GTK的加密密文以及消息验证码MIC。


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-7.png)

- 上图中Key MIC Flag设置，表示这个消息同样包含了GTK的消息验证码MIC，使用PTK的前16个字节KCK进行MIC计算。
- 上图中的Secure Set flag设置，表示这个消息说加密消息，需要使用PTK进行解密。
- WPA Key data：就是GTK的加密密文。
- WPA Key MIC：就是GTK的消息验证码MIC。

STA收到以上报文后，使用自己的PTK对密文进行解密得到GTK，同时使用自己的KCK进行消息验证码的计算匹配，验证通过后表示GTK合法。后续STA就有了对广播和组播流量进行加密的GTK密钥。


### Message 4:


Message 4就比较简单了，它的作用实际上就只是通知AP自己已经正确的收到了GTK并安装到系统中。


![Untitled.png](/images/blog/WiFi-WPA-WPA2四步握手认证机制详解-8.png)


至此，WPA的4 way handshake流程结束，后续AP和STA之间的通信均使用PTK和GTK进行加密保护。


## 参考资料

- [4-Way Handshake - WiFi (wifi-professionals.com)](https://www.wifi-professionals.com/2019/01/4-way-handshake)
- [WiFi 四次握手分析 | Think && Act (gitbook.io)](https://kysonlok.gitbook.io/blog/wireless/4_way_handshake)
- [4-Way Hand shake , Keys generation and MIC Verification-WPA2 – Praneeth's Blog (praneethwifi.in)](https://praneethwifi.in/2019/11/09/4-way-hand-shake-keys-generation-and-mic-verification/)
- [4-Way Handshake - WiFi (wifi-professionals.com)](https://www.wifi-professionals.com/2019/01/4-way-handshake)
- [4-Way Hand shake , Keys generation and MIC Verification-WPA2 – Praneeth's Blog (praneethwifi.in)](https://praneethwifi.in/2019/11/09/4-way-hand-shake-keys-generation-and-mic-verification/)
