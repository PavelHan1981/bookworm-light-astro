---
title: "Introduction to WiFi 6 Low-Power Feature: TWT"
slug: "2024-10-14-wifi6-low-power-TWT-summary"
description: "This article summarizes the workflow of TWT (Target Wake Time), a new low-power operating mode introduced in WiFi 6, compares it with the traditional Legacy Power Saving Mode, outlines the interaction processes of the three TWT modes, and shares insights on TWT in practical product applications."
date: 2024-10-14T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


Previously, in other notes ([Summary of Implementation Mechanisms for WiFi Low-Power Strategies](https://mp.weixin.qq.com/s/wZFGQAPdth8dzZ5eROOtGg), [Summary of Complete Workflows for WiFi Low-Power Operating Modes](https://mp.weixin.qq.com/s/rJ1cKAMjziidO9gT4ol4RA)), I reviewed the power-saving workflows supported by classical WiFi specifications for low-power applications. This feature—where the STA side achieves low power consumption based on periodic listening to DTIM messages—is currently the standard processing method used across various WiFi specifications for low-power, especially battery-powered, IoT WiFi products. However, in the WiFi 6 (802.11ax) specification, a new and more aggressive low-power workflow is introduced: TWT.


## Introduction to TWT


TWT stands for Target Wake Time. TWT was actually first proposed in the 802.11ah specification and officially finalized in the 802.11ax (WiFi 6) protocol specification. Its original intention was an energy-saving mechanism designed for IoT devices, especially those with low communication traffic (such as smart meters). It allows IoT devices to remain in a sleep state for as long as possible, thereby achieving the goal of lower power consumption. Overall, TWT is a completely different low-power technology compared to the traditional low-power feature based on periodically waking up to listen to DTIM Beacon Frames.


The characteristic of TWT is that it allows the AP and STA to negotiate their wake-up working times more flexibly and in a personalized manner. The ultimate result not only effectively improves the standby time of battery-powered products, but also alleviates wireless signal collisions caused by multiple devices communicating simultaneously in the same wireless network environment.


In the classic WiFi Power Saving Mode, the AP periodically transmits Beacon Frames at intervals of 100ms or 200ms, which contain an indication of whether STA data is buffered; the STA periodically wakes up at the Beacon Frame Time interval to listen for Beacon Frames and check whether there is buffered data for it on the AP. If there is no data, it continues to sleep; if there is data, it enters the Normal state to retrieve its data from the AP. In this low-power workflow, it is basically STA-centric. The STA decides when to enter low-power and normal modes, and independently determines the timing cycle to wake up and listen for Beacon Frames. The AP simply decides whether to send unicast data directly to the STA (Normal Mode) or temporarily buffer it in memory until the STA wakes up and reads it from the AP (Low Power Mode) based on the STA's current mode.


In contrast, under TWT Power Saving Mode, the STA no longer needs to mechanically and periodically wake up to listen to Beacon Frames. Instead, it negotiates parameters such as low-power sleep timing, sleep duration, and wake-up working duration jointly with the AP. In this scenario, the STA does not need to wake up every few hundred milliseconds to listen to beacon frames. Instead, it wakes up to work when the wake-up timing arrives—according to the sleep-wake cycle previously negotiated with the AP—and returns to sleep once finished. This sleep duration can last from several seconds up to several minutes or even hours (theoretically, the duration of this sleep cycle can even reach 23 hours and 59 minutes!). Compared to the hundreds of milliseconds sleep-wake cycle of the classic Power Saving Mode, TWT naturally allows the power-hungry wireless module to be turned off for much longer periods, achieving a more power-efficient design goal. Furthermore, in the negotiation of parameters such as sleep-wake timing for each device, TWT leans more heavily on the overall scheduling and management of the AP. By doing so, the AP clearly understands and staggers the working time slots of each low-power device, ensuring that only a small number of devices participate in wireless communication at any given time, thereby avoiding communication collisions within the same wireless network as much as possible.


![1729238550165.png](/images/blog/WiFi6的低功耗特性TWT简介-1.png)


## TWT Workflow


Generally speaking, TWT can be divided into Unicast TWT, Broadcast TWT, and Opportunistic PS.


### Unicast TWT


In Unicast TWT, the STA and AP negotiate a sleep and wake-up cycle acceptable to both parties. The STA sends a request for this TWT operating mode to the AP, and upon receiving it, the AP replies with an acknowledgment, successfully establishing a TWT low-power mode working agreement between them. Thereafter, the STA turns off TX and RX during the sleep cycle and remains in a sleep state. When the wake-up cycle arrives, the STA turns on RX to wait for the trigger frame sent by the AP (this trigger frame is an optional setting), then turns on TX to enter the data transmission state. Once data transmission is complete, it re-enters the sleep state and proceeds to the next round of the TWT sleep-wake cycle.


Independent parameters—such as the TWT working cycle, sleep/wake time slots, and the duration of sleep/wake phases—are negotiated between each STA and the AP. In this way, the wake-up time periods of each STA can be staggered under the AP's negotiation, avoiding potential wireless collisions when STAs communicate with the AP, and utilizing the wireless spectrum more efficiently.


As mentioned above, the TWT protocol parameters between the AP and STA are exchanged through the STA sending a TWT request and the AP returning a TWT response before both parties enable the TWT protocol working mode. The core focus of this exchange is the TWT parameter set.


Regarding the negotiation of the TWT parameter set, the STA has three request methods:

- **Request TWT**: In this mode, the STA does not specify concrete TWT parameters; instead, the AP specifies the TWT parameters between them in the response message.
- **Suggest TWT**: In this mode, the STA can issue suggested TWT parameters based on its own conditions, but the actual TWT parameters are decided by the AP. The AP can modify the TWT parameters in the response message according to its own network status and return them to the STA.
- **Demand TWT**: In this mode, the STA provides a set of its required TWT parameters and demands that the AP must not modify them. Upon receiving this type of parameter, the AP can only return an acceptance or rejection response.

After successfully establishing the TWT protocol through the above TWT parameter set negotiation process, the STA enters a sleep state (both TX and RX are completely turned off, neither transmitting nor listening to wireless data packets). After sleeping for the sleep period specified in the TWT parameters, it wakes up on schedule, its wireless function becomes active to start sending and receiving data, and once finished, it re-enters the sleep state to initiate the next TWT cycle.


In the TWT parameter set negotiated between the AP and STA, there is also an option called "whether the AP needs to send a trigger frame during the TWT wake-up phase." When this option is enabled, every time the STA wakes up from the sleep mode, it does not directly turn on TX, but first turns on RX to wait for this trigger frame from the AP, and only enters the full active state after receiving it. Through the control of trigger frames, the AP minimizes wireless collisions caused by an excessive number of bidirectional communication packets immediately after the STA wakes up.


The figure below is a flowchart of data packet transmission between the AP and STA in Unicast TWT. It should be noted that, unlike the traditional power-saving mode, the STA under Unicast TWT does not need to listen to Beacon Frames:


![image.png](/images/blog/WiFi6的低功耗特性TWT简介-2.png)


### Broadcast TWT


Unlike Unicast TWT mode, in Broadcast TWT mode, there is no workflow where the AP and STA independently negotiate TWT parameter sets.


In Broadcast TWT mode, the AP first carries one or more sets of TWT parameter information in its Beacon Frames, where multiple TWT parameter sets are distinguished using TWT identifiers. When listening to Beacon Frames, the STA can parse out the TWT operation cycles currently maintained by the AP. When the STA intends to participate in a certain TWT cycle protocol broadcasted by the AP in the Beacon Frames, it sends a request message to the AP to join that specific TWT protocol (specifying the TWT cycle protocol to join via the TWT identifier), completing the application to join the TWT protocol group. Once completed, the STA periodically sleeps and wakes up according to the TWT parameter set of this TWT protocol group designated by the AP.


The figure below is a data packet flowchart for AP and STAs in Broadcast TWT mode. Note that multiple STAs joining the same TWT protocol group will sleep and wake up at the same time, meaning collisions can occur when multiple STAs engage in wireless communication simultaneously.


![image.png](/images/blog/WiFi6的低功耗特性TWT简介-3.png)


### Opportunistic PS


Opportunistic PS is actually very similar to Broadcast TWT. It also does not require independent negotiation of TWT parameter sets between the AP and STA; instead, TWT parameter sets are directly advertised in the Beacon Frames. Compared to Broadcast TWT, Opportunistic PS is simpler: to join TWT, the STA does not need to send a message requesting to join a specific TWT protocol group to the AP. The STA can independently decide whether to join the TWT protocol group based on the TWT parameters provided in the AP's Beacon Frame. After joining, it enters a sleep state. When the TWT wakeup time slot arrives, the AP sends a TWT wakeup trigger message, and multiple awakened STAs interact with the AP in data packets synchronously based on OFDMA. After completing the interactive communication, they enter a sleep state, waiting for the arrival of the next TWT wakeup cycle.


![image.png](/images/blog/WiFi6的低功耗特性TWT简介-4.png)


## Reflections on TWT Low-Power Mode Applications


To sum up, the workflow of the TWT low-power mode provided in WiFi 6 differs significantly from that of the traditional WiFi low power saving mode. Because under TWT mode, the STA and AP can freely and flexibly negotiate (especially in Unicast TWT) the TWT parameter sets—namely the sleep and wake time cycles—WiFi low-power devices that do not participate heavily in WiFi communication and remain in standby most of the time can indeed reduce the active time of power-hungry TX andRX, thereby effectively lowering the power consumption of the WiFi component. At the same time, the TWT cycles of various devices can be staggered during the TWT cycle negotiation process with the AP, which also effectively reduces inevitable wireless collisions when multiple devices communicate with the AP simultaneously.


However, it must be clearly recognized that TWT mode places high demands on the working state of the STA device itself while in low-power mode:

- The STA device has almost no requirement for passive communication (i.e., unsolicited downlink communication from the AP to the STA) under most circumstances.
- The STA device does not have strict real-time requirements for remote wake-up functions originating from external sources.

Imagine if a device is sleeping during a relatively long sleep period defined by the TWT protocol parameters (e.g., exceeding several minutes), and during this time the external network sends a significant amount of data down to this STA. These data would need to be temporarily buffered in the router, naturally placing considerable pressure on the router's buffer. Alternatively, if an external network issues a wake-up or data request operation while the device is in a sleep state, it must wait until the device enters the next TWT wake-up cycle before an response can be given, which certainly results in very poor real-time performance.


Therefore, the TWT protocol is well-suited for applications like meter reading where downlink traffic and real-time requirements are low. However, if the communication involves random downlink traffic with high requirements for real-time communication response, it is definitely not applicable.


## References:

- [Introduction to WIFI6 TWT Mechanism - CSDN Blog](https://blog.csdn.net/shanbl_linux_android/article/details/125615836)
- [The Low-Power Advantage of Wi-Fi 6/6E: TWT Explained | Renesas Electronics](https://www.renesas.cn/zh/blogs/low-power-advantage-wi-fi-66e-twt-explained)
- "Enterprise WLAN Architecture and Technology", Section 2.4 Introduction to 802.11ax Standard