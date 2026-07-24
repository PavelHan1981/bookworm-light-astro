---
title: "Reverse Control Protocol for AHD Analog Cameras - CoaxialProtocol"
slug: "2020-09-22-AHD-coaxial-protocol"
description: "This article summarizes the Coaxial protocol used for reverse control of PTZ and other devices on AHD cameras via coaxial cable."
date: 2020-09-22T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio/Video"]
tags: ["Audio/Video","AHD"]
draft: false
---

## **Background**

- For controlling the lens movements of a PTZ camera, using the IP protocol is straightforward: IP cameras and control hosts can establish full-duplex bidirectional communication via the IP protocol, allowing PTZ control commands to be conveniently sent to the camera for lens rotation, zoom, and other controls.
- However, for analog cameras, achieving this easily is problematic: since there is only a single coaxial cable providing an analog video signal line between the analog camera and the DVR, how can PTZ control commands be simply sent via the DVR?
- The traditional approach is:

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-1.png)

- That is: an additional dedicated Control Line, typically RS485, is added between the camera and the DVR for transmitting control information. This allows the DVR to send control commands to the camera via this Control Line.
- However, this solution requires additional wiring, making construction and installation much more complicated, and it is also incompatible with existing wiring layouts. Is there a more convenient solution?

## **Implementing Reverse Control Directly on Coaxial Cable**

- **This solution differs from the aforementioned approach of adding an extra Control Line. Instead, it directly couples control signals into the coaxial cable that transmits analog video images. These signals are then parsed at the camera end, thereby achieving reverse control.**
    - In this way, a single coaxial cable is used to transmit both analog video signals (CAM--->DVR) and reverse control command data signals (DVR--->CAM).
- Pelco was the first manufacturer to provide a coaxial cable-coupled reverse control protocol, which was named Coaxitron. Subsequently, various other manufacturers also created their own reverse control protocols based on similar technical implementation logic. Therefore, DVRs typically implement multiple versions of the Coaxial protocol to ensure compatibility with various camera brands and models.

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-2.png)

## **PELCO Coaxitron Protocol**

- Pelco's Coaxitron protocol has two command structure versions:
    - Standard protocol version, consisting of a series of 15 pulses, transmitted during the 18th line blanking interval of a video field.
    - Extended protocol version, consisting of a series of 32 pulses, where 16 pulses are transmitted during the 18th line blanking interval, and the other 16 pulses are transmitted during the 19th line blanking interval.

## **Nextchip Reverse Control Logic Implementation Reference**

Divided into two parts: DVR and Camera:

- The DVR uses NVP6158C to receive analog video images from the camera and issue reverse control commands; these reverse control commands are coupled into the analog video coaxial cable and sent back to the camera end.
- The camera end uses NVP2470H, which interfaces with a digital CMOS image sensor, processes the image through an internal ISP, converts it to an analog image via DA conversion, and transmits the analog image to the DVR via coaxial cable.
- **DVR NVP6158C**: The NVP6158C includes a Coaxial Communicator module. By writing to its registers, it can be controlled to issue corresponding reverse control commands to the chip's MPP1-4 pins.

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-3.png)

- **Camera NVP2470H**: The NVP2470H also includes a COAX Comm module. The chip's GPIO19 is effectively the COAX RX pin. When configured for COAX operating mode, it can receive and parse reverse control data in conjunction with the chip's provided `coax_rx_done` interrupt.

![Untitled.png](/images/blog/AHD模拟摄像头的反向控制协议-CoaxialProtocol-4.png)

## **References:**

- [PTZ Camera Coaxial Control（How to set up）](https://learncctv.com/ptz-coaxial-control/)
- NVP6158C Datasheet Release v00 Chapter 4;
- NVP2470H Datasheet;
---