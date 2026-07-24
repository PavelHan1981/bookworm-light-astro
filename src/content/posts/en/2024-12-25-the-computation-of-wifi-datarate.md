---
title: "Computation of Maximum Data Rates Across Different WiFi Standards"
slug: "2024-12-25-the-computation-of-wifi-datarate"
description: "This article compiles the list of maximum supported data rates across various WiFi standards and explains how these theoretical data rates are calculated."
date: 2024-12-25T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["WiFi"]
tags: ["WiFi"]
draft: false
---

Below is a calculation and compilation of the theoretical maximum communication data rates supported by WiFi standards under various OFDM modulation schemes.

## Formula for Calculating WiFi Data Rates

![image.png](/images/blog/WiFi不同制式下最大速率的计算-1.png)

- $T_{DFT}$ is the duration of an OFDM subcarrier modulated symbol. $T_{GI}$ is the guard interval added between consecutive symbols, used to protect against mutual interference between them. Therefore, $T_{DFT} + T_{GI}$ is the actual period of the symbols transmitted on each subcarrier.
- $N_{SS}$ is the number of spatial streams, simply put, the number of antennas that can be used simultaneously to transmit different data in communication. This is related to MIMO support.
- $N_{SD, U}$ refers to the number of subcarriers used for OFDM modulation, including only the subcarriers utilized for data transmission and excluding various channel protection subcarriers. It is related to the subcarrier spacing defined by different WiFi standards and the supported channel bandwidths (20/40/80/160 MHz).
- $N_{BPSCS, U}$ refers to the number of bits each symbol can transmit. For example, QAM16 can transmit 4 bits of data per symbol, while QAM256 can transmit 8 bits of data per symbol.
- $R$ is the coding rate, which is the ratio of valid data transmitted through the channel to the actual data transmitted (which also includes some error-correcting codes, etc.). For example, a coding rate of 3/4 means that for every 4 bits of data sent, 3 bits are actual valid data and 1 bit is error-correction data.

## 802.11a/g

802.11g utilizes OFDM. In 802.11g mode, it only supports 2.4 GHz channels with a 20 MHz bandwidth. Its OFDM contains a total of 52 subcarrier channels, of which 48 are used for data transmission.

In the 802.11g standard, $T_{DFT}$ (the symbol duration) is 3.2 µs, and the symbol guard interval $T_{GI}$ is 0.8 µs.

The rate types supported by 802.11g include:

![image.png](/images/blog/WiFi不同制式下最大速率的计算-2.png)

Taking 802.11g's highest QAM64 modulation mode as an example for calculation: the number of data bits contained per symbol is 6 bits, the coding rate is 3/4, and the number of antennas is 1. The highest data rate it can support is: (48 subcarriers * 6 bits * 3/4 * 1 antenna) / (3.2 µs + 0.8 µs) = 54 Mbps.

## 802.11n

802.11n utilizes OFDM and introduces support for MIMO, supporting up to 4T4R (4 spatial streams), meaning it can support 4 antennas transmitting data outward.

In addition to the default 20 MHz channel bandwidth, 802.11n also begins supporting a 40 MHz bandwidth, and supports both 0.8 µs and 0.4 µs guard intervals under both 20 MHz and 40 MHz bandwidths.

- Under 20 MHz bandwidth, the number of subcarriers increases from the previous 52 to 56, with 52 subcarrier channels available for data transmission.
- Under 40 MHz bandwidth, there are a total of 114 subcarrier channels, of which 108 are available for data transmission.

![1735114283629.png](/images/blog/WiFi不同制式下最大速率的计算-3.png)

Under the condition of a single antenna (1x1 single spatial stream), adopting MCS7, with QAM64 modulation mode, each OFDM symbol can carry 6 bits of data, and the transmission coding rate is 5/6:

- Maximum rate at 20 MHz bandwidth + 0.8 µs guard interval: (52 subcarriers * 6 bits * 5/6 * 1 antenna) / (3.2 µs + 0.8 µs) = 65 Mbps
- Maximum rate at 20 MHz bandwidth + 0.4 µs guard interval: (52 subcarriers * 6 bits * 5/6 * 1 antenna) / (3.2 µs + 0.4 µs) = 72.2 Mbps
- Maximum rate at 40 MHz bandwidth + 0.8 µs guard interval: (108 subcarriers * 6 bits * 5/6 * 1 antenna) / (3.2 µs + 0.8 µs) = 135 Mbps
- Maximum rate at 40 MHz bandwidth + 0.4 µs guard interval: (108 subcarriers * 6 bits * 5/6 * 1 antenna) / (3.2 µs + 0.4 µs) = 150 Mbps

**Therefore, under a single-stream condition, the maximum data transmission rate that 802.11n can achieve is 150 Mbps.**

![1735114937730.png](/images/blog/WiFi不同制式下最大速率的计算-4.png)

Taking the maximum 4T4R supported by 802.11n (i.e., MCS31) where the modulation mode is QAM64, one OFDM symbol can transmit 6 bits of data, and the transmission coding rate is 5/6:

- Maximum rate achievable at 40 MHz bandwidth + 0.4 µs guard interval: (108 subcarriers * 6 bits * 5/6 * 4 antennas) / (3.2 µs + 0.4 µs) = 600 Mbps.

Therefore, under the maximum four spatial streams supported by 802.11n, the maximum data transmission rate that 802.11n can achieve is 600 Mbps.

## 802.11ac

802.11ac is also known as WiFi 5. Compared to WiFi 4 (802.11n), the biggest changes are:

- In terms of MIMO, it upgrades from WiFi 4's 4T4R to a maximum of 8T8R.
- The modulation scheme upgrades from WiFi 4's maximum QAM64 to QAM256, allowing each OFDM symbol to transmit 8 bits of data.
- The channel bandwidth upgrades from WiFi 4's supported 20/40 MHz to 20/40/80/160 MHz bandwidths, supporting a single-channel 160 MHz bandwidth in the 5 GHz band at maximum.
    - Under 20 MHz bandwidth, there are 56 subcarriers, of which 52 can be used for data transmission.
    - Under 40 MHz bandwidth, there are 114 subcarriers, of which 108 can be used for data transmission.
    - Under 80 MHz bandwidth, there are 242 subcarriers, of which 234 can be used for data transmission.
    - Under 160 MHz bandwidth, there are 484 subcarriers, of which 468 can be used for data transmission.

![1735115611007.png](/images/blog/WiFi不同制式下最大速率的计算-5.png)

Under a single-stream condition, supporting a maximum QAM256 modulation scheme where one symbol can accommodate 8 bits of data, the maximum transmission rate achievable at 160 MHz channel bandwidth + 400 ns guard interval is: (468 subcarriers * 8 bits * 5/6 * 1 antenna) / (3.2 µs + 0.4 µs) = 866 Mbps.

![image.png](/images/blog/WiFi不同制式下最大速率的计算-6.png)

Similarly, calculating for the maximum 8 spatial streams supported by 802.11ac, the maximum transmission rate achievable is: (468 subcarriers * 8 bits * 5/6 * 8 antennas) / (3.2 µs + 0.4 µs) = 6928 Mbps.

## 802.11ax

802.11ax is the so-called WiFi 6.

The period of an 802.11ax OFDM symbol differs significantly from the previous generations:

- From 802.11g all the way to 802.11ac, the OFDM symbol period is always 3.2 µs, the guard interval is 0.4/0.8 µs, and the subcarrier spacing is 312.5 kHz.
- However, starting with 802.11ax, the OFDM symbol period becomes 12.8 µs, the guard interval is 0.8/1.6/3.2 µs, and the subcarrier spacing is 78.125 kHz.

Because the subcarrier spacing has changed, the number of subcarriers under different channel bandwidth modes is also affected:

- In HT20 mode, there are 234 subcarriers actually available for data transmission.
- In HT40 mode, there are 468 subcarriers actually available for data transmission.
- In HT80 mode, there are 980 subcarriers actually available for data transmission.
- In HT160 mode, there are 1960 subcarriers actually available for data transmission.

In addition, the maximum modulation scheme supported by 802.11ax is also upgraded from QAM256 to QAM1024, where one symbol can accommodate 10 bits of data.

![1735120986990.png](/images/blog/WiFi不同制式下最大速率的计算-7.png)

With MCS11 under a single spatial stream, adopting the QAM1024 modulation scheme, where one symbol carries a maximum of 10 bits of data, a coding rate of 5/6, at 160 MHz bandwidth, and using a 0.8 µs guard interval, the maximum single-stream transmission rate achievable is: (1960 subcarriers * 10 bits * 5/6 * 1 antenna) / (12.8 µs + 0.8 µs) = 1200.98 Mbps.

![1735121257522.png](/images/blog/WiFi不同制式下最大速率的计算-8.png)

By the same token, under the maximum 8 spatial streams supported by 802.11ax, the maximum data transmission rate it can support is calculated as: (1960 subcarriers * 10 bits * 5/6 * 8 antennas) / (12.8 µs + 0.8 µs) = 9607.843 Mbps.

## References

- [802.11gnacax Theoretical Speed Calculation - Baidu Wenku](https://wenku.baidu.com/view/a082153dff4ffe4733687e21af45b307e971f95d.html?_wkts_=1735094198478&bdQuery=802.11ax%20MSC11%20286.8Mbps)
- [802.11 WiFi In-Depth Series Articles [10] - Theoretical Data Rate - Zhihu](https://zhuanlan.zhihu.com/p/623867190)
- [802.11a/b/g/n/ac Rate Table - OpenWrt Developer Home](https://www.openwrt.pro/post-513.html)
- [[Wi-Fi] 802.11/802.11b/802.11g/802.11n/802.11a/802.11ac/802.11ax/802.11be WiFi Rate Comparison Table - CSDN Blog](https://blog.csdn.net/wgl307293845/article/details/130640502)