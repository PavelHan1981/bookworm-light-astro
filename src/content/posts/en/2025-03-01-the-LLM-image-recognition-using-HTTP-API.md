---
title: "Implementing Image Recognition Functions via HTTP API Based on Multimodal Large Language Models (Python + C)"
slug: "2025-03-01-the-LLM-image-recognition-using-HTTP-API"
description: "Building upon the previous notes, this article continues to utilize OpenAI's API to access Kimi's multimodal model for object recognition in images, implemented using both Python and C with detailed case analyses. By using C to access the HTTP API interfaces exposed by multimodal large language models, developers can implement features requiring large model service support on low-cost MCU processors, backed by reasonable prompt engineering."
date: 2025-03-01T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["LLM"]
draft: false
---

In previous notes, we implemented single-turn and multi-turn conversational capabilities by accessing Moonshot AI's Kimi API using the OpenAI SDK in Python: [[[Quick Implementation of AI Dialogue with Kimi Using Python]]](https://www.pavelhan.tech/article/2025-02-27-the-communication-with-Moonshot-LLM-using-python).

Building upon that foundation, this note leverages OpenAI's API to access the Kimi multimodal model for image object recognition, providing implementations and case analyses in both Python and C. Being able to use the C language to access HTTP APIs exposed by multimodal large models means that, with proper prompt design, you can implement features on low-cost MCU processors that normally require large model service support.

The functional requirement of this example is very straightforward: upload a photo to the large language model and ask it to provide a description of the objects detected within the image. This case uses a picture of a little bird found online.

![image.png](/images/blog/基于多模态大模型的HTTP-API实现图像识别的功能（Python+C）-1.png)

> Compared to simple text-based conversations with large models, the biggest difference when using a multimodal large model for image recognition is that the HTTP request sent by the client must encode the image file into base64 format and upload it as an attachment along with the text conversation prompts.

## Python Implementation of Image Recognition Using Multimodal LLMs

Below is the Python implementation for image recognition based on the Kimi multimodal large model. Please note the following:

- Before running the code, you need to set the `MOONSHOT_API_KEY` environment variable with your personal API key. For details, refer to [[[Quick Implementation of AI Dialogue with Kimi Using Python]]](https://www.pavelhan.tech/article/2025-02-27-the-communication-with-Moonshot-LLM-using-python).
- To recognize objects contained within the uploaded photo attachment, you must select a large model that supports multimodality; otherwise, an error message indicating that the model does not support image recognition will be returned. For Kimi, the multimodal model node should be set to `moonshot-v1-8k-vision-preview`.

You can refer to the comments in the code to thoroughly understand its execution flow:

```python
import os
from openai import OpenAI
import base64

def get_api_key():
    api_key = os.getenv("MOONSHOT_API_KEY")
    if not api_key:
        raise ValueError("请设置 MOONSHOT_API_KEY 环境变量")
    return api_key

def oneshot_chat_completio_simpe(prompt):
    try:
        # 读取JPEG图片文件并转换为base64
        image_path = 'C:\\\\Users\\\\Administrator\\\\Desktop\\\\小鸟.jpg'

		# 上传给大模型的图片附件需要以base64进行编码
        with open(image_path, 'rb') as image_file:
            image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

        client = OpenAI(
            api_key=get_api_key(),
            base_url="<https://api.moonshot.cn/v1>",
        )

        # 构建包含图片的消息
        messages = [
            {
                "role": "system",
                "content": "你是 Kimi，由 Moonshot AI 提供的人工智能助手。请帮我分析图片中的小鸟品种，并给出详细的特征描述。"
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}} #此处增加上传图片的base64编码
                ]
            }
        ]

        completion = client.chat.completions.create(
            model="moonshot-v1-8k-vision-preview", #此处需要选择多模态大模型
            messages=messages,
            temperature=0.3,
        )

        return completion.choices[0].message.content

    except Exception as e:
        print(f"错误：{str(e)}")
        return None

def main():
    response = oneshot_chat_completio_simpe("请帮我分析图片中的小鸟品种，并给出详细的特征描述。")
    if response:
        print(response)

if __name__ == "__main__":
    main()
```

After executing the above code, the information returned by the large model is as follows:

```plain text
C:\\Users\\Administrator\\Desktop\\test> & c:/Users/Administrator/Desktop/test/venv/Scripts/python.exe c:/Users/Administrator/Desktop/test/ai_test/moonshot.py
这是一只金丝雀（学名：Serinus canaria），也被称为金翅雀。金丝雀是一种小
型鸣禽，以其鲜艳的黄色羽毛而闻名。以下是金丝雀的一些特征描述：

1. **羽毛颜色**：金丝雀的羽毛主要是黄色，胸部和腹部的羽毛颜色较浅，呈现
出柔和的黄色或白色。翅膀上有黑色和白色的条纹，这些条纹在飞行时显得非常醒
目。

2. **体型**：金丝雀的体型较小，体长一般在12-14厘米之间，体重大约在10-20
克。

3. **喙**：金丝雀的喙短而尖，适合啄食种子和昆虫。

4. **眼睛**：金丝雀的眼睛较大，颜色通常为黑色，周围可能有一圈白色的羽毛
。

5. **鸣叫**：金丝雀以其美妙的歌声而著称，雄鸟的鸣叫声尤为悦耳，常用于吸
引配偶或领地宣示。

6. **习性**：金丝雀通常生活在开阔的林地、灌木丛和花园中。它们是群居鸟类，喜欢成群结队地活动。

7. **饮食**：金丝雀主要以种子为食，也吃昆虫和其他小型无脊椎动物。

金丝雀因其美丽的外观和悦耳的歌声，常被作为宠物饲养。在这张图片中，金丝雀站在一根树枝上，旁边有几颗红色的浆果，这可能是它的食物
来源之一。
```

## C Implementation of Image Recognition Using Multimodal LLMs

Using Python and the Kimi multimodal large model, image recognition can be easily implemented via HTTP API. However, Python cannot run on most low-cost MCUs and SOCs. Therefore, if you want to expand the capabilities of such processors using large models, you must implement the same functional logic in C. This is why we need to re-implement the above functionality using the C language.

Below is the C language implementation of the image recognition function using the Kimi multimodal large model:

```plain text
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include </usr/include/x86_64-linux-gnu/curl/curl.h>

/* 用于存储API响应的结构体 */
struct MemoryStruct {
    char *memory;
    size_t size;
};

/* 用于存储读取的图像文件的结构体 */
struct ImageData {
    unsigned char *data;
    size_t size;
};

/* 回调函数，用于处理CURL接收到的数据 */
static size_t WriteMemoryCallback(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t realsize = size * nmemb;
    struct MemoryStruct *mem = (struct MemoryStruct *)userp;

	char *ptr = realloc(mem->memory, mem->size + realsize + 1);
    if (!ptr) {
        printf("内存分配失败\\n");
        return 0;
    }

    mem->memory = ptr;
    memcpy(&(mem->memory[mem->size]), contents, realsize);
    mem->size += realsize;
    mem->memory[mem->size] = 0;

    return realsize;
}

/* 从环境变量获取API密钥 */
char* get_api_key() {
    char* api_key = getenv("MOONSHOT_API_KEY");

    if (!api_key) {
        fprintf(stderr, "错误：请设置 MOONSHOT_API_KEY 环境变量\\n");
        return NULL;
    }

    return api_key;
}

/* 读取图像文件 */
struct ImageData read_image_file(const char* filepath) {
    struct ImageData img = {NULL, 0};

    FILE *file = fopen(filepath, "rb");
    if (!file) {
        fprintf(stderr, "无法打开图像文件: %s\\n", filepath);
        return img;
    }

    // 获取文件大小
    fseek(file, 0, SEEK_END);
    img.size = ftell(file);
    fseek(file, 0, SEEK_SET);

    // 分配内存
    img.data = (unsigned char*)malloc(img.size);
    if (!img.data) {
        fprintf(stderr, "内存分配失败\\n");
        fclose(file);
        img.size = 0;
        return img;
    }

    // 读取文件内容
    size_t read_size = fread(img.data, 1, img.size, file);
    fclose(file);

    if (read_size != img.size) {
        fprintf(stderr, "读取图像文件失败\\n");
        free(img.data);
        img.data = NULL;
        img.size = 0;
    }

    return img;
}

/* Base64编码函数 */
char* base64_encode(const unsigned char* data, size_t input_length) {
    static const char base64_chars[] =
       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    size_t output_length = 4 * ((input_length + 2) / 3);
    char *encoded_data = (char*)malloc(output_length + 1);

    if (!encoded_data) return NULL;

    size_t i, j;

    for (i = 0, j = 0; i < input_length;) {
        uint32_t octet_a = i < input_length ? data[i++] : 0;
        uint32_t octet_b = i < input_length ? data[i++] : 0;
        uint32_t octet_c = i < input_length ? data[i++] : 0;
        uint32_t triple = (octet_a << 16) + (octet_b << 8) + octet_c;

        encoded_data[j++] = base64_chars[(triple >> 18) & 0x3F];
        encoded_data[j++] = base64_chars[(triple >> 12) & 0x3F];
        encoded_data[j++] = base64_chars[(triple >> 6) & 0x3F];
        encoded_data[j++] = base64_chars[triple & 0x3F];
    }

    // 添加填充
    for (i = 0; i < (3 - input_length % 3) % 3; i++) {
        encoded_data[output_length - 1 - i] = '=';
    }

    encoded_data[output_length] = '\\0';
    return encoded_data;

}

/* 解析JSON响应，提取内容 */
char* extract_content_from_json(const char* json_str) {
    // 简单的JSON解析，实际应用中应使用cJSON等库
    // 这里使用简单的字符串处理方法提取content字段
    const char* content_start = strstr(json_str, "\\"content\\":");

    if (!content_start) return NULL;

    content_start = strchr(content_start + 10, '"');
    if (!content_start) return NULL;

    content_start++;

    const char* content_end = strstr(content_start, "\\",");
    if (!content_end) {
        content_end = strstr(content_start, "\\"");
        if (!content_end) return NULL;
    }

    size_t content_length = content_end - content_start;
    char* content = (char*)malloc(content_length + 1);

    if (!content) return NULL;

    strncpy(content, content_start, content_length);
    content[content_length] = '\\0';

    return content;
}

/* 主函数：图像识别 */
char* image_recognition(const char* prompt) {
    CURL *curl;
    CURLcode res;
    struct MemoryStruct chunk;
    char* result = NULL;
    char* api_key = get_api_key();

    if (!api_key) return NULL;

    // 初始化内存结构
    chunk.memory = malloc(1);
    chunk.size = 0;

    // 读取图像文件
    struct ImageData img = read_image_file("/home/pavel/code/module/src/bird.jpg");
    if (!img.data) {
        free(chunk.memory);
        return NULL;
    }

    // Base64编码图像数据
    char* base64_img = base64_encode(img.data, img.size);
    free(img.data); // 释放图像数据内存
    if (!base64_img) {
        free(chunk.memory);
        return NULL;
    }

    // 构建JSON请求体
    char* json_template = "{\\"model\\":\\"moonshot-v1-8k-vision-preview\\",\\"messages\\":[{\\"role\\":\\"system\\",\\"content\\":\\"你是 Kimi，由 Moonshot AI 提供的人工智能助手。请帮我分析图片中的小鸟品种，并给出详细的特征描述。\\"},{\\"role\\":\\"user\\",\\"content\\":[{\\"type\\":\\"text\\",\\"text\\":\\"%s\\"},{\\"type\\":\\"image_url\\",\\"image_url\\":{\\"url\\":\\"data:image/jpeg;base64,%s\\"}}]}],\\"temperature\\":0.3}";

    // 计算JSON请求体大小并分配内存
    size_t json_size = strlen(json_template) + strlen(prompt) + strlen(base64_img) - 4 + 1; // -4是因为有两个%s占位符

    char* json_body = (char*)malloc(json_size);
    if (!json_body) {
        free(base64_img);
        free(chunk.memory);
        return NULL;
    }

    // 填充JSON请求体
    snprintf(json_body, json_size, json_template, prompt, base64_img);
    free(base64_img); // 释放base64编码数据内存

    // 初始化CURL
    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();
    if (curl) {
        struct curl_slist *headers = NULL;

        headers = curl_slist_append(headers, "Content-Type: application/json");

        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "Authorization: Bearer %s", api_key);
        headers = curl_slist_append(headers, auth_header);

        // 设置URL和请求头
        curl_easy_setopt(curl, CURLOPT_URL, "<https://api.moonshot.cn/v1/chat/completions>");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_body);

        // 设置写回调函数
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&chunk);

        // 执行请求
        res = curl_easy_perform(curl);

        // 检查请求是否成功
        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() 失败: %s\\n", curl_easy_strerror(res));
        } else {
            // 解析响应
            result = extract_content_from_json(chunk.memory);
        }

        // 清理
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }

    // 释放资源
    free(json_body);
    free(chunk.memory);
    curl_global_cleanup();
    return result;
}

int main() {
    const char* prompt = "请帮我分析图片中的小鸟品种，并给出详细的特征描述。";

    char* result = image_recognition(prompt);
    if (result) {
        printf("分析结果:\\n%s\\n", result);
        free(result);
    } else {
        printf("图像识别失败\\n");
    }

    return 0;
}
```

As you can see, the C implementation is significantly more complex. The code above manually implements JSON parsing and base64 encoding while relying on `libcurl` to handle HTTP communication with the Kimi Web API server. Therefore, you need to link the `libcurl` library during compilation:

```bash
gcc image-recognition.c -o image-recognition -lcurl
```

Similarly, for the compiled `image-recognition` executable to run properly, you must also set the `MOONSHOT_API_KEY` environment variable in your Linux system:

```bash
export MOONSHOT_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```