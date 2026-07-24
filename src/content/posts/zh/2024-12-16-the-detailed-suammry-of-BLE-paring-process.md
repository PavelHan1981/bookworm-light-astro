---
title: "BLE设备配对模式和流程详细解析"
slug: "2024-12-16-the-detailed-suammry-of-BLE-paring-process"
description: ""
date: 2024-12-16T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["蓝牙"]
draft: false
---


BLE设备的配对流程，主要就是在两个设备之间建立相互信任的配对和绑定关系，产生两者后续加密通信和身份认证的密钥，并安全的交换这些密钥用于后续连接模式下的加密通信。


整个BLE配对过程的细节非常繁琐，因此大致分为**三篇笔记的篇幅**对完整的配对和绑定的流程进行深入的解析，以建立对蓝牙安全性的更深入理解：

1. 对BLE设备之间进行配对和绑定的过程以及支持的配对模式进行简要总结，详细描述配对流程第一阶段的实现步骤；
2. 对BLE设备配对流程的第二阶段LE Legacy Pairing模式的执行流程进行详细解释和说明。
3. 对BLE设备配对流程的第二阶段LE Security Connections模式的执行流程，以及第三阶段对密钥的分发流程进行详细解释和说明。

## BLE设备的配对和绑定流程简述


BLE配对流程的主要作用既然是产生和交换密钥，那就必须要保证整个密钥交换流程的安全性，否则被攻击者监听到，这个密钥也就泄露了。此外，BLE设备之间在进行配对之前还要进行必要的硬件设备身份确认，身份确认通过以后（确认正在执行配对流程的两个设备是合法而且正确的，避免错配）才能执行后续的配对流程。


与配对（Pairing）流程相关联的还有一个绑定流程（Bonding）。这两个概念是先后的关系，简单的总结就是配对流程是在两个BLE设备之间建立信任关系，产生和交换用户后续加密通信的密钥；而绑定流程则是把配对流程所产生的密钥保存起来，后续两个设备之间重新连接的时候就可以直接使用之前已经交换和保存好的密钥，这样加密连接的建立速度更快，用户使用体验更好。因此，一旦经过了配对+绑定的完整过程，下次两个设备重新连接的时候，就可以跳过重新进行新的密钥协商和传递的过程，直接使用之前绑定流程中在两端保存的密钥信息来对通信进行加密和保护。

- 实际上配置之后自动执行一个绑定流程安全性也更好，这样就不需要每次两个设备之间建立连接的时候，都执行完整的身份认证、密钥协商和交换的过程，密钥和其他敏感信息泄露的风险更小。

符合蓝牙4.2及其之后版本规范的BLE设备有两种配对流程可以选择：经典的LE Legacy Pairing，以及更加安全的LE Secure Connections。这两者的区别主要是后者的配对密钥生成和交换方法更加安全，以及后者可以支持更完整的配对模式（Association model）。


整个BLE配对流程从顺序上可以分为三个阶段，其中第一阶段和第三阶段对于LE Legacy Pairing和LE Secure Connections来讲是完全一样的，两者的区别主要就在第二阶段。而对于两个BLE设备在进行配对操作的时候究竟会选择LE Legacy Pairing还是LE Secure Connections，则依赖于其支持的蓝牙规范版本（4.2之前版本只能使用LE Legacy Pairing）以及配对特性交互环节所交换的SC（Secure Connections）选项：**如果配对的两者都支持SC选项，那么就会走LE Secure Connections流程，只要有一方不支持SC选项就走LE Legacy Pairing流程。**


![1734512982950.png](/images/blog/BLE设备配对模式和流程详细解析-1.png)


## 配对流程阶段一：双方配对特性/能力交换


整个BLE配对流程的执行包含两个角色：Initiator和Responder。而配对流程总是由Initiator发起，Initiator向Responder发出一个Pairing Request包，Reponder收到以后返回一个Pairing Response消息。这两个消息中包含了双方各自的能力和特性等信息。


![image.png](/images/blog/BLE设备配对模式和流程详细解析-2.png)

- IO Cap：用于表示进行配对操作的双方具备的输入（例如键盘，按键等）或者输出（例如显示屏等）设备方面的能力，由此来决定后续执行配对操作可以采用的安全等级和密钥的产生方法。根据双方IO能力的不同，可以支持的IO选项包括：DisplayOnly, DisplayYesNo, KeyboardOnly, NoInputNoOutput和KeyboardDisplay。
    - DisplayOnly：该设备只有一个显示屏可用于显示数字字符串，无法接受输入
    - KeyboardOnly：该设备具备输入数字的能力
    - DisplayYesNo：该设备既有一个显示屏可以显示数字，也可以允许用户以某种方式（例如确认按键）选择YES或者NO
    - NoInputNoOutput：该设备没有可供用户使用的输入输出能力（显示屏或者键盘/按键）
    - KeyboardDisplay：该设备既可以支持输入数字/字符串，又有显示屏显示字符串/数字
- OOB Data Flag：用于标记双方是否具备BLE通信之外的其他手段（也就是所谓的带外通信，out of band）可以协助进行这个配对操作和设备认证操作，例如NFC或者二维码。可选的选项只有两个：OOB Authentication Data Not Present和OOB Authentication Data from a Remote Device Present.
- AuthReq（Authentication Requirements）：这个field用于定义该设备对于配对流程所需要的安全性认证的需求，每个bit表示一个需求：BF（Bonding Flags）, MITM (Man In The Middle Protection)， SC（Secure Connections）和KP（Keypress）。
    - BF（Bonding Flags）：用于决定后续配对过程完成后是否需要把本次配对交换的密钥保存起来用于两者以后的连接通信，也就是绑定过程是否自动运行。
    - SC（Secure Connections）：用于决定后续的配对流程的执行是走LE Legacy Pairing还是LE Secure Connections流程。
    - MITM (Man In The Middle Protection)：用于标记本设备后续的配对过程要能够应对中间人攻击。
- Max Encryption Key Size：配对过程中加密Key的最大长度，取值范围为7-16个字节，会影响后续通信连接的加密强度。
- Initiator Key Distribution / Responder Key Distribution：对于Initiator和Responser而言，可以支持分发的密钥类型。在配对过程中需要在两个设备之间交换和分发的密钥包括以下三个： Long Term Key (LTK)，Identity Resolving Key (IRK)和Connection Signature Resolving Key (CSRK)。这个设置表示在配对过程中这些密钥应该由哪一端分发。

在进行配对的两个BLE设备之间交换Pairing Request包和Pairing Response包以后，双方就都了解了本次配对的IO交互能力以及对于配对的安全性需求等方面的信息，下一步就是决定具体的配对流程执行的模式，也就是所谓的Association Model。


## 配对流程Association Model的协商


具体的Paring执行的流程，依据于配对双方所具备的IO能力以及对于配对安全性的具体需求，可以分为以下几种Association Model：

- JW（Just Works）：安全性最低的配对流程操作方式，适用于两个设备都没有合理的手段去显示配对数字以及确认配对过程的执行。完全依赖于两个设备之间的通信，不需要用户参与配对操作的交互流程，这种配对方式无法应对中间人攻击MITM。
- PKE（Passkey Entry）：至少需要一个设备具备显示屏，另外一个设备具备输入能力。配对流程中，设备A显示一个数字，然后在设备B上输入这个数字后进行设备配对关系验证。因为它需要用户在这个流程中参与物理交互，因此有助于防止MITM攻击。
    - 对于LE Secure Connections模式下，也可以是两个设备都没有显示屏，但是都有键盘，此时两个设备都通过键盘输入一个相同的数字。
- NC（Numeric Comparison，数字比较）：适合于两个设备都有显示屏用以显示匹配数字的内容，以及有手段确认两端显示的一致性（例如确认按键）。配对过程中用户通过比较两个设备上显示的数字是否一致来保证配对流程的安全执行。与PKE一样，需要用户参与配对过程的验证环节，可以有效应对中间人攻击。
    - NC模式只在LE Secure Connections模式中存在，在LE Legacy Pairing模式中不存在。
- OOB（Out of Band，带外通信）：适合于两个设备都有蓝牙之外的带外通信能力。如果配对的双方都具备除蓝牙以外的另外一种带外通信能力的话，可以通过这种蓝牙通信之外的通信方式来交换安全性信息。

**LE Legacy Pairing可以支持JW，PKE和OOB这三种association model，而LE Secure Connections则可以支持以上所有的四种association model。**


下一步就是根据BLE设备之间交换Pairing Request包和Pairing Response包中所包含的配对设备IO能力，以及对于配对安全性的需求（SC，MITM等），就可以按照下面的逻辑来选择合适的配对模型。


![image.png](/images/blog/BLE设备配对模式和流程详细解析-3.png)

- 首先检查两个设备的SC（Secure Connections）标注，如果两个设备都设置了这个标志，后续的配对流程就走LE Secure Connections；只要有一方没有设置这个标志，就走LE Legacy Pairing流程。无论是走哪个流程，接下来就是选择合适的association model。
- 接下来检查两个设备的OOB（Out of Band）标志，如果两个设备都通过这个标志表示具备除蓝牙之外的其他带外通信能力，则使用OOB association model。只要有一方不具备OOB标志，就没法使用OOB，接下来判断MITM标志的设置情况。
- 如果两个设置都没有设置MITM (Man In The Middle Protection)标志，后续的配对流程就会选择JW association model，这种情况下的配对流程无法应对中间人攻击。而如果有一方或者两方都设置了MITM标志，则接下来根据两端具备的IO能力来选择合适的association model以应对MITM攻击。
- 接下来就是要分析两端所具备的IO能力：是否有显示屏可以用于显示数字？是否有键盘可以用于输入数字和字符？具体如何选择按照两者所具备的IO能力进行选择。

![image.png](/images/blog/BLE设备配对模式和流程详细解析-4.png)


至此，蓝牙配对的第一阶段就结束了，这个阶段主要就是通过双方明文交互的Pairing Request和Pairing Response消息来确定配对的流程、需求以及Association Model。


接下来就要进入第二阶段，主要是进行双方硬件的身份认证，然后建立加密链接以方便在第三阶段传输密钥信息。


---


## 配对流程阶段二：配对流程加密链路的建立LE Legacy Pairing


第一阶段双方通过交换Pairing Request和Pairing Response消息，完成了配对方式以及Association model的协商。


第二阶段主要的作用就是：

- 完成双方硬件身份认证的流程，确认对方就是自己要进行配对的设备。
- 为第三阶段配对密钥在两个设备之间交换和传输提供一个加密链路。

而如前所述，BLE配对流程存在两种模式：LE Legacy Pairing和LE Security Pairing。两者在配对流程的第二阶段差异极大，因此需要完整的分开来进行描述。这部分是LE Legacy Pairing模式下第二阶段工作流程的详细总结。


对于LE Legacy Pairing模式而言，配对流程加密链路的建立需要依赖于一个短期的加密密钥STK（short term key），这个STK仅用于配对过程中加密通信链路的建立，不会在两个设备之间长期保存和使用。


LE Legacy Pairing模式的阶段二执行流程大致如下所示。


![1734689246347.png](/images/blog/BLE设备配对模式和流程详细解析-5.png)


### 临时密钥TK的生成


STK的生成又要依赖于一个临时密钥TK（Temporary Key）。这个临时密钥TK长度是128位，依赖于具体的association model：

- 对于Just Works模式，TK是一个全0的值。因此最不安全。
- 对于Passkey Entry模式，由一端在屏幕上显示，以及用户在另一端设备上输入以进行确认的一个6位数字密码，这个数字密码占据TK的20bit，其他108bit使用0填充。安全性介于JW和OOB之间。
- 对于OOB模式，TK是一个通过OOB方式在两边传输的128bit随机数密钥。安全性最好。

通过这一步，进行配对的双方共享同一个TK，但是这个TK并不是通过此时还不安全的BLE发给对方的。


### 设备身份认证


这一步两个BLE设备会各自计算出来一个confirm value的128位值。confirm value的计算需要使用一个c1函数，其参数是前一步已经在BLE两端共享的TK，各自产生的随机数，以及在Pairing Request和Pairing Response消息中两者共享的数据。


对于Central设备而言，其产生的随机数是LP_RAND_I，计算出来的confirm value是LP_CONFIRM_I；对于Peripheral设备而言，其产生的随机数是LP_RAND_R，计算出来的confirm value是LP_CONFIRM_R。在两端参与计算的函数都是c1，计算参数除了LP_CONFIRM_I和LP_CONFIRM_R以外都是相同的，因此各自计算出来的LP_CONFIRM_I和LP_CONFIRM_R是不同的。


![1734603029013.png](/images/blog/BLE设备配对模式和流程详细解析-6.png)


然后Central设备把自己计算出来的confirm value也就是LP_CONFIRM_I发给Peripheral设备，Peripheral设备则把自己计算出来的LP_CONFIRM_R发送给Central设备。


Central设备收到Peripheral设备发过来的LP_CONFIRM_R以后，就把自己进行c1运算的随机数LP_RAND_I再发给Peripheral设备。此时Peripheral设备就同时有了Central设备的LP_RAND_I和LP_CONFIRM_I，然后Peripheral设备就会使用自己的TK以及收到的LP_RAND_I再进行以此c1运算，把计算结果与收到的LP_CONFIRM_I进行比较，如果两者匹配的话，对于Peripheral设备而言就可以确认它们两端参与c1运算的TK是相同的。此时Peripheral设备就完成了对Central设备身份的认证。


然后接下来同样的逻辑，Peripheral设备把自己的随机数LP_RAND_R发送给Central设备，此时Central设备就有了计算LP_CONFIRM_R的所有信息，同样执行一遍新的c1运算，把计算结果与之前收到的LP_CONFIRM_R进行比较。如果匹配的话，对于Central设备而言，它就可以清楚的知道自己的TK与Peripheral设备的TK是相同的。此时就是完成了Central设备对Peripheral设备身份的认证。


至此以上就通过确认双方的TK是一样的，Central设备和Peripheral设备之间完成了相互之间的身份认证，确定对方就是自己要进行配对和绑定的设备。**当然因为Just Works模式下双方的TK是全0，这个身份确认是没有任何意义的，所以Just Works模式实际上没有配对设备的身份认证流程，无法应对中间人攻击MITM。只不过Just Works模式通过以上流程在两端传输了两个随机数LP_RAND_R和LP_RAND_I，这两个随机数要在后面生成STK的时候使用。**


下图就是两个设备之间进行身份认证的完整通信和判断逻辑：


![1734604490831.png](/images/blog/BLE设备配对模式和流程详细解析-7.png)


### 生成STK密钥


接下来就是生成用于在配对流程中对通信链路进行加密的128bit短期密钥STK。STK的生成需要用到一个s1函数。


STK = s1(TK, LP_RAND_R, LP_RAND_I)


从以上s1函数的参数来看，TK，LP_RAND_R和LP_RAND_I全部在前一个设备之间相互认证的环节中已经双向传输了。因此对于两个设备而言，就可以分别使用s1函数来计算STK。

- 对于两端STK的计算而言，s1函数是一样的，两端共享的TK，LP_RAND_R和LP_RAND_I这三个参数也是一样的，那么其计算结果STK肯定就是一样的。
- 而从传输安全的角度看，LP_RAND_R和LP_RAND_I这两个随机数是在设备认证阶段的未加密链路中传输的，存在泄露的风险。但是对于OOB和Passkey两种模式而言，TK是使用OOB和Passkey传输和确认过的，根本就没有通过BLE链路传输，因此不存在泄露的风险，那么TK没有泄露的情况下STK的计算肯定就是安全的。
- **只不过对于Just Works模式而言，TK是全0，LP_RAND_R和LP_RAND_I这两个随机数是在设备认证阶段的未加密链路中传输的，所以STK仍然存在有泄露的风险。**

至此，Central设备和Peripheral设备就都有了可以用于对配对通信链路进行加密的STK密钥，后续配对流程的第三阶段就可以基于STK密钥来实现对配对流程的加密保护了。


---


## 配对流程阶段二：配对流程加密链路的建立LE Security Pairing


与LE Legacy Pairing迥异的是，LE Security Connections模式下采用了**公私钥体系**来实现对配对流程通信链路加密密钥的传递：该模式下会使用公私钥体系来生成和交换一个长期密钥LTK（Long Term Key），这个LTK不光用于配对流程第三阶段的通信链路进行加密，还会保存起来用于后续连接状态下数据通道的加密。


如前所述，大体的执行流程方面，LE Security Connections也分为三个大的阶段，其中第一阶段和第三阶段与LE Legacy Pairing没有区别，两者的区别主要就是体现在这个第二阶段，而且执行流程上的差异还很大，就一定要完整的分开来进行描述。


LE Security Connections模式第二阶段的总体流程如下图所示。


![1734656427648.png](/images/blog/BLE设备配对模式和流程详细解析-8.png)


当配对流程使用LE Security Connections模式时，根据第一阶段Pairing Request和Pairing Response双方的协商，可以使用全部四种Association Model：Just Works，Numerical Comparison，Passkey Entry以及OOB。比LE Legacy Pairing多了一个Numerical Comparison。


LE Security Connections模式的第二阶段主要可以分为四个步骤。


### 公钥交换


LE Security Connections模式的第二阶段首先由配对流程的发起方Initiator（也就是发出Pairing Request的那一方，即Central设备）发起流程。Initiator向Responder（也就是在第一阶段发出Pairing Response的那一方，即Peripheral设备）发出自己的公钥PKa，Responser则向Initiator发回自己的公钥PKb。至此通信双方都有了对方的公钥。


PKa和PKb都是在未加密的链路上传输的，但因为是公钥，所以对于安全性来讲没有威胁。


### 计算DHKey


下一步两个设备各自基于蓝牙规范中定义的P256算法生成一个DHKey。

- Initiator设备：DHKey=P256（SKa，PKb）。SKa是Initiator设备的私钥，PKb是Responder设备的公钥。
- Responder设备：DHKey=P256（SKb，PKa）。SKb是Responder设备的私钥，PKa是Initiator设备的公钥。

也就是说，对于通信双方而言，这个P256算法的输入参数都是自己的私钥和对方的公钥。**经过P256算法的巧妙设计，两端使用自己的私钥和对方的公钥计算出来的DHKey是相同的，也就是说，此时通信双方就计算出来一个相同的DHKey。**


尽管PKa和PKb此前是在未加密的链路上以明文传输的，但是两个设备的私钥SKa和SKb只保存在自己设备内部，所以DHKey的计算就是安全的。


## 设备硬件身份认证


设备身份认证这一步的具体执行，就跟前面根据双方IO能力所协商出来的Association Model相关。可选的Association Model包括Just Works，Numerical Comparison，Passkey Entry以及OOB这四种。这一步的目的就是要确认进行配对的设备的身份的正确性，当然，Just Works因为缺少必要的身份认证手段，在LE Security Connections模式实际上仍然是不具备设备身份认证的能力，只是走一遍流程而已。


为方便描述整个身份认证环节的执行流程，以下统一把配对流程的发起方Initiator称为Device A，把Responder称为Device B。


### 设备身份认证之JW/NC


Device B产生一个128bit的随机数Nb，然后以这个Nb还有两个设备的公钥（在公钥交换步骤已经拿到）作为参数，使用蓝牙规范所定义的f4算法计算出来一个confirm value B即Cb：

- Cb=f4（PKa，PKb，Nb，0）

然后Device B把计算出来的这个Cb发送给Device A。（此时Device A还不知道Nb）


下一步Device A生成自己的128bit随机数Na，然后把这个随机数发给Device B，Device B则向Device A返回自己之前生成的随机数Nb。现在Device A就有了所有用于计算Cb的参数，因此Device A基于收到的Nb重新执行一次f4算法，把自己计算的confirm value结果与前面收到的Cb相比较。如果两者一致的话（双方一致就说明前面阶段在双方之间共享的PKa和PKb信息是相同的）就继续往下走，否则就退出配对流程。


**到了这个阶段，实际上对于Just Works模式而言，设备身份认证的环节就结束了。这部分后面的步骤只是针对NC模式的。可以看到，上面的步骤只是通信双方生成并交换了随机数，并确认了双方持有的公钥信息的正确性，实际上并没有办法确认对方硬件身份的合法性。**


现在两个设备都确认过了双方的公钥PKa和PKb，以及双方所产生的随机数Na和Nb，那么接下来双方都通过蓝牙规范所定义的g2函数，以（PKa，PKb，Na，Nb）为参数计算出来自己的Confirm value，并且显示在自己的屏幕上。因为g2函数以及以上的四个参数都是相同的，所以双方计算和显示出来的confirm value肯定是相同的。


接下来就需要用户检查两个屏幕上显示的六位数字是否相同，如果相同的话通过按键操作确认，这样就保证了进行配对操作的两个设备之间的身份的合法性和正确性。


![385bc5cf-7ede-460e-8cdd-c2975b2c27ae.png](/images/blog/BLE设备配对模式和流程详细解析-9.png)


### 设备身份认证之Passkey Entry


对于Passkey Entry而言，默认的标准使用流程是需要进行配对的两个设备，一端有显示屏用于显示配对数字，另外一端有键盘输入这个数字以确认双方配对的硬件身份。而在LE Secure Connections模式下，Passkey Entry也能够支持两端都没有显示屏，但是都有键盘的使用场景，此时在两端配对的过程中通过键盘输入相同的数字来辅助进行设备认证。


接下来的身份认证阶段的运算流程比较复杂，基于两端匹配的6位数字的每一个bit，要进行20次（6位十进制数字最高是999999，对应于十六进制的0xF423F，因此总共最多有20位）反复的迭代运算和比较。


整个迭代比较的流程如下：


![image.png](/images/blog/BLE设备配对模式和流程详细解析-10.png)

- 2a和2b步骤就是在device A和device B上输入相同的配对数字，是一个六位数字，输入正确的情况下两者应该是相同的。然后在A和B两端分别把这个数字ra和rb按照二进制进行分解，分解为20个bit，后续的每一轮迭代计算用到其中一个bit。每个bit的命名就是rai和rbi，i表示第几次迭代。
- 3a和3b步骤分别在A和B两端各自产生一个128bit的随机数Na和Nb。每一轮迭代都产生新的随机数，所以每一轮的随机数就是Nai和Nbi。
- 4a和4b步骤分别在A和B两端使用蓝牙规范定义的f4算法，以两者前面阶段已经交换的公钥PKa和PKb，各自产生的随机数Na/Nb，以及本次迭代的验证数字的这一个bit位rai/rbi参数进行计算，在两端分别计算得到这一轮的Confirm Value，也就是Cai和Cbi。
- 5-8这几步就是在两端分别交换各自这一轮产生的随机数Nai和Nbi，各自计算出来的Cai和Cbi，然后在两边交叉计算后进行比较验证两端计算出来的confirm value是否一致。
- 第8步骤在计算出来的confirm value匹配的情况下，进行下一轮迭代，选择配对数字ra/rb的下一个bit重新执行3-8这几个步骤，直到所有的bit全部验证通过。

经过以上非常繁琐的运算和判断的过程，两个设备上输出的六位数配对数字更是被拆解为bit进入运算，即使在配对的流程中使用MITM中间人攻击对配对流程的数据交互进行监听，也大大增加了破解的难度，因此安全性方面比LE Legacy Pairing要好很多。


### 设备身份认证之OOB


与LE Legacy Pairing过程的OOB模式类似，LE Security Connections流程下OOB模式也需要通过非蓝牙通信以外的带外通信方式（NFC、二维码等）辅助进行设备硬件身份认证流程执行中部分信息的传输，只不过两者的执行流程差异极大。


下图是LE Security Connections流程下OOB模式的身份认证通信流程：


![image.png](/images/blog/BLE设备配对模式和流程详细解析-11.png)

- 首先两者各自产生一个随机数ra和rb，然后各自使用f4算法，以自己的公钥和产生的随机数作为参数计算出来各自的confirm value也就是Ca和Cb。
- 然后通过蓝牙之外的带外通信能力，把自己用于配对通信流程的随机蓝牙地址BD_ADDR_A/BD_ADDR_B，两端产生的随机数ra/rb，以及两端各自计算出来的confirm value Ca/Cb传递给对端。
- 两端分别基于OOB信道传递过来的信息重新以f4算法，使用对方的公钥和对方产生的随机数，再计算出来一个confirm value，对这个confirm value和对方通过OOB传过来的Ca/Cb进行对比是否一致。如果一致的话表示双方的硬件身份认证成功。
- 最后就是双方各自产生一个新的随机数Na和Nb，并传递给对方，用于在下一阶段生成长期密钥LTK。

## LTK的生成和校验


接下来就是在两端各自计算LTK。为了确保前面所有的环节都是正确的，以及确保两端计算的LTK是一致的，还需要通过另外一个MacKey来执行这个验证和确认的环节。


对于LTK和MacKey的计算而言，需要用到蓝牙规范中定义的f5算法。这个算法的输入参数包括DHKey，两端生成的随机数Na和Nb，以及两端在配对过程中所使用的蓝牙MAC地址BD_ADDR_C和BD_ADDR_P。


**MacKey || LTK = f5(DHKey, Na，Nb, BD_ADDR_C, BD_ADDR_P)**

- 经过前面所有的环节，DHKey，随机数Na和Nb，蓝牙MAC地址BD_ADDR_C和BD_ADDR_P这几个值两端都已经知道了，所以就可以分别使用f5函数来独立的计算出来MacKey和LTK。如果没有出现意外的话，两端计算出来的LTK和MacKey应该是一样的。

**至此后续用于对数据连接链路加密的长期密钥LTK就诞生了**。那么怎么保证两端生成的这个LTK是一致的呢？此时还要再对MacKey进行一次校验，如果MacKey相同的话，LTK也就没问题了。


MacKey验证的过程依赖于蓝牙规范定义的f6算法，参数是两端各自计算出来的MacKey，两端之前阶段交换的随机数Na和Nb，两端在配对过程中交换的IOCap信息（包含在Pairing Request和Pairing Response信息中），两端在配对过程中所使用的蓝牙MAC地址BD_ADDR_C和BD_ADDR_P。


MacKey验证的逻辑流程如下：

- Initiator按照f6算法计算出来自己的校验值EA，Responder按照6算法计算出来自己的校验值EB。注意两个计算的参数稍有差异，一个是IoCapA一个是IoCapB，所以EA和EB应该是不同的。
- Initiator把自己计算出来的EA发给Responder，Responder在自己这边重新按照与Initiator计算EA一样的参数和算法计算出来自己这边的EA，比较两个EA是否一致。如果一致的话，Responder就清楚的了解两端的MacKey和LTK是一致的。
- 相同的逻辑，Responder把自己计算出来的EB发给Initiator，Initiator在自己这边重新按照与Responder计算EB一样的参数和算法计算出来自己这边的EB，比较两个EB是否一致。如果一致的话，Initiator就清楚的了解两端的MacKey和LTK是一致的。
- 至此，Initiator和Responder就通过以上流程确认了两端MacKey和LTK的一致性。

可配合下图来完整理解LTK的生成和验证的逻辑：


![image.png](/images/blog/BLE设备配对模式和流程详细解析-12.png)


下一步就可以使用两端生成并且确认过的LTK对通信链路进行加密保护进入配对流程的第三阶段了。


---


## 配对流程阶段三：


到了第三阶段，就是基于第二阶段所生成的STK密钥（LE Legacy Pairing）或者LTK密钥（LE Secure Connections）对通信链路进行保护，后续配对流程的通信就全部是加密的了。


而第三阶段的主要作用也就是按照第一阶段双方在Pairing Request和Pairing Response消息中协商的要分享哪几个密钥（LTK, CSRK, IRK），密钥的长度，各个密钥由哪一端来分发等信息来安排好对于密钥分发的流程，最终的目的就是在两端同步后续进行数据通信的真正密钥。配对流程结束以后，短期密钥STK也就被废弃了（对于LE Legacy Pairing模式而言）。

- LTK, CSRK, IRK这三个才是两个设备之间后续数据通信过程中真正的通信密钥。
- 对于LE Security Connections模式而言，因为LTK在第二阶段已经交换过了，所以第三阶段就只需要通过加密连接在双方之间传输CSRK和IRK就好了。对于LE Legacy Pairing模式则需要在第三阶段的加密连接中传输上面的三个密钥。

以上在两端共享的密钥只会用于本次连接的后续通信，不会自动保存。下一次两个设备如何还要建立连接进行通信的话，那么就要按照以上配对流程完整的重新走一次以交换新的连接通信密钥。这样的话，看起来整个过程就太繁琐了。因此，如果在配对流程结束以后，把这次在两端共享的通信密钥保存下来，直接用于后续的通信过程，这样就可以省去每次连接都要配对的流程，而把配对密钥第三阶段通过加密连接交换的通信密钥保存起来的动作，就是绑定（Bonding）。经过绑定操作以后，两个设备以后重新连接就可以直接使用之前保存起来的通信密钥了。

- 配对流程结束后是否需要保存密钥（即执行bonding过程），取决于第一阶段Pairing Request和Pairing Response消息中所包含的Bonding Flags标志位。

![image.png](/images/blog/BLE设备配对模式和流程详细解析-13.png)


## 参考资料

- [Understanding Bluetooth LE Pairing—Step by Step - Technical Articles](https://www.allaboutcircuits.com/technical-articles/understanding-bluetooth-le-pairingstep-by-step/)
- Developer Study Guide: Bluetooth® Low Energy Security V1.2.1
- [BLE蓝牙技术详解](https://blog.csdn.net/qq_16106195/article/details/122685907)
