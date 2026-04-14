# 文章页面分页功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `/article` 页面实现每页 20 篇文章的分页功能，减少单页渲染压力并提升加载速度。

**Architecture:** 采用 Astro 的静态路由与动态路由相结合的方式：`/article` 显示第一页，`/article/page/[slug]` 显示后续页面。利用现有的 `Pagination` 组件处理分页导航。

**Tech Stack:** Astro, TypeScript

---

### Task 1: 准备工作与配置确认

**Files:**
- Modify: `src/config/config.json` (可选，根据需要调整全局分页配置或保持局部硬编码)

- [ ] **Step 1: 确认当前文章总数并验证分页逻辑**
由于目前有 189 篇文章，每页 20 篇，预计将生成 10 页。

### Task 2: 改造 `/article` 首页 (第一页)

**Files:**
- Modify: `src/pages/article/index.astro`

- [ ] **Step 1: 修改 `src/pages/article/index.astro` 实现切片加载**

```astro
---
import Pagination from "@/components/Pagination.astro";
import Timeline from "@/components/Timeline.astro";
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { sortByDate } from "@/lib/utils/sortFunctions";

const posts = await getSinglePage("posts");
const sortedPosts = sortByDate(posts);
const totalPages = Math.ceil(posts.length / 20);
const currentPosts = sortedPosts.slice(0, 20);
---

<Base title="Articles">
  <section class="section">
    <div class="container">
      <h1 class="h2 mb-16 text-center">All Articles</h1>
      <Timeline posts={currentPosts} />
      <Pagination section="article" totalPages={totalPages} currentPage={1} />
    </div>
  </section>
</Base>
```

### Task 3: 创建动态分页页面 `/article/page/[slug].astro`

**Files:**
- Create: `src/pages/article/page/[slug].astro`

- [ ] **Step 1: 创建文件并实现 `getStaticPaths` 与分页逻辑**

```astro
---
import Pagination from "@/components/Pagination.astro";
import Timeline from "@/components/Timeline.astro";
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { sortByDate } from "@/lib/utils/sortFunctions";

export async function getStaticPaths() {
  const posts = await getSinglePage("posts");
  const totalPages = Math.ceil(posts.length / 20);
  const paths = [];

  for (let i = 1; i < totalPages; i++) {
    paths.push({
      params: {
        slug: (i + 1).toString(),
      },
    });
  }
  return paths;
}

const { slug } = Astro.params;
const posts = await getSinglePage("posts");
const sortedPosts = sortByDate(posts);
const totalPages = Math.ceil(posts.length / 20);
const currentPage = slug && !isNaN(Number(slug)) ? Number(slug) : 1;
const indexOfLastPost = currentPage * 20;
const indexOfFirstPost = indexOfLastPost - 20;
const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
---

<Base title={`Articles - Page ${currentPage}`}>
  <section class="section">
    <div class="container">
      <h1 class="h2 mb-16 text-center">All Articles</h1>
      <Timeline posts={currentPosts} />
      <Pagination section="article" totalPages={totalPages} currentPage={currentPage} />
    </div>
  </section>
</Base>
```

### Task 4: 验证分页功能

- [ ] **Step 1: 检查 `/article` 是否只显示前 20 篇**
- [ ] **Step 2: 检查分页组件是否出现，且点击 "2" 是否跳转到 `/article/page/2`**
- [ ] **Step 3: 验证 `/article/page/2` 显示的内容是否正确（第 21-40 篇）**
