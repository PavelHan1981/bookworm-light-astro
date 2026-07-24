---
title: "UCConfig Learning Notes: UCConfig Mode 0"
slug: "2022-05-31-ucconfig-mode-0-summary"
description: "Based on the UCConfig specification document and Teams certification requirements for H.264 encoders, this article summarizes the H.264 encoding structure and bitstream structure of UCConfig Mode 0."
date: 2022-05-31T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio and Video"]
tags: ["H.264","Audio and Video"]
draft: false
---


In Reference Document 1, UCConfig Mode 0 is defined as: "Non‐scalable single layer AVC bitstream with Simulcast (number of simulcast streams >= 1)." In other words, UCConfig Mode 0 does not require SVC scalability support, and standard AVC encoder bitstreams generally fall into this category. However, it should be noted that although Mode 0 does not require SVC scalability, it still has explicit requirements for the NAL Unit structure of the output bitstream, most notably the inclusion of SVC-specific Prefix NAL Units.


## Layering Structure


Since the encoding mode corresponding to UCConfig Mode 0 is AVC, the concept of layering does not exist. Therefore, the encoding structure contains only a single layer.


![Untitled.png](/images/blog/UCConfig学习笔记之UCConfig-Mode-0-1.png)

- In fact, this encoding structure is the most common one for H.264 encoders: the decoding of the first P-frame after an I-frame depends only on the preceding P-frame, while subsequent P-frame decoding depends on the I-frame and preceding P-frames. Therefore, if any P-frame in the entire GOP is lost, all subsequent P-frames in that GOP cannot be successfully decoded.

Mapping this to SigmaStar's webcam solutions (such as SSD268G, SSC9351, etc.), this corresponds to the so-called NormalP encoding mode, which is also the default encoding mode for these solutions:


![Untitled.png](/images/blog/UCConfig学习笔记之UCConfig-Mode-0-2.png)


## Bitstream Structure Requirements


In addition to the encoding structure mentioned above, UCConfig Mode 0 has clear requirements for the bitstream output by the encoder:

- Under UCConfig Mode 0, although SVC scalability is not required, the output bitstream must include a Prefix NAL Unit immediately preceding the NAL Unit of each compressed picture. The `priority_id` within this Prefix NAL Unit is used to indicate the relative priority of the bitstream, where 0 indicates the highest priority, 1 indicates the second highest priority, and so on.
    - This way, if a node sends multiple UCConfig Mode 0 streams simultaneously to a central server, the server can use this `priority_id` to determine the priority of each stream upon reception;
- In each Prefix NAL Unit, `dependency_id`, `quality_id`, and `temporal_id` must all be 0; `no_inter_layer_pred_flag`, `discardable_flag`, and `output_flag` must be 1; and `use_ref_base_pic_flag` must be 1.
- For decoders that do not support the SVC mode, if a Prefix NAL Unit is encountered in the received streaming data, the decoder will simply discard that NAL Unit. Therefore, non-SVC-aware decoders can still successfully decode bitstreams complying with the UCConfig Mode 0 specification.

## Reference Documents:

- H.264 AVC/SVC UCConfig Mode Specification V1.1