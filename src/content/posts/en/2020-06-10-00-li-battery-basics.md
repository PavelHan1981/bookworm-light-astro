---
title: "Lithium Battery Fundamentals"
slug: "2020-06-10-00-li-battery-basics"
description: "A summary of lithium battery technology, aimed at addressing a lack of understanding regarding battery charge/discharge characteristics during battery product development."
date: 2020-06-10T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Hardware"]
tags: ["Lithium Battery","Hardware"]
draft: false
---

## **Lithium Battery Composition Structure**

Lithium batteries are structurally divided into four main parts: cathode, anode, electrolyte, and separator.

-   Cathode: Lithium Iron Phosphate (LFP), ternary materials (Nickel Cobalt Manganese (NCM) / Nickel Cobalt Aluminum (NCA));
    -   LFP has significantly lower energy density and poorer low-temperature performance compared to ternary materials, but offers much better safety.
-   Anode: Primarily uses graphite;
-   Separator: Placed between the two electrodes, acting as a device to isolate the cathode and anode, preventing direct contact between the active materials on the electrodes that could lead to internal short circuits and safety incidents. (For applications with high safety requirements, lithium batteries are often subjected to puncture tests to ensure that even if the separator is pierced, it will not cause serious safety incidents).
    -   The separator allows charged lithium ions to pass through, forming a pathway. During battery charge and discharge, lithium ions move from one electrode to the other through the separator.
-   Electrolyte: The carrier for Li ion transport during battery charge and discharge. It is generally formulated under specific conditions and ratios from high-purity organic solvents, electrolyte lithium salts, and necessary additives.

## **How Lithium Batteries Work**

-   Lithium-based batteries can be divided into lithium batteries and lithium-ion batteries. Devices like mobile phones and rechargeable batteries used in our daily lives are actually lithium-ion batteries; people simply refer to them colloquially as lithium batteries. True lithium batteries are rarely used in everyday electronic products due to their higher inherent risks.
-   A simple summary of how lithium-ion batteries work: A lithium battery is a rechargeable battery that fundamentally operates by the movement of lithium atoms between the cathode and anode. Hence, lithium-ion batteries are also called "rocking-chair" batteries.
    -   During charging, a Li atom decomposes into a lithium ion (Li+) and an electron. The electron travels to the anode through the external charging circuit, while the lithium ion (Li+) moves to the anode through the electrolyte. Thus, during charging, both the Li+ and electrons released from the cathode move to the anode, where they recombine to form lithium atoms. The entire charging process is essentially the movement of lithium atoms from the cathode to the anode;
        -   During charging, the process where a lithium atom in the cathode decomposes into a lithium ion (Li+) and an electron is called deintercalation. The process where the lithium ion (Li+) and electron recombine to form a lithium atom in the anode is called intercalation.
    -   The discharge process is exactly the opposite: a lithium atom in the anode decomposes into a lithium ion (Li+) and an electron. The electron travels to the cathode through the external discharge circuit, while the lithium ion (Li+) moves to the cathode through the electrolyte. The Li+ and electron then recombine at the cathode to form a lithium atom. Therefore, the discharge process is essentially the movement of lithium atoms from the anode to the cathode;
        -   During discharge, the process where a lithium atom in the anode decomposes into a lithium ion (Li+) and an electron is called deintercalation. The process where they recombine to form a lithium atom in the cathode is called intercalation.
    -   For a battery, our normal use of electronic devices is essentially what is referred to as the battery discharge process.

## **Key Parameters of Lithium Batteries**

-   Battery Capacity / Nominal Capacity
    -   The amount of charge a battery can store or release under normal operation, determined by the quantity of active material contained within the battery.
    -   Generally calculated as the product of current used and discharge time, thus the unit is mAh (milliampere-hour) or Ah (ampere-hour). For example, the nominal capacity of a standard 18650 battery is 2200mAh.
-   Chemical Capacity QMax
    -   The maximum theoretical chemical energy that the active material in a battery can provide. Due to factors such as internal resistance and low-voltage protection mechanisms during battery use, the actual usable capacity (i.e., nominal capacity) of the battery will be lower than its chemical capacity QMax.
-   Nominal Voltage
    -   The discharge curve of a lithium battery exhibits a parabolic characteristic, with rapid changes from 4.3V down to 3.7V and from 3.7V down to 3.0V. The battery will discharge at around 3.7V for a significant period, accounting for almost 3/4 of its total discharge time. The nominal voltage of a lithium battery refers to this voltage range where it maintains discharge for the longest duration.
-   Open Circuit Voltage (OCV) vs. Working Voltage
    -   When the battery is not connected to any external load, the potential difference measured between its positive and negative terminals is its open circuit voltage (OCV).
    -   Another voltage-related concept is working voltage, which contrasts with OCV. It is the potential difference measured between the battery's positive and negative terminals when an external load is connected and current is flowing.
    -   Due to the battery's internal resistance, the working voltage is lower than the OCV during discharge (when an external load is connected); conversely, the working voltage is higher than the OCV during charging (when an external power supply is connected).
    -   The nominal voltage of lithium-ion batteries is generally 3.7V or 3.8V.
-   Charge Termination Voltage
    -   During the charging process, the open circuit voltage of a lithium battery continuously rises. When the battery is almost fully charged and the active materials on the electrode plates have largely reached saturation, further charging will not cause the battery's voltage to increase further. This voltage is the charge termination voltage.
    -   The charge termination voltage for lithium-ion batteries is typically 4.2V, 4.35V, or 4.4V.
-   Discharge Cut-off Voltage
    -   Refers to the minimum voltage output by the battery during discharge operation. Generally, the discharge cut-off voltage for a single lithium-ion cell is 2.7V.
    -   Lithium batteries absolutely must not be over-discharged! If the battery's discharge voltage drops below 2.7V, it may lead to the battery being rendered useless. Therefore, protection circuits are typically installed inside the battery to automatically cut off discharge when excessively low voltage is detected.
-   Battery Internal Resistance
    -   The internal resistance of a battery is determined by the resistance of the electrode plates and the impedance of the ion flow. During charging and discharging, the resistance of the plates remains constant, but the impedance of the ion flow changes with the concentration of the electrolyte and the increase or decrease of charged particles.
    -   **When the open circuit voltage (OCV) of a lithium battery decreases, its internal impedance increases. This is why, when a battery is in a low-charge state (OCV below 3V), a small-current pre-charge (trickle charge) should be performed first. After the OCV rises to a certain level (during which the impedance will decrease), then a high-current fast charge can be applied. This effectively prevents excessive heat generation and associated safety hazards that could arise from high-current charging when the battery's internal resistance is high.**
    -   The unit of battery internal resistance is typically milliohms. Batteries with high internal resistance generate significant heat due to high internal power consumption during charging and discharging, leading to accelerated aging and reduced lifespan. It also limits high-rate charge/discharge applications. Therefore, lower internal resistance generally leads to better battery life and rate performance.
-   Battery Charge/Discharge Rate C
    -   The battery's charge/discharge rate C is essentially a relative current parameter. A higher C-rate for a battery means it can support faster charging speeds and higher charging currents, and also implies it can support larger discharge currents.
    -   All batteries have maximum discharge current and maximum charge current limits. Exceeding these limits during use will damage the battery's lifespan.
    -   1C indicates that the battery can be charged from a low state to 100% in 1 hour. 0.5C means it takes 2 hours to fully charge. Taking a 18650 battery as an example, if its capacity is 2200mAh, then 1C is 2200mA, and 0.5C is 1100mA.
    -   In summary, the battery's charge/discharge rate parameter C determines how quickly a certain amount of energy can be stored in the battery, or how quickly (or with what discharge current) the energy stored in the battery can be released.
-   Self-Discharge Rate
    -   Refers to the percentage of total capacity that a battery automatically loses over a period when not in use.
    -   Typically, the self-discharge rate for lithium-ion batteries at room temperature is 5-8%.

## **Lithium Battery Charge and Discharge Process**

Typical Charging Process:

-   At the start of charging, the voltage of the battery to be charged should first be checked. If the voltage is below 3V, a pre-charge (trickle charge) should be performed first, with a charging current of 1/10 of the set current, typically around 0.05C;
-   Once the voltage rises to 3V, the standard charging process begins. The standard charging process involves: **constant current charging** at the set current. When the battery voltage reaches 4.20V, it switches to **constant voltage charging**, maintaining the charging voltage at 4.20V. At this point, the charging current gradually decreases. When the current drops to 1/10 of the set charging current (i.e., once the charging current reaches a certain threshold, the battery is considered fully charged), the charging process ends.
-   The figure below shows a typical lithium battery charging curve:

![Untitled.jpeg](/images/blog/锂电池的基础知识-1.jpeg)

-   Typically, the charging current for lithium batteries is set between 0.2C and 1C. A larger charging current results in faster charging, but:
    -   Battery heating will also be greater; charging with excessively high current may not fully charge the capacity;
    -   Therefore, it is common practice to use a relatively high current to charge the battery to a nearly full state, and then complete the charge with a smaller current.

Typical Discharge Process:

-   The figure below shows a typical lithium battery discharge curve:

![Untitled.jpeg](/images/blog/锂电池的基础知识-2.jpeg)

-   Throughout the discharge process, the battery voltage rapidly drops from the full-charge voltage to the nominal operating voltage of the lithium battery. It then operates at the nominal operating voltage for a long period. As the charge nears depletion, the voltage drops rapidly again to the cut-off voltage (e.g., 3V in the figure above). When the battery voltage drops to the discharge cut-off voltage, the battery activates its protection mechanism and stops discharging.
-   The larger the battery discharge current, the smaller the discharge capacity, and the faster the voltage drops.

## **References:**

-   [Are lithium batteries safe? Why do electric vehicles spontaneously combust? Teacher Li Yongle teaches you how to use batteries safely](https://www.bilibili.com/video/BV1Kt411n7TC)
-   [Analysis of various parameters of lithium battery performance](https://m.sohu.com/a/258465948_560178)
-   [An article analyzing the working principle and applications of lithium batteries](http://www.elecfans.com/yuanqijian/dianchi/lidianchi/20180416662812.html)