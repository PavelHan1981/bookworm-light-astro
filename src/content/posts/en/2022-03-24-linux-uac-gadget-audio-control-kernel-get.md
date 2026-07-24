---
title: "Implementing Audio Control Handling Based on Linux UAC Gadget Driver: Kernel-Level GET"
slug: "2022-03-24-linux-uac-gadget-audio-control-kernel-get"
description: "This article summarizes the complete workflow provided by SigmaStar for adding audio control functionality to a Linux kernel-based UAC gadget device, focusing on the kernel-level GET part."
date: 2022-03-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["UAC","USB"]
draft: false
---


Based on studying the source code of the SigmaStar Webcam solution, this three-part series summarizes the complete workflow provided by SigmaStar for adding audio control capabilities to a Linux kernel-based UAC gadget device:

1. [Application Layer](https://www.pavelhan.tech/2022-03-23-linux-uac-gadget-audio-control-application)
2. [Kernel Layer Part 1 - Handling Audio Control GET Commands](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-get)
3. [Kernel Layer Part 2 - Handling Audio Control SET Commands](https://www.pavelhan.tech/2022-03-24-linux-uac-gadget-audio-control-kernel-set)

The following is a detailed summary of kernel-level GET commands.


The UAC implementation in the kernel mainly involves three files: `f_uac1.c` and `u_audio.c` under `drivers/usb/gadget/function/`, and `audio.c` under `drivers/usb/gadget/legacy/`.


The implementation workflow of Audio Control in the kernel begins with analyzing the definition of the `f_uac1` structure:


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


The portion above marked with Control Set Command standards is added on top of the standard Linux UAC implementation to support audio control functionality.


A list definition `cs` has been added to the above data structure to store the unit-level audio control command queues supported by the device:

- The UAC specification divides audio control commands into multiple units, and each unit contains multiple commands. Therefore, whenever the device receives an audio control command from the host, it first identifies which unit the command belongs to, and then locates the corresponding command within that unit for processing.
- Here, `cs` holds the list of units.

In `f_uac1.c`, the `control_selector_init` function called at the end of `f_audio_alloc` initializes these two queues, which will be polled whenever audio control commands arrive from the host. Below is an example showing volume control within a Feature Unit:


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


The definitions of `capture_fu_controls` and `capture_volume_control` structures used during initialization are as follows:


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


Next, let's analyze the complete workflow when the device receives an Audio Control command from the host.


According to the UAC specification, the handling logic for Audio Control commands is similar to Video Control in UVC; both are implemented via control transfers over endpoint 0.


In `f_uac1.c`, whenever the device receives control transfer data sent over endpoint 0, the callback function automatically invoked is **`f_audio_setup`**:


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


Therefore, analyzing the execution flow of `f_audio_setup` is the starting point for understanding audio control command processing.

- First, it parses the `bRequestType` field in the control transfer structure and dispatches the request to four different handler functions based on direction (IN or OUT) and recipient type (Endpoint or Interface);
    - Since audio control commands are directed to the audio control interface, for SET-type commands we only need to focus on `audio_set_intf_req`, while for GET-type commands we only need to focus on `audio_get_intf_req`.
- After `audio_set_intf_req` or `audio_get_intf_req` completes, it returns the number of bytes to be transferred in the subsequent data stage. If this value is greater than 0, `usb_ep_queue` must be called to handle data stage transmission/reception.
    - For example, in the volume control scenario above, a GET command returns the current volume value to the host during this stage, while a SET command receives the newly configured volume value from the host.

The handler interface for Audio Control GET commands is `audio_get_intf_req`:


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

- Note: For GET-type audio commands, after locating the corresponding audio command, executing its `con->get` function to retrieve the current setting, and returning that value, the flow is essentially complete. Once this function returns, `f_audio_setup` sends the returned setting back to the host via `usb_ep_queue`. Therefore, the `f_audio_complete` callback registered here serves no real practical purpose in this context and performs no meaningful processing. `f_audio_complete` is primarily used when handling SET-type audio controls (refer to the subsequent discussion on SET command handling).

The actual entry point for GET commands is the `con->get` function found during the loop iteration, which is `generic_get_cmd`:


```c
static int generic_get_cmd(struct usb_audio_control *con, u8 cmd)
{
        return con->data[cmd];
}
```

- In short, this function simply returns the current setting stored within the audio control. Where is this current setting initialized? The answer is in `control_selector_init`, where initial values for all audio control parameters are set. Additionally, whenever a SET command is received later, `con->data` is updated to ensure it holds the latest parameter values.

This completes the analysis of the GET-type audio control command handling workflow. **A key point to note is that all runtime parameters for audio controls are maintained and managed within the kernel. Therefore, GET commands retrieve these parameters directly from the kernel and return them immediately, without needing to query the application layer.**