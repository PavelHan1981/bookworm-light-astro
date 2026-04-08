---
title: "主流无线投屏技术对比"
slug: "2022-08-23-most-popular-wireless-cast-techonology"
description: "本文通过对网上相关资料的收集和整理，对比了目前市面上主流的无线投屏技术的主要工作流程和功能。"
date: 2022-08-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["音视频","WiFi"]
draft: false
---


投屏技术从使用方式上主要可以分为两大类：

- 推送投屏：手机/平板把要播放的视频推送到电视上，由电视自行拉流、解码、播放，电视开始播放后手机/平板就可以关闭了；
- 镜像投屏：手机/平板上的屏幕显示内容实时的投屏显示在电视上，使用中手机/平板不能关机/关屏；

对于这两种投屏技术而言，根据其应用的流程，明显可以看出推送投屏更适合于家庭场合，可以把手机/平板上的视频内容推送到相同局域网中，屏幕更大的电视看，得到更好的观赏体验；而镜像投屏则更适合办公场合，把PC/笔记本上的屏幕投屏到投影仪、电视上，提供给更多人参与的视频会议上进行沟通讨论。


## Airplay：推送投屏+镜像投屏


Airplay是Apple推出的无线显示标准，因此其应用也就主要局限于Apple的生态之中。最典型的就是把iPhone，iPad或者MAC的视频显示在Apple TV上。


使用Airplay的时候，推送设备和显示设备需要处于同一局域网内，才能正常的发现设备并实现投屏显示的功能。


Airplay能够同时实现推送投屏和镜像投屏的功能：

- 镜像投屏：在推送设备的屏幕下拉界面中提供了镜像投屏的按钮，点击以后就可以显示出来当前局域网下支持Airplay显示的设备列表，选择后在显示设备中就会实时的显示出来当前推送设备的屏幕显示内容。使用逻辑与Miracast基本一致。
- 推送投屏：可以实现把手机/平板上的照片、视频等推送到显示设备上进行显示。在包含音视频内容的APP中找到分享界面，在其中选择投屏功能，然后选择同一局域网下的显示设备，点击后就可以把这个视频、图像等推送到显示设备上解码显示、播放。在播放的过程中可以关闭推送设备的屏幕，也可以使用推送设备对播放进程进行控制操作。这一点使用逻辑与Chromecast的操作基本一致。

Airplay最大的问题：只能应用在Apple自己的生态中（当然国内的不少机顶盒和电视机厂商实现了对Airplay的破解，从而可以利用Airplay在非苹果生态中的部分使用），在Windows和Android生态中使用Airplay存在各种稳定性和兼容性的问题。


## DLNA：推送投屏


DLNA是Sony于2003年发起的非营利性标准化组织，旨在制定在局域网内部进行多媒体文件及其信息共享的通信协议标准，目前已有超过200个会员。


DLNA协议依赖于uPnP（Universal Plug and Play）协议来实现底层通信架构。


DLNA主要能够实现的功能就是推送投屏。基本的运行逻辑就是：基于uPnP协议发现局域网内能够提供DLNA推送播放的设备，然后把需要播放的音视频文件的URL发给这个设备，此后这个设备就自行通过自己的互联网连接访问这个URL并开始播放显示。在后续播放的过程中，之前的推送设备可以继续实现对播放过程的控制（快进回退、调节音量等），但也可以完全关掉屏幕或者打开别的APP继续使用，这个使用场景与Miracast的镜像投屏有着非常明显的区别。

- DLNA也可以支持把推送设备上的照片、视频等推送到显示设备上播放显示出来。

DLNA协议框架下的主要设备类型：

- DMP（Digital Media Player）：实际上就是起到播放器的作用。在DMP上可以通过uPnP协议发现局域网内共享的DMS服务器中包含的音视频文件，然后在DMP上执行播放的功能。
- DMS（Digital Media Server）：用于保存音视频文件的存储服务器，最典型的就是NAS。在DLNA的协议框架下，DMS通过广播的方式告知自己所在的位置，然后DMP可以查询到DMS的存在，找到其中包含的音视频文件并播放。
- DMR（Digital Media Render）：与DMP非常类似，也是一个播放器。但是两者最大的不同是：DMP只能自己播放自己从局域网上找到的音视频文件，不能被DMC设备所控制；而DMC则在DMP的功能上增加了可以被外部DMC发现并控制的功能，这样就可以通过DMC来控制DMR上播放的内容和播放进程。
- DMC（Digital Media Controller）：用于发现和控制的中间设备，典型的应用就是在DMC上发现局域网中存在的DMR和DMS设备，在DMS设备上找到要播放的视频文件，然后把这个文件推送到DMR上进行播放。

如果要把手机上的照片、视频文件推动到局域网内的电视上播放出来，手机就承担了DMS+DMC的角色，而电视则是一个DMR设备；


而如果要在手机上控制电视播放B站或者Netflix的视频，，手机就是DMC的角色，而电视就是DMR设备。


## Miracast：镜像投屏


2012年首次由WiFi Alliance发布，其底层采用了WiFi Direct技术，因此不需要通过路由器，可以直接在两个设备之间建立P2P连接（这一点有些类似于蓝牙，当然通信带宽和功耗要比蓝牙大很多）。


Miracast支持对传输的图像进行H.264压缩，因此可以通过无线传输4K和1080P视频，也能够支持5.1声道的音频数据传输。


主要特性：

- 底层通信技术采用WiFi Direct，因此通信频段就是WiFi所使用的2.4GHz和5GHz，加密方式是WPA2。
- **主要的应用场景就是屏幕镜像Screen Mirroring**：把一个设备的屏幕上显示的内容以镜像的方式同步显示在另外显示设备上。

Miracast的软件支持方面：从Window 8.1以后的Windows系统版本以及Android 4.2（KitKat）和Android 5（Lollipop）都能够支持Miracast。

- Google在Android 6及其以后的系统中去掉了对Miracast的原生支持，主推自家的Chromecast。但是实际上有些Android手机厂家又自己把Miracast的功能加到自己发布的手机系统中，这样就导致市面上出售的Android手机是否能够支持Miracast成了概率性的事情。
- 当然苹果的iOS和MAC是不支持Miracast，他们要主推自家的Airplay。

因此总结起来，实际上目前从生态上讲，对Miracast支持最好的生态就是MircoSoft的Windows系统了。


因为Miracast的主要功能就是Screen Mirroring，因此它无法支持DLNA这样的推送播放的功能：如果你想要把手机上正在播放的Netflix的视频，通过Miracast技术投影显示到另外一个无线的显示器上，你就必须要让手机保持打开及播放的状态。Miracast始终只是把手机上正在显示的内容通过无线的方式发送到无线显示器上显示出来而已。


Miracast的另外一个饱为诟病的问题是稳定性。即使是在通过Miracast认证的设备之间进行操作，也经常会有各种稳定性和兼容性方面的问题。


因为Miracast底层技术使用WiFi Direct，并且其应用场景也仅仅是在WiFi Direct形成的内网中进行音视频的无线传输，因此Miracast的使用不需要连接到其他的路由器，也不需要有外部的互联网连接。这一点是Miracast在应用中的一个很大的优势。


## Chromecast：推送投屏


ChromeCast实际上Google发布的一款插在电视机HDMI接口上的无线HDMI Adapter，通过HDMI方式插在电视上，同时内置WiFi，因此可以通过WiFi与其他设备连接以及访问外网。

- 本质上就是一个直接插到电视机HDMI口上的迷你机顶盒而已。因为HDMI接口本身无法提供电源供应，因此Chromecast在硬件设计上还有一个USB口用于给设备供电。

不同于Miracast，Chromecast要能够正常使用，需要有外部的互联网连接支持。即使只是要把局域网内的照片显示到电视、或者像Miracast一样做镜像投屏的功能，也是需要外部互联网正常的情况下，才能使用Chromecast。


不同于DLNA所采用的uPnP协议，Chromecast使用了一种Youtube和Netflix共同开发的DIAL（Discovery And Launch）协议来对设备的发现和投屏进行管理和控制。这项技术由Google持有，但是免费提供给其他的产品厂商以及媒体内容提供商使用。

- 在DIAL协议框架下，DIAL客户端使用SSDP协议（Simple Service Discovery Protocol，在uPnP协议中定义）来实现对相同网络中的DIAL服务进行扫描和定位（因此，Client和Server就需要在同一个局域网内）。典型的DIAL客户端就是手机、平板以及电脑，而Chromecast本身就是DIAL Server。
- 针对Chromecast的推广使用，Google专门推出一个Google Cast SDK，这样第三方APP的开发者就可以基于这个SDK整合Chromecast的推送功能到自己的APP中：点击推送按钮，就会出来当前网络下的Chromecast设备列表，然后把自己要推送的内容根据协议推送给Chromecast在电视上播放出来。

Chromecast推送功能的系统支持列表：

- Android 6.0 or higher
- iOS or iPadOS 12.0 or higher
- Mac OS 10.9 or higher
- Windows 7 or higher
- Linux computers' compatibility is based on the distribution, desktop support and available drivers

总体的感觉是，Chromecast的功能、使用方式以及工作流程实际上与DLNA非常类似，都是在一个局域网内可以把手机或者PC上的内容推送到电视上，由电视自己来拉流播放。而且DLNA还是一个纯软件的行为，不需要额外花钱买Chromecast这个硬件。那么Chromecast相比DLNA的真正优势又是什么呢？大概也就是能够支持那些没有内置DLNA协议的非智能操作系统的电视机吧。


## WiDi：镜像投屏


WiDi（Intel Wireless Display）是intel推出的无线显示技术，其底层采用了与Miracast相同的WiFi Direct技术。


Intel推出WiDi的本意是要与Apple的Airplay进行竞争，但是商业推广上很失败，从WiDi 3.5标准开始已经融入Miracast之中。


## 参考资料

1. [WIFI-Direct（Wifi直连）、AirPlay、DLAN、Miracast功能介绍 - 百度文库 (baidu.com)](https://wenku.baidu.com/view/e14fdf7774232f60ddccda38376baf1ffc4fe31c.html)
2. [Wireless Display Standards Explained: AirPlay, Miracast, WiDi, Chromecast, and DLNA (howtogeek.com)](https://www.howtogeek.com/177145/wireless-display-standards-explained-airplay-miracast-widi-chromecast-and-dlna/)
3. [Understanding Miracast as a wireless display technology | by Copperpod IP | Medium](https://copperpod.medium.com/understanding-miracast-as-a-wireless-display-technology-a3a384ecd4ff)
4. [How Chromecast Works | HowStuffWorks](https://electronics.howstuffworks.com/chromecast.htm)
5. [What DLNA Is and How to Use It (lifewire.com)](https://www.lifewire.com/what-is-dlna-1847363)
