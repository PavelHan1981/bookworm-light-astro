---
title: "Linux的磁盘加密技术LUKS"
slug: "2020-07-07-Linux-LUKS"
description: "本文总结了在Linux上通过LUKS技术来实现磁盘加密功能的完整流程，访问加密后的磁盘需要输入创建时指定的密钥才能成功访问。"
date: 2020-07-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["Linux"]
draft: false
---


## **Linux系统的磁盘加密技术LUKS简介**

- LUKS：Linux Unified Key Setup。
- LUKS是Linux系统为硬盘分区进行加密操作提供的一个标准，能够通用于各种Linux系统发布版本中。
- 使用LUKS技术对磁盘分区进行加密后，必须要先输入密码对其进行解密后才能把这个加密分区挂载到文件系统中进行访问，没有密码的情况下无法挂载，也就限制了在没有访问密码的情况下，即使把硬盘拿下来也是没有办法访问硬件中原有的数据，这样就保证了硬盘数据的安全性。
- 在Linux系统中使用LUKS技术对磁盘分区进行加密需要提前安装cryptsetup软件包。
- 使用cryptsetup对分区进行了加密后，这个分区就不再允许直接挂载。LUKS也是一种基于device mapper 机制的加密方案。如果要使用这个分区，必须对这个分区做一个映射，映射到/dev/mapper这个目录里去，我们只能挂载这个映射才能使用。然而做映射的时候是需要输入解密密码的。
- 使用LUKS和cryptsetup工具对磁盘分区进行加密的特点：
    - 加密后不能直接进行挂载，必须先使用cryptsetup命令+输入访问密码把这个加密分区的设备文件映射到device mapper下，然后才能把device mapper的映射文件挂载到文件系统中访问；
    - 加密后硬盘丢失也不用担心数据被盗，没有访问密码的情况下，无法正常的挂载到新的系统中；
    - 加密后必须先输入密码进行device mapper映射才能挂载成功并正常使用。
    - 可以使用cryptsetup工具对一个磁盘分区设置多达8个访问密钥，并且可以在后期使用命令灵活的管理增加以及删除访问密钥；

## **cryptsetup的基本使用**


cryptsetup命令的常用参数包括：

- luksFormat：对磁盘分区设置密码
    - cryptsetup luksFormat [device file path]
    - 执行中需要设置一个访问密码，作为以后访问这个磁盘分区的密钥；
- luksOpen：建立加密分区设备文件到/dev/mapper下的映射文件
    - cryptsetup luksOpen [device file path] [mapper file name]
    - 执行中需要输入磁盘分区的密钥；
    - 执行成功后会在/dev/mapper下创建一个以[mapper file name]命名的设备映射文件；
- status：查看映射设备文件的状态
    - cryptsetup status [mapper file name]
    - 查看加密分区的挂载状态以及元信息；
- luksClose：关闭之前在/dev/mapper下的映射文件
    - cryptsetup luksClose [mapper file name]
    - 执行前需要先把这个分区umount掉，执行 luksClose命令完成后会删除在device mapper下创建的映射文件；
- luksAddKey：为磁盘分区增加一个访问密钥
    - cryptsetup luksAddKey [device file path]
    - 最多可以为一个磁盘分区设置8个密钥；
    - 除了通过键盘输入字符串密钥以外，也可以指定一个磁盘上已经存在的文件为加密磁盘分区的访问密钥：sudo cryptsetup luksAddKey [device file path] [any other file path]
- luksReoveKey：从磁盘分区已有的访问密钥列表中删除指定的访问密钥，此后就不能再用这个密钥访问文件系统了
    - cryptsetup luksReoveKey [device file path]
    - 执行时输入需要删除的密钥

## **在VMware虚拟机上进行分区加密及自动挂载实验**

- VMware版本：VMware Workstation 15 Player。
- 操作系统：Debian 10.0。

虚拟Linux系统中原有一块虚拟硬盘40GB，对应于/dev/sda，内部包含两个分区/dev/sda1和/sda2；


在VMware的当前虚拟机系统中通过选项界面再增加一块SCSI硬盘，大小设置为10GB：


![Untitled.png](/images/blog/Linux的磁盘加密技术LUKS-1.png)


新建后启动虚拟机，可以在/dev下看到一个新的设备文件sdb，下一步计划在这个硬盘上创建LUKS加密分区。


**1.在Debian上安装cryptsetup**


sudo apt-get install cryptsetup


**2.使用fdisk工具对新磁盘进行分区**


直接基于新创建的sdb硬盘创建一个主分区，对应于设备文件/dev/sdb1；


![Untitled.png](/images/blog/Linux的磁盘加密技术LUKS-2.png)


**3.使用cryptsetup工具对新建立的sdb1分区进行加密；**


![Untitled.png](/images/blog/Linux的磁盘加密技术LUKS-3.png)


**4.在/dev/mapper下创建sdb1的映射磁盘分区**


```bash
pavel@debian:~$ ls /dev/mapper/
control
pavel@debian:~$ sudo cryptsetup luksOpen /dev/sdb1 crtpt_disk
输入 /dev/sdb1 的口令：
pavel@debian:~$ ls /dev/mapper/ -l
总用量 0
crw------- 1 root root 10, 236 7月   7 14:23 control
lrwxrwxrwx 1 root root       7 7月   7 14:23 crtpt_disk -> ../dm-0
```

- crtpt_disk是随便取的，执行cryptsetup luksOpen命令成功后，就会在/dev/mapper下创建与之对应的磁盘分区映射文件，实际上是/dev/dm-0的映射文件；
- 通过以上命令创建的这个/dev/mapper/crypt_disk文件在系统重启后会丢失；
- _此后就可以像使用/dev/sda1一样的方式来使用/dev/mapper/crypt_disk了；_

**5.对加密分区进行格式化**


此处使用ext4分区格式对/dev/mapper/crtpt_disk进行格式化：


```bash
pavel@debian:~$ sudo mkfs.ext4 /dev/mapper/crtpt_disk
mke2fs 1.44.5 (15-Dec-2018)
Creating filesystem with 2617088 4k blocks and 655360 inodes
Filesystem UUID: 54a75db9-883c-430f-8ef4-de66fd20a2df
Superblock backups stored on blocks:
32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632
Allocating group tables: done
Writing inode tables: done
Creating journal (16384 blocks): done
Writing superblocks and filesystem accounting information: done
```


**6.挂载并开始使用加密分区**


```bash
pavel@debian:~$ sudo mount /dev/sdb1 /mnt/
mount: /mnt: unknown filesystem **type** 'crypto_LUKS'.
pavel@debian:~$ sudo mount /dev/ /mnt/
Display all 163 possibilities? (y or n)
pavel@debian:~$ sudo mount /dev/mapper/crtpt_disk /mnt/
```

- 注意，对于这类加密分区而言，不能直接挂载其分区文件/dev/sdb1，而是要挂载前面通过cryptsetup luksOpen命令创建的映射文件/dev/mapper/crypt_disk；
- 此后就可以在/mnt中使用这个分区进行数据的读写操作了；

**7.开机自动加载并自动输入密码**


```bash
###随机创建一个文件，把这个文件作为访问磁盘分区的密码
pavel@debian:~$ touch crypt_disk_passwd
pavel@debian:~$ sudo cryptsetup luksAddKey /dev/sdb1 ./crypt_disk_passwd
输入任意已存在的口令:

###在/etc/crypttab中增加映射关系：
# <target name>    <source device>        <key file>    <options>
crypt_disk    /dev/sdb1    /home/pavel/crypt_disk_passwd

###设置开机自动挂载，修改/etc/fstab增加：
/dev/mapper/crypt_disk    /mnt    ext4    defaults    0    0
```

- 按照以上流程设置后，开机过程中会自动创建/dev/sdb1的device mapper映射文件crypt_disk，在加载过程中自动输入密码，并自动挂载到挂载点/mnt下，此后就可以在/mnt下正常使用加密分区了；

## **参考资料：**

- [1-14 文件系统的特性与磁盘加密技术](https://www.cnblogs.com/xiaogan/p/5791187.html)
- [Linux下的磁盘加密LUKS](https://blog.51cto.com/vnimos/1175883)
- [linux使用luks加密硬盘或u盘](https://www.haiyun.me/archives/1225.html)
