---
title: "基于Linux UAC gadget驱动实现Audio Control处理-应用层"
slug: "2022-03-23-linux-uac-gadget-audio-control-application"
description: "本文总结了SigmaStar提供的在基于Linux kernel的UAC gadget设备中增加audio control控制功能的完整工作流程，应用层部分。"
date: 2022-03-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["USB","UAC"]
draft: false
---


基于对SigmaStar Webcam方案源代码的学习，通过三篇文章的篇幅，整体总结了SigmaStar提供的在基于Linux kernel的UAC gadget设备中增加audio control控制功能的完整工作流程：

1. [应用层](https://www.pavelhan.tech/2022-03-23-linux-uac-gadget-audio-control-application)
2. [内核层1-Audio Control Get类命令的处理流程](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-get)
3. [内核层2-Audio Control Set类命令的处理流程](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-set)

以下为应用层部分的完整总结。详细解析了SigmaStar SDK中提供的在应用层通过ALSA KControl机制实现audio control命令的通知和功能实现。


Linux USB Gadget中的UAC部分与kernel部分的交互，实际上使用了Linux的ALSA音频驱动框架。这一点有点类似于在UVC Gadget中使用了v4l2摄像头驱动框架一样：

- v4l2摄像头框架原本的设计是要实现一个内核中的摄像头驱动，以方便应用层以统一的流程和接口从kenel中读取摄像头的数据；而在UVC中使用v4l2的图像流的走向刚好与原本的v4l2框架相反，是把应用层的图像流通过v4l2机制发到内核，然后由内核调用USB底层驱动发给Host；
- 在UAC上使用ALSA音频驱动框架的逻辑也是类似。ALSA原本的设计，是通过ALSA框架定义的标准，从kernel中读取麦克风的数据到应用层，向kernel中写入需要通过喇叭来播放的音频数据，以及通过kcontrol机制实现对音频硬件的控制；UAC中对于ALSA的使用刚好相反，是把应用层整理好的音频数据使用SNDRV_PCM_IOCTL_WRITEI_FRAMES ioctl code写入kernel，然后由kernel调用USB硬件发给Host，以及把USB Host发过来的音频数据通过使用SNDRV_PCM_IOCTL_READI_FRAMES ioctl code读取到应用层，再调用SDK应用层的API把这个声音从喇叭中播放出来，而USB Host所发过来的audio control类的命令则是通过kcontrol机制返回给应用层，由应用层做针对的处理。

## 应用层部分的实现逻辑


应用层实现audio control的大致流程，与ALSA声卡驱动框架的kcontrol一致：

- 调用mixer_open函数打开audio control设备文件，以及通过这个设备文件读取kernel中支持kcontrol列表；
- 调用mixer_subscribe_events函数开启内核audio control事件的订阅；
- 循环执行：
    - 调用mixer_wait_event函数等待audio control设备文件是否有新的command通知上来；
    - 调用mixer_ctl_get_event和mixer_ctl_get_value获取事件详细信息及其参数；
    - 利用从内核设备文件中读取到的事件和参数，通过SigmaStar SDK应用层的MI_AI_SetVqeVolume接口设置新的音量参数。

### mixer_open函数的解析：


```c
struct mixer *mixer_open(unsigned int card)
{           
    struct mixer *mixer = NULL;
    char fn[256];
            
    mixer = calloc(1, sizeof(*mixer));
    if (!mixer)
        return 0;
            
		//打开的ALSA框架下的audio control设备文件，注意这个设备文件的名称
    snprintf(fn, sizeof(fn), "/dev/snd/controlC%u", card);
    mixer->fd = open(fn, O_RDWR);
    if (mixer->fd < 0)
        goto fail;

		//从打开的设备文件中获取声卡信息
    if (ioctl(mixer->fd, SNDRV_CTL_IOCTL_CARD_INFO, &mixer->card_info) < 0)
        goto fail;
    
		//读取kernel中支持的kcontrol的列表
    if (add_controls(mixer) != 0)
        goto fail;
        
    return mixer;
        
fail:
    mixer_close(mixer);
    return NULL;
}

static int add_controls(struct mixer *mixer)
{
    struct snd_ctl_elem_list elist;
    struct snd_ctl_elem_id *eid = NULL;
    struct mixer_ctl *ctl;
    int fd = mixer->fd;
    const unsigned int old_count = mixer->count;
    unsigned int new_count;
    unsigned int n;

		//以下通过ioctl code SNDRV_CTL_IOCTL_ELEM_LIST读取kernel中支持的kcontrol的数量
    memset(&elist, 0, sizeof(elist));
    if (ioctl(fd, SNDRV_CTL_IOCTL_ELEM_LIST, &elist) < 0)
        goto fail;

		//判断内核中支持的kcontrol的数量是否有增加？因为是第一次读，所以old_count=0，后续都按照这个逻辑处理
    if (old_count == elist.count)
        return 0; /* no new controls return unchanged */

    if (old_count > elist.count)
        return -1; /* driver has removed controls - this is bad */

    ctl = mixer_realloc_z(mixer->ctl, old_count, elist.count,
                          sizeof(struct mixer_ctl));
    if (!ctl)
        goto fail;

    mixer->ctl = ctl;

    /* ALSA drivers are not supposed to remove or re-order controls that
     * have already been created so we know that any new controls must
     * be after the ones we have already collected
     */
    new_count = elist.count;
    elist.space = new_count - old_count; /* controls we haven't seen before */
    elist.offset = old_count; /* first control we haven't seen */

		eid = calloc(elist.space, sizeof(struct snd_ctl_elem_id));
    if (!eid)
        goto fail;

    elist.pids = eid;

    if (ioctl(fd, SNDRV_CTL_IOCTL_ELEM_LIST, &elist) < 0)
        goto fail;
		//利用ioctl code SNDRV_CTL_IOCTL_ELEM_INFO把所有的kcontrol结构读出来，这样应用层就能知道ALSA底层驱动支持哪些audio control参数
    for (n = old_count; n < new_count; n++) {
        struct snd_ctl_elem_info *ei = &mixer->ctl[n].info;
        ei->id.numid = eid[n - old_count].numid;
        if (ioctl(fd, SNDRV_CTL_IOCTL_ELEM_INFO, ei) < 0)
            goto fail_extend;
        ctl[n].mixer = mixer;
    }

    mixer->count = new_count;
    free(eid);
    return 0;

fail_extend:
    /* cleanup the control we failed on but leave the ones that were already
     * added. Also no advantage to shrinking the resized memory block, we
     * might want to extend the controls again later
     */
    mixer_cleanup_control(&ctl[n]);

    mixer->count = n;   /* keep controls we successfully added */
    /* fall through... */
fail:
    free(eid);
    return -1;
}
```


### mixer_subscribe_events


mixer_subscribe_events的实现比较简单，实际上就是通过ioctl code SNDRV_CTL_IOCTL_SUBSCRIBE_EVENTS开启或者关闭对内核ALSA control事件的订阅；


```c
int mixer_subscribe_events(struct mixer *mixer, int subscribe)
{   
    if (ioctl(mixer->fd, SNDRV_CTL_IOCTL_SUBSCRIBE_EVENTS, &subscribe) < 0) {
        return -1;
    }   
    return 0;
}
```


### Audio Control消息处理循环结构


```c
while(!g_bExit)
    {
        ret = mixer_wait_event(mixer, 1000);
        if(ret == 1)
        {
            ret = mixer_ctl_get_event(ctl, 0);
            if(MI_SUCCESS != ret)
            {
                printf("mixer_ctl_get_event failed\n");
                break;
            }

            AiVolume = mixer_ctl_get_value(ctl, 0);

            //在此调用应用层的音量控制函数
						......
            printf("current volume is %d\n", s32VolumeDb);
        }
    }

//采用poll机制阻塞等待kernel中的事件发生
int mixer_wait_event(struct mixer *mixer, int timeout)
{   
    struct pollfd pfd;
    
    pfd.fd = mixer->fd; 
    pfd.events = POLLIN | POLLOUT | POLLERR | POLLNVAL;

    for (;;) {
        int err;
        err = poll(&pfd, 1, timeout);
        if (err < 0)
            return -errno;
        if (!err)
            return 0;
        if (pfd.revents & (POLLERR | POLLNVAL))
            return -EIO;
        if (pfd.revents & (POLLIN | POLLOUT))
            return 1;
    }
}

//利用read API从打开的control设备文件中读取事件结构体，每个ALSA事件都是一个snd_ctl_event结构体
int mixer_ctl_get_event(const struct mixer_ctl *ctl, unsigned int id)
{           
    struct snd_ctl_event ctl_ev;
    int ret = read(ctl->mixer->fd, &ctl_ev, sizeof(struct snd_ctl_event));
    if (ret < 0)
        return -1;
		//这个函数的处理上，读完snd_ctl_event结构体就直接返回了，这个结构体并没有使用。实际中应该要通过这个结构体来判断是哪个audio control推送的事件
    return 0;
}

//读取audio control的当前设置参数
int mixer_ctl_get_value(const struct mixer_ctl *ctl, unsigned int id)
{           
    struct snd_ctl_elem_value ev;
    int ret;    
                
    if (!ctl || (id >= ctl->info.count))
        return -EINVAL;
            
    memset(&ev, 0, sizeof(ev));
    ev.id.numid = ctl->info.id.numid;
		//利用ioctl code SNDRV_CTL_IOCTL_ELEM_READ从kernel中读取指定audio control的设置值
    ret = ioctl(ctl->mixer->fd, SNDRV_CTL_IOCTL_ELEM_READ, &ev);
    if (ret < 0)
        return ret;
   
		//根据设置值的具体数据类型对其进行解析和数据格式转换
    switch (ctl->info.type) {
    case SNDRV_CTL_ELEM_TYPE_BOOLEAN:
        return !!ev.value.integer.value[id];
            
    case SNDRV_CTL_ELEM_TYPE_INTEGER:
        return ev.value.integer.value[id];

    case SNDRV_CTL_ELEM_TYPE_ENUMERATED:
        return ev.value.enumerated.item[id];

    case SNDRV_CTL_ELEM_TYPE_BYTES:
        return ev.value.bytes.data[id];

    default:
        return -EINVAL;
    }

    return 0;
}
```

- 通过在事件监听和处理循环中，通过mixer_ctl_get_event可以知道哪个audio control的参数发生了变化，然后通过mixer_ctl_get_value函数读取这个audio control在kernel中的当前设置值，然后就可以在应用层调用对应的audio control的功能函数，把Host发过来的audio control功能实现出来。
- 以上例子代码只是实现了一个volume control的例子。如果要增加其他的audio control功能，可以在mixer_ctl_get_value函数中进行判断和识别，究竟是哪个audio control的参数发生了变化，然后对应的在mixer_ctl_get_value函数中读取其内核中的设置值，并在应用层设置功能。
