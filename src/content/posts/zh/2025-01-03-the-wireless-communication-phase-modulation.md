---
title: "基础相位调制技术之BPSK/QPSK/DQPSK"
slug: "2025-01-03-the-wireless-communication-phase-modulation"
description: ""
date: 2025-01-03T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["无线通信"]
tags: ["无线通信"]
draft: false
---


BPSK、QPSK等几种对相位进行调制的载波调制方式，是目前在无线通信中使用非常广泛的调制方式。在各个WiFi标准中所包含的低规格MCS，基本上都是使用BPSK、QPSK等相位调制方式。


![1736407097077.png](/images/blog/基础相位调制技术之BPSK-QPSK-DQPSK-1.png)


## BPSK: **Binary Phase Shift Keying**


BPSK是最简单的相位调制方式，其中的Binary就表示使用相位0度和相位180度分别代表逻辑0和逻辑1。也就是说，BPSK每一组载波传输一个bit的基带数据信息。


在BPSK的具体实现上，逻辑0和逻辑1，或者是相位0度和相位180度，就是把作为载波的正弦波乘以+1或者乘以-1来进行操作。如下图所示：


![image.png](/images/blog/基础相位调制技术之BPSK-QPSK-DQPSK-2.png)


但是在具体的实现上，还是有一些细节问题需要考虑：在经过BPSK调制以后的载波发射过程中，载波应该在哪个相位切换？例如在在下图中，如果在载波幅度处于最高时立即切换到其载波的最低幅度，就会产生所谓的high slop transition的问题：载波幅度的剧烈变化会辐射出高频能量到其他频段，从而对其他频段的通信造成干扰，因此载波的幅度变化应该尽量平缓，尽可能避免这种high slop transition现象。


![image.png](/images/blog/基础相位调制技术之BPSK-QPSK-DQPSK-3.png)


比较合理的做法就是在载波幅度过零点的位置进行相位变换，这样的话，在基带信号的0和1发生变换时，载波的幅度就不会发生跳变从而导致高频能量的散射。


![image.png](/images/blog/基础相位调制技术之BPSK-QPSK-DQPSK-4.png)


## QPSK: Quadrature Phase Shift Keying 


在BPSK的调制中，每一组载波传输一个bit的基带数据，而QPSK则可以通过一组载波传输两个bit的数据。因此对于QPSK调制模式下的每一组载波而言，也就可以对应传输以下四组基带信息之一：00，01，10，11。每一组对应于载波的不同相位，各组载波相位的差异是90度：45度，135度，225度，315度。


![image.png](/images/blog/基础相位调制技术之BPSK-QPSK-DQPSK-5.png)


QPSK相比BPSK最大的好处，当然就是更高的传输速率：如果保持载波和基带信号的频率不变，因为QPSK的一组载波比BPSK的一组载波携带的基带数据量增大了一倍，那么在相同条件下也就意味着其实际上的数据传输速率提高了一倍。而其代价则是，QPSK系统的复杂性更高。


### QPSK的high slop transition问题


从上图可以看到，在45度和135度这两组载波切换时载波的幅度不会发生跳变，但是在后面的135到225度这两组载波切换的时候，明显的会发生载波幅度的跳变问题，也就是上面所说的high slop transition的问题，这个问题没法简单的使用BPSK在过零点进行切换的策略来解决（因为QPSK的相位差是90度而不是180度），所以就需要有其他办法来应对这个问题。解决这个问题的办法之一就是采用Offset QPSK, π/4-QPSK，或者类似MSK/MFSK的做法，基本的逻辑都是在两组连续的载波之间增减一定的延迟时间来尽可能避免载波的幅度发生过大的跳变。


## DQPSK: Differential QPSK


PSK在解调端存在的问题是，其解调判断的难度相比FSK要大。对于FSK的解调而言，只需要测量载波的频率就能知道其调制的基带信息是0还是1，但是对于PSK而言，0和1的差异存在于初始相位中，那么如果调制端和解调端的初始相位不同步或者是稍有差异，都可能会影响PSK解调的判断。为了应对调制端和解调端载波相位可能不同步所存在的问题，DQPSK也就是差分QPSK应运而生。


对于PSK的解调而言，接收端在接收到射频信号以后，接收端端解调用的载波和发送端进行PSK调制所使用的载波必须要严格的同频同相位，才能成功正确的解调出来载波上承载的基带信号，如果两端的载波相位有差异的话，解调就会出现误判的情况。因此，PSK的解调依赖的是对接收信号的绝对相位进行的判断。


而如果采用DQPSK进行调制和解调的话，就不再依赖于对绝对相位的判断，因此只要保证发送信号的调制端载波和接收信号的解调端载波的频率一致即可，不需要两端的载波相同相位。**DQPSK对于每一组载波的解调依赖的不是对其绝对相位进行判断，而是依赖于这一组载波与上一组载波在相位上的差异和变化（这就是Differential的由来）**。也就是说，每一组载波上携带的基带信息，取决于这一组载波跟前一组载波相位的差异，例如如果两组载波相位没有差异，表示当前这组载波携带的基带数据是0b00，如果前后两组的相位差异是90度，则当前这组载波的基带数据是0b01，以此类推。按照这种方式进行调制和解调，就可以解决DPSK要求调制和解调载波严格同频同相位的问题。


![image.png](/images/blog/基础相位调制技术之BPSK-QPSK-DQPSK-6.png)


## 参考资料

- [Digital Phase Modulation: BPSK, QPSK, DQPSK | Radio Frequency Modulation | Electronics Textbook](https://www.allaboutcircuits.com/textbook/radio-frequency-analysis-design/radio-frequency-modulation/digital-phase-modulation-bpsk-qpsk-dqpsk/)
