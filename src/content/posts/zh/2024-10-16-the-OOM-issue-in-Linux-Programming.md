---
title: "Linux的OOM错误及其处理思路"
slug: "2024-10-16-the-OOM-issue-in-Linux-Programming"
description: "本文总结了Linux系统下应用程序运行经常出现的OOM错误，针对该错误在kernel中所提供的处理方式，以及这些OOM的处理方式在嵌入式系统应用中的思考。"
date: 2024-10-16T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["嵌入式","Linux"]
draft: false
---


## 对于OOM错误的简介和总结


OOM，Out Of Memory，顾名思义，也就是Linux系统在运行中因为物理内存耗尽所出现的问题。


在Linux系统的应用程序运行过程中，应用程序向Kernel不断申请内存，Kernel的内存管理子系统，会找到物理内存中的空闲页面标记为被占用状态，并且在该应用程序的页表中建立这个物理内存页面与应用程序虚拟空间所申请的虚拟内存页面之间的关联关系。当应用程序需要使用的内存过多，Linux的内存管理子系统已经找不到空闲的物理内存页来满足应用程序的内存申请要求时，就会发生这个系统运行内存不足的问题（OOM，Out Of Memory）。


对于系统运行内存不足的问题，一般有几种处理方式：

- 利用SWAP分区。在系统的硬盘中存在一个独立的SWAP分区，运行内存不足且kernel已经无法再释放内存的情况下，把暂时不用的内存页交换到这个硬盘分区上，以腾出内存用作它用。后续如果要用到这个缓存的内存页，再从SWAP分区上交换回来。这就是我们在安装Linux系统时需要单独划分一个SWAP分区的原因所在。
- Linux Kernel内部有一个OOM Killer的机制，开启后在运行内存不足的情况下，通过一定的算法找到最不重要、耗费内存最多的进程，直接kil掉以确保系统运行的基本稳定性。
- 对于嵌入式系统等专用功能的系统，以上的SWAP分区和OOM killer都不适用，标准的处理方式往往就是直接系统崩溃报出OOM的错误。

## SWAP分区


对于包含SWAP分区的PC以及服务器端的系统而言，当系统的物理内存不足的时候，Linux Kernel还会尝试把一部分不常用的内存页缓存到SWAP分区中，如果后续应用程序的运行要用到这个内存页的话，再从SWAP分区重新读入到内存中，这就是内存页面SWAP交换的过程。当然因为涉及到物理内存页与硬盘之间的数据拷贝，硬盘的读写是很慢的，所以一旦应用中运行中涉及到内存页的交换，应用程序的执行速度是很慢的。


但是对于嵌入式Linux系统而言，绝大多数的情况下是不支持SWAP分区的。因此在嵌入式系统中一旦出现OOM的错误，标准的处理流程就是进程Crash以及系统崩溃，所以OOM对于嵌入式Linux系统的开发而言是非常严重的错误，需要审慎处理。

    - 实际上绝大多数的Linux嵌入式系统都有一定的实时性要求，如果嵌入式系统也支持SWAP分区的话，内存数据交换过程中在物理内存页和硬盘/Flash等介质之间来回拷贝数据，执行速度很难满足这个实时性要求。而且嵌入式Linux系统一般都是专用系统，其上执行的应用程序是非常固定的，所以只需要针对这些专用的应用程序的执行，评估其运行所需要的内存需求，选择合适的内存大小即可。
    - 嵌入式Linux系统上不适用SWAP分区的另外一个原因则是，嵌入式系统上一般使用Flash作为存储介质，Flash的存储块的大小一般远远大于内存页的大小（4KB），而标准的SWAP分区是以内存页为单位进行交换的，这样就注定SWAP分区在Flash上的使用不会有理想的性能。
    - 当然，要在嵌入式系统上开启SWAP也不是没有可能，不过嵌入式系统上所使用的SWAP是一种基于RAM的压缩文件系统zram。大致的逻辑是，提前分配一片内存作为压缩内存SWAP系统zram，在系统运行内存不足的情况下，找到使用率比较低的内存页，压缩后放入这个zram文件系统中，后续如果要用到这个内存页的话，再从zram中解压缩后释放出来。zram中保存的内存页经过一定的压缩算法处理，在内存的使用上更节约，通过这种方式达到内存交换的目的。

## OOM Killer


OOM Killer是Linux Kernel的一个特性，其主要的作用，就是在发生系统内部不足的情况下，Kernel通过一定的算法找到最应该kill的应用程序，把这个应该程序kill掉，然后释放出来内存，避免系统的崩溃。


因此OOM Killer的触发条件就是：在当前应用程序运行的情况下，系统已经用光了所有的物理内存；系统已经无法再释放内存来保证系统运行的稳定性。


在kernel的运行中，当OOM Killer特性开启的情况下，kernel会根据多个维度的统计数据（当前系统中的进程数量，各个进程所占用的内存空间大小，进程本身的重要性，剩余内存的多少，用户设置的oom_score_adj参数等）计算出来每个进程的oom_score。每个进程都有一个oom_score，可以通过cat /proc/<PID>/oom_score命令来查看，各个进程的oom_score的分数介于0-1000之间，这个分数越高，在遇到内存不足的情况下，OOM killer会首先选择最高oom_score的进程，kill掉这个进程以后把内存释放出来。所以对于服务器和PC上运行的Linux系统而言，就是利用这个机制在系统内存负载居高不下已经影响到系统运行本身稳定性的情况下，强制kill进程来释放内存。


当然对于以上的OOM killer机制，用户也可以认为介入，设置进程的重要性，来避免OOM killer运行的时候误杀重要的进程，这就是通过oom_score_adj参数来进行调节：

- 同样的，每个进程的/proc/<PID>/目录下也都有一个oom_score_adj文件可以设置这个参数，如果给这个文件写入一个正值就相当于是提升这个进程被kill掉的可能性，例如echo 100 > /proc/<PID>/oom_score_adj命令相当于提高这个进程的oom_score，在内存不足的情况下这个进程就更可能会被kill掉；而echo -100 > /proc/<PID>/oom_score_adj命令则相当于降低这个进程的oom_score，在内存不足的情况下这个进程就更不太可能会被kill掉。
- 如果要让进程在任何时候都不会被OOM killer杀掉：echo -1000 > /proc/<PID>/oom_score_adj
- 而如果要选择一个优先级最低的进程，让OOM发生的时候首先被kill掉来释放内存，可以：echo 1000 > /proc/<PID>/oom_score_adj

可以利用以下脚本来实时的监控系统中各个进程的oom_score和oom_score_adj：


```bash
#!/bin/bash
# This script retrieves and displays the OOM (Out Of Memory) score and the OOM adjusted score 
# for each running process, sorted in descending order by the OOM score.

printf 'PID\tOOM Score\tOOM Adj\tCommand\n'

# Read each process ID and command, check if a corresponding oom_score file exists and its value is not zero.
# If so, print the process ID, OOM score, OOM adjusted score, and command.
while read -r pid comm
do
    if [ -f /proc/$pid/oom_score ] && [ $(cat /proc/$pid/oom_score) != 0 ]
    then
        printf '%d\t%d\t\t%d\t%s\n' "$pid" "$(cat /proc/$pid/oom_score)" "$(cat /proc/$pid/oom_score_adj)" "$comm"
    fi
done < <(ps -e -o pid= -o comm=) | sort -k 2nr
```


## 对于OOM问题在嵌入式系统中的理解


如上所述，一般而言，对于嵌入式Linux系统而言，都会根据其应用程序的执行，提前在系统设计与评估阶段仔细的评估该应用所需要的内存大小，然后选择与之对应的系统硬件配置，所以只要系统设计阶段不出现特别大的问题，一般而言，系统硬件所提供的内存容量是足够应用程序运行所使用的。但是如果在应用程序的实现中，出现一些bug导致对内存的异常使用（最典型的就是内存泄漏，申请内存后没有及时释放，导致累计效应），在应用程序的运行中对于内存的消耗不断增加，直到系统中所有的内存耗尽从而导致OOM的错误，这一点是在嵌入式Linux系统开发中所需要面对的重点问题。


关于SWAP分区及其类似方案在嵌入式Linux系统中的应用，以上已有详细总结，SWAP分区本身并不适合嵌入式系统所使用的Flash存储介质，而zram同样会导致交换过程带来的低效率操作，难以满足嵌入式系统的实时性处理要求。


OOM Killer的设计用于在系统内存不足，存在崩溃风险的情况下，从当前系统选择消耗内存较多的非关键进程，kill掉以后来尝试恢复内存的占用状况保证系统运行的基本稳定性。这一点对于嵌入式系统而言同样不适用，因为嵌入式系统一般都是长期运行的专用应用，在系统启动后运行起来的进程都是关键进程，kill掉以后就没有办法提供基本的功能特性，这个时候即使系统本身还没有崩溃，整个产品的实用性已经大打折扣了。所以具体的实现上，不太可能依赖于OOM killer来选择进程kill掉保证系统运行的稳定性。


因此，对于嵌入式系统所面对的OOM问题来讲，关键仍然在于两点：

- 系统设计和方案平台选型针对产品需求的合理性，需要确保硬件规格在满足产品需求的前提下，在内存的使用上有一定的裕量来确保系统运行的稳定性，而不是依赖于一些不可控的手段。
- 应用程序设计上一定要尽最大可能避免内存泄漏等因素导致的软件bug，对内存占用的持续积累，最终造成物理内存不足的OOM问题。当然极端情况下，也有部分产品在设计上在产品运行一段时间后，自动重启一次来尝试避免长期运行情况下出现的内存方面的问题。

## 参考文档：

- [Linux OOM (Out-of-memory) Killer. let me first explain what is OOM | by Raza | Medium](https://medium.com/@adilrk/linux-oom-out-of-memory-killer-74fbae6dc1b0)
