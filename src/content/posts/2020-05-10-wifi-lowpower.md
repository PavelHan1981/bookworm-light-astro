---
title: "WiFi的低功耗策略实现机制总结"
slug: "2020-05-10-wifi-lowpower"
description: "本文总结了802.11协议中定义的WiFi低功耗模式的工作流程，以及Beacon TIM/DTIM信息的解析。"
date: 2020-05-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi","低功耗"]
draft: false
---


## **WiFi的低功耗工作模式**


低功耗工作模式禁止：STA在大部分时间保持RF接收器打开等待和监听是否有自己的无线数据包，在需要发送数据的时候切换为RF发射状态。

- 在这种情况下，AP会直接把所有发给这个STA的frame直接发给这个STA，不会为其缓存frame。
- 这种情况下STA的RF电路的大部分都需要保持开启状态，非常耗电；

低功耗工作模式使能：STA通知AP自己即将进入低功耗模式，AP就会为这个STA缓存数据帧；STA周期性的醒来，通过Beacon Frame中的TIM Field了解到AP上是否有自己的缓存数据，有的话就发出PS-Poll frame获取这些缓存帧；完成后重新进入低功耗状态；

- STA处于低功耗状态下，AP收到发给这个STA的数据后，不会直接发给这个STA，而是先为其缓存，等待其发出PS-Poll来获取或者等待这个STA重新进入唤醒模式（Power management bit设置为1）；
- 在低功耗模式下，STA的RF电路大部分的时间只有时钟部分在工作，只有定期醒来需要进行数据交互的时候才需要接收器或者发射器工作，因此非常省电；
- 对于应用层而言，一般通过WiFi原厂提供的接口来设置STA进入低功耗模式；

## **低功耗模式的整体工作流程**


STA要进入低功耗工作模式的时候，就会把发给AP的frame的Power Managerment bit设置为1，表示其将进入低功耗模式；


AP收到后就会为这个STA缓存所有要发送给它的单播数据帧，并且在它发出的周期性Beacon Frame的TIM Field设置标志，标记这个STA在AP中有缓存帧；


STA周期性醒来，等待接收来自AP的beacon frame；通过beacon frame中的TIM信息了解到是否有自己的缓存帧；

- 如果没有自己的缓存帧，STA就会重新进入休眠状态；
- 如果有自己的缓存帧的话，STA就会向AP发出一个PS-Poll frame请求获取自己的缓存帧，AP收到后就会把缓存的Frame发给STA；

STA把缓存在AP上的所有frame都读取到本地处理之后，就可以重新进入休眠状态；


## **More Data**


以上所描述的低功耗模式的工作流程里，有一个问题：如果在STA休眠期间，AP为STA缓存了多个帧，而不是一个帧的话，应该如何处理？这就是More Data标志的用武之地了。


![Untitled.png](/images/blog/WiFi的低功耗策略实现机制总结-1.png)


More Data是MAC Frame Header的Frame Control Field中的一个标志。


STA向AP发出一个PS-Poll Frame，AP就会给它回一个Data Frame，并根据情况设置这个Data Frame的More Data标志：

- 当AP中还有更多缓存帧的话，设置为1，这样STA就需要继续发出PS-Poll Frame，并等待读取下一个缓存的Data Frame，并继续检查More Data标志，直到所有缓存的Data Frame读完，那么最后一个Data Frame的More data标志就会设置为0；
- 如果AP中没有更多缓存帧，那么这个More Data标志就是0，同时AP发出的Beacon Frame的TIM中也不会再设置这个STA中有缓存帧的标志；STA在收到这个Data Frame就会了解到AP中没有为自己缓存的帧；这个时候它就可以重新进入休眠状态了；

## **DTIM**


TIM：Traffic Indication Map；


DTIM：Delivery Traffic Indication Map；


每一个Beacon Frame中都包含有TIM信息，但是并非每个beacon帧中都包含DTIM信息。


TIM信息结构体中描述的是AP中为每个STA缓存的单播帧信息，处于休眠状态的STA可以通过TIM信息了解到AP是否有为自己缓存的单播帧；


DTIM信息结构体中描述的则是AP中所缓存的组播/广播帧；

- 当AP下连接的所有STA都始终处于Wakeup状态，即没有一个STA处于低功耗状态的时候，AP会把所有的广播/组播帧直接向外发送，不会在AP中进行缓存；
- 只要AP下连接的一个STA进入低功耗模式，那么AP会先把所有的广播/组播帧缓存起来，等到包含有DTIM信息的Beacon frame发出去后，再把这些缓存的广播/组播帧向整个网络广播出去；广播完成后会继续把新的广播/组播帧缓存起来，等到下一个DTIM周期到来后再发出去；
- 如下图所示，AP如果有缓存的广播和组播帧的话，会在每个DTIM Beacon frame发出之后，把这些缓存的广播和组播帧一起发出去，因此如果STA的应用对广播和组播帧的内容感兴趣的话就需要在DTIM Beacon Frame保持唤醒状态等待接收这些广播帧；
- 

![Untitled.png](/images/blog/WiFi的低功耗策略实现机制总结-2.png)


TIM与DTIM信息结构体的组织结构是一样的：


![Untitled.png](/images/blog/WiFi的低功耗策略实现机制总结-3.png)

- DTIM Count：表示当前的这个Beacon Frame后面还有几个Beacon Frame里面才包含有DTIM信息；如果这个值为0的话，表示当前的这个Beacon Frame就包含有DTIM信息，否则这个Beacon中包含的是TIM信息；
    - 是一个倒计时计数值，从DTIM Period开始倒计时为0，周而复始；
- DTIM Period：表示每隔几个Beacon Frame有一个包含有DTIM信息，是一个固定数字，可以在AP的设置界面进行设置；
- Bitmap Control：1个字节
    - bit0：如果是TIM信息，则这个bit为0；如果是DTIM信息，并且AP有缓存的广播/组播帧，则这个bit为1，否则仍然为0；
    - Bit7-1：与Partial Virtual Bitmap合并在一起表示AP为哪些STA缓存了单播帧；
- Partial Virtual Bitmap：2个字节
    - 与Bitmap Control的高7bit合并在一起表示AP为哪些STA缓存了单播帧；
    - 具体的算法可以参考《802.11-2012》Annex O；

## **另外一种低功耗模式的实现策略**


以上所描述的在Beacon的TIM中包含帧缓存标志+PS-Poll获取缓存帧的方式并非是802.11规范提供的唯一一种低功耗实现策略。


一些厂商还提供了另外一种不使用PS-Poll的低功耗实现策略，具体的实现流程如下：

- STA在要进入低功耗模式的时候，向AP发出一个空Data frame，把其Power Management bit设置为1，表示这个STA要进入低功耗模式；
- 此后AP就会为这个STA缓存要发给这个STA的帧，并在Beacon的TIM域中广播；
- STA周期性的唤醒后，不需要等待和关注Beacon Frame中的TIM标志的内容，直接向AP重新发一个空Data frame，把其Power Management bit设置为0，表示它退出低功耗模式；
- AP在收到这个空Data Frame以后就会停止为这个STA缓存帧，并立即把之前为这个STA缓存的所有帧发给这个STA；
- 如果之前AP没有收到这个STA的缓存帧，就不需要做任何事情；
- STA在收到所有的缓存帧以后，就会重新发一个Power Management bit设置为1的空Data frame，重新进入低功耗模式。

## **参考资料：**

- 《CWAP WLAN ANALYSIS》第四章；
- [How to: Get the Most from 802.11 Multicasting](http://www.wireless-nets.com/resources/tutorials/802.11_multicasting.html)
- [802.11 – TIM and DTIM Information Elements](https://blogs.arubanetworks.com/industries/802-11-tim-and-dtim-information-elements/)
