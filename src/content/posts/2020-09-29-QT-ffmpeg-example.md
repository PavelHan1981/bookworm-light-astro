---
title: "最简单的基于QT+ffmpeg的播放器的例子"
slug: "2020-09-29-QT-ffmpeg-example"
description: "本文总结了一个使用QT进行ffmpeg进行播放器开发的一个简单例子。"
date: 2020-09-29T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["ffmpeg","QT"]
draft: false
---


## **前提条件：**

- 基于[搭建基于QT Creator的ffmpeg开发环境](https://www.pavelhan.tech/2020-09-24-qt-creator-ffmpeg)在Windows环境中完成QT Creator++ffmpeg的开发环境，能够在QT Creator中正常的调用ffmpeg library中的接口得到正确的结果。

## **UI准备：**

- 在QT Creator中新建一个QT Wigets Application工程，修改其页面类的base class为QWidget；
- 在工程的Forms中修改页面的ui文件，放一个pushButton和一个Label，播放器解码后的图像将会在Label的Pixmap中显示出来；

![Untitled.png](/images/blog/最简单的基于QT+ffmpeg的播放器的例子-1.png)


## **主要代码流程：**


```c++
// 延时函数，以ms为单位，不会阻塞UI操作
void delay(int msec)
{
    QTime dieTime = QTime::currentTime().addMSecs(msec);
    while( QTime::currentTime() < dieTime )
        QCoreApplication::processEvents(QEventLoop::AllEvents, 100);
}

void Widget::on_playButton_clicked()
{
//#define USE_OLD_DECODE_MODE 1
    int ret = -1;
    int videoStreamIndex = -1;
    char * filename="D:\\video.mp4";
    AVFormatContext * pFormatContext = NULL;
    AVCodecContext * pCodecContext = NULL;
//    AVCodecParameters * pCodecParameters = NULL;
    AVCodec * pCodec = NULL;
    AVFrame * pFrame = NULL;
    AVFrame * pFrameRGB = NULL;
    AVPacket * pPacket = NULL;
    unsigned char *out_buffer = NULL;
    struct SwsContext * pSwsContext = NULL;
    int displayWidth = ui->label->width();
    int displayHeight = ui->label->height();

    //av_register_all();//该函数已经过时，直接删除

    if(avformat_open_input(&pFormatContext, filename, 0, 0) != 0){
        qDebug() << "Couldn't open input stream.";
        return;
    }
    qDebug() << "Video Duration:" << pFormatContext->duration / AV_TIME_BASE << " secs";

    //查看这个媒体文件中是否包含有媒体信息；
    if (avformat_find_stream_info(pFormatContext, 0) < 0){
        qDebug() << "Couldn't find stream information.\n";
        avformat_close_input(&pFormatContext);
        return;
    }

    //找到这个媒体文件中包含的第一条视频流对应的索引
    for (int i = 0; i < (int)pFormatContext->nb_streams; i++)
    {
        //streams[i]->codec已经过时，更换为codecpar
        //if (pFormatContext->streams[i]->codec->codec_type == AVMEDIA_TYPE_VIDEO) // 判断是否为视频流
        if(pFormatContext->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_VIDEO)
        {
            videoStreamIndex = i;
            break;
        }
    }
    if (videoStreamIndex == -1)
    {
        qDebug() << "Didn't find a video stream.\n";
        avformat_close_input(&pFormatContext);
        return ;
    }

    // 查找视频解码器
    pCodecContext = pFormatContext->streams[videoStreamIndex]->codec; // 获取视频流编码结构
    //pCodecParameters = pFormatContext->streams[videoStreamIndex]->codecpar;
    pCodec = avcodec_find_decoder(pCodecContext->codec_id);
    //pCodec = avcodec_find_decoder(pCodecParameters->codec_id);
    if (pCodec == nullptr)
    {
        qDebug() << "Codec not found.\n";
        return ;
    }

    //使用图像的原尺寸显示，还是使用label的大小进行显示，默认自动缩放到label的大小进行显示；
    //displayWidth = pCodecContext->width;
    //displayHeight = pCodecContext->height;

    // 打开解码器
    if (avcodec_open2(pCodecContext, pCodec, nullptr) < 0)
    {
        qDebug() << "Could not open codec.\n";
        return ;
    }

    // 打印媒体信息
    qDebug() << "--------------- File Information ----------------\n";
    av_dump_format(pFormatContext, 0, filename, 0); // 此函数打印输入或输出的详细信息
    qDebug() << "-------------------------------------------------\n";

    //申请两个AVFrame结构，其中pFrame用户承载解码后的YUV数据，pFrameRGB用于承载显示的RGB数据
    pFrame = av_frame_alloc();
    pFrameRGB = av_frame_alloc();
    //申请一个AVPacket结构，用于承载从视频文件中读取的一个图像帧的压缩包
    pPacket = (AVPacket *)av_malloc(sizeof(AVPacket));

    //为pFrameRGB需要用到的内存申请空间，pFrame用到的内存会在解码的时候在解码接口中自动分配
    out_buffer = (unsigned char *)av_malloc((size_t)av_image_get_buffer_size(AV_PIX_FMT_RGB32, \
                                               displayWidth, displayHeight, 1));
    av_image_fill_arrays(pFrameRGB->data, pFrameRGB->linesize, out_buffer, \
            AV_PIX_FMT_RGB32, displayWidth, displayHeight, 1);

    //初始化YUV-->RGB的格式转换/缩放器
    pSwsContext = sws_getContext(pCodecContext->width, pCodecContext->height, pCodecContext->pix_fmt,
            displayWidth, displayHeight, AV_PIX_FMT_RGB32, SWS_BICUBIC, nullptr, nullptr, nullptr);

    //反复的从视频文件中读一个packet并进行解码显示
    while (av_read_frame(pFormatContext, pPacket) >= 0)
    {
#ifdef USE_OLD_DECODE_MODE  //旧解码方式
        if (pPacket->stream_index == videoStreamIndex)
        {
            int got_picture = -1;

            ret = avcodec_decode_video2(pCodecContext, pFrame, &got_picture, pPacket);
            if (ret < 0)
            {
                qDebug() << "Decode Error.\n";
                goto out;
            }
            if (got_picture)
            {
                sws_scale(pSwsContext, (const unsigned char* const*)pFrame->data, pFrame->linesize, 0, pCodecContext->height,
                                       pFrameRGB->data, pFrameRGB->linesize);
                QImage img((uchar*)pFrameRGB->data[0],displayWidth,displayHeight,QImage::Format_RGB32);
                ui->label->setPixmap(QPixmap::fromImage(img)); // 在label上播放视频图片
                delay(30);
            }
        }
        av_free_packet(pPacket);
#else   //新解码方式
        if (pPacket->stream_index == videoStreamIndex)
        {
            ret = avcodec_send_packet(pCodecContext,pPacket);
            if (ret < 0)
            {
                qDebug() << "Decode Error1:" << ret;
                goto out;
            }

            //avcodec_send_packet和avcodec_receive_frame调用关系并不一定是一对一的，比如一些音频数据一个AVPacket中包含了1秒钟的音频，
            //调用一次avcodec_send_packet之后，可能需要调用25次 avcodec_receive_frame才能获取全部的解码音频数据
            while( avcodec_receive_frame(pCodecContext, pFrame) == 0)
            {
                sws_scale(pSwsContext, (const unsigned char* const*)pFrame->data, pFrame->linesize, 0, pCodecContext->height,
                                   pFrameRGB->data, pFrameRGB->linesize);
                QImage img((uchar*)pFrameRGB->data[0],displayWidth, displayHeight,QImage::Format_RGB32);
                ui->label->setPixmap(QPixmap::fromImage(img)); // 在label上播放视频图片
                delay(30);
            }
        }
        av_packet_unref(pPacket);
#endif
    }

out:
    //释放资源
    av_free(out_buffer);
    sws_freeContext(pSwsContext); // 释放一个SwsContext
    av_frame_free(&pFrameRGB);
    av_frame_free(&pFrame);
    avcodec_close(pCodecContext);
    avformat_close_input(&pFormatContext);
}
```


## **参考资料：**

- [Qt+FFmpeg 简单实现视频播放](https://www.cnblogs.com/linuxAndMcu/p/12046600.html)
