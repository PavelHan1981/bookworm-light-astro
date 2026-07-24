---
title: "Linux Disk Encryption Technology: LUKS"
slug: "2020-07-07-Linux-LUKS"
description: "This article summarizes the complete process of implementing disk encryption on Linux using LUKS technology. Accessing the encrypted disk requires entering the key specified during creation."
date: 2020-07-07T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["Linux"]
draft: false
---

## **Introduction to LUKS: Linux Disk Encryption Technology**

- LUKS: Linux Unified Key Setup.
- LUKS is a standard provided by the Linux system for encrypting disk partitions, applicable across various Linux distributions.
- After encrypting a disk partition with LUKS technology, you must first enter a password to decrypt it before the encrypted partition can be mounted to the file system for access. Without the password, it cannot be mounted, which means that even if the hard drive is removed, the original data on the hardware cannot be accessed, thus ensuring the security of the hard drive data.
- To use LUKS technology for disk partition encryption in a Linux system, the cryptsetup package must be installed beforehand.
- After encrypting a partition with cryptsetup, direct mounting of that partition is no longer allowed. LUKS is also an encryption scheme based on the device mapper mechanism. To use this partition, a mapping must be created for it, mapping it to the `/dev/mapper` directory. We can only use the partition by mounting this mapping. However, creating this mapping requires entering the decryption password.
- Features of encrypting disk partitions using LUKS and cryptsetup tools:
    - After encryption, direct mounting is not possible. You must first use the `cryptsetup` command + enter the access password to map the encrypted partition's device file under device mapper, and only then can you mount the device mapper's mapping file to the file system for access;
    - After encryption, there's no need to worry about data theft if the hard drive is lost. Without the access password, it cannot be properly mounted to a new system;
    - After encryption, a password must first be entered to create the device mapper mapping for successful mounting and normal use.
    - The `cryptsetup` tool can be used to set up to 8 access keys for a disk partition, and these access keys can be flexibly managed (added and deleted) using commands later on;

## **Basic Usage of cryptsetup**

Common parameters for the `cryptsetup` command include:

- `luksFormat`: Sets a password for a disk partition.
    - `cryptsetup luksFormat [device file path]`
    - During execution, an access password needs to be set, which will serve as the key for future access to this disk partition;
- `luksOpen`: Establishes a mapping file from an encrypted partition device file to `/dev/mapper`.
    - `cryptsetup luksOpen [device file path] [mapper file name]`
    - During execution, the disk partition's key needs to be entered;
    - Upon successful execution, a device mapping file named `[mapper file name]` will be created under `/dev/mapper`;
- `status`: Checks the status of a mapped device file.
    - `cryptsetup status [mapper file name]`
    - Checks the mount status and metadata of the encrypted partition;
- `luksClose`: Closes a previously created mapping file under `/dev/mapper`.
    - `cryptsetup luksClose [mapper file name]`
    - Before execution, the partition needs to be unmounted. After the `luksClose` command is completed, the mapping file created under device mapper will be deleted;
- `luksAddKey`: Adds an access key to a disk partition.
    - `cryptsetup luksAddKey [device file path]`
    - A maximum of 8 keys can be set for a disk partition;
    - In addition to entering a string key via the keyboard, an existing file on the disk can also be specified as the access key for the encrypted disk partition: `sudo cryptsetup luksAddKey [device file path] [any other file path]`
- `luksRemoveKey`: Deletes a specified access key from the existing list of access keys for a disk partition. This key can no longer be used to access the file system afterwards.
    - `cryptsetup luksRemoveKey [device file path]`
    - Enter the key to be deleted during execution.

## **Partition Encryption and Automatic Mounting Experiment on VMware Virtual Machine**

- VMware Version: VMware Workstation 15 Player.
- Operating System: Debian 10.0.

The virtual Linux system originally had a 40GB virtual hard disk, corresponding to `/dev/sda`, containing two partitions: `/dev/sda1` and `/dev/sda2`;

Add another SCSI hard disk of 10GB in size via the options interface in the current VMware virtual machine system:

![Untitled.png](/images/blog/Linux的磁盘加密技术LUKS-1.png)

After creation, start the virtual machine. A new device file 'sdb' can be seen under `/dev`. The next step is to create a LUKS encrypted partition on this hard drive.

**1. Install cryptsetup on Debian**

```bash
sudo apt-get install cryptsetup
```

**2. Partition the new disk using the fdisk tool**

Directly create a primary partition based on the newly created sdb hard disk, corresponding to the device file `/dev/sdb1`;

![Untitled.png](/images/blog/Linux的磁盘加密技术LUKS-2.png)

**3. Encrypt the newly created sdb1 partition using the cryptsetup tool;**

![Untitled.png](/images/blog/Linux的磁盘加密技术LUKS-3.png)

**4. Create a mapped disk partition for sdb1 under /dev/mapper**

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

- `crtpt_disk` is an arbitrary name. After successful execution of the `cryptsetup luksOpen` command, a corresponding disk partition mapping file will be created under `/dev/mapper`, which is effectively a mapping file for `/dev/dm-0`;
- The `/dev/mapper/crypt_disk` file created by the above command will be lost after a system reboot;
- _Thereafter, `/dev/mapper/crypt_disk` can be used in the same way as `/dev/sda1`;_

**5. Format the encrypted partition**

Here, format `/dev/mapper/crtpt_disk` with the ext4 partition format:

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

**6. Mount and start using the encrypted partition**

```bash
pavel@debian:~$ sudo mount /dev/sdb1 /mnt/
mount: /mnt: unknown filesystem **type** 'crypto_LUKS'.
pavel@debian:~$ sudo mount /dev/ /mnt/
Display all 163 possibilities? (y or n)
pavel@debian:~$ sudo mount /dev/mapper/crtpt_disk /mnt/
```

- Note that for this type of encrypted partition, you cannot directly mount its partition file `/dev/sdb1`. Instead, you must mount the mapping file `/dev/mapper/crypt_disk` created earlier via the `cryptsetup luksOpen` command;
- Thereafter, this partition can be used in `/mnt` for data read/write operations;

**7. Automatic loading and password input at boot time**

### Randomly create a file and use it as the password for accessing the disk partition
```bash
pavel@debian:~$ touch crypt_disk_passwd
pavel@debian:~$ sudo cryptsetup luksAddKey /dev/sdb1 ./crypt_disk_passwd
输入任意已存在的口令:
```

### Add mapping relationship in /etc/crypttab:
```
# <target name>    <source device>        <key file>    <options>
crypt_disk    /dev/sdb1    /home/pavel/crypt_disk_passwd
```

### Set up automatic mounting at boot, add to /etc/fstab:
```
/dev/mapper/crypt_disk    /mnt    ext4    defaults    0    0
```

- After setting up according to the above process, the device mapper mapping file 'crypt_disk' for `/dev/sdb1` will be automatically created during boot, the password will be automatically entered during loading, and it will be automatically mounted to the `/mnt` mount point. Thereafter, the encrypted partition can be used normally under `/mnt`;

## **References:**

- [1-14 File System Features and Disk Encryption Technology](https://www.cnblogs.com/xiaogan/p/5791187.html)
- [Disk Encryption LUKS on Linux](https://blog.51cto.com/vnimos/1175883)
- [Linux uses LUKS to encrypt hard drive or USB drive](https://www.haiyun.me/archives/1225.html)