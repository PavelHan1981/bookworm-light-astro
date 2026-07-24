---
title: "UCConfig Study Notes: UCConfig Mode 1"
slug: "2022-05-27-ucconfig-mode-1-summary"
description: "Based on studying the UCConfig specification and the Teams certification specification for H.264 Encoders, this article summarizes the H.264 encoding structure and bitstream structure of UCConfig Mode 1."
date: 2022-05-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio and Video"]
tags: ["H.264","Audio and Video"]
draft: false
---


In Reference Document 1, UCConfig Mode 1 is defined as: SVC temporal scalability with hierarchical P with Simulcast (number of simulcast streams >= 1). In other words, the encoder is required to support the frame rate scalability mode of SVC. That is, a single stream output by the encoder can contain layered support for multiple different frame rates.


## Encoding Layer Structure


To support the multi-frame-rate layered architecture mentioned above, specific designs are required for the encoder's reference frame dependency structure, which is referred to as the Hierarchical P prediction structure in Document 1.


Depending on the number of layers, Mode 1 can be divided into two-layer, three-layer, and four-layer frame rate scalability structures.


![Two-layer frame rate structure](/images/blog/UCConfig学习笔记之UCConfig-Mode-1-1.png)

- Allows switching between two layers: the maximum frame rate and 1/2 of the maximum frame rate.
- With a maximum frame rate of 30 fps, if only Layer 0 (the Base Layer) is received, the resulting frame rate is 15 fps. If both Layer 0 (15 fps) and Layer 1 (15 fps) are received, the total received frame rate is 30 fps.

![Three-layer frame rate structure](/images/blog/UCConfig学习笔记之UCConfig-Mode-1-2.png)

- Allows switching among three layers: the maximum frame rate, 1/2 of the maximum frame rate, and 1/4 of the maximum frame rate.
- With a maximum frame rate of 30 fps, if only Layer 0 (the Base Layer) is received, the resulting frame rate is 7.5 fps. If both Layer 0 (7.5 fps) and Layer 1 (7.5 fps) are received, the total received frame rate is 15 fps. If Layer 0 (7.5 fps), Layer 1 (7.5 fps), and Layer 2 (15 fps) are all received, the total received frame rate is 30 fps.

![Four-layer frame rate structure](/images/blog/UCConfig学习笔记之UCConfig-Mode-1-3.png)

- Allows switching among four layers: the maximum frame rate, 1/2 of the maximum frame rate, 1/4 of the maximum frame rate, and 1/8 of the maximum frame rate.
- With a maximum frame rate of 60 fps, if only Layer 0 (the Base Layer) is received, the resulting frame rate is 7.5 fps. If both Layer 0 (7.5 fps) and Layer 1 (7.5 fps) are received, the total received frame rate is 15 fps. If Layer 0 (7.5 fps), Layer 1 (7.5 fps), and Layer 2 (15 fps) are received, the total received frame rate is 30 fps. If Layer 0 (7.5 fps), Layer 1 (7.5 fps), Layer 2 (15 fps), and Layer 3 (30 fps) are all received, the total received frame rate is 60 fps.

## Bitstream Structure Requirements


In addition to the encoding structure above, UCConfig Mode 1 also has clear requirements for the bitstream output by the encoder:

- Every NAL Unit containing coded slice data of IDR (NAL Unit Type=1) and non-IDR (NAL Unit Type=5) frames must be preceded by a Prefix NAL Unit (NAL Unit Type=14). In this Prefix NAL Unit, the priority_id element is used to mark the priority of the following coded picture layer: 0 represents the Base Layer, 1 represents the first enhancement layer, 2 represents the second enhancement layer, and so on.
    - Furthermore, NAL Units of Type 2, 3, and 20 must not appear in this type of coded bitstream.
- At the same time, inside this Prefix NAL Unit, Temporal_id is used to specify the frame rate scalability structure: 0 represents the Base Layer data, 1 represents the first frame rate enhancement layer data, and 2 represents the second frame rate enhancement layer data.
    - Document 2 defines that for the Prefix NAL Units included in the UCConfig Mode 1 bitstream, the values of the Temporal_id and priority_id elements must be identical. However, Document 1 does not enforce this requirement. Objectively speaking, for a UCConfig Mode 1 bitstream, since it should only contain temporal (frame rate) scalability layers and should not include other layers like spatial resolution or quality (SNR) scalability, this requirement seems reasonable.
- The dependency_id and quality_id in all Prefix NAL Units must be set to 0. no_inter_layer_pred_flag, discardable_flag, and output_flag must be set to 1. use_ref_base_pic_flag must be set to 0.
- This Prefix NAL Unit is a NAL Unit type unique to SVC extensions. Therefore, if a receiver that does not support SVC receives an SVC bitstream, it will discard this Prefix NAL Unit directly but can still successfully decode and play the SVC bitstream.

## References

- Unified Communication Specification for H.264 AVC and SVC UCConfig Modes V 1.1;
- Microsoft Skype for Business H.264 Video Encoder Specification;