# 设计文档：SEO 与 GEO 全面优化方案 (PavelHan.tech)

## 1. 目标 (Objective)
通过实施深度 SEO (Search Engine Optimization) 和 GEO (Generative Engine Optimization) 策略，提升 PavelHan.tech 在传统搜索引擎（Google, Baidu）及生成式 AI 引擎（Gemini, ChatGPT, Perplexity）中的可见性、权威性和引用率。

核心重点：建立“Pavel Han”作为一个技术专家的实体权威，并将其与“Pavel Han”微信公众号进行强关联。

## 2. 核心方案 (Core Design)

### 2.1 结构化数据 (GEO 核心)
利用 JSON-LD (Schema.org) 构建文章与作者的语义网络。

- **BlogPosting (文章实体):** 声明文章标题、描述、发布日期、作者及发布者。
- **Person (作者实体):** 在作者实体中嵌入 `sameAs` 属性，显式声明社交平台关联。
- **关联内容:** 将“WeChat Official Account: Pavel Han”作为作者的一个身份标识符。

### 2.2 配置与元数据增强
- **语言设置:** 将 `<html>` 的 `lang` 属性从 `en` 改为 `zh-CN`。
- **作者数据源:** 创建 `src/content/authors/pavel-han.md`，作为数据的 Single Source of Truth。
- **站点描述:** 优化 `config.json` 中的 `meta_description`，使其包含更多技术专家相关的关键词。

### 2.3 技术实现路径
1. **Base.astro 升级:**
   - 接收可选的 `jsonLd` Prop。
   - 在 `<head>` 中动态渲染结构化数据脚本。
   - 动态处理 `lang` 属性。
2. **文章详情页逻辑:**
   - 在 `src/pages/article/[slug].astro` 中通过 `getSinglePage` 获取作者信息。
   - 构造 JSON-LD 字符串并传递给 `Base.astro`。
3. **内容新增:**
   - 完善 `pavel-han.md` 作者文件。

## 3. 详细设计 (Detailed Design)

### 3.1 JSON-LD 结构示例 (文章页)
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{canonical_url}"
  },
  "headline": "{post_title}",
  "description": "{post_description}",
  "image": "{post_image}",
  "author": {
    "@type": "Person",
    "name": "Pavel Han",
    "sameAs": [
      "WeChat Official Account: Pavel Han"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "PavelHan.tech",
    "logo": {
      "@type": "ImageObject",
      "url": "{site_logo}"
    }
  },
  "datePublished": "{post_date}"
}
```

### 3.2 语种优化逻辑
- 在 `Base.astro` 中检测内容语种，对于包含中文字符的文章或配置，默认使用 `zh-CN`。

## 4. 验证计划 (Validation)
1. **Schema 验证:** 使用 [Google Rich Results Test](https://search.google.com/test/rich-results) 验证生成的 JSON-LD。
2. **元数据检查:** 检查文章页面的源代码，确认 `lang="zh-CN"` 和 `canonical` 链接正确。
3. **实体关联检查:** 确认 JSON-LD 中包含了 `sameAs` 字段并正确指向微信公众号标识。
