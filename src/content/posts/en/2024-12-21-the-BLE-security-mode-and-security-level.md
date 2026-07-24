---
title: "Summary of BLE Communication Security Modes and Security Levels"
slug: "2024-12-21-the-BLE-security-mode-and-security-level"
description: "This article provides a comprehensive overview of the three typical BLE security modes in practical applications and their respective security levels, with a primary focus on Security Mode 1."
date: 2024-12-21T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["Bluetooth"]
draft: false
---

Definition of BLE Security Modes: In the application scenarios defined by the Bluetooth specification, security modes refer to the specific security requirements, workflows, and countermeasures adopted by products during BLE communication. Different security levels correspond to different workflows and levels of protection. Users can choose the appropriate security level based on the product's security requirements and its inherent characteristics/IO capabilities.

Based on specific security requirements in communication, there are three main security modes for BLE in products: LE Security Mode 1, Mode 2, and Mode 3. Each security mode contains different security levels.

**Among these three security modes, the levels under Mode 1 are by far the most commonly used.**

It is worth noting that the selection of security modes and security levels is closely related to the specific application scenario, the device's IO capabilities, and the degree of data protection required. A higher security level is not always better.

## Security Mode 1

Mode 1 is primarily used to determine the security requirements and execution flow for pairing between two BLE devices, controlling the security level of the Bluetooth connection through the pairing process. Mode 1 is the most widely used security mode.

Regarding the pairing process between BLE devices, I have covered it in detail in my other notes:

- Detailed Analysis of BLE Device Pairing Modes and Processes (Part 1)
- Detailed Analysis of BLE Device Pairing Modes and Processes (Part 2)
- Detailed Analysis of BLE Device Pairing Modes and Processes (Part 3)

A clear understanding of the BLE pairing process and the communication keys established during connection is essential to fully grasp the various security modes and levels.

The following sections explain the different security levels included in Mode 1.

### Mode 1 Level 1: No Security Features

Level 1 has no security features. Two BLE devices communicating do not require hardware identity authentication, and all communication data does not undergo any encryption. The pairing process runs its course, but it is essentially a formality with no explicit security requirements.

Any BLE peripheral operating at this level can be directly connected by any BLE Central device. Communication between them is entirely in plaintext without encryption, and neither the integrity nor the authenticity of the data packets is verified. Packet contents can be monitored and parsed by any BLE Sniffer tool.

Of course, the advantage of Level 1 is that it provides the best user access experience, the fastest connection and communication speed, and imposes no restrictions on mutual connection and data access, making it the most convenient to use.

Because it lacks any security protection, it is well-suited for application scenarios with zero data security requirements, such as Bluetooth temperature and humidity sensors.

### Mode 1 Level 2: Data Encryption + No Hardware Identity Authentication

At Level 2, hardware identity authentication is not performed during the pairing process between two BLE devices, but the full pairing process is completed, and session encryption keys are exchanged at the end. Once the connection is established, all communication data is encrypted using the AES algorithm combined with session keys derived from the IRK. Even if monitored by a BLE Sniffer, the plaintext cannot be decrypted.

In practice, this level corresponds to the "Just Works" pairing mode. The pairing devices have neither a display to show pairing numbers nor a keypad to input them, meaning the user cannot participate in the pairing process, and thus effective device identity authentication is not possible.

This security level offers an improvement over Level 1, but the absence of hardware identity authentication during pairing makes it unsuitable for applications requiring high data security. However, since it requires no user intervention, it provides a smoother and more convenient user experience.

This level is also the highest security level supported by the Just Works pairing mode.

### Mode 1 Level 3: Data Encryption + Hardware Identity Authentication

The Level 3 pairing process requires hardware identity authentication for both pairing parties. This authentication either requires user intervention (Passkey Entry) or Out-of-Band (OOB) transmission outside of Bluetooth. Because it completes the full pairing process, mutual hardware identity confirmation is established. Subsequent key exchanges occur only after hardware identity verification is completed during pairing, resulting in more comprehensive security protection.

However, Level 3 defaults to LE Legacy Pairing, a relatively older pairing method, making its security slightly inferior to Level 4.

### Mode 1 Level 4: Data Encryption + Hardware Identity Authentication + Mandatory SC

Similar to Level 3, Level 4 provides comprehensive protection through data encryption and hardware identity authentication. However, building on Level 3, Level 4 mandates that both BLE devices use the more secure LE Secure Connections (SC) pairing process and mechanism, prohibiting the older LE Legacy Pairing mode. This grants devices operating at Level 4 a higher security level and enables hardware identity authentication methods such as Numerical Comparison.

## Security Mode 2

Mode 2 primarily addresses packet signature mechanisms during communication while BLE devices are connected.

The data packet signature mechanism means that for each data packet sent by two connected BLE devices, the contents are signed according to a specific algorithm. The packet contents are sent together with the signature. The receiver uses the same signature algorithm and key to verify the integrity of the data (confirming the packet content is intact and unmodified) and the authenticity of the communication identity (confirming the packet indeed originated from a trusted peer).

**Regarding Mode 2 and BLE data signatures, my view is: if data packets are already encrypted using a shared key between both parties, there is no need for user identity signature confirmation, because only a trusted peer holding the same key can correctly decrypt them. Since the data packet can be successfully decrypted, it already proves that the peer is trusted. Therefore, for BLE communication, Mode 2, data signatures, and CSRK keys should be targeted at application scenarios where packet contents do not need encryption, but the identities of the communicating parties must be verified.**

The calculation logic for data signatures is shown in the figure below, relying primarily on the CSRK (Connection Signature Resolving Key) negotiated during the pairing process.

![1734933198600.png](/images/blog/蓝牙BLE通信的安全模式和安全级别总结-1.png)

- The calculation logic of data signatures is explained in detail in another of my notes:

Mode 2 contains two security levels.

### Mode 2 Level 1: No Identity Authentication + Data Signature

At this level, two BLE devices use an association model during the pairing process that requires no user intervention, most typically "Just Works." This method cannot provide effective strategies for hardware device authentication or protection against Man-in-the-Middle (MitM) attacks. Therefore, performing pairing operations using this method is best done within a secure environment.

Supporting this level requires the two devices to negotiate and share a CSRK during the pairing process, as subsequent connected communication mechanisms rely on this CSRK to sign and verify data packets.

The biggest issue with this level is that because Just Works cannot effectively verify the peer's hardware identity, any Central device can pair with the BLE peripheral, share the CSRK, and use it to sign and verify incoming and outgoing packets in subsequent communications. If the product application requires hardware identity authentication of the remote peer, Level 1 is unsuitable.

### Mode 2 Level 2: Identity Authentication + Data Signature

At this level, the two pairing BLE devices must use an association model that supports hardware identity authentication and MitM protection—specifically, one of the following three: OOB, Passkey Entry, or Numerical Comparison.

Naturally, pairing at this level also requires sharing a CSRK between the two devices. Through a robust identity authentication mechanism during pairing, it is confirmed that only trusted hardware can complete the pairing process and share the CSRK. Subsequent communication leverages the CSRK and data signature mechanisms to ensure that the connection is maintained between trusted hardware devices, thereby enhancing communication security.

## Security Mode 3

Mode 3 is specifically designed for encryption protection requirements of BLE peripheral broadcast data (advertising data). In other words, does advertising data need to be encrypted? Encrypting broadcast data is a new feature introduced in Bluetooth Core Specification v5.4, known as Encrypted Advertising Data (EAD). The implementation of encrypted broadcasting relies on a 16-byte Broadcast Code shared within an advertising group.

**In practical use, because the EAD feature was newly introduced in v5.4 and is generally only used in applications like LE Audio involving Isochronous Streams, the practical application scenarios for this security mode are very rare.**

To address different requirements, Mode 3 contains 3 security levels.

### Mode 3 Level 1: No Encryption

Under this security level, the BLE peripheral does not encrypt its advertising data. Broadcast data is published in plaintext, and all Central devices can scan and parse it normally. It offers the lowest security, but provides the most convenient user experience.

Unencrypted broadcasting was the default data broadcasting mode prior to Bluetooth Specification version 5.4.

### Mode 3 Level 2: Broadcast Encryption + Unauthenticated Broadcast Code

Advertising packets emitted by a BLE peripheral at this security level are encrypted using a Broadcast Code. Only Central devices holding the matching Broadcast Code can correctly parse these packets. Consequently, security is improved compared to Level 1. However, there is no identity authentication phase for devices joining the Broadcast Isochronous Groups (BIG); any device can join the BIG and obtain the Broadcast Code, leaving gaps in overall security.

### Mode 3 Level 3: Broadcast Encryption + Authenticated Broadcast Code

Building upon Level 2, this level introduces identity authentication for BLE devices joining the Broadcast Isochronous Groups (BIG). It requires verification credentials to obtain the Broadcast Code for decoding advertising packets; otherwise, an error is reported.

## References

- [Bluetooth LE: Security Modes and Procedures Explained - Technical Articles](https://www.allaboutcircuits.com/technical-articles/bluetooth-le-security-modes-and-procedures-explained/)
- [Securing BLE Connections—An Overview of the Security Protocol - Technical Articles](https://www.allaboutcircuits.com/technical-articles/securing-ble-connectionsan-overview-of-the-security-protocol/)