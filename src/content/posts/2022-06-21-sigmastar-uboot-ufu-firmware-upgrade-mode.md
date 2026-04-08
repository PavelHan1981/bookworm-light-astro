---
title: "SigmaStar的Uboot UFU升级模式"
slug: "2022-06-21-sigmastar-uboot-ufu-firmware-upgrade-mode"
description: "本文总结了SigmaStar在Uboot中增加的UFU模式，来实现使用该方案的情况下，通过Uboot和USB连接来给终端用户提供安全升级的流程"
date: 2022-06-21T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["音视频"]
tags: ["嵌入式"]
draft: false
---


Sigmastar provides three options of firmware upgrade worflow:

1. OTA pack and unpack in application layer
2. Firmware upgrade thread running in UVC sample application
3. Using USBDownloader tools and uboot UFU mode

But both option 1# and 2# works in Linux application mode, and Because Sigmastar solution don’t have AB partition design, so option 1# and 2# are not secure upgrade workflow. It means if the end user plug out usb connection or power off camera when firmware upgrading in option 1# and 2# mode, it will be bricked.


So if we want to provide a secure OTA upgrade worflow to the end user, we can only use option 3#.


## UBoot UFU mode


Actually Option 3# depends heavily on the uboot UFU work mode. so it will implement the flash image burning process in uboot stage.


**In the Uboot UFU mode, actually camera device will configure its usb device function to be a gadget mass storage device, so from PC side, it will find a usb mass storage device if camera enter into uboot ufu mode, and then it can send usb scsi command to run script in uboot.**


In the uboot bootup flow, it will check a uboot environment varible: ota_upgrade_status. 

- If ota_upgrade_status=0, it will start normal boot, means loading kernel and rootfs image to RAM, and start kernel booting;
- If ota_upgrade_status=1, it will enter into UFU mode, and wait the UFU connection from PC side(Open USBDownloadTool in PC side). When the UFU connection is ready between the two sides, uboot will start download a auto_reset.txt script file from pc side, and then parse and execute the command line in the script file to complete the whole upgrade workflow.

So the uboot env ota_upgrade_status is very important for this upgrade workflow. And when the upgrade flow complete scuccessfully, we need to set this varible to be 0, or Nexttime the uboot will still enter into UFU mode automatically.


In Sigmastar’s Uboot UFU environment, there are two very important command which will be used in the upgrade process:

- tftp: download file from UFU PC side directory. The usage of this tftp command is same to the network tftp command, but this UFU tftp use usb connection to download file.
- estar: using UFU tftp command to download a script(default script name: auto_update.txt) from PC side directory, and run this script in Sigmastar’s Uboot environment.

## The Whole Upgrade Flow


![Untitled.png](/images/blog/SigmaStar的Uboot-UFU升级模式-1.png)


## Code Analysis

1. Setting ota_upgrade_status to be 1 from PC side USBDownloadTool.

    In the button clicked callback function of PC side USBDownloadTool source code, we can find:


    ```c
    void CUSBDownloadToolDlg::OnBnClickedButton2()
    {
    	HANDLE hd = NULL;
    	hd = USB_ScsiFindDevice(&dev_state);
    
    	if (hd != NULL) {
    		......
    		//if camera run in UVC mode, it will be a uvc device not scsi device, so hd will be NULL
    	} else {
    		AitDeviceHandle uvc_handle = NULL;
    		CString DevPath;
    		HRESULT hr = 0;
    		ULONG BytesRet = 0;
    		CNameList::iterator i;
    		int n = 0;
    		int tryNum = 0;
    
    		GetVideoDeviceList(NameList);//find all the uvc devices connected to this PC
    		if (NameList.empty())
    		{
    			logTrace(_T("Can not find uvc camera"));
    			pChildDlg = new USBTreeShowDlg(this);
    			return;
    		}
    		for (i = NameList.begin(); i != NameList.end(); ++i)
    		{
    			DevPath.Format(_T("%s"), *i);
    			if (IdentifyDevice(DevPath)) {//using PID and VID find USB device
    #ifndef _UNICODE
    				int size = MultiByteToWideChar(CP_UTF8, 0, DevPath, -1, NULL, 0);
    				PWSTR pDevpath = new WCHAR[size + 1];
    				memset(pDevpath, 0, size + 1);
    				MultiByteToWideChar(CP_UTF8, 0, DevPath, -1, pDevpath, size);
    				pDevpath[size] = '\0';
    				//open the found uvc device and prepare to write UVC XU command
    				AITAPI_OpenDeviceByPath((TCHAR *)pDevpath, &uvc_handle);
    				delete pDevpath;
    #else
    				AITAPI_OpenDeviceByPath(DevPath, &uvc_handle);
    #endif // !_UNICODE
    				logTrace(_T("Identify Device: ok"));
    			}//modified by TX
    			else continue;
    
    			if (uvc_handle == 0)
    			{
    				......
    			}
    
    			DataBuf[0] = 0;
    			for (n = 0; n < sizeof(g_GUIDS) / sizeof(g_GUIDS[0]); n++)
    			{
    				/*control select: 4  data len: 8*/
    				CurSelGUID = g_GUIDS[n];
    				//write UVC XU command to UVC device
    				hr = AITAPI_UvcExtSet(uvc_handle, &CurSelGUID, 4, DataBuf, 8, &BytesRet);
    				......
    			}
    		}//modified by TX
    
    		......
    	}
    	return;
    }
    ```

    - In this button callback function, it will first find SCSI device which means the camera is in USB UFU mode. but currently our camera is runnning in UVC mode, so USB_ScsiFindDevice will return NULL;
    - Next it will use GetVideoDeviceList API to get the USB UVC device list which connected to this PC, and then in IdentifyDevice function, it will use PID and VID to filter out the target UVC device.
        - **The default VID is 0x114b or 0x1d6b, and PID is 0x23fb or 0102. so if we changes the USB PID and VID, also need to change the filter condition.**
    - If it find target UVC device, it will use AITAPI_OpenDeviceByPath API to open this device, and then use AITAPI_UvcExtSet to write UVC XU command to this UVC device.
2. After camera recerives the UVC XU command, it will write ota_upgrade_status environment variable to be 1(in internal/uvc/st_uvc_xu.c):

    ```c
    void usb_vc_cmd_cfg(uint8_t req, VC_CMD_CFG *cfg, unsigned long cur_val, struct uvc_request_data *resp)
    {
        XU_Print("vc.req : 0x%x\n", req);
        XU_Print("vc.val : 0x%lx\n", cur_val);
        XU_Print("cmd cap : 0x%lx, info cap : 0x%x\n",cfg->bCmdCap, cfg->bInfoCap);
    
        switch (req)
        {
        case UVC_SET_CUR:
            if (cfg->bCmdCap & CAP_SET_CUR_CMD) {
                printf("[%s %d] Recv Upgrade FW Command\n", __FUNCTION__, __LINE__);
                system("/etc/fw_setenv ota_upgrade_status 1");
                printf("[%s %d] Set ota_upgrade_status ok, then reboot system\n", __FUNCTION__, __LINE__);
                system("reboot");
            }
            else {
                goto invalid_req;
            }
            break;
    		......
    		}
    }
    ```

    - After UVC camera recerives this UVC XU command, it will use system API to write ota_upgrade_status to be 1, and then reboot.
3. In the Uboot workflow, if it checks ota_upgrade_status equals to be 1, it will enter into UFU mode. In the source code of uboot(common/autoboot.c):

    ```c
    void autoboot_command(const char *s)
    {
    #if !defined(CONFIG_AUTOBOOT_CMD_UFU) || defined(CONFIG_MS_USB) || defined(CONFIG_MS_SDMMC) || defined(CONFIG_MS_EMMC)
            char *env;
    #endif
            debug("### main_loop: bootcmd=\"%s\"\n", s ? s : "<UNDEFINED>");
    
    #if defined(CONFIG_CMD_SSTAR_UFU)
            // for empty flash, default bootcmd might undefined
            if (stored_bootdelay != -1 && !abortboot(stored_bootdelay))
            {
    #if !defined(CONFIG_AUTOBOOT_CMD_UFU)
                    env = getenv("ota_upgrade_status");
                    if(!strcmp(env, "1"))
    #endif
                    {
                            icache_enable();
                            run_command("ufu", 0);
                    }
            }
    #endif
    ......
    }
    ```

    - After Uboot enter into UFU mode, it will wait for the Host side UFU Connection and wait the UFU command from host side.
4. Also in the button callback function of PC side USBDownloadTool, after it send out UVC XU command, it will also wait the UFU connection completes and send out UFU command:

    ```c
    void CUSBDownloadToolDlg::OnBnClickedButton2()
    {
    .......
    			//same to step 1 analysis.
    			for (n = 0; n < sizeof(g_GUIDS) / sizeof(g_GUIDS[0]); n++)
    			{
    				/*control select: 4  data len: 8*/
    				CurSelGUID = g_GUIDS[n];
    				hr = AITAPI_UvcExtSet(uvc_handle, &CurSelGUID, 4, DataBuf, 8, &BytesRet);
    				if (SUCCEEDED(hr)) {
    					// after sending XU for OTA, wait device to enter ufu mode
    					logTrace(_T("Waiting 1 min for rebooting......"));
    					while (1)
    					{
    						Sleep(1000);
    						//wait for the ufu connection with camera
    						if (USB_ScsiFindDevice(&dev_state) != NULL)
    						{
    							break;
    						}
    
    						if (tryNum++ > 60) { //wait 60s
    							logTrace(_T("Error:Can not dectect uboot running"));
    							return;
    						}
    					}
    					if (dev_state == DEV_STATE_UBOOT) {
    						//after found ufu device, create a new thread to do upgrade task
    						CreateThread(NULL, 0, AutoUpdateThreadEntry, this, 0, NULL);
    						break;//modified by TX
    					}
    					if (dev_state != DEV_STATE_UBOOT) {
    						//logTrace(_T("Continue because of Invalid Device"));
    						continue;
    					}//modified by TX
    					//break;  modified by TX
    				}
    			}
    	......
    	return;
    }
    
    void CUSBDownloadToolDlg::Auto_Update()
    {
    	RunScript("auto_update.txt");
    }
    
    DWORD WINAPI CUSBDownloadToolDlg::AutoUpdateThreadEntry(LPVOID param)
    {
        CUSBDownloadToolDlg  *Cthis = (CUSBDownloadToolDlg*) param;
    	/*Clear ota upgrade status first*/
    	//Actually we should put this code after the auto update process completes successfully.
    	USB_ScsiRunCmd("setenv ota_upgrade_status 0", strlen("setenv ota_upgrade_status 0"));
    	Cthis->Auto_Update();
      Cthis->MessageBox(_T("Upgrade done, reboot now."));
    
    	return 0;
    }
    ```

    - Ater USBDownloadTool send out UVC XU command, it will loop scan SCSI device to detect if the camera has entered into UFU mode. If so, it will create a new AutoUpdateThreadEntry thread to do the fw upgrade task.
    - In the AutoUpdateThreadEntry thread, it will load the auto_update.txt script file, and then parse and execute the upgrade command in this file.
    - **Please be Noted: Above autoUpdateThreadEntry is not secure, because it set the ota_upgrade_status variable to be 0 before the upgrade task completes. so if end user disconnect usb connection in the fw upgrading process, it will be bricked and can’t be recovered. More reasonable solution is: You should reset this ota_upgrade_status variable after fw upgrading task completes succesfully, or put the reset operation in the end of the auto_update.txt file.**
5. Following is a auto_update.txt sample:

    ```c
    # <- this is for comment / total file size must be less than 4KB
    estar scripts/[[cis.es
    estar scripts/[[set_partition.es
    estar scripts/[[ipl.es
    estar scripts/[[ipl_cust.es
    estar scripts/[[uboot.es
    estar scripts/[[kernel.es
    estar scripts/[[rootfs.es
    estar scripts/[[misc.es
    estar scripts/[[miservice.es
    estar scripts/[[customer.es
    
    estar scripts/set_config
    saveenv
    printenv
    reset
    % <- this is end of file symbol
    ```

    - USBDownloadTool will parse this auto_update.txt, and run all the command step by step;
    - Just as expained in the earlier section, estar command is used to download the script file into RAM and run in uboot environment;
    - **Please be Noted: DON’T upgrade boot section (include IPL, IPL_CUST, and uboot), or if usb connection disconnects in the process of boot section upgrading, it will be bricked and can’t recover.**
6. Following is a rootfs upgrade script file sample([[rootfs.es) to explain how to upgrade rootfs partition:

    ```c
    # <- this is for comment / total file size must be less than 4KB
    tftp 0x21000000 rootfs.sqfs
    nand erase.part rootfs
    nand write.e 0x21000000 rootfs ${filesize}
    % <- this is end of file symbol
    ```

    - This code is very simple, which will run in uboot to download rootfs image to RAM, and write to NAND Flash.
