---
title: "The Connections and Differences Between SD Cards, SDIO Interfaces, and eMMC"
slug: "2025-03-04-the-difference-of-SD-SDIO-EMMMC"
description: "SDIO (Secure Digital Input Output) and SD cards (Secure Digital Memory Card) both belong to the SD (Secure Digital) standard system, but their design goals and functional implementations have distinct differences: an SD card is a dedicated storage device, whereas SDIO provides a high-speed expansion interface for general-purpose peripherals using the same SD interface and a similar SD protocol framework. Simply put, SDIO and SD cards are fully compatible at the hardware physical layer, but they have developed their own independent systems for specific communication protocols."
date: 2025-03-04T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["SD"]
draft: false
---


Among the main control chips encountered in our work, their supported SD host controllers and interfaces will almost certainly mention that they support different versions of the SD protocol, SDIO protocol, and eMMC protocol specifications. For example, the following figure shows the support of the Ingenic T41 SD host controller for these different protocol specification versions:


![image.png](/images/blog/SD卡与SDIO接口、eMMC之间的联系与区别-1.png)


So, what are the connections and differences between the SD cards, SDIO, eMMC interfaces, and their corresponding protocol specifications supported by the SD host controller?


### Connections and Differences Between SD Cards and SDIO Interfaces


SDIO (Secure Digital Input Output) and SD cards (Secure Digital Memory Card) both belong to the SD (Secure Digital) standard system, but their design goals and functional implementations have distinct differences: an SD card is a dedicated storage device, whereas SDIO provides a high-speed expansion interface for general-purpose peripherals using the same SD interface and a similar SD protocol framework. Simply put, SDIO and SD cards are fully compatible at the hardware physical layer, but they have developed their own independent systems for specific communication protocols.


Mutual compatibility at the hardware physical layer includes:

- Identical pin definitions: SDIO devices and SD cards use the same physical interface (i.e., the 9-pin micro/SD interface).
- Consistent electrical specifications: Both SDIO devices and interfaces comply with the voltage ranges (3.3V or 1.8V UHS modes) and signal level standards defined by the SD Association.

Differences at the protocol layer include:

- SD command set branching: SD cards only implement the SD storage protocol (focusing on block read/write commands), whereas SDIO extends the SDIO protocol to support generic device control.
- Initialization process: The SD host controller detects whether the inserted device is a memory card or an SDIO peripheral by sending the `CMD5` command.

Therefore, the SD card (storage) and SDIO (expansion peripheral) protocol stacks share the physical layer, but their core functions and technical specifications evolve independently. As a result, the standard specifications for SD cards and SDIO are separate. This is why most master SOCs list the supported specification versions for SD and SDIO separately in their SD controller specifications. Below is the evolution of the SDIO protocol specification and the key supported features of each version:


![image.png](/images/blog/SD卡与SDIO接口、eMMC之间的联系与区别-2.png)


### Connections and Differences Between SD Cards and eMMC


Both SD cards and eMMC utilize the SD interface to solve storage problems. The difference is that SD cards are targeted at removable and hot-pluggable application scenarios, while eMMC is targeted at application scenarios where it is fixed to the product via embedded soldering.

- In other words, SD cards can be plugged in, removed, and replaced within a product's SD card slot, whereas eMMC is soldered directly onto the product's circuit board and cannot be replaced. However, both connect to the main control chip via the SD interface.

Since their technical roots are similar (both are derived from the MMC protocol), the SD controllers of most master chips can simultaneously support SD cards, SDIO, and eMMC. However, differences in how SD cards and eMMC are used still lead to distinctions in their physical layers and driver command sets:

- In terms of physical layer electrical signals, SD cards require higher ESD protection (because they support hot-plugging), whereas eMMC relies on PCB signal integrity design.
- The SD bus clocks and specifications supported by the two also differ; for example, the HS400 mode in the eMMC 5.1 specification can support 200MHz DDR dual-edge data sampling.
- Regarding the command sets used for SD protocol communication, there are also differences between the two, including some proprietary command sets unique to each.

Most importantly, the organizations behind the SD card and eMMC protocols are different. The protocol specifications for SD cards and SDIO are governed by the SD Association, whereas eMMC protocol specifications are defined and maintained by JEDEC. The SD Association focuses on compatibility with legacy devices (backward compatibility with SDHC slots), while JEDEC drives eMMC to align with UFS (paving the way for UFS). Consequently, as specifications evolve, the differences between the two will continue to grow.