---
title: "USB Transfer Types: Control Transfer"
slug: "2022-03-01-usb-control-transfer"
description: "Based on chapters from USB in a Nutshell, this article summarizes the complete workflow of USB control transfers, illustrated with the communication process of reading a USB Device Descriptor."
date: 2022-03-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["USB"]
draft: false
---


USB control transfers are typically used to transmit control commands and status information. Enumeration, the most crucial function of USB, is accomplished through control transfers.


A USB control transfer consists of up to three communication stages: the Setup Stage, an optional Data Stage, and the Status Stage. Each stage contains multiple USB transactions and communication packets.

- In practice, each stage corresponds to a USB transaction, meaning a control transfer comprises up to three transactions. Each transaction/stage, in turn, contains multiple packets.

## Setup Stage


The Setup Stage consists of three USB packets: a Setup token packet, a data packet, and an ACK packet.


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-1.png)

- **Setup Token**: A standard Setup token packet marked with PID (`0b1101`), which contains the target device address and endpoint number.
- **Data**: The Data portion embeds a fixed 8-byte Setup Packet, which defines the specific request type for this control transfer in detail.
- **ACK**: The final ACK packet indicates whether the device has successfully received and processed the preceding two packets.
    - If the device successfully receives and processes them, it responds with a standard ACK packet.
    - If an error occurs during communication, the device will not issue a NAK or STALL packet.

**Note: Although "Setup Token" and the "Setup Packet" contained within the Data packet sound similar, they are entirely different concepts.**


The Setup Token is a standard USB token packet. Its packet structure is as follows:


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-2.png)


Meanwhile, the Setup Packet is a USB Data Packet. Its packet structure is as follows:


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-3.png)


## Data Stage


The Data Stage is optional.


The Data Stage can contain one or more IN or OUT data packets. For example, during USB enumeration, USB configuration descriptors are typically large and cannot fit inside a single Data IN packet, requiring multiple IN packets to transmit the descriptor information.


The length of data to be transmitted in the Data Stage is specified in the `wLength` field of the Setup Packet (contained within the Setup Stage's Data packet). If the data length exceeds the maximum payload size supported by a single IN or OUT packet, it must be split across multiple packets.


Whether the Data Stage uses IN or OUT transactions depends on the specific use case of the control transfer. Generally, `SET` control requests use an OUT Data Stage, whereas `GET` control requests use an IN Data Stage.


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-4.png)


**IN Data Stage:**

- Once ready to receive data, the host sends a standard IN Token (`PID=0b1011`) containing the target device address and endpoint number.
- The device responds with a Data packet.
- Upon receiving and correctly processing the packet, the host sends an ACK message.
    - If the device receives an erroneous IN Token during communication, it ignores it and makes no response.
    - If an error occurs on the device's IN endpoint, preventing it from sending a DATA packet correctly, the device returns a STALL packet.
    - If the device's IN endpoint is functioning properly but currently has no data to send, the device returns a NAK packet.
- **If the host needs to read multiple Data packets, each must follow the IN-DATA-ACK sequence.**

**OUT Data Stage:**

- The host first sends a standard OUT Token (`PID=0b0001`) containing the target device address and endpoint number.
- The host immediately follows with a Data Packet.
- After successfully receiving and processing the data, the device sends an ACK packet.
    - If any error occurs in the OUT Token or Data Packet during communication, the device ignores it and makes no response.
    - If the device's OUT endpoint buffer is still processing previously received data and cannot accept new data, the device returns a NAK packet.
    - If an error occurs on the device's OUT endpoint, preventing it from receiving data correctly, the device returns a STALL packet.
- **If the host needs to send multiple Data packets, each must follow the OUT-DATA-ACK sequence.**

## Status Stage


The Status Stage provides a final acknowledgment and status report for the overall control transfer, ensuring both Host and Device clearly know whether the control transaction was completed completely and correctly.


Depending on whether the host read data from or sent data to the device during the Data Stage, the Status Stage also falls into two types of status responses:


**IN: When the host reads data from the device via IN tokens in the Data Stage, it must send a signal to the device in the Status Stage to confirm that it has successfully received and processed the data.**


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-5.png)

- Specifically, the host sends an OUT token followed immediately by a zero-length Data packet (ZLP). Once the device correctly receives these two packets, it returns an ACK packet. **At this point, the control transfer is fully complete.**

**OUT: When the host sends data to the device via OUT tokens in the Data Stage, the device must report to the host in the Status Stage that it has successfully received and processed the data.**


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-6.png)

- Specifically, the host sends an IN token and then reads a zero-length Data packet (ZLP) from the device's IN endpoint. If the exchange is valid, the host returns an ACK packet. **At this point, the control transfer is fully complete.**

## Full Control Transfer Example: Reading a Device Descriptor


To illustrate the entire control transfer process, let us examine an example where the host reads the Device Descriptor from a device during USB enumeration.


This process consists of the same three stages mentioned above:


1. **Setup Stage**


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-7.png)

- This stage consists of three packets: the Setup Token Packet and Data Packet sent by the host, and the ACK Handshake Packet from the device.
- The target device address and endpoint number are contained in the Setup Token Packet.
    - Since this is a control transfer, the endpoint number is fixed at 0.
- The request to read the Device Descriptor is a Standard Setup Packet (fixed 8 bytes long), encapsulated within the `DATA0` field of the Data Packet.
    - Once the device receives the Setup token, it knows that the subsequent Data Packet contains a standard Setup Packet. By parsing this Setup Packet, the device understands the purpose of the control request. The length of data to be read in the Data Stage is specified in the `wLength` field of the Setup Packet.

2. **Data Stage**


After receiving and parsing the Setup Packet from the Setup Stage, the device recognizes that the host wants to read the Device Descriptor. It then returns its Device Descriptor to the host via IN transactions during the Data Stage.


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-8.png)

- The data payload size for each IN Data packet is limited. If the data requested by the host exceeds this limit, it must be split across multiple IN packets. Each IN packet transmission must go through the three-step sequence: IN Token -> Data Packet -> ACK Handshake, until all data is transmitted.
- In the example above, the Device Descriptor is 12 bytes long, and the maximum payload size for a single data packet is 8 bytes. Thus, it is split into two data packets sent to the host: the first packet carries 8 bytes, and the second carries the remaining 4 bytes.

3. **Status Stage**


After successfully reading the Device Descriptor, the host sends a zero-length OUT Data Packet to notify the device. With this, the control transfer for reading the Device Descriptor is fully complete.


![Untitled.png](/images/blog/USB传输类型之Control-Transfer-9.png)


## References

- [USB in a NutShell - Chapter 4 - Endpoint Types (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb4.shtml#Control)