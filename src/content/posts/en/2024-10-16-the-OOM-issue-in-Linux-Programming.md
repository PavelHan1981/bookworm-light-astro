---
title: "Linux OOM Errors and Their Handling Strategies"
slug: "2024-10-16-the-OOM-issue-in-Linux-Programming"
description: "This article summarizes the OOM (Out Of Memory) errors frequently encountered by applications running under Linux systems, the handling mechanisms provided by the kernel for these errors, and considerations for applying these OOM handling methods in embedded systems."
date: 2024-10-16T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["Embedded","Linux"]
draft: false
---

## Introduction and Summary of OOM Errors

OOM stands for Out Of Memory. As the name implies, it is an issue that occurs in a Linux system when physical memory is exhausted during runtime.

During the execution of an application on a Linux system, the application continuously requests memory from the kernel. The kernel's memory management subsystem finds free pages in the physical memory, marks them as allocated, and establishes a mapping in the application's page table between these physical memory pages and the virtual memory pages requested in the application's virtual space. When the application requires too much memory, and the Linux memory management subsystem can no longer find free physical memory pages to satisfy the application's memory request, a low memory condition—known as an Out Of Memory (OOM) error—occurs.

There are generally several ways to handle low memory conditions:

- **Using a SWAP partition:** A dedicated SWAP partition is created on the system's storage drive. When memory runs low and the kernel can no longer free up memory, idle memory pages are swapped out to this storage partition to free up memory for other uses. If these cached memory pages are needed later, they are swapped back in from the SWAP partition. This is why we need to allocate a separate SWAP partition when installing a Linux system.
- **OOM Killer mechanism:** The Linux kernel has an internal mechanism called the OOM Killer. When enabled, it uses specific algorithms during low-memory situations to find the least important, most memory-consuming process and directly kills it to ensure the basic stability of the system.
- **System crash:** For embedded systems and other dedicated-function systems, neither the SWAP partition nor the OOM Killer is applicable. The standard handling approach is often a direct system crash reporting an OOM error.

## SWAP Partition

For PCs and server-side systems equipped with a SWAP partition, when physical memory is insufficient, the Linux kernel attempts to cache a portion of infrequently used memory pages into the SWAP partition. If the application needs to use these memory pages later, they are read back into memory from the SWAP partition—a process known as memory page swapping. Of course, because this involves data copying between physical memory pages and the hard drive, and hard drive read/write speeds are very slow, once an application's execution involves memory page swapping, its running speed drops significantly.

However, for embedded Linux systems, the vast majority do not support SWAP partitions. Therefore, once an OOM error occurs in an embedded system, the standard processing flow is process crash and system collapse. Consequently, OOM is a very serious error in embedded Linux system development and must be handled prudently.

- In fact, the vast majority of embedded Linux systems have certain real-time requirements. If an embedded system were to support a SWAP partition, the continuous data copying between physical memory pages and storage media (such as hard drives or Flash) during memory data swapping would make it difficult to meet these real-time requirements. Furthermore, embedded Linux systems are generally dedicated systems running fixed applications; therefore, it is only necessary to estimate the memory requirements for these dedicated applications and select an appropriate memory size during the design phase.
- Another reason why SWAP partitions are unsuitable for embedded Linux systems is that embedded systems generally use Flash memory as storage media. The block size of Flash memory is typically much larger than the size of a memory page (4KB), whereas standard SWAP partitions perform swapping in units of memory pages. This dictates that SWAP partitions cannot achieve ideal performance when used on Flash memory.
- Of course, enabling SWAP on an embedded system is not entirely impossible. However, the SWAP used in embedded systems is typically a RAM-based compressed filesystem called `zram`. The general logic is to pre-allocate a piece of memory as a compressed memory SWAP system (`zram`). When the system runs low on memory, it finds memory pages with lower utilization rates, compresses them, and places them into this `zram` filesystem. If these memory pages are needed later, they are decompressed from `zram` and released. Memory pages stored in `zram` are processed using specific compression algorithms, resulting in more efficient memory usage and achieving memory swapping through this approach.

## OOM Killer

The OOM Killer is a feature of the Linux kernel. Its primary role is to use a specific algorithm to find the most appropriate application to terminate (kill) when an internal system memory shortage occurs, freeing up memory and preventing a system crash.

Therefore, the trigger condition for the OOM Killer is: while current applications are running, the system has exhausted all physical memory and can no longer free up memory to guarantee operational stability.

When the OOM Killer feature is enabled in a running kernel, it calculates an `oom_score` for each process based on multi-dimensional statistical data (such as the number of processes currently in the system, the memory space occupied by each process, the importance of the process itself, the amount of remaining memory, and the user-configured `oom_score_adj` parameter). Every process has an `oom_score`, which can be viewed using the command `cat /proc/<PID>/oom_score`. The score ranges from 0 to 1000. The higher the score, the higher the priority for the OOM Killer to select and terminate that process during low-memory conditions to free up memory. Thus, for Linux systems running on servers and PCs, this mechanism is used to forcibly kill processes to release memory when high memory load begins to affect the fundamental stability of the system.

Users can also manually intervene in the OOM Killer mechanism to set process importance and prevent critical processes from being accidentally killed. This is adjusted via the `oom_score_adj` parameter:

- Similarly, the `/proc/<PID>/` directory of each process contains an `oom_score_adj` file for configuring this parameter. Writing a positive value to this file increases the likelihood of the process being killed. For example, the command `echo 100 > /proc/<PID>/oom_score_adj` increases the process's `oom_score`, making it more likely to be killed during low-memory situations. Conversely, writing a negative value, such as `echo -100 > /proc/<PID>/oom_score_adj`, lowers the process's `oom_score`, making it less likely to be terminated.
- To prevent a process from ever being killed by the OOM Killer: `echo -1000 > /proc/<PID>/oom_score_adj`
- To select a process with the lowest priority so that it is killed first to free up memory when an OOM occurs: `echo 1000 > /proc/<PID>/oom_score_adj`

You can use the following script to monitor the `oom_score` and `oom_score_adj` of each process in the system in real time:

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

## Understanding OOM Issues in Embedded Systems

As mentioned above, generally speaking, for embedded Linux systems, developers carefully evaluate the memory size required by applications during the system design and evaluation phase based on application execution, and then select matching system hardware configurations. Therefore, as long as there are no major flaws during the system design phase, the memory capacity provided by the system hardware is usually sufficient for application execution. However, if software bugs in the application lead to abnormal memory usage (most typically memory leaks, where memory is requested but not released in time, resulting in a cumulative effect), the memory consumption of the application will continue to grow during runtime until all system memory is exhausted, triggering an OOM error. This is a key issue that must be addressed in embedded Linux system development.

Regarding the application of SWAP partitions and similar solutions in embedded Linux systems, as summarized in detail above, SWAP partitions themselves are not suited for the Flash storage media used in embedded systems, while `zram` similarly introduces inefficiencies caused by the swapping process, making it difficult to meet the real-time processing requirements of embedded systems.

The OOM Killer is designed to select non-critical processes that consume substantial memory from the current system when memory is low and there is a risk of a crash, terminating them to attempt to restore memory status and ensure basic system operational stability. This is similarly inapplicable to embedded systems because embedded systems are typically long-running, dedicated applications where all processes running after system startup are critical. If killed, they cannot provide basic functional features, and even if the system itself hasn't crashed, the usability of the entire product is severely compromised. Therefore, in practical implementations, it is unlikely to rely on the OOM Killer to select and terminate processes to guarantee system stability.

Consequently, for OOM issues faced by embedded systems, the keys still lie in two main aspects:

- The rationality of system design and platform selection tailored to product requirements. It is necessary to ensure that hardware specifications have a certain margin of memory usage to guarantee operational stability while satisfying product requirements, rather than relying on uncontrollable workarounds.
- Application design must make every possible effort to avoid software bugs such as memory leaks, which cause a continuous accumulation of memory usage and ultimately result in OOM errors due to physical memory exhaustion. In extreme cases, some product designs even resort to automatically rebooting the system periodically after running for a certain duration to prevent memory issues arising from long-term execution.

## Reference Documentation:

- [Linux OOM (Out-of-memory) Killer. let me first explain what is OOM | by Raza | Medium](https://medium.com/@adilrk/linux-oom-out-of-memory-killer-74fbae6dc1b0)