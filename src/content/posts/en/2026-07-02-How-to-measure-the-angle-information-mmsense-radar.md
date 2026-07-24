---
title: "How Do Millimeter-Wave Radars Measure and Calculate Angle Information?"
slug: "2026-07-02-How-to-measure-the-angle-information-mmsense-radar"
description: "A detailed breakdown of angle measurement principles, 3D vs. 4D radars, angular resolution, and MIMO virtual antenna arrays in millimeter-wave radar."
date: 2026-07-02T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["Hardware","Radar"]
draft: false
---

In the article [Detailed Summary of FMCW Working Principles and Calculation Processes in Millimeter-Wave Radars](https://app.notion.com/p/38fa5f648c7f80c3affcf478b742eef5), the theoretical derivations and calculation formulas for target range and velocity detection in millimeter-wave radars were thoroughly summarized. This article provides a detailed compilation of the angle concepts in the point cloud data output by millimeter-wave radars, along with the calculation workflow for angle data.

## Definition of Angles

In the point cloud data output by millimeter-wave radars, the included angle information essentially refers to the Angle of Arrival (AoA) of the electromagnetic waves reflected back from the target.

In 3D spatial product applications, this angle information typically encompasses two dimensions:

1. **Azimuth (Horizontal Angle):** The deflection angle of the target in the radar's horizontal plane, moving left and right. For example, the radar detects a vehicle ahead at 15° to the left of straight ahead.
2. **Elevation (Vertical Angle):** The deflection angle of the target in the radar's vertical plane, moving up and down. For example, the radar detects an overpass or road sign ahead at 10° above straight ahead.

With these three spherical coordinate values—Range $R$ + Azimuth $\phi$ + Elevation $\theta$—combined with the radar's own position, we can convert them into Cartesian coordinates $(x, y, z)$. This is why the point cloud data output by the radar can present the target contour in space.

![image.png](/images/blog/毫米波雷达是如何测量和计算角度信息的？-1.png)

## Radar Angle Measurement Principles

A single radar antenna measures range through the frequency difference of Frequency Modulated Continuous Wave (FMCW) signals and measures velocity through the Doppler shift (phase difference). A single antenna is incapable of measuring angles.

To acquire angle information, the radar must rely on a multi-antenna array (MIMO technology, i.e., multiple transmitters TX and multiple receivers RX). Its core angle measurement principle is phase-difference-based angle measurement.

When the radar transmitting antenna emits radar waves that hit a target and reflect back, the echoes reflected by the target consist of a series of **roughly parallel** electromagnetic waves (plane waves) striking the radar's multiple receiving antennas.

Assume the target object is located at an angle $\theta$ deviation directly ahead of the radar. Because there is a fixed physical spacing $d$ between the receiving antennas on the radar board (typically designed as half a wavelength $\frac{\lambda}{2}$), there is a slight sequential time difference for the echo to reach adjacent antennas: after reaching the first receiving antenna (RX1), it must travel an additional distance to reach the second receiving antenna (RX2).

Assume the physical distance between the two receiving antennas is $L$. According to right-triangle trigonometry, this extra distance traveled (path difference) is $\Delta d = L \cdot \sin(\theta)$.

![image.png](/images/blog/毫米波雷达是如何测量和计算角度信息的？-2.png)

Because electromagnetic waves are sinusoidal, traveling this extra distance $\Delta d$ manifests as a phase shift in the received signal waveform (i.e., for the two antennas, the received waveforms always maintain a fixed phase difference). A wavelength $\lambda$ corresponds to a complete cycle ($2\pi$ phase). Thus, the phase difference $\Delta \phi$ corresponding to the extra travel distance $\Delta d$ is:

$$
\Delta \phi = \frac{2\pi}{\lambda} \cdot \Delta x = \frac{2\pi \cdot L \cdot \sin(\theta)}{\lambda}
$$

Next, we solve for the angle $\theta$ from the above equation. Because the radar hardware chip can precisely measure the phase difference $\Delta \phi$ of the signals received by RX1 and RX2 (by simply applying an FFT to the samples of the waveforms received by RX1 and RX2—similar to range calculation—obtaining the phase from the FFT results, and then calculating the phase difference between the two signals), and because the physical spacing $L$ between the two receiving antennas as well as the wavelength $\lambda$ of the emitted electromagnetic wave are predefined and fixed, the target angle $\theta$ can be easily derived using the formula above:

$$
\theta = \arcsin\left(\frac{\Delta \phi \cdot \lambda}{2\pi \cdot L}\right)
$$

This is the ultimate essence of radar angle measurement: by comparing the phase differences of signals received by different antennas, trigonometric functions are used to reverse-engineer the target's angle.

## 3D Radar vs. 4D Radar

The radar angle measurement principle summarized above is quite simple, but note: if the two receiving antennas of the radar are arranged in a straight line horizontally, it can only measure the azimuth angle (i.e., the angle in the horizontal plane). This is what we call a 3D radar.

The reason is simple: if all receiving antennas are aligned on the same horizontal line, these antennas only have horizontal spacing. In this scenario:

- When the target moves left and right (azimuth), the path lengths of the electromagnetic waves reaching each antenna differ, generating a phase difference. The radar can use this to calculate the azimuth angle following the process above.
- However, when the target moves up and down (elevation), because the echo waves arrive in parallel from above or below, the distance traveled to reach each horizontally aligned antenna is identical. Consequently, the vertical phase difference generated between the antennas is 0. The radar cannot distinguish whether the target is in the sky or on the ground—which is why traditional 3D radars in automotive electronic applications confuse overpasses with road surface obstacles.

In contrast, 4D radar introduces vertical detection capabilities on top of 3D radar. In specific system design practices, clever 2D planar arrays or MIMO (Multiple-Input Multiple-Output) virtual antenna technologies are typically employed. Specifically, in the layout design of the radar antennas, transmitting antennas (TX) and receiving antennas (RX) are staggered, and transmitting antennas are intentionally designed with a certain height difference. When multiple transmitters and receivers operate simultaneously, the algorithmic layer combines them to produce multiplied virtual antenna points, which form a two-dimensional planar array in both horizontal and vertical directions.

![image.png](/images/blog/毫米波雷达是如何测量和计算角度信息的？-3.png)

The horizontally extending virtual antenna array uses the horizontal distance difference of the antennas to measure the horizontal azimuth angle, while the vertically extending virtual antenna array (with height differences) uses the vertical distance difference of the antennas to measure the up-and-down elevation angle.

To summarize, the industry definitions of radar dimensions (D) in the millimeter-wave radar field are as follows:

- **3D Radar measures 3 dimensions:** Range, Velocity (Doppler/Velocity), and Azimuth.
- **4D Radar measures 4 dimensions:** Range, Velocity, Azimuth, plus **Elevation**.

_The 3D spatial coordinates (X, Y, Z) seen in radar point cloud data are resolved from these three physical quantities—range, azimuth, and elevation—using trigonometric functions._

## Radar Angular Resolution

Similar to how radar measures range and velocity, radar angle measurement also involves the concept of minimum resolution, known as radar angular resolution.

In radar engineering, angular resolution refers to the minimum angle difference at which a radar can distinguish two adjacent objects at the same range and velocity. If the angular difference between two targets (such as a pedestrian and a parked vehicle nearby) is smaller than the radar's angular resolution, the radar's DSP will treat them as a single echo peak, outputting a single large fusion point in the point cloud data rather than two separate, independent targets.

Modern 4D imaging radars mostly adopt antenna design patterns with single-chip large arrays (e.g., 4TX/4RX, 4TX/6RX) or even multi-chip cascading (e.g., 4 chips combined into 12TX/16RX). Their horizontal azimuth resolution can achieve high precision of 1° ~ 1.5°, and vertical elevation resolution is roughly between 2° and 5°.

### How to Calculate Angular Resolution?

In radar and antenna theory, the essence of angular resolution is the mainlobe width of the antenna array. Rayleigh's criterion in physics states that two objects can just be resolved when the peak of one target falls exactly on the first null (zero point) of the diffraction pattern of the other.

![image.png](/images/blog/毫米波雷达是如何测量和计算角度信息的？-4.png)

For a uniform linear array of length $D$, its antenna pattern (beam shape) can be described by a $\text{sinc}$ function. The theoretical calculation formula for its 3dB beamwidth (i.e., the angular width where power drops by half, defined in engineering as the angular resolution $\theta_{res}$) is:

![image.png](/images/blog/毫米波雷达是如何测量和计算角度信息的？-5.png)

$$
\theta_{res} \text{ (radians)} \approx 0.886 \frac{\lambda}{D}
$$

For quick mental calculation, the coefficient $0.886$ is usually omitted to yield an approximation:

$$
\theta_{res} \approx \frac{\lambda}{D}
$$

Since $\pi\text{ radians} = 180^\circ$, $1\text{ radian} = \frac{180^\circ}{\pi} \approx 57.3^\circ$. Substituting this into the formula above, we get the formula in degrees:

$$
\theta_{res} \text{ (degrees)} \approx 57.3^\circ \times \frac{\lambda}{D}
$$

Assuming there are $N$ receiving antennas and the spacing between antennas is $d = \frac{\lambda}{2}$, the equivalent aperture length of the array is:

$$
D = N \cdot d = N \cdot \frac{\lambda}{2}
$$

Substituting this $D$ back into the angle calculation formula above:

$$
\theta_{res} \text{ (degrees)} \approx 57.3^\circ \times \frac{\lambda}{N \cdot \frac{\lambda}{2}} = \frac{114.6^\circ}{N}
$$

This is the quick-calculation formula used in engineering to estimate radar angular resolution. As can be seen, **the only way to improve angular resolution is to increase the number of receiving antennas** $N$.

According to the quick-calculation formula above, achieving a 1° resolution would require 114 receiving antennas spaced at $\frac{\lambda}{2}$? This is certainly impractical. This leads to the radar technologies of MIMO (Multiple-Input Multiple-Output) and Virtual Antenna Arrays.

### MIMO Virtual Antenna Arrays

In radar antenna design, it is physically impossible to accommodate a large number of real receiving antennas. However, engineering practice allows a small number of transmitting antennas (TX) and receiving antennas (RX) to be **multiplied**, virtually generating a large number of antennas during the radar's working process, thereby enhancing angular resolution performance through these virtual antennas.

The general workflow is as follows:

- Transmitting antenna TX1 transmits a Chirp signal, and the 4 real receiving antennas on the board (RX1 ~ RX4) receive the echoes. At this point, the system obtains 4 spatial phase sampling points.
- After a very short time, TX1 stops, and TX2 transmits a signal. During PCB layout, the physical position of TX2 is intentionally shifted sideways by a precise distance (typically 4 times the half-wavelength). When TX2 transmits a signal that hits the target, reflects back, and is received by RX1~RX4, the electromagnetic wave travels an extra distance due to the positional offset of TX2.
- When the radar's DSP performs calculations, the signal phases received by RX1~RX4 when TX2 transmits are mathematically equivalent to the phases received by 4 brand-new virtual receiving antennas (RX5 ~ RX8) magically appearing to the right of TX1 when TX1 transmits.

![image.png](/images/blog/毫米波雷达是如何测量和计算角度信息的？-6.png)

Therefore, through time-division transmission by 3 TXs combined with reception by 4 RXs, the radar software layer successfully resolves phase data for $3 \times 4 = 12$ virtual antennas.

If flagship single chips from TI or NXP (such as 4TX/4RX) are used, up to **16 virtual antennas** can be generated via the aforementioned MIMO method ($114^\circ / 16 \approx 7.1^\circ$ resolution).

Furthermore, if 4 such chips are **cascaded**—achieving, say, 12TX and 16RX—it is possible to virtualize $12 \times 16 = 192$ **virtual antennas.**

The high-precision horizontal and elevation angular resolutions achieved by contemporary flagship 4D radars mentioned earlier are accomplished precisely through this virtual antenna approach.

## References

- [How to Use Millimeter-Wave Radar Point Clouds for Multi-Object Tracking? - Electronic Engineering Album](https://www.eet-china.com/mp/a243084.html)
- [Understanding Millimeter-Wave Radar (Including 4D Millimeter-Wave Radar) in One Article - Zhihu](https://zhuanlan.zhihu.com/p/706346081)
- [Teaching You Millimeter-Wave Radar from Principles to Applications - Enterprise News - Drone World](https://www.youuav.com/news/detail/202308/56838.html)
- [Radar Principles Part 1 - Blog Detective - 博客园](https://www.cnblogs.com/junhengwang/p/16443596.html)
- [MIMO Radar Technology Miscellaneous - 吴建明wujianming - 博客园](https://www.cnblogs.com/wujianming-110117/p/17029327.html)