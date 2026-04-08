---
title: "基于Linux UAC gadget驱动实现Audio Control处理-Kernel层SET"
slug: "2022-03-24-linux-uac-gadget-audio-control-kernel-set"
description: "本文总结了SigmaStar提供的在基于Linux kernel的UAC gadget设备中增加audio control控制功能的完整工作流程，内核层SET部分。"
date: 2022-03-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["USB","UAC"]
draft: false
---


基于对SigmaStar Webcam方案源代码的学习，通过三篇文章的篇幅，整体总结了SigmaStar提供的在基于Linux kernel的UAC gadget设备中增加audio control控制功能的完整工作流程：

1. [应用层](https://www.pavelhan.tech/2022-03-23-linux-uac-gadget-audio-control-application)
2. [内核层1-Audio Control Get类命令的处理流程](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-get)
3. [内核层2-Audio Control Set类命令的处理流程](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-set)

以下为内核层SET类命令的完整总结。


延续前面的Get类命令的分析。下面来继续分析Audio Control Set类型命令的处理接口audio_set_intf_req：


```c
static int audio_set_intf_req(struct usb_function *f,
                const struct usb_ctrlrequest *ctrl)
{
        struct f_uac1           *uac1 = func_to_uac1(f);
        struct usb_composite_dev *cdev = f->config->cdev;
        struct usb_request      *req = cdev->req;
        u8                      id = ((le16_to_cpu(ctrl->wIndex) >> 8) & 0xFF);
        u16                     len = le16_to_cpu(ctrl->wLength);
        u16                     w_value = le16_to_cpu(ctrl->wValue);
        u8                      con_sel = (w_value >> 8) & 0xFF;
        u8                      cmd = (ctrl->bRequest & 0x0F);
        struct usb_audio_control_selector *cs;
        struct usb_audio_control *con;

        DBG(cdev, "bRequest 0x%x, w_value 0x%04x, len %d, entity %d\n",
                        ctrl->bRequest, w_value, len, id);

				//下面的这一段就是从前面初始化阶段初始化的两个列表中查找，这个get命令针对的是哪个Unit的那个command
        list_for_each_entry(cs, &uac1->cs, list) {
                if (cs->id == id) {
                        list_for_each_entry(con, &cs->control, list) {
                                if (con->type == con_sel) {
																				//注意，这里没有执行具体的命令，只是给uac1->set_con做了赋值
																				//后续在req->complete上注册的f_audio_complete回调会执行set处理逻辑
                                        uac1->set_con = con;
                                        break;
                                }
                        }
                        break;
                }
        }

        uac1->set_cmd = cmd;
        req->context = uac1;
				//给req->complete赋值一个f_audio_complete回调函数，那么当这次控制传输结束后会自动调用这个f_audio_complete
        req->complete = f_audio_complete;

        return len;
}
```

- 整体的工作逻辑与Get类的处理基本类似。最大的不同就是通过轮询两个队列，找到对应的audio control以后，只是把这个audio control结构体赋值给uac1->set_con，并没有做具体的set操作。这个set操作需要在req->complete上注册的回调函数f_audio_complete中执行。
    - 放到f_audio_complete中执行的原因是，set类型的命令需要收到data stage发过来的设置参数，而audio_set_intf_req执行的时候这个data stage还没发过来。所以只能在这里先记下来，然后等整个控制传输结束，这个时候会自动回调req->complete上注册的f_audio_complete函数。因此在f_audio_complete中处理实际的set命令比较合适。

因此Set类型命令的实际处理入口函数就是f_audio_complete：


```c
static void f_audio_complete(struct usb_ep *ep, struct usb_request *req)
{
        struct f_uac1 *uac1 = req->context;
        int status = req->status;
        u32 data = 0;

        switch (status) {
        case 0:                         /* normal completion? */
                if (uac1->set_con) {
                        memcpy(&data, req->buf, req->length);//req->buf就是data stage收到的set参数
                        uac1->set_con->set(uac1->set_con, uac1->set_cmd,
                                        le16_to_cpu(data));//实际上调用的仍然是audio control的set函数，bug这个时候可以把要set的参数传递过去了
                        uac1->set_con = NULL;//重新把uac1->set_con设置为null，等待接收下次set命令
                }

                break;
        case -ESHUTDOWN:
        default:
                break;
        }
}
```

- 可以看到，上面最终执行的set功能仍然是audio control command自己的set函数。这个set函数在对应的audio control结构体的定义中已经设置好。例如可以查看前面的capture_volume_control变量定义的时候给set赋值的处理函数是generic_set_cmd。

generic_set_cmd的分析：


```c
static int generic_set_cmd(struct usb_audio_control *con, u8 cmd, int value)
{
        struct f_uac1 *uac1 = g_f_uac1;
        if (!uac1)
                return -EINVAL;

        if (uac1->ready_con)
                return -EINVAL;

        uac1->ready_con = con;
        uac1->ready_cmd = cmd;
        uac1->ready_value = value;

        con->data[cmd] = value;//给内核中维护的audio control参数赋值，这样以后的get命令返回的就是这个新设置的值
				//执行到这里，实际上参数的修改已经生效，但是需要把这个set操作通知到应用层，在应用层让这个set生效。
				//这个功能通过前面在f_audio_alloc阶段定义的schedule work来执行
        schedule_work(&uac1->cmd_work);
        return 0;
}
```

- 前面的f_audio_alloc函数中定义了一个schedule work，对应的执行函数是mixer_cmd_work。因此这里的schedule_work(&uac1->cmd_work)实际上就是给kernel的调度器提交了一个执行mixer_cmd_work的执行任务。

通过调度器执行的mixer_cmd_work函数来负责audio control功能在应用层的生效处理，其执行分析如下：


```c
static void mixer_cmd_work(struct work_struct *data)
{
        struct f_uac1 *uac1 = g_f_uac1;
        struct usb_audio_control *con = uac1->ready_con;
        int value = uac1->ready_value;

        if (!con)
                return;

        switch (con->type)
        {
                case UAC_FU_VOLUME://针对feature unit中的volume调节
                        uac1->g_audio.volume = UAC_VOLUME_ATTR_TO_DB(value);//单位转换
                        g_audio_notify(&uac1->g_audio);//调用g_audio_notify实现具体功能
                        break;
                default:
                        break;
        }

        uac1->ready_con = NULL;
}
```


g_audio_notify利用linux声卡驱动的ALSA架构来实现与应用层之间的通信。在u_audio.c文件中定义：


```c
void g_audio_notify(struct g_audio *g_audio)
{
        struct snd_card *card = g_audio->uac->card;
				//这里直接找到volume control对应的snd_kcontrol结构体。
				//实际上更合理的设计是，在g_audio_notify函数上传递一个参数，使用这个参数区分：Host发送的是哪个audio control的设置命令，然后针对性的向应用层发出这个参数的修改通知
        struct snd_kcontrol *ctl = g_audio->uac->volume_ctl;
				//通过Alsa的SNDRV_CTL_EVENT_MASK_VALUE方式向应用层发出通知，这样应用层就能收到通知并实现对应的功能，不同的audio control应该找到并传递不同的ctl->id
        snd_ctl_notify(card, SNDRV_CTL_EVENT_MASK_VALUE, &ctl->id);
}
EXPORT_SYMBOL_GPL(g_audio_notify)
```

- 需要注意，上面的g_audio_notify的实现非常简略。实际上只提供了一个volume调整上传应用层的机制，如果需要增加其他audio control的控制，就要在以上代码的基础上增加对应的处理逻辑，可以通过id把不同的命令区分开来，告诉应用层究竟需要对哪个audio control进行控制。

那么问题来了，上面的g_audio->uac->volume_ctl究竟是什么？为什么snd_ctl_notify函数可以向应用层发出volume control变化的通知？


这是因为UAC的实现借助了Linux的ALSA网卡驱动框架。ALSA网卡驱动框架提供了一个kcontrol的机制来实现在应用层和kernel层进行音频参数控制功能。


每个音频参数的设置都对应一个kcontrol结构体，也就是所谓的struct snd_kcontrol，把这个结构体定义并填充好以后，注册到内容中。应用层就可以访问到kernel中注册的所有kcontrol的列表，需要控制哪个参数，就通过对应的kcontrol控制的接口来进行控制即可。


那么对于volume control这个kcontrol而言，其定义及其在kernel中的注册流程如下：


```c
static int snd_uac_pcm_vol_info(struct snd_kcontrol *kcontrol,
                                   struct snd_ctl_elem_info *uinfo)
{
        uinfo->type = SNDRV_CTL_ELEM_TYPE_INTEGER;
        uinfo->count = 1;
        uinfo->value.integer.min = CAPTURE_VOLUME_MIN;
        uinfo->value.integer.max = CAPTURE_VOLUME_MAX;
        uinfo->value.integer.step = CAPTURE_VOLUME_STEP;
        return 0;
}

static int snd_uac_pcm_vol_get(struct snd_kcontrol *kcontrol,
                                  struct snd_ctl_elem_value *ucontrol)
{       
        struct g_audio *g_audio= (struct g_audio *)kcontrol->private_data;
        int value = g_audio->volume;
        ucontrol->value.integer.value[0] = value;
        return 0;
}

static int snd_uac_pcm_vol_put(struct snd_kcontrol *kcontrol,
                                  struct snd_ctl_elem_value *ucontrol)
{
        int value;
        value = ucontrol->value.integer.value[0];
        return 0;
}

static struct snd_kcontrol_new snd_uac_pcm_volume = {//volume kcontrol的定义，应用层对volume的参数访问就会调用下面注册的这几个函数
        .iface = SNDRV_CTL_ELEM_IFACE_MIXER,
        .name = "Capture Volume Control",
        .access = SNDRV_CTL_ELEM_ACCESS_READWRITE | SNDRV_CTL_ELEM_ACCESS_TLV_READ,
        .index = 0,
        .info = snd_uac_pcm_vol_info,
        .get = snd_uac_pcm_vol_get,
        .put = snd_uac_pcm_vol_put,
};

int g_audio_setup(struct g_audio *g_audio, const char *pcm_name,
                                        const char *card_name)
{
				......
				uac->volume_ctl = snd_ctl_new1(&snd_uac_pcm_volume, g_audio);
        if ((err = snd_ctl_add(card, uac->volume_ctl)) < 0)//在这里把volume control的这个snd_kcontrol_new结构体注册到kernel中
                return err;

        err = snd_card_register(card);
				......
}
```

- 所以如果还要增加新的audio control的控制类型，就需要像上面的volume control一样，先定义清楚这个新的audio control对应的snd_kcontrol_new结构体，然后调用snd_ctl_add把这个kcontrol注册到内核中。这样后续就可以在g_audio_notify中通过snd_ctl_notify函数向应用层发出audio control command了。
