---
title: "Comparison of LTE CAT 1bis, LTE-M, and NB-IoT"
slug: "2024-09-11-the-comparson-of-LTECAT1-LTEM-NBIOT"
description: "This article focuses on summarizing the application characteristics of two LPWAN mobile communication technologies, LTE-M and NB-IoT, and provides a comprehensive comparison of LTE CAT 1bis, LTE-M, and NB-IoT across various dimensions."
date: 2024-09-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Mobile Communication"]
tags: ["Wireless Communication"]
draft: false
---


LTE CAT 1bis, LTE-M, and NB-IoT are all LPWAN (Low Power Wide Area Network) wireless communication technologies targeted at the IoT domain, yet they exhibit significant differences in power consumption, communication rate, and cost. This article focuses on comparing the respective application characteristics of these three mobile communication technologies.


In another technical summary of mine, I briefly organized the technologies behind LTE CAT 1 and CAT 1bis modules:. Therefore, the following will mainly outline the application and technical characteristics of LTE-M and NB-IoT respectively, followed by a comparison between them.


[link_to_page](https://www.notion.so/39a41002-72c1-44c8-a1d3-fca3a86f0895)


## LTE-M/eMTC


The full name of LTE-M technology is Long Term Evolution for Machines. Compared to NB-IoT, LTE-M is derived by tailoring and optimizing the LTE protocol without changing LTE's own technical architecture. Consequently, LTE-M is technically closer to LTE and can be more easily upgraded on existing 4G and 5G base stations to support LTE-M.


The LTE-M specification corresponds to the low-cost machine type communication (MTC) defined by 3GPP in Release 12 and LTE-enhanced MTC (eMTC) defined in Release 13. Therefore, LTE-M can also be referred to as MTC or eMTC technology.


In the 3GPP Release 14 specification, the LTE-M standard uses a 1.4MHz communication bandwidth, achieving a theoretical communication rate of approximately 1Mbps. Under the LTE CAT M2 specification, theoretical communication rates can even reach 7Mbps for the uplink and 4Mbps for the downlink.


LTE-M can serve as an alternative solution to technologies like Sigfox or LoRa, which operate in public license-free frequency bands.

- LTE-M operates in licensed frequency ranges defined and standardized by the international organization 3GPP, making it suitable for services led by mobile network operators. Sigfox and LoRa are both proprietary solutions from commercial companies (Sigfox in France and Semtech in the US, respectively), operating in license-free Sub-1G frequency bands such as 433MHz, 868MHz, and 915MHz.

Similar to LTE CAT 1 technology, LTE-M also supports automatic cell handover between base stations and maintains connectivity while roaming, making it exceptionally well-suited for vehicle-mounted and constantly moving application scenarios. Furthermore, LTE-M supports voice functionality and low-latency communication (under 15ms latency).


Compared to NB-IoT, LTE-M has an additional advantage in positioning. TDD-based LTE-M can utilize PRS measurements on the base station side to perform device positioning without the need to add a GPS chip. This low-cost positioning technology and capability makes LTE-M favorable for position-sensitive application scenarios such as logistics and cargo tracking.


## NB-IoT


The full name of NB-IoT is Narrow Band Internet of Things, which refers to narrowband mobile communication technology tailored for IoT applications.


NB-IoT is positioned as a wide-area network communication technology characterized by narrowband, low power consumption, low rate, low cost, wide coverage, and massive device connections for IoT applications.


NB-IoT was first proposed in 2015 in 3GPP Release 13. In this version of the protocol specification, NB-IoT uses a 200kHz bandwidth for communication, with a maximum uplink rate of 62kbps, a maximum downlink rate of 26kbps, and communication latency ranging from 1.6 to 10 seconds. 3GPP Release 14 further introduced an upgraded version of NB-IoT called LTE CAT NB2. This new standard achieves a maximum uplink rate of up to 159kbps and a downlink limit of 127kbps, representing a significant performance boost compared to the rates in Release 13.


The most prominent feature of NB-IoT is its ultra-low power consumption, which is only 1/10th of 2G. Terminal modules can achieve a battery service life of up to 10 years.


The coverage area of NB-IoT base stations is very broad. On one hand, this is due to the strong signal coverage capability inherent to NB-IoT; under the same frequency band, NB-IoT provides a 20dB network gain improvement compared to current 4G and 5G base stations, theoretically expanding the coverage area by 100 times. On the other hand, a single sector of an NB-IoT base station can support up to 100,000 connections, far exceeding the connection capacity supported by current 4G/5G base stations.


**It should be noted that NB-IoT does not support automatic cell handover and roaming functions between base stations. Therefore, it is practically unsuitable for scenarios involving movement that require frequent switching between base stations, and is better suited for stationary application scenarios after deployment and installation.**


## Summary Comparison of the Three Mobile Communication Technologies


![image.png](/images/blog/LTE-CAT-1bis、LTE-M、NB-IoT的对比-1.png)

- In terms of power consumption, the low-power characteristics of the three technologies are quite similar, but regarding specific low-power performance, the difference between NB-IoT and LTE-M is minimal. Generally, LTE-M exhibits better power performance over short distances, while NB-IoT has lower communication power consumption over long distances. LTE CAT 1bis has significantly higher power consumption than the other two. In specific system design and component selection, trade-offs must be made based on the product's power supply conditions.
    - Nordic conducted a power consumption comparison test between LTE-M and NB-IoT using their nRF9160 multi-mode communication chip: [LTE-M vs NB-IoT Field Test: How Distance Affects Power Consumption - Blogs - Nordic Blog - Nordic DevZone (nordicsemi.com)](https://devzone.nordicsemi.com/nordic/nordic-blog/b/blog/posts/ltem-vs-nbiot-field-test-how-distance-affects-power-consumption)
- Regarding supported communication rates, LTE CAT 1bis is the fastest and most feature-rich, followed by LTE-M, while NB-IoT can only provide communication support for applications with very low data volumes requiring just tens of kbps. This comparison is precisely the inverse of the power consumption ranking.
- Regarding the bandwidth occupied by the communication frequency bands, LTE CAT 1 uses 20MHz just like regular LTE, LTE-M uses 1.4MHz, and NB-IoT uses only 180kHz. Therefore, NB-IoT occupies less spectrum, resulting in lower deployment costs for operators.
- In terms of communication latency, both LTE-M and LTE CAT 1 can achieve 100ms, providing near real-time response. However, NB-IoT adopts a more extreme power-saving design, resulting in communication latency as high as 10 seconds, making it less suitable for applications requiring higher real-time data communication.
- From the perspective of network coverage, the Maximum Coupling Loss (MCL) of NB-IoT shows improvements of 20dB and 10dB compared to LTE CAT 1 and LTE-M respectively, which translates to a massive expansion in the coverage area of a single base station. Combined with the fact that a single NB-IoT base station sector can support a maximum of 100,000 device connections—an increase of 50 to 100 times in access capacity compared to traditional mobile communications—NB-IoT holds an overwhelming advantage in these aspects.
- Regarding mobility support, both LTE CAT 1bis and LTE-M support base station cell handover and roaming functions, whereas NB-IoT cannot support this feature. Consequently, NB-IoT is more suitable for applications with low requirements for device mobility.
- All three technologies use a single antenna for communication, which reduces the size of chips, modules, and devices, simplifies RF circuit design, and allows for lower chip costs.
- In terms of hardware chip and module costs, expenses are closely related to the complexity of the internal chip implementation. Regarding RF complexity, although LTE CAT 1bis has been significantly simplified compared to other high-spec LTE categories, it remains the most complex among the three. Thus, LTE CAT 1bis modules are more expensive, followed by LTE-M, with NB-IoT being the cheapest, making it ideal for application scenarios that require massive deployment and are highly sensitive to hardware costs.
- Regarding compatibility with existing 4G base stations deployed by operators, LTE CAT 1 and its CAT 1bis variant naturally have the best compatibility, posing virtually no compatibility issues on existing 4G base stations. However, for LTE-M and NB-IoT to directly access existing 4G base stations, software and hardware upgrades to the current base stations are required. Comparatively, the upgrade workload and cost for LTE-M are lower than those for NB-IoT.
- Regarding global support across different countries and operators: LTE CAT 1 and its CAT 1bis variant can connect directly to existing base stations and thus have virtually no compatibility issues (though 1bis has limited voice and other features on certain base stations). Conversely, LTE-M and NB-IoT face significant compatibility challenges, requiring either the independent erection of base stations or software and hardware upgrades to existing base stations for support. In particular, support for LTE-M and NB-IoT technologies varies across different countries. [Mobile IoT Deployment Map | Internet of Things (gsma.com)](https://www.gsma.com/solutions-and-impact/technologies/internet-of-things/deployment-map/) provides current global support for these two technologies: currently, China primarily promotes NB-IoT, with all three major operators having established mature deployments for NB-IoT, while North America and Europe develop LTE-M and NB-IoT in parallel.

![image.png](/images/blog/LTE-CAT-1bis、LTE-M、NB-IoT的对比-2.png)


Therefore, LTE CAT 1bis exhibits very distinct technical characteristics and competitive advantages/disadvantages. When comparing LTE-M and NB-IoT directly, LTE-M holds clear advantages in communication speed, voice call support, excellent mobility, and positioning capabilities, whereas NB-IoT's relative competitive edges lie in lower costs, broader base station coverage, larger cell capacity, and better static endurance.


## References

- [LTE IoT standards: LTE Cat 1, LTE Cat 1bis, LTE-M, NB-IoT (onomondo.com)](https://onomondo.com/blog/lte-standards-for-iot-comparison/)