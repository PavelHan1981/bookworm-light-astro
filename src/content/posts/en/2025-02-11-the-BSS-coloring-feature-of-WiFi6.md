---
title: "Detailed Explanation of WiFi 6 BSS Coloring Feature"
slug: "2025-02-11-the-BSS-coloring-feature-of-WiFi6"
description: "In 802.11ax, also known as WiFi 6, a feature called BSS Coloring was introduced to optimize and resolve wireless interference issues among multiple Basic Service Sets (BSS) in high-density environments."
date: 2025-02-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---

In 802.11ax, also known as WiFi 6, a feature called BSS Coloring was introduced to optimize and resolve wireless interference issues among multiple Basic Service Sets (BSS) in high-density environments.

In traditional Wi-Fi networks, if two neighboring BSS networks use the same channel, the signals they transmit during communication will interfere with each other, resulting in a significant degradation of communication performance for both networks. This is because once a co-channel wireless collision occurs, each communication node must increase its retransmission attempts to deliver data packets to the receiving end, thereby avoiding potential data loss. Excessive wireless collisions and retransmissions severely degrade network communication performance. The BSS Coloring mechanism introduced in WiFi 6 mitigates this unnecessary interference, improving network performance and channel utilization.

To understand how BSS Coloring works, one must first understand the workflow of the CCA (Clear Channel Assessment) mechanism used by WiFi communication nodes during channel sensing.

## CCA (Clear Channel Assessment) Workflow

In Wi-Fi communication, before transmitting data, every communication node must first sense whether the current channel is idle (i.e., whether another node is transmitting data on the same channel). A communication node can transmit data outward only after confirming that the current channel is idle; this is the physical carrier-sensing mechanism. For each communication node, the method used to evaluate whether the current communication channel is idle is the CCA mechanism, namely Clear Channel Assessment.

Regarding the specific implementation of the CCA mechanism (focusing here only on physical layer carrier sensing, excluding virtual carrier sensing via NAV), its core mechanism can be divided into two aspects: **Energy Detection (ED)** and **Carrier Sense (CS)**.

### Carrier Sense (CS)

The core operational logic of physical layer carrier sensing is: as long as the physical layer can effectively detect and demodulate the Wi-Fi preamble (such as the OFDM symbols or DSSS headers defined in the 802.11 protocol), the current communication channel is determined to be busy, regardless of whether the current signal energy exceeds the threshold.

Specifically, CS identifies legitimate Wi-Fi signals by decoding the SFD (Start Frame Delimiter) field or the PLCP (Physical Layer Convergence Protocol) header within the preamble. Therefore, this mechanism is primarily used to distinguish whether the wireless signal present in the current channel is a Wi-Fi signal or other non-protocol interference (such as Bluetooth, microwave ovens, etc.). If it is a Wi-Fi signal (meaning a Wi-Fi preamble can be detected), the channel is naturally judged to be busy; if the correct Wi-Fi preamble cannot be decoded, it relies on the subsequent Energy Detection (ED) stage to determine channel busyness.

**Simple summary: As long as CS detects a Wi-Fi signal in the current channel, it considers the current channel busy.**

### Energy Detection (ED)

The core operational logic of physical layer energy detection is that when the total integrated energy in the channel per unit time exceeds the ED threshold, the channel is determined to be busy, regardless of whether the signal is a Wi-Fi protocol frame. The primary application scenario of ED is to determine whether the channel is occupied by other devices (regardless of whether they follow the Wi-Fi protocol). When the total energy on the channel (including Wi-Fi signals, non-Wi-Fi interference, noise, etc.) exceeds the ED threshold, the device determines that the channel is busy, thereby deferring data transmission.

- Thresholds vary across protocol standards (e.g., -76 dBm for 802.11b, higher for 802.11a/g/n/ac).

**Simple summary: When ED detects that the integrated energy per unit time in the current channel exceeds the specified threshold, it considers the current channel busy, regardless of whether these signals are Wi-Fi signals.**

In practical operation, as long as either CS or ED determines that the channel is busy, the system will consider the current channel occupied and defer data transmission.

## How BSS Coloring Works

In the BSS Coloring mechanism introduced in WiFi 6 (802.11ax), each AP (Access Point) is assigned a 6-bit BSS color identifier (giving a value range of 0–63). This identifier is embedded in the HE-SIG-A1 field of the PHY layer (located in the PPDU frame header). Consequently, the header of every data packet sent by a WiFi 6 node contains this 6-bit Coloring ID, and the Coloring ID of each BSS is unique (theoretically, it can be dynamically adjusted if a Coloring ID collision is detected). Therefore, every WiFi 6 node can use carrier sensing (specifically the CS phase mentioned earlier) to listen to the packet preamble in the current channel and determine whether the data packet belongs to its own BSS (MYBSS) or another BSS using the same channel (OBSS).

- The AP broadcasts its Coloring ID in its Beacon Frame, ensuring that every STA within the BSS clearly knows its own BSS Coloring ID.

![image.png](/images/blog/WiFi6的Bss-Coloring特性详解-1.png)

In addition to adding the Coloring ID to the packet header, the BSS Coloring mechanism introduces a differential and dynamically adjustable energy detection threshold mechanism into the CCA process. This differential channel sensing threshold works as follows:

- **MYBSS**: If the BSS Coloring ID of the received signal matches that of its own AP (i.e., signals sent by STAs within the same BSS), a lower ED detection threshold (CCA-SD, Signal Detect) is used to determine whether the channel is busy. For example, the channel is deemed busy when the signal power exceeds CCA-SD (e.g., -82 dBm). Setting this CCA-SD threshold lower ensures high sensitivity to intra-BSS signals, preventing a node from transmitting while other STAs in the same BSS are transmitting.
- **OBSS**: If the Coloring ID in the received Wi-Fi packet preamble sequence does not match, it indicates that the data packet originates from another BSS. In this case, a higher threshold (CCA-ED, Energy Detect) is applied during the CCA energy detection phase to determine channel busyness. For example, the channel is deemed busy only when the signal power exceeds CCA-ED (e.g., -62 dBm). A higher ED detection threshold allows the device to ignore weak interference signals (such as co-channel signals from adjacent APs), reducing unnecessary backoff delays and effectively improving channel utilization efficiency.

Furthermore, the CCA-ED threshold can be dynamically adjusted based on network load. For instance, when strong interference from an OBSS is detected, the CCA-ED threshold can be appropriately raised, thereby further tolerating interference and enhancing spatial reuse.

In the diagram below, the WiFi 4 network on the left uses the same CCA-SD and CCA-ED thresholds for all BSSs. Consequently, in the presence of an OBSS, the channel is easily judged as busy, forcing the device to wait and back off before transmitting data. In contrast, the WiFi 6 network on the right differentiates and dynamically adjusts the CCA thresholds for MYBSS and OBSS. If it detects that an OBSS node is transmitting, it applies a higher CCA-ED threshold; as long as the signal strength from the OBSS does not disrupt the signal demodulation of the current BSS, wireless signals from both BSSs can be transmitted simultaneously, effectively increasing spectral spatial utilization.

![image.png](/images/blog/WiFi6的Bss-Coloring特性详解-2.png)

## Related Questions on Understanding the BSS Coloring Mechanism

### Can adding a BSS Coloring ID eliminate wireless communication collisions?

Certainly not. The BSS Coloring ID added to the WiFi 6 packet header is merely used to distinguish whether a packet originates from a device within its own BSS. Based on this ID, a node can determine whether the packet currently being transmitted over the air belongs to its own BSS, and subsequently use this information to decide the threshold for assessing CCA channel busyness. Adding a BSS Coloring ID to the packet header does not solve collisions by itself.

Therefore, if two Wi-Fi nodes transmit data simultaneously on the same channel, and the interference power is sufficiently high from the receiver's perspective, it will inevitably affect the correct demodulation of the received signal. However, if the two nodes are relatively far apart and data packets from two different BSSs are treated as weak signals, they will not interfere with each other's correct demodulation, thereby effectively enhancing spectral spatial reuse efficiency.

### Is BSS Coloring supported in a mixed environment of WiFi 6 and WiFi 4?

Yes, the BSS Coloring feature continues to function in a mixed environment of WiFi 4 and WiFi 6. In such scenarios, Wi-Fi 6 devices can identify and process the BSS Color field according to their standard procedures, while Wi-Fi 4 devices, lacking support for this feature, will ignore this field. However, this does not prevent Wi-Fi 6 devices from using BSS Coloring to mitigate interference from other Wi-Fi 6 networks. In practical operation, Wi-Fi 6 devices ignore signals from Wi-Fi 4 devices so that they can utilize the channel more efficiently, while Wi-Fi 4 devices continue to operate in their traditional manner unaffected by BSS Coloring.

## Summary

The concrete implementation of BSS Coloring is as follows:

- A BSS Coloring ID is appended to the packet headers of data packets transmitted by WiFi 6 nodes. Theoretically, every BSS ID in a wireless environment is unique. By receiving and demodulating the packet header information in a shared wireless environment, a node can determine which BSS the currently transmitted packet belongs to.
- Based on this BSS Coloring ID, the node determines whether the received data packet comes from the same MYBSS or a different OBSS. A lower collision detection threshold, CCA-SD, is set for MYBSS—meaning that if a data packet from the same BSS is detected as being transmitted, the node backs off and waits for a transmission opportunity. Conversely, a higher collision detection threshold, CCA-ED, is set for OBSS—meaning that even if another co-channel BSS data packet is detected, as long as its energy is not excessively high (filtered out via CCA-ED), the current channel is deemed available for normal data transmission, thereby boosting spectral spatial utilization.

Therefore, by following this workflow—incorporating a BSS Coloring ID into the WiFi 6 packet sequence header and applying distinct, dynamically adjustable collision energy detection thresholds for MYBSS and OBSS—BSS Coloring successfully optimizes co-channel interference to a certain extent and improves overall spectral spatial utilization.

However, it is important to note that the BSS Coloring mechanism cannot fundamentally resolve the collision issues inherent in co-channel wireless communication (which are technically an unsolvable problem). Instead, by differentiating between BSSs, it allows data packets from different BSSs to be transmitted simultaneously when their mutual interference power is low, thereby enhancing the communication efficiency of the entire network.

## References

- [802.11 Protocol Deep Dive 22: CCA (Clear Channel Assessment) - Zhihu](https://zhuanlan.zhihu.com/p/51412066)
- [Wi-Fi 6 (802.11ax) Analysis 7: BSS Coloring Technology - Zhihu](https://zhuanlan.zhihu.com/p/76362759)