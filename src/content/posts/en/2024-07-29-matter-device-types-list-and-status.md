---
title: "Matter-Supported Smart Home Device Types and Their Current Status"
slug: "2024-07-29-matter-device-types-list-and-status"
description: "Based on a study of the latest Matter 1.3 specification document, this article organizes the device types supported in the newest Matter ecosystem protocol, as well as the current status of support for these device types among platforms and device developers."
date: 2024-07-29T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["IoT"]
tags: ["Smart Home","Matter"]
draft: false
---


## Lighting Devices


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-1.png)


The lighting section is divided into four categories based on the characteristics to be controlled. An "On/Off Light" only supports basic on/off control. A "Dimmable Light" adds control over brightness. A "Color Temperature Light" builds on that by adding basic control over the light's color temperature, while an "Extended Color Light" supports even more advanced controls over both the brightness and color of the light source.


Overall, for basic controls such as on/off, brightness, and color temperature of these smart lights, there are already many hardware products on the market that support Matter for basic control of these features. Therefore, consumers have a relatively wide range of choices; for instance, brands like Philips Hue, WiZ, and Nanoleaf, as well as domestic manufacturers like Yeelight and Aqara, all offer products in this category. However, some relatively specialized features, such as dynamic lighting scenes and security lighting, still require the manufacturer's proprietary app protocols to control.


## Smart Plugs/Outlets and Other Actuators


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-2.png)


This category mainly targets various smart plugs, outlets, water pumps, and water valves.


Currently, for the basic on/off control of smart plugs and outlets, major smart home platforms already offer good support, and there is a wide range of hardware options to choose from. Although the Matter protocol already defines energy monitoring features for outlets—and many hardware products already support it—currently, none of the smart home platforms support accessing this information via Matter. Therefore, to view this data, users still need to use the hardware manufacturer's proprietary app.


## Switches and Controls


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-3.png)


This category mainly provides switches and other control functions to accompany products like smart lights. It is highly similar to the previous two categories, except that those categories integrate control directly into the product itself. Overall, support for this category from both smart home platforms and hardware products is currently quite widespread.


## Sensors


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-4.png)


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-5.png)


This category primarily covers various types of sensors. On the whole, Matter's support in this area is among the best, both from smart home platforms and hardware manufacturers, and there are many Matter-compliant sensor products readily available on the market.


## Closures


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-6.png)


This category mainly corresponds to applications like smart door locks, motorized shades/curtains, and their respective controllers.


Overall, Matter supports basic lock/unlock functions for applications like door locks (more advanced features, such as setting PIN codes via an app, are still not supported in Matter). Major smart home platform apps generally offer support for these products under the Matter protocol. However, smart lock hardware that fully supports Matter is still rare on the market. The main reason is that most smart locks rely on Wi-Fi or Bluetooth. As of now, Matter still does not support low-power Wi-Fi operations, and Bluetooth is not an underlying transport protocol supported by Matter for daily operations. Consequently, the smart locks currently supporting Matter are mostly Bluetooth-based devices that work in tandem with their respective proprietary hubs.


For motorized shade/curtain controls, overall support is quite comprehensive from both platforms and hardware products, with a rich selection of hardware options available on the market.


## HVAC


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-7.png)


This category mainly includes thermostats, fans, air purifiers, and other HVAC-related products.


Looking at the actual market, the only thermostat currently supporting Matter is Google's Nest Thermostat. Additionally, there are very few fan and air purifier hardware products on the market that comply with the Matter specification, totaling fewer than 10 models in total.


## Media Devices


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-8.png)


This category mainly corresponds to smart TVs and standard speakers. According to the Matter protocol specifications, if a TV product complies with Matter, users can use a mobile app as a remote to control the TV or cast media to it.


However, as of now, only Amazon's Fire TV products support operating as a Matter device, allowing users to cast media using the Alexa app via Matter Casting. Other major TV manufacturers have not yet released Matter-compatible products.


## Robotic Devices


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-9.png)


Currently, Matter supports functions for robot vacuums such as remote startup, setting cleaning modes, retrieving cleaning status, and monitoring accessory status.


On the smart home platform side, Apple and Samsung support managing robot vacuums via Matter, but Google and Amazon Alexa do not yet support this. As of now, there are only 3 to 4 robot vacuum hardware products on the market that support Matter, and some advanced features still require the manufacturers' proprietary apps.


## Appliances


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-10.png)


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-11.png)


As shown in the figures above, Matter's protocol roadmap covers an incredibly broad and comprehensive range of household appliances. Although major home appliance manufacturers have generally joined the Connectivity Standards Alliance (CSA, the organization behind Matter), unfortunately, as of July 2024, consumers still cannot purchase fully Matter-compliant products for the vast majority of these appliance categories. Only Midea has released a Matter-supported dishwasher and microwave.


## Energy Management


![Untitled.png](/images/blog/Matter支持的智能家居设备类型及其现状-12.png)


## Summary


Although the official Matter 1.0 specification was released back in October 2022, and major players in the smart home ecosystem—such as Apple, Google, Amazon, and Samsung—have indeed thrown their full weight behind it (with ecosystem software and hardware hubs receiving prompt updates for Matter), development across most device categories has not been very smooth, except for lighting, switches, and sensors. The variety of Matter-compatible hardware products available on the market remains quite limited. Therefore, even as the Matter specification has progressed to version 1.3, it remains to be seen how far this so-called universal smart home protocol will actually go.


Analyzing the underlying reasons, I believe Matter's mission is to serve as a universal smart home protocol that bridges communication and interaction between hardware from different manufacturers. While this undoubtedly simplifies smart home deployment and usage for consumers, it simultaneously erases the differentiation between different hardware products in the same category. This is something smart home hardware manufacturers are reluctant to see. Without differentiation, companies are forced to compete solely on price to capture market share. This is likely why hardware manufacturers are hesitant to invest heavily in Matter integration. In other words, the more powerful the Matter specification becomes for a single product category, the less room there is for manufacturers to deliver unique, value-adding differentiation, which in turn squeezes their profit margins. Thus, from this perspective, the evolution of the Matter specification runs counter to the fundamental interests of hardware manufacturers. Unless this issue is addressed, Matter's adoption—at least in terms of broad hardware support—is unlikely to accelerate anytime soon.


## References

- Matter Specification Version 1.3.0.1
- Matter Device Library Specification Version 1.3.0.1
- [Every device that works with Matter (July 2024) - The Verge](https://www.theverge.com/23568091/matter-compatible-devices-accessories-apple-amazon-google-samsung)