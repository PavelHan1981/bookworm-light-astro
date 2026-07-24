---
title: "Hisilicon 35XX Series HiMPP Framework Development Reference - VI Module"
slug: "2020-05-26-hisilicon-35xx-himpp-framework-vi"
description: "This article summarizes some basic knowledge of VI module development under the Hisilicon 35XX HiMPP framework, based on the study of relevant documentation for Hisilicon 35XX processors."
date: 2020-05-26T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio/Video"]
tags: ["Audio/Video","Hisilicon","ISP"]
draft: false
---

Main Reference Document: "HiMPP V3.0 Media Processing Software Development Reference".

Document Version: 21.

Document Release Date: 2019-09-30.

This document is based on the study of HiMPP development reference files provided by Hisilicon's official SDK, summarizing the development process and key concepts of the Video Input (VI) module on this platform.

## **Main Functions of the VI Module**

The VI module supports receiving YUV format video data from BT656/BT601/BT1120 and Digital Camera interfaces, storing it in a specified internal memory area.

In addition to simply receiving YUV video data, the VI module can perform the following additional functions:

-   Cropping of received raw video images;
-   Horizontal/vertical scaling down;
-   Horizontal/vertical inversion operations (Mirror, Flip);
-   Merging/splitting one or more input raw video images into one or more video images.

## **Interfaces / Devices / Channels**

Support for the VI module varies among different Hisilicon 35XX series chips; refer to the specific chip configuration.

In general, the VI interfaces and devices of HI35xx chips are organized and numbered in 8-bit units, where one 8-bit interface corresponds to one VI device.

Two 8-bit VI interfaces can be combined to form a 16-bit BT1120 interface. Therefore, if a chip has 'n' groups of 16-bit BT1120 interfaces, it will have 2*'n' 8-bit VI devices.

-   When two 8-bit interfaces are spliced together to be used as a 16-bit interface, only 1 VI device corresponding to these two 8-bit interfaces is available;

Furthermore, each VI interface and device is fixedly configured to include 4 VI channels. Data received by the VI interface through time-division multiplexing can be mapped to different channels for individual processing. Therefore, for subsequent processing by the VI module, data is read from these respective channels.

Interface/Device/Channel correspondence for Hi3520DV400 and HI3521DV100:

-   The Hi3520DV400 has two groups of 8-bit interfaces, VI0 and VI1, which correspond to two VI devices, dev0 and dev1, respectively;
    -   These two groups of 8-bit interfaces can be combined into a single 16-bit BT1120 interface. In this case, only dev0 is available;
    -   The channels corresponding to Dev0 are Chn0, Chn1, Chn2, Chn3;
    -   The channels corresponding to Dev1 are Chn4, Chn5, Chn6, Chn7;
-   The HI3521DV100 contains 4 groups of 8-bit interfaces: VI0, VI1, VI2, VI3, which correspond to dev0, dev1, dev2, dev3;
    -   VI0+VI1 and VI2+VI3 can each be combined to function as an independent 16-bit BT1120 interface. In this case, only dev0 and dev2 are available;
    -   The channels corresponding to Dev0 are Chn0, Chn1, Chn2, Chn3;
    -   The channels corresponding to Dev1 are Chn4, Chn5, Chn6, Chn7;
    -   The channels corresponding to Dev2 are Chn8, Chn9, Chn10, Chn11;
    -   The channels corresponding to Dev3 are Chn12, Chn13, Chn14, Chn15;

## **Interface and Device Reception Capabilities**

When VI interfaces and devices are configured for 8-bit mode, they can support:

-   1/2/4-channel D1, 960H composite mode input;
    -   That is, one 8-bit VI interface can support up to 4 channels of D1 and 960H video via time-division multiplexing;
    -   Therefore, if a chip's VI module has N 8-bit VI interfaces, it can support up to 4*N channels of D1 and 960H resolution image composite mode input;
-   2-channel 720P composite mode input;
    -   That is, one 8-bit VI interface can support up to 2 channels of 720P video via time-division multiplexing;
    -   Therefore, if a chip's VI module has N 8-bit VI interfaces, it can support up to 2*N channels of 720P resolution image composite mode input;
-   1-channel 1080P30 input;
    -   Each 1080P30 camera connects to one 8-bit interface (i.e., YC multiplexing mode), using a BT1120 148.5MHz clock; (single-channel interface not multiplexed, each 8-bit interface accepts only one 1080P30 video input)
    -   In this configuration, if a chip's VI module has N 8-bit VI interfaces, it can support N channels of 1080P30 resolution image input;
-   Supports 2-channel 1080P30 input via dual-edge sampling;
    -   Each 1080P30 camera connects to one 8-bit interface (i.e., YC multiplexing mode), using a BT1120 148.5MHz clock. Simultaneous sampling on both rising and falling edges can support the simultaneous input of two 1080P30 video streams;
    -   Therefore, if a chip's VI module has N 8-bit VI interfaces, it can support up to 2*N channels of 1080P resolution image composite mode input;
-   Also supports 1-channel 4M 30fps input;
    -   One 4M 30fps camera connects to one 8-bit interface, configured with BT1120 148.5MHz clock + dual-edge sampling mode;
    -   Therefore, if a chip's VI module has N 8-bit VI interfaces, it can support up to N channels of 4M 30fps resolution image input;

Two 8-bit interfaces combined to form a 16-bit interface:

-   Can support 1-channel 1080P30 input;
    -   One 1080P30 camera connects to a 16-bit interface, simultaneously transmitting YC data, using a BT1120 74.24MHz clock;
    -   In this configuration, if a chip's VI module has N 16-bit VI interfaces, it can support N channels of 1080P30 resolution image input;
-   **From the above summary, regardless of whether standard definition or high definition resolution video is connected, the simplest and most flexible approach is to configure the VI module's interfaces as 8-bit. Setting them to 16-bit offers little benefit.**

## **VI Module Mask Settings**

The VI module's masks are used to define the external interfaces used by each VI device.

Each VI device corresponds to two masks: Mask 0 and Mask 1.

Configuration when VI devices and interfaces are set to 8-bit mode:

-   Only Mask 0 needs to be set; Mask 1 should be set to 0;
-   For even-numbered device IDs like 0/2/4/6, Mask 0 should be set to 0x00FF0000;
-   For odd-numbered device IDs like 1/3/5/7, Mask 0 should be set to 0xFF000000;

Configuration when VI devices and interfaces are set to 16-bit mode:

-   Both Mask 0 and Mask 1 need to be set;
-   In this case, odd-numbered devices (e.g., 1/3/5/7) are unavailable; only even-numbered devices (e.g., 0/2/4/6) can be used;
-   For all even-numbered devices (e.g., 0/2/4/6), Mask 0 should be set to 0xFF000000, and Mask 1 should be set to 0x00FF0000;

## **Summary of Common APIs**

-   Set and get VI device attributes
    -   `HI_MPI_VI_SetDevAttr`;
    -   `HI_MPI_VI_GetDevAttr`;
-   Enable and disable VI devices;
    -   `HI_MPI_VI_EnableDev`;
    -   `HI_MPI_VI_DisableDev`;
-   Set and get VI channel attributes
    -   `HI_MPI_VI_SetChnAttr`;
    -   `HI_MPI_VI_GetChnAttr`;
-   Enable and disable VI channels
    -   `HI_MPI_VI_EnableChn`;
    -   `HI_MPI_VI_DisableChn`;
    -   After calling `HI_MPI_VI_EnableChn`, the VI module actually begins normally receiving image data from the interface;
-   Read image data received by the VI module:
    -   `HI_MPI_VI_GetFrame`;
    -   Generally, there's no need to directly call this interface to get frames, as subsequent modules connected to the VI module will automatically receive and process them, unless custom processing of the image data received by the VI module is required;
-   Release buffer occupied by VI image data
    -   `HI_MPI_VI_ReleaseFrame`;
-   Bind/Unbind VI channels/Get current channel binding relationship
    -   `HI_MPI_VI_BindChn`;
    -   `HI_MPI_VI_UnBindChn`;
    -   `HI_MPI_VI_GetChnBind`;
    -   If using the system's default device-to-channel binding, it is automatically set up during system startup. These interfaces only need to be called to unbind the previous default relationship and rebind if the default binding needs modification;

## **Basic Workflow of the VI Module:**

-   Set VI device attributes: `HI_MPI_VI_SetDevAttr`
-   Enable VI device: `HI_MPI_VI_EnableDev`
-   Set VI channel attributes: `HI_MPI_VI_SetChnAttr`
-   Enable VI channel: `HI_MPI_VI_EnableChn`
-   At this point, the VI image stream is operating normally, and downstream devices in the pipeline can read the image stream from the corresponding VI channels.