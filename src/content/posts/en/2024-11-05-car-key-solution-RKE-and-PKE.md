---
title: "Automotive Keyless Solutions: RKE, PKE, and PEPS"
slug: "2024-11-05-car-key-solution-RKE-and-PKE"
description: "This article provides a detailed introduction to three mainstream automotive keyless solutions—RKE, PKE, and PEPS—and attempts to address technical questions regarding the understanding of these systems."
date: 2024-11-05T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Others"]
tags: ["Automotive Electronics"]
draft: false
---


## RKE


RKE stands for Remote Keyless Entry. RKE is a technology that allows car owners to remotely lock and unlock vehicle doors without directly using a physical key. Because it significantly enhances the convenience and security of operating a vehicle, RKE has long been widely adopted across various automotive brands and models.


The typical use case of RKE involves the car owner pressing a button on the RKE fob to remotely lock or unlock the doors. Some vehicle models support more diverse functions, such as one-touch window control or even remote engine start to automatically turn on the air conditioning. However, **the prerequisite for all these operations is that the owner must press a specific button on the RKE fob**. The fob then communicates with a receiver on the vehicle via wireless signals, parses the command corresponding to the button, and executes the appropriate action.


![image.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-1.png)


Regarding the specific wireless communication workflow, when the owner presses a button on the fob, this action activates the MCU inside the fob. The MCU evaluates the button press and transmits the corresponding data command via radio frequency (RF) communication to the RF receiver module on the vehicle's BCM (Body Control Module). The BCM decodes the received information, determines the type of button pressed by the owner, and executes the corresponding action. The data stream emitted from the fob after a button press typically ranges from 64 to 128 bits in length, containing elements such as a preamble, button command code, fob ID, rolling code, status information, and a checksum. This data stream is transmitted at a rate of 2KHz to 20KHz, primarily utilizing Amplitude Shift Keying (ASK) modulation to extend the battery life of the fob.


In the RKE solution, the MCU and wireless communication module inside the fob remain active only when the owner presses a button; therefore, its power consumption is extremely low, which is why batteries in RKE fobs can last for many years.


In RKE communication, the fob side contains only a wireless transmitter module, while the vehicle's BCM module contains only a wireless receiver module. Consequently, **RKE RF communication is unidirectional**, always flowing from the fob to the vehicle's BCM module. While this design is simple and power-efficient, it introduces significant security risks. If the fob's RF signal is intercepted and recorded by a third party, the recorded data stream can be easily replayed to unlock the doors and trunk.


For wireless communication frequency bands, RKE utilizes license-free Sub-1G ISM bands, namely 315 MHz (US, China, Japan, etc.), 433.92 MHz (Europe, China), and 868 MHz (Europe). Regarding signal modulation, most countries adopt the ASK (Amplitude Shift Keying) mode, while Japan uses the FSK (Frequency Shift Keying) mode.


## PKE


PKE stands for Passive Keyless Entry. The distinction between PKE and RKE is most evident in the word "Passive." This means that using PKE no longer requires the car owner to actively press a button on the fob; instead, it relies on RFID scanning and wireless communication technologies to passively detect the presence of the fob and automatically unlock the doors. As a result, it offers a more advanced and user-friendly experience.


The typical difference compared to RKE technology is that when a vehicle is equipped with a PKE key system, the owner does not need to press any button; simply approaching the vehicle with the PKE fob in their possession automatically unlocks the doors.


In terms of overall architecture, PKE and RKE are quite similar, as both feature RF communication capabilities on both the fob and the vehicle's BCM module to achieve automatic locking and unlocking. However, when it comes to the internal implementation details and workflows of the communication process, the differences between the two are significant:


![image.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-2.png)

- Unidirectional vs. Bidirectional Communication: RKE is unidirectional RF communication, where the fob transmits signals upon a button press and the body BCM module receives them. PKE, on the other hand, is bidirectional RF communication: the body BCM module wakes up the low-frequency module inside the fob via RFID scanning technology, and upon being awakened, the fob sends a response message back to the body BCM module through its high-frequency RF communication module.
- Frequency Bands: The RF communication module of RKE operates on a fixed frequency band of 315MHz or 433MHz. In contrast, PKE's low-frequency RFID scanning module consistently uses the 125KHz band for scanning, and once awakened by the RFID scanning module, the fob transmits a response message to the body BCM module via high-frequency wireless signals in the 433MHz/315MHz bands.

![image.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-3.png)


Based on a typical domestic PKE solution shown above, the specific workflow of PKE operates as follows:

- After the car doors are closed and locked, the vehicle's BCM module (such as the base station module in the diagram above) periodically transmits 125KHz serial codes outward and listens on the 433MHz band for a response signal from the fob. If no response is received, it enters a sleep state for a period of time before resuming the transmission of the search serial code on the 125KHz band.
- The fob remains in a low-power sleep state, where its LF receiving induction module functions essentially as a passive RFID tag. When the fob is relatively close to the vehicle/base station, the periodic 125KHz radio waves emitted by the base station induce energy through the LC resonant circuit on the fob's LF induction module, powering the RFID tag. The MCU inside the fob (such as the UM2082F08 shown above) checks whether the Tag ID contained in the 125KHz signal matches the pre-written Tag ID stored locally. If they do not match, the fob's LF receiving induction module returns to sleep.
- When the LF receiving induction module is energized and detects a matching Tag ID, it wakes up the high-frequency HF transmitter module (such as the UM2001 above) and transmits a response packet to the vehicle's BCM module via high-frequency signals like the 433MHz band.
- Upon receiving the verification packet sent by the fob on the 433MHz band, the vehicle's BCM module decodes and verifies it. Once authentication is successful, it executes the corresponding body control action based on the contents of the packet.

![image.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-4.png)


### How Does PKE Achieve Low Power Consumption?


**The key to PKE achieving low power consumption lies in its low-frequency LF module utilizing passive RFID scanning technology.**


In the absence of an external 125KHz excitation signal in the surrounding environment, the fob remains entirely in a standby sleep state. Only when the fob approaches the vehicle does the periodic 125KHz excitation signal emitted by the vehicle activate the LF induction module on the fob, initiating its operation.


This aspect is crucial in bidirectional wireless communication. It ensures that the fob does not need to periodically power on its high-power RF transceiver module to check the status of surrounding wireless signals, thereby achieving optimal low-power performance.


Consequently, in terms of low-power performance, the difference between RKE and PKE is not particularly pronounced. In fact, to further reduce power consumption on both ends (including the power consumed by the vehicle periodically emitting 125KHz excitation signals), some manufacturers design systems where the 125KHz excitation signal is emitted only when the owner touches the door handle. This eliminates the need for the vehicle to periodically emit RFID scanning signals, effectively lowering the power consumption of the vehicle's PKE system.


### Why Adopt a Dual-Link LF/HF Communication Design?


As mentioned above, a critical requirement for the fob is achieving extremely low power consumption, which necessitates the use of RFID technology. Among typical RFID frequency bands, 125KHz—commonly used in access control systems—is most suitable for keyless entry systems in terms of RFID scanning and sensing range. The typical scanning range of 125KHz RFID is 3 to 5 meters, which provides sufficient distance without being overly excessive.


However, the issue with 125KHz RFID communication is that the communication data rate between the two ends is too low, typically less than 1Kbps. Therefore, once the LF RFID induction module on the fob is awakened, it is necessary to use a higher-frequency wireless communication module to handle authentication and exchange control information. This is why adding a high-frequency 433MHz/315MHz band for wireless communication is required. This high-frequency band allows for much faster transmission of complex interactive information.


In fact, the choice of the HF band is not strictly restricted to Sub-1G frequencies like 433MHz and 315MHz; higher frequency bands such as 2.4GHz can also be selected. For example, modules like the UM2001 and UM2052 in the domestic PKE solution mentioned above can support data transmission and reception in the 2.4GHz band as well.


## PEPS


PEPS stands for Passive Entry Passive Start. As the name implies, PEPS consists of two main components: passive entry and passive start.

- Passive entry primarily encompasses three functions: unlocking vehicle doors, locking vehicle doors, and opening the trunk without a key. This functionality is essentially identical to a PKE system, except that the Bluetooth technology used in PEPS offers higher communication security.
- Passive start refers to the ability of the car owner, upon entering the vehicle, to start the engine by pressing the start button without needing to insert a key, provided the vehicle can detect the key. This involves determining the owner's position and distance; different distances grant different levels of vehicle access permissions.

Therefore, the key distinction between PEPS and PKE is that PEPS additionally measures the distance between the vehicle and the fob, determining whether the fob is inside or outside the car. This information is used to grant different tiers of access permissions to the owner. The most typical scenario is that if the fob is outside the car, the PKE-based workflow only permits unlocking the doors to enter the cabin, while the engine start function remains disabled. Conversely, if the fob is detected inside the car, the owner is granted the higher-level privilege of starting the engine directly with a single button press.


In terms of technical implementation architecture, current mainstream PEPS systems generally incorporate Bluetooth and NFC elements. This provides owners with an operation method that does not rely on a traditional key, allowing them to lock, unlock doors, and even start the engine using an authorized smartphone.

- NFC: After initial setup and pairing, car owners can tap their NFC-enabled smartphone near the vehicle's B-pillar to enter the vehicle.
- Bluetooth: Bluetooth functionality can be much richer. Its frequency-hopping mechanism and comprehensive communication security framework more effectively resolve the security vulnerabilities inherent in RKE and PKE systems. More importantly, the ranging precision and positioning capabilities of Bluetooth technology can be conveniently utilized to confirm the exact timing for opening or closing doors, thereby significantly reducing the possibility of tailgating. Of course, utilizing Bluetooth in a PEPS system requires adapting and debugging Bluetooth functions at the underlying system layers of both the smartphone and the in-vehicle infotainment (IVI) system. This ensures that automatic Bluetooth connection and communication can occur without requiring the user to open a specific app.


As stated above, a crucial aspect of the PEPS system is the vehicle's ability to sense the owner's position and distance, thereby granting different levels of control permissions based on proximity. Consequently, ranging is critically important in PEPS systems. Bluetooth-based PEPS systems primarily rely on two ranging schemes: RSSI and AoA.

- RSSI (Received Signal Strength Indicator) is predominantly used in low-end Bluetooth PEPS systems. Its operating principle relies on the attenuation model—where RF signal power gradually attenuates as radio waves travel through the air—to calculate the distance between nodes. Therefore, RSSI can roughly estimate the distance between two communication nodes based on signal power. However, when obstacles are present, they indirectly affect the evaluation of signal strength, meaning good performance is only achieved when the nodes are in close proximity. Because of its simple structure, low cost, and low power consumption, it is widely used in entry-level PEPS solutions. In practical implementation, a Bluetooth base station is typically installed on the vehicle's A-pillar, and RSSI is used to determine the distance between the user's handheld Bluetooth device and the A-pillar to decide the timing for opening the door.

![image.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-5.png)

- AoA (Angle of Arrival). AoA positioning technology in PEPS leverages the AoA algorithm introduced in Bluetooth version 5.1. Typically, multiple Bluetooth AoA base stations are installed around the vehicle body. Signals are received through multiple Bluetooth antenna arrays and subjected to phase analysis to calculate the directional angle of the transmitting device. This solution can relatively accurately determine the position (distance and direction) of the transmitting device, achieving an accuracy of about 0.5 meters. Because the overall system is relatively complex and incurs higher costs, AoA is generally utilized in mid-to-high-end PEPS systems.

![image.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-6.png)


Current chip solutions used in the Bluetooth PEPS field include the TI CC2640, NXP KW36, and Silicon Labs EFR32BG22.


### How Do Smartphones and In-Vehicle Infotainment Systems Actually Interact via Bluetooth in a PEPS System?


**For all Bluetooth communications, establishing a connection between two Bluetooth devices is the foundation for achieving stable, reliable, and secure bidirectional communication.**


In the context of the Bluetooth car key function within a PEPS system, the two ends of Bluetooth communication are simply the smartphone and the car's infotainment system (IVI). Processing on the IVI side is relatively straightforward. Whether factory-installed or aftermarket, the IVI operating system is deeply customized and pre-debugged for the specific vehicle model. Consequently, the IVI does not need to worry about cross-device compatibility; its Bluetooth-related functions can run persistently in the background, awaiting communication with the smartphone's digital key system. The smartphone side, however, is more complicated, as it must support both Android and Apple ecosystems. Furthermore, the domestic Android ecosystem is somewhat fragmented, with several major smartphone manufacturers making deep underlying customizations based on Android AOSP. Therefore, how can we ensure that the Bluetooth car key function across various smartphone models maintains stable communication with the IVI's Bluetooth under all circumstances, thereby realizing the defined PEPS functions for Bluetooth keys? After all, two Bluetooth devices must first establish a connection before they can achieve effective, secure communication.


The most straightforward approach is that vehicles equipped with PEPS Bluetooth key functionality provide companion smartphone apps for different operating systems. When using the Bluetooth key feature, opening the app on the smartphone naturally enables Bluetooth communication with the car. However, the problem is that having to open an app every single time you want to open a car door is even less convenient than RKE. Having to take out your phone and open an app before driving every time is arguably worse than operating a traditional key fob, so the user experience leaves much to be desired. Therefore, to provide a good user experience, the smartphone's Bluetooth car key feature must eliminate the need for the owner to open an app every time they control the doors. This requires **ensuring that the app runs persistently in the background of the smartphone and has the necessary permissions enabled, allowing the background app to successfully establish a connection and communicate with the vehicle's Bluetooth**. For example, the following shows usage precautions for a Bluetooth car key on a domestic new-energy vehicle model:


![1731382353656.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-7.png)


Additionally, some automakers partner with smartphone manufacturers to integrate their vehicle's Bluetooth key function directly into the system's digital wallet feature. For instance, as shown below, the Oppo ColorOS system wallet allows users to add Bluetooth/NFC car keys. After selecting the corresponding vehicle model and following the prompts, users are still required to install the vehicle's companion app. Subsequent Bluetooth interactions are actually handled between this app and the vehicle system. Adding the Bluetooth key function to the system's wallet app essentially automates the installation of the vehicle app and ensures at the system level that the app remains open in the background, thereby enabling Bluetooth communication and control between the vehicle and the smartphone without requiring the user to manually open the app.


![1731382642287.png](/images/blog/汽车的无钥匙解决方案之RKE-PKE-PEPS-8.png)


## References

- [A Brief Discussion on the Development History of Automotive Keyless Entry Systems](https://baijiahao.baidu.com/s?id=1797923975534672369&wfr=spider&for=pc)
- [125KHz Low-Frequency Wake-up SoC UM2082F08 Automotive PKE Solution - Youjia](https://m.yoojia.com/article/8959922182897732652.html?from_src=biji_tab&_swebfr=220011)
- [Detailed Description of Specific Functions in Traditional Automotive Keyless Entry Systems & the Role of Keyless Entry Induction Low-Frequency Antennas - CSDN Blog](https://blog.csdn.net/linan101/article/details/119778181)
- [The Past, Present, and Future of Passive Entry Passive Start (PEPS) Systems](https://www.szrfstar.com/blog/evolution_of_peps_past_present_and_future-cn.html)