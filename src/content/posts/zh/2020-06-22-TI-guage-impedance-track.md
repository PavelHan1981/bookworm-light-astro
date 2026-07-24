---
title: "TI的电量跟踪技术Impedance Track学习总结"
slug: "2020-06-22-TI-guage-impedance-track"
description: "本文基于对TI相关文档的学习，总结的TI电量计所采用的Impedance Track技术的基础知识。"
date: 2020-06-22T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["硬件"]
tags: ["硬件","锂电池","电量计"]
draft: false
---


## **电池及电量计的主要参数列表：**

- QMax：电池的总的化学容量；
- OCV：Open Circuit Voltage，电池输出的开路电压；
    - 通常认为电池耗电处于Relaxation状态（此时的电流很小）下的电池电压也是OCV电压；
- DOD：Depth of Discharge，放电深度；
    - 电量计内部包含有放电深度DOD与电池开路电压OCV之间的查找表，在电池无负载即开路的状态下通过查这个表可以得到比较准取的电池放电情况；
    - 电量计算法计算得到的DOD，决定了是否应该更新当前的电池内阻参数，以及开始计算和更新RC/FCC的时机。
- SOC：State of Charge，实际上也就是当前剩余电量的百分比；
    - 具体的计算公式为SOC=Q/QMax=RM/FCC；
- RM：Remaining Capacity，剩余的电池容量；
    - Remaining capacity calculations occur immediately after discharge onset, at every resistance update, and after entering relaxation mode。
- FCC：Full-Charge Capacity，满充情况下的电池可以实际使用的容量；
    - FCC实际上是电池在满充状态下，以一定的放电速度放电到截止电压的情况下，电池释放出来的总的容量，实际上此时电池内部仍然残留部分容量，也就是Reserve Capacity。
    - 与放电速度和当前温度有关，放电速度越快，温度越低的情况下，FCC越小，因为在这种情况下电池内阻的存在导致电池更快到达截止电压；
- Ra：电池内阻参数
    - 电池内阻在不同的放电深度情况下不同，电量越低电池内阻越大，在接近电池截至电压时达到最大；
    - 电量计在校正过程中会根据电池的情况自动计算出来的15组电池内阻参数Ra0-Ra14，同时这些内阻参数在Impedance Track算法运行的过程中动态更新；
    - 电池内阻的计算公式：（OCV-BatteryVoltageUnderLoad）/AverageLoad Cuurent；

## **影响电量计算的因素**

- 负载状况
    - 下图中实线和虚线分别为在一定的负载影响下和无负载情况下的电池电压---电量曲线；

    ![Untitled.png](/images/blog/TI的电量跟踪技术Impedance-Track学习总结-1.png)

- 温度

    ![Untitled.png](/images/blog/TI的电量跟踪技术Impedance-Track学习总结-2.png)

- 充放电循环次数（老化）
    - 电池内部的电量随着充放电次数的增加逐渐减少，也就是电池在使用过程中的老化现象。
    - 

    ![Untitled.png](/images/blog/TI的电量跟踪技术Impedance-Track学习总结-3.png)


## **电量计电量计算模式的切换**


三种电量计算状态：Relaxation，Charging，Discharge。


三个电流阈值：Quit Current Threshold，Charge Current Threshold，Discharge Current Threshold。


三个Relax Time：Charge Relax Time，Quit Relax Time，Discharge Relax Time。


![Untitled.png](/images/blog/TI的电量跟踪技术Impedance-Track学习总结-4.png)

- 电量计电量计算模式处于Charging模式的情况下：当电量计检测到的平均电流小于Quit Current Threshold，并且维持时间的长度大于Charge Relax Time，电量计的电量计算模式由Charging模式切换为Relaxation模式；
- 电量计电量计算模式处于Relaxation模式的情况下：当电量计检测到的平均电流大于Discharge Current Threshold，并且维持时间大于Quit Relax Time，电量计的电量计算模式由Relaxation模式切换为Discharging模式；
- 电量计电量计算模式处于Discharging模式的情况下：当电量计检测到的平均电流小于Quit Current Threshold，并且维持时间的长度大于Discharge Relax Time，电量计的电量计算模式由Discharging模式切换为Relaxation模式；
- 电量计电量计算模式处于Relaxation模式的情况下：当电量计检测到的平均电流大于Charge Current Threshold，并且维持时间大于Quit Relax Time，电量计的电量计算模式由Relaxation模式切换为Charging模式；

## **在不同模式下评估电池的放电深度DOD**


在Relaxation状态下，电池进入Relaxation模式超过30min之后，开始检测电压的变化情况，如果dv/dt<4uV/s的条件成立（即电池电压的变化幅度极小），电量计会每100s测量一次电池的开路电压，然后基于电量计内置的OCV-DOD曲线计算当前的放电深度更新到参数DOD0中，同时把参数PassedCharge复位为0；

- 在这个过程中，如果通过电量计的电流不为0，还需要对读取到的OCV做IR补偿：根据在这个放电深度状况下的查找与该放电深度对应的电池内阻参数Ra，然后使用校正后的OCV'(OCV'=OCV-I*Ra)查OCV-DOD曲线计算当前的放电深度；

而在电池处于Charging或者Discharging的状态下，当前的放电深度DOD使用以下公式进行计算：


DOD=DOD0+PassedCharge/QMax；

- 其中的DOD0是在电池处于Relaxation状态的情况下最后更新的DOD参数，PassedCharge也是在电池上次更新DOD参数时复位为0，开始累积通过电量计的电量；
- **实际上电池的OCV与放电深度DOD之间的对应关系/查找表内置在电量计芯片中，也就是所谓的Chemistry Profile。对于BQ27426而言，这个电量计芯片中内置了3种Chemistry Profile（也就是电量计的预定义放电曲线），分别对应于标准的4.2V、4.35V和4.4V锂电池，可以通过ChemID命令读取和设置要使用的Chemistry Profile。而对于一些相对特殊的锂电池，TI的BQ2750x系列的电量计芯片支持通过写入一个.senc电量计参数文件来实现电量计曲线的自定义支持。**

## **QMax的更新**


QMax在两次独立的DOD更新（即这两次DOD更新之间必须要包含一个Charge或者Discharge状态）之后进行计算；

- 即DOD1在Relaxation状态下测量后保存下来，然后进入Charge或者Discharge状态，然后重新进入Relaxation状态后完成新的DOD2测量之后，基于以下公式更新QMax：
    - QMax=PassedCharge/|DOD2-DOD1|；
    - PassedCharge是两次DOD更新计算之间通过库仑计测量通过电量计的电量；
- DOD1和DOD2更新时一定要保证电量计处于深度的Relaxation状态，即进入Relaxation状态超过半小时，并且dv/dt<4uV/s的条件成立；

为了确保QMax更新计算的准确度和精度，以上更新在温度高于40摄氏度，或者低于10摄氏度的情况下不会进行；在DOD1和DOD2其中一个电压处于3737mV和3800mV之间也不会进行更新；


## **电池内阻Ra的更新**


电池内阻在电池处于放电状态Discharge状态下进行计算和更新。


按照以下公式计算当前DOD情况下的内阻参数：

- dV=V-OCV（DOD，T）
- R(DOD)=dV/I

以上公式中V为在当前放电状态下测量到的电池电压，OCV（DOD，T）为根据电池内部曲线通过当前DOD查表得到的开路电压；


以上电池内阻参数在电池处于放电状态下持续运行计算保存在内存中，在DOD状态进入以下节点时写入Data Flash：


```plain text
Index   SOC    DOD
Ra 0  100%      0
Ra 1  88.9%     11.1%
Ra 2  77.8%     22.2%
Ra 3  66.7%     33.3%
Ra 4  55.6%     44.4%
Ra 5  44.5%     55.5%
Ra 6  33.4%     66.6%
Ra 7  22.3%     77.7%
Ra 8  19%        81%
Ra 9  15.7%     84.3%
Ra 10 12.4%    87.6%
Ra 11 9.1%      90.9%
Ra 12 5.8%      94.2%
Ra 13 2.5%      97.5%
Ra 14 0%        100%
```


## **RM、FCC和SOC的计算和更新**


RM(Remaining Capacity)使用电压模拟（Voltage Simulation）的方式来进行计算，大体的流程是：


从当前的DOD也就是DODStart开始计算：


DODStart=DOD0+PassedCharge/QMax；

- DOD0是上次电池处于深度Relax模式下根据电池开路电压测量到的放电深度；
- PassedCharge是从上次DOD0测量开始计算通过电量计的电量；

基于以下公式模拟计算带载状态下的放电曲线：


V(DODx,T) =OCV(DODx,T)+ I×R(DODx,T)

- DODx是从DODStart开始，以4%的递增步进速度进行曲线的递增计算；
- OCV(DODx,T)为该DOD状态和温度状态下，得到的对应开路电压；
- I为当前的负载电流大小；
- R(DODx,T)为该DOD状态和温度状态下，对应的电池内阻大小；
- V(DODx,T)为该DOD状态和温度状态下，模拟计算得到的带载状态下的电压大小；

配合下图对以上计算过程进行理解：


![Untitled.png](/images/blog/TI的电量跟踪技术Impedance-Track学习总结-5.png)


通过以上模拟曲线进行计算，当计算得到的V(DODx,T)等于电池的截至电压的情况下，通过查询电池OCV的放电曲线此时对应的DOD，就是所谓的DODFinal。


RM=（DODFinal-DODStart）*QMax；


FCC包含三个部分：


FCC=QStart+PassedCharge+RM。

- QStart是电池从满电状态下到DOD0状态下所消耗的电量；
- PassedCharge在DOD0更新的时候被复位为0，从此刻开始累积的通过电量计的电量；
- RM为按照以上电压模拟的公式计算到的剩余电量；；

SOC的计算公式如下：

- SOC=RM*100/FCC。

这个不断更新和计算的SOC就是最终提供给用户显示出来的电量的百分比。


## **参考资料：**

- SLUA450：Theory and Implementation of Impedance Track Battery Fuel-Guaging Algorithm in BQ2750x Family；
- SLUA375：Impedance Track Gas Gauge for Noices；
