---
title: "Detailed Explanation of WiFi Roaming Protocols - IEEE 802.11 k/v/r"
slug: "2025-03-28-the-wifi-protocol-of-ieee-80211kvr"
description: "This article explains the concept of wireless roaming in WiFi communications and traditional roaming workflows. It also provides a detailed summary of the three major protocols supporting the WiFi wireless roaming process—IEEE 802.11K/V/R—and elaborates on the specific problems each protocol solves."
date: 2025-03-28T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


This article explains the concept of wireless roaming in WiFi communications and traditional roaming workflows. It also provides a detailed summary of the three major protocols supporting the WiFi wireless roaming process—IEEE 802.11K/V/R—and elaborates on the specific problems each protocol solves.


To support fast and efficient seamless roaming of WiFi devices between different APs, the IEEE 802.11 working group specifically defined three protocols: 802.11K, 802.11V, and 802.11R, collectively referred to as the 802.11 KVR protocols. Together, these three protocols comprehensively solve the problems of "when to initiate a roaming handover," "which AP to roam to," and "how to roam quickly" during the WiFi wireless roaming process.


## What is Wireless Roaming?


Since the IEEE 802.11KVR protocol suite primarily addresses WiFi wireless roaming, we must first define what wireless roaming is and how a WiFi STA interacts with various APs throughout the entire wireless roaming process.


WiFi roaming refers to the process where a mobile device (such as a smartphone, laptop, etc.) automatically switches between different WiFi Access Points (APs) to maintain the continuity of its wireless network communication services. This process aims to minimize network interruption time during the switch and avoid noticeable impacts on communication services. Simply put, it is like walking around your house with your phone from the living room to the bedroom. As the WiFi signal in the living room weakens, your phone automatically connects to the router in the bedroom with a stronger WiFi signal, ensuring that your WiFi network stays connected to the AP with the strongest signal while allowing you to use the network continuously, smoothly, and without interruption.


As is well known, due to the wireless nature of WiFi communications, wireless signals attenuate very rapidly as they travel through space. Consequently, the coverage area of a single AP is quite limited, typically spanning only a few tens of meters. For a STA that needs to move across a larger space while maintaining a connection to an AP, multiple APs must be deployed at different locations. When the wireless terminal STA moves into the overlapping boundary region of two APs, it associates with the new AP and disassociates from the original AP, maintaining uninterrupted network connectivity throughout the process. This is the general execution process of wireless roaming.


![image.png](/images/blog/WiFi漫游协议详解-IEEE-802.11-kvr-1.png)


### Traditional Wireless Roaming Workflow


The complete workflow of traditional wireless roaming is as follows: As the wireless terminal gradually moves away from its currently associated AP, the terminal perceives a gradual decrease in signal strength via RSSI. At this point, the terminal can detect the presence of surrounding APs by probing broadcast frames across multiple channels in the current environment and begin interacting with them. When the signal of the wireless terminal reaches the threshold for roaming handover, the terminal triggers roaming, associates with the new AP, and disconnects from the original AP, thereby completing the AP switch.


**As can be seen from the above process, in the traditional model, the roaming behavior of the wireless terminal is entirely controlled by the terminal itself. The terminal determines the roaming trigger mechanism and decision logic based on roaming handover thresholds and by independently probing the signal strengths and other parameters of all surrounding WiFi hotspots.**


### Problems with the Traditional Wireless Roaming Model

- **Severe packet loss during the pre-handover process**. During the process where the wireless terminal measures and decides to perform a wireless roaming handover, it must frequently switch between multiple channels to listen to broadcast frames while interacting with multiple other APs. From a communication perspective, this entire process is time-consuming, and packet loss in the normal service data communications maintained in the current connection is inevitable.
- **Untimely roaming triggers**. The trigger condition for traditional wireless roaming is simply the signal threshold of the currently connected AP; switching occurs only when the signal strength drops below this threshold. However, if another AP with better communication quality exists in the current environment before the threshold is reached, a switch will not be triggered. This causes the terminal to remain connected to an AP with a degraded signal, resulting in a poor user communication experience.
- **The selected roaming AP may not be the optimal AP**. According to the workflow described above, for the terminal, the comparison criterion for choosing a new AP is its signal strength. In reality, however, multiple APs existing in the current space have varying workloads. Therefore, when selecting a new AP, its current load should also be comprehensively considered to choose the one with the least load whenever possible, rather than relying solely on signal strength.
- **Excessively long association times with the new AP**. This is particularly true when the AP has complex security authentication modes enabled, such as 802.1X. Due to the requirements of wireless communication security protocols and procedures, completing the full re-association process between the STA and AP takes a relatively long time. This inevitably causes application-layer communication to freeze during this period, degrading the user experience.

The 802.11KVR fast roaming protocol suite introduced by IEEE for wireless roaming is designed to solve these exact problems. **The difference between the new roaming model supporting 802.11 K/V/R and the traditional roaming model is that the complete workflow and execution logic of K/V/R roaming are determined jointly by the AC, AP, and wireless terminal.**


## 802.11K


The full name of the 802.11K protocol is Radio Resource Measurement of Wireless LANs (RRM).


**The primary working objective of the 802.11K protocol is to collect and share all AP-related information in the current wireless environment (such as signal strength, channel load, workload status, neighbor AP lists, etc.) through mutual communication between the AP and STA, assisting the STA in finding the optimal AP for its next wireless roaming operation.**


The workflow of the 802.11K protocol is as follows:

- The terminal actively requests neighbor report information from the AP. When the terminal STA detects that the signal quality of its currently connected AP is degrading (most typically when the RSSI drops below its preset threshold), the STA sends a Neighbor Report Request frame to the AP.
- Upon receiving this request, the AP generates a Neighbor Report and sends it back to the terminal. This neighbor report contains information such as: static information of neighboring APs maintained in real-time by the AP itself (e.g., SSID, BSSID, channel, etc.), as well as dynamic information (current load, signal strength (RSSI), channel interference, etc., of each AP).
- The terminal decides and executes the handover. After receiving the neighbor report information, the terminal evaluates it based on comprehensive metrics (such as signal strength, load, interference, etc.) and selects the optimal AP as the roaming target.

As seen from the workflow above, the 802.11K protocol focuses on shortening the STA's channel scanning time during roaming. The AP currently connected to the STA provides the candidate AP list and its channel information, while the STA ultimately retains the primary role in deciding the roaming handover logic.


## 802.11V


The full name of the 802.11V protocol is Wireless Network Management (WNM). **Similar to the 802.11K protocol, the 802.11V protocol is also used to solve the problem of unreasonable roaming target selection in traditional roaming workflows. However, the main difference between the two lies in whether the AP acts via passive reporting or active guidance within the decision-making mechanism.**


With the support of the 802.11V protocol, the AP can actively recommend the optimal roaming AP to the terminal based on dynamic network changes, rather than relying solely on the terminal's independent selection. This proactive AP adjustment prevents a single AP in the network from becoming overloaded, thereby improving overall network throughput.


Regarding its specific working mechanism:

- After obtaining the neighbor AP list information via the 802.11K protocol, the AP can further utilize the BSS Transition Management (BTM) mechanism of 802.11V to send a recommended handover list containing parameters such as the load and interference of each candidate AP to the terminal, guiding it to select the best AP.
- Additionally, during normal operation, when an AP detects that its own communication load is too high, it can migrate some terminals to lower-load APs through directed roaming requests (such as sending a BSS Transition Query frame).

Therefore, compared to the 802.11K protocol, the decision-making entity in the wireless roaming process shifts to AP-suggested or AP-led under the 802.11V protocol. Its ultimate goal is to achieve load balancing among various APs in the network and optimize overall network performance.


## 802.11R


The main function of the 802.11R protocol is Fast Basic Service Set Transition (FT). Its core objective is to achieve millisecond-level seamless roaming handovers by simplifying the authentication process during AP association and optimizing the key management mechanism, all without degrading security performance. Therefore, the 802.11R protocol specifically addresses the business interruption issues caused by lengthy security authentication procedures between STAs and APs in traditional roaming.


In networks supporting WPA2/WPA3 encryption or 802.1X authentication, traditional roaming methods require re-executing a complete 4-Way Handshake and key negotiation. Consequently, this complete association process can take hundreds of milliseconds or even seconds. **I have detailed the complete packet interaction process of WPA/WPA2 in another note:** [Detailed Explanation of WiFi WPA/WPA2 4-Way Handshake Authentication Mechanism | pavelhan.tech](https://www.pavelhan.tech/article/2024-06-07-wifi-wpa2-4way-handshake-details).


In contrast, the 802.11R protocol utilizes mechanisms such as pre-authentication and key caching to compress the re-association and handover time between the STA and AP to within 50 milliseconds, thereby meeting real-time service requirements such as voice calls (VoWiFi) and AR/VR education.


In terms of specific implementation, the core mechanism by which 802.11R achieves fast association handover times is Fast BSS Transition (FT):

- Pre-authentication mechanism: Before switching, the STA terminal establishes a secure tunnel with the target AP via the current AP, completing identity verification and key negotiation in advance. This avoids repetitive authentication procedures during the handover.
- Hierarchical key management: The 802.11R protocol introduces a two-tier key architecture consisting of PMK-R0 (Master Key) and PMK-R1 (Derived Key). PMK-R0 is centrally distributed by the AC to a group of APs, while PMK-R1 is dynamically generated by each AP based on PMK-R0, enabling cross-AP key sharing.
- Four-way interaction optimization: The 8-10 message exchanges of traditional roaming workflows are simplified to 4 (Reassociation Request/Response + FT Action frame exchange), reducing signaling overhead by over 50%.

## Summary


Together, the three protocols—IEEE 802.11K, 802.11V, and 802.11R—provide a relatively complete solution for how WiFi devices achieve fast and efficient seamless roaming between different APs. Among them:

- 802.11K focuses on continuously collecting static information about the current wireless environment on the AP. When a STA needs to switch APs, it reads this static information from its currently connected AP and then decides which new AP to switch to. Throughout this process, although the AP provides environmental information related to roaming handovers to the STA, the STA remains the primary decision-maker, with the AP playing a passive role.
- 802.11V focuses more on managing dynamic load balancing across the overall network. It relies more heavily on the AP proactively initiating or guiding the STA to switch to a less-loaded new AP. This optimizes overall network communication performance while achieving network-wide load balancing. In this process, the AP adopts a relatively more active role from the perspective of overall network performance and planning.
- 802.11R optimizes the association time between the AP and STA, as well as the corresponding key management and authentication mechanisms during the roaming handover process. It shortens the STA's association time with the new AP while ensuring security authentication, preventing communication experience degradation at the user layer caused by frequent handovers.

## References

- [Introduction to 802.11K/V/R Protocols](https://www.ruijie.com.cn/jszl/90154/)
- [802.11k/v/r - lsgxeva - Blogs.cnblogs](https://www.cnblogs.com/lsgxeva/p/16240429.html)