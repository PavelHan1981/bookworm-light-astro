# pavelhan.tech — SEO + GEO 完整终轮审计报告

**审计日期**: 2026-07-31
**审计范围**: P0（高优先级）+ P1（性能/CWV）+ P2（GEO 增强）全部 14 项
**审计方法**: 直接读取工作区当前文件（`git diff` 未提交状态），逐行核对实际代码，非仅看提交说明
**站点架构**: Astro 静态站 + 中英双语（`/zh`、`/en`）+ `@astrojs/sitemap`

---

## 一、执行摘要

✅ **P0 / P1 / P2 共 14 项，代码层面全部落地完成。** 另有 4 个非阻塞的"锦上添花"项（死代码清理、lastmod 精炼、FAQ 内容填充、图片 alt 内容规范）供后续优化。

当前站点在 SEO 技术基础（索引信号、结构化数据、i18n、CWV）与 GEO 资产（llms.txt 全体系、`llms-pillars.txt` 全文库、FAQ schema）两个维度均已达到个人技术博客的**优秀水平**，明显领先于绝大多数同类站点。

> ⚠️ 注意：所有改动目前仍在**工作区（未提交）**。Google Search Console 中的数据仍是改版前的旧状态，需部署后重新提交 sitemap 并等待 1–2 周才会反映新信号。

---

## 二、逐项核验结果

### P0 — 高优先级（直接影响索引/信号质量）

| 项 | 要求 | 落地证据 | 状态 |
|----|------|----------|------|
| P0-1 | `html lang` 不再写死 `zh-CN` | `Base.astro:59-60` `computedLang = lang ?? (path.startsWith("/en") ? "en" : "zh-CN")`；`<html lang={computedLang}>`（:66）；文章页显式 `lang="en"`/`lang="zh-CN"` 传参 | ✅ |
| P0-2 | `og:type` 区分 article/website | `Base.astro` 新增 `ogType` prop（默认 website，:49）；`:261` `og:type content={ogType}`；`:262-276` article 元数据条件块；文章页传 `ogType="article"` + published/modified/author/tags | ✅ |
| P0-3 | 补全结构化数据 | 首页 `WebSite`+`Organization`+`SearchAction`（index.astro `@graph`）；about `Person`+`BreadcrumbList`（zh/en 对称）；文章页 `BlogPosting`+`Person`+`Organization`+`BreadcrumbList` 齐全 | ✅ |

### P1 — 中优先级（性能 / CWV / i18n 社交）

| 项 | 要求 | 落地证据 | 状态 |
|----|------|----------|------|
| P1-4 | MathJax 按需加载 | `Base.astro` 新增 `hasMath` prop（默认 false，:54），整块 MathJax 包在 `{hasMath && (...)}`（:131-196）；文章页用正则 `/\$|\\\(|\\\[|\\begin/` 从正文检测（zh/article/[slug].astro:131） | ✅ |
| P1-5 | 字体真正加载 | `Base.astro:119-125` Google Fonts `<link>` + `preconnect` 到 `fonts.googleapis.com`/`fonts.gstatic.com`（含 `crossorigin`）+ `display=swap`；`Mulish` 现已生效 | ✅ |
| P1-6 | sitemap 含 lastmod | `astro.config.mjs:23` `lastmod: new Date()` | ⚠️ 功能达成，但见下方"精炼建议" |
| P1-7 | og:locale 配对 | `Base.astro:61-62` `ogLocale`/`ogLocaleAlternate` 按语言自动切换；`:251-252` 输出 `og:locale`/`og:locale:alternate` | ✅ |

### P2 — GEO 增强

| 项 | 要求 | 落地证据 | 状态 |
|----|------|----------|------|
| P2-8 | `llms-pillars.txt` 全文库 | 新增 `public/llms-pillars.txt`（6 篇支柱全文）；`generate-llms.mjs:123-144` 生成逻辑；`public/llms.txt` 末行引用；`public/robots.txt` 加注释指引 | ✅ |
| P2-9 | About 加 Person + 外部档案 | `zh/about.astro:17-29` 与 `en/about.astro` `Person` `@id=/#person` + `sameAs:[GitHub, pavelhan.tech, 微信]` | ✅ |
| P2-10 | 文章页 FAQPage schema | `zh/article/[slug].astro:107-125` 与 `en/article/[slug].astro` 按 `faq` frontmatter 条件渲染 `FAQPage`（`Question`/`Answer`），含空值过滤 | ✅ |
| P2-11 | 移除 viewport maximum-scale | `Base.astro:128` `content="width=device-width, initial-scale=1"`（已无 `maximum-scale`） | ✅ |
| P2-12 | 移除 meta generator | 全站无 `<meta name="generator">` 残留 | ✅ |
| P2-13 | 核实 GA/GTM 占位符 | `config.json:29-32` `google_analytics.enable=true, id="G-YGXYK8KCZN"`（**真实 GA4 ID，正在采集**）；`google_tag_manager.enable=false`，故 `GTM-XXXXXX` 占位符无害 | ✅ |
| P2-14 | 图片 alt 规范 | about 页头像 `alt={title}`（zh/about.astro:77）、微信二维码 `alt="微信公众号 Pavel Han"`（:150）均规范；**正文 Markdown 图片 alt 取决于写作时填写**（见下方内容规范） | ⚠️ 部分（见说明） |

---

## 三、非阻塞的锦上添花项（建议但不阻塞）

1. **死代码 import**（P1 遗留）— `Base.astro:13` `import { Font } from "astro:assets"` 现已无 `<Font>` 使用（字体改走 link 方案），可删除以消除 lint 警告。
2. **sitemap lastmod 精炼**（P1-6）— 当前 `new Date()` 给所有页面打同一构建时间，等于每次部署都告诉 Google"全站更新"。`@astrojs/sitemap` 默认会按 **git 提交时间**给每个文件算独立 lastmod，更省抓取额度。建议**删掉 `astro.config.mjs:23` 这行**，让插件自动处理。
3. **FAQ 内容填充**（P2-10 发挥价值）— `FAQPage` schema 已就绪，但**只有文章 frontmatter 写了 `faq` 字段才会输出**。建议给 6 篇支柱文章补上 `faq` 字段，才能真正抢到 AI Overviews 与 FAQ 富结果。
4. **sameAs 权威档案扩充**（P2-9 增强）— 当前 `Person.sameAs` 仅 GitHub/官网/微信。可补充知乎、Google Scholar、LinkedIn 等权威档案，强化 GEO 实体信任度（AI 更倾向引用有强实体背书的内容）。
5. **正文图片 alt 内容规范**（P2-14 说明）— 模板层 about 图已规范；但 `/content/posts/**` 的 Markdown 正文图片 `![alt](url)` 的 alt 取决于你写文章时是否填写。建议做一次内容巡检，确保所有配图有描述性 alt（既有 SEO 价值，也利于 AI 理解图文关系）。

---

## 四、部署与验证清单

1. **提交代码**：当前改动均在工作区，先 `git add` + commit（含 `llms-pillars.txt` 新文件）。
2. **本地构建校验**：`astro build` —— 确认 `computedLang`/`ogType`/`hasMath`/`FAQPage` 逻辑无构建报错。
3. **部署**：走现有 `auto-deploy` 流程发布到 pavelhan.tech。
4. **GSC 重提交**：Search Console → 站点地图 → 重新提交 `sitemap-index.xml`。
5. **逐项验证（部署后）**：
   - 富结果测试工具：验 `WebSite`/`Organization`/`BreadcrumbList`/`FAQPage` 可解析
   - 网址检查：抽一篇英文文章页，确认 `<html lang="en">` 且 `og:type=article`
   - 1–2 周后复查 GSC 索引报告：重复网页数趋近 0、404 处理结果
   - GA4 实时面板确认 `G-YGXYK8KCZN` 正常采集流量

---

## 五、结论

代码层面的 SEO/GEO 优化工作已**全面完成**，信号一致性（noindex = sitemap 排除）、i18n 配对（hreflang + lang + og:locale）、结构化数据覆盖（站点/作者/文章/面包屑/FAQ）、GEO 资产（llms.txt 全体系 + 全文支柱库）均已到位。剩余项均为内容运营层面的增强，不影响技术健康度。

下一步重心应从"修代码"转向"养内容 + 等 Google 重新抓取"，并按本报告的 4 个锦上添花项持续打磨即可。
