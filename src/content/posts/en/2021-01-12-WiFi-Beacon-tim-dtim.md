---
title: "Summary of Beacon, TIM, and DTIM Concepts in Wi-Fi"
slug: "2021-01-12-WiFi-Beacon-tim-dtim"
description: "This article summarizes the Beacon frame format defined in the 802.11 protocol specification and the differences between TIM and DTIM frames."
date: 2021-01-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Wi-Fi"]
tags: ["Wi-Fi"]
draft: false
---


## **Beacon Frame**

- By default, an Access Point (AP) broadcasts a Beacon frame every 102.4 ms. Each Beacon frame contains a TIM field specifying which STAs (stations) have buffered data waiting on the AP.
    - The transmission interval of Beacon frames and the DTIM period can be configured in the router settings (if supported by the router).
    - Note: Transmitting a Beacon frame requires participating in the channel contention mechanism. The AP sends the Beacon frame only after contending for and winning a transmission time slot. Therefore, while Beacon frames are ideally transmitted periodically based on the Beacon Interval setting, the actual transmission time slot may slightly deviate from the theoretical value when the channel is busy.
- The Beacon frame sent by the AP includes a fixed 8-byte Timestamp field containing the AP's internal microsecond (μs) counter value. By listening to this timestamp in the Beacon frame, STAs can achieve precise, periodic time synchronization with the AP.
    - Upon receiving a Beacon frame from the AP, a STA extracts the Timestamp field value and adds a locally estimated delay (the processing latency from antenna reception to final handling), thereby synchronizing its clock with the AP.
- In the 802.11 protocol, Beacon frames are always transmitted at the lowest data rate supported by the AP because:
    - A Beacon frame is a broadcast frame that does not receive ACK feedback, meaning no retransmission mechanism can be established.
    - The purpose of a Beacon frame is to broadcast basic AP information to all nodes (including legacy devices). Transmitting at the lowest data rate ensures that older wireless devices can successfully receive the information and connect.
    - Furthermore, higher data rates require better signal quality for demodulation (i.e., higher minimum receiver sensitivity). Lowering the data rate relaxes demodulation requirements, ensuring that devices with poor signal quality can still decode the frame.

## **Role of the TIM Field in Beacon Frames**


The TIM (Traffic Indication Map) field in a Beacon frame is primarily used to implement the power-saving logic defined by 802.11.


In power-save mode, a STA enters a sleep state. To maintain near real-time network connectivity, the STA periodically wakes up and enables its RX (receiver) to listen for Beacon frames from the AP. The TIM field in these Beacon frames contains information indicating which STAs have buffered unicast frames on the AP. Upon receiving the Beacon, the STA parses the field to determine whether the AP holds buffered unicast frames for it:

- If buffered frames exist, the STA sends a PS-POLL frame to the AP to request its buffered unicast data.
- If no buffered frames exist, the STA returns to sleep.

This basic operating logic achieves a balance between low power consumption and real-time network communication.


## **Detailed Explanation of the TIM Field in Beacon Frames**


![Untitled.png](/images/blog/WiFi中的Beacon、TIM与DTIM概念总结-1.png)

- Element ID: Fixed 1 byte. An element identifier used to indicate different fields within the Beacon frame. For a TIM field, this ID is 5.
- Length: Fixed 1 byte. Indicates the length of the data contained in this field, measured in bytes.
    - Specifically, Length indicates the total length of the four subfields: DTIM Count, DTIM Period, Bitmap Control, and Partial Virtual Bitmap. Thus, the minimum value for Length is 4, and the maximum is 254.
- DTIM Count: Fixed 1 byte. Indicates how many Beacon frames remain until the next DTIM.
    - A DTIM Count of 0 indicates that the current TIM is a DTIM.
- DTIM Period: Fixed 1 byte. Indicates the number of Beacon frame intervals between consecutive DTIMs. This value is configured by the AP.
    - If DTIM Period is set to 1, every TIM is a DTIM. 0 is a reserved value and cannot be set.
- Bitmap Control: Fixed 1 byte.
    - Bit 0: Set to 1 if the AP has buffered multicast/broadcast frames to be transmitted immediately following the DTIM Beacon frame; set to 0 if no multicast/broadcast frames are buffered.
- Partial Virtual Bitmap: Variable length, ranging from 1 to 251 bytes.
    - Bit 1 through Bit 7 of Bitmap Control, together with the Partial Virtual Bitmap data, indicate which power-saving STAs have buffered unicast frames on the AP. Upon receiving this frame, a STA parses the bitmap and checks whether the bit corresponding to its AID (Association ID) is set to 1. If set to 1, the AP holds buffered data for this STA, prompting the STA to use the PS-POLL mechanism to retrieve its data. If set to 0, there is no buffered data, and the STA can return to sleep.
    - In practice, each STA associated with the AP corresponds to a specific bit in the Partial Virtual Bitmap. A bit value of 1 indicates buffered data exists for that STA, while 0 indicates none. The Partial Virtual Bitmap can be up to 251 bytes (2008 bits), matching the maximum number of STAs an AP can support.
    - For details on how to parse whether an AP has buffered data for a specific STA using Bit 1–Bit 7 of Bitmap Control and the Partial Virtual Bitmap, refer to *Annex O: An example of encoding a TIM virtual bit map* in the 802.11 specification.
    - Since each bit in the Partial Virtual Bitmap represents a STA, why not simply transmit a full 251-byte bitmap in every Beacon frame instead of using a complex encoding algorithm? This is because if every Beacon frame contained a full 251-byte Partial Virtual Bitmap, the frame size would be excessively large. Since Beacon frames are transmitted at the lowest data rate and at high frequency, large frames would consume significant wireless channel airtime. Therefore, the Bitmap Control mechanism was introduced to efficiently transmit buffering information while keeping the Beacon frame size as small as possible.

The figure below shows a packet capture of a TIM-type Beacon TIM field:


![Untitled.png](/images/blog/WiFi中的Beacon、TIM与DTIM概念总结-2.png)


The figure below shows a packet capture of a DTIM-type Beacon TIM field:


![Untitled.png](/images/blog/WiFi中的Beacon、TIM与DTIM概念总结-3.png)


## **What is the Difference Between TIM and DTIM?**

- The difference between TIM and DTIM is minimal. The key distinction is:
    - **A DTIM-type Beacon frame is immediately followed by the transmission of all buffered multicast/broadcast frames on the AP, provided that the AP actually has buffered multicast/broadcast data (i.e., Bitmap Control Bit 0 = 1).**
    - When the AP has no buffered multicast/broadcast frames (i.e., Bitmap Control Bit 0 = 0), a TIM behaves practically the same as a DTIM, except that DTIM Count = 0 in a DTIM Beacon frame.
- Therefore, within the Beacon frame structure, DTIM and TIM fields are virtually identical:
    - For TIM, DTIM Count ≠ 0; for DTIM, DTIM Count = 0.
    - Both TIM and DTIM share the same DTIM Period value.
    - For both TIM and DTIM, Bit 0 of Bitmap Control indicates whether there are buffered multicast/broadcast frames on the AP.
    - For both TIM and DTIM, Bit 1–Bit 7 of Bitmap Control and the Partial Virtual Bitmap indicate which STAs have buffered unicast frames on the AP.

## **References**

- [802.11 ------ Beacon帧、Beacon Interval、TBTT、Listen Interval、TIM、DTIM](https://www.cnblogs.com/god-of-death/p/8098643.html)
- [802.11协议精读10：节能模式（PSM）](https://zhuanlan.zhihu.com/p/21623985)
- [802.11 – TIM and DTIM Information Elements](https://blogs.arubanetworks.com/industries/802-11-tim-and-dtim-information-elements/)