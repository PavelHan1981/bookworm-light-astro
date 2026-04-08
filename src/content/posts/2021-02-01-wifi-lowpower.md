---
title: "WiFi低功耗工作模式的完整工作流程总结"
slug: "2021-02-01-wifi-lowpower"
description: "在本文中对802.11规范中定义的WiFi低功耗模式、工作流程及其不同模式下的切换进行总结。"
date: 2021-02-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["无线通信","WiFi"]
draft: false
---


## **STA的两种不同的功耗工作模式**


总的来说，STA包含有两种不同的功耗工作模式：

- Active Mode：在这种状态下，WiFi的无线信号接收电路RX始终处于打开状态，因此可以在任何时间接收AP发过来的数据帧。
    - 因为STA的RX要保持打开状态，这种模式下自然功耗较大；
- PS（Power Saving） Mode：这种状态下，STA的RX大多数时间保存关闭状态，只需要定时同步打开RX并监听AP发出的Beacon Frame，以此达到尽可能节约能耗的目的；

注意：只有STA才有低功耗模式，对于AP而言因为要实时的对所连接的STA设备进行状态管理和包转发，因此一定是处于Active Mode下；


连接在同一个AP上的STA既可以处于active mode下，也可以处于PS mode下，AP需要对每一个STA是在Active mode还是PS mode有清晰的管理，这样才知道是否需要为某个特定的STA缓存数据（PS mode）还是直接发送出去（Active Mode）；


## **STA处于Active Mode：**

- 当STA处于Active Mode的情况下，STA的RX会始终保持打开状态，此时AP可以随时把需要发给这个STA的数据包直接发送给STA；
- 当STA处于Active Mode的情况下，STA向AP发送的所有数据包的MAC Header Frame Control中的Power Management bit应保持为0；

## **STA进入PS低功耗模式：**

- 当STA需要进入低功耗运行模式的时候，STA通过设置MAC Header Frame Control中的Power Management bit为1，来通知AP自己将要进入低功耗待机模式；
- 当STA处于低功耗模式运行时，其发出的所有包的Power Management bit均应该保持设置为1；
- 当AP接收到STA发出的数据包的MAC Header Frame Control中的Power Management bit为1，表示这个STA将会进入低功耗运行模式，此后AP在收到发给这个STA的数据包时，就会把这个数据包暂时缓存起来；

## **STA低功耗模式的运行逻辑**

- AP会以固定的Beacon Interval周期（一般为100ms或者200ms）向外发出自己的Beacon Frame，在这个Beacon Frame中包含有TIM Field，这个Tim Field以bitmap（即连接到AP的每个STA对应于其中的一个bit）的形式包含有AP是否为这个STA缓存数据的标记；
    - 当AP有为某个处于PS mode的STA缓存数据的情况下，bitmap中与该STA对应的bit会被设置为1；否则为0；
- 当某个STA进入低功耗模式以后，在AP收到其他（外部）设备发给这个STA的包后，就会暂时为这个STA缓存这个数据，然后通过Beacon Frame的TIM信息中的bitmap来通知STA有缓冲数据；
- 当STA处于低功耗模式运行时，STA的RX绝大多数时间处于关闭状态，以Listen Interval（每个STA可以单独设置自己的listen interval，以beacon interval为单位）为周期唤醒，等待接收来自AP发出的Beacon Frame；
    - Listen Interval越大，STA越省电，但是STA接收到外部数据的延迟越大；
    - Listen Interval越小，STA接收到外部数据的延迟越小，但是因为要频繁醒来监听Beacon Frame，因此更耗电；
- 当STA处于低功耗模式运行时，STA按照预先设定的Listen interval周期性唤醒接收到Beacon Frame，对其中的TIM信息进行解析，了解到AP中有自己的缓存数据；
    - 如果AP中没有自己的缓存数据，STA关闭RX继续休眠，等待Listen Interval后重新唤醒检查，反复执行以上运行逻辑；
    - 如果AP中有自己的缓存数据，STA会主动通过以下PS-Poll的机制来获取这个数据；
        - STA向AP发出一个PS-Poll Frame，请求AP发回自己的缓存数据包；
        - AP收到PS-Poll Frame以后，会把这个STA缓存的一个数据帧发给STA；
        - 如果AP上有针对这个STA的多个数据帧，那么会把返回的数据帧的MAC Header中的more data bit设置为1，这样STA就知道AP上还有它的缓冲帧；然后STA回继续以上过程，重复向AP发出PS-Poll Frame，直到把所有的数据帧全部接收完毕；

## **STA退出PS低功耗模式**

- 当STA需要退出低功耗运行模式的时候，STA通过设置MAC Header Frame Control中的Power Management bit为0，来通知AP自己将要退出低功耗待机模式，进入Active mode；
- 当STA处于Active模式运行时，其发出的所有包的Power Management bit均应该保持设置为0；
- 当AP接收到STA发出的数据包的MAC Header Frame Control中的Power Management bit为0，表示这个STA退出低功耗运行模式进入Active mode，此后AP在收到发给这个STA的数据包时，就会把这个数据包直接转发给STA；
- 当某个STA退出PS mode时，AP会检查自己当前是否有为这个STA缓存数据包，如果有的话就立即把这些缓存的数据全部发给这个STA；

## **参考资料**

- Part 11: Wireless LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications, 2007；
