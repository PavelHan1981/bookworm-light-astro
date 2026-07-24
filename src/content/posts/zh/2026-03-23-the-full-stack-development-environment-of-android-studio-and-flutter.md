---
title: "Android Studio+Flutter全栈开发环境的搭建及其注意事项"
slug: "2026-03-23-the-full-stack-development-environment-of-android-studio-and-flutter"
description: "本文完整的记录了在Windows环境中基于Android Studio+Flutter的全栈开发环境的搭建过程，整个过程其实并不复杂，但因为概念众多，再加上中国国内网络访问Google服务器不方便等问题，在首次搭建并测试环境中存在不少值得注意和记录的问题，在此做完整的记录，方便后续开发过程中参考。"
date: 2026-03-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["全栈开发"]
tags: ["flutter","Android","全栈开发"]
draft: false
---


本文完整的记录了在Windows环境中基于Android Studio+Flutter的全栈开发环境的搭建过程，整个过程其实并不复杂，但因为概念众多，再加上中国国内网络访问Google服务器不方便等问题，在首次搭建并测试环境中存在不少值得注意和记录的问题，在此做完整的记录，方便后续开发过程中参考。


## Flutter SDK的下载和环境变量设置


从中国国内的镜像源下载Flutter SDK，参考[Flutter SDK 归档列表](https://docs.flutter.cn/install/archive)，选择Windows系统的Stable Channel选择下载即可，下载速度要比官方默认源下载快很多：


![d99ea2d7-2389-4625-b608-a1796c881a53.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-1.png)


**下载后无需安装，只需要把 Flutter SDK 压缩包解压缩到一个固定的路径中，并把该SDK包中Bin目录的路径设置到Path环境变量中即可。**


此外针对国内的网络环境，还需要通过增加环境变量的方式修改 Flutter 社区的地址，在环境变量的用户环境变量中增加两个环境变量：`PUB_HOSTED_URL` 和 `FLUTTER_STORAGE_BASE_URL`。


```python
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```


![7024f394-d4b1-4a8b-8e8e-9fee7ad6de79.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-2.png)


此时，在Windows终端中应该可以通过`flutter --version`查看当前flutter sdk版本：


```python
(base) PS C:\windows\System32> flutter --version
Building flutter tool...
Running pub upgrade...
Resolving dependencies... (1.6s)
Downloading packages... (4.6s)
Got dependencies.
Flutter 3.41.5 • channel stable • https://github.com/flutter/flutter.git
Framework • revision 2c9eb20739 (5 days ago) • 2026-03-17 16:14:01 -0700
Engine • hash c1db59d880ca73dd86cec08a6663f287522d9f39 (revision 052f31d115) (5 days ago) • 2026-03-17 20:29:11.000Z
Tools • Dart 3.11.3 • DevTools 2.54.2
```


## Android SDK的安装和配置


从Android Studio中文官网下载最新版本的Android Studio并安装：[下载 Android Studio 和应用工具 - Android 开发者  |  Android Developers](https://developer.android.google.cn/studio?hl=zh-cn)。


Android Studio安装完成以后，首次打开还需要在线安装 SDK和NDK等工具，这些工具包也动辄数GB的大小，因此在首次运行Android Studio安装SDK的过程中选择Cutom方式，首先设置HTTP Proxy后再继续后面的SDK安装环节，否则SDK的下载环节会很让人崩溃，可设置的常用Proxy列表如下：


```python
华为镜像：https://developer.huawei.com/repo/
豆瓣镜像：https://mirrors.douban.com/android/sdk/
腾讯：    https://mirrors.cloud.tencent.com/AndroidSDK/
阿里：    https://mirrors.aliyun.com/android.googlesource.com/
```


![b5eda9af-5302-4c0f-bcb3-c7c5fa3727d0.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-3.png)


默认情况下 Android Studio 在安装SDK的过程中不会安装命令行工具（Android SDK Command-line Tools），但 Flutter 必须通过它来操作镜像，所以还需要额外安装命令行工具。此外，因为后续我计划要基于Flutter来开发需要调用C/C++语言的音视频和AI模型方面的包和库，还需要安装Android NDK包。


因此，在SDK安装完成后还需要进入 Settings 页面额外安装以下SDK包：


![766a7d54-6774-4cef-a456-16a5faf546bf.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-4.png)


此外，还要在Android Studio中安装下一步使用Flutter进行开发的两个插件：Flutter和Dart。


![4d4dfa01-4df5-4623-b865-6f1a1174c997.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-5.png)


至此，Flutter SDK、Android Studio及其相关的SDK、Flutter 插件等均安装完毕。


## 环境测试与验证


下一步在基于Android Studio中使用 Flutter 进行开发之前，可以在终端中使用 `flutter doctor` 命令检查当前环境的正确性。而在此之前首先通过 flutter doctor --android-licenses 命令并通过按下多次 y 按键来确认一些 Android 的license。最终的 flutter doctor命令的输入大致类似于：因为我不关注web开发，所以不关注此处的Chrome浏览器的报错信息，如果需要web开发的话，额外安装一下Chrome浏览器就可以了。


```python
(base) PS C:\windows\system32> flutter doctor
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Doctor summary (to see all details, run flutter doctor -v):
[√] Flutter (Channel stable, 3.41.5, on Microsoft Windows [版本 10.0.26200.8037], locale zh-CN)
[√] Windows Version (Windows 11 or higher, 25H2, 2009)
[√] Android toolchain - develop for Android devices (Android SDK version 36.1.0)
[X] Chrome - develop for the web (Cannot find Chrome executable at .\Google\Chrome\Application\chrome.exe)
    ! Cannot find Chrome. Try setting CHROME_EXECUTABLE to a Chrome executable.
[√] Visual Studio - develop Windows apps (Visual Studio 生成工具 2022 17.14.25 (January 2026))
[!] Proxy Configuration
    ! NO_PROXY is not set
[√] Connected device (3 available)
[√] Network resources

! Doctor found issues in 2 categories.
```


## Gradle 换源


到此还没有结束，在Android Studio中编译和打包Android APK的时候还需要用Gradle，这同样牵扯到一大堆工具的下载。


在 Android APP的构建过程中，Android 的构建脚本 `gradle` 默认会去从 Google 和 MavenCentral 下载各种依赖包，中国国内网络很容易在这个包下载的过程中卡住，所以需要更改依赖包下载服务器的源地址。


在网上大概搜了一下，大部分都提到通过手动修改 `gradle/wrapper/gradle-wrapper.properties` 文件修改默认的gradle.org镜像，以及在 `android/build.gradle`文件中修改其中的 `allprojects` 等解决方案。这种方式很直观简单，但问题是：以后每次新建一个项目，都需要自行手动去修改这两个文件才行，如果忘记的话就会到外网去下载依赖文件，耗时会非常长。


而我希望做到的是直接把这些修改放到整个环境中，这样每次新建的flutter项目在 build android app的时候自动把下载的服务器地址链接到国内的镜像，而不是访问外网的中心服务器。具体的方式就是在 Gradle 的安装目录（例如我的gradle的安装路径是`D:\Android\.gradle`，默认的安装路径应该是C盘用户目录下的.gradle目录）下创建一个`init.d`目录，在其中放一个`mirror.init.gradle.kts`文件，内容为：


```kotlin
gradle.settingsEvaluated {
    dependencyResolutionManagement {
        // 允许在项目和 init 脚本中添加仓库，解决冲突
        repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS) 
        
        repositories {
            maven { url = uri("https://maven.aliyun.com/repository/google") }
            maven { url = uri("https://maven.aliyun.com/repository/public") }
            maven { url = uri("https://maven.aliyun.com/repository/jcenter") }
            maven { url = uri("https://repo.huaweicloud.com/repository/maven/") }
            maven { url = uri("https://storage.flutter-io.cn/download.flutter.io") }
            google()
            mavenCentral()
        }
    }
}

gradle.projectsLoaded {
    rootProject.allprojects {
        tasks.withType<org.gradle.api.tasks.wrapper.Wrapper> {
            val originalUrl = distributionUrl
            if (originalUrl.contains("services.gradle.org/distributions")) {
                val zipName = originalUrl.substringAfterLast("/")
                val mirrorUrl = "https://mirrors.cloud.tencent.com/gradle/$zipName"
                logger.lifecycle("✅ Vibe Optimizer: Redirecting Wrapper to $mirrorUrl")
                distributionUrl = mirrorUrl
            }
        }
    }
}
```


这样在 Gradle 每次加载的时候，都会自动替换与其相关的下载服务器的URL，替换为国内的镜像服务器地址，这样下载速度会快很多。


## 调试


至此，以上的完整过程就总算是完成了。其实整个过程并不复杂，关键是国内网络访问外网不方便，从外网服务器上的下载速度会非常让人抓狂，而Android Studio/SDK/NDK/Flutter/Gradle等多个环节又需要下载很多包才能完成环境的搭建。好在有国内众多的镜像服务器可以中转，让这个过程和环境一旦完成搭建之后，后续的开发就比较顺畅了。


接下来就是经典的调试过程了，**直接在终端中使用Gemini Cli这类终端开发工具或者使用Trae这类 AI IDE 进行代码的修改，然后通过****`flutter devices + flutter run + r`****这样的黄金组合进行代码的调试和运行了。正常开发的过程中不需要再打开Android Studio了，只需要使用Android Studio管理和更新自己的SDK就好了。**


## 参考资料

- [在中国网络环境下使用 Flutter](https://docs.flutter.cn/community/china/)
- [Android Studio快速配置国内镜像源和HTTP代理_android studio 国内代理-CSDN博客](https://blog.csdn.net/2402_87587715/article/details/143419739)
