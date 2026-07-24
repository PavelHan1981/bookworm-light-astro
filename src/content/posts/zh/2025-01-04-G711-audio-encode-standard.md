---
title: "G711音频压缩标准的实现详解"
slug: "2025-01-04-G711-audio-encode-standard"
description: "G.711是ITU-T所定义的一种音频压缩标准，广泛应用于电话通信网络和VoIP领域。在具体的实现上，G711的音频编解码又可以分为u-law（主要应用于北美和日本）和A-law（主要应用于欧洲和世界的其他地方）两种形式，在本文中分别进行说明。"
date: 2025-01-04T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["音视频","Audio"]
draft: false
---


G.711是ITU-T所定义的一种音频压缩标准，广泛应用于电话通信网络和VoIP领域。在具体的实现上，G711的音频编解码又可以分为u-law（主要应用于北美和日本）和A-law（主要应用于欧洲和世界的其他地方）两种形式，在本文中分别进行说明。


G.711在电话通信应用中所定义的采样率是8KHz（**需要明确的一点是，G.711音频编码算法本身并不限制采样率，这里的8KHz采样率是电话通信网络的兼容性要求，因此如果要考虑通话系统中不同厂家的设备之间的兼容性，应该采样标准所定义的8KHz。而如果只是要在通信两端使用G.711对音频数据进行编解码，不需要考虑与其他厂家设备的兼容性的话，完全可以采用更高的采样率。**），音频的每次采样产生一个16bit的采样原始数据，这种情况下原始数据的码率就是8000Hz x 16bit = 128Kbps。G.711音频编码算法对音频采样的原始数据进行编码，每个音频采样的16bit数据会被压缩为8bit，压缩率为2:1，因此针对8KHz的采样率产生出来64Kbps的编码数据。


如上所述，G.711音频编解码算法的具体实现上主要有两种主要的编码方式：μ-law（北美和日本使用）和A-law（欧洲和其他地区使用）。无论是μ-law还是A-law，都是非线性量化方法，在进行音频数据编码时通过对数压缩来优化动态范围，这样可以使得在低音量时具有更高的精度，而在高音量时精度较低。


## G.711 Alaw的理论及其实现


对于音频采样数据进行G.711 Alaw编码和解码的理论公式如下所示。其中A一般采用87.6的常数值，sgn(x)是取符号函数，x为正数时返回1，负数时返回-1；x为音频采样数据在（-1，1）之间的归一化值，即每个16bit音频采样数据的最高位为符号位，在按照下面的公式计算之前先把去掉符号位的15bit数据除以32768，再合并最高位的符号位得到（-1，1）的归一化数据。


编码公式：



![image.png](/images/blog/G711音频压缩标准的实现详解-1.png)


解码公式：



![image.png](/images/blog/G711音频压缩标准的实现详解-2.png)


下图是按照以上公式所画出来的音频采样归一化数据与经过alaw编码后的映射图。可以看到在音频采样值x比较小的时候，它在图中映射对应的F(x)的变化非常剧烈，x的微小变化就会导致F(x)的剧烈变化，因此在采样值较小的情况下，alaw的编码精度比较高。而在采样值比较大的情况下，F(x)的变化幅度就比较小了，采样精度相对也就比较差。



![image.png](/images/blog/G711音频压缩标准的实现详解-3.png)


按照以上所描述的G.711 Alaw音频编码流程的代码实现如下所示：


```c
#include <stdint.h>
#include <math.h>

// 归一化函数
float normalize_16bit_to_float(int16_t sample) {
    return (float)sample / 32768.0f;
}

// A-law量化函数
uint8_t a_law_encode(float sample) {
    const float A = 87.6f;
    float sign = (sample >= 0) ? 1.0f : -1.0f;
    sample = fabs(sample);
    float compressed;
    if (sample < 1.0f / A) {
        compressed = sign * (A * sample) / (1.0f + log(A));
    } else {
        compressed = sign * (1.0f + log(A * sample)) / (1.0f + log(A));
    }
    // 将压缩后的值映射到8位
    return (uint8_t)((compressed + 1.0f) * 127.5f);
}
```


具体的实现中，首先调用normalize_16bit_to_float进行音频采样数据的归一化计算，把16bit采样数据归一化到（-1，1）之间；然后再调用a_law_encode进行编码，编码结果就是一个无符号的单字节数据。


但是如果按照以上公式进行alaw的编解码运算符的话，涉及到log等对数运算，这一点对于之前在电信领域早期的电话系统中硬件资源有限的情况，挑战很大。所以在alaw的具体实现上，为了节约宝贵的计算资源，一般采用十三折线法逼近alaw的理论曲线来降低计算复杂度。十三折线法通过分段线性逼近 A-law 的非线性特性，将输入信号的动态范围划分为多个区间，每个区间用一条直线来近似。这种方法既保留了 A-law 的非线性特性，又大大降低了计算复杂度。


![image.png](/images/blog/G711音频压缩标准的实现详解-4.png)


按照十三折线法进行alaw运算时，16bit音频采样数据首先要通过右移三位变成13bit数据，然后对这个13bit数据进行如下计算分别得到符号位（1bit）、指数部分（3bit）和尾数部分（4bit），最后组合为一个8bit数据：

- 首先取13bit数据的最高位为符号位。将其取反得到s；
- 通过对剩下的12bit数据进行判断，根据其bit1出现的最高位的位置决定指数部分的取值，从0b000-0b111，也就是指数位eee；
- 从12bit数据最高的bit1位置向右取四个bit，也就是尾数位abcd；
- 最后组合符号位、指数位和尾数位这三个部分为seeewxyz，编码完毕。

以上工作逻辑如下图所示：



![image.png](/images/blog/G711音频压缩标准的实现详解-5.png)


以下是从音频采样的16bit数据进行G.711 Alaw压缩的代码片段。


```c
unsigned char linear2alaw(int16_t pcm_sample) {
    int sign, exponent, mantissa;

    // 取符号位
    sign = (pcm_sample < 0) ? 1 : 0;
    pcm_sample = (pcm_sample < 0) ? -pcm_sample : pcm_sample;

    // 归一化：将 16 位 PCM 数据右移 3 位，使其范围适应 13 折线法
    pcm_sample >>= 3;

    // 计算指数部分（段号）
    exponent = 0;
    while ((pcm_sample >> (exponent + 4)) > 0) {
        exponent++;
    }

    // 计算尾数部分（段内偏移）
    mantissa = (pcm_sample >> exponent) & 0x0F;

    // 组合 A-law 编码值
    unsigned char alaw_sample = (sign << 7) | (exponent << 4) | mantissa;

    return alaw_sample;
}
```


## G.711 ulaw的理论及其实现


G.711 ulaw压缩算法主要应用于北美和日本市场，编码的理论公式如下所示：


![image.png](/images/blog/G711音频压缩标准的实现详解-6.png)

- 进行以上计算之前，仍然要像alaw一样，先把16bit采样数据归一化到（-1，1）之间。
- 以上计算公式的输入为归一化到（-1，1）之间的16bit音频采样数据，输出则是音频采样压缩生成的8bit编码数据。

解码的公式如下图所示：


![image.png](/images/blog/G711音频压缩标准的实现详解-7.png)

- 以上计算公式的输入为G.711编码生成的8bit压缩数据，输出为（-1，1）区间范围的解码数据，具体要进行播放时需要重新映射为16bit的音频采样数据，通过audio codec播放出来。

在G.711 uLaw的具体实现上，与alaw的实现类似，同样采用折线法来逼近uLaw的曲线以减少计算的工作量。不同的是，alaw采用十三折线法，进行折线计算的数据是音频采样右移三位的13bit数据；而ulaw采用十五折线法，进行alaw的折线计算时首先对音频采样数据右移二位变成14bit数据。


十五折线法实现的流程可以基于下表来使用查表的方式来实现：


![image.png](/images/blog/G711音频压缩标准的实现详解-8.png)


以音频采样数据经过右移2位后数据是1234为例，解释十五折线法具体的查表实现流程如下：

- 首先通过查询上表取得区间范围值，查表可以得到1234位于以下区间： `+2014 to +991 in 16 intervals of 64`
- 根据以上的区间范围值得到其基础值为0xA0，间隔数interval为64
- 以上区间范围的初始值为2014，再当前值1234和区间范围初始值的差异为2014-1234=780
- 基于以上的差异值计算偏移值：780/间隔数=780/64，取整得到12
- 最终得到的输出为0xA0+12=0xAC。

可参考以下代码实现：


```c
#include <stdint.h>
#include <stdio.h>

#define BIAS 0x84  // μ-law 偏移量
#define CLIP 8159  // 最大量化级数量

static int seg_uend[8] = {0x3F, 0x7F, 0xFF, 0x1FF, 0x3FF, 0x7FF, 0xFFF, 0x1FFF};

// 查找段号
static int search(int val, int *table, int size) {
    int i;
    for (i = 0; i < size; i++) {
        if (val <= table[i]) {
            return i;
        }
    }
    return size;
}

// μ-law 编码函数
unsigned char linear2ulaw(int16_t pcm_sample) {
    int mask, seg, uval;

    // 右移 2 位，保留高 14 位数据
    pcm_sample = pcm_sample >> 2;

    // 符号位处理
    if (pcm_sample < 0) {
        pcm_sample = -pcm_sample;  // 负数取绝对值
        mask = 0x7F;               // 符号位为 0
    } else {
        mask = 0xFF;               // 符号位为 1
    }

    // 限制最大值
    if (pcm_sample > CLIP) {
        pcm_sample = CLIP;
    }

    // 添加偏移量
    pcm_sample += (BIAS >> 2);

    // 查找段号
    seg = search(pcm_sample, seg_uend, 8);

    // 组合编码值
    if (seg >= 8) {
        return (0x7F ^ mask);  // 超出范围，返回最大值
    } else {
        uval = (seg << 4) | ((pcm_sample >> (seg + 1)) & 0xF);
        return (uval ^ mask);  // 添加符号位
    }
}
```


## 总结

- 无论是G.711a还是G.711u，实际上都是一种对于单个音频采样数据进行压缩的算法，两者在压缩的实现原理上，都是在小信号区域提供更高的量化精度，而在大信号区域减少量化精度，从而在有限的比特率下实现高效的语音编码。
- 尽管在电话领域中所采用的G.711音频编码要求固定的使用8K采样率（采样率固定为8K，码率固定为64Kbps），但是实际上对于G.711算法本身的实现而言，因为它是对单个音频采样数据进行的编码处理，算法本身对采样率并没有特定的要求。这里的8K采样率的要求只不过是为了满足音频通话的需求（4KHz对于大多数音频通话而言足够使用了），较低的采样率也意味着较低的计算工作量，所以通话双方都采用8KHz来进行采样和编解码的话兼容性就没有问题。而如果音频通信的两端能够通过其他机制自动识别采样率的话，使用G.711编码时完全可以采用更高的采样率，例如16KHz、32KHz等，只不过这样的话码率就会大一些。
- 至于alaw和ulaw计算中所采用的十三折线法或者十五折线法，同样是基于减少计算工作量的角度出发，采样折线拟合的方式去逼近alaw和ulaw的对数曲线，这一点与二三十年前电信通信领域中所采用的处理器具备的计算能力不足相关。如果处理器的计算资源不是瓶颈的话，直接采用对数运算来进行G.711编码当然也是没有任何问题。

## 参考资料

- [音频处理——G711标准详解_g711a和g711u区别-CSDN博客](https://blog.csdn.net/qq_28258885/article/details/120215750)
- [A律十三折线法G711编解码介绍_13折线a律编码-CSDN博客](https://blog.csdn.net/jackzhouyu/article/details/108140976)
- [G.711编码原理 - 简书](https://www.jianshu.com/p/512ce6566f8a)
