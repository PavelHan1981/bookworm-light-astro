---
title: "WiFi6的低功耗特性TWT简介"
slug: "2024-10-14-wifi6-low-power-TWT-summary"
description: "本文总结了在WiFi6中引入的新的低功耗工作模式TWT的工作流程及其与传统的Legacy Power Saving Mode的对比，三种TWT模式的交互流程以及对TWT在实际产品应用中的思考。"
date: 2024-10-14T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


之前在另外笔记中（[WiFi的低功耗策略实现机制总结](https://mp.weixin.qq.com/s/wZFGQAPdth8dzZ5eROOtGg)， [WiFi低功耗工作模式的完整工作流程总结](https://mp.weixin.qq.com/s/rJ1cKAMjziidO9gT4ol4RA)），我整理了经典wifi规范针对低功耗应用所支持的power saving工作流程。这种在STA端基于周期性监听DTIM消息来实现低功耗特性的功能，是目前各个wifi规范中针对低功耗尤其是电池供电的IoT WiFi产品所使用的标准处理方式。但是在WiFi 6（802.11ax）规范中，提供了一种新的更为激进的低功耗工作流程，这就是TWT。


## TWT的简介


TWT，Target Wake Time。TWT实际上是首次在802.11ah规范中提出，在802.11ax也就是WiFi6协议规范中正式确定下来，其初衷主要是针对IoT设备，尤其是低通信业务量的设备（例如智能电表等）设计的一套节能机制，可以使得IoT设备能够尽可能长时间地处于休眠状态，从而实现降低功耗的目的。总的来说，TWT是一种与传统的基于周期性唤醒监听DTIM Beacon Frame来实现低功耗特性的完全不同的低功耗技术。


TWT特点是能够让AP和STA之间更加灵活以及个性化的协商双方的唤醒工作时间，其最终的结果不仅仅是能够有效的改善电池产品的待机时间，也可以改善同一无线网络环境下多个设备之间同时通信所造成的无线信号相互冲突的问题。


在WiFi的经典Power Saving Mode中，AP以100ms或者200ms为周期定期发出Beacon Frame，在Beacon Frame中包含有是否缓冲STA数据的标记；STA以Beacon Frame Time为周期定期唤醒监听Beacon Frame，查询AP上是否有自己的缓冲数据，没有的情况下继续休眠，有自己的缓冲数据的情况下进入Normal状态从AP上获取自己的数据。在这个低功耗工作流程中，基本上是以STA为中心的，STA决定自己进入low power以及normal Mode的时机，以及由STA自行决定定时唤醒去监听Beacon Frame的时间周期，AP只是根据STA所处的模式来决定是直接把单播数据发给STA（Normal Mode）还是暂时缓存在buffer中等待STA唤醒后从AP上读取（Low Power Mode）。


而TWT Power Saving Mode下，STA就不需要再机械的定时唤醒去监听Beacon Frame了，而是和AP共同协商自己低功耗模式休眠时机、休眠时长、唤醒工作时长等参数，在这种情况下，STA就不需要数百ms周期性醒来去监听beacon frame，而是按照自己之前与AP协商好的休眠唤醒周期，在唤醒时机到来时唤醒工作，完成后重新进入休眠状态，这个休眠时间可以长达数秒，乃至数分钟和数小时（理论上，这个休眠周期的时长甚至可以达到23小时59分钟！），经典Power Saving Mode的数百ms休眠唤醒周期与TWT模式下的数分钟乃至数小时的休眠唤醒周期相比，TWT自然就可以更长时间关闭耗电的无线模块，从而达到更省电的设计目标；另外，TWT休眠模式，在各个设备的休眠唤醒时机等参数的协商方面，更多的要依赖于AP的整体调度和管理，这样AP清楚的了解和错开分配各个Low Power设备的工作时间段，同一时间段只有少量的设备参与无线通信，就可以尽可能避免同一无线网络下的通信冲突。


![1729238550165.png](/images/blog/WiFi6的低功耗特性TWT简介-1.png)


## TWT的工作流程


总的来说，TWT可以分为单播TWT、广播TWT和Opportunistic PS。


### 单播TWT


单播TWT是STA与AP协商一个双方都可以接受的休眠和唤醒的周期，由STA向AP发出这个TWT工作模式的请求，AP收到后发回应答，双方就成功的建立了一个TWT的低功耗模式工作协议。此后，STA在休眠周期内关闭TX和RX，保持为休眠状态。唤醒周期到了以后，STA打开RX等待接收AP发出的触发包（该触发包是一个可选的选项），然后打开TX进入数据收发的状态，数据收发完成后重新进入休眠状态，进行下一轮的TWT休眠唤醒周期。


每个STA和AP之间都进行独立的TWT工作周期、休眠/唤醒时隙、休眠/唤醒阶段的时长等参数的协商，这样的话，每个STA的唤醒时间段就可以在AP的协商下错开，避免各个STA与AP通信时可能出现的无线冲突的问题，更有效地利用无限频谱。


如上所属，AP和STA之间的TWT协议参数是在双方开启TWT协议工作模式之前通过STA发出TWT请求和AP返回TWT应答来进行交换的，这个交换的重点内容就是TWT参数集。


对于TWT参数集的协商而言，STA有三种请求方式：

- 请求TWT参数（Request TWT）。在这种模式下，STA不指定具体的TWT参数，而是由AP在应答消息中指定双方之间的TWT参数。
- 建议TWT参数（Suggest TWT）。在这种模式下，STA可以根据自身的情况发出一个建议的TWT参数，但是实际的TWT参数则由AP决定，AP可以在应答消息中根据自身网络状况修改TWT参数，返回给STA。
- 要求TWT参数（Demond TWT）。该模式下，STA提供一组自己要求的TWT参数，并且要求AP不能修改；那么对于AP而言，收到这种类型的参数以后，就只能返回接受或者拒绝的应答。

双方通过以上TWT参数集协商流程，成功的建立起TWT协议后，STA就开始进入休眠状态（TX和RX全部关闭，既不发送也不监听无线数据包），休眠TWT参数中指定的休眠周期后，再定时唤醒，无线功能进入活动状态开始进行数据的收发，完成后重新进入休眠状态，开启下一个TWT周期。


在AP和STA协商的TWT参数集中，还存在一个“AP是否需要在TWT唤醒阶段发送触发帧”的选项，当该选项使能以后，每次STA从休眠模式唤醒后，不会直接打开TX，而是首先打开RX等待接收AP的这个触发帧，收到以后再进入完整的活动状态。AP通过对触发帧的控制，尽可能避免STA唤醒后双向通信的数据包过多而导致的无线冲突问题。


下图是单播TWT在AP和STA之间收发数据包得了流程图，需要注意的就是，与传统的power saving mode不同的是，单播TWT下STA不需要再监听Beacon Frame了：


![image.png](/images/blog/WiFi6的低功耗特性TWT简介-2.png)


### 广播TWT


与单播TWT模式不同，广播TWT模式的情况下，AP和STA没有协商TWT参数集的工作流程。


在广播TWT模式下，首先是由AP在其Beacon Frame中携带一个或者多个TWT参数集的信息，多个TWT参数集使用TWT标识符来进行区分。STA在监听Beacon Frame时，可以从中解析出来目前AP所维护的TWT运行周期。当STA有意愿参与AP在Beacon Frame中所广播的某个TWT周期协议时，向AP发出请求加入某个TWT协议（通过TWT标识符指定要加入的TWT周期协议）的请求消息，完成这个加入TWT协议组的申请。完成后，STA即按照AP所指定的这个TWT协议组的TWT参数集来定期休眠和唤醒。


下图是广播TWT模式下AP和STA的工作数据包流程图，注意加入同一TWT协议组的多个STA会在同一时间休眠和唤醒，因此存在多个STA同时进行无线通信的冲突。


![image.png](/images/blog/WiFi6的低功耗特性TWT简介-3.png)


### Opportunistic PS


Opportunistic PS实际上与广播TWT非常类似，也是不需要AP和STA之间独立的协商TWT参数集，而是直接在Beacon Frame公布出来TWT参数集。而Opportunistic PS相比广播TWT更简单，STA要加入TWT的情况下，也不需要再给AP发出请求加入某个TWT协议组的消息。STA可以自行根据AP Beacon Frame中所提供的TWT参数自行决定是否加入TWT协议组，加入后开始进入休眠状态，到了TWT的wakeup时间段，AP发出TWT唤醒触发消息，然后多个被唤醒的STA基于OFDMA同步与AP进行数据包的交互，交互通信完成后进入休眠状态，等待下一个TWT唤醒周期的到来。


![image.png](/images/blog/WiFi6的低功耗特性TWT简介-4.png)


## TWT低功耗模式的应用思考


总结起来，WiFi6中所提供的TWT低功耗模式的工作流程，与传统的WiFi low power saving mode的工作流程差异还是很大的。因为TWT模式下，STA与AP之间可以自由灵活的协商（尤其是单播TWT）TWT参数集，即TWT的休眠和唤醒的时间周期，对于参与wifi通信不多、大多数情况下处于待机状态下的WiFi低功耗设备而言，确实是可以减少耗电比较多的TX和RX打开的时间，从而有效的降低wifi部分工作的功耗，同时各个设备的TWT周期可以在与AP进行TWT周期协商的过程中错开工作，也可以有效的降低多个设备同时与AP通信时，不可避免的无线冲突的问题。


但是需要清楚的认识到一点，就是TWT模式对于STA设备本身在低功耗模式下的工作状态要求是很高的：

- 这个STA设备绝大多数情况下并没有被动通信（即从AP到STA的下行主动通信）的需求。
- 这个STA设备对于来自外部的远程唤醒功能没有太大的实时性要求。

试想一下，如果一个设备在TWT协议参数所定义的较长的休眠时间段（例如超过几分钟）里面休眠的时候，此时外部网络向这个STA下发了比较多的数据，这些数据就需要暂时缓存在路由器里面，自然会对路由器的缓存造成比较大的压力；或者在这个设备处于休眠的状态下，外部网络下发了一个唤醒或者请求数据的操作，就需要等到下次这个设备进入TWT唤醒周期后才能给出应答，实时性肯定会非常差。


因此，这种TWT的协议对于抄表这类下行流量和实时性要求不高的应用是合适的，但是如果通信过程中这种随机性的下行流量和通信响应的实时性要求比较高的话，肯定是不适用的。


## 参考资料：

- [WIFI6 TWT机制介绍-CSDN博客](https://blog.csdn.net/shanbl_linux_android/article/details/125615836)
- [The Low-Power Advantage of Wi-Fi 6/6E: TWT Explained | Renesas 瑞萨电子](https://www.renesas.cn/zh/blogs/low-power-advantage-wi-fi-66e-twt-explained)
- 《企业WLAN架构和技术》2.4 802.11ax标准介绍
