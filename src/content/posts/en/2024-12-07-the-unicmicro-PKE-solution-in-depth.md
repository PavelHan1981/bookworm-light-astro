---
title: "In-Depth Study and Summary of UnicMicro's Car Key PKE Solution"
slug: "2024-12-07-the-unicmicro-PKE-solution-in-depth"
description: "This article provides a comprehensive analysis of the PKE solution provided by UnicMicro, focusing on the LF and HF communication workflows implemented at the base station and key fobs."
date: 2024-12-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Bluetooth"]
tags: ["Automotive Electronics"]
draft: false
---


Previously, in another note, I summarized the [mainstream keyless entry solutions (RKE/PKE/PEPS)](https://mp.weixin.qq.com/s/Tor4rzBxZGteQt_NN0Bzag) currently used in the automotive electronics field. This article focuses on a more detailed description of the complete operating principles of a PKE solution introduced by domestic manufacturer UnicMicro, aiming to enhance the deeper understanding of PKE technology implementation.


## UnicMicro's Complete PKE Solution


All keyless entry solutions are generally structured similarly, divided into two parts: the key fob side and the base station side installed inside the vehicle (including both automobiles and two-wheeled electric vehicles). Overall, because the key fob is powered by a coin cell battery, it is extremely sensitive to power consumption across various application scenarios; meanwhile, the base station is pre-installed inside the vehicle and powered by the vehicle's battery, which serves as the foundational premise for the entire system design. Otherwise, if the key fob's power consumption were not a constraint, the entire solution could be greatly simplified. For example, in smartphone-based digital car keys, power consumption on the phone side is not a critical constraint, so keyless entry can be achieved simply via Bluetooth or NFC—resulting in simpler system design and better communication security. However, the power consumption of Bluetooth is something a coin cell-powered PKE key fob simply cannot withstand, which is why this RFID LF + 433MHz HF communication mode is adopted.


![1733557146591.png](/images/blog/对广芯微车钥匙PKE方案的深入学习总结-1.png)


From a communication perspective, both the key fob and base station incorporate both Low Frequency (LF) and High Frequency (HF) sections. The LF section typically uses RFID at 125 kHz, while the HF section can communicate using 433 MHz or 2.4 GHz.

- The base station transmits signals outward via LF and lacks LF reception capabilities; it listens for signals from the key fob via HF and lacks HF transmission capabilities.
- The key fob operates in exactly the reverse manner: it receives signals via LF but cannot transmit them; conversely, control signals destined for the vehicle are emitted from the key fob's HF transmitter, while the key fob's HF section lacks reception capabilities.

In fact, for the HF communication portion, the HF modules on both ends remain in a sleep state for the vast majority of the time. They only need to wake up and enable TX or RX when communication is required. Therefore, the choice of HF technology is not critically important; for instance, in the architecture diagram above, either the Sub-1GHz band (433 MHz) or the commonly used 2.4 GHz can be selected. To minimize the key fob's power consumption as much as possible, the HF design is generally a unidirectional transceiver relationship: the key fob is a fixed HF transmitter used to send door control commands to the base station, while the base station is a fixed HF receiver that consistently listens for control signals from the key fob. Given this unidirectional transceiver relationship, implementing reasonable technical countermeasures against cracking methods such as relay attacks and man-in-the-middle attacks is difficult, meaning this approach inherently carries certain security risks. If the HF design were bidirectional, communication security could be significantly improved; however, both ends' HF TX and RX would need to remain constantly active during communication, posing a massive challenge to low-power design, especially for coin cell-powered key fobs. Thus, this unidirectional HF transceiver scheme represents a compromise between security and power consumption.


**The communication logic on the HF side is relatively simple: upon being woken up (either by an LF RFID scanning wake-up or a button press on the key fob), the key fob sends a command to the base station via its HF transmitter. Therefore, the key to the entire system design actually lies in the LF portion.**


## Base Station LF Transmission Workflow


The circuit for the base station's LF section includes an MCU and a 125 kHz signal transmitter, the UM12020D.


UnicMicro's UM12020D is used to drive the 125 kHz low-frequency antenna, featuring a peak output current of 5A, a continuous output current of up to 3A, and a maximum operating voltage of 38V. By inputting PWM control signals through the IN1 and IN2 pins, it can drive the low-frequency antenna. A synchronization regulation circuit is integrated inside the chip to reduce power consumption during the PWM control process.


The typical reference design for the connection between the UM12020D and the MCU is shown in the figure below.


![1733814928976.png](/images/blog/对广芯微车钥匙PKE方案的深入学习总结-2.png)

- The 125 kHz transmitting antenna is connected between the OUT1 and OUT2 pins, IN1 and IN2 are connected to the MCU's PWM pins, and the nSLEEP pin is connected to the MCU's GPIO to control the OUT outputs.
- **The nSLEEP pin can be used to control whether the LF driver chip UM12020D enters active mode or sleep mode**. When the driver chip is in active mode, complementary PWM signals on the INA and INB pins drive the UM12020D to convert digital signals into analog signals. When the driver chip is in sleep mode, even if complementary PWM signals are input to the INA and INB pins, the UM12020D will not perform analog signal modulation. This characteristic can subsequently be leveraged to modulate the signal intended for the key fob's LF receiver onto the 125 kHz carrier signal.

The MCU outputs two inverse complementary 125 kHz PWM signals to the IN1 and IN2 pins, serving as the carrier. The actual data to be transmitted to the receiver via the carrier is issued by controlling the nSLEEP pin.


Essentially, the UM12020D circuit described above is an ASK modulation signal driver. In practical use, a stable 125 kHz PWM is input to IN1 and IN2 as the ASK carrier signal, while the nSLEEP signal serves as the ASK modulating wave. The actual data to be transmitted is contained within the modulating wave signal. The principle of ASK modulation can be clearly understood by referring to the diagram below:


![image.png](/images/blog/对广芯微车钥匙PKE方案的深入学习总结-3.png)

- $s(t)$ is the modulating wave signal output on nSLEEP, and the carrier is the inverse complementary 125 kHz PWM wave simultaneously input to IN1 and IN2.

When the modulating wave signal to be sent to the key fob via LF is 1 kHz, it is only necessary to control the nSLEEP pin to be 0 or 1 with a 1ms time unit.


The LF signal sent to the key fob via the nSLEEP pin should be configured with a communication data frame format. This includes configuring the preamble length, matching code data, and user data within the user data frame to facilitate parsing at the receiving end.


## Key Fob LF Reception Workflow


In the key fob system design scheme outlined above, the system primarily comprises a low-power MCU with a built-in 125 kHz reception function (UM2082F08) and an HF transmitter. UnicMicro also offers a standalone 125 kHz Receiver chip series (UM2020), which can be paired with any low-power MCU to achieve the functionality of the UM2082F08.


The functionality of the low-power MCU is relatively straightforward. Taking the UM2020 as an example, the workflow of the 125 kHz receiver is explained below.


The UM2020 is a 3-channel, ultra-low-power ASK receiver chip capable of detecting LF (low frequency) carrier frequency data in the 30 ~ 300 kHz range and triggering a wake-up signal. After waking up, the MCU can either acquire subsequently received data in real-time via IO or read it directly from registers via SPI or I2C (storing up to 8 bytes of data).


Operating on RFID 125 kHz principles, the entire key fob remains in a deep sleep state. When the base station periodically emits a 125 kHz scanning signal, the UM2020's LF reception circuit wakes up. After performing preliminary data reception and evaluation, the UM2020 buffers the received data. Upon confirming that the scanning signal originates from its own base station, the UM2020 wakes up the key fob's low-power MCU via its Wake pin. The low-power MCU reads the buffered data information from the UM2020 via SPI or I2C pins, performs further logical evaluations, and then activates the key fob's HF module to send unlock or lock commands to the base station.


Therefore, **the core of the key fob design lies in its LF reception circuit, and the core of the LF reception circuit lies in the UM2020.**


![1733732316332.png](/images/blog/对广芯微车钥匙PKE方案的深入学习总结-4.png)


The reference circuit design based on the UM2020 is shown below:


![1733791548441.png](/images/blog/对广芯微车钥匙PKE方案的深入学习总结-5.png)

- LFP1, LFP2, and LFP3 are connected to a 125 kHz 3-axis antenna. A 3-axis antenna is used to address reception sensitivity issues across various directions, ensuring a favorable induced signal can be received from any orientation.
- The MCU and UM2020 can communicate via SPI or I2C for configuring the UM2020 and reading received data from its buffer.
- The UM2020 wakes up the MCU via its Wake pin upon receiving data.

### LF Wake-up Match-Code Filtering Functionality


In understanding the operational logic described above, two issues arise:

- If all vehicles use similar 125 kHz frequencies for similar scanning, it means the UM2020 on every key fob will be woken up, which in turn wakes up the respective MCU. In a parking lot where many vehicles are simultaneously and periodically emitting 125 kHz scanning signals, the UM2020 and MCU would be woken up frequently, posing a severe problem for the key fob's low-power budget.
- Along the same logic, if multiple vehicles are periodically emitting 125 kHz scanning signals simultaneously, the key fob must determine whether the signal belongs to its own vehicle and only emit an unlock signal when its own vehicle's signal is received.

Both of these issues are largely resolved by the match-code filtering function on the UM2020.


The 125 kHz signal reception and wake-up workflow of the UM2020 features a match-code detection mode. The match-code is essentially a 16-bit piece of data. During LF communication, the base station periodically emits a 125 kHz scanning signal, which generally consists of three parts: the carrier, the match-code, and 8 bytes of user data. The key fob and base station can verify whether the signal originates from their own vehicle using the match-code and a portion of the 8-byte data. The difference is that match-code detection and comparison are automatically handled directly within the UM2020, whereas parsing the 8-byte data portion requires waking up the MCU to read, parse, and evaluate the data within the MCU's execution logic.


The key fob wakes up upon receiving the 125 kHz carrier signal and begins receiving the match-code. If the received match-code does not match its built-in match-code, the UM2020 returns to listening mode without waking up the MCU. If the match-code matches, it wakes up the MCU, reads the data via SPI or I2C, and further parses and evaluates the read data to decide whether it is valid data and whether an unlock signal needs to be sent to the base station via HF.


Through the match-code detection and subsequent data parsing/evaluation described above, the power consumption issue caused by frequent wake-ups can be resolved, along with the ability to verify whether the signal originated from the user's own vehicle.


![1733792907719.png](/images/blog/对广芯微车钥匙PKE方案的深入学习总结-6.png)


## HF Communication Workflow on Both Ends


The communication logic for the HF section is relatively simple, driven entirely by the LF data reception event:

- Every time the base station periodically emits a 125 kHz scanning signal, it simultaneously opens its HF RX for a duration to wait for the HF signal from the key fob. If it successfully receives a signal from the key fob, it indicates that the key fob is nearby.
- When the key fob's LF section receives the 125 kHz scanning signal emitted by its own vehicle, the MCU controls the HF section to send a command to the base station's HF receiver, informing the base station that it is nearby.

### Security Risks in HF Communication


For HF communication, the key fob features a unidirectional transmission function while the base station features a unidirectional reception function. This communication mode cannot effectively defend against man-in-the-middle replay attacks.


For example, consider a typical car theft scenario seen on foreign websites: the key fob is inside the house while the vehicle is outdoors. Under normal conditions at this distance, the base station signal on the vehicle cannot detect the key fob's location, so the key fob will not emit an HF signal to unlock the doors. However, if an attacker uses an attacking device equipped with both an LF transceiver and an HF transceiver near the doorway, receives the base station's 125 kHz scanning signal, amplifies its power, and re-transmits it, this signal will be picked up by the indoor key fob. The key fob will detect that this signal comes from its own vehicle and will transmit an unlock signal outward via its HF transmitter. This unlock signal is captured by the attacker's HF receiver, amplified, and sent to the vehicle base station's HF receiver. The base station will then mistakenly believe the key fob is nearby and unlock the doors, allowing the thief to easily open the car door.


This issue is nearly unsolvable for the aforementioned PKE scheme. The root cause lies in the fact that, to minimize power consumption as much as possible, the HF communication is designed as a unidirectional transceiver, leaving both communicating parties with insufficient means to verify the legitimacy of each other's identity. If a communication method with bidirectional identity authentication mechanisms—such as Bluetooth—were adopted, this problem could be completely resolved.


## References:

- UnicMicro PKE Evaluation & Development Kit Application Manual
- UM2020 Datasheet
- UM2020 User Manual
- UM12020D Datasheet
- [5 Digital Communication ASK Modulation and Demodulation—Theory (1)_ask signal - CSDN Blog](https://blog.csdn.net/qq_39376872/article/details/131927213)