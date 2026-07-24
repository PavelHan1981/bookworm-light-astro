---
title: "Summary of Zoom Lens Classification and Zoom Principles"
slug: "2020-07-31-AF-lens-basics"
description: "This article briefly summarizes the differences between digital zoom and optical zoom, and their specific technical implementation principles."
date: 2020-07-31T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio/Video"]
tags: ["Audio/Video","Auto Focus"]
draft: false
---

## **Zoom Classification and Principles of Zoom Implementation**

The zoom capability we commonly refer to can generally be divided into two types: optical zoom and digital zoom. While both help to magnify distant objects during telephoto shooting, only optical zoom can make the subject not only larger but also relatively clearer after imaging. Digital zoom can only crop the original image size, making the image appear larger on the LCD screen, but it does not help to make details clearer.

- Optical Zoom:
    - Relies on the structure of optical lenses to achieve zoom capability, i.e., by moving lenses within the lens to magnify and reduce the scene captured by the camera;
    - Optical zoom is produced by changes in the relative positions of the lens, the object, and the focal point (primarily the position between the focal point and the lens). When the imaging plane moves horizontally, the field of view and focal length change, making distant scenes clearer and giving the impression of an object advancing.
    - Pros and Cons:
        - Because it utilizes the movement of optical glass lenses within the lens to change the focal length, achieving image magnification and reduction without any electronic or software amplification processing, the image can always maintain the highest resolution during magnification, and sharpness will not be lost due to image enlargement;
        - Requires specialized zoom lenses, which have much higher manufacturing costs and prices than prime lenses. Furthermore, achieving auto-zoom requires implementing auto-zoom algorithms within the camera's DSP, which presents a significant challenge;
        - Additionally, when using optical zoom lenses for telephoto shooting, images can easily become blurry due to body or hand shake, hence they generally need to be used mounted on a tripod;
- Digital Zoom
    - When using digital zoom, the camera's DSP will only crop out the central area of the image sensor and then magnify this region's image using mathematical interpolation to the original resolution of the image sensor. This processing makes it appear as if the lens is magnifying the image, but in reality, this magnification effect is entirely based on software interpolation and is completely unrelated to optical components. The smaller the area of the image captured by the DSP from the central region of the image sensor, the greater the apparent zoom effect. However, such magnification will undoubtedly significantly reduce the quality of the magnified image.
    - Pros and Cons:
        - Simple to implement and low cost, as it involves direct software algorithm computations within the camera's DSP, without requiring additional hardware. It can also be used in cameras that only have prime lenses;
        - Significant loss of image quality, with sharpness deteriorating, especially when using high-magnification digital zoom;

Below is a clarity comparison after 10X magnification of the original scene using both optical zoom and digital zoom:

![Untitled.jpeg](/images/blog/变焦镜头的分类及变焦原理总结-1.jpeg)

Generally, when advertising zoom capabilities for cameras or mobile phones, the total zoom number is calculated as: Total Zoom Capability = Optical Zoom Magnification * Digital Zoom Magnification.

- For example, the Sony F717 digital camera has an optical zoom magnification of 5x and a digital zoom magnification of 2x, resulting in a total camera zoom magnification of 10x.

## **How Optical Zoom Lenses Work**

Zoom lenses come in many different designs, but they all share some common fundamental principles:

- They are all composed of many individual lens elements of different shapes, some of which move relative to each other to change the magnification of the image without altering the focus (meaning the distance between the focusing lens closest to the image sensor and the image sensor itself remains constant).

The diagram below shows a very simplified design of a typical zoom lens:

- Consists of two distinct lens systems: the zoom system and the focusing element.
    - The key component of the zoom system is a concave lens, which can diverge the light path and move relative to the convex lens behind it, thereby converging the light again.
    - **The function of the zoom system is solely to control the width or dispersion of light entering the front part of the lens, thereby changing the magnification.**
    - The zoom system does not focus light; this task is performed by the rear elements of the lens system, i.e., the focusing lens section, which focuses light onto the image sensor, thereby ensuring a clear image.

The two figures below illustrate the light paths for the same optical zoom lens set to wide-angle and telephoto configurations, respectively, noting the position of the concave lens.

- Wide-Angle: When light enters from the front lens, due to the greater distance between the front lens and the concave lens, the entire light path converges during transmission. Consequently, the overall magnification of the image exposed on the image sensor is smaller, and the FOV is larger;
- Telephoto: When light enters from the front lens, due to the shorter distance between the front lens and the concave lens, after scattering by the concave lens, only the central part of the image is projected onto the target surface of the image sensor. Consequently, the overall magnification of the image exposed on the image sensor is larger, and the FOV is smaller;

![Untitled.gif](/images/blog/变焦镜头的分类及变焦原理总结-2.gif)

![Untitled.gif](/images/blog/变焦镜头的分类及变焦原理总结-3.gif)

## **References**

- [How It Works - Zoom Lenses](http://www.winvow.com/Technology/Technology50_en.html)