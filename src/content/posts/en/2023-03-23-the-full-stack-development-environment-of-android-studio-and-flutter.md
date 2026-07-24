---
title: "Setting Up the Android Studio + Flutter Full-Stack Development Environment and Key Considerations"
slug: "2026-03-23-the-full-stack-development-environment-of-android-studio-and-flutter"
description: "This article documents the complete process of setting up a full-stack development environment based on Android Studio and Flutter in a Windows environment. Although the overall setup is not overly complex, several noteworthy issues arise during the initial configuration and testing due to the numerous concepts involved and network connectivity issues when accessing Google servers from mainland China. I have compiled this comprehensive guide for future reference during development."
date: 2026-03-23T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Full-Stack Development"]
tags: ["flutter","Android","Full-Stack Development"]
draft: false
---


This article documents the complete process of setting up a full-stack development environment based on Android Studio and Flutter in a Windows environment. Although the overall setup is not overly complex, several noteworthy issues arise during the initial configuration and testing due to the numerous concepts involved and network connectivity issues when accessing Google servers from mainland China. I have compiled this comprehensive guide for future reference during development.


## Downloading the Flutter SDK and Configuring Environment Variables


Download the Flutter SDK from a mirror source in mainland China. Refer to the [Flutter SDK Archive](https://docs.flutter.cn/install/archive), choose the Stable Channel for Windows, and download it. The download speed is significantly faster than the official default source:


![d99ea2d7-2389-4625-b608-a1796c881a53.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-1.png)


**No installation is required after downloading. Simply extract the Flutter SDK archive to a permanent directory and add the path of the `bin` folder inside the SDK to your `Path` environment variable.**


Additionally, due to the network environment in mainland China, you need to modify the Flutter community package repositories by adding environment variables. Add the following two environment variables to your user environment variables: `PUB_HOSTED_URL` and `FLUTTER_STORAGE_BASE_URL`.


```python
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```


![7024f394-d4b1-4a8b-8e8e-9fee7ad6de79.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-2.png)


Now, you should be able to check the current Flutter SDK version in the Windows terminal using `flutter --version`:


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


## Installing and Configuring the Android SDK


Download and install the latest version of Android Studio from the Chinese official Android Studio website: [Download Android Studio & App Tools - Android Developers | Android Developers](https://developer.android.google.cn/studio?hl=zh-cn).


After installing Android Studio, opening it for the first time requires downloading tools like the SDK and NDK online. These toolkits are often several gigabytes in size. Therefore, when running Android Studio for the first time, select the **Custom** option in the setup wizard to configure an HTTP Proxy before proceeding with the SDK installation. Otherwise, downloading the SDK can be an incredibly frustrating experience. Here is a list of commonly used mirror proxies you can configure:


```python
华为镜像：https://developer.huawei.com/repo/
豆瓣镜像：https://mirrors.douban.com/android/sdk/
腾讯：    https://mirrors.cloud.tencent.com/AndroidSDK/
阿里：    https://mirrors.aliyun.com/android.googlesource.com/
```


![b5eda9af-5302-4c0f-bcb3-c7c5fa3727d0.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-3.png)


By default, Android Studio does not install the **Android SDK Command-line Tools** during the SDK setup, but Flutter requires them to manage SDK packages. Therefore, you must manually install this tool. Additionally, since I plan to use Flutter to develop audio/video and AI model packages and libraries that require calling C/C++ code, I also need to install the **Android NDK** package.


Thus, after the basic SDK setup, go to the **Settings** menu and install the following additional SDK packages:


![766a7d54-6774-4cef-a456-16a5faf546bf.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-4.png)


In addition, you need to install two plugins in Android Studio for Flutter development: **Flutter** and **Dart**.


![4d4dfa01-4df5-4623-b865-6f1a1174c997.png](/images/blog/Android-Studio+Flutter全栈开发环境的搭建及其注意事项-5.png)


At this point, the Flutter SDK, Android Studio, their respective SDKs, and the Flutter/Dart plugins are all installed.


## Environment Testing and Verification


Before using Flutter for development inside Android Studio, you can run the `flutter doctor` command in your terminal to verify that your environment is properly set up. Before doing so, run `flutter doctor --android-licenses` and press `y` multiple times to accept the Android SDK licenses. The output of the final `flutter doctor` command will look something like this (since I am not focusing on Web development, I ignored the Chrome error message; if you need Web support, simply install Google Chrome):


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


## Changing Gradle Mirrors


We are not done yet. When compiling and packaging Android APKs in Android Studio, Gradle is used, which also involves downloading a vast array of dependencies.


During the Android app build process, the Gradle build script downloads various dependency packages from Google and MavenCentral by default. In mainland China, this download process is highly prone to getting stuck, so it is necessary to change the repository URL for downloading dependency packages.


A quick web search shows that most articles suggest manually modifying the `gradle/wrapper/gradle-wrapper.properties` file to use a gradle.org mirror, as well as updating `allprojects` in the `android/build.gradle` file. While this approach is straightforward, the downside is that you have to manually modify these files every single time you create a new project. If you forget, Gradle will attempt to download dependencies from overseas servers, which can take an extremely long time.


Instead, I want to apply these configurations globally so that every newly created Flutter project automatically redirects to domestic mirrors when building Android apps, rather than hitting the global central servers. To achieve this, create an `init.d` directory inside your Gradle home directory (e.g., mine is located at `D:\Android\.gradle`, while the default path is typically the `.gradle` folder under the user directory on the C drive). Inside `init.d`, create a file named `mirror.init.gradle.kts` with the following content:


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


This way, every time Gradle loads, it will automatically override the download URLs with the local mirror server addresses, drastically speeding up the build and download process.


## Debugging


At this point, the entire setup process is finally complete. The steps themselves are actually straightforward; the primary challenge lies in the network restrictions in mainland China, where downloading from external servers can be painfully slow. The setup involves several components—Android Studio, the SDK, the NDK, Flutter, and Gradle—each requiring numerous packages. Fortunately, the abundance of local mirror servers helps bridge the gap, and once the initial environment is configured, the subsequent development process runs very smoothly.


Next is the classic debugging phase. **You can directly use terminal development tools like Gemini CLI or AI IDEs like Trae to modify your code, and then run and debug it using the golden combo of `flutter devices + flutter run + r`. During normal development, you don't even need to open Android Studio; simply use it to manage and update your SDK.**


## References

- [Using Flutter in China](https://docs.flutter.cn/community/china/)
- [Quick Configuration of Domestic Mirror Sources and HTTP Proxy in Android Studio - CSDN Blog](https://blog.csdn.net/2402_87587715/article/details/143419739)