# SEO 与 GEO 全面优化实施计划 (PavelHan.tech)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 通过结构化数据 (JSON-LD) 和语种优化，建立 Pavel Han 的技术专家实体权威，并关联微信公众号。

**Architecture:** 在文章详情页动态构造 JSON-LD 对象并注入 `Base.astro` 布局。

**Tech Stack:** Astro, TypeScript, Schema.org (JSON-LD).

---

### Task 1: 创建作者配置文件

**Files:**
- Create: `src/content/authors/pavel-han.md`

- [ ] **Step 1: 创建文件并填入作者元数据**

```markdown
---
title: Pavel Han
meta_title: "Pavel Han | 技术专家 & PavelHan.tech 创作者"
image: /images/author.png
description: "尝试从底层原理的角度去理解和解释技术问题。微信公众号：Pavel Han。"
social:
  website: https://bookworm-light-astro.vercel.app
  linkedin: https://www.linkedin.com/in/pavelhan/
---

Pavel Han 是 PavelHan.tech 的创作者，专注于从底层原理角度剖析技术问题。
微信公众号：Pavel Han。
```

- [ ] **Step 2: 验证文件创建**

Run: `ls src/content/authors/pavel-han.md`
Expected: 文件存在且内容正确。

- [ ] **Step 3: Commit**

```bash
git add src/content/authors/pavel-han.md
git commit -m "feat: add pavel-han author profile"
```

---

### Task 2: 升级 Base.astro 布局支持 JSON-LD

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: 修改 Props 接口以支持 jsonLd 注入**

```typescript
// 寻找 export interface Props 并修改
export interface Props {
  title?: string;
  meta_title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
  jsonLd?: string; // 新增
}

// 解构 Props
const { title, meta_title, description, image, noindex, canonical, jsonLd } = Astro.props;
```

- [ ] **Step 2: 优化 html lang 属性和 JSON-LD 注入**

将 `<!doctype html> <html lang="en">` 修改为动态识别（默认为 zh-CN）：
```astro
<html lang="zh-CN">
```

在 `<head>` 标签内的 `</head>` 之前插入：
```astro
    {jsonLd && <script type="application/ld+json" set:html={jsonLd} />}
```

- [ ] **Step 3: 验证修改**

检查 `src/layouts/Base.astro` 确保没有语法错误。

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: support JSON-LD injection in Base layout"
```

---

### Task 3: 在文章页面注入结构化数据

**Files:**
- Modify: `src/pages/article/[slug].astro`

- [ ] **Step 1: 实现 JSON-LD 构造逻辑**

```astro
---
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import PostSingle from "@/partials/PostSingle.astro";
import config from "@/config/config.json"; // 确保导入 config

export async function getStaticPaths() {
  // ... 保持原有逻辑
}

const { post } = Astro.props;
const { title, meta_title, image, description, date } = post.data;

// 构造 JSON-LD
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${config.site.base_url}/article/${post.slug}`
  },
  "headline": title,
  "description": description || config.metadata.meta_description,
  "image": image ? `${config.site.base_url}${image}` : `${config.site.base_url}${config.metadata.meta_image}`,
  "author": {
    "@type": "Person",
    "name": "Pavel Han",
    "sameAs": [
      "WeChat Official Account: Pavel Han"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": config.site.title,
    "logo": {
      "@type": "ImageObject",
      "url": `${config.site.base_url}${config.site.logo}`
    }
  },
  "datePublished": date
});
---

<Base
  title={title}
  meta_title={meta_title}
  description={description}
  image={image}
  jsonLd={jsonLd}
>
  <PostSingle post={post} />
</Base>
```

- [ ] **Step 2: 验证构建结果**

运行 `npm run build` 确保没有渲染错误。

- [ ] **Step 3: Commit**

```bash
git add src/pages/article/[slug].astro
git commit -m "feat: inject BlogPosting JSON-LD into article pages"
```

---

### Task 4: 全局元数据优化

**Files:**
- Modify: `src/config/config.json`

- [ ] **Step 1: 优化站点描述以包含核心关键词**

```json
  "metadata": {
    "meta_author": "Pavel Han",
    "meta_image": "/images/og-image.png",
    "meta_description": "PavelHan.tech - 尝试从底层原理的角度去理解和解释技术问题。由技术专家 Pavel Han 维护，深度解析技术核心。"
  },
```

- [ ] **Step 2: Commit**

```bash
git add src/config/config.json
git commit -m "feat: optimize global meta description"
```
