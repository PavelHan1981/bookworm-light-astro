---
title: "A Brief Summary of Signal 11 SIGSEGV Errors"
slug: "2024-10-12-the-signal-11-sigsegv-issue-summary"
description: "This article summarizes the causes of Signal 11 (SIGSEGV) errors frequently encountered in Linux application programming, their kernel-level handling process, and common debugging techniques used in practice."
date: 2024-10-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Linux"]
tags: ["Linux"]
draft: false
---


## Introduction to SIGSEGV Issues and Summary of Causes


Signal 11, namely SIGSEGV (S**ig**nal **Seg**mentation **Violation**), is an error signal sent by Unix/Linux systems to an application when it encounters a memory access error during runtime. This signal is typically sent by the system kernel to the application when the application code attempts to access, read, or write to an illegal memory address during execution. Such errors generally occur in C/C++ language code that accesses underlying memory addresses via pointers and other mechanisms. Once triggered, they can lead to data corruption, system crashes, or other unpredictable behaviors. They are arguably the most common yet severe problems encountered during embedded C/C++ application development.


The common causes of SIGSEGV include:

- Dereferencing null or wild pointers. If a pointer is neither properly initialized and set nor subjected to necessary checks before dereferencing, doing so directly will cause the program code's memory access to go out of control, triggering a SIGSEGV error.
- Buffer overflow. Whether in heap space, stack space, or global variable space, accessing buffers or queues beyond their address ranges results in memory buffer overflow issues.
- Memory access permission issues. The memory regions allocated during the execution of various applications, along with their corresponding virtual memory pages, possess different access permissions depending on their type. The most typical example is that the code segment memory space is read-only; attempting to write to a read-only memory space will also trigger a SIGSEGV error.
- Stack overflow. If a large amount of memory is allocated on the stack space inside a sub-function, and the sub-function's use of its stack space memory exceeds the limit during execution, a stack overflow will occur, leading to a SIGSEGV issue.


## Viewing SIGSEGV Signals from the Linux Kernel Perspective


For applications running on a Linux system, each process corresponds to an independent virtual address space. The memory it occupies is divided by type into multiple segments, such as code segments, data segments, heap space, and stack space. Each segment is further divided into numerous virtual memory pages in 4KB units, each with its own address and permission settings. These virtual address pages are then mapped one-to-one to physical memory pages via the MMU and the page tables of each process maintained in the kernel. Every application process has its own page table in the kernel, storing the mapping between its virtual memory space and the physical memory pages it actually occupies.


So, when does the Linux Kernel send a SIGSEGV signal to a process?


When an application makes a read or write access request to a virtual memory address, this request is transferred to kernel space. At this point:

- The kernel queries the page table corresponding to the process to find the page table and permissions matching the requested virtual address. If the requested virtual address page is included in the page table and the access permissions match correctly, the kernel accesses the specified memory address according to the application's request. If the permissions do not match, the kernel sends a SIGSEGV signal to the application, indicating an error in the memory access permissions.
- If the kernel cannot find the virtual address page corresponding to the virtual address specified by the application in the page table, a page fault occurs. There are three types of page faults, which are handled by the page fault handler:
    - Major Page Fault (also known as a hard page fault): The virtual memory address to be accessed has no corresponding page frame in physical memory. In this case, it needs to be loaded from a device such a hard drive (e.g., reading/writing files on the disk into memory, or swapping cache stored on the disk into memory), after which the MMU establishes the mapping between physical and virtual memory pages. Because it requires reading files from the hard drive, this processing process is naturally slower and is generally an asynchronous operation.
    - Minor Page Fault (also known as a soft page fault): The memory page to be accessed is not in the virtual address space corresponding to the current process, but it is in physical memory. In this case, the MMU only needs to establish an association between the current process's virtual address space and the physical address space, without needing to read contents from the hard drive. This processing speed is relatively fast and is generally a synchronous operation.
    - Both Major Page Faults and Minor Page Faults are normal operations, and the kernel will not report an abnormal SIGSEGV signal to the application.
    - Another type of page fault is a completely invalid page fault. The most typical case is illegal memory access caused by out-of-bounds memory addresses accessed by a user process, or the dereference of a null address. At this point, the kernel will report a SIGSEGV signal to the application, and the default behavior is to terminate the application's execution.


## Approach to Debugging SIGSEGV Issues


### 1. Enable All Warning Configurations During Compilation


First, when compiling applications, you should get into the habit of enabling all warning messages and resolving all application code issues that trigger warning messages. Because if a compiler generates warning messages during compilation, there is an extremely high probability that certain bugs are hidden behind these warnings. Even if these bugs do not manifest as obvious test issues in the short term, under certain application logic executions, they run the risk of causing intermittent issues that are extremely difficult to locate and resolve. Therefore, developing the habit of automatically enabling all warning messages and resolving these issues in advance can prevent problems before they occur and eliminate potential bugs early on.


For example, when compiling using gcc, you can enable all warning messages via compilation options such as `-Wall` and `-Wextra`. These errors are generally relatively easy to resolve in practice:


![image.png](/images/blog/对于Signal-11-SIGSEGV错误的简单总结-1.png)


### 2. Static Scanning and Analysis


The concept of introducing static analysis tools into the development workflow aligns with enabling warning configurations during compilation: both attempt to detect potential issues in advance by scanning and compiling static code before the software runs, and resolving them beforehand. However, code static scanning and analysis tools completely scan the static source code itself, which is work completed before the compilation pipeline; whereas enabling warning configurations during compilation utilizes the compilation tool to simultaneously scan and analyze the code while it is being compiled. The two are largely similar.


Currently, both open-source and commercial static code scanning and analysis tools have matured significantly. For instance, when scanning embedded C and C++ application code, open-source tools like `cppcheck` and commercial software like `Coverity` and `Fortify` are widely used in practice. They can indeed efficiently improve the code quality developed by the team and resolve code defects that would otherwise cause test failures ahead of time.


Therefore, in development practice, from the perspective of improving development quality and efficiency, one must actively integrate static analysis tool scans and the workflow for resolving scanned issues into the code submission pipeline.


### 3. Dynamic Memory Analysis Using Valgrind


Unlike static code scanning and analysis tools like `cppcheck` and `Coverity`, `Valgrind` is a dynamic analysis tool. This means that `Valgrind` monitors and analyzes memory usage while the application is running: `Valgrind` runs alongside the target application, monitoring its memory usage in the background to more accurately pinpoint the location and cause of memory errors.


Of course, `Valgrind`'s role extends far beyond dynamic tracking and analysis of memory usage. It can also perform various profiling, code coverage testing, stack analysis, and CPU cache hit/miss rate analysis on programs, making it a very powerful open-source tool.


Using Valgrind's `memcheck`, you can detect memory overwrites, memory leaks, out-of-bounds memory accesses, and other issues during application execution.


The general steps for using Valgrind in embedded system debugging are as follows:

- First, Valgrind needs to be compiled.
- Start the application using Valgrind with the `memcheck` option: `valgrind --tool=memcheck a.out`

However, regarding the application of Valgrind in embedded systems, there are significant practical challenges, especially considering that most embedded systems have strict real-time or timing requirements in certain aspects. This is because Valgrind's execution monitors the application's memory usage in real-time, causing the application to run 20-30 times slower than without Valgrind—a performance hit that is unacceptable in the vast majority of embedded application debugging scenarios.


Therefore, Valgrind is much more widely used in resource-rich environments such PCs and servers. If you want to use Valgrind to analyze memory in embedded applications, a more realistic approach is to design and implement a more reasonable software architecture, allowing certain software modules to run on a PC, and then use Valgrind on the PC to perform independent unit tests or module-level tests for those software modules.


### 4. Leveraging Coredump


When Linux's coredump feature is enabled, if an application encounters various exceptions or severe bugs during runtime that cause it to exit, the Linux system saves the application's runtime memory, register states, stack pointers, memory management information, and various function stack call information into a core file. Analyzing and tracing this core file can roughly pinpoint the specific root cause of the memory issue.


First, you need to enable the core dump feature: `ulimit -c unlimited`.


Then run your application. When a memory error in the application causes it to exit, a core file will be automatically generated in the current directory. Next, use `gdb` to analyze this core file. Within gdb's interactive environment, use the `bt` (backtrace) command to view the function call stack information prior to the program's exit, which will allow you to roughly locate the specific position and cause of the memory error.


### 5. Inspecting Kernel Logs to Locate Issues


When a segmentation fault occurs, the kernel synchronously writes an entry into its kernel log buffer. Analyzing this log can also yield useful information, which can be used to preliminarily determine the cause of the segmentation fault and an approximate reference location. The kernel's runtime log is typically saved in `/var/log/syslog`.

- Of course, for the kernel runtime log to be automatically recorded in the `/var/log/syslog` file, an `rsyslog` service must be running in the background so you can view and utilize this file for problem analysis and troubleshooting.


Below is the information seen in the kernel log file after a segmentation fault occurs:


![image.png](/images/blog/对于Signal-11-SIGSEGV错误的简单总结-2.png)

- **`at <address>`**: **Indicates the virtual memory address that the application-layer code attempted to access when the segmentation fault occurred.**
- **`ip <pointer>`**: **The execution location of the application-layer code in memory when the error occurred.**
- **`sp <pointer>`**: **The application stack pointer at the time the error occurred.**
- **`error <code>`**: The type of memory operation the application was executing when the error occurred. The primary types include:
    - 4: Indicates the program is attempting to read an unallocated memory address.
    - 5: Indicates the program is attempting to read a write-only memory address.
    - 6: Indicates the program is attempting to write to an unallocated memory address.
    - 7: Indicates the program is attempting to write to a memory address without write permissions.

## References

- [What is Signal 11 SIGSEGV Error? | phoenixNAP KB](https://phoenixnap.com/kb/sigsegv)