---
title: "Setup Packet in USB Control Transfers"
slug: "2022-02-25-usb-setup-packet"
description: "This article summarizes the structure and classification of the Setup Packet defined in the USB standard."
date: 2022-02-25T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["Hardware","USB"]
draft: false
---


The Setup Packet is generally used by the Host to detect, configure, and execute specific control functions on a Device, such as setting the USB device address, reading USB descriptors from the device side, and checking endpoint status. Beyond handling these standard operational commands, certain USB Class Drivers also use Setup Packets to perform class-specific control operations. Most notably, UVC (USB Video Class) devices use Setup Packets to perform SET and GET operations on the internal operating parameters (such as brightness and contrast) of a UVC camera.


All USB devices must respond to Setup Packets sent by the Host on Endpoint 0.


## Structure of a Setup Packet


A Setup Packet has a fixed length of 8 bytes and contains 5 fields:


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-1.png)

- `bmRequestType`: 1 byte in length. Used to define the data transfer direction of the Setup Packet (outward from Host or inward to Host), request type (Standard, USB Class, or Vendor-specific), and recipient target (Device, Interface, or Endpoint).
- `bRequest`, `wValue`, and `wIndex`: These three fields vary depending on the definition of different request types.
- `wLength`: If the Setup Packet is followed by a data stage, this field specifies the data length of the data stage.

## Standard Setup Packets


### Standard Device Request Packets


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-2.png)


### Standard Interface Request Packets


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-3.png)


### Standard Endpoint Request Packets


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-4.png)


## Class-Specific Setup Packets


As mentioned above, when bits D6..5 of `bmRequestType` are set to `0b01`, it indicates that the Setup Packet is class-specific. The definitions of each field in a Setup Packet vary across different USB Classes.


The following shows the Setup Packet structures for UVC SET and GET requests as described in Section 4.1 "Request Layout" of the UVC 1.5 Specification:


SET Request Structure:


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-5.png)


GET Request Structure:


![Untitled.png](/images/blog/USB控制传输中的Setup-Packet-6.png)


The UVC protocol uses control transfers to issue control commands and read status parameters from a UVC camera. The first stage of a control transfer consists of the Host issuing a Setup Packet. Through this Setup Packet, the Host specifies the command's destination, the specific request type, and the length of the data to be contained in the subsequent data stage.


## References

- [USB in a NutShell - Chapter 6 - USB Requests (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb6.shtml#SetupPacket)
- UVC 1.5 specification, 4.1 Request Layout