---
title: "Summary of Wireshark Packet Capture Mechanisms and Usage Tips"
slug: "2021-01-21-wireshark-monitor"
description: "This article summarizes the working principles behind wired and wireless network packet capture, as well as the basic workflow for capturing packets using Wireshark."
date: 2021-01-21T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi","Wireshark","Wireless Communication","Network"]
draft: false
---


## **Basic Introduction to Wireshark**

- Wireshark is the world's most widely used open-source packet capture software (formerly known as Ethereal). It is a general-purpose network packet sniffer and protocol analysis tool. It has been released under the GPL open-source license since 1998.
- Main functions:
    - Analyzing low-level network protocols;
    - Troubleshooting network issues;
    - Identifying network security issues;
- Excellent cross-platform support, running smoothly on Windows, macOS, and Linux/Unix systems;
- Official website: www.wireshark.org;
- Other software related to or similar to Wireshark:
    - Sniffer
    - Omnipeek
    - Fiddler and HTTPWatch (these two tools are mainly used to capture and analyze HTTP protocol traffic);
    - Colasoft Capsa
- Packet capture data in Wireshark can be saved in many other file formats, allowing saved data to be opened and analyzed in other packet capture tools. Additionally, Wireshark's export feature allows filtering data within a capture sequence/file and exporting it to a new capture file;

## **Promiscuous Mode of Wired Network Interfaces**

- Wired Network Interface Cards (NICs) support two operating modes: normal mode and promiscuous mode.
- In normal mode, when the NIC receives a packet whose destination MAC address does not match its own MAC address (excluding broadcast packets, which have a fixed MAC address of FF:FF:FF:FF:FF:FF), it discards the packet. As a result, the NIC driver, the OS kernel above it, and applications cannot see network packets not addressed to them. Therefore, in normal operating mode, the NIC only passes packets addressed to itself and received broadcast packets up the stack, discarding all other packets;
    - This handling significantly improves device system and application processing performance. If the NIC were to submit a large volume of packets not intended for itself to the kernel and applications, significant CPU cycles would be wasted on irrelevant processing, severely affecting system performance;
    - In this operating mode, capturing packets on the NIC using Wireshark will naturally only capture packets sent to the local device and broadcast packets received on the current network;
- To capture packets meant for other devices on the network in Wireshark, the NIC must be placed into promiscuous mode.
    - **Not all NICs support promiscuous mode.**
    - Windows systems provide libpcap and WinPcap drivers, which allow switching the NIC mode to promiscuous mode conveniently via the Wireshark GUI.
- In promiscuous mode, the NIC can capture all network traffic reaching its interface. Regardless of whether the traffic is intended for itself (i.e., regardless of the destination address), packets are not discarded but sent directly to the system kernel and application layer for further processing. Thus, Wireshark running at the application layer can capture and display network packets not addressed to the host.
- Conclusion: To capture network packets not addressed to your device in Wireshark, you must use a network card that supports promiscuous mode.

## **Monitor Mode of Wireless Network Interfaces**

- Wireless Network Interface Cards (WLAN cards) have four operating modes:
    - Master Mode: Primarily used for Wireless Access Points (APs) to provide wireless access and routing management functions. Put simply, wireless routers operate in Master Mode.
    - Managed Mode: When a wireless client connects to an AP, the client operates in Managed Mode.
    - Ad Hoc Mode: Used for establishing direct P2P connections between two wireless devices.
    - Monitor Mode: Used for monitoring wireless network traffic. In this mode, the wireless client stops transmitting and receiving normal data, focusing exclusively on listening to packets transmitted on a specific channel over the air.
        - To use Wireshark to monitor wireless packets transmitted over the air, your wireless card must operate in this mode. Not all wireless cards support Monitor Mode.
        - Also referred to as RFMON Mode.
- As mentioned above, to monitor WiFi wireless packets over the air using Wireshark, you must have a wireless card that supports Monitor Mode, configure it to Monitor Mode, and specify the target WiFi channel. The wireless card will then focus on listening to all packets transmitted on that channel, parse them, and pass them to Wireshark for display.
- Comparison between Monitor Mode (Wireless) and Promiscuous Mode (Wired):
    - When a wired NIC is set to promiscuous mode, it can only monitor traffic transmitted within the network it has joined;
    - In contrast, wireless Monitor Mode does not require the wireless card to join any network to capture traffic. It can monitor wireless packets transmitted across all networks on the specified channel. Therefore, wireless networks are inherently much less secure than wired networks;
    - What about promiscuous mode on wireless cards? In theory, after joining an AP, a wireless card in promiscuous mode could monitor all traffic within that AP's network. However, in practice, a wireless card doesn't even need to join an AP to monitor all network traffic on that channel, granting much broader access. Thus, promiscuous mode on wireless cards is largely redundant.

## **Types of Packet Capture Environments and Their Mechanics**

- Packet Capture Environments in Wired Networks
    - Local Host Environment: Capturing and analyzing all incoming and outgoing network traffic on the local interface;
        - Capturing and analyzing only local traffic is the most basic and straightforward method of traffic monitoring and analysis;
    - Hub Environment: Same collision domain; can capture incoming and outgoing traffic for all devices connected to the same hub;
        - **All network packets passing through a hub are sent to every port on the hub. Therefore, sniffing network traffic in this setup is the easiest to implement—simply connect the network sniffer to any idle port on the hub;**
        - However, because hubs operate in half-duplex mode, only one connected device can transmit data at a time, resulting in low transmission efficiency. Hub-based network environments are rare today, so this environment exists mostly in theoretical analysis;
    - Switch Environment
        - Switches are the most common connection devices in modern network environments.
        - **Switches operate at the Data Link layer and uniquely identify connected device nodes via MAC addresses. A switch maintains an internal MAC address table (CAM table) storing mappings between MAC addresses and ports. Upon receiving a packet, the switch reads the MAC address in the header and queries the CAM table to determine which port to forward the packet to.**
        - Therefore, connecting a network sniffer to a switch port will only yield packets addressed to the sniffer itself and broadcast packets.
        - To sniff traffic in a switched network environment, the following primary methods are used:
            - Port Mirroring
            - Prerequisites:
                - The switch supports port mirroring configuration;
                - You have administrative privileges to configure port mirroring on the switch;
                - There is an idle port on the switch to connect the network sniffer;
            - Once port mirroring is configured, the switch duplicates forwarded traffic and sends a copy to the port where the network sniffer is connected;
            - Port mirroring support and configuration syntax vary across switch vendors;
    - Hub Outport Insertion
    - Using a Network TAP
    - ARP Spoofing
        - Does not require special switch administrative privileges;
        - ARP tool example: Cain & Abel;
        - By installing ARP spoofing tools on the sniffing machine, it sends ARP replies impersonating the MAC address of the target machine, causing traffic intended for the target to be routed to the sniffing machine instead.
    - MAC Flooding
        - Does not require special switch administrative privileges;
        - The sniffing machine floods the network with packets containing large numbers of fake MAC addresses. Upon receiving them, the switch populates its CAM table with these new MAC addresses. Because the CAM table capacity is limited, flooding it overflows the table and flushes legitimate MAC entries. Unmapped traffic is then flooded to all ports, allowing the sniffer to monitor the traffic.

## **Summary of Wireshark Usage Tips**

- Use the magnifying glass buttons on the toolbar to zoom in or out on the packet display window.
- Adding / Editing Columns:
    - Adding a column: Right-click the specific item in the packet details pane and select "Apply as Column" to add it as a new column in the packet list;
    - Editing column information: Right-click the header of the corresponding column in the packet list window and select "Edit Column" to modify column details, such as the column title;
- Packet Time Settings:
    - Modify time display format: View -> Time Display Format;
    - Modify time base in the packet window: Select a packet in the sequence to serve as the start reference, where all other packet timestamps are calculated relative to this packet's time: Right-click the desired reference packet -> Set/Unset Time Reference;
    - Multiple time references can be set within a single capture sequence;
- Name Resolution:
    - Wireshark provides name resolution at various layers (MAC, IP addresses, and ports). When enabled, addresses in the packet list window are no longer displayed as plain MAC/IP addresses or port numbers, but automatically resolved into vendor strings (MAC addresses), public server names (IP addresses), and transport layer protocol names (port numbers), making the packet list cleaner and easier to review;
    - By default, only MAC layer resolution is enabled. To enable IP address and transport layer protocol resolution, go to Capture -> Options -> Name Resolution or Edit -> Preferences -> Name Resolution;
- Packet Marking:
    - To simplify packet analysis, use the Mark/Unmark Packet feature to highlight or un-highlight selected packets;
    - Coloring rules can also automatically apply different colors to different protocol types;
- Merging Multiple Capture Files:
    - If multiple capture files are obtained from separate capture sessions, use File -> Merge in Wireshark to combine them into a single list for analysis;
- Automatic Saving in Wireshark:
    - Configure Capture -> Options -> Output to automatically save captured packet data to a file. Wireshark will write incoming capture data directly to the specified file, and supports automatic file rotation based on file size, capture duration, or packet count;
- Filters:
    - Wireshark features two types of filters with distinct syntax:
    - Capture Filters: Configured under Capture -> Options -> Capture Filter. Packets that do not match the filter rules are discarded immediately at capture time;
        - Uses Berkley Packet Filter (BPF) syntax based on the libpcap/WinPcap libraries;
        - Type: host, net, port;
        - Direction (Dir): src, dst;
        - Protocol (Proto): ether, ip, tcp, udp, http, ftp;
        - Logical Operators: &&, ||, !, ==;
    - Display Filters: Configured in the filter bar above the packet list window. This filter does not drop packets; it merely hides non-matching packets from view;
        - Comparison Operators: ==, !=, >, <, >=, <=;
        - Logical Operators: and, or, xor, not;
        - IP Addresses: ip.addr, ip.src, ip.dst;
        - Ports: tcp.port, tcp.srcport, tcp.dstport;
        - Protocol Filters: arp, ip, icmp, udp, tcp, bootp, dns;

## **References**

- Practical Packet Analysis: Using Wireshark to Solve Real-World Network Problems (2nd Edition)
- [Four Modes of Wireless Network Cards](http://blog.chinaunix.net/uid-26497520-id-3711203.html)
- [Wireshark from Beginner to Master](https://www.bilibili.com/video/BV1YW411y7nr)