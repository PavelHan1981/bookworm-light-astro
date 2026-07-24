---
title: "Correction to My Understanding of Dual-Band WiFi Antenna Multiplexing and a Comparison Between Duplexer and Diplexer"
slug: "2025-01-17-the-comparison-of-duplexer-and-diplexer"
description: "In summary:
- A Diplexer is mainly used in applications where different frequency bands share a single antenna or transmission link for communication. The most typical examples are dual-band WiFi (two bands) and multiple LTE bands.
- A Duplexer is primarily used within the same frequency band, utilizing different uplink and downlink communication frequency points under the FDD mode to achieve simultaneous transmit and receive full-duplex communication. The most typical application is LTE FDD communication."
date: 2025-01-17T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Wireless Communication"]
tags: ["Wireless Communication", "Hardware", "WiFi"]
draft: false
---


Previously, in another note of mine describing 2.4GHz and 5GHz dual-band WiFi sharing a single antenna for communication, based on my understanding of the diagram below:



![image.png](/images/blog/对双频WiFi天线复用理解的纠正以及对Duplexer和Diplexer的比较-1.png)


I simply thought: _Regarding the antenna multiplexing issue of dual-band WiFi, the logic is actually consistent with the antenna multiplexing scenario between WiFi and Bluetooth: regardless of how multiplexing is implemented, it is ultimately achieved through a time-division mechanism. At any given moment, either the 2.4GHz band is using the WiFi antenna, or the 5GHz band is using it. Since it is a time-division antenna multiplexing logic, it will inevitably have a certain impact on the communication throughput of each band. If we use the simplest proportional time-division multiplexing logic to switch the SPDT switch, then for both the 2.4GHz and 5GHz bands, only half of the time can they have access to the antenna, which will naturally cause a significant impact on the communication throughput of each band. Especially for RF reception, if a received signal arrives at the antenna port but the SPDT switch fails to switch to its matching operating frequency band, this data packet will definitely be dropped, and the problem can only be resolved later through retransmission after the switch toggles over. Therefore, the impact of such frequent switching on RF transceiver throughput is unavoidable._


**However, my above understanding and summary are actually incorrect.** Thanks to the correction pointed out by a netizen named Seas Li, for the antenna multiplexing design of 2.4GHz/5GHz dual-band WiFi, a more reasonable implementation is not to use the aforementioned RF switch for time-division multiplexing between the two, but rather to use a Diplexer to achieve parallel operation of both without interfering with each other. This eliminates the need for time-division switching and avoids any impact on throughput.


The following questions then arise:

- What is a Diplexer and how does it work (i.e., how does a Diplexer allow different frequency bands to use the antenna simultaneously without interference)?
- What are the differences in application between a Diplexer and similar components like a Duplexer?
- Since a Diplexer is a more rational design for dual-band WiFi antenna multiplexing, why does the earlier dual-band WiFi block diagram explicitly show the use of an SPDT RF switch for switching?

The purpose of this note is to attempt to explain and analyze these questions.


## RF Diplexer and Its Working Principle


A Diplexer used in RF circuits is sometimes referred to as a duplexer in certain materials. However, another device with similar functions, the Duplexer, is also commonly called a duplexer. Therefore, some literature refers to the Diplexer as a "diplexer" and the Duplexer as a "duplexer". To avoid confusion, this article uniformly uses the English terms Diplexer and Duplexer, without getting bogged down in the minor details of naming conventions.


**In terms of function, the primary role of a Diplexer is to separate or combine signals of different frequency bands, enabling multiple signals from different frequency bands to be received and transmitted simultaneously using a single antenna or transmission channel.** From the perspective of dual-band WiFi, a Diplexer can separate (for reception) and combine (for transmission) the 2.4GHz and 5GHz band signals of dual-band WiFi, allowing both bands to share a single antenna simultaneously for communication. Similarly to dual-band WiFi, communications across multiple different frequency bands (bands) on an LTE smartphone can also use a Diplexer for isolation.


In terms of working principle, a Diplexer internally contains two independent bandpass filters corresponding to the different frequency bands it needs to isolate:

- For signal transmission, RF signals from different frequency bands are filtered by their respective bandpass filters. Because the passbands of the two filters are different, the signals can be superintended and transmitted simultaneously using a single antenna.
- For signal reception, RF signals received from the antenna are filtered by the bandpass filters, allowing only signals within their respective frequency ranges to pass. This enables the antenna to receive multiple RF signals of different frequencies simultaneously, which are then routed to their respective demodulation circuits after bandpass filtering by the Diplexer.

![image.png](/images/blog/对双频WiFi天线复用理解的纠正以及对Duplexer和Diplexer的比较-2.png)


Through the bandpass filtering approach described above, the separation and combination of multiple different frequency band signals during simultaneous communication can be achieved.


For dual-band WiFi, the structure using a Diplexer for simultaneous parallel operation of the 2.4GHz and 5GHz bands is shown in the figure below:



![image.png](/images/blog/对双频WiFi天线复用理解的纠正以及对Duplexer和Diplexer的比较-3.png)


## Analysis of Application Differences Between Diplexer and Duplexer


Having explained the working principle and primary application scenarios of a Diplexer, we inevitably encounter another type of duplexer device—the Duplexer. What is duplexing? **Duplexing means that communication devices can perform bidirectional transmission simultaneously, meaning they can transmit and receive at the same time.** As duplexers, both the Diplexer and Duplexer are used to resolve duplex communication in RF communications, ensuring that two communicating devices can talk to each other simultaneously.


The understanding of a Diplexer is relatively straightforward: it is used to isolate and distinguish two or more signals of different frequency bands, preventing conflicts between signals of different bands during simultaneous communication. Its functioning mechanism is fundamentally based on two bandpass filters targeting different frequency bands, with a generally large spacing between the two bands.


The explanation of a Duplexer found in many materials is: A Duplexer is used to isolate the transmitted signal and received signal of the *same* frequency band, allowing the transmitter and receiver of the same frequency band to share a single antenna without interfering with each other during simultaneous communication. This is often accompanied by a schematic diagram like this:



![image.png](/images/blog/对双频WiFi天线复用理解的纠正以及对Duplexer和Diplexer的比较-4.png)


The overall impression given is that a Diplexer supports parallel communication across two different frequency bands without mutual interference, while a Duplexer supports the transmission and reception of the *same* frequency band sharing a single antenna for simultaneous, interference-free communication.


However, questions arise:

- All materials regarding Duplexers mention that Duplexers are only used in FDD systems. Since it is FDD, the frequencies used for the transmitting and receiving channels are different. Yet, a Duplexer is used to solve the sharing of transmission and reception within the *same* frequency band. Aren't these two points contradictory?
- In time-division communication mechanisms such as WiFi, BLE, and TD-LTE, it is often stated that the RF module is either in a receiving state or a transmitting state at the same frequency point, and cannot receive and transmit simultaneously at the same frequency (which is essentially half-duplex). So how can a Duplexer achieve full-duplex communication of transmission and reception within the same frequency band?

Regarding the above schematic diagram and the two questions, my understanding is:

- A Duplexer is indeed only used in FDD systems. Taking LTE FDD communication as an example, a single band contains multiple communication frequency points. Uplink and downlink communications (corresponding to the transceiver functions of the base station and mobile phone, respectively) use different frequency points. In other words, the transmitting and receiving channels reside at different frequency points within the same band. The spacing between the two frequency points is relatively small, but they can be distinguished and isolated through internal bandpass filtering within the Duplexer, enabling simultaneous communication without mutual interference.
- Communication methods like WiFi and BLE, which use the same frequency for uplink and downlink and rely on a time-division mechanism, can only achieve a half-duplex communication state of either transmitting or receiving at any given time. On the other hand, for FDD communication methods that use different frequency points for uplink and downlink, full-duplex communication is naturally achievable because the two frequency points can be distinguished and isolated using filters.

### Application Differences Between the Two


In summary:

- A Diplexer is primarily used in applications where different frequency bands share a single antenna or transmission link for communication, most typically seen in dual-band WiFi (two bands) and multiple LTE bands.
- A Duplexer is primarily used within the same frequency band, utilizing different uplink and downlink communication frequency points under FDD mode to achieve simultaneous transmit and receive full-duplex communication. The most typical application is LTE FDD mode communication.

**So, for 2.4GHz single-band WiFi or BLE TX and RX switching, which one is used—a Diplexer or a Duplexer?** The answer is neither. Under single-band 2.4GHz conditions, it does not involve the multi-band multiplexing issue that a Diplexer aims to solve, making a Diplexer inappropriate. Meanwhile, WiFi and BLE use a time-division communication mechanism, utilizing channels of the same frequency for uplink and downlink, which does not fit the FDD full-duplex communication problem that a Duplexer solves, making a Duplexer inappropriate either. In this case, an RF switch (or antenna switch) is used, which determines and decides whether TX or RX connects to the antenna.


## Why Does the Header Block Diagram Use an SPDT RF Switch Instead of a Diplexer?


The question then arises: from the perspective of the working principles of Diplexers, Duplexers, switches, etc., a Diplexer is indeed a more rational technical choice for implementing the sharing of a single antenna across different frequency bands in dual-band WiFi. So why did the dual-band WiFi architecture diagram in the header use an SPDT switch to toggle between the two bands for antenna usage?
Regarding this question, I specifically consulted the FAE of this supplier. The reply from the supplier was that, considering factors such as cost and typical application scenarios for their WiFi module, although it supports both bands of dual-band WiFi, part of the RF circuitry for the 5GHz and 2.4GHz bands is shared. Therefore, even if a Diplexer were used for antenna sharing, the subsequent RF circuitry would still not be able to support independent operation of the two bands. As a result, choosing an SPDT antenna switch to select between the two bands was a rational design choice under these circumstances.


## References

- [RF Devices - Basics of Duplexers](https://mp.weixin.qq.com/s/pZh8mCrZ_XZNQx8boHbs3Q)
- "Wireless Secrets: Introduction to RF Circuit Design", Chapter 6
- [Wireless Communication | Concepts, Functions, Parameters, and Selection of Duplexers and Diplexers - Zhihu](https://zhuanlan.zhihu.com/p/710673603)