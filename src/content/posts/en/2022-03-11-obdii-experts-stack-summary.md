---
title: "Study Summary of the OBD-II Experts Software Stack"
slug: "2022-03-11-obdii-experts-stack-summary"
description: "This article is a study summary based on the official technical documentation of the OBD-II Experts Software Stack, covering the usage of this software stack and the features supported by the OBD-II protocol."
date: 2022-03-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["CAN","OBD","Hardware"]
draft: false
---


This article is a study summary based on the contents of Reference 1.


OBD-II Experts is a software component designed for protocol analysis of data transmitted over vehicle buses such as CAN and J1850. It supports parsing OBD-II protocol format data, which is widely used in contemporary vehicles. This software component follows a paid open-source business model with a simple one-time payment structure.

- Upon purchase, you receive the full source code for the complete protocol stack written in C, making it easy to port to your own target processor.

## Supported Basic Features and Protocols


The software module includes parsing and support for the following OBD-II, CAN, J1850, and KWP protocols:

- CAN 15765-4
- KWP2000
- ISO 9141
- J1850 PWM
- J1850 VPW

The main supported features include:

- **VIN**: Vehicle Identification Number reading and parsing.
- **Engine Coolant Temperature**: Reading the coolant temperature, which corresponds to the value shown on the vehicle's coolant temperature gauge.
- **Engine Speed (RPM)**: Reading engine speed, which can be used to determine if the engine is running.
- **MIL**: Malfunction Indicator Lamp status reading and parsing.
    - The OBD-II protocol defines a wide range of Diagnostic Trouble Codes (DTCs); the vehicle's current fault status can be determined based on the retrieved MIL state.
- **Vehicle Speed**: Reading vehicle speed.
- **Fuel Level**: Reading the remaining fuel level in the tank.

**Note: All of the above features are subject to vehicle compatibility—meaning they may be supported on some vehicles but not on others. In general, newer vehicle production years correlate with higher feature compatibility.**


## Vehicle Support for OBD Connectors and Protocols


**The OBD-II specification defines 5 different electrical protocols to support access to vehicle OBD-II data. Automakers can choose one of these protocols for implementation (which explains why the OBD J1962 connector contains so many pins—it must support the hardware interfaces for various electrical protocols).** Starting in 2008, ISO 15765 over CAN bus became a mandatory standard, so vehicles manufactured after 2008 almost universally rely on the ISO 15765 protocol over CAN bus to read OBD-II information.


For vehicles produced before 2008, different automakers adopted their own choices of electrical interfaces and protocols:


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-1.png)


The OBD interface on vehicles complies with the J1962 specification (meaning the OBD port is essentially a 16-pin J1962 connector):


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-2.png)

- **Pins 2 and 10**: Used for the J1850 PWM protocol;
- **Pin 2 alone**: Used for GM J1850 VPW single-wire communication;
- **Pins 7 and 15**: Used for ISO 9141-2 and ISO 14230 (KWP2000) communication;
    - Pin 7 is the K-Line, and Pin 15 is the L-Line;
- **Pins 6 and 14**: CAN interface (ISO 15765-4 protocol);
- **Pin 16**: Battery positive voltage; **Pins 4 and 5**: Chassis ground and signal ground, respectively.

## Software Architecture Diagram


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-3.png)

- As shown in the diagram above, OBD-II Experts supports not only the CAN bus widely used in modern vehicles, but also legacy or niche protocols such as J1850, J1939, PWM buses, and KWP. This design maximizes the stack's feature compatibility across different vehicles.
- At the application layer, developers can directly call the OBD API to retrieve required data.
- At the lower layer, physical connections must align with the specific OBD electrical interface and protocol used by the vehicle model to ensure proper data acquisition.

## Can Vehicle Control Be Achieved via OBD-II?


The screenshot below (sourced from Reference 1) explains this clearly:


![Untitled.png](/images/blog/OBD-II-Experts-Software-Stack学习总结-4.png)


In summary, as a diagnostic/debug interface, the OBD-II protocol itself does not include active vehicle control functions. However, because the physical OBD port connects to the vehicle's internal communication network, it is theoretically possible to send custom frames over a specific bus on the OBD connector to achieve control. In practice, vehicle control protocols are strictly guarded proprietary secrets by automakers, and reverse-engineering these protocols poses legal risks. Furthermore, control protocols vary significantly across different vehicle models. Consequently, a control command structure that works on one vehicle will likely fail on another, resulting in very poor cross-vehicle compatibility.


## References

1. [OBD II Software | Ready-To-Use Protocol Stack & Source Code (obdexperts.co.uk)](https://www.obdexperts.co.uk/software/#1448366943815-e26d41b9-11c9)