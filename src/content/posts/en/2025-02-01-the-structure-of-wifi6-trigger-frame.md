---
title: "Detailed Analysis of WiFi 6 Trigger Frame Structure"
slug: "2025-02-01-the-structure-of-wifi6-trigger-frame"
description: "The implementation of OFDMA (Orthogonal Frequency Division Multiple Access) in WiFi 6 (802.11ax) relies on a critical mechanism called the Trigger Frame (TF). This article provides an in-depth technical analysis of the detailed structure of the Trigger Frame."
date: 2025-02-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---


The implementation of OFDMA (Orthogonal Frequency Division Multiple Access) in WiFi 6 (802.11ax) relies on a critical mechanism called the Trigger Frame (TF). This article provides an in-depth technical analysis of the detailed structure of the Trigger Frame.


## Overall Trigger Frame Structure


In general, the Trigger Frame is a type of control frame introduced in 802.11ax (Type: Control, Subtype: 2). The figure below illustrates the overall frame structure of the Trigger Frame defined in the 802.11ax specification.


![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-1.png)


As seen from the overall frame structure above, the Trigger Frame can be divided into four parts:

- MAC Header: Contains four fields: Frame Control, Duration, RA, and TA. The frame type of the trigger frame is specified within the Frame Control field.
- Common Info: Located immediately after the MAC Header, this section defines the global parameter configuration information for the frame.
- Multiple Consecutive User Info Structures: Each User Info structure contains independent configuration field information for a specific user (i.e., STA), specifying the RU resources allocated to that STA.
- Padding and FCS: Finally, the padding and frame check sequence fields of the entire packet structure.

Trigger frames can be further categorized into several different subframe types, as specified by the Trigger Type in the Common Info field.



![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-2.png)

- Basic: Used for regular uplink OFDMA MU-MIMO transmission. The AP allocates time-frequency resources to each STA via RU allocation, initiating the STAs to upload data to it.
- BSRP (Buffer Status Report Poll): In UL OFDMA communication, the AP uses the BSRP frame to request STAs to report their buffer status (how much data is waiting to be uploaded), facilitating dynamic resource allocation by the AP.
- MU-RTS (Multi-User Request to Send): Similar to the RTS frame, but used in OFDMA communication to coordinate multiple users sending RTS frames simultaneously, thereby reducing channel contention and collisions.
- MU-BAR (Multi-User Block Ack Request): Used in uplink OFDMA communication, where the AP requests Block ACK response messages from all STAs.
> Additionally, it is important to note that **in the Wi-Fi 6 protocol, all Trigger Frames and their subframes are AP-exclusive control frames. Only the AP can transmit trigger frames; STAs cannot initiate trigger frames or their subcategories**. STAs respond (such as sending data or ACKs) strictly according to RU allocation and time synchronization requirements only after receiving a trigger frame from the AP, and they have no authority to proactively initiate a trigger frame. This design ensures centralized scheduling of channel resources and collision avoidance.
> It should be noted that for trigger frames of different subframe types, the contents of the Common Info and User Info fields may vary significantly. For example, in an MU-RTS type trigger frame, most fields within Common Info and User Info do not exist.

## Common Info


The following is an explanation of the important fields in the Common Info section:

- Trigger Type: This 4-bit field indicates the specific subframe type corresponding to the trigger frame, such as Basic, MU-RTS, BSRP, etc. (refer to the table above).
- UL Length: The total duration of the current uplink transmission (i.e., the number of symbols included in the STA's current uplink transmission).
- More TF: Mostly set to 0, primarily used for power-saving modes such as TWT.
- UL Bandwidth: Specifies the bandwidth for uplink transmission (20/40/80/160MHz). The AP allocates uplink RU resources to each STA within this bandwidth.
- GI and LTF Type: Specifies the Guard Interval (GI) duration.
- RU Allocation: Defines the frequency domain position of each RU in the channel (e.g., 26-tone, 52-tone RU).
- AP Tx Power: The AP Tx Power field here serves as a unified transmission power baseline recommended for all STAs. Additionally, the User Info section allows personalized power parameters to be specified for each STA.
- HE-SIG-A Info: Carries parameters for the HE PHY header (such as whether LDPC, STBC, etc., are used).

![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-3.png)


## User Info


In the trigger frame structure, each STA assigned an RU for OFDMA has a User Info data structure. This User Info contains independent configuration information tailored to the corresponding STA.


The following is an explanation of the important fields in the User Info section:

- AID (Association ID): Corresponds to the Association ID of the target STA.
- RU Allocation Index: Specifies the exact RU index assigned to this STA (based on standards-predefined mapping tables).
- UL MCS (Modulation and Coding Scheme): Specifies the modulation and coding scheme for uplink data transmission.
- UL DCM (Dual Carrier Modulation): Indicates whether dual carrier modulation is adopted for transmitting uplink data.
- SS Allocation: Number of spatial streams (applicable only to UL MU-MIMO).
- UL Target RSSI: The transmission power requested by the AP for the STA during uplink data transmission (based on received signal strength feedback).

![image.png](/images/blog/WiFi6的触发帧（Trigger-Frame）帧结构详解-4.png)


## References

- [The 802.11ax Trigger Frame – SemFio Networks](https://semfionetworks.com/blog/the-80211ax-trigger-frame/)
- [Trigger Frames in 802.11ax | Hitch Hiker's Guide to Learning](https://www.hitchhikersguidetolearning.com/2023/03/31/trigger-frames-in-802-11ax/)