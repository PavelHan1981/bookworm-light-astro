---
title: "Parsing USB UVC Protocol SET/GET Request Data Structures"
slug: "2022-03-02-usb-uvc-get-set-request-data-structure"
description: "Based on Chapter 4 of the UVC protocol specification, this article summarizes the data structures of UVC SET and GET requests, providing detailed analysis and explanations for each field."
date: 2022-03-02T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["USB","UVC"]
draft: false
---


Based on Chapter 4 (Class-Specific Requests) of the UVC 1.5 specification, this article organizes the data structures of UVC SET and GET requests to help gain a comprehensive understanding of the UVC communication protocol implementation.


## Communication Flow of UVC Class-Specific Requests


In practice, UVC class-specific requests are Control Transfers performed on Endpoint 0. According to the Control Transfer specification, these requests consist of three main stages: Setup Stage, Data Stage, and Status Stage. The SET and GET requests for each control option also include these three stages, always starting with a Setup Packet issued by the Host:


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-1.png)


For SET-type requests (such as `SET_CUR` in the diagram above), the complete communication flow is as follows:

- The Host first sends a Setup Packet containing location information for the option to be set, option type, data length to be set (the data length is fixed for each option, while the actual data is transmitted in the Data Packet), etc.
- Then, the Host sends a Data Packet containing the actual configuration data.
- If the Device can return status information within 10 ms, it responds directly to the Host during the Status Stage of the control transfer. If it takes longer than 10 ms, it must return the status information to the Host via an Interrupt Endpoint registered by the interface.

For GET-type requests (such as `GET_CUR` in the diagram above), the complete communication flow is as follows:

- The Host first sends a Setup Packet containing location information for the option to be read, option type, data length to be read (the data length is fixed for each option, while the actual data is transmitted in the Data Packet), etc.
- Upon receiving it, the Device sends a Data Packet back to the Host containing the actual read data for the option.
- Finally, the Device returns a status packet to the Host during the Status Stage of the control transfer.

For more details on Control Transfers and Setup Packets, refer to:

- [USB Transfer Types: Control Transfer](https://www.pavelhan.tech/2022-03-01-usb-control-transfer)
- [Setup Packet in USB Control Transfer](https://www.pavelhan.tech/2022-02-25-usb-setup-packet)

## Related Terminology

- Control Selector: The specific option type to be set or read.
- Entity: The target entity of the communication, which can be an Interface or a Unit/Terminal within an interface. An Entity may contain one or more options (Control Selectors) available for access.

## Overall Data Structure of UVC Class-Specific Requests


UVC class-specific requests can generally be divided into two categories: SET requests and GET requests. SET requests are used to configure operating parameters in the UVC camera, while GET requests are used to read current operating parameters, valid parameter ranges, default values, etc.


### Set Requests


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-2.png)

- `bmRequestType`:
    - bit 7: 0 indicates the packet is sent from Host to Device;
    - bit 6..5: `0b01` indicates this Setup Packet is a class-level packet;
    - bit 4..0: 1 indicates the Setup Packet is targeted at an interface, while 2 indicates an endpoint, depending on how the specific command is defined in the specification;
- `bRequest`:
    - Defined in Table A.8 of the UVC specification; here, `SET_CUR` corresponds to `0x01`;

![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-3.png)

- `wIndex` and `wValue`: Used together to specify which Interface/Unit/Endpoint the SET request is targeted at and which specific option to set;
    - The high byte of `wValue` typically passes the type of option to be set. If the target Entity has multiple configurable options, `wValue` is used to specify which option to set. If the Entity has only one option, `wValue` may be used to pass other parameters;
    - The low byte of `wIndex` specifies the target interface number or endpoint address, while the high byte specifies the Entity/Unit ID or 0;
        - Whether a UVC SET/GET Request received by a UVC Device is addressed to the Video Control Interface or the Video Streaming Interface is determined by the lower 8 bits of `wIndex`. The lower 8 bits of `wIndex` correspond to the Interface Index, matching the Index numbers of the two interfaces defined in the USB enumeration descriptors;
    - Therefore, combining `wIndex` and `wValue` determines where the command should be routed and which option is being set;
- `wLength`: Data Stage length; each option parameter has its own specific length;
- `Data`: The actual data to be configured, contained in the Data Packet. The Setup Packet contains only the first 5 fields;

### Get Requests


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-4.png)

- `bmRequestType`: Same as Set Requests, except bit 7 is set to 1, indicating that the Data Stage of this transfer reads data from the Device;
- `bRequest`: Defined in Table A.8 of the UVC specification;
- `wIndex` and `wValue`: Definitions are identical to those in Set Requests;
- `wLength`: Data Stage length; each option parameter to be read has its own specific length;
- `Data`: The actual read data, contained in the Data Packet. The Setup Packet contains only the first 5 fields;

## VideoControl Requests


Requests for the Video Control Interface fall into two categories: Interface Control Requests (interface-level) and Unit and Terminal Control Requests (terminal/unit-level).


### Interface Control Requests


These commands are sent directly to the Video Control Interface and handled directly by the interface itself:


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-5.png)

- `wValue`: Specifies the ID of the interface option to be set. The Video Control Interface supports only two interface-level options: Power Mode Control and Request Error Code Control, corresponding to `CS=0` and `CS=1`, respectively;
- `wIndex`: Set to the interface number of the Video Control Interface;
- Other fields align with the general descriptions of SET and GET Requests.

### Unit and Terminal Control Requests


These commands are sent to the Terminals and Units under the Video Control Interface. The supported options vary for each Terminal and Unit.


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-6.png)

- `wValue`: Specifies the option ID to be set. Terminals and Units within the Video Control Interface support numerous options; this CS (Control Selector) distinguishes which option is being operated on;
    - For `ALL`-type requests, since they operate on all options within a Unit or Terminal, `wValue` is set directly to 0;
- `wIndex`: Specifies the index ID of the target Unit or Terminal, as defined in the UVC configuration descriptors;
- Other fields align with the general descriptions of SET and GET Requests.

## VideoStreaming Requests


Since the Video Streaming Interface does not have the concepts of Units or Terminals, all request commands are sent directly to the interface level for processing.


![Untitled.png](/images/blog/USB-UVC协议SET-GET-Request结构解析-7.png)

- `wValue`: Specifies the interface option ID to access. The UVC device parses this ID to determine which Video Streaming Interface option the command targets;
- `wIndex`: Set to the interface number of the Video Streaming Interface;
- Other fields align with the general descriptions of SET and GET Requests.

## References

- USB Device Class Definition for Video Devices V1.5: 4 Class-Specific Requests