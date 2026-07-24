---
title: "A Comprehensive Summary of Wi-Fi Low-Power Modes and Workflows"
slug: "2021-02-01-wifi-lowpower"
description: "This article summarizes the Wi-Fi low-power modes, workflows, and state transitions defined in the 802.11 specification."
date: 2021-02-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Wi-Fi"]
tags: ["Wireless Communication","Wi-Fi"]
draft: false
---


## **Two Power Modes of a STA**


Generally speaking, a station (STA) supports two distinct power management modes:

- **Active Mode**: In this state, the Wi-Fi RF receiver (RX) remains continuously enabled, allowing the STA to receive data frames from the Access Point (AP) at any time.
    - Because the STA's RX must stay powered on, power consumption in this mode is naturally higher.
- **PS (Power Saving) Mode**: In this state, the STA keeps its RX turned off most of the time. It only wakes up periodically to turn on RX and listen for Beacon Frames sent by the AP, thereby minimizing energy consumption.

*Note: Only STAs support low-power mode. APs must process state management and packet forwarding for connected STAs in real time, so they always operate in Active Mode.*


STAs connected to the same AP can operate in either Active Mode or PS Mode. The AP must maintain clear tracking of each STA's power mode to determine whether to buffer data for a specific STA (PS Mode) or transmit it immediately (Active Mode).


## **STA in Active Mode**

- When a STA is in Active Mode, its RX remains continuously powered on. The AP can transmit data packets destined for this STA at any time.
- When operating in Active Mode, the STA sets the Power Management bit in the Frame Control field of the MAC Header to `0` for all transmitted packets.

## **Entering PS Low-Power Mode**

- When a STA needs to enter low-power mode, it sets the Power Management bit in the Frame Control field of the MAC Header to `1` to notify the AP that it is transitioning to low-power standby mode.
- While operating in low-power mode, the Power Management bit in all packets transmitted by the STA must remain set to `1`.
- When the AP receives a packet with the Power Management bit set to `1` in the MAC Header Frame Control field, it recognizes that the STA is entering low-power mode. Subsequently, whenever the AP receives packets destined for this STA, it will buffer them temporarily.

## **Operational Logic of PS Low-Power Mode**

- The AP periodically broadcasts Beacon Frames at a fixed Beacon Interval (typically 100 ms or 200 ms). These Beacon Frames contain a TIM (Traffic Indication Map) field, which uses a bitmap structure (where each bit corresponds to an associated STA) to indicate whether the AP has buffered data for that specific STA.
    - If the AP has buffered data for a STA in PS mode, the bit corresponding to that STA in the bitmap is set to `1`; otherwise, it is set to `0`.
- After a STA enters low-power mode, any incoming packets sent from external devices to this STA will be temporarily buffered by the AP. The AP then notifies the STA of the buffered data via the bitmap in the Beacon Frame's TIM field.
- In low-power mode, the STA keeps its RX off most of the time, waking up periodically based on its Listen Interval (configurable per STA, expressed in units of Beacon Intervals) to receive incoming Beacon Frames from the AP.
    - A larger Listen Interval results in lower power consumption for the STA, but introduces higher latency for receiving external data.
    - A smaller Listen Interval reduces data reception latency, but consumes more power due to frequent wake-ups to listen for Beacon Frames.
- While in low-power mode, the STA periodically wakes up according to its Listen Interval to receive Beacon Frames and parses the TIM field to check if the AP has buffered data for it:
    - If no data is buffered at the AP, the STA turns off its RX and returns to sleep, repeating this cycle at the next Listen Interval.
    - If data is buffered at the AP, the STA initiates a PS-Poll mechanism to retrieve the data:
        - The STA sends a PS-Poll Frame to the AP, requesting the AP to transmit its buffered data frame.
        - Upon receiving the PS-Poll Frame, the AP responds by sending one buffered data frame back to the STA.
        - If the AP holds multiple buffered data frames for this STA, it sets the More Data bit in the MAC Header of the returned data frame to `1`. This signals to the STA that additional buffered frames remain on the AP. The STA then repeats the process, sending further PS-Poll Frames until all buffered data frames are retrieved.

## **Exiting PS Low-Power Mode**

- When a STA needs to exit low-power mode, it sets the Power Management bit in the Frame Control field of its MAC Header to `0` to inform the AP that it is exiting standby and returning to Active Mode.
- While operating in Active Mode, the Power Management bit in all transmitted packets from the STA must remain set to `0`.
- Upon receiving a packet with the Power Management bit set to `0` in the MAC Header Frame Control field, the AP recognizes that the STA has exited low-power mode and transitioned to Active Mode. Going forward, any packets received for this STA will be forwarded directly to it.
- When a STA exits PS mode, the AP checks whether it has any remaining buffered packets for this STA. If so, it immediately flushes all buffered packets to the STA.

## **References**

- Part 11: Wireless LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications, 2007.