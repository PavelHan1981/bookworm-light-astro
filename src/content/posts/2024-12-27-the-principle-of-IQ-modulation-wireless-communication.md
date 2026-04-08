---
title: "无线数字通信之IQ调制工作原理"
slug: "2024-12-27-the-principle-of-IQ-modulation-wireless-communication"
description: "本文详细解释了无线通信中非常常用的IQ调整的信号，其调制的工作原理和流程，以及在无线通信中使用所具备的优势。"
date: 2024-12-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Tech"]
tags: ["无线通信"]
draft: false
---


IQ调制是BPSK、QPSK、QAM16，QAM64、QAM256等在LTE和WiFi领域应用非常广泛的各种高阶调制方式的基础，理解了IQ调制的工作原理，才能够更好的理解LTE以及WiFi底层的OFDM实现机制。因为在OFDM的各个子载波上，最后采用的调制方式仍然是基于IQ调制的各种QAM调制技术，而且本质上，OFDM的实现就是在多路相互正交的子载波上进行的IQ调制的叠加。


## IQ调制中的I和Q与IQ调制解调的基本工作原理


IQ调制概念中的I和Q分别对应于两个英文单词的缩写：In-Phase（同相）和Quadrature（正交）。单纯从字面意义上看的话，I和Q两个信号的命名没有任何意义，什么是同相？什么是正交？以什么信号作为参考来判断同相和正交？在具体的实现上，一般是使用一组同频的余弦和正弦波作为I信号和Q信号，那么作为I信号的余弦信号实际上就是参考信号，其本身当然就是同相（In-Phase）信号，而与其同频相差90度的余弦信号自然就是它的正交（Quadrature）信号。所以对于IQ调制信号的理解，最简单的就是可以认为I信号就是余弦载波信号，Q信号则是与I信号同频相差90度的正弦载波信号。


而所谓的IQ调制，就是使用一组同频率的I信号即余弦信号和Q信号即正弦信号（相位相差90度，相互正交）作为载波，向两个载波同时调制两路基带信号，然后把调制后生成的两路信号叠加在一起通过RF电路发射出去。接收端接收到射频信号以后执行IQ解调，在IQ解调的执行过程中，因为两路载波之间是相互正交的，也就可以基于之前调制过程中使用的I和Q载波信号分别把两路基带信号从混合信号中分离出来，单独执行解调。这就是IQ调制和解调的基本工作原理。


下图是IQ调制的基本工作原理。


![ee99c85f-ade9-42ba-ae2b-a824ca2db813.png](/images/blog/无线数字通信之IQ调制工作原理-1.png)

- 进行IQ调制之前，基带的数字序列信号被按顺序分为两路独立的基带调制信号：I基带信号和Q基带信号。然后I基带和Q基带分别送入I载波信号（余弦）和Q载波信号（正弦）进行调制，再把两路调制信号通过加法器叠加在一起生成IQ调制后的信号，通过RF模块和天线发射出去。

下图是IQ解调的基本工作原理。


![29c82b40-f4af-4083-ab19-f3acf7b1b74c.png](/images/blog/无线数字通信之IQ调制工作原理-2.png)

- 接受端的天线和RF电路接收到射频信号后，把这个射频信号分别基于与调制信号相同的I信号和Q信号分别执行解调，恢复出来独立的I基带信号和Q基带信号。

## I信号与Q信号的叠加


**IQ调制的关键就在于对I信号和Q信号进行叠加所产生的幅度和相位上变化的效果。**


例如下图是相同幅度的I信号和Q信号的叠加结果：桔色为余弦I信号，蓝色为正弦Q信号，两者幅度相同，叠加所生成的就是图中的红色信号。


![image.png](/images/blog/无线数字通信之IQ调制工作原理-3.png)


可以看到，相同幅度的I信号和Q信号叠加所生成信号的相位在I信号和Q信号之间，相对于I信号而言相位是45度。


而如果调高或者调低I信号和Q信号的幅度，则不光会改变调制生成信号的幅度，而且还会相应的改变调制生成信号的相位。


例如在下图中，把I信号（桔色）的幅度设置为2，Q信号（蓝色）的幅度仍然保持为1，那么I信号和Q信号两个信号叠加所产生的调制信号（红色）的幅度稍大于I信号，相位也会向I信号的方向偏移。


![image.png](/images/blog/无线数字通信之IQ调制工作原理-4.png)


另一方面，如果把I信号（桔色）的幅度保持为1，Q信号（蓝色）的幅度增大到为2，那么两者叠加所产生的IQ调制信号（红色）的幅度稍大于Q信号，相位则向Q信号靠拢。


![image.png](/images/blog/无线数字通信之IQ调制工作原理-5.png)


**因此结论就是，对于IQ调制的I信号和Q信号的双方而言，提高一方的相对幅度大小，不光会提升调制信号的幅度，而且会导致调制信号的相位向幅度增大的一方偏移。所以本质上，IQ调制分别是在I信号和Q信号上进行的幅度调制，但是调制的结果不光会影响调制生成信号的幅度，还会影响其相位的变化。**


但是，以上图片中I信号和Q信号的幅度无论如何变化和组合，其叠加后生成的IQ调制信号的相位肯定是在I信号的0度和Q信号的90度之间变化，如何实现调制信号的相位在0度到360度之间变化呢？例如QPSK，QAM16以及更高阶的QAM调制的相位都是在0-360之间变化的。


## 以QPSK解释IQ调制的相位变化


所谓的QPSK，是指一次调制可以完成两个bit基带信息在载波信息上的传输，两个bit的四种组合（00，01，10，11）分别对应于相位调制的45度，135度，225度和315度。


下图是一个QPSK调制器的框图：


![image.png](/images/blog/无线数字通信之IQ调制工作原理-6.png)

- 首先基带信号的数字序列以两个bit为单位进行划分，每次向QPSK调制器送入两个bit的信息，1个bit调制到I信号上，另外1个bit信号调制到Q信号上。上图的Local Oscillator所产生的载波信号就是I载波信号，把I载波信号经过90度相位偏移处理后就是Q信号，作为两个bit的基带信号的调制信号。
- 两个基带bit信号分别通过乘法器调制到其对应的载波信号以后（本质上就是两路独立的幅度调制处理），再把两路载波信号进行叠加处理，所生成的就是QPSK调制信号，通过RF和天线发射出去。

在进行以上QPSK调制的过程中，本质上就是在I路和Q路分别进行幅度调制处理。在这个幅度调制处理的过程中，如果限制基带信号只能为0和正数的话，这个幅度调制实际上就成了OOK，那么I路和Q路叠加的相位偏移量就只能在0-90度之间。而如果把基带的位序列映射处理，进行幅度调制时可以支持负数的话（所谓的负数，实际上就是把I信号和Q信号做180度反向处理而已），那么I路和Q路的幅度调制根据其正负关系就存在以下四种种情况。


### I路和Q路都是正数幅度调制


跟前文所描述的逻辑相同，IQ调制生成信号的相位在0到90度之间变化。对于QPSK而言，对应的调制关系是I=1，Q=1，其相位为45度。


![image.png](/images/blog/无线数字通信之IQ调制工作原理-7.png)


### I路正数幅度调制，Q路负数幅度调制


这种情况下，I路的相位没有发生变化，Q路的相位发生了180度变化，由此导致的IQ调制生成信号的幅度在270度到360度之间变化。对于QPSK而言，对应的调制关系是I=1，Q=-1，其相位为315度。


![image.png](/images/blog/无线数字通信之IQ调制工作原理-8.png)


### I路负数数幅度调制，Q路正数幅度调制


这种情况下，I路的相位发生了180度变化，Q路的相位没有发生变化，由此导致的IQ调制生成信号的幅度在90度到180度之间变化。对于QPSK而言，对应的调制关系是I=-1，Q=1，其相位为135度。


![image.png](/images/blog/无线数字通信之IQ调制工作原理-9.png)


### I路负数数幅度调制，Q路负数幅度调制


这种情况下，I路和Q路的相位都发生了180度变化，由此导致的IQ调制生成信号的幅度在180度到270度之间变化。对于QPSK而言，对应的调制关系是I=-1，Q=-1，其相位为225度。


![image.png](/images/blog/无线数字通信之IQ调制工作原理-10.png)


**因此对于QPSK也好，对于各种QAM也好，最后就是通过把基带的位序列映射为在I路和Q路上进行幅度调制的正数或者负数幅度，由此实现了360度的相位调制。**


## 参考资料

- [Understanding I/Q Signals and Quadrature Modulation | Radio Frequency Demodulation | Electronics Textbook](https://www.allaboutcircuits.com/textbook/radio-frequency-analysis-design/radio-frequency-demodulation/understanding-i-q-signals-and-quadrature-modulation/)
- [IQ调制为什么叫 I 和 Q？IQ调制是怎么工作的? IQ调制信号必须用IQ解调吗？IQ调制原理](http://www.360doc.com/content/24/0911/20/23557534_1133750877.shtml)
- [Digital Phase Modulation: BPSK, QPSK, DQPSK | Radio Frequency Modulation | Electronics Textbook](https://www.allaboutcircuits.com/textbook/radio-frequency-analysis-design/radio-frequency-modulation/digital-phase-modulation-bpsk-qpsk-dqpsk/)
- [Understanding Quadrature Demodulation | Radio Frequency Demodulation | Electronics Textbook](https://www.allaboutcircuits.com/textbook/radio-frequency-analysis-design/radio-frequency-demodulation/understanding-quadrature-demodulation/)
