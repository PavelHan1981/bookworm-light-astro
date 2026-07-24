---
title: "Implementing Audio Control Handling with Linux UAC Gadget Driver - Kernel Layer SET"
slug: "2022-03-24-linux-uac-gadget-audio-control-kernel-set"
description: "This article summarizes the complete workflow provided by SigmaStar for adding audio control functionality to UAC gadget devices based on the Linux kernel, specifically focusing on the kernel-layer SET portion."
date: 2022-03-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["USB","UAC"]
draft: false
---

Based on a study of the SigmaStar Webcam solution source code, this series of three articles collectively summarizes the complete workflow provided by SigmaStar for adding audio control functionality to UAC gadget devices based on the Linux kernel:

1.  [Application Layer](https://www.pavelhan.tech/2022-03-23-linux-uac-gadget-audio-control-application)
2.  [Kernel Layer 1 - Processing Flow for Audio Control Get Commands](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-get)
3.  [Kernel Layer 2 - Processing Flow for Audio Control Set Commands](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-set)

Below is a complete summary of the kernel-layer SET commands.

Continuing from the analysis of the previous Get-type commands, let's now analyze the `audio_set_intf_req` interface for handling Audio Control Set-type commands:

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

-   The overall working logic is largely similar to that of Get-type command handling. The main difference is that after polling two queues to find the corresponding audio control, the audio control struct is merely assigned to `uac1->set_con` without performing the actual set operation. This set operation needs to be executed within the `f_audio_complete` callback function registered with `req->complete`.
-   The reason for deferring execution to `f_audio_complete` is that Set-type commands require receiving configuration parameters sent during the data stage. When `audio_set_intf_req` is executed, this data stage has not yet occurred. Therefore, the information is first recorded, and then, upon completion of the entire control transfer, the `f_audio_complete` function registered with `req->complete` is automatically called. Thus, handling the actual Set command within `f_audio_complete` is more appropriate.

Therefore, the actual entry point function for Set-type commands is `f_audio_complete`:

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

-   As can be seen, the `set` functionality ultimately executed above is still the audio control command's own `set` function. This `set` function is already configured in the definition of the corresponding audio control structure. For instance, when defining the `capture_volume_control` variable earlier, the handling function assigned to `set` was `generic_set_cmd`.

Analysis of `generic_set_cmd`:

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

-   In the preceding `f_audio_alloc` function, a scheduled work was defined, with `mixer_cmd_work` as its execution function. Therefore, `schedule_work(&uac1->cmd_work)` here effectively submits a task to the kernel's scheduler to execute `mixer_cmd_work`.

The `mixer_cmd_work` function, executed via the scheduler, is responsible for activating audio control functionality at the application layer. Its execution analysis is as follows:

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

`g_audio_notify` utilizes the ALSA architecture of the Linux sound card driver to achieve communication with the application layer. It is defined in the `u_audio.c` file:

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

-   It's important to note that the implementation of `g_audio_notify` above is very simplified. It only provides a mechanism for volume adjustment to be reported to the application layer. If other audio control types need to be added, corresponding handling logic must be extended based on the above code. This can be done by using an `id` to differentiate various commands, informing the application layer which specific audio control needs to be managed.

So, the question arises: what exactly is `g_audio->uac->volume_ctl`? And why can the `snd_ctl_notify` function send notifications of volume control changes to the application layer?

This is because the UAC implementation leverages the Linux ALSA sound card driver framework. The ALSA sound card driver framework provides a `kcontrol` mechanism to enable audio parameter control functionality between the application layer and the kernel layer.

Each audio parameter setting corresponds to a `kcontrol` structure, specifically `struct snd_kcontrol`. After defining and populating this structure, it is registered within the kernel. The application layer can then access a list of all `kcontrol`s registered in the kernel, and control any parameter via the interfaces provided by its corresponding `kcontrol`.

For the `volume control` kcontrol, its definition and registration process in the kernel are as follows:

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
        struct g_audio* g_audio= (struct g_audio *)kcontrol->private_data;
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

-   Therefore, if new audio control types are to be added, similar to the volume control example above, the corresponding `snd_kcontrol_new` structure for the new audio control must first be clearly defined. Then, `snd_ctl_add` is called to register this kcontrol in the kernel. Subsequently, the `snd_ctl_notify` function can be used within `g_audio_notify` to send audio control commands to the application layer.