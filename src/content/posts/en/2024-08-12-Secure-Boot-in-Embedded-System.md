---
title: "A Summary of the Secure Boot Flow in Embedded Products"
slug: "2024-08-12-Secure-Boot-in-Embedded-System"
description: "This document summarizes and studies the role of the Secure Boot mechanism used in embedded systems, the underlying workflow, hardware and software design principles, and the complete embedded Secure Boot process."
date: 2024-08-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Embedded Systems"]
tags: ["Cryptography","Embedded Systems"]
draft: false
---


The application of Secure Boot in embedded products is primarily to ensure that the firmware running on the embedded hardware must be trusted by the hardware manufacturer. Simply put, the software image running on the hardware must be an official image released by the manufacturer, preventing unauthorized third-party firmware from running on the device, thereby providing stronger security and privacy protection for the hardware product.


## Typical Boot Flow of Embedded System Firmware


The following is a typical boot flow for an embedded system:


![image.png](/images/blog/嵌入式产品SecureBoot的启动流程总结-1.png)

- After the embedded system's SoC powers on, it first boots and runs the Boot ROM Loader. The Boot ROM Loader is a small program hardcoded inside the chip. When powered on, this program executes first to select the boot mode based on the configuration of the SoC's POC (Power On Configuration) pins—determining where the next-stage boot image is stored, such as Nor Flash, SD card, UART, USB, etc. It then initializes the boot medium specified by the POC, reads a tiny first-stage bootloader (FSBL) image into the chip's internal SRAM, and hands over control to the FSBL.
    - When the ROM Loader runs, the DDR memory is not yet initialized, so it can only load the FSBL image into the chip's internal SRAM for execution. Because SRAM is typically very small, the FSBL image must be extremely compact with limited functionality. This is why the external bootloader is split into a first stage and a second stage.
- Once the FSBL is loaded into the chip's internal SRAM, it begins execution to perform more comprehensive system initialization, such as initializing DDR and NAND flash. Once everything is ready, it loads the Second-Stage Bootloader (SSBL) into DDR for execution. Since DDR offers much more space, the SSBL is a full-featured bootloader, such as U-Boot, which is commonly used in embedded systems.
- Apart from providing more comprehensive and powerful features during the bootloader phase, the main responsibility of the SSBL is to load the OS kernel and file system, and then launch the operating system.
- In the final step, the SSBL transfers control to the OS kernel, and the entire operating system (such as Linux) officially and fully boots up.

The above is a typical boot flow for an embedded system. In actual products, this process can be simplified or made more complex based on specific requirements.

- For example, some chips integrate DDR internally, allowing the ROM Loader to initialize DDR directly and load the full-featured bootloader straight into DDR to run. This bypasses the FSBL and accelerates the boot process.
- In other cases, some chips feature heterogeneous multi-core architectures with multiple processors of different specifications running different operating systems. This makes the boot process far more complex, as it requires coordinating and synchronizing the boot sequences across various processors.

## Implementing Secure Boot in the Embedded Boot Flow


**Based on the above understanding of the embedded boot flow, to ensure that all software running on the hardware is officially released by the manufacturer, every single image in the entire boot chain must be protected by cryptographic signatures.**

- The boot images to be protected along this chain include the FSBL, SSBL, as well as the subsequent OS kernel and file system images. It does not include the Boot ROM Loader, which is permanently hardcoded inside the chip.

This is because:

- To ensure that the OS kernel and file system are official images released by the hardware manufacturer, the SSBL must verify the loaded contents after loading the OS kernel and file system images into DDR. The system can only boot normally once this verification succeeds.
- The logic for verifying the OS kernel and file system must be executed during the SSBL's runtime. However, if an attacker replaces the SSBL image with their own malicious image to strip out this verification step, they could boot any custom OS kernel and file system. Therefore, we must also ensure that the SSBL image itself is officially released by the hardware manufacturer. This assurance relies on the FSBL performing the same verification when loading the SSBL image into DDR. Only an official SSBL released by the manufacturer can pass the FSBL's verification.
- By the same logic, the FSBL image itself must also be verified as an official manufacturer image. This verification is performed by the ROM Loader inside the chip.
- To make this entire process airtight, images at every stage of the boot chain must be verified. This is why the Secure Boot mechanism must form an unbroken chain of trust to achieve robust security.

This complete flow ultimately traces back to the ROM Loader phase. Since the ROM Loader is hardcoded inside the chip, the chip's internal hardware design must inherently support the Secure Boot mechanism in the first place.


Therefore, based on the above analysis, for an embedded SoC platform to achieve complete Secure Boot protection, the following two conditions are indispensable:

- The hardware SoC design itself must support Secure Boot at the ROM Loader phase, meaning the ROM Loader must have a signature verification mechanism and verification keys to validate the loaded image.
- The SoC platform's SDK must support generating signed Secure Boot images for each stage, as well as verify and validate the signature of the subsequent stage's image.

Therefore, whether Secure Boot can be supported first and foremost depends on the hardware design specifications of the system SoC and the design and implementation of the SDK. The following image shows the internal specifications of the Ingenic T23N, which explicitly states support for Secure Boot.


![1723439804940.png](/images/blog/嵌入式产品SecureBoot的启动流程总结-2.png)


**From a hardware perspective, the implementation of Secure Boot boils down to a verification algorithm and a key provisioned during the production testing phase.**

- For hardware manufacturing, the Secure Boot verification key must be written (fused) into the system SoC during the production testing phase.
- Meanwhile, the production or OTA images for each stage must have signatures generated using the corresponding private key embedded in them, enabling signature verification during subsequent boot processes.

## Embedded Secure Boot Process


If you understand the concepts of implementing Secure Boot in embedded systems described above, the actual Secure Boot flow in these systems becomes quite straightforward.


![1723441359194.png](/images/blog/嵌入式产品SecureBoot的启动流程总结-3.png)

- The first step is, of course, running the ROM Loader after power-on. The ROM Loader is responsible for loading the FSBL. However, after loading, the ROM Loader must use the key provisioned during production testing to verify the signature of the loaded FSBL. Only if verification succeeds can the FSBL run normally and load the SSBL image.
- Similarly, after the FSBL loads the SSBL image file, it also must use the previously provisioned verification key to verify the SSBL image's signature. Once verified, the SSBL starts execution and loads the OS kernel and file system.
- Following the same logic, the SSBL verifies the signature of the loaded OS kernel and file system images. The kernel can only boot and run once verification is successful.

Thus, Secure Boot protects the system through this chain of trust, ensuring that any image capable of booting on this embedded hardware must be an official version provided by the hardware manufacturer.


## References

- [Boot Stages in an Embedded System | by M. Waseem Abbas | Medium](https://mwaseemabbas.medium.com/boot-stages-in-an-embedded-system-a51d1b7e2b1b)
- [Secure boot in Embedded Systems. Secure boot is a critical feature in… | by M. Waseem Abbas | Medium](https://mwaseemabbas.medium.com/secure-boot-in-embedded-systems-9b72754f4c16)