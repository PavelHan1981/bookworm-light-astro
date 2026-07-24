---
title: "团队开发使用SVN的标准流程"
slug: "2022-07-12-svn-standard-workflow"
description: "基于对工作中开发团队代码管理流程的思考，以及对网络上相关资料的学习，完整的重新总结在团队中使用SVN来进行代码统一管理的工作流程。"
date: 2022-07-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["软件工程"]
tags: ["软件工程","SVN"]
draft: false
---


实际上SubVersion针对团队开发过程中使用SVN进行软件开发有一个自己的标准流程设计。


一个使用SVN来进行项目版本标准的软件项目，在项目的SVN库目录中应至少包含了以下三个目录：

- Trunk：主线分支代码。所有的代码都将在这个分支上进行合并处理。
- Branch：开发调试分支。所有的开发人员无论是解决bug还是开发新的功能，在此创建一个自己的开发调试分支，然后合并到Trunk上。
- Tag：正式版本发布分支。通过测试后以正式版本向外发布的版本，在这个分支上打上tag进行标记备份。

从各个分支的使用逻辑上来讲：

- 不应该在Trunk上直接进行开发提交。在Trunk分支上应该做的操作仅限于：
    - 通过svn copy命令创建新的开发分支；
    - 通过svn merge命令把branch上的开发分支的修改合并trunk分支上；
    - 通过svn copy命令在tag子目录下创建正式发布版本的备份；
- 对于branch的使用：所有的开发人员无论是解决trunk上代码存在的bug还是开发新的功能，基本的工作流程都是基于Trunk上的某次提交创建一个自己的开发分支，然后在自己的开发分支上进行开发调试。开发调试完成后，再合并到Trunk分支上。
    - 对于branch分支的使用，只应该使用svn copy在branch子目录下创建新的开发分支，然后后面的调试阶段的提交都在这个开发分支中提交，调试测试完成后再通过svn merge命令把代码合并到trunk上。
- 对于tag的使用：tag子目录仅用于保存通过测试的正式发布版本，方便后期进行快速追溯。既然tag分支仅用于保存备份正式发布版本，那么这个分支上保存的代码不应该改动，在这个分支上所做的唯一操作就是把trunk分支上已通过测试的正式版本使用svn tag命令拷贝过来。
    - 对于tag分支的使用，只应该使用svn copy命令从trunk分支上把已发布正式版本的代码备份一份过来；

**注意：无论是使用svn copy命令创建新的开发分支，还是使用svn tag命令给正式发布版本打标签，其背后执行的动作，实际上都是从trunk的某次提交上做了一次拷贝动作。把trunk上的代码从trunk子目录向branch或者tag子目录拷贝了一份。**


### 为什么不直接在Trunk上开发调试然后commit，这样就不需要Branch了？


其实如果是单人开发的项目的话，确实没有必要用branch分支了。所有的开发调试都只需要提交到trunk分支上进行维护就好了。


增加branch分支主要就是解决多人同时开发一个项目的问题。如果所有开发人员都在同一个trunk上提交代码，大量的不稳定的、未完成的中间代码交叉上传到同一个trunk分支上，势必会造成很多的冲突，导致trunk分支的代码不稳定，开发人员的很多精力不得不反复投入到解决中间版本冲突的无效工作上。

- 如果所有人在一个调试开发子任务未完成的情况下，暂时不提交代码。所有人都等到自己要解决的问题解决并测试后再提交代码，能否解决问题？这样确实可以解决中间版本相互冲突的问题，但问题是中间开发状态下的调试代码就只能先保存在开发人员本地电脑上，随时有丢失代码的风险。而引入软件版本管理系统的其中一个很重要的目的就是：能够在一个服务器上把所有人即使处于开发状态的代码也能够备份起来，避免因为任何原因丢失。

因此，综合来讲，导入branch来同步管理多人开发的工作就是最合适的流程：

- 所有人都在自己的调试开发分支上提交代码，因为只有自己在向自己的开发分支上传代码，这样就可以避免与他人的中间状态版本发生提交冲突，引起无谓的稳定性问题。等到自己的调试工作完成后，再统一合并到trunk上，这样就不会发生中间调试状态版本的相互冲突问题，而开发人员中间开发状态的代码也有一个随时备份的地方，只要及时提交自己的代码，就不会担心因为自己开发机或者开发环境的问题造成代码丢失。
- 而trunk分支上只用于接收已经完成调试开发的代码的合并，这样就尽可能保证了trunk上代码的稳定性。

## 开发人员的工作流程

- 收到一个解决bug或者增加某项新功能的开发任务，首先从trunk的HEAD或者某次提交上使用svn copy命令在branch子目录下创建一个针对这次调试的新的开发调试分支；
- 此后，所有的调试开发工作的中间代码，都在这个开发调试分支中进行提交；
- 开发调试以及自测完成后，再使用svn merge命令合并到trunk上，解决合并中出现的冲突，并测试验证合并后功能的正确性；
- 针对一个正式集成版本而言，所有开发人员的开发调试分支代码合并到trunk，并完成开发人员自测后，发布集成版本测试指令；

### svn merge命令的工作流程


使用svn命令行来进行merge操作稍微有些难以理解，[参考文档](http://blog.darkmi.com/2015/08/11/3823.html)中提供了一份非常清晰的说明解释。


svn merge命令的基本用法：svn merge sourceURL1[@N] sourceURL2[@M] [WCPATH]

- 注意：进行svn merge之前，要先从trunk上checkout出来一份trunk的当前干净的代码，并进入这个trunk代码的目录来执行svn merge命令。
- sourceURL1[@N]的sourceURL表示要合并到主干的branch的URL， N则是这个branch从主干上刚开始创建的时候的提交编号；
- sourceURL2[@M]的sourceURL表示要合并到主干的branch的URL， M则是这个branch需要合并到主干的版本提交编号，如果是branch最后一次提交的话可以省掉@M；
- WCPATH表示要把以上两个参数所指定版本的差异，合并到本地的哪个目录下。如果要合并到当前目录下，直接用.来代替。

因此以上命令的执行逻辑就是：从开发分支sourceURL1上，找到两次提交N和M之间的差异生成diff文件，然后把这个diff文件的内容合并到WCPATH所指定的本地目录中。


以[参考文档](http://blog.darkmi.com/2015/08/11/3823.html)中给出的例子说明：

- svn merge proj/branches/proj_branch_1@101 proj/branches/proj_branch_1 .

以上命令就表示，从分支proj/branches/proj_branch_1的两次提交，101和最近一次提交之间的差异，然后把差异合并到当前目录所在的主干代码中。


需要注意的是：合并后的代码只保存在本地的WCPATH路径下，需要在这个路径下，再调用svn commit把合并后的代码上传到trunk下，这次合并才能真正应用在服务器的trunk分支下。


如何找到某个branch创建时的版本提交编号？

- svn log –stop-on-copy [branch url]

使用的主要命令示例：


```c
svn copy svn://xx.com/repo/trunk svn://xx.com/branch/pavelhan/bugfix-xxx -m “create bugfix-xxx branch”
svn checkout svn://xx.com/branch/pavelhan/bugfix-xxx
svn commit -m "change some code"

//checkout current trunk and cd trunk
svn merge svn://xx.com/branch/pavelhan/bugfix-xxx@N svn://xx.com/branch/pavelhan/bugfix-xxx .
svn commit -m "merge bugfix-xxx branch to trunk code"
```


## 测试人员的工作流程


版本的发布包括集成版本发布和正式版本发布，其中：

- 集成版本发布由开发人员发起，由测试人员测试：开发人员完成一个集成版本定义的功能和bug list的解决并完成自测后，在trunk上发布集成版本测试指令；测试人员收到集成版本测试指令后，从指定的trunk提交版本上下载代码，进行编译后开始测试；
- 集成版本测试完成后，根据测试结果决定是否发出正式发布版本，并把正式发布版本使用svn tag命令在tag子目录下备份。

使用的主要命令示例：


```c
svn checkout svn://xx.com/repo/trunk
svn copy svn://xx.com/repo/trunk svn://xx.com/repo/tags/V1.0 -m "V1.0 release version"
```


## 参考文档

- [svn merge 命令使用 | darkmi's blog](http://blog.darkmi.com/2015/08/11/3823.html)
- [[svn] linux命令——svn分支创建、合并 - 走看看 (zoukankan.com)](http://t.zoukankan.com/jiangzhaowei-p-5560394.html)
- [SVN trunk、branch、tag的用法 - 百度文库 (baidu.com)](https://wenku.baidu.com/view/57580790b3717fd5360cba1aa8114431b90d8e86.html)
