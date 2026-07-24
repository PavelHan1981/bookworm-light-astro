---
title: "A Summary of Sony's Digital Overlay (DOL) HDR Technology"
slug: "2022-04-26-sony-dol-hdr-basics"
description: "A summary of the working principles and workflow of Sony's DOL HDR technology, compiled from online reference materials and documentation."
date: 2022-04-26T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio & Video"]
tags: ["Image Sensor","Hardware"]
draft: false
---


## Comparison Between DOL HDR and Traditional Frame-Based HDR


Some Sony image sensors support DOL HDR technology in two-exposure (DOL-2) and three-exposure (DOL-3) modes.

- **DOL-2** is an operating mode where an HDR image is produced by capturing two exposures (long and short) on the sensor side, which are then synthesized into an HDR image on the ISP. Consequently, the sensor's output frame rate is twice that of the ISP's output frame rate.
- **DOL-3** is an operating mode where an HDR image requires three exposures (long, medium, and short) on the sensor side. The ISP receives three consecutive frames and synthesizes them into an HDR image. Consequently, the sensor's output frame rate is three times that of the ISP's output frame rate.

The exposure and readout process of Sony's DOL HDR mode is roughly illustrated below:


![DOL HDR Exposure and Output Mode](/images/blog/Sony的DOL（Digital-Overlay）-HDR技术总结-1.gif)


In 2-exposure DOL mode, each line of the image sensor is exposed and output using both long and short exposure times. Conceptually, this is similar to basic frame-based HDR. However, clear differences emerge when comparing both exposure workflows and readout mechanisms:

- **From the perspective of exposure:**
    - In traditional frame-based video HDR technology, exposure time is controlled at the full-frame level. Taking a 2-exposure HDR mode as an example, the sensor first performs a long exposure for the entire image. During the long exposure process, each line begins outputting to the ISP as soon as its exposure finishes. As Line 1 is outputting, Line 2 begins exposure and output, and so forth. Once this entire long-exposure frame is fully output, the sensor performs a complete short exposure for the entire frame and outputs it. For any given line, the time difference between its two exposures is essentially one frame time (e.g., 33 ms at 30 fps).

        ![Untitled.png](/images/blog/Sony的DOL（Digital-Overlay）-HDR技术总结-2.png)

    - In DOL mode HDR, exposure control is managed on a line-by-line basis rather than a frame-by-frame basis. For example, Line 1 first undergoes long exposure. Once complete, Line 1's long exposure data is output to a line buffer. Simultaneously, Line 1 begins its short exposure while Line 2 begins its long exposure—meaning the exposures of adjacent lines partially overlap, which is the origin of the term "Overlay." Once Line 1's short exposure and Line 2's long exposure complete, they enter the line buffer as well. The system then simultaneously proceeds with Line 2's short exposure and Line 3's long exposure, and so on. Meanwhile, the exposed lines in the line buffer are streamed out in the sequence of *Line 1 Long → Line 1 Short → Line 2 Long → Line 2 Short...*. Under this exposure scheme, the time difference between the two exposures for any single line is extremely small—roughly equivalent to the duration of a single long exposure.

        ![Untitled.png](/images/blog/Sony的DOL（Digital-Overlay）-HDR技术总结-3.png)

- **From the perspective of readout:**
    - In traditional frame-based video HDR, although each frame uses multiple exposure times (e.g., long and short), readout requires completing the full frame for one exposure setting before the sensor can expose and read out the next frame. This creates a significant readout time gap between corresponding lines of consecutive frames. For instance, at 60 fps output, the time difference between two consecutive exposure frames reaches 16.67 ms. When the downstream ISP attempts to merge these two consecutive frames, noticeable motion artifacts (such as ghosting) occur in dynamic scenes because pixel positions have shifted significantly over that 16.67 ms interval.
        - Readout sequence: *Line 1 Long → Line 2 Long → ... → Line 1080 Long → Line 1 Short → Line 2 Short → ... → Line 1080 Short*
    - In DOL HDR mode, each line is output to the ISP sequentially as soon as its long and short exposures are completed, without needing to wait for the entire long-exposure frame to be transmitted first. Consequently, the temporal discrepancy between corresponding exposures across lines becomes remarkably small.
        - Readout sequence: *Line 1 Long → Line 1 Short → Line 2 Long → Line 2 Short → ... → Line 1080 Long → Line 1080 Short*

Therefore, **from the ISP's perspective, using DOL HDR requires the ISP itself to support this mode and be configured for DOL HDR.** This ensures the ISP can correctly receive and parse line data from the sensor and merge the multi-exposure image data appropriately.


## Limitations of DOL HDR Mode


As described above, compared to frame-based HDR, DOL HDR significantly reduces the time lag between long and short exposures for each line. This mitigates various image artifacts—especially motion ghosting in dynamic scenes—caused by exposure delay during frame composition in the ISP.


However, because DOL HDR performs multiple exposures for each line, the effective total exposure duration for a given line becomes the sum of all individual exposure periods. As a result, the start-time delay between consecutive lines is considerably larger than in single-exposure mode. Under a CMOS sensor's rolling shutter mechanism, this exacerbates the "jello effect" (rolling shutter distortion). This trade-off is inherently tied to the underlying operational principle and cannot easily be optimized away. Nevertheless, the jello effect typically manifests only in low-light conditions with prolonged exposure times or when capturing high-speed moving objects. Therefore, applications using DOL HDR should ideally avoid these specific scenarios.


## References

- [HDR Imaging(2)--Digital Overlap - Ebaina Technical Community](https://www.ebaina.com/articles/140000013651)
- [HDR Imaging Tech Notes (2) - CSDN Blog](https://blog.csdn.net/nyist_yangguang/article/details/123094698)