---
title: "在Debian下使用CppCheck对C代码进行静态扫描"
slug: "2020-06-01-debian-linux-cppcheck"
description: "本文总结了在Linux中使用cppcheck工具对C代码进行静态扫描的流程。"
date: 2020-06-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["软件工程"]
tags: ["软件工程","Linux"]
draft: false
---


cppcheck的官网： http://cppcheck.net/。

- cppcheck是一个C/C++静态检查工具，可以帮助我们检测出代码可能存在(潜在)的问题；
- cppcheck的执行完全基于C/C++源码的文本文件进行词法、语法分析，帮助开发人员找出代码中常见的隐患所在，从而规范化软件开发流程，提高开发质量；
- cppcheck不是编译器，替代不了gcc，cppcheck的执行环境中也不需要安装gcc这类编译工具；
- cppcheck对于软件开发的生态非常完善，可以以插件的方式整合到Visual Studio、Eclipse、Jenkins、SVN、Git等编译器、版本管理工具以及持续部署的工具链中；
- 目前市场上的主流静态分析工具除了cppcheck之外，还有clang、pclint、coverity、tscancode等，主要属性对比如下：

![Untitled.png](/images/blog/在Debian下使用CppCheck对C代码进行静态扫描-1.png)


## **cppcheck在debian/linux上的安装**


sudo apt-get install cppcheck；


## **使用cppcheck对单个c源文件进行扫描**


以cppcheck官网上提供的例子进行测试：


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


对以上单个C源码文件执行cppcheck扫描（使能所有的告警输出信息）：


```bash
pavel@debian:~/test$ cppcheck main.c --enable=all
Checking main.c ...
[main.c:7] -> [main.c:6]: (warning) Either the condition 'x==1000' is redundant or the array 'buf[10]' is accessed at index 1000, which is out of bounds.
[main.c:5]: (style) The scope of the variable 'buf' can be reduced.
[main.c:7]: (style) Variable 'buf' is assigned a value that is never used.
(information) Cppcheck cannot find all the include files (use --check-config for details)
```


分别对应的问题是：

- warning：buf越界；
- style：buf的定义范围可以更小，例如放在x==1000的判断条件之内；
- style：仍然是buf定义范围问题，如果程序没有在x==1000条件下执行，则buf根本就不会用到；
- information：无法找到头文件；
    - 可以使用--suppress=missingIncludeSystem选项忽略掉包含头文件的告警信息；
    - 也可以使用-I选项指定头文件所在的目录路径；

## **使用cppcheck对整个c源文件目录进行扫描**


以海思Hi3521DV100 SDK中mpp的sample源文件目录为例进行扫描：


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

- 可以看到，使用cppcheck对一个源码目录进行静态分析和扫描的过程与对单个C文件进行扫描类似，cppcheck会逐个递归的进入各个子目录，对其中包含的C源码文件进行扫描并输出扫描结果，开发人员只需要按照以上给出的结果对问题进行修改即可；

## **cppcheck的常用执行选项**

- cppcheck输出的消息提示类型使用--enable选项进行设置：
    - --enable=all：启用所有类型的消息提示；
    - --enable=warning：启用警告消息；
    - --enable=performance：启用性能消息；
    - --enable=information：启用信息消息；
    - --enable=style：启用可移植性和样式信息；
    - --enable=warning,performance：同时启用警告和性能消息；
- 保存cppcheck的分析结果到一个文本文件中，使用重定向命令即可
    - cppcheck sample --enable=all 2> err.txt；
- 多线程检查：选项 -j 用于指定需要使用的线程数，对于大型软件的静态扫描尤其有用
    - cppcheck -j 4 sample --enable=all；
- 使用--template选项格式化输出信息
    - 以gcc兼容的格式输出扫描信息：
        - cppcheck sample/ --enable=all --template=gcc；
    - 以Visual Studio兼容的格式输出扫描信息：
        - cppcheck sample/ --enable=all --template=vs；
    - 此外也可以使用自定义的方式来格式化输出扫描信息：
        - cppcheck --template="{file},{line},{severity},{id},{message}" sample/ --enable=all；
    - 以xml的形式输出扫描信息
        - cppcheck --xml-version=2 sample/ --enable=all 2> err.xml；
        - xml文件中的每一个error节点就是一条扫描输出信息；

## **参考资料**

- [【代码质量】C++代码质量扫描主流工具深度比较](https://blog.csdn.net/wetest_tencent/article/details/51516347)
- [Cppcheck 用法（上篇）](https://blog.csdn.net/u011012932/article/details/52778149)
