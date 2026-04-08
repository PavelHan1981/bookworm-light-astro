---
title: "开源软件项目学习中源码管理的最佳实践"
slug: "2026-03-03-the-best-study-practice-of-open-source-software"
description: "在基于Github上的开源软件（像 Ultralytics 这样活跃且更新频繁的仓库）进行二次开发或预研学习的过程中，最头疼的莫过于：项目源仓库中的上游代码始终处于频繁更新的状态，而我自己在学习和预研的过程中所做的修改到处乱飞，最后连我自己都忘了改过哪里，一单合并代码就出现大量冲突，解决起来非常低效。
本文基于对网络上查询到的资料进行学习，找到了解决以上问题的一个合理的技术路径。而这一套工作流程也是很多团队做开源项目预研过程中的标准做法。简单总结起来就是："
date: 2026-03-03T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["软件工程"]
tags: ["软件工程"]
draft: false
---


在基于Github上的开源软件（像 Ultralytics 这样活跃且更新频繁的仓库）进行二次开发或预研学习的过程中，最头疼的莫过于：项目源仓库中的上游代码始终处于频繁更新的状态，而我自己在学习和预研的过程中所做的修改到处乱飞，最后连我自己都忘了改过哪里，一单合并代码就出现大量冲突，解决起来非常低效。


本文基于对网络上查询到的资料进行学习，找到了解决以上问题的一个合理的技术路径。而这一套工作流程也是很多团队做开源项目预研过程中的标准做法。简单总结起来就是：<u>_**在Git 版本控制层面和 软件项目代码架构层面双管齐下，使用Fork + 分支隔离 + 模块化侵入的方式保证开源软件项目学习和研究的高效率**_</u>。
本文以Github上的[qiuqiangkong/audioset_tagging_cnn](https://github.com/qiuqiangkong/audioset_tagging_cnn)这个项目详细总结整个流程的具体实践方式。


### 1.Git 仓库与分支架构的隔离


首先，不要直接克隆Github上的原始仓库，然后把自己的修改简单的推送到 `main` 分支。而应该利用 Git 的 `Fork` 和 `Upstream` 机制，从原始仓库进行 fork 操作的同时，保持上下游仓库之间的关系。
点击 GitHub 上 [**audioset_tagging_cnn**](https://github.com/qiuqiangkong/audioset_tagging_cnn) **项目**的 `Fork` 按钮，将其派生到你自己的 GitHub 账号下。然后基于其主干分支 master 创建一个独立的 research 分支：


![366088a7-9efe-4461-80ff-c4f630499595.png](/images/blog/开源软件项目学习中源码管理的最佳实践-1.png)


**后续在学习和预研的过程中，要确立严格的分支使用规范：**

- **master 分支：** 绝对不要在这个分支上修改代码！这个分支**仅用于**同步官方仓库的最新代码。
- **research 分支：** 该分支是专门的预研和学习的工作区。所有的代码实验、修改都在这个分支上进行管理和维护。

然后把自己 Github 账号下的 audioset_tagging_cnn 项目 clone到本地：


```bash
git clone https://github.com/你的账号/audioset_tagging_cnn.git
cd audioset_tagging_cnn
```


**此时，还有关键的一步：需要与**原始的官方仓库绑定，使其作为 master 分支的上游（Upstream），后续 master 分支就是要从这个 upstream 来同步原始仓库的最新代码：


```bash
(new-env) PS D:\Code\Github\audioset_tagging_cnn> git remote add upstream https://github.com/qiuqiangkong/audioset_tagging_cnn.git
(new-env) PS D:\Code\Github\audioset_tagging_cnn> git remote
origin
upstream
```


### 2.同步上游仓库代码的更新流程


通过以上流程已经把原始仓库 [qiuqiangkong/audioset_tagging_cnn](https://github.com/qiuqiangkong/audioset_tagging_cnn) 设置为上游仓库路径，那么后续在原始仓库中的代码有更新的情况下，就可以使用以下流程把更新的代码同步到本地的 master 和 research 分支：


```bash
# 1. 切换回 master 分支
git checkout master
# 2. 拉取官方最新代码到master分支
git fetch upstream
git merge upstream/master
# 3. 将本地最新的 master 分支推送到自己的 github 仓库中进行备份
git push origin master
# 4. 切换回 research 分支，并将官方更新 rebase（变基）或 merge 进来
git checkout research
git merge master  # 或者 git rebase master
```


以后在上游的原始仓库有更新的情况下，每隔一段时间执行一次上面的流程，就可以把上游的更新合并到自己仓库的 master 和 research 分支上。


### 3.目录结构的隔离


即使是在 `research` 分支中，也应该避免把自己写的测试脚本等随便丢在根目录或官方的源码包里。


更合理的做法是：在项目的根目录下建立一个带有特殊前缀的文件夹（例如 `_my_research/`，下划线能让它在目录树中置顶，方便查找），把自己的测试脚本、推理代码、自定义配置文件统一放在这个目录下。


如下图所示，在预研和开发过程中自己所产生的所有文件应该统一放到这个特殊的文件夹中，避免影响到原始仓库中的代码和文件。


![0591d6e3-cf31-4c02-8cb0-3f5d27365a92.png](/images/blog/开源软件项目学习中源码管理的最佳实践-2.png)


### 4.使用 Editable Mode (开发模式) 安装（针对Python项目）


部分Python开源项目中，在调试和开发中需要安装并执行软件包到当前的python环境中（例如ultralytics项目中要在命令中中执行yolo命令，就需要安装ultralytics包），这类项目的根目录下一般包含有setup.py或者pyproject.toml文件。


为了能够在 `_my_research/` 里写的代码直接引用官方源代码中实现的模块，同时你在官方源码里所做的修改能立刻生效，应在虚拟环境中使用**可编辑模式**安装：


```bash
pip install -e .
```


开发者模式安装（pip install -e .）和普通安装之间的区别（pip install .）在于：

- 执行普通安装时，pip 会把当前源码目录里的所有 Python 文件**复制**一份，放入系统（或虚拟环境）的 `site-packages` 路径中。在这种情况下。如果在原来的 `ultralytics/engine/trainer.py` 里加了一行代码 `print("Hello CV")`，再次运行代码时，**这行打印信息无法打印出来**。因为系统执行的是之前复制的那份老代码。所以在调试的过程中每次改完代码，要使修改的内容生效的话，都必须重新执行一遍安装命令，非常麻烦。
- 而如果在安装这个软件包时使用了 `-e` 参数，pip就**不会直接**复制源码文件。相反，它会在系统的 `site-packages` 目录下建立一个快捷方式（通常是一个 `.egg-link` 的文件），这个快捷方式**指向当前源码目录**。在这种情况**，你在本地源码里做的任何修改，只要一保存，下次运行代码时会立刻生效，**不需要重复安装，这样对调试过程更友好。
