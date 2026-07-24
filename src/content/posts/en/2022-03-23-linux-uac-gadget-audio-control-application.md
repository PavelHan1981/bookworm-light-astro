---
title: "Implementing Audio Control Handling Based on Linux UAC Gadget Driver: Application Layer"
slug: "2022-03-23-linux-uac-gadget-audio-control-application"
description: "This article summarizes the complete workflow provided by SigmaStar for adding audio control functionality to Linux kernel-based UAC gadget devices, focusing on the application layer."
date: 2022-03-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["USB","UAC"]
draft: false
---


Based on the study of the SigmaStar Webcam solution source code, across three articles, this series summarizes the complete workflow provided by SigmaStar for adding audio control functionality to Linux kernel-based UAC gadget devices:

1. [Application Layer](https://www.pavelhan.tech/2022-03-23-linux-uac-gadget-audio-control-application)
2. [Kernel Layer 1: Audio Control Get-type Command Processing Workflow](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-get)
3. [Kernel Layer 2: Audio Control Set-type Command Processing Workflow](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-set)

Below is the complete summary of the application layer section. It provides a detailed analysis of how the SigmaStar SDK implements audio control command notification and function execution at the application layer via the ALSA KControl mechanism.


The interaction between the UAC section in the Linux USB Gadget framework and the kernel actually utilizes the Linux ALSA audio driver framework. This is somewhat similar to how UVC Gadget utilizes the V4L2 camera driver framework:

- The V4L2 camera framework was originally designed to implement a camera driver in the kernel, making it convenient for the application layer to read camera data from the kernel through unified procedures and interfaces. However, the flow of image streams in UVC using V4L2 is exactly opposite to the original V4L2 framework: the image stream from the application layer is sent to the kernel via the V4L2 mechanism, and then the kernel calls the underlying USB driver to send it to the Host.
- The logic of using the ALSA audio driver framework in UAC is similar. ALSA was originally designed to read microphone data from the kernel to the application layer, write audio data to be played via speakers into the kernel, and control audio hardware via the KControl mechanism, all according to standards defined by the ALSA framework. In UAC, the usage of ALSA is reversed: processed audio data from the application layer is written into the kernel using the `SNDRV_PCM_IOCTL_WRITEI_FRAMES` ioctl code, and then the kernel calls the USB hardware to transmit it to the Host. Conversely, audio data sent from the USB Host is read into the application layer using the `SNDRV_PCM_IOCTL_READI_FRAMES` ioctl code, and then the SDK application layer API is called to play the sound through the speaker. Meanwhile, audio control commands sent by the USB Host are passed back to the application layer via the KControl mechanism for tailored handling by the application layer.

## Application Layer Implementation Logic


The general workflow for implementing audio control at the application layer aligns with the KControl mechanism of the ALSA sound card driver framework:

- Call the `mixer_open` function to open the audio control device file and read the list of KControls supported in the kernel through this device file.
- Call the `mixer_subscribe_events` function to enable subscription to kernel audio control events.
- Loop continuously:
    - Call the `mixer_wait_event` function to wait for new command notifications from the audio control device file.
    - Call `mixer_ctl_get_event` and `mixer_ctl_get_value` to retrieve detailed event information and its parameters.
    - Using the events and parameters read from the kernel device file, invoke the `MI_AI_SetVqeVolume` interface from the SigmaStar SDK application layer to set new volume parameters.

### Analysis of the mixer_open Function


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


The implementation of `mixer_subscribe_events` is relatively straightforward. It essentially uses the ioctl code `SNDRV_CTL_IOCTL_SUBSCRIBE_EVENTS` to enable or disable subscriptions to kernel ALSA control events:


```c
int mixer_subscribe_events(struct mixer *mixer, int subscribe)
{   
    if (ioctl(mixer->fd, SNDRV_CTL_IOCTL_SUBSCRIBE_EVENTS, &subscribe) < 0) {
        return -1;
    }   
    return 0;
}
```


### Audio Control Message Processing Loop Structure


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

- Within the event listening and handling loop, `mixer_ctl_get_event` identifies which audio control parameter has changed. Then, `mixer_ctl_get_value` reads the current parameter setting for that audio control in the kernel. Finally, the application layer can call the corresponding audio control handler function to execute the audio control command sent from the Host.
- The example code above only demonstrates a volume control implementation. To add other audio control features, you can evaluate and identify which audio control parameter changed inside `mixer_ctl_get_value`, read its kernel settings accordingly via `mixer_ctl_get_value`, and configure the functionality at the application layer.