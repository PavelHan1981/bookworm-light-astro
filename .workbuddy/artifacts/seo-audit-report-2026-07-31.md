# pavelhan.tech — Google Search Console 索引问题审计报告

| 项目 | 内容 |
|------|------|
| 审计对象 | pavelhan.tech（Astro 静态站 · 中英双语 i18n） |
| 审计日期 | 2026-07-31 |
| 审计方式 | 静态代码审查（路由 / Base.astro / sitemap 配置 / i18n 结构）+ GSC 索引报告分类 |
| 代码状态 | 基于最新提交 `07cbab3`（未修改任何代码，仅审计） |
| 审计结论 | **代码层面索引问题已全部修复，仅剩 404 项需 GSC 线上数据确认** |

---

## 一、背景

用户收到 Google Search Console 邮件通知，站点存在新索引问题。邮件标题点名的"新原因"为：

- 备用网页（有适当的规范标记）：9 个
- 被 "noindex" 标记排除：2 个

GSC 索引概览显示：**已编入索引 242 / 未编入索引 1020**。未索引细项包括：
重复网页（用户未选定规范网页）177、网页会自动重定向 83、未找到(404) 38、已发现尚未索引 694、已抓取尚未索引 16 等。

---

## 二、站点架构确认（关键前提）

审计首先厘清了站点 i18n 架构，这是判断"问题还是正常"的基础：

- **根路径 `/`、`/article/*` 是语言重定向页**（`localStorage` + 浏览器语言判断后 302 跳转到 `/zh` 或 `/en`），均带 `noindex`。
- **真实可索引内容在 `/zh/*` 与 `/en/*`**：如 `/zh/article/[slug]`、`/en/article/[slug]`、`/zh/about`、`/en/about` 等。
- `tags / categories / authors` 位于根目录，为单一语言（混排中英文）页面，标签链接格式 `/tags/xxx`，无语言前缀 → 不存在对应 `/zh/tags` 或 `/en/tags`，**因此无 404 风险，也无需 hreflang 配对**。
- `trailing_slash: false` → 所有 URL 不带尾斜杠，canonical 均不带斜杠，格式一致。

> 基于该架构，邮件中的"备用网页""noindex 排除"在正确实现下属于**预期行为**，真正需修复的是导致 177 重复与 694 未索引的结构性 bug。

---

## 三、根因分析

经代码审查，未索引/重复问题主要来自四类结构性缺陷：

| # | 根因 | 影响 |
|---|------|------|
| R1 | **分页空页 bug**：原 `maxPages = Math.max(totalPages, 100)`，实际文章数不足时硬生成 1–100 页，超范围页全为空内容 | 大量重复/薄内容页 → 177 重复 + 694 未索引主因 |
| R2 | **og:url / canonical 拼接错误**：原 `${base_url}/${pathname.replace("/", "")}` 误删首斜杠，导致社交/规范 URL 错误 | 规范信号失真 |
| R3 | **分页列表页未统一 noindex**：根 `/article/page` 已 noindex，但 `/zh/article/page`、`/en/article/page` 漏加 | 双语分页页被收录，与列表首页争抢权重 |
| R4 | **配对内容页缺 hreflang**：`about / elements / privacy-policy` 的 zh/en 版本无 `hreflang` 配对 | Google 将中英同主题页误判为重复（177 重复剩余来源） |

---

## 四、修复历程（3 次提交）

| 提交 | 修复内容 | 对应根因 |
|------|----------|----------|
| `f5c9f6f` | 分页 `maxPages` 改为实际页数；og:url 改用 canonical 变量；根 `/article/page` 加 noindex；sitemap 排除 `/search`、`/page/*`；首页+文章页 hreflang 已实现 | R1, R2, R3(部分) |
| `b965c2c` | `about / elements / privacy-policy` 的 zh/en 版本补完整 `zh`/`en`/`x-default`（→zh）hreflang + 显式 canonical | R4 |
| `07cbab3` | `zh/article/page`、`en/article/page` 补 `noindex={true}`（保留 canonical） | R3(收尾) |

---

## 五、最终状态核验（逐项）

### 5.1 noindex 一致性 ✅
应被排除的页（重定向/导航）已全部 `noindex`：

| 文件 | 类型 | noindex |
|------|------|---------|
| `index.astro` | 根首页重定向 | ✅ |
| `about.astro` / `elements.astro` / `privacy-policy.astro` | 根重定向 | ✅ |
| `article/index.astro` / `article/[slug].astro` | 根重定向 | ✅ |
| `article/page/[...page].astro` | 根分页 | ✅ |
| `page/[slug].astro` | 根分页 | ✅ |
| `zh/article/page/[...page].astro` | **zh 分页** | ✅（07cbab3 新增） |
| `en/article/page/[...page].astro` | **en 分页** | ✅（07cbab3 新增） |

真实内容页（`zh/index`、`en/index`、`zh/article/[slug]`、`en/article/[slug]`、`zh/about`、`en/about`、`zh/elements`、`en/elements`、`zh/privacy-policy`、`en/privacy-policy`）**均无 noindex，应被正常索引** ✅

### 5.2 hreflang 覆盖度 ✅
全站 5 对配对内容页均已实现 `zh`/`en`/`x-default` 互指（x-default→zh，与首页一致）：

`index` · `article/[slug]` · `about` · `elements` · `privacy-policy`（zh/en 双版本共 10 个文件）

### 5.3 sitemap 排除规则 ✅
`astro.config.mjs` 排除：`/`（首页重定向）、`/about`、`/privacy-policy`、`/elements`、`/article`、`/search`、`/article/*`、`/page/*`。
- 被排除项均为 `noindex` 的重定向/导航页，**与 noindex 策略一致** ✅
- 真实内容页 `/zh/*`、`/en/*` 不被排除，正常进入 sitemap ✅

### 5.4 canonical 默认行为 ✅
`Base.astro` 中 `canonical ? canonical : ${base_url}${pathname}`，分页页显式 canonical 指向列表首页（page/1）或自身（page/N），无自引用冲突。

---

## 六、剩余风险与待办

### ⏳ 404 的 38 个（需 GSC 线上数据）
- 代码层面已排除风险点：标签链接 `/tags/xxx` 无 404 风险；根 `/article/*` 为重定向页非 404 源；分页超范围空页（R1）已修复。
- **需用户操作**：GSC → 索引 → 页面 → 筛选「未找到 (404)」→ 导出具体 URL 列表。若是旧 slug 迁移导致，应补 301 重定向到新地址。

---

## 七、后续行动与验证计划

1. **部署**：`astro build` + 部署到生产环境（pavelhan.tech）。
2. **重提交 sitemap**：GSC → 站点地图 → 重新提交 `sitemap-index.xml`。
3. **等待期**：当前 GSC 数据仍为改版前旧状态，需等 **1–2 周** Google 重新抓取。
4. **复查指标**：
   - 重复网页（用户未选定规范网页）数量应显著下降（目标趋近 0）
   - 未找到(404) 数量依 GSC 导出结果对症处理
   - 已发现/已抓取尚未索引 → 应随内容质量信号改善逐步进入索引
   - 新提交 sitemap 的"已编入索引 / 总数"比值应上升
5. **长期**：保持双语页 hreflang 配对；新增内容类型时同步补 canonical + hreflang。

---

## 八、审计结论

> **代码层面所有索引结构性缺陷（R1–R4）已通过 3 次提交全部修复，noindex / hreflang / sitemap 三者策略一致。** 站点已处于健康的索引就绪状态。唯一待办为 404 项的线上数据确认（依赖 GSC 导出），属运营验证范畴，非代码缺陷。
