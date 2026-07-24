---
title: "Summary of Standard USB Packet Types"
slug: "2022-03-01-usb-basic-packet"
description: "Based on notes from 'USB in a Nutshell', this article summarizes the basic packet types used in USB communication."
date: 2022-03-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["USB"]
draft: false
---


**A basic USB communication transaction (referred to as a USB Transaction) typically consists of three basic USB Packets:**

- **Token Packet**: Initiated by the Host, containing information such as communication intent, target device address, and endpoint number.
- **Data Packet** (optional): Determined by the specific communication intent; data may be sent from Host to Device (OUT Data Packet) or read by Host from Device (IN Data Packet).
- **Status Packet**: An acknowledgment packet sent by the receiver to the sender based on the data direction of the Data Packet, indicating whether the data was successfully and correctly interpreted and processed.

This article summarizes the various basic packet types used in USB communication.


**Common basic USB packet types mainly include the following four:**

- Token Packet
- Data Packet
- Handshake Packet
- SOF Packet

Each packet type can be further divided into multiple sub-types, and each Packet internally contains multiple Fields.


## Common Fields in USB Packets

- **Sync**:
    - **All USB Packets must begin with a Sync field.**
    - It is 8 bits long on Low-Speed and Full-Speed devices, and 32 bits long on High-Speed devices. It is used to synchronize clocks between the Host and Device and carries no actual payload content.
- **PID**: Packet ID
    - Used to identify the type of the current packet. The Packet ID itself is only 4 bits long, supporting up to 16 packet types. During transmission, the other 4 bits are the bitwise complement (inverse) of the PID, forming an 8-bit PID byte.

    ![Untitled.png](/images/blog/USB标准包类型总结-1.png)

- **ADDR**:
    - The device address of the USB Device, 7 bits in length. Therefore, a USB bus can support up to 127 devices. However, address 0 is reserved for unassigned devices during enumeration, leaving 126 usable device addresses.
- **ENDP**:
    - Endpoint number. It is 4 bits in length, meaning a single device can support up to 16 endpoints. Endpoint 0 is fixed as a control transfer endpoint, and all control transfer communications take place with Endpoint 0.
- **CRC**:
    - The CRC checksum value of the packet. All Token Packets use a 5-bit CRC, while all Data Packets use a 16-bit CRC.

## Token Packet


A Token Packet is used to indicate the specific type and intent of the current USB transaction.


There are 3 types of Token Packets:

- **SETUP Token**: Indicates that the transaction initiated by the Host is a USB control transfer, such as reading device/configuration descriptors, setting addresses, etc.
- **IN Token**: Indicates that the transaction initiated by the Host expects to read data from a specified IN endpoint of the Device.
- **OUT Token**: Indicates that the transaction initiated by the Host expects to write data to a specified OUT endpoint of the Device.

The format of a Token Packet is fixed as follows:


![Untitled.png](/images/blog/USB标准包类型总结-2.png)

- Therefore, the information contained in a Token Packet mainly includes the PID, device address, and endpoint number. The PID value can be looked up in the Packet ID table above.

## Data Packet


A Data Packet is used to carry the payload data of the current USB transaction.


High-Speed USB devices support 4 types of Data Packets: DATA0, DATA1, DATA2, and MDATA.


The maximum payload size contained in a Data Packet supported by High-Speed USB devices is limited to 1,024 bytes. If the data exceeds this limit, it must be split into multiple Data Packets for transmission.


The format of a Data Packet is:


![Untitled.png](/images/blog/USB标准包类型总结-3.png)


## Handshake Packet


A Handshake Packet is used to provide acknowledgment information to the data sender, status information on whether an error occurred during communication, etc.


There are 3 types of Handshake Packets:

- **ACK**: Acknowledges to the sender that the data has been successfully received and processed.
- **NAK**: Indicates that the endpoint is busy and temporarily unable to process new data.
- **STALL**: Indicates that the endpoint has encountered a functional error, requiring Host intervention.

The format of a Handshake Packet is:


![Untitled.png](/images/blog/USB标准包类型总结-4.png)


## SOF Packet


On a High-Speed USB bus, an SOF (Start of Frame) packet is issued by the Host every 125 µs:


![Untitled.png](/images/blog/USB标准包类型总结-5.png)


## References

- [USB in a NutShell - Chapter 3 - USB Protocols (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb3.shtml#USBPacketTypes)