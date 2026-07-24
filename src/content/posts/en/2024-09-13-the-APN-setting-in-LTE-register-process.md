---
title: "LTE Module Network Registration Process and APN Settings"
slug: "2024-09-13-the-APN-setting-in-LTE-register-process"
description: "This article provides a detailed summary of the concepts of APN and PLMN related to the LTE network registration process. Building upon the understanding of these two concepts, it outlines the typical network registration process for LTE modules and key precautions."
date: 2024-09-13T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Mobile Communication"]
tags: ["Wireless Communication"]
draft: false
---

To understand the macro-level framework of the network registration process for an LTE module after power-on—ensuring the device can successfully access the internet via the LTE module—it is crucial to first understand two concepts: APN and PLMN.

## What is an APN?

APN stands for Access Point Name. An APN is a network access technology used in mobile communication networks. Smartphones and LTE modules must be configured with this parameter to properly access the network; the APN settings determine how and to which network the device connects.

Let's use the diagram below to understand the role of an APN:

![image.png](/images/blog/LTE模块注网过程及其APN设置-1.png)

- As shown in the figure above, APN settings essentially restrict the networks that a smartphone or LTE module can further access, and how they access them, after connecting to a base station. Depending on the APN parameters configured on the terminal during the registration process, the core network directs the terminal traffic into different networks.
- Generally, the network we want to access using smartphones and LTE modules is the public internet. However, during the interaction between the base station and the core network, smartphone and LTE module traffic can also be routed into other internal corporate networks (subject to certain authentication steps). Therefore, **during the network registration process where the LTE module or smartphone connects to the base station, an APN parameter must be transmitted to the base station, specifying the accessible network and the access method.**

In most cases, the APN must be configured into the LTE module by the host processor, and the LTE module will use this APN information when attempting to register with the base station. Network access is only successful when the configured APN matches the base station's requirements. Consequently, the Android file system contains a built-in list of APN information from major carriers, allowing the phone to query and apply the corresponding APN based on the connected base station during network connection. However, some carrier base stations also feature APN error-correction capabilities. If the APN uploaded by the terminal is empty or incorrect during registration, the base station will send down a correct APN to ensure the terminal can access the network properly. Note, however, that not all base stations from all carriers support this APN error-correction feature. Therefore, the safest approach is still for the terminal to configure the APN that corresponds specifically to the target base station.

## What is a PLMN?

PLMN stands for Public Land Mobile Network, which is essentially the mobile communication network. Simply put, PLMNs are used to distinguish between different network operators, **though it should be noted that a single mobile operator may correspond to multiple PLMNs.**

Every SIM card is burned with the Home PLMN information written by the carrier at the time of issuance, and this Home PLMN is also simultaneously written into the carrier's PLMN database. Additionally, to support roaming services, the SIM card contains PLMN information of roaming partners in other regions contracted by the issuing carrier. Some virtual network operators (MVNOs) issue SIM cards that can connect to base stations of multiple operators, requiring a list of supported operator PLMNs to be written onto the SIM card.

PLMNs can be categorized into different types, such as the operator's Home PLMN, Equivalent Home PLMN, and Roaming PLMN. Below are explanations of the primary PLMN types:

- **RPLMN**: Registered PLMN. The PLMN where the terminal was registered before its last shutdown or loss of coverage (i.e., the last successfully connected PLMN information). This PLMN information is temporarily saved on the USIM card (though newer specifications write RPLMN information to the terminal device's memory instead of the SIM card) and is prioritized during the next power-on connection.
- **HPLMN**: Home PLMN. The carrier home PLMN information corresponding to the IMSI of the user's SIM card, representing the PLMN of the SIM card's issuing carrier.
- **EHPLMN**: Equivalent Home PLMN. The HPLMN corresponding to an operator may have different PLMN number blocks; for example, China Mobile has three blocks: 46000, 46002, and 46007. 46002 is an EHPLMN relative to 46000, which is written to the SIM card by the operator during card manufacturing. Generally, users receive the same network services on an operator's equivalent PLMN as they do on their home PLMN.
- **OPLMN**: Operator Controlled PLMN. Available documentation does not clearly explain this concept, but a reasonable explanation is that carriers write the PLMNs of operators with whom they have roaming agreements into the USIM card as OPLMNs, serving as recommendations for subsequent network selection by the user.
    - Regarding this PLMN, my understanding is that it acts as a Roaming PLMN. For instance, to allow users to access mobile networks abroad, China Mobile signs roaming agreements with overseas operators. This enables China Mobile users to travel abroad, connect directly to a contracted overseas carrier's base station without changing their SIM card, and continue enjoying network services, with costs settled between China Mobile and the overseas carrier. This Roaming PLMN stores the PLMN information of contracted roaming partners. Once abroad, the device can select a roaming partner during PLMN selection and establish a connection with its base station.
- **FPLMN**: Forbidden PLMN. FPLMNs are networks denied for access. Typically, when a terminal's attempt to access a particular PLMN is rejected, it adds that PLMN to this list. Once added to the forbidden list, the terminal will no longer attempt to connect to base stations corresponding to this PLMN. Under normal circumstances, the FPLMN list is rarely used.

A SIM card stores various types of PLMN information it supports, and every base station deployed by an operator has a definite PLMN. Therefore, during the specific network registration process, two PLMN lists exist:

- The PLMN list supported by the SIM card, where different types of PLMNs have different priorities.
- The PLMN list of all base stations scanned across full frequency bands at the terminal device's current location, which includes base station PLMNs not supported by the SIM card.

When a terminal powers on and establishes an initial connection with a base station, or when it reconnects after losing connection, it must select a base station PLMN to connect to based on these two PLMN lists—factoring in the priority of the SIM card's PLMN list and the signal strength of surrounding base stations.

It is also worth mentioning that the PLMN discussed here can essentially be considered the same thing as MNC and MCC terminology, and the IMSI also contains MNC, MCC, and PLMN information:

- A PLMN is actually a 6-digit ID consisting of two parts: MCC and MNC, each taking up three digits. MCC stands for Mobile Country Code (China's country code is 460). MNC stands for Mobile Network Code, which represents the networks of different operators within each country.

![1726814481978.png](/images/blog/LTE模块注网过程及其APN设置-2.png)

- IMSI: International Mobile Subscriber Identity, used to identify mobile communication users globally. An IMSI contains three parts: MCC, MNC, and MSIN (Mobile Subscriber Identity Number). The definitions of MCC and MNC are the same as those of the PLMN mentioned earlier, while the MSIN is used to pinpoint a specific user within a given mobile operator network. For the network registration process, the MCC and MNC information within the IMSI is primarily what is used.

![image.png](/images/blog/LTE模块注网过程及其APN设置-3.png)

## Relationship Between PLMN and APN

As mentioned above, a single SIM card may contain multiple PLMNs, including the last used PLMN, Home PLMN, Equivalent Home PLMN, and Roaming PLMN. Each operator base station's PLMN is unique, and during network registration, the APN corresponding to each PLMN is one-to-one. Successful registration and internet connection can only be achieved by configuring the APN that matches the registered PLMN.

Therefore, the LTE network registration process actually involves finding the base station corresponding to the best PLMN—by comparing the SIM card's PLMN list with the surrounding base station PLMN list obtained via a full-frequency scan by the LTE terminal—configuring the APN that corresponds one-to-one with this PLMN, and thereby completing the registration process.

## Typical Network Registration Process

Typical network registration application scenarios mainly occur in two situations: when an LTE terminal/module powers on, or when a terminal moves from a no-signal coverage area into a signal-covered area.

- Once an LTE terminal completes network registration and connects to a specific base station, subsequent cell handovers among base stations belonging to the same carrier do not require re-registration. The cell handover process is handled directly between the LTE module and the base station without interrupting the network connection. The handed-over cell always shares the same PLMN. Re-registration only occurs when the LTE terminal enters an area entirely uncovered by this PLMN's base stations, completely breaking the connection, and subsequently re-enters a signal-covered area to reconnect.

When an LTE module or terminal powers on:

- The LTE module first performs a full-frequency band scan of surrounding wireless base station signals to obtain a list of all scannable base station PLMNs and their signal strengths in the vicinity;
    - The PLMN list obtained from this full-frequency scan is also prioritized. Aside from signal strength, it relates to user settings—for example, if a user sets the mode to "LTE Preferred" or "LTE Only," LTE-mode PLMNs receive higher priority during registration.
    - This full-frequency scan is relatively time-consuming, typically taking over 30 seconds. To speed up scanning and registration, the terminal saves information such as the last connected PLMN and its frequency channels in the module or SIM card. During the next power-on, it prioritizes scanning the previously connected PLMN. If detected, the full-frequency scan can be skipped, allowing it to directly determine the registration PLMN and initiate PLMN registration. If the previously saved PLMN cannot be scanned, a full-frequency scan is then performed.
- The LTE module reads the supported PLMNs from the SIM card in order of priority, compares them with the surrounding wireless base station PLMN list and their signal strengths, finds the highest-priority PLMN matching both the SIM card and current wireless signal environment, and attempts network registration.
- During this registration process, the host processor must simultaneously configure the corresponding APN based on the PLMN determined by the LTE module. Network registration succeeds only if the APN is configured correctly. Once successful, the LTE terminal and module enter a camped state and can use the network normally.
- If the registration attempt fails, the terminal will continue trying the next priority PLMN in sequence (at which point the host processor must also timely update the APN configuration corresponding to the new PLMN) until a PLMN successfully completes registration. If all PLMNs fail to register, the LTE terminal enters limited service, during which only emergency calls can be made.

When an LTE terminal is in an area without network signal coverage, the general process is similar to the above. However, to mitigate power consumption caused by continuous full-frequency scanning by the terminal, an LTE terminal cannot scan in the background indefinitely when signals are absent; instead, it typically initiates full-frequency scan rounds periodically. Once the scan results show that the terminal has returned to a signal-covered area, it executes the full-frequency network registration process described above and re-enters the camped state.

## Reference Documents

- [Meanings of Common PLMNs (RPLMN, HPLMN...) and Automatic Network Selection Principles - Wireless Mobile - C114 Communication Home - Powered by C114 (txrjy.com)](https://www.txrjy.com/thread-731793-1-52.html)
- [4G APN Architecture Diagram, 4G Module APN Settings - Karen's Technical Blog - 51CTO Blog](https://blog.51cto.com/u_12187/8354166)
- [https://python.quectel.com/doc/Application_guide/zh/network-comm/nic/cellular/FAQ.html](https://python.quectel.com/doc/Application_guide/zh/network-comm/nic/cellular/FAQ.html)
- [Globally Unique Cellular Network ID PLMN - Zhihu (zhihu.com)](https://zhuanlan.zhihu.com/p/656156154)
- *LTE Tutorial: Mechanisms and Procedures (2nd Edition)*, Chapter 1: Idle State Processing Mechanisms