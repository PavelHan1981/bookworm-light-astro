---
title: "A Comparison of Mainstream Wireless Casting Technologies"
slug: "2022-08-23-most-popular-wireless-cast-techonology"
description: "This article compares the main workflows and features of mainstream wireless casting technologies currently available on the market, based on a compilation of relevant online resources."
date: 2022-08-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio and Video"]
tags: ["Audio and Video","WiFi"]
draft: false
---


Wireless casting technologies can be broadly classified into two main categories based on how they are used:

- **Push Casting (Streaming)**: The phone/tablet pushes the video to be played to the TV. The TV then independently pulls the stream, decodes, and plays it. Once playback starts on the TV, the phone/tablet can be turned off or used for other tasks.
- **Screen Mirroring**: The screen content of the phone/tablet is mirrored onto the TV in real-time. During use, the phone/tablet must remain turned on with its screen active.

Based on their workflows, it is clear that push casting is better suited for home entertainment, where video content from a phone/tablet can be cast to a larger TV on the same local area network (LAN) for a better viewing experience. In contrast, screen mirroring is more suitable for office environments, where the screen of a PC/laptop is projected onto a projector or TV to facilitate communication and discussion during multi-person video conferences.


## AirPlay: Push Casting + Screen Mirroring


AirPlay is a proprietary wireless display standard developed by Apple, meaning its application is primarily confined to the Apple ecosystem. The most typical use case is displaying video from an iPhone, iPad, or Mac onto an Apple TV.


When using AirPlay, both the sender (push device) and the receiver (display device) must be on the same local network to discover each other and perform casting.


AirPlay supports both push casting and screen mirroring:

- **Screen Mirroring**: A screen mirroring button is available in the control center (pull-down menu) of the sender device. Tapping it displays a list of AirPlay-compatible devices on the current LAN. Once selected, the sender device's screen is mirrored to the display in real-time. The operational logic is fundamentally the same as Miracast.
- **Push Casting**: Users can stream photos, videos, and other media from their phone/tablet to the display device. In media-enabled apps, users can find the casting icon in the sharing/playback interface, select a receiver device on the same LAN, and cast the media. The receiver then decodes and plays the content. During playback, the sender's screen can be turned off, and the sender can still control playback progress. The logic here is very similar to Chromecast.

The biggest limitation of AirPlay is its confinement to the Apple ecosystem. (Although many set-top box and TV manufacturers in China have reverse-engineered AirPlay to allow partial use in non-Apple systems, using AirPlay in Windows and Android environments still comes with various stability and compatibility issues.)


## DLNA: Push Casting


DLNA (Digital Living Network Alliance) was a non-profit collaborative standards organization founded by Sony in 2003. Its goal was to define interoperability guidelines for sharing digital media and information over a local area network. At its peak, the alliance had more than 200 members.


The DLNA protocol relies on the UPnP (Universal Plug and Play) protocol for its underlying communication framework.


The primary function of DLNA is push casting. Its basic operational logic is: it uses the UPnP protocol to discover devices on the local network that support DLNA rendering, then sends the URL of the audio/video file to that device. The receiver device then independently accesses the URL via its own network connection, fetches the stream, and begins decoding and playback. During playback, the sender device can continue to control the media (such as fast-forwarding, rewinding, adjusting volume, etc.), or it can completely turn off its screen or switch to other apps. This scenario is distinctly different from Miracast's screen mirroring.

- DLNA also supports casting local photos and videos from the sender device directly to the rendering device.

Key Device Classes under the DLNA Protocol Framework:

- **DMP (Digital Media Player)**: Acts as the media player. A DMP can discover media files shared on a DMS (Digital Media Server) within the LAN via UPnP and play them locally on the DMP device.
- **DMS (Digital Media Server)**: A storage server used to save multimedia files, with NAS being the most typical example. Within the DLNA framework, the DMS broadcasts its presence so that DMPs can locate it, browse its media files, and play them.
- **DMR (Digital Media Renderer)**: Very similar to a DMP as it also plays media. However, the key difference is that a DMP can only pull and play media it finds on the LAN itself and cannot be controlled by a DMC. In contrast, a DMR adds the capability to be discovered and controlled by an external DMC, allowing the DMC to control the media being played on the DMR and its playback progress.
- **DMC (Digital Media Controller)**: An intermediary device used for discovery and control. A typical application is using a DMC to find DMR and DMS devices on the LAN, browsing the media on the DMS, and pushing the selected file to the DMR for playback.

If you want to cast local photos or videos from your phone to a TV on the same LAN, the phone acts as both a DMS and a DMC, while the TV acts as a DMR.


If you want to use your phone to control the TV to play videos from platforms like Bilibili or Netflix, the phone acts as the DMC, and the TV acts as the DMR.


## Miracast: Screen Mirroring


First introduced by the Wi-Fi Alliance in 2012, Miracast uses Wi-Fi Direct as its underlying technology. Consequently, it does not require a router and can establish a direct peer-to-peer (P2P) connection between two devices (somewhat similar to Bluetooth, though with significantly higher bandwidth and power consumption).


Miracast supports H.264 compression for video transmission, enabling wireless streaming of 4K and 1080p video, as well as 5.1-channel surround sound audio.


Key Features:

- **Underlying Communication**: Uses Wi-Fi Direct, operating over standard 2.4 GHz and 5 GHz Wi-Fi frequency bands, secured by WPA2 encryption.
- **Primary Use Case**: **Screen Mirroring**. It synchronizes and displays the exact screen contents of one device onto another in real-time.

Software Support: Miracast is natively supported by Windows versions from Windows 8.1 onwards, as well as Android 4.2 (KitKat) and Android 5 (Lollipop).

- Google dropped native support for Miracast in Android 6 and later versions to promote its own Chromecast. However, some Android phone manufacturers manually add Miracast support back into their custom ROMs. As a result, whether a retail Android phone supports Miracast has become somewhat hit-or-miss.
- Naturally, Apple's iOS and macOS do not support Miracast, as they promote their proprietary AirPlay.

In summary, from an ecosystem standpoint, Microsoft's Windows is currently the platform with the best support for Miracast.


Because Miracast's primary function is screen mirroring, it cannot support push-to-play features like DLNA. If you want to cast a Netflix video playing on your phone to a wireless display via Miracast, you must keep your phone screen on and active. Miracast simply transmits whatever is currently on the sender's screen over a wireless connection to the receiver.


Another widely criticized aspect of Miracast is its stability. Even when casting between Miracast-certified devices, users frequently encounter various stability and compatibility issues.


Because Miracast relies on Wi-Fi Direct and only transmits audio and video within the private network established by Wi-Fi Direct, it does not require a connection to an external router or the internet. This is a significant advantage of Miracast in many scenarios.


## Chromecast: Push Casting


Chromecast is a wireless HDMI adapter developed by Google that plugs directly into a TV's HDMI port. Equipped with built-in Wi-Fi, it connects with other devices and accesses the external internet.

- Essentially, it is a mini set-top box plugged directly into the TV's HDMI port. Since HDMI ports cannot supply enough power on their own, the Chromecast hardware design includes a USB port for power delivery.

Unlike Miracast, Chromecast requires an active internet connection to function properly. Even if you only want to cast photos from your local network or mirror your screen like Miracast, Chromecast still depends on external internet connectivity.


Unlike DLNA, which relies on the UPnP protocol, Chromecast uses the DIAL (Discovery and Launch) protocol—developed jointly by YouTube and Netflix—to manage and control device discovery and casting. This technology is owned by Google but is provided free of charge to other hardware manufacturers and media content providers.

- Under the DIAL protocol framework, a DIAL client uses the SSDP (Simple Service Discovery Protocol, defined in UPnP) to scan for and locate DIAL services on the same network (meaning the client and server must reside on the same LAN). Typical DIAL clients include smartphones, tablets, and computers, while the Chromecast itself acts as the DIAL server.
- To promote Chromecast adoption, Google released the Google Cast SDK. This allows third-party app developers to integrate Chromecast casting features into their own applications. Tapping the casting button displays a list of available Chromecast devices on the current network, and the selected media is pushed to the Chromecast for playback on the TV.

Supported Platforms for Chromecast Casting:

- Android 6.0 or higher
- iOS or iPadOS 12.0 or higher
- macOS 10.9 or higher
- Windows 7 or higher
- Linux computers' compatibility is based on the distribution, desktop support and available drivers

Overall, Chromecast's functionality, usage, and workflow are very similar to DLNA. Both allow users to push content from a phone or PC to a TV within a local network, letting the TV pull and stream the content independently. Furthermore, DLNA is entirely software-based and does not require purchasing extra hardware like Chromecast. What is Chromecast's real advantage over DLNA then? Perhaps it is simply its ability to support non-smart TVs that do not have built-in DLNA protocols.


## WiDi: Screen Mirroring


WiDi (Intel Wireless Display) is a wireless display technology developed by Intel, which uses the same underlying Wi-Fi Direct technology as Miracast.


Intel originally introduced WiDi to compete with Apple's AirPlay, but it failed commercially. Starting from the WiDi 3.5 standard, it was merged into Miracast.


## References

1. [Introduction to Wi-Fi Direct, AirPlay, DLNA, and Miracast - Baidu Library (baidu.com)](https://wenku.baidu.com/view/e14fdf7774232f60ddccda38376baf1ffc4fe31c.html)
2. [Wireless Display Standards Explained: AirPlay, Miracast, WiDi, Chromecast, and DLNA (howtogeek.com)](https://www.howtogeek.com/177145/wireless-display-standards-explained-airplay-miracast-widi-chromecast-and-dlna/)
3. [Understanding Miracast as a wireless display technology | by Copperpod IP | Medium](https://copperpod.medium.com/understanding-miracast-as-a-wireless-display-technology-a3a384ecd4ff)
4. [How Chromecast Works | HowStuffWorks](https://electronics.howstuffworks.com/chromecast.htm)
5. [What DLNA Is and How to Use It (lifewire.com)](https://www.lifewire.com/what-is-dlna-1847363)