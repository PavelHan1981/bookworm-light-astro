---
title: "搭建基于QT Creator的ffmpeg开发环境"
slug: "2020-09-24-qt-creator-ffmpeg"
description: "记录在 Windows 下基于 QT Creator 搭建 FFmpeg 开发环境的步骤：下载 Shared 与 Dev 预编译包、配置系统环境变量中的动态库路径、修改 .pro 文件引入头文件与库，并用测试代码验证解码调用是否正常。"
date: 2020-09-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["QT","ffmpeg"]
draft: false
---


操作系统版本：Windows 10.


## **从ffmpeg上下载windows平台上预编译好的ffmpeg库**


下载地址： https://ffmpeg.zeranoe.com/builds/。


在基于动态链接库开发的情况下，需要下载下图中的Shared和Dev两个包：


![Untitled.png](/images/blog/搭建基于QT-Creator的ffmpeg开发环境-1.png)


下载后解压缩到某个指定的目录中备用，此处把两个包均解压缩到D:\development\ffmpeg_lib目录下：


![Untitled.png](/images/blog/搭建基于QT-Creator的ffmpeg开发环境-2.png)


## **在系统环境变量中设置动态链接库的目录**


![Untitled.png](/images/blog/搭建基于QT-Creator的ffmpeg开发环境-3.png)

- 这样就不需要把动态链接库拷贝到应用程序所在的目录下了；

## **新建QT项目，修改QT项目的pro文件，增加头文件和库文件路径**


```c
INCLUDEPATH += D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\include
LIBS += D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\avcodec.lib \
				D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\avdevice.lib \
				D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\avfilter.lib \
				D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\avformat.lib \
				D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\avutil.lib \
				D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\postproc.lib \
				D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\swresample.lib \
				D:\development\ffmpeg_lib\ffmpeg-4.3-win64-dev\lib\swscale.lib
```


## **环境测试代码**


```c++
#include "widget.h"
#include <QApplication>
#include <QDebug>

//ffmpeg include
extern "C"
{
#include "libavcodec/avcodec.h"
#include "libavformat/avformat.h"
#include "libavutil/pixfmt.h"
#include "libswscale/swscale.h"
#include "libavutil/time.h"
#include "libavutil/mathematics.h"
}

int main(int argc, char *argv[])
{
	QApplication a(argc, argv);
	Widget w;

	av_register_all();
	
	unsigned int version = avcodec_version();

	qDebug()<< version;
	char * filename="D:\\video.mp4";

	AVFormatContext * fc = NULL;

	int ret = avformat_open_input(&fc, filename, 0, 0);
	if(ret == 0){
		qDebug() << "Video Duration:" << fc->duration / AV_TIME_BASE << " secs";
		avformat_close_input(&fc);
	}
	w.show();

	return a.exec();
}
```


## **参考资料：**

- [Qt+ffmpeg环境搭建](https://blog.csdn.net/u011831771/article/details/78536362)
- [Qt Creator中配置FFmpeg](https://blog.csdn.net/PecoHe/article/details/89203178)
