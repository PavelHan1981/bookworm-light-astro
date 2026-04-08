---
title: "AAC Audio Codec的Profile及其在不同平台上的支"
slug: "2022-03-03-aac-audio-profile"
description: "本文总结了AAC audio codec的不同profile类型，以及在各种平台上编程设置aac profile的流程。"
date: 2022-03-03T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["音视频","AAC"]
draft: false
---


## AAC简介


AAC：Advanced Audio Codec。


AAC实际上是作为MP3音频编解码算法的继任者出现在历史舞台的。与MP3一样，AAC也是一种有损的音频编解码算法。相比于MP3而言，对于相同的音频数据进行处理，AAC编码出来的音频文件更小，而声音的质量还可以做到更高。


1997年，AAC作为一项国际标准由MPEG组织发布，具体的定义包含在MPEG-2的第7部分，和MPEG-4的第3部分。


## AAC的不同类型（AAC Profile）


AAC-LC：Advanced Audio Codec-Low Complexity。


AAC-HE：Advanced Audio Codec-High Efficiency。


AAC-LD：Advanced Audio Codec-Low Delay。


![Untitled.png](/images/blog/AAC-Audio-Codec的Profile及其在不同平台上的支-1.png)


可以看到，AAC audio codec按照两条独立的路线进行演进，演进的方向总是采用更复杂的技术，从而达到更好的性能指标：

- AAC-LC(MPEG2)—>AAC-LC（MPEG4）—>HE-AAC—>HE-AAC v2—>Extended HE-AAC（xHE）；
    - HE-AAC在AAC-LC的基础上增加了SBR技术；
    - HE-AAC v2在HE-AAC基础上增加了PS技术；
    - Extended HE-AAC则在HE-AAC v2的基础上增加了USAC技术；
- AAC-LD—>AAC-ELD—>AAC-ELD v2；
    - AAC-ELD在AAC-LD的基础上增加了SBR技术；
    - AAC-ELD v2则是在AAC-ELD的基础上增加了Low Delay MPS技术。

**AAC的不同profile版本可以支持向后兼容**。例如，MPEG4 AAC-LC Decoder可以对MPEG2 AAC-LC Encoder编码出来的数据正确解码；而MPEG4 HE-AAC的Decoder可以支持对MPEG2和MPEG4的AAC-LC Encoder编码出来的音频流正确解码。


## 基于FFmpeg实现AAC编码


常用的AAC的开源编解码库是libfdk_aac，libfaac，libaacplus等**。**


下面以libfdk_aac为例说明如何在ffmpeg中进行aac编码的流程。


```c
--enable-libfdk_aac --enable-nonfree --enable-encoder=libfdk_aac
```


编译后使用以下命令测试libfdk_aac是否被正确的编译和链接进来：


```c
ffmpeg -i <input file> -vcodec copy -acodec libfdk_aac -profile:a aac_he <output file>
```


使用以下代码段打开并配置aac codec进行音频编码：


```c
AVCodecContext *encoder_ctx;
encoder_ctx->codec_id           =   AV_CODEC_ID_AAC;
encoder_ctx->sample_fmt         =   AV_SAMPLE_FMT_S16; 
encoder_ctx->profile            =   FF_PROFILE_AAC_HE;//在此处指定aac编码的profile

encoder = avcodec_find_encoder_by_name("libfdk_aac");
// if you still try to open it using avcodec_find_encoder it will open libfaac only.
avcodec_open2(encoder_ctx, encoder, NULL);
```


参考文档4提供了一份更为详细的基于ffmpeg+libfdk_aac进行aac编码的操作说明。


## Android的AAC编解码支持


Android对AAC Codec的支持情况如下图所示：


![Untitled.png](/images/blog/AAC-Audio-Codec的Profile及其在不同平台上的支-2.png)


Android平台下是使用MediaCodec进行音视频Codec的创建和管理。


参考文档5中包含了一份在Android下进行音频麦克风采集+AAC压缩+ADTS流媒体打包封装+AAC解码的完整流程代码。


其中在对MediaCodec编码器进行设置的时候，就通过选项指定AAC-LC profile：MediaCodecInfo.CodecProfileLevel.AACObjectLC


```java
MediaFormat format = MediaFormat.createAudioFormat(MIMETYPE_AUDIO_AAC, SAMPLE_RATE, CHANNEL_COUNT);
format.setInteger(MediaFormat.KEY_AAC_PROFILE, 
MediaCodecInfo.CodecProfileLevel.AACObjectLC
);//在此处指定AAC的profile
format.setInteger(MediaFormat.KEY_BIT_RATE, BIT_RATE);

mMediaCodec = MediaCodec.createEncoderByType(MIMETYPE_AUDIO_AAC);
mMediaCodec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
```


MediaCodecInfo.CodecProfileLevel还能够支持的AAC codec profile包括：


```java
public static final int AACObjectELD=39；//AAC-ELD

public static final int AACObjectERLC=17；
public static final int AACObjectERScalable=20；

public static final int AACObjectHE=5；//HE-AAC


public static final int AACObjectHE_PS=29；//HE-AAC V2


public static final int AACObjectLC=2；//AAC-LC


public static final int AACObjectLD=23；//AAC-LD

public static final int AACObjectLTP=4；
public static final int AACObjectMain=1；
public static final int AACObjectSSR=3；
public static final int AACObjectScalable=6；

public static final int AACObjectXHE=42；//xHE-AAC
```


## iOS的AAC编解码支持


在iOS SDK中使用AudioToolbox中的Audio Converter Services来实现对AAC的编解码。


参考文档7介绍了使用Audio Converter Services实现对PCM转码为AAC并保存的完整代码流程。

- 这篇文档并没有显式设置aac的profile。

在Audio Converter Services框架下，一般使用AudioConverterNew或者AudioConverterNewSpecific接口来创建音频编解码器，这两个接口都需要调用AudioStreamBasicDescription结构体来对音频编解码器的参数进行初始化：


```swift
struct AudioStreamBasicDescription {
    Float64 mSampleRate;        // sample frames per second
    UInt32  
mFormatID
;          // a four-char code indicating stream type
    UInt32  
mFormatFlags
;       // flags specific to the stream type
    UInt32  mBytesPerPacket;    // bytes per packet of audio data
    UInt32  mFramesPerPacket;   // frames per packet of audio data
    UInt32  mBytesPerFrame;     // bytes per frame of audio data
    UInt32  mChannelsPerFrame;  // number of channels per frame
    UInt32  mBitsPerChannel;    // bit depth
    UInt32  mReserved;          // padding
};
typedef struct AudioStreamBasicDescription AudioStreamBasicDescription;
```


当AudioStreamBasicDescription结构体mFormatID设置为kAudioFormatMPEG4AAC表示创建的是一个AAC的编码器，此时就可以使用mFormatFlags来指定这个AAC codec的profile。这种方式下iOS能够支持的AAC profile包括：


```swift
MPEG4ObjectID.aac_Main
MPEG4ObjectID.AAC_LC
MPEG4ObjectID.AAC_SSR
MPEG4ObjectID.AAC_LTP
MPEG4ObjectID.AAC_SBR
MPEG4ObjectID.aac_Scalable
MPEG4ObjectID.twinVQ
MPEG4ObjectID.CELP
MPEG4ObjectID.HVXC
```


此外，也可以在设置AudioStreamBasicDescription结构体的mFormatID的时候，直接把mFormatID初始化为以下列表中的一个aac编码器类型，这样就不需要使用mFormatFlags来指定AAC profile了：


```html
kAudioFormatMPEG4AAC_HE
: MPEG-4 High Efficiency AAC audio object. Uses no flags.

kAudioFormatMPEG4AAC_LD
: MPEG-4 AAC Low Delay audio object. Uses no flags.

kAudioFormatMPEG4AAC_ELD
: MPEG-4 AAC Enhanced Low Delay audio object. Uses no flags.

kAudioFormatMPEG4AAC_ELD_SBR
: MPEG-4 AAC Enhanced Low Delay audio object with SBR (spectral band replication) extension layer. Uses no flags.

kAudioFormatMPEG4AAC_HE_V2
: MPEG-4 High Efficiency AAC Version 2 audio object. Uses no flags.

kAudioFormatMPEG4AAC_Spatial
: MPEG-4 Spatial Audio audio object. Uses no flags.
```


以下为一段初始化audio codec为AAC并设置aac profile的代码：


```swift
func setupAudioConverter() {
        var outputFormat = AudioStreamBasicDescription.init(
            mSampleRate: 44100,
            mFormatID: kAudioFormatLinearPCM,
            mFormatFlags: kLinearPCMFormatFlagIsSignedInteger,
            mBytesPerPacket: 2,
            mFramesPerPacket: 1,
            mBytesPerFrame: 2,
            mChannelsPerFrame: 1,
            mBitsPerChannel: 16,
            mReserved: 0)
        
        var inputFormat = AudioStreamBasicDescription.init(
            mSampleRate: 44100,
            mFormatID: kAudioFormatMPEG4AAC,//此处设置audio codec为aac
            mFormatFlags: UInt32(MPEG4ObjectID.AAC_LC.rawValue),//此处设置aac profile为aac_lc
            mBytesPerPacket: 0,
            mFramesPerPacket: 0,
            mBytesPerFrame: 0,
            mChannelsPerFrame: 1,
            mBitsPerChannel: 0,
            mReserved: 0)
        
        let status: OSStatus =  AudioConverterNew(&inputFormat, &outputFormat, &audioConverter)
        if (status != 0) {
            print("setup converter error, status: \(status)")
        }
    }
```


## 参考资料：

1. [Advanced Audio Coding (AAC) – ViaCorp (via-corp.com)](https://www.via-corp.com/licensing/aac/)
2. [All Tips about AAC (iskysoft.com)](https://videoconverter.iskysoft.com/convert-audio/aac-format.html)
3. [ffmpeg - How to encode audio in AAC-LC, AAC-HE-V1, AAC-HE-V2 using libavcodec? - Stack Overflow](https://stackoverflow.com/questions/18894810/how-to-encode-audio-in-aac-lc-aac-he-v1-aac-he-v2-using-libavcodec)
4. [AAC编码实战 - 简书 (jianshu.com)](https://www.jianshu.com/p/7a8eef6bde3d)
5. [Android音视频之使用MediaCodec编解码AAC - 简书 (jianshu.com)](https://www.jianshu.com/p/14daab91b951)
6. [MediaCodecInfo.CodecProfileLevel  |  Android Developers](https://developer.android.com/reference/android/media/MediaCodecInfo.CodecProfileLevel#AACObjectLC)
7. [iOS 利用 AudioToolbox 将 PCM 编码为 AAC - 博客 - 但江 (danthought.com)](http://blog.danthought.com/programming/2020/07/08/ios-audiotoolbox-audio-converter-services/)
8. [Audio Data Format Identifiers | Apple Developer Documentation](https://developer.apple.com/documentation/coreaudiotypes/coreaudiotype_constants/1572096-audio_data_format_identifiers)
