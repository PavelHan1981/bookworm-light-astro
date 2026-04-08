---
title: "BLE的跳频机制和流程实现详细总结"
slug: "2024-12-10-the-frequency-hopping-suammery-in-BLE"
description: "本文对BLE的跳频工作流程，跳频机制的相关参数，以及跳频信道的计算逻辑进行了详细的整理。"
date: 2024-12-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["蓝牙"]
draft: false
---


## Connection Event与Connection Interval


对于BLE跳频机制工作流程的理解，首先要从理解connection event和connection interval的概念开始。因为BLE设备建立连接后的通信是以connection event为单位进行跳频操作的。


两个BLE设备建立连接以后，设备之间的通信时间就会被按照connection interval分割为一个个独立的connection event。


具体的connection interval参数在两个BLE设备建立连接时的request connection参数中进行协商，理论上这个时间周期在7.5ms到4s之间，以1.25ms为步进单位。


在每个connection event，总是由master（也就是central设备）发起。master向slave（也就是Peripheral设备）发出一个数据包，slave再向master发回一个响应包。


下图就演示了在每个connection event中，central设备和Peripheral设备进行空包交互（即使没有数据通信需求，也需要收发一个空包来维持连接）、central设备发出数据、central设备从Peripheral设备读取数据以及Central设备和Peripheral设备相互收发数据的示意图。


![image.png](/images/blog/BLE的跳频机制和流程实现详细总结-1.png)

- 如果双方之间的第一次通信交互之后还有更多的通信数据要收发，master就再向slave发出一个数据包，slave再发回响应包，如此循环往复。因此一个connection event中可以传输多个BLE包，但不同的BLE硬件设备和操作系统对于一个connection event中能够传输的BLE包的最大个数有不同的规定。因此，如果两个设备之间有很多的数据要收发的话，需要按照顺序把这些数据分割到多个connection event中进行通信。
- 在每个connection event之内，每次通信交互都由Central设备发出一个数据包，然后Peripheral设备返回一个应答包。当一个connection event中有多个包要收发时，两端收发的流程也始终是以Central-Peripheral-Central-Peripheral-…这样的顺序来循环往复。那么当Central设备没有数据要发送、Peripheral未能收到Central所发出的数据包、Peripheral因为各种原因未能发回响应包、Central设备没有收到Peripheral所发回的响应包等情况发生，当前connection event中两个BLE设备的通信中断，两个设备的TX和RX均关闭以降低功耗，等到下一个connection event周期再重新重新。
- 即使BLE通信的两个设备之间当前没有数据要收发，也要在每个connection event的开头对传一个空包用于同步两者之间的通信时钟。

BLE设备建立连接后的通信是以connection event为单位进行跳频操作的，也就是说在每个独立的connection event中，Central设备和Peripheral设备始终维持在同一个BLE信道中进行交互通信，等到了下一个connection event所在的时间周期，两个设备都同时切换到下一个信道来进行下一个connection interval时间周期内的通信。


而connection interval参数，以及两者每个connection event结束后如何选择和切换到一个新的BLE信道的工作逻辑，则在两个设备在建立连接时的连接参数中进行协商。


## BLE连接建立的参数


BLE连接的建立总是从Central设备向Peripheral设备发起一个连接请求包开始。


在广播模式下，Peripheral设备定时、循环在37，38，39这三个广播信道上发出广播包，每次发出广播包以后打开RX监听信道一段时间，然后切换到下一个信道继续进行广播。Central设备建立连接之前，必须先在广播信道对广播包进行监听，在接收到要连接的Peripheral设备发出的广播包时，向Peripheral设备发出connection request尝试建立连接。


![62981bb7-688f-4fbd-ac50-482c7297f887.png](/images/blog/BLE的跳频机制和流程实现详细总结-2.png)


两个设备在尝试建立连接的connection process过程中，会对连接后的通信连接参数进行协商。以下对连接参数中与跳频机制以及通信两端收发包的逻辑相关的参数进行总结和解释：


### Connection Interval


connection interval在前一部分已经做了详细的解释。就是BLE连接成功建立以后，Central设备和Peripheral设备之间通信的connection event的周期时间长度。


也就是说，在BLE连接通信的过程中，连接通信的双方每隔connection interval时间唤醒一次，在两者之间收发几个数据包以后重新进入休眠状态，等到下一个connection interval周期的到来。这样的情况下，绝大多数时间中通信设备的TX和RX都处于休眠状态，以此来实现低功耗的功能特性。


### Supervision Timeout


BLE连接通信建立过程中还会协商一个supervision timeout的时间参数，这个参数定义了双方之间的通信超时的判断条件。对于Central设备和Peripheral设备，当距离其成功接收到对端最后一个数据包的时间长度超过supervision timeout所制定的时长时，就会认为当前连接已经断开，下次通信就需要重新扫描广播包和建立连接。


supervision timeout参数就是用于Central设备和Peripheral设备任意一端的通信发生异常（如运行崩溃，没电了，走出信号覆盖范围之外）的情况下，两者能够从通信的故障状态中恢复出来。


### Peripheral latency


按照以上所描述的connection event，即使没有数据要收发的情况下，Central设备和Peripheral设备之间也需要在每个connection event开始的时候，由Central发起进行一次空包的交互。但是如果两个设备之间长期没有数据要收发，而每次connection event都要进行一次空包交互的话，对于BLE的省电特性会有很大的影响。


因此，在Central设备和Peripheral设备建立连接的时候，双方之间也会协商一个peripheral latency的参数。这个参数用于指定在Peripheral设备没有数据要发给Central的时候，最多可以在多少个connection event不需要等待接收和应答来自Central设备的空包数据。在设置peripheral latency参数的情况下，Peripheral设备在没有数据要发出的情况下，就不需要每次connection event中都去监听和响应来自Central的数据包，只需要每隔几个connection event给Central的发出一个应答包就可以维持双方之间的通信连接（当然这个时间不能超过前面介绍的supervision timeout的时间长度）。


peripheral latency参数对于Peripheral设备而言，因为不需要每次connection event都去唤醒接收和应答数据包，因此低功耗和省电的特性更好，但是毫无疑问的会劣化通信的实时性表现。如果Central设备有数据要发给Peripheral的话，必须要等到每个peripheral latency指定的connection event通信周期内，Peripheral设备才有机会接收这个数据并响应。因此这个参数的具体设置，需要在省电和实时响应之间做出一定的取舍。


## Channel Map


Channel Map信息在BLE连接建立时所协商的连接请求包中占据5个字节，这5个字节中的每一个bit代表一个BLE信道的好坏状态，因此Channel Map就是在Central设备和Peripheral设备之间共享当前无线环境下40个BLE通信信道的好坏状态列表，由此来决定后续BLE连接建立后跳频算法可用的通信信道。


Channel Map的每一个bit用于标记这个信道的可用状态，used表示这个信道可以被用于后续的通信中，unused表示这个信道不应该被用于后续通信之中。


### Hop Increment


Hop Increment是BLE连接建立时，通信双方所协商的一个随机数值，取值范围在5-16之间。


Hop Increment用于BLE的跳频信道选择算法，Central设备和Peripheral设备使用相同的跳频信道选择算法、Hop Increment参数以及Channel Map独立计算出来每个connection event应该使用的BLE通信信道。因为信道选择算法、Hop Increment以及Channel Map对于两者都是一样的，所以Central设备和Peripheral设备在后续连接后每个connection event所选择的信道肯定都是一致的，否则就没法稳定通信了。


## BLE连接跳频通信的信道选择逻辑


如上所述，在BLE连接建立以后，两个设备之间就以之前协商好的Connection Interval为周期进行不同的通信信道之间跳频操作。每个Connection Interval通信周期都使用不同的信道进行通信，避免2.4GHz频段下复杂的无线干扰对于通信稳定性的影响。


设备之间在各个信道之间的跳频算法：unmappedChannel = (lastUnmappedChannel + hopIncrement) mod 37。


lastUnmappedChannel 是当前Connection Event周期中两个设备所使用的信号编号；hopIncrement是两者在建立连接时协商出来的跳频步进参数，其取值在5-16之间；unmappedChannel 就表示下一个Connection Event两者通信应该使用的信号。


![image.png](/images/blog/BLE的跳频机制和流程实现详细总结-3.png)


考虑到2.4GHz频段上运行的各种RF通信应用五花八门，这个频段的存在严重的干扰问题，部分信道可能会因为与当前环境中存在的路由器工作频段相重叠，如果BLE通信建立后也在这些信道通信的话，势必会产生严重的无线信号冲突的问题，因此。BLE跳频算法还提供了一个Channel Map的机制对于当前环境中可用的BLE信道进一步筛选。Channel Map参数在BLE连接建立的过程中在两个设备之间同步，用5个字节的长度标记BLE所有通信信道的可用情况。


按照以上的跳频算法所计算出来的通信信道，如果被Channel Map参数标记为可用信道，则下一次connection event就使用这个信道进行通信。而如果跳频算法计算出来的下一跳信道被Channel Map参数标记为不可用，则还要按照下面的信道重映射逻辑进行更进一步的处理。


不可用信道的重映射算法：remappingIndex = unmappedChannel mod numUsedChannels。


在这个重映射算法中，unmappedChannel 是重映射之前的信道编号，实际上也就是跳频算法所计算出来，但是被Channel Map标记为不可用状态的信道编号；numUsedChannels是Channel Map中所有处于可用状态的信道的数量；remappingIndex 就是重映射以后的信道编号。那么接下来，真正会被下一个connection event用于通信的信道编号，就是使用remappingIndex 从channel map中所有可用信道列表中找到的那个通信信道。


整个BLE模式下通信信道跳频的计算逻辑如下图所示：


![image.png](/images/blog/BLE的跳频机制和流程实现详细总结-4.png)


## 广播信道下的跳频


为了应对2.4GHz频段所存在的复杂通信环境，BLE在广播模式下的通信同样使用了跳频通信的机制。BLE的40个信道之中，其中最后的三个信道37，38，39就这三个信道就专门用于广播模式下的通信，用两个设备之间的自动发现、辅助建立连接以及Beacon模式等的通信。


如上所述，在广播模式下，Peripheral设备会定时、循环在37，38，39这三个广播信道上发出广播包。在这三个广播信道上跳频广播，以及这三个广播信道的频点的选择就很有讲究了。如下图所示，三个广播信道的频点分别对应于2402MHz，2426MHz，2480MHz，刚好完美的避开了最常用的三个互不混叠的wifi信道1，6，11所在的频谱空间，这样就可以最大限度上避免WiFi信道上的通信对于三个广播信道所造成的干扰。


![image.png](/images/blog/BLE的跳频机制和流程实现详细总结-5.png)


## 参考资料

- [Bluetooth® Low Energy Channels - Developer Help](https://developerhelp.microchip.com/xwiki/bin/view/applications/ble/introduction/bluetooth-architecture/bluetooth-controller-layer/bluetooth-link-layer/Channels/)
- [Ultimate Guide to Managing Your BLE Connection | Punch Through](https://punchthrough.com/manage-ble-connection/)
- [Connection process - Nordic Developer Academy](https://academy.nordicsemi.com/courses/bluetooth-low-energy-fundamentals/lessons/lesson-3-bluetooth-le-connections/topic/connection-process/)
- [BLE链路层信道选择算法浅析 - 浮生问道 - 博客园](https://www.cnblogs.com/ethan-yan/p/14723310.html)
- [蓝牙跳频算法分析【经典蓝牙 vs BLE 4.x vs BT 5.0 BLE部分】_ble跳频算法2-CSDN博客](https://blog.csdn.net/weixin_42583147/article/details/82623805)
