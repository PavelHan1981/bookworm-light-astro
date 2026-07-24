---
title: "Static Analysis of C Code with CppCheck on Debian"
slug: "2020-06-01-debian-linux-cppcheck"
description: "This article summarizes the process of using the cppcheck tool for static analysis of C code on Linux."
date: 2020-06-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Software Engineering"]
tags: ["Software Engineering","Linux"]
draft: false
---

Cppcheck's official website: http://cppcheck.net/.

*   Cppcheck is a C/C++ static analysis tool that helps detect potential issues in code.
*   Cppcheck performs lexical and syntactic analysis entirely based on C/C++ source code text files, helping developers identify common pitfalls in code, thereby standardizing software development processes and improving development quality.
*   Cppcheck is not a compiler and cannot replace gcc; its execution environment does not require compiler tools like gcc to be installed.
*   Cppcheck has a very complete ecosystem for software development, offering plugin integration with compilers, version control tools, and continuous deployment toolchains such as Visual Studio, Eclipse, Jenkins, SVN, and Git.
*   In addition to Cppcheck, other mainstream static analysis tools on the market include clang, pclint, coverity, and tscancode. A comparison of their main attributes is shown below:

![Untitled.png](/images/blog/在Debian下使用CppCheck对C代码进行静态扫描-1.png)

## **Installing Cppcheck on Debian/Linux**

`sudo apt-get install cppcheck;`

## **Scanning a Single C Source File with Cppcheck**

Using an example provided on the Cppcheck official website for testing:

```c
#include <stdio.h>

void **foo**(int x)
{
	int buf[10];
	if(x==1000){
		buf[x]=0;
	}
}

int main()
{
printf("hello world\n");
foo(0);
}
```

Execute cppcheck scan on the single C source file above (enabling all warning output information):

```bash
pavel@debian:~/test$ cppcheck main.c --enable=all
Checking main.c ...
[main.c:7] -> [main.c:6]: (warning) Either the condition 'x==1000' is redundant or the array 'buf[10]' is accessed at index 1000, which is out of bounds.
[main.c:5]: (style) The scope of the variable 'buf' can be reduced.
[main.c:7]: (style) Variable 'buf' is assigned a value that is never used.
(information) Cppcheck cannot find all the include files (use --check-config for details)
```

The corresponding issues are:

*   warning: `buf` array out of bounds;
*   style: The scope of `buf` can be reduced, for example, by declaring it within the `x==1000` condition;
*   style: Still a `buf` scope issue; if the program does not execute under the `x==1000` condition, `buf` will not be used at all;
*   information: Unable to find header files;
    *   The `--suppress=missingIncludeSystem` option can be used to ignore warnings about missing include files;
    *   Alternatively, the `-I` option can be used to specify the directory path for header files;

## **Scanning an Entire C Source File Directory with Cppcheck**

Taking the `mpp` sample source file directory in HiSilicon Hi3521DV100 SDK as an example for scanning:

```bash
pavel@debian:~/hi3521d/Hi3521DV100_SDK_V1.0.4.0/mpp$ cppcheck sample --enable=all
Checking sample/audio/adp/audio_aac_adp.c ...
[sample/audio/adp/audio_aac_adp.c:106]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:117]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:128]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:139]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:141]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:150]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:161]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:163]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:172]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:211]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:222]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:233]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:244]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:246]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:255]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:266]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:401]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:412]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:422]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:423]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:444]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:507]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:518]: (style) Same value in both branches of ternary operator.
[sample/audio/adp/audio_aac_adp.c:529]: (style) Same value in both branches of ternary operator.
Checking sample/audio/adp/audio_aac_adp.c: DUMP_AACDEC...
Checking sample/audio/adp/audio_aac_adp.c: DUMP_AACENC...
[sample/audio/adp/audio_aac_adp.c:860]: (style) Variable 'pu8TestNum' is assigned a value that is never used.
1/29 files checked 4% done
Checking sample/audio/sample_audio.c ...
Checking sample/audio/sample_audio.c: HI_ACODEC_TYPE_TLV320AIC31...
2/29 files checked 6% done
Checking sample/common/loadbmp.c ...
[sample/common/loadbmp.c:138]: (style) Redundant condition: h!=0. 'h==0 || (h!=0 && stride>4294967295UL/h)' is equivalent to 'h==0 || stride>4294967295UL/h'
[sample/common/loadbmp.c:265]: (style) Redundant condition: h!=0. 'h==0 || (h!=0 && stride>4294967295UL/h)' is equivalent to 'h==0 || stride>4294967295UL/h'
[sample/common/loadbmp.c:414]: (style) Redundant condition: h!=0. 'h==0 || (h!=0 && stride>4294967295UL/h)' is equivalent to 'h==0 || stride>4294967295UL/h'
[sample/common/loadbmp.c:214]: (style) The scope of the variable 'pDst' can be reduced.
[sample/common/loadbmp.c:364]: (style) The scope of the variable 'pDst' can be reduced.
3/29 files checked 8% done
Checking sample/common/sample_comm_audio.c ...
Checking sample/common/sample_comm_audio.c: HI_ACODEC_TYPE_HDMI...
Checking sample/common/sample_comm_audio.c: HI_ACODEC_TYPE_NVP6134...
Checking sample/common/sample_comm_audio.c: HI_ACODEC_TYPE_TLV320AIC31...
Checking sample/common/sample_comm_audio.c: HI_ACODEC_TYPE_TP2823...
Checking sample/common/sample_comm_audio.c: HI_ACODEC_TYPE_TW2865...
Checking sample/common/sample_comm_audio.c: HI_FPGA...
4/29 files checked 15% done
Checking sample/common/sample_comm_ivs.c ...
Checking sample/common/sample_comm_ivs.c: HI_FPGA...
5/29 files checked 18% done
Checking sample/common/sample_comm_sys.c ...
Checking sample/common/sample_comm_sys.c: HI_FPGA...
6/29 files checked 20% done
Checking sample/common/sample_comm_vda.c ...
......
```

*   As can be seen, the process of using Cppcheck for static analysis and scanning a source directory is similar to scanning a single C file. Cppcheck recursively enters each subdirectory, scans the C source files within them, and outputs the scanning results. Developers simply need to modify the issues according to the results provided above.

## **Common Cppcheck Execution Options**

*   Cppcheck's message prompt types are configured using the `--enable` option:
    *   `--enable=all`: Enables all types of message prompts;
    *   `--enable=warning`: Enables warning messages;
    *   `--enable=performance`: Enables performance messages;
    *   `--enable=information`: Enables informational messages;
    *   `--enable=style`: Enables portability and style information;
    *   `--enable=warning,performance`: Simultaneously enables warning and performance messages;
*   To save Cppcheck's analysis results to a text file, simply use a redirection command:
    *   `cppcheck sample --enable=all 2> err.txt;`
*   Multi-threaded checking: The `-j` option is used to specify the number of threads to use, which is particularly useful for static scanning of large software projects.
    *   `cppcheck -j 4 sample --enable=all;`
*   Use the `--template` option to format output information:
    *   Output scan information in a GCC-compatible format:
        *   `cppcheck sample/ --enable=all --template=gcc;`
    *   Output scan information in a Visual Studio-compatible format:
        *   `cppcheck sample/ --enable=all --template=vs;`
    *   Additionally, you can use custom methods to format scan information:
        *   `cppcheck --template="{file},{line},{severity},{id},{message}" sample/ --enable=all;`
    *   Output scan information in XML format:
        *   `cppcheck --xml-version=2 sample/ --enable=all 2> err.xml;`
        *   Each `error` node in the XML file represents a scan output message;

## **References**

*   [【代码质量】C++代码质量扫描主流工具深度比较](https://blog.csdn.net/wetest_tencent/article/details/51516347)
*   [Cppcheck 用法（上篇）](https://blog.csdn.net/u011012932/article/details/52778149)