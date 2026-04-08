---
title: "MFI Software Token认证服务器规范解读"
slug: "2024-12-05-the-suammray-of-MFI-software-token-authentication-server-specification"
description: "本文重点解读了Apple的《Software Token Authentication Server Specification》规范文档，对Apple MFI认证所需要的配件厂商服务器的部署要求，以及配件厂商服务器与Apple Server之间的交互流程进行了完整的整理。"
date: 2024-12-05T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["物联网"]
tags: ["MFI"]
draft: false
---


本文是对《Software Token Authentication Server Specification》这份Apple MFI认证文档的学习总结。通过深入理解这份文档，可以清晰地了解所有使用software token的Apple外设产品在MFI认证过程和产品的生成中，如何申请和管理Token以及如何在生产线上完成Token的写入和注册。


## 基于Software Token的MFI认证需求简介


对于Apple MFI认证的外设产品而言，以下三类产品可以支持使用Software Token（而不是MFI硬件加密芯片）来进行产品使用中的验证和鉴权：

- HomeKit
- AirPlay 2 audio
- Find My network

当然，硬件上省掉了MFI加密芯片的费用，但是配件厂商如何向Apple申请这些需要内置在配件固件中的Token，以及如何妥善的管理好这些Token，则需要额外花费一些工夫。


对于这类基于Software Token的配件生产而言，Apple在规范文件中有如下要求：

- 该型号产品在开发和生成之前必须要首先向Apple提交开案申请，Apple审核通过以后会给这个型号的产品发布一个PPID，有了PPID，配件厂商才能向Apple申请Token。
- 配件厂商必须要部署一台专门与Apple Server通信的服务器，用于向Apple Server通过预定义的HTTPS Restful API批量申请Token。配件厂商要有能力管理好这些申请到的token，并在产品量产的过程中把token通过产测软件写入到产品的固件中。每一台量产产品的token都不一样，配件厂商需要做好管理，生产完成后同样向Apple Server上报在产线上已经写入产品的token列表。
- 此外针对生产中尚未用完的token，配件厂商同样需要把这些未使用的token列表批量上报给Apple server进行销毁操作。

因此，对于这类产品的生产和开发而言，配件厂商需要首先要部署一台服务器，能够按照Apple定义的HTTPS Restful API与Apple Server进行通信。


## 服务器双向认证证书的申请


首先一点，配件厂商的服务器要能够与Apple Server之间在通信建立之前要先进行双向认证，双向认证通过后才能建立真正的业务通信。而要进行完整的双向认证，厂商就必须要在服务器之间进行通信之前向Apple申请一个经过Apple签名认证过的双向认证证书，并且部署在自己的服务器上。


厂商服务器双向认证证书的申请流程：

- 首先，配件厂商需要先使用keytool工具生成一个证书签名请求文件CSR，在这个请求文件中应该包含这个配件厂商的公司名称字符串和MFI账号（应该是一个6位数字）。
- 登录MFI Portal账号，在Software Authentication Certificate Request下的Resources页面中，点击+New Request按钮，即可提交CSR证书给Apple进行审核。审核通过后，Apple Server就会返回一个签名证书，此时配件厂商应该把这个证书部署在自己与Apple Server通信的服务器上，用于后续两个服务器之间的双向认证通信。
    - 注意，Apple的这个签名证书的有效时间是两年，配件厂商应该在这个证书过期之前在MFI Portal去更新证书。更新证书的流程与申请新前面证书的流程相同，拿到更新证书后应立即部署到自己的服务器上。
- Apple签名证书在厂商服务器上部署完成后，就可以尝试使用Apple预定义的HTTPS Restful API向apple server发出请求进行通信了。

## 配件厂商服务器与Apple Server之间的交互流程总结


对于以上支持Software Token Based MFI认证的三种品类的MFI外设而言，不同外设产品类型向Apple Server申请software token的Apple Server URL是不同的：

- HomeKit： [https://sauth-external.apple.com](https://sauth-external.apple.com/)
- AirPlay 2 Audio： [https://swa.apple.com](https://swa.apple.com/)
- Find My network： [https://swa.apple.com](https://swa.apple.com/)

因此对于配件厂商而言，就需要按照自己所开发和生成的MFI配件类型，选择不同的URL与之通信来申请token。


配件厂商的服务器与Apple Server之间的通信，是标准的基于HTTPS的Restful API的访问形式，每次通信均由配件厂商的服务器发起请求，Apple Server返回应答信息。每一次请求对应一个操作，两者之间的通信所要实现操作主要包含以下几项：

- 批量申请Token
- 获取包含token的CSV文件的文件名列表
- 根据获取的CSV文件列表下载CSV文件
- 向Apple Server注册量产产品已经使用的token列表
- 批量申请销毁未使用的token列表

### 1. 批量申请Token


配件厂商向Apple申请该型号的配件开发与生产的项目经过appprove以后，Apple就会针对这个型号的配件提供一个Product Plan ID，以及默认为这个配件型号提供一定数量的software token（开发阶段是1000个，量产阶段是1百万个）。此时配件厂商就可以向Apple Server批量申请开发或者量产要使用的token。


批量申请Token的restful API是：api/v1.0/external/authEntityRequests。同时需要在请求消息中以json传递这个型号产品的PPID和要申请的token数量。


Apple Server对请求消息进行确认后，在其发回的应答消息中，返回一个Request ID（这个Request ID后续会被用于下载token）以及可以下载这批token列表的时间字符串。配件厂商必须要在这个时间之后向Apple Server进一步请求下载token列表。


### 2. 获取CSV文件名列表并下载


从Apple Server申请到的token列表会被apple server保存在一个CSV文件中，这个文件中的每一行都对应一条token。

- CSV文件中每一行所包含的token的格式：<PPID>,<TOKENID>,<Base64-encoded Token>,<CRC32 in HEX>,<CRLF>

每次CSV文件中最多可以保存2000个token，因此如果一次性请求的token比较多的话，Apple Server会针对这次请求生成多个CSV文件。


因此对于Token列表下载的这一步，实际上包含由两个API，分别是获取CSV文件列表的名称以及下载指定的CSV文件。


首先通过以下API获取这批token所保存的CSV文件的名称列表：api/v1.0/external/authEntities/{request_id}。此处需要使用批量申请Token流程中，Apple Server所返回的Request ID作为参数向Apple Server发起请求。


针对以上CSV文件名称列表的请求，Apple Server会在应答消息中以Json形式返回CSV文件的数量，以及CSV文件名称的列表。


接下来，配件厂商的Server就需要使用以下API向Apple Server下载CSV文件：api/v1.0/external/authEntities/{request_id}/{file_name}。其中的request_id就是批量申请token这一步Apple Server所返回的request id，而file_name就是前一步所获取到的CSV文件命令列表中所包含的文件名。因此，Apple Server针对这次token申请生成了多少了CSV文件，就需要调用多少次文件下载的API把这些文件一个个下载下来。


至此，Token申请以及从Apple Server上下载的流程就已经完成了。下一步就是配件厂商需要在量产产品的产线上把这些Token逐个写入到要出货的产品固件中。


### 3. 已使用Token向Apple Server的批量注册


接下来，在这个批次生产完成后，配件厂商还需要把这个批次生产过程中使用的token列表上报给Apple Server，表示这些token已经被用于量产的产品中。这样这些已出货的配件后续在终端用户首次配对使用的时候，才能够通过Apple Device的验证，成功绑定到用户的Apple账号之中。


配件厂商服务器向Apple Server上报注册已使用Token列表的API是：api/v1.0/external/bulk/usedAuthEntities。


在请求消息中应包含该配件的PPID以及要上报的token列表。Apple Server则会对这次请求返回一个Request ID。


值得注意的是，请求消息中所包含的token列表中的每一个Token元素都是Token ID : UUID这样的形式，那么这个UUID是怎么来的呢？


事实上，所有的Token都是向Apple Server申请，由Apple Server返回给配件厂商Server。在量产过程中，实际上除了要写入这个token到配件产品固件中之外，还需要写入一个由厂商自行生成和管理的、独一无二的UUID到固件中。


也就是说，针对每一个token，厂商Server应该要同时生成一个独一无二的、符合RFC4122 Type 4规范的UUID，token和UUID建立一一对应关系，生产的过程中同时写入产品的固件之中。Token和UUID之间的这个一一对应的关系也需要在量产之后上报给Apple Server。


为什么要搞得这么复杂？通过Token的唯一性不就可以实现对外设产品的验证了吗？实际上这个设计与后续用户可能进行的恢复出厂操作有关。产线阶段写入的这个token会被用于用户首次使用和绑定的流程之中，按照Apple的安全性设计，每个token只能被在首次激活和绑定的时候使用一次。因此如果用户把这个配件恢复出厂设置的时候，apple device就会给配件下发一个新的token，替代掉之前已经用过的token（也就是在产线上写入的那个token），以用于下次重新配对到新的apple账号中使用。也就是说，Token在这个配件后续的使用过程中是有可能被修改的，这个时候就需要一个固定不变的ID用来标记这个配件产品，这个ID就是配件厂商需要在量产时与token同步写入固件的UUID。后续的使用过程，token可能会发生变化，但是UUID永远不会发生变化。


### 4. 未使用完的Token向Apple Server的批量销毁


除了以上常规的流程以外，针对那些申请了过多token，这些token在配件产品的这次量产中没有用完的情况下，Apple还提供了一个销毁token的流程，避免token被白白浪费。


当配件厂商在本次生产批次结束后，如果还有多余的token尚未用完，应该在其服务器上使用以下API申请销毁这些未使用的token：api/v1.0/external/bulk/unusedAuthEntities。在这个API的请求结构体中，应该包含这个配件产品的PPID，以及要销毁的token ID（因为这些token没有用于生产，也就不存在与之对应的UUID）。相应的，Apple Server在收到这个请求以后，会返回一个Request ID。


## 配件的激活流程


对于MFI配件的生产和使用而言，除了以上所描述的配件厂商服务器与Apple Server之间的交互，以及在量产过程中写入Token和SSID信息，并且上报给Apple Server之外，还存在一个配件首次使用的激活流程。


配件生产后进入市场销售，提前在生产阶段写入了token和厂商生成的UUID。那么在用户首次激活这个设备，并且尝试与自己的Apple device和账号绑定的流程之中（使用Apple Home APP或者Find My APP），Apple device会向配件请求读取其token，读到以后Apple Device还需要进一步Apple Server进行通信，把这个token发给Apple Server在云端进行校验和验证，确认其是合法的MFI外设设备。只有Apple Server验证通过的情况下，这个设备才能完成绑定的流程并正常使用。


## 参考文档

- Software Token  Authentication Server  Specification  Release R2.1
