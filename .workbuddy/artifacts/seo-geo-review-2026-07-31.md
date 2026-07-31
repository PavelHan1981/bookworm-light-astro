# pavelhan.tech — SEO + GEO 全面配置体检报告

> 审计日期：2026-07-31
> 审计基础：基于最新提交代码（索引类问题已在上一轮清零，本轮聚焦"配置与优化空间"）
> 审计范围：`astro.config.mjs`、`src/layouts/Base.astro`、`public/robots.txt`、`src/pages/article/[slug].astro`（zh/en）、`public/llms.txt` + `generate-llms.mjs`、`src/config/theme.json`、`src/config/config.json`、`src/layouts/partials/PostSingle.astro`

---

## 一、已经做对的地方（先肯定，这些不用动）

| 项目 | 证据 | 说明 |
|------|------|------|
| hreflang 完整配对 | `zh/article/[slug].astro:89-91`、`en/...:89-91`、`zh/about`、`en/about`、`zh/elements`、`en/elements` 等 | 5 对 zh/en 内容页 + `x-default→zh` 互指，写法规范 |
| 文章页 BlogPosting 结构化数据 | `zh/article/[slug].astro:51-78` | `author: Person`（含 `sameAs` 社媒）、`publisher: Organization`、`datePublished`/`dateModified` 齐全，质量高 |
| GEO 资产体系完善 | `public/llms.txt`、`llms-full.txt`、`llms-full-en.txt`、`generate-llms.mjs` | 6 大主题簇精选 + 226 篇 ZH/EN 全量目录，结构清晰，已领先 90% 个人站 |
| 相关文章内部链接 | `PostSingle.astro:2` 引入 `SimilarPosts` + `similarItems` 工具 | 上下文内部链接到位，利于权重传递与主题集群 |
| 自动目录 TOC | `astro.config.mjs:56-57` `remarkToc` + `remarkCollapse` | 利于精选摘要抓取与内容结构 |
| sitemap 排除 = noindex 一致 | `astro.config.mjs:22-40` | 排除项均为重定向/导航页，真实内容正常进 sitemap，无矛盾信号 |
| RSS 订阅 | `robots.txt:14-17` | 全局 / 中文 / 英文三套 RSS，利于内容分发与发现 |
| 图片优化管道 | `astro.config.mjs:18` `sharpImageService` + `astro:assets` | 压缩 + 自动尺寸，对 CLS 友好 |

---

## 二、P0 — 高优先级（直接影响排名 / 索引 / 语言信号）

### 1. `html lang` 被写死成 `zh-CN`
- **证据**：`src/layouts/Base.astro:40` → `<html lang="zh-CN">`（硬编码）
- **影响**：**所有英文页面（/en/*）也输出 `lang="zh-CN"`**。Google 用语种属性做语言定位；错误属性会导致：
  - 英文页在中文搜索结果里被误判 / 在英文区排名受损
  - 无障碍（屏幕阅读器念错语言）
  - AI 引擎（GEO）语言识别错误
- **修复**：`Base.astro` 增加 `lang` prop（默认 `"zh-CN"`），由各页面传入；英文页传 `lang="en"`。最简做法：在 `Base` 的 `Props` 加 `lang?: string`，`<html lang={lang ?? "zh-CN"}>`，然后在 `src/pages/en/**` 调用 `<Base ... lang="en">`。

### 2. `og:type` 永远是 `website`
- **证据**：`src/layouts/Base.astro:233` → `<meta property="og:type" content="website" />` 硬编码，文章页未覆盖
- **影响**：文章页社交分享丢失 `article` 富媒体（发布时间、章节、标签），也错失部分发现场景
- **修复**：`Base` 增加 `ogType` prop（默认 `"website"`）；文章页传 `ogType="article"` 并补充 `article:published_time` / `article:section` / `article:tag`（可从 frontmatter 取）。

### 3. 缺 Organization / WebSite / Person / BreadcrumbList 结构化数据
- **证据**：全站 `jsonLd` 仅出现在文章页（`grep jsonLd` 仅 `article/[slug].astro` 命中）；首页、`about` 页均无 schema；全站无 `BreadcrumbList`
- **影响**：
  - **无 Organization/WebSite schema** → 失去"站点链接搜索框（sitelinks search box）"、品牌知识面板机会，GEO 中也弱化了站点实体可信度
  - **About 页无 Person schema** → 作者实体（GEO 信任核心）未被机器识别
  - **无 BreadcrumbList** → 失去面包屑富结果，且内部层级信号弱
- **修复**：
  - 首页 `Base` 注入 `WebSite`（含 `potentialAction: SearchAction`）+ `Organization`（`sameAs` 指向社媒/GitHub 等）
  - `about` 页注入 `Person` schema（name=Pavel Han，`sameAs`=外部权威档案）
  - 全站（或至少文章/列表页）注入 `BreadcrumbList`（首页 › 分类 › 文章）

---

## 三、P1 — 中优先级（性能 / CWV / 信号完整性）

### 4. MathJax 全站无条件加载
- **证据**：`Base.astro:111-135` 每页都注入 MathJax CDN（`tex-svg.js`）+ 内联配置，包括不含公式的页面
- **影响**：第三方 JS 增加主线程负担 → 拖累 INP / TBT，不利于 Core Web Vitals
- **修复**：仅在含数学公式的页面加载。可在 `Base` 加 `hasMath` prop，文章页按需传入；或用 `define:vars` 动态决定。即使保留，也建议 `async`（已 async）+ 考虑 `type="module"` 或延迟到 `astro:page-load` 后注入。

### 5. 字体 `Mulish` 声明但未真正加载
- **证据**：`theme.json:20` 声明 `"primary": "Mulish:wght@400;600;700"`；全站无 `fonts.googleapis`/`@font-face`/`fontsource` 引用；`Base.astro:95-102` 的 Astro Font API 加载块被注释
- **影响（双刃）**：
  - **当前**：`Mulish` 静默回退系统 `sans-serif` → 对 CWV **反而无害**（无阻塞字体请求），但设计字体未生效
  - **风险**：若日后"修"成引 Google Fonts `<link>`，不加 `preconnect` 会拖累 LCP
- **修复（二选一）**：
  - **推荐**：用 Astro 内建 Font API 自托管 `Mulish`（取消并修好 `Base.astro:95-102` 的 `Font` 块），零外部请求、CWV 友好
  - 或显式改 `theme.json` 为系统字体栈，避免"声明了却没加载"的歧义

### 6. Sitemap 缺 `lastmod`
- **证据**：`astro.config.mjs` 的 `@astrojs/sitemap` 未配置 `lastmod`
- **影响**：Google 无法据此高效安排重抓，新内容/改内容被发现偏慢
- **修复**：`@astrojs/sitemap` 配置 `lastmod` 来源（启用 git 集成或读 frontmatter `date`）。示例：
  ```js
  sitemap({ filter: (...), lastmod: new Date(), /* 或基于 git */ })
  ```
  （该集成支持从 git 提交时间自动取 lastmod，需在集成选项中开启。）

### 7. 缺 `og:locale` / `og:locale:alternate`
- **证据**：`Base.astro` 仅输出 og:title/description/url/image/type，无 locale
- **影响**：i18n 社交分享（Facebook/Telegram/Discord）语言定位不准
- **修复**：`Base` 按页面语言输出 `<meta property="og:locale" content="zh_CN">` 及 `<meta property="og:locale:alternate" content="en_US">`。

---

## 四、P2 — 低优先级 / GEO 增强专项

### 8. GEO：增加"支柱内容全文" llms 文件
- **现状**：`llms.txt` 与全量目录均为**链接 + 描述**，AI 引擎需二次抓取文章页才能读正文
- **建议**：新增 `llms-pillars.txt`，**嵌入 5–10 篇核心支柱文章的全文**（毫米波雷达原理、Transformer 系列、RK3588 部署等），让 ChatGPT / Gemini / Claude 等可直接引用，显著提升被 AI 回答引用的概率。在 `robots.txt` 与 `llms.txt` 中补充该文件链接。

### 9. GEO：强化作者实体（Person）
- **建议**：`about` 页加 `Person` JSON-LD，并补全外部权威档案 `sameAs`：GitHub、LinkedIn、知乎、Google Scholar、微信公众号等。AI 引擎更倾向引用"有可验证实体"的作者内容。
- **现状**：文章 JSON-LD 已含 `Person` + `sameAs`（微信），但 `about` 页本身未结构化。

### 10. GEO：核心文章加 FAQ schema
- **建议**：若支柱文章含"常见问题"小节，加 `FAQPage` JSON-LD → 直接 eligible for Google 精选摘要与 AI Overviews 引用。用问答式 H2/H3 标题（已有 TOC 基础）进一步利于 AI 抽取答案。

### 11. `viewport` 限制缩放
- **证据**：`Base.astro:107` → `maximum-scale=5`
- **影响**：Google 移动友好测试对限制缩放不友好（无障碍）
- **修复**：改为 `width=device-width, initial-scale=1`（移除 `maximum-scale`）。

### 12. `meta name="generator"` 暴露 Astro 版本
- **证据**：`Base.astro:91`
- **影响**：次要信息泄露，无 SEO 危害，可移除保持整洁

### 13. 确认分析是否真实生效
- **证据**：`config.json` 中 `gtm_id: "GTM-XXXXXX"` 仍为占位符
- **影响**：若 GA/GTM 未真正配置，SEO 效果度量（流量/转化归因）缺失
- **修复**：核实 `PUBLIC_GA_ID` / `gtm_id` 是否已填真实值，确保 Search Console + Analytics 数据闭环

### 14. 图片 alt 文本规范
- **建议**：markdown 图片依赖作者手填 alt。建议内容规范：每图必须有描述性 alt（含关键词但勿堆砌），利于图片搜索与 GEO 图文引用

---

## 五、优先级行动清单（交付用）

| # | 问题 | 文件 | 改动 | 优先级 |
|---|------|------|------|--------|
| 1 | html lang 写死 | `Base.astro` + 所有 `en/**` 页面 | 增加 `lang` prop，英文页传 `lang="en"` | P0 |
| 2 | og:type 固定 website | `Base.astro` + 文章页 | 增加 `ogType` prop，文章页传 `article` + article meta | P0 |
| 3 | 缺站点/作者/面包屑 schema | 首页 / about / 全站 | 注入 WebSite+Organization / Person / BreadcrumbList | P0 |
| 4 | MathJax 全站加载 | `Base.astro` | 增加 `hasMath` prop，按需加载 | P1 |
| 5 | 字体未加载 | `Base.astro` / `theme.json` | Font API 自托管 或 改用系统字体栈 | P1 |
| 6 | sitemap 缺 lastmod | `astro.config.mjs` | 配置 `lastmod` 来源 | P1 |
| 7 | 缺 og:locale | `Base.astro` | 按语言输出 locale | P1 |
| 8 | GEO 全文支柱 | 新增 `llms-pillars.txt` | 嵌入核心全文 + 在 robots/llms 引用 | P2 |
| 9 | 作者实体强化 | `about` 页 | Person JSON-LD + 外部档案 | P2 |
| 10 | FAQ schema | 支柱文章 | 加 FAQPage JSON-LD | P2 |
| 11 | viewport 限制缩放 | `Base.astro` | 移除 `maximum-scale` | P2 |
| 12 | generator 泄露 | `Base.astro` | 移除 meta generator | P2 |
| 13 | 分析占位符 | `config.json` | 填真实 GA/GTM | P2 |
| 14 | 图片 alt 规范 | 内容规范 | 作者侧约束 | P2 |

---

## 六、GEO 专项小结

你的站点在 GEO（生成式引擎优化）上**底子已经很好**：有完整的 `llms.txt` 体系、清晰的主题集群、正确的 hreflang、高质量的文章结构化数据。下一步重点是三件事：

1. **实体化**：让"Pavel Han"和"PavelHan.tech"成为机器可验证的实体（Person / Organization schema + 外部 `sameAs`）
2. **全文可抓取**：给 AI 引擎一个能直接消化的"支柱内容全文"文件，而不只是链接
3. **问答结构**：用 FAQ schema + 问答式小标题，提升被 AI Overviews / 大模型引用概率

配合同一轮修掉的 `html lang` / `og:type` / 结构化数据缺口，你的站点在 Google 传统搜索和 AI 搜索两条线都会更稳。
