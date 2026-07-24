---
title: "A Detailed Summary of the Google Eddystone BLE Advertising Protocol Specification"
slug: "2026-04-13-the-detailed-summary-of-Google-EddyStone-BLE-advertising-protocol"
description: "Eddystone is a data format specifically defined for Bluetooth Low Energy (BLE) advertising packets. Introduced by Google as an open-source beacon protocol in 2015, it aims to provide an open and feature-rich advertising standard compared to Apple's iBeacon."
date: 2026-04-13T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["Bluetooth"]
draft: false
---


## Introduction to Eddystone


Eddystone is a data format specifically defined for Bluetooth Low Energy (BLE) advertising packets. Introduced by Google as an open-source beacon protocol in 2015, it aims to provide an open and feature-rich advertising standard compared to Apple's iBeacon.


![image.png](/images/blog/详细总结EddyStone-BLE广播包协议规范-1.png)


In the Bluetooth protocol stack, Eddystone operates above the GAP (Generic Access Profile) layer. It utilizes the 31-byte payload within BLE advertising packets for communication, essentially defining a standardized data structure based on this 31-byte length constraint.

- Because it operates under the BLE advertising mode, communicating devices do not need to establish a pairing connection. During communication, the broadcasting device simply transmits signals outward at regular intervals in a unidirectional manner, and any scanning device within its coverage area is responsible for listening to these messages.
- Unlike iBeacon, which only broadcasts a single set of IDs during advertising communications, Eddystone allows devices to alternate broadcasting different types of advertising frames (Frames), which is a major feature of Eddystone.

## Four Main Frame Types of Eddystone


### UID (Namespace and Instance ID Frame)


This frame type is primarily used to identify the identity of a device. Its frame structure is as follows:

- **Namespace ID (10 Bytes)**: Similar to a device's family name, used to identify a specific company, product type, or series. Therefore, generally speaking, devices of the same model produced by the same company share the same Namespace ID.
- **Instance ID (6 Bytes)**: Similar to a device's given name, used to identify a specific individual device. Even for devices of the same model, their Instance IDs differ, allowing them to be distinguished from one another.
- **Custom Space**: This portion of space can be customized for specific meanings.

### TLM (Telemetry Frame)


This frame is generally used to broadcast device status, such as battery level, temperature, and uptime. It is the status frame of the device.


### URL (Uniform Resource Locator Frame)


This frame type is Eddystone's most well-known feature. It is used to directly broadcast a compressed URL address (such as `https://goo.gl/...`).


**In fact, this is a typical application scenario for Beacon-type Bluetooth devices**:

- A user's smartphone approaches a bus stop and automatically pops up a webpage containing nearby route information without requiring an app installation.
- A user's smartphone approaches a specific area in a supermarket and receives a web URL containing promotional information for goods corresponding to that area.

### EID (Encrypted ID Frame)


This frame type is primarily used to encrypt the ID, changing it at regular intervals to prevent the device from being illegally tracked by others.


## Eddystone Packet Structure


First, let's summarize the overall packet structure of a typical BLE advertising packet. The raw data packet transmitted over the air is typically **8 to 47 bytes** in length:


![affce66d-09d8-4bec-b2a5-72a72a1fe8d1.png](/images/blog/详细总结EddyStone-BLE广播包协议规范-2.png)


All data structures of Eddystone are contained within its Payload. The Payload portion ranges from 6 to 37 bytes in length, which includes the device's MAC address and the actual advertising data (ADV Data). Excluding the 6-byte device address, the remaining 31 bytes form the user-definable advertising data area. It consists of multiple AD Structures (such as AD 0 to AD N in the diagram above), and the format of each AD Structure is: `[Length] [Type] [Data]`.


For the Eddystone protocol, it typically contains the following three standard AD Structures:

- Flags: **This part is identical for all Eddystone devices.**
Used to inform scanners about the physical characteristics of the device (e.g., General Discoverable Mode only, BR/EDR Not Supported).
• Byte stream: `02 01 06`
    ◦ `02`: Length of the subsequent data.
    ◦ `01`: Type (Flags).
    ◦ `06`: Value (representing LE General Discoverable Mode + BR/EDR Not Supported).
- 16-bit Service UUID: **This part is identical for all Eddystone devices.**
Used to inform scanners that this is an Eddystone-compliant device.
• Byte stream: `03 03 AA FE`
    ◦ `03`: Length of the subsequent data.
    ◦ `03`: Type (16-bit Service UUID).
    ◦ `AA FE`: Eddystone's official registered UUID (`0xFEAA`), stored in little-endian format. All Eddystone devices must include this UUID.
- Service Data (Core Payload): **This is where the advertising protocol stores the actual data.**
• Byte stream example (UID Frame): `17 16 AA FE 00 xx xx xx`
    ◦ `0-17`: Length varies depending on the packet content length, up to a maximum of 23 bytes.
    ◦ `16`: Type is Service Data, i.e., 0x16, fixed.
    ◦ `AA FE`: UUID `0xFEAA`, fixed.
    ◦ `00/10/20/30`: Eddystone Frame Type.
    ◦ Followed by different frame data.

Therefore, it can be simply stated: **For all standard Eddystone device packets and advertising packets, the first 7 bytes (`02 01 06 03 03 AA FE`) are completely identical and fixed. The true differentiated competition and business logic distinction for each device are entirely concentrated within the Service Data payload following type 16.**


## Mapping of Eddystone Frame Types to Service Data Structures


As mentioned above, for the advertising packets of all Eddystone devices, the Payload portion contains three AD Structures. The data contents of the first two AD Structures are completely fixed and identical, and only the last AD Structure—the Service Data portion—is truly used to carry differentiated data.


The first byte of the Service Data portion is the Length, which corresponds to the length of this section; the second byte is fixed at 0x16, indicating that this section is of the Service Data type, and thus remains unchanged; bytes 3 and 4 are similarly the fixed UUID `0xFEAA`. Therefore, the true application-layer differences in Eddystone advertising packets are mainly reflected starting from the fifth byte of the Service Data and onwards.


The frame structures are summarized below according to different Eddystone frame types, with **subsequent explanations starting from the fifth byte position of the Service Data (i.e., the Eddystone Frame Type)**.


### UID Frame (Namespace and Instance ID Frame)

- Byte 0, Frame Type, 1 Byte, fixed to `0x00`
- Byte 1, TX Power, 1 Byte, calibrated Received Signal Strength Indication (RSSI) at 0 meters, ranging from -100 to +20 dBm
- Bytes 2-11, Namespace ID, 10 Bytes, used to distinguish different scopes, organizations, manufacturers, or product types
- Bytes 12-17, Instance ID, 6 Bytes, used to identify a specific device, i.e., the device ID, which is unique for every device
- Bytes 18-19, Reserved, 2 Bytes, reserved by the official specification, typically padded with 0

### URL Frame (Uniform Resource Locator Frame)

- Byte 0, Frame Type, 1 Byte, fixed to `0x10`
- Byte 1, TX Power, 1 Byte, calibrated RSSI value at 0 meters
- Byte 2, URL Scheme, 1 Byte, prefix encoding (e.g., 0x00 represents `http://www.`, 0x03 represents `https://`).
- Bytes 3-19, Encoded URL, 1-17 Bytes, compressed website content (non-ASCII, using specialized suffix compression codes)

### TLM (Telemetry Frame)

- Byte 0, Frame Type, 1 Byte, fixed to `0x20`
- Byte 1, TLM Version, 1 Byte, protocol version (currently typically 0)
- Bytes 2-3, VBATT, 2 Bytes, battery voltage in millivolts (mV)
- Bytes 4-5, Temperature, 2 Bytes, device temperature (8.8 fixed-point format, in degrees Celsius)
- Bytes 6-9, ADV_CNT, 4 Bytes, total number of advertising packets sent since reboot
- Bytes 10-13, SEC_CNT, 4 Bytes, uptime since reboot (in units of 0.1 seconds)

### EID (Encrypted ID Frame)

- Byte 0, Frame Type, 1 Byte, fixed to `0x30`
- Byte 1, TX Power, 1 Byte, calibrated RSSI value at 0 meters
- Bytes 2-9, Ephemeral ID, 8 Bytes, time-varying 8-byte cryptographic identifier

**Supplementary Note 1: What does the aforementioned 8.8 fixed-point format mean?**


The 8.8 fixed-point format is an efficient method for representing values with fractional parts using 2 bytes (16 bits). It divides the 16 bits into two equal parts: the upper 8 bits represent the integer part, and the lower 8 bits represent the fractional part.


A 16-bit field is split into:
• Upper 8 bits (Most Significant Byte, MSB): Signed integer part. Uses two's complement form (i.e., values greater than 0x80 are negative, and values less than 0x80 are positive), with a range from -128 to +127.
• Lower 8 bits (Least Significant Byte, LSB): Unsigned fractional part. It represents fractions of 256 (i.e., n/256).


**Supplementary Note 2: What is the compression workflow for the Encoded URL mentioned above?**


In the Eddystone-URL specification, to pack a URL as long as possible into the limited **31-byte** space of a Bluetooth advertisement, Google does not use a complex general-purpose compression algorithm. Instead, it adopts a table-lookup-based byte substitution technique. This method is divided into two parts: prefix compression and suffix/common word compression.


Prefix compression: Uses 1 byte to represent the beginning of the URL. Common mapping relationships include:

- 0x00: http://www.
- 0x01: https://www.
- 0x02: http://
- 0x03: https://

Suffix compression: Other regular ASCII characters (such as `a-z`, `0-9`, `-`) are stored directly as-is. However, for Top-Level Domains (TLDs) and common path symbols, the specification defines a set of special single-byte replacement codes (typically within the range of `0x00` to `0x0D`):

- 0x00: .com/
- 0x01: .org/
- 0x02: .edu/
- 0x03: .net/
- 0x07: .com
- 0x08: .org
- 0x0B: .net