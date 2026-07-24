---
title: "Working Principles and Applications of Short-Wave Infrared (SWIR) Sensors"
slug: "2025-09-15-the-application-note-of-SWIR-sensor"
description: "This article briefly summarizes the technical concepts of SWIR sensors and imaging systems based on short-wave infrared band imaging, as well as their common applications in industry and daily life, laying a foundation for understanding and applying this technology in practical products."
date: 2025-09-15T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Audio & Video"]
tags: ["Audio & Video","Hardware","Image Sensor"]
draft: false
---

This article briefly summarizes the technical concepts of SWIR sensors and imaging systems based on short-wave infrared band imaging, as well as their common applications in industry and daily life, laying a foundation for understanding and applying this technology in practical products.

## Introduction to SWIR Technology

SWIR stands for Short Wave InfraRed Light. The wavelength range is typically between 0.9–1.7 µm (some definitions also cite 0.9–2.5 µm).

The figure below shows the position of infrared light in the electromagnetic spectrum. In general, the infrared band can be divided into SWIR (Short-Wave Infrared), MWIR (Mid-Wave Infrared), and LWIR (Long-Wave Infrared). The approximate wavelength ranges corresponding to each part are shown in the diagram below.

![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-1.png)

From the perspective of exposure and imaging principles, SWIR sensors are similar to the common visible-spectrum image sensors we encounter daily. Both rely on the reflection characteristics of the target material: photons contained in the external illumination are either reflected or absorbed by the object, thereby producing the contrast and shadows required for high-resolution images.

- This differs significantly from the imaging principles of the MWIR and LWIR bands, which rely on the blackbody radiation emitted by the object itself, with the radiation volume being temperature-dependent. _Therefore, visible light and SWIR imaging depend on external illumination sources; light shines onto the object, gets reflected, and then enters the lens to form an image. Consequently, their imaging is not all-weather, and supplementary lighting is generally required at night. In contrast, MWIR and LWIR imaging rely on the object's own blackbody radiation, thus supporting 24/7 all-weather imaging._

**Therefore, images produced by SWIR cameras are comparable to visible light in terms of sensitivity and detail, featuring distinct shadows and high contrast. Of course, SWIR imaging is monochromatic.**

## Manufacturing Processes and Limitations of SWIR Sensors

Common visible-light image sensors are produced based on standard silicon technology. Because the absorption coefficient of silicon drops rapidly near the 1100 nm wavelength, the practical effective detection upper limit of silicon-based optical sensors is generally around 1000 nm. In other words, silicon has extremely weak absorption capacity for photons beyond 1000 nm, resulting in a signal response close to zero in that wavelength band. Therefore, silicon technology is not suitable for SWIR imaging.

SWIR imaging sensors typically adopt InGaAs (Indium Gallium Arsenide) technology, which has an upper photon detection wavelength limit of approximately 1700 nm. Consequently, InGaAs sensors can efficiently absorb and convert photons in the 900–1700 nm range, making them the mainstream choice in the field of SWIR imaging.

The challenges associated with InGaAs sensors include:

- InGaAs cannot be grown directly on silicon wafers; the materials are expensive, the manufacturing process is complex, and yields are low, resulting in high production costs and high prices for the sensors.
- Reducing the pixel size of InGaAs sensors negatively impacts image quality, making it difficult to achieve the high integration and large arrays typical of CMOS sensors.

## Typical Applications of SWIR Sensors

### Night Vision Imaging

Nighttime image monitoring has always been a challenge for ordinary visible-light cameras. The main reason is not that there is no light at night, but rather that the light energy in the visible spectrum is too weak, and too few photons enter the visible-light image sensor. This necessitates the use of external illumination, increased gain (which degrades image quality), and larger pixel sizes or lens apertures (which are too costly) to mitigate the issue. However, in the 900–1700 nm short-wave infrared band, sources such as nightglow, starlight, and 1.5 µm laser reflections remain abundant. SWIR sensors (InGaAs) can convert these invisible-to-the-human-eye lights into high-resolution images.

Therefore, in the field of night vision imaging, SWIR offers image brightness 5 to 7 times higher than that of visible light; compared to thermal imagers operating in the LWIR band, its image resolution is significantly higher.

The left image below is captured by a visible-light camera, and the right image is captured by a SWIR camera under the same environment:

![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-2.png)

### Fruit Moisture and Agricultural Produce Sorting

Water exhibits relatively strong absorption characteristics for light in the 900–1700 nm band, peaking at 1.45 µm, followed by 1.95 µm. Typical agricultural produce and fruits consist of about 70% water. The higher the water content, the lower the object's reflectivity to SWIR-band light, causing it to appear darker in SWIR images. Any physiological changes in produce and fruits (such as ripening, bruising, rotting, or sugar accumulation) alter their internal moisture distribution or sugar concentration, thereby revealing invisible light-and-dark contrasts in SWIR images.

![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-3.png)

### Imaging Through Haze and Fog

In foggy or hazy weather conditions, particulate diameters generally range between 0.1 µm and 1 µm. Haze particles in this range cause maximum reflection of visible light, whereas their scattering effect on the SWIR band is much smaller. Consequently, a greater amount of SWIR-band light can penetrate haze particles, drastically reducing the white fog layer in images captured by SWIR cameras. Therefore, in dense fog, haze, and other adverse weather conditions, SWIR imaging systems provide much clearer images than visible-light cameras in monitoring applications such as border security, airports, and coastlines.

![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-4.png)

### High-Temperature Detection

When an object's temperature exceeds 140 degrees Celsius, it increasingly emits infrared radiation outward, which can be detected via SWIR technology. The hotter the object, the more infrared radiation it emits, and the brighter it appears in the image. This means SWIR technology can provide a competitive advantage for temperature detection in industrial monitoring and other applications, as it enables non-contact temperature monitoring of materials and products. This is particularly useful in environments where traditional temperature measurement methods are impractical or dangerous.

For example, the image below shows a comparison of a soldering iron at 400 degrees Celsius captured by an ordinary visible-light camera (left) and a SWIR camera (right).

![image.png](/images/blog/短红外（SWIR）传感器的工作原理与应用总结-5.png)

## References

- [What is SWIR? | Edmund Optics](https://www.edmundoptics.com/knowledge-center/application-notes/imaging/what-is-swir/?srsltid=AfmBOor_oQHQ_oCLRToKSw-obkGtrHM9dq07XGViLlzLBH8Af4OZm4L9)
- [What is SWIR? | SWIR Vision Systems](https://www.swirvisionsystems.com/about/what-is-swir/)
- [Understanding SWIR: Applications and Benefits - Oxford Instruments](https://andor.oxinst.com/learning/view/article/understanding-swir)
- [Clear Align Knowledge Center - Optical Engineering Insights & Resources || Why SWIR is Ideal for Border Surveillance & Maritime Imaging](https://clearalign.com/knowledge-center/id/5/why-swir-is-ideal-for-border-surveillance-maritime-imaging)