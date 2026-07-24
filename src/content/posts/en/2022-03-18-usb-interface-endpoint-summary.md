---
title: "Summary of USB Interface and Endpoint Concepts"
slug: "2022-03-18-usb-interface-endpoint-summary"
description: "Based on learnings from 'USB in a Nutshell', this article summarizes key concepts regarding interfaces and endpoints in the standard USB protocol."
date: 2022-03-18T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["USB"]
draft: false
---


## Endpoints


Logically, an endpoint can be viewed as a FIFO buffer on the USB device side, used to store communication data between the Host and the Device.


Every USB device contains multiple endpoints. Thus, a USB device can be seen as running multiple independent FIFO queues in parallel, dedicated to storing data sent to or received from the Host. **The Host addresses the specific endpoint FIFO for data access using the device address and endpoint number.**

- All data sent from the Host to the Device is routed to the corresponding OUT endpoint FIFO based on the device address and endpoint number, and saved into the FIFO, waiting to be read by the Device when it is ready.
- All data sent from the Device to the Host is first placed into the corresponding IN endpoint FIFO. When the Host polls the endpoint data on the USB bus, it reads the data from this FIFO using an IN packet.

All USB devices must have Endpoint 0, and only Endpoint 0 is bidirectional. Endpoint 0 is used to handle all control and status requests. All other endpoints are unidirectional—either IN or OUT.

- Note that "IN" and "OUT" are defined from the Host's perspective. Thus, even though endpoints are FIFOs on the device side, an endpoint receiving data sent from Host to Device is an OUT endpoint, and an endpoint transmitting data from Device to Host is an IN endpoint.

![Untitled.png](/images/blog/USB接口与端点的概念总结-1.png)


## Endpoint Descriptor


![Untitled.png](/images/blog/USB接口与端点的概念总结-2.png)

- `bLength`: Specifies the size of this endpoint descriptor structure, fixed at 7.
- `bDescriptorType`: Descriptor type, fixed at 5, indicating an Endpoint Descriptor.
- `bEndpointAddress`: Specifies the endpoint direction and address/number.
    - Bits 0–3 specify the endpoint number, allowing a USB Device to have up to 16 endpoints.
    - Bit 7 specifies the endpoint direction: 0 for OUT, 1 for IN, referenced from the Host's perspective.
    - Control endpoints strictly use Endpoint 0; since Endpoint 0 is bidirectional, Bit 7 is not used for direction differentiation.
- `bmAttributes`: Endpoint attributes, used to define the transfer type (Control, Bulk, Isochronous, or Interrupt) and related attribute information.
- `wMaxPacketSize`: Maximum packet size that this endpoint can send or receive in a single transaction.
- `bInterval`: Ignored for Bulk and Control endpoints. For Interrupt and Isochronous endpoints, it specifies the polling interval for the endpoint.
    - The unit here is not time, but the number of frame/microframe periods on the USB bus. For USB 2.0 High-Speed devices, the base unit is 1 microframe (125 µs).
    - For Isochronous endpoints, this value is fixed at 1; for Interrupt endpoints, the value ranges from 1 to 255.

## Interfaces


An interface can be considered a logical collection of endpoints designed to implement a standardized, independent feature. Typically, a USB device has one device descriptor and one or more configuration descriptors (usually just one). Under each configuration descriptor, there can be multiple interface descriptors, and each interface descriptor can contain multiple endpoints to implement a specific function:


![Untitled.png](/images/blog/USB接口与端点的概念总结-3.png)


**Note: If a device contains multiple interfaces, these interfaces can operate concurrently and independently without mutual interference. The `bInterfaceNumber` field in the interface descriptor is used to distinguish between different interfaces.**


## Interface Alternate Settings


Interfaces can use Alternate Settings to dynamically alter their configuration at runtime.


The interface descriptor includes a dedicated `bAlternateSetting` field that specifies which alternate setting index this descriptor represents for a given interface.


If an interface does not require alternate settings, only a single interface descriptor needs to be defined with its `bAlternateSetting` set to 0.


If an interface enables alternate settings, multiple interface descriptors must be defined corresponding to the number of required alternate settings. These descriptors share the same `bInterfaceNumber` (indicating they belong to the same interface) but have different `bAlternateSetting` values. The Host can dynamically select and set a different Alternate Setting for this interface at runtime.


The most typical application of Alternate Settings is in interfaces containing Isochronous endpoints. Alternate Settings allow defining multiple `wMaxPacketSize` options for the interface, enabling the Host to dynamically select an appropriate setting based on bus bandwidth availability at runtime. For example, the UVC Video Streaming Interface retrieved from a Lenovo X260 laptop webcam utilizes Isochronous endpoints and defines multiple `wMaxPacketSize` options across several Alternate Settings:


```html
---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x01
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 01 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0080
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x00 (0 additional transactions per microframe -> allows 1..1024 bytes per packet)
Bits 10..0              : 0x80 (128 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 80 00 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x02
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 02 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0200
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x00 (0 additional transactions per microframe -> allows 1..1024 bytes per packet)
Bits 10..0              : 0x200 (512 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 02 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x03
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 03 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0400
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x00 (0 additional transactions per microframe -> allows 1..1024 bytes per packet)
Bits 10..0              : 0x400 (1024 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 04 01                              .......


        ---------------- Interface Descriptor -----------------
bLength                  : 0x09 (9 bytes)
bDescriptorType          : 0x04 (Interface Descriptor)
bInterfaceNumber         : 0x01
bAlternateSetting        : 0x04
bNumEndpoints            : 0x01 (1 Endpoint)
bInterfaceClass          : 0x0E (Video)
bInterfaceSubClass       : 0x02 (Video Streaming)
bInterfaceProtocol       : 0x00
iInterface               : 0x00 (No String Descriptor)
Data (HexDump)           : 09 04 01 04 01 0E 02 00 00                        .........


        ----------------- Endpoint Descriptor -----------------
bLength                  : 0x07 (7 bytes)
bDescriptorType          : 0x05 (Endpoint Descriptor)
bEndpointAddress         : 0x81 (Direction=IN EndpointID=1)
bmAttributes             : 0x05 (TransferType=Isochronous  SyncType=Asynchronous  EndpointType=Data)
wMaxPacketSize           : 0x0B00
Bits 15..13             : 0x00 (reserved, must be zero)
Bits 12..11             : 0x01 (1 additional transactions per microframe -> allows 513..1024 byte per packet)
Bits 10..0              : 0x300 (768 bytes per packet)
bInterval                : 0x01 (1 ms)
Data (HexDump)           : 07 05 81 05 00 0B 01                              .......
......
```


**By default, the descriptor setting with `bAlternateSetting = 0` is enabled for an interface. However, the Host can issue a standard `Set Interface` request at runtime to switch an interface to any of its defined alternate settings.**


## Interface Descriptor


![Untitled.png](/images/blog/USB接口与端点的概念总结-4.png)

- `bLength`: Specifies the size of this interface descriptor structure, fixed at 9.
- `bDescriptorType`: Descriptor type, fixed at 4, indicating an Interface Descriptor.
- `bInterfaceNumber`: Index/number of this interface within the configuration descriptor.
- `bAlternateSetting`: The alternate setting index for this interface descriptor.
- `bNumEndpoints`: Number of endpoints used by this interface. Note that Endpoint 0 (Control Endpoint) is excluded from this count if used.
- `bInterfaceClass`, `bInterfaceSubClass`, `bInterfaceProtocol`: These three parameters specify the standard class, subclass, and protocol implemented by this interface, as defined by the USB specifications.
- `iInterface`: Index of the string descriptor describing this interface.

## References

1. [USB in a NutShell - Chapter 3 - USB Protocols (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb3.shtml)
2. [USB in a NutShell - Chapter 5 - USB Descriptors (beyondlogic.org)](https://beyondlogic.org/usbnutshell/usb5.shtml)