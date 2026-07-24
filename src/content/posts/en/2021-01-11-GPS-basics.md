---
title: "GPS Basics and How Positioning Works"
slug: "2021-01-11-GPS-basics"
description: "This article summarizes fundamental GPS knowledge and the working principles behind GPS positioning."
date: 2021-01-11T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["Hardware","GPS"]
draft: false
---


## **GPS Basics**

- GPS: Global Positioning System. Its full official name is NAVSTAR GPS (NAVigation Satellite Timing And Ranging Global Positioning System).
- GPS is a space-based, all-weather navigation system developed by the U.S. Department of Defense. It was designed to satisfy military requirements for obtaining **position, velocity, and time information** within a common reference frame on Earth or in near-Earth space.
- Other satellite navigation systems similar to GPS:
    - GLONASS (Global Navigation Satellite System), Former Soviet Union / Russia
    - Galileo-ENSS (European Satellite Navigation System, i.e., the Galileo program), European Union
    - BeiDou Navigation Satellite System (BDS), China

## **How GPS Positioning Works**

- The GPS satellite constellation operating in space continuously broadcasts navigation messages to the Earth's surface. These messages are a continuous stream of data transmitted at 50 bits per second. Each satellite simultaneously transmits the following information: system time, clock correction values, precise orbit data (ephemeris) for itself, approximate orbit data (almanac) for other satellites, ionospheric model parameters, Coordinated Universal Time (UTC) parameters, and other system status information. **The GPS navigation message is used to calculate the satellite's current position and signal transmission time, enabling the GPS receiver to determine its own location upon receiving the message.**
    - Put simply, the signal broadcast by a GPS satellite to the ground contains its own current coordinates and timestamp. Based on this information, ground receivers can calculate their own position.

    ![Untitled.png](/images/blog/GPS基础及其定位的工作原理-1.png)

    - The basic principle of GPS positioning can be illustrated using the figure above.
    - To calculate its current position, a ground-based GPS receiver needs the coordinate positions of four satellites and the distance data from those satellites to itself:
        - The current coordinate position of each satellite is contained within the broadcast navigation message;
        - The distance between a GPS satellite and the receiver is calculated based on the time difference between the timestamp in the received navigation message and the receiver's own current system time:
        - Upon receiving the navigation message, the GPS receiver subtracts the message timestamp from its current system time to determine the time taken for the data packet to travel through space.
        - Multiplying this transit time by the signal propagation speed (the speed of light) gives the distance the packet traveled, which is the range between that satellite and the GPS receiver.
    - According to 3D geometry, three sets of [Position_i, d_i] data are theoretically sufficient to pinpoint a single point in three-dimensional space. Why are four sets needed here? Under ideal conditions, three sets are indeed enough—meaning only three satellites would be required. In reality, however, due to clock synchronization errors and calculations involving signal propagation, data from four satellites must be used to eliminate clock bias and ensure positioning accuracy. Thus, the fourth satellite is added to correct timing errors and improve calculation precision.

## **Single-Point Positioning vs. Differential Positioning**

- Single-Point Positioning (Absolute Positioning): Determining the position of a device using a single standalone GPS receiver. As described above, the receiver determines its current position by simultaneously receiving signals from at least four GPS satellites.

![Untitled.png](/images/blog/GPS基础及其定位的工作原理-2.png)

- Differential Positioning (Relative Positioning): Improving positioning accuracy by using an additional reference GPS receiver.

![Untitled.png](/images/blog/GPS基础及其定位的工作原理-3.png)

- Why does differential positioning improve accuracy?
    - A reference GPS receiver is installed at a base station with known, precisely surveyed coordinates. By comparing the base station's known true coordinates with the coordinates calculated from GPS signals, correction values between the true and measured coordinates are calculated and broadcast by the base station in real time. While the user's receiver performs its own GPS measurements, it also receives these corrections from the base station and applies them to correct its positioning result, thereby significantly boosting accuracy.
    - Consequently, implementing differential positioning requires two necessary conditions: first, a base station installed at a fixed location with known precise coordinates; second, a data communication channel for the base station to broadcast its positioning corrections.
- The primary difference between single-point positioning and differential positioning is accuracy: single-point positioning offers meter-level accuracy, whereas differential positioning can achieve centimeter-level accuracy. In practice, meter-level accuracy from single-point positioning is sufficient for the vast majority of civilian applications.

## **Components and Operation of the GPS System**


![Untitled.png](/images/blog/GPS基础及其定位的工作原理-4.png)

- Overall, the GPS system consists of three major segments: the Space Segment, the Control Segment, and the User Segment.
- Space Segment:
    - The GPS Space Segment primarily consists of 24 GPS satellites, including 21 operational satellites and 3 active spares. These 24 satellites orbit in 6 orbital planes with an orbital period of approximately 12 hours. This setup guarantees that at least 4 satellites are visible above a 15-degree elevation angle from any point on Earth at any time.
    - Main function: Broadcast satellite signals for navigation and positioning.
    - Composition: 24 satellites = 21 operational satellites + 3 active spares.
    - 

    ![Untitled.png](/images/blog/GPS基础及其定位的工作原理-5.png)

- Control Segment (Ground Control Segment)
    - GPS Control Segment = Master Control Station (1) + Monitor Stations (5) + Ground Antennas / Injection Stations (3)
    - Master Control Station: Collects tracking data from monitor stations, computes satellite ephemeris data and clock correction parameters, and uploads them to the satellites via injection stations. It also sends control commands to satellites and repositions spare satellites in case of failure.
        - Located at Falcon Air Force Base (Schriever Space Force Base) in Colorado, USA.
    - Monitor Stations: Receive satellite signals, monitor satellite operational status, collect meteorological data, and forward this information to the Master Control Station.
        - 1 co-located with the Master Control Station; 3 co-located with Injection Stations; and 1 in Hawaii (Pacific Ocean).
    - Injection Stations (Ground Antennas): Upload satellite ephemeris data, clock corrections, and commands calculated by the Master Control Station to the satellites.
        - Ascension Island (Atlantic Ocean); Diego Garcia (Indian Ocean); Kwajalein Atoll (Pacific Ocean).
    - 

    ![Untitled.png](/images/blog/GPS基础及其定位的工作原理-6.png)

- User Segment
    - The GPS User Segment comprises GPS receivers and associated equipment. A GPS receiver consists mainly of a GPS chipset. Examples of GPS user equipment include automotive/marine navigators, mobile devices with built-in GPS, and GPS surveying equipment.

## **References**

- [A Brief Analysis of Basic Principles of GPS Positioning](https://www.cnblogs.com/magicboy110/archive/2010/12/09/1901669.html)
- [GPS Navigation Message](http://www.beidou.gov.cn/zy/kpyd/201710/t20171011_4597.html)