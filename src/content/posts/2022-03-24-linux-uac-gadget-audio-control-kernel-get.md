---
title: "基于Linux UAC gadget驱动实现Audio Control处理-Kernel层GET"
slug: "2022-03-24-linux-uac-gadget-audio-control-kernel-get"
description: "本文总结了SigmaStar提供的在基于Linux kernel的UAC gadget设备中增加audio control控制功能的完整工作流程，内核层GET部分。"
date: 2022-03-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["UAC","USB"]
draft: false
---


基于对SigmaStar Webcam方案源代码的学习，通过三篇文章的篇幅，整体总结了SigmaStar提供的在基于Linux kernel的UAC gadget设备中增加audio control控制功能的完整工作流程：

1. [应用层](https://www.pavelhan.tech/2022-03-23-linux-uac-gadget-audio-control-application)
2. [内核层1-Audio Control Get类命令的处理流程](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-get)
3. [内核层2-Audio Control Set类命令的处理流程](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-set)

以下为内核层GET类命令的完整总结。


kernel部分UAC的实现主要用到三个文件：drivers/usb/gadget/function目录下的f_uac1.c和u_audio.c，和drivers/usb/gadget/legacy下的audio.c文件。


Audio control在kernel中的实现流程需要从f_uac1结构的定义开始进行分析：


```c
struct f_uac1 {
        struct g_audio g_audio;
        u8 ac_intf, as_in_intf, as_out_intf;
        u8 ac_alt, as_in_alt, as_out_alt;       /* needed for get_alt() */

        /* Control Set command */
        struct work_struct cmd_work;
        struct list_head cs;
        u8 set_cmd, ready_cmd;
        int ready_value;
        struct usb_audio_control *set_con, *ready_con;
};
```


以上使用Control Set Command字符串标准的这部分就是在Linux标准uac实现的基础上增加的，以提供对audio control功能的支持。


以上数据结构中增加了一个列表定义cs，用于保存该设备可以支持的unit基本的audio control命令队列：

- uac规范把audio control command分为多个不同的unit，每个unit中又包含有多个command。所以每次device收到host发出的audio control命令以后，首先要找到这个命令归属于那个unit，然后在这个unit中再找到对应的command进行处理。
- 这里的cs保存的是unit的列表。

在f_uac1.c文件中f_audio_alloc函数的最后通过control_selector_init函数来实现两个队列的初始化，后续在接收到host的audio control命令后需要对这两个队列进行轮询。在下面的例子中，提供了一个包含在Feature Unit中的volume control音量控制功能的例子：


```c
static struct usb_function *f_audio_alloc(struct usb_function_instance *fi)
{
				......
        control_selector_init(uac1);//进行队列和audio control参数的初始化
        INIT_WORK(&uac1->cmd_work, mixer_cmd_work);//这里初始化了一个执行函数为mixer_cmd_work的schedule work，后续执行set命令的时候会调用到
        g_f_uac1 = uac1;

        return &uac1->g_audio.func;
}

static int control_selector_init(struct f_uac1 *uac1)
{
        INIT_LIST_HEAD(&uac1->cs);
        list_add(&capture_fu_controls.list,&uac1->cs);//在队列中增加feature unit
				//如果还有更多的unit可以在此处继续增加

        INIT_LIST_HEAD(&capture_fu_controls.control);
        list_add(&capture_volume_control.list,
                         &capture_fu_controls.control);//在feature unit队列中增加能够支持的control command的列表
				//如果还有更多的control command可以在此处继续增加

				//各个audio control的运行参数在这里进行初始化
        capture_volume_control.data[UAC__CUR] = DB_TO_UAC_VOLUME_ATTR(CAPTURE_VOLUME_CUR);
        capture_volume_control.data[UAC__MIN] = DB_TO_UAC_VOLUME_ATTR(CAPTURE_VOLUME_MIN);
        capture_volume_control.data[UAC__MAX] = DB_TO_UAC_VOLUME_ATTR(CAPTURE_VOLUME_MAX);
        capture_volume_control.data[UAC__RES] = DB_TO_UAC_VOLUME_ATTR(CAPTURE_VOLUME_STEP);

        return 0;
}
```


以上初始化中用到的capture_fu_controls和capture_volume_control结构的定义如下：


```c
static struct usb_audio_control capture_volume_control = {
        .list = LIST_HEAD_INIT(capture_volume_control.list),
        .name = "Capture Volume Control",
        .type = UAC_FU_VOLUME,//后面轮询中通过这个type来定位是feature unit中的哪个command
        /* Todo: add real Volume control code */
        .set = generic_set_cmd,
        .get = generic_get_cmd,
};

static struct usb_audio_control_selector capture_fu_controls = {
        .list = LIST_HEAD_INIT(capture_fu_controls.list),
        .id   = USB_IN_FU_ID,//后面轮询的时候通过这个id定位是哪个unit中的command
        .name = "Capture Mute & Volume Control",
        .desc = (struct usb_descriptor_header *)&usb_in_ot_desc,
};
```


接下来开始分析Device端接收到Host的Audio Control命令的完整处理流程。


按照UAC规范的定义，Audio Control命令的处理逻辑与UVC的Video Control的处理类似，都是通过在端点0上发送的控制传输类型来进行实现的。


那么在f_uac1.c中，每次Device端收到端点0上发过来的控制传输类型的数据后，自动调用的回调函数是**f_audio_setup**：


```c
static int
f_audio_setup(struct usb_function *f, const struct usb_ctrlrequest *ctrl)
{
        struct usb_composite_dev *cdev = f->config->cdev;
        struct usb_request      *req = cdev->req;
        int                     value = -EOPNOTSUPP;
        u16                     w_index = le16_to_cpu(ctrl->wIndex);
        u16                     w_value = le16_to_cpu(ctrl->wValue);
        u16                     w_length = le16_to_cpu(ctrl->wLength);

        /* composite driver infrastructure handles everything; interface
         * activation uses set_alt().
         */
        switch (ctrl->bRequestType) {
        case USB_DIR_OUT | USB_TYPE_CLASS | USB_RECIP_ENDPOINT:
                value = audio_set_endpoint_req(f, ctrl);
                break;

        case USB_DIR_IN | USB_TYPE_CLASS | USB_RECIP_ENDPOINT:
                value = audio_get_endpoint_req(f, ctrl);
                break;

        case USB_DIR_OUT | USB_TYPE_CLASS | USB_RECIP_INTERFACE:
                value = audio_set_intf_req(f, ctrl);//发给audio control interface的SET类型命令的处理
                break;

        case USB_DIR_IN | USB_TYPE_CLASS | USB_RECIP_INTERFACE:
                value = audio_get_intf_req(f, ctrl);//发给audio control interface的GET类型命令的处理
                break;

        default:
                ERROR(cdev, "invalid control req%02x.%02x v%04x i%04x l%d\n",
                        ctrl->bRequestType, ctrl->bRequest,
                        w_value, w_index, w_length);
        }

				/* respond with data transfer or status phase? */
        if (value >= 0) {
                DBG(cdev, "audio req%02x.%02x v%04x i%04x l%d\n",
                        ctrl->bRequestType, ctrl->bRequest,
                        w_value, w_index, w_length);
                req->zero = 0;
                req->length = value;
                value = usb_ep_queue(cdev->gadget->ep0, req, GFP_ATOMIC);//data stage的收发处理
                if (value < 0)
                        ERROR(cdev, "audio response on err %d\n", value);
        }

        /* device either stalls (value < 0) or reports success */
        return value;
}
```


所以对这个f_audio_setup函数执行流程的分析就是整个audio control命令处理的起点所在。

- 首先对控制传输结构数据中包含的BRequestType字段进行解析，针对它的方向（IN还是OUT）、目的类型（端点还是接口）分为四类调用不同的函数进行处理；
    - 因此audio control命令都是发给audio control interface的，所以对于Set类型的audio control，我们只需要关注audio_set_intf_req；Get类型只需要关注audio_get_intf_req的实现即可。
- audio_set_intf_req和audio_get_intf_req执行完成后，返回这个控制传输后面的data stage要传输的字节数。如果大于0的话，需要再调用usb_ep_queue进行data stage的收发处理。
    - 例如对于上面的volume control的例子，GET类型的命令处理上，在这个阶段会把当前的volume value返回给Host；SET类型的命令处理上，则在这个阶段接收Host新设置的volume value数据。

Audio Control Get类型命令的处理接口audio_get_intf_req：


```c
static int audio_get_intf_req(struct usb_function *f,
                const struct usb_ctrlrequest *ctrl)
{
        struct f_uac1   *uac1 = func_to_uac1(f);
        struct usb_composite_dev *cdev = f->config->cdev;
        struct usb_request      *req = cdev->req;
        int                     value = -EOPNOTSUPP;
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
                                if (con->type == con_sel && con->get) {
																				//找到以后就会调用这个command的get处理函数，在这里是generic_get_cmd
                                        value = con->get(con, cmd);
                                        break;
                                }
                        }
                        break;
                }
        }

        req->context = uac1;
				//给req->complete赋值一个f_audio_complete回调函数，那么当这次控制传输结束后会自动调用这个f_audio_complete
        req->complete = f_audio_complete;
        len = min_t(size_t, sizeof(value), len);
        memcpy(req->buf, &value, len);

        return len;
}
```

- 注意：对于get类audio command的处理，实际上在找到对应的audio command并调用其con->get函数，得到它的当前设置值，并返回以后，整个流程实际上就结束了。这个函数返回后，在f_audio_setup中会把返回的当前设置值通过usb_ep_queue发回给Host。因此在这里注册的这个f_audio_complete回调实际上没有实际作用，根本没有执行有意义的处理流程。f_audio_complete实际上主要应用在Set类型audio control的处理上，可以参考后面对Set类型命令的处理流程。

Get类型命令的实际处理入口实际上就是上面在轮询中找到的con->get函数，也就是generic_get_cmd：


```c
static int generic_get_cmd(struct usb_audio_control *con, u8 cmd)
{
        return con->data[cmd];
}
```

- 所以说这个函数实际上只是返回这个audio control中包含的当前设置值而已。那么这个当前设置值在哪儿初始化呢？答案是在前面的control_selector_init中就对所有的audio control的参数初始值进行了初始化。并且在此后收到Set类型命令以后，也会对这个con->data进行赋值，确保其中包含的参数是最新的。

至此，整个Get类型的audio control命令的处理流程就完整的分析完了。**需要注意的一点是：所有audio control的当前运行参数都是在内核中进行维护和管理的，因此get类型的命令，直接从内核中就可以得到这些参数并直接返回，不需要到应用层去获取这些数据**。

