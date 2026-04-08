# 博客重构（文学简约风格）执行计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目重构为以文学摘录轮播为核心的极简 Home 页，单侧时间轴风格的 Blog 列表页，并整合 About/Contact 页面。

**Architecture:** 
- 使用 React 组件 (`Excerpts.tsx`) 处理首页的动态轮播。
- 采用 Astro 组件 (`Timeline.astro`) 实现时间轴布局。
- 通过修改 `menu.json` 实现导航精简。

**Tech Stack:** Astro, React, Tailwind CSS, Lucide Icons (或项目原有的 react-icons)

---

### Task 1: 导航菜单与 About 页面整合

**Files:**
- Modify: `src/config/menu.json`
- Modify: `src/pages/about.astro`
- Delete: `src/pages/contact.astro` (后续任务完成后执行)

- [ ] **Step 1: 精简导航菜单**
修改 `src/config/menu.json`，仅保留 Home, Blog, About。

- [ ] **Step 2: 整合 Contact 内容到 About 页面**
将原 `contact.astro` 的联系表单和信息迁移至 `about.astro`。

- [ ] **Step 3: 验证导航与 About 页面**
运行 `npm run dev`，检查导航栏是否更新，About 页面是否正确显示联系方式。

---

### Task 2: 创建首页文学摘录组件 (Excerpts.tsx)

**Files:**
- Create: `src/layouts/helpers/Excerpts.tsx`

- [ ] **Step 1: 编写 React 轮播组件**
实现鲁迅、沈从文、木心三段摘录的自动切换。

- [ ] **Step 2: 编写组件测试或手动验证**
在测试页或直接在首页预览组件效果。

---

### Task 3: 重构首页 (Home Page)

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 替换原有内容为文学展示区**
引入 `Excerpts.tsx` 并设置优雅的间距。

- [ ] **Step 2: 添加标签云 (Tag Cloud)**
提取所有文章标签并以简约样式展示。

- [ ] **Step 3: 验证首页布局**
确保移动端和桌面端的视觉一致性。

---

### Task 4: 实现 Blog 时间轴页面

**Files:**
- Create: `src/layouts/components/Timeline.astro`
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: 编写 Timeline 布局组件**
实现单侧垂直线与圆点节点。

- [ ] **Step 2: 创建 /blog 路由页面**
调用 `Timeline.astro` 展示所有文章。

- [ ] **Step 3: 验证时间轴功能**
检查日期排序是否正确，链接跳转是否有效。

---

### Task 5: 清理与最终校验

- [ ] **Step 1: 删除冗余页面**
确认 `/contact` 功能已完全迁移后删除 `src/pages/contact.astro`。

- [ ] **Step 2: 运行完整构建校验**
执行 `npm run build` 确保无坏链或类型错误。
