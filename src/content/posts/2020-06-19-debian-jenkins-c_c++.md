---
title: "在Debian/Linux环境下配置C/C++的Jenkins持续集成环境"
slug: "2020-06-19-debian-jenkins-c_c++"
description: "本文介绍了在Debian环境下搭建基于Jenkins的C/C++持续集成环境的流程。"
date: 2020-06-19T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["软件工程"]
tags: ["软件工程","Jenkins"]
draft: false
---


## **安装Java JDK环境**


从Oracle官网上下载最新版本的JDK包；


https://www.oracle.com/java/technologies/javase-downloads.html


当前最新版本是14.0.1。


因为是在Debian系统上使用，因此选择下载jdk安装文件的deb版本：jdk-14.0.1_linux-x64_bin.deb。


安装以上下载到的jdk deb包并查看安装位置：


```bash
pavel@debian:~$ sudo dpkg -i jdk-14.0.1_linux-x64_bin.deb
pavel@debian:~$ sudo dpkg -S jdk-14.0.1
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/legal/java.scripting/COPYRIGHT
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/lib/libsplashscreen.so
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/legal/jdk.jlink
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/legal/jdk.compiler/COPYRIGHT
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/jmods/jdk.incubator.jpackage.jmod
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/legal/java.management.rmi
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/jmods/jdk.compiler.jmod
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/conf/logging.properties
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/bin/jdeps
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/bin/jconsole
jdk-14.0.1: /usr/lib/jvm/jdk-14.0.1/man/man1/jaccesswalker.1
......
```


可以看到jdk deb包的安装路径为/usr/lib/jvm/jdk-14.0.1；


## **配置JDK的环境变量**


修改/etc/profile文件，追加以下内容：


```bash
JAVA_HOME=/usr/lib/jvm/jdk-14.0.1
PATH=$JAVA_HOME/bin:$PATH
CLASSPATH=$JAVA_HOME/lib:.
export PATH JAVA_HOME CLASSPATH
```


保存后执行source /etc/profile让修改立即生效。


查看环境是否安装成功：


```bash
pavel@debian:/usr/lib$ java --version
java 14.0.1 2020-04-14
Java(TM) SE Runtime Environment (build 14.0.1+7)
Java HotSpot(TM) 64-Bit Server VM (build 14.0.1+7, mixed mode, sharing)
pavel@debian:/usr/lib$ **echo** $JAVA_HOME
/usr/lib/jvm/jdk-14.0.1
```


## **安装Tomcat**


在tomcat官网下载最新的tomcat9版本：


https://mirror.bit.edu.cn/apache/tomcat/tomcat-9/v9.0.35/bin/apache-tomcat-9.0.35.tar.gz。


解压缩到/usr.local/share目录下。

- 执行bin目录下的startup.sh脚本启动tomcat服务；
- 执行bin目录下的shutdown.sh脚本关闭tomcat服务；

启动tomcat服务后在浏览器中访问ip address:8080来查看是否能够访问tomcat网页来判断环境释放安装成功。


## **安装配置Jenkins自动编译Github上的C代码**


从Jenkins官网（ https://www.jenkins.io/download/）上下载Generic Java Package(.war)版本的最新版本war包文件，目前的版本为2.222.4；


把以上下载到的war包放入tomcat安装目录的webapps目录下；


启动tomcat后访问ip address:8080/jenkins即可进入Jenkins配置界面。

- Jenkins的首次登录用户名为admin，密码为~/.jenkins/secrets/initialAdminPassword中的字符串；
- 在Jenkis中首次使用需要按照自己项目的需求，安装必要的插件，例如此处以编译Github上的C代码为例，至少需要在Mange Jenkins--->Manage Plugins界面安装Git插件；

在Jenkins中新建一个自由风格的项目任务；


设置源代码仓库的访问路径和账号信息：


![Untitled.png](/images/blog/在Debian-Linux环境下配置C-C++的Jenkins持续集成环境-1.png)


设置构建步骤，在Add Build Step中选择Execute Shell填写项目的构建脚本；

- 在构建开始时，Jenknis会从以上git仓库目录clone下来一份最新的代码到~/.jenkins/workspace目录下，所以首先进入这个workspace目录，然后就可以执行其中的编译脚本；

![Untitled.png](/images/blog/在Debian-Linux环境下配置C-C++的Jenkins持续集成环境-2.png)


此时就可以通过点击新建项目的Build Now选项来启动一次手动构建了，可以在console output中看到实时的构建流程的输出信息。


下一步就是实现构建的自动化触发设置。


## **配置自动编译的触发器**


Jenkins主要提供了以下四种类型的自动构建触发器：


![Untitled.png](/images/blog/在Debian-Linux环境下配置C-C++的Jenkins持续集成环境-3.png)


总的来讲：

- Triggers builds remotely（e.g. from scripts）：这个触发器的本质是向Jenkins服务器发送一个特定的HTTP请求，Jenkins收到并解析认证后就会自动执行一次构建过程。
    - 这种方式是最常用的，实际上无论是通过github的webhooks或者SVN服务器的post_commit脚本的执行，其本质都是在代码提交之后向Jenkins服务器发送了这么一条HTTP请求来自动启动构建过程。
    - 必须要确保Jenkins服务器能够接收到这个HTTP请求，例如如果Jenkins服务器部署在内网，外部网络或者其他子网部署的源码管理服务器无法访问Jenkins服务器，也就无法通过这种方式启动自动化编译了，因此一般情况下要么把jenkins服务器部署在外网，要么把Jenkins服务器和源码管理服务器部署在同一个内网；
    - 为了对远程触发构建的访问提供一定的保护，这种方式提供了一个Authentication Token的机制，只有HTTP请求中包含的token参数与Authentication Token的设置值一致的情况下才能成功触发构建过程；例如对于我的项目任务名为c_hello，Authentication Token也为c_hello的情况下，远程构建触发的URL为：localhost:8080/job/c_hello/build?token=c_hello;
- Build after other projects are built：比较适合于大型项目分为多个模块，进行序列化的整体构建流程，各个模块创建自己的构建任务，通过这种方式把整个应用的构建流程连接起来；
- Build periodically：按照自定义的周期性时间自动从仓库中下载代码执行一次构建；
    - 这种设置方式最简单，可以方便的检查仓库中最新代码的编译状态，缺点就是有的时候一段时间没有提交新的代码也会自动执行编译；
- Poll SCM：类似Build periodically，一样要设置自定义的周期时间，在设置的时间点检查仓库中的代码状态，有变化的情况下才会执行一次自动构建；
    - 缺点是会定期检查仓库中的文件更新状态，对源码管理服务器造成一定的访问负担；

注意：


如上所述，在日常的使用中，应用最多的自动触发方式应该就是Triggers builds remotely（e.g. from scripts）模式。在配置为这种方式的情况下，源码管理服务器如SVN或者Git服务器在接收到代码提交等动作后，会自动按照以上选项所描述的HTTP URL的方式向Jenkins服务器提交一次自动构建请求。


简单来讲，既然这次构建是由源码管理服务器向Jenkins服务器发起的HTTP请求来触发的，那么最基本的就是要保证源码管理服务器发出的HTTP请求能够被Jenkins服务器接收到，这样就要求：

- 源码管理服务器与Jenkins服务器部署在同一个子网中或者能够在一个子网中相互访问，这一点也是大多数中小型公司的标准做法；
- 或者：Jenkins服务器部署在公网中有独立公网IP，源码管理服务器部署在公网/内网中，这样也可以保证源码管理服务器发出的HTTP请求能够被Jenkins服务器接收到；
- 如果Jenkins服务器部署在内网中，代码管理服务器部署在公网中或者直接提交在Github这样的代码托管平台，就需要使用端口映射的方式把部署在内网的Jenkins服务端口映射出来，确保在公网的代码管理服务器能够访问到部署在内网的Jenkins服务；
