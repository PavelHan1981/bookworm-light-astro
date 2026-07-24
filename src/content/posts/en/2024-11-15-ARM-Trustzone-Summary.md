---
title: "An Introduction to TEE and ARM TrustZone Security Technology"
slug: "2024-11-15-ARM-Trustzone-Summary"
description: "This article provides a detailed summary of the concepts behind TEE and ARM TrustZone technologies and their development history. It explains the execution flow and system architecture of TrustZone technology from two perspectives: ARM SoC hardware design and code execution flow on the CPU."
date: 2024-11-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Network Security"]
tags: ["Network Security"]
draft: false
---

To thoroughly understand ARM's TrustZone technology, one must first understand what a TEE is. Simply put, ARM's TrustZone technology is essentially a targeted solution addressing the requirements of a TEE.

## The Concept and Origin of TEE

TEE stands for Trusted Execution Environment. The concept of TEE was primarily proposed to address the severe risks of leakage and abuse associated with users' sensitive data and critical information in today's increasingly ubiquitous smart devices. These risks can pose serious threats to users' privacy, property, and even personal safety. Therefore, ensuring data security within smart devices and their operating systems through systematic mechanisms has become an urgent priority in the field of information security.

- More fundamentally, in response to increasingly complex system execution environments, a TEE divides the execution environment of user applications into a trusted environment and an untrusted environment. Parts that are highly relevant to user privacy and security are placed in the trusted environment, where higher levels of restriction and control are enforced; meanwhile, applications with lower security requirements continue to run normally in the untrusted environment, thereby enhancing the overall security strength of the system.

So the question arises: Before the concept of TEE or ARM's TrustZone technology, how did the industry solve information security or trusted execution environment issues? In other words, how were sensitive data information and their processing logic preserved?

- **Encrypted storage locally.** In the development of traditional embedded hardware products, some sensitive information inevitably needs to be properly stored and processed to ensure the secure execution of related business. A typical example is communication: how to encrypt communication data becomes an essential element in secure product implementation, as communication data, once intercepted, can cause substantial losses and threats to users. How keys, certificate files, private keys, and other information required during the encryption process should be stored in the product is one of the key considerations in security design. Almost all security design guidelines state that sensitive data is strictly prohibited from being stored in plaintext within the product's firmware code and file system. Therefore, a relatively acceptable solution is to additionally encrypt this sensitive information (keys, private key files, initialization vectors, licenses, etc.) and save it in ciphertext—this is known as white-box cryptography. The problem, however, is that encrypting this sensitive information also requires keys, so how should these keys used to encrypt sensitive information be managed? Consequently, this approach merely increases the difficulty of cracking without fundamentally solving the problem, making it suitable only for application scenarios with low security requirements. In fact, there are currently no universally accepted, publicly secure white-box cryptographic algorithms in the industry.
- **Independent crypto-chip/TPM.** Since sensitive information and its processing logic cannot be stored in the product's firmware and file system, embedding an independent, uncrackable cryptographic subsystem into the product became an effective solution to the above problems—this is the idea behind independent crypto-chips. Roughly speaking, all sensitive information is written into the crypto-chip during manufacturing, and this information cannot be read out. Even the encryption logic itself is completed inside the crypto-chip; the application processor only needs to invoke interfaces provided by the crypto-chip vendor to encrypt and decrypt information. Smart cards, U-keys used by banks, and TPMs on various industrial control boards can all be considered practical applications of independent crypto-chip solutions. Microchip's ATECC608, which I organized in another set of notes, is a widely used independent crypto-chip solution in the industry. This chip interfaces with the application processor via an I2C interface, providing reliable encrypted information storage and hardware acceleration for encryption and decryption algorithms.

![1732505941002.png](/images/blog/一文入门TEE与ARM-TrustZone安全技术-1.png)

- **Integration of the crypto-chip and application processor.** Independent crypto-chips/TPMs can indeed solve the problems of crypto-chip storage and running encryption logic on independent hardware. However, independent crypto-chips and TPMs need to communicate with the application processor based on certain hardware interfaces (such as I2C, SPI, etc.), and this hardware communication channel is often vulnerable to hardware attacks, posing certain security risks. Therefore, people began trying to directly integrate the functions of independent crypto-chips and TPMs into the main processor. This is equivalent to packaging the application processor and crypto-chip directly inside the main processor, communicating directly via the internal CPU bus and other methods without exposing communication lines externally. Typical applications of this approach include Apple's Secure Enclave and Microsoft's Pluton. However, the current problem is that such designs of integrating crypto-chips inside application processors do not follow a unified standard or specification, making it difficult or even impossible for user applications to utilize the functions they provide.

In fact, security solutions that directly integrate crypto-chips and application processors into the same chip are already quite similar to a TEE. Building upon the latter, a TEE further divides user code areas into a trusted execution environment and an untrusted execution environment by extending the CPU instruction set. Applications and encrypted data logic run under different operating states of the same CPU, and transitions between them are distinguished by CPU instructions and states. This allows sharing most functions of the CPU architecture while providing an independent secure execution environment for security-sensitive data and its processing logic, ensuring both high efficiency and security.

At the logical level, a TEE divides application code running on the CPU into secure applications and non-secure applications, running in the secure environment and non-secure environment respectively. Both environments and systems run on the same CPU, controlled via special switching instructions. The secure environment and system can access hardware peripherals protected by security-privileged permissions as well as peripherals in non-secure mode; it is dedicated to storing and processing information and application logic sensitive to user privacy and security. Conversely, the non-secure system and applications can only access peripherals in non-secure mode. When access to sensitive user information is required, they access applications under the secure environment system via standardized, predefined interfaces to obtain the return values of their execution. Non-secure system applications cannot directly access sensitive information and its computing logic.

Because a TEE is implemented by extending CPU instructions and its architecture, it is generally developed and maintained independently by different CPU architecture vendors, who also take the lead in standardizing it at the application layer. Currently, well-known TEE solutions in the industry are primarily Intel's SGX (Software Guard Extensions) and ARM's TrustZone, corresponding to the X86 platform and ARM platform respectively.

## Software Workflow and Implementation of ARM TrustZone

ARM's TrustZone is ARM's proposed solution for the TEE trusted execution environment.

ARM introduced TrustZone technology starting from the ARMv6 architecture, and continuously enhanced, perfected, and matured it through the ARMv7 and ARMv8 generations of architectures. Fundamentally, TrustZone technology can achieve hardware-level protection and isolation of hardware resources from the chip level according to the TEE concept, and it is now widely used in mobile phones, smart TVs, IoT, and embedded fields using the ARM platform.

In terms of specific ARM CPU code execution flows, ARM TrustZone technology divides the CPU's working state into Normal World state (or Non-Secure world) and Secure World state. Meanwhile, in ARM SoC design, various hardware peripherals included within the SoC are also divided into non-secure hardware peripherals and secure hardware peripherals, providing hardware-level protection and security isolation for the peripheral hardware resources of the SoC chip.

**In the CPU code execution flow, when the CPU is in the Normal World state, no application can access secure hardware peripherals belonging to the Secure World state. All secure hardware peripherals can only be accessed by the trusted operating system and its trusted applications running under the Secure World state.**

At the level of system software design and implementation, two operating systems actually run in a time-shared manner on the ARM processor simultaneously. Our general application operating systems (such as Linux, Android, Windows) and their applications run in the Normal World state. The development resources and functions available in the Normal World state are richer compared to the Secure World state, so the software environment running in the Normal World state is usually called the Rich Execution Environment (REE), which contrasts with the TEE. Applications running on the REE OS (i.e., Linux, Android, Windows, etc.) are Client/Untrusted Applications (CA) in the Normal World state. Meanwhile, the secure operating system TEE OS in the Secure World state runs in the Secure World state; applications running on the TEE OS are Trusted Applications (TA), and drivers targeting secure system hardware under the TEE OS are Secure Drivers (SD).

![image.png](/images/blog/一文入门TEE与ARM-TrustZone安全技术-2.png)

After distinguishing the CPU states and the attributes of the operating systems running in different states in this way, even if the operating system and applications running in the Normal World state are hacked by attackers, they still cannot access any resources in the Secure World state.

In specific ARM CPU execution logic, the security extension components built into the ARM SoC at the chip level check the security status flag bit (Non-Secure Bit, or NS bit) of access requests issued by the CPU to determine whether the current request sent by the CPU to the bus is a secure request or a non-secure request.

- When in the non-secure state, the NS bit of access instructions issued by the CPU to the bus is fixed to 1, indicating that the request is a non-secure request.
- When in the secure state, the NS bit of access instructions issued by the CPU to the bus is fixed to 0, indicating that the request is a secure request.

Therefore, when a non-secure request attempts to access secure resources (which should only be accessed by secure access requests), the security extension components in the SoC will consider this request an illegal access, thus prohibiting access to this secure resource and returning a failure or invalid result. The ARM CPU itself implements hardware-level security isolation and protection of system resources through this execution flow.

### Communication between Client APP and Trusted APP

How do the REE OS and TEE OS operating systems and their upper-layer applications communicate with each other? In other words, how do applications on the REE OS side invoke the secure services/functions provided by the TEE OS?

When an application under the REE OS needs to invoke a secure function (such as using sensitive user data for identity authentication), a Command ID corresponding to that secure function is generally predefined on both the REE and TEE sides first, followed by the specific implementation of that secure function on the TEE side. When the REE-side APP invokes the function, it obtains the verification result from the TEE side via this predefined request ID. The complete verification process and the sensitive user information required in the verification run entirely within the Trusted APP in the TEE OS, and the REE side can never see any data on the TEE side. Therefore, from the perspective of the REE side, the execution process of the TEE-side APP is a black box that only accepts limited, legally predefined applications agreed upon by both parties. As for the execution logic of these legal applications and what sensitive data information is used during execution, the REE side remains completely unaware.

Various TEE solutions also provide corresponding support libraries for communication between CA and TA to facilitate rapid development between the two. For example, the `libteec` library in the OP-TEE solution is a support library it provides for Linux-side user space applications to access REE functions.

### Development of Trusted Apps

Currently, various TEE solutions at home and abroad generally follow the GP (Global Platform) specifications to develop and implement the APIs defined by them. The GP specification defines the architecture that TEE solutions should follow and the API prototypes that can be used for Trusted application development. Different TEE solutions should support these standardized APIs, enabling developers to use them to develop actual Trusted applications and run them across different TEE solutions. This is somewhat similar to the Linux Posix API: no matter what personalized development a Linux distribution has done, it must support the same Posix API interfaces. Only under such circumstances can the same application-layer program run on different Linux distributions.

## Hardware Implementation of ARM TrustZone

A complete ARM System-on-Chip (SoC) consists of an ARM core, system bus, on-chip RAM, on-chip ROM, and other peripherals connected to the ARM core via the bus. To support TrustZone at the CPU architecture level, ARM adds extra security extension components on top of CPU extended instructions and the aforementioned system design, providing hardware-level protection and isolation for the system.

The figure below shows a block diagram of a TrustZone-supported SoC based on the ARMv8 architecture. The red parts represent areas accessible by the non-secure environment, while the green parts are areas accessible only by the operating system and applications in the secure environment.

![1732518163248.png](/images/blog/一文入门TEE与ARM-TrustZone安全技术-3.png)

## TrustZone-Based TEE OS Solutions

As mentioned above, TrustZone is actually a security solution proposed by ARM for TEEs. It isolates secure applications and non-secure applications in hardware system design by extending instructions and dividing hardware resources into secure environment and non-secure environment parts in architecture design.

Therefore, TrustZone is merely the hardware foundation provided by ARM in CPU and SoC hardware design to support TEEs. To implement a complete TEE solution, support from comprehensive software solutions is also required.

Based on the framework technology provided by ARM TrustZone, several targeted TEE OS solutions already exist. Examples include Qualcomm's QSEE, MediaTek's Trustonic, Huawei HiSilicon's own fully implemented TEE OS solution, as well as professional independent TEE OS solutions from providers like BeeTEE (Pingbo),豆荚科技 (DogTag/Doujia), and the open-source OP-TEE OS solution. These TEE OS implementations are standardized according to Global Platform specifications, so despite differences in their internal operating system logic, their API interfaces remain uniform for tier-2 vendors and Trust APP developers.

## References

- *Mobile Security and Trusted Application Development Guide: Detailed Explanation of Trustzone and OP-TEE Technology*
- [TEE/Trustzone Learning_Differences between Trustzone and TEE - CSDN Blog](https://blog.csdn.net/Refrain_mh/article/details/128283967)