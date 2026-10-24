import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import { defineConfig, sharpImageService } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import config from "./src/config/config.json";

// 构建「文章路径 → 内容最后修改时间」的映射，供 sitemap 输出真实的 lastmod。
// 不能用文件 mtime：CI 构建 checkout 时会把所有文件的 mtime 重置为构建时刻，
// 那等于把全站 lastmod 都写成"今天"，Google 会直接忽略整个字段。
function buildLastmodMap() {
  const map = new Map();
  const sources = [
    { dir: "src/content/posts/zh", prefix: "/zh/article/" },
    { dir: "src/content/posts/en", prefix: "/en/article/" },
  ];

  for (const { dir, prefix } of sources) {
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;

      const full = path.join(dir, file);
      let data;
      try {
        data = matter(fs.readFileSync(full, "utf-8")).data;
      } catch {
        continue;
      }

      const slug = data.slug || file.replace(/\.mdx?$/, "");
      const raw = data.dateModified || data.date;
      if (!raw) continue;

      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) continue;

      map.set(`${prefix}${slug}`, date);
    }
  }

  return map;
}

const lastmodMap = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://examplesite.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: { service: sharpImageService() },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const url = new URL(page);
        const p = url.pathname.replace(/\/$/, "");

        // 英文版为机器翻译，已统一输出 noindex，不应出现在 sitemap 中
        const enIndexable = config.settings.en_indexable !== false;
        if (!enIndexable && (p === "/en" || p.startsWith("/en/"))) {
          return false;
        }

        // 分页页面本身是 noindex（含语言前缀的 /zh|/en/article/page/N）
        if (p.startsWith("/page/") || /^\/(?:en|zh)?\/?article\/page\//.test(p)) {
          return false;
        }

        // 无语言前缀的旧路径与工具页
        if (
          p === "" ||
          p === "/about" ||
          p === "/privacy-policy" ||
          p === "/elements" ||
          p === "/article" ||
          p === "/search" ||
          p.startsWith("/article/") ||
          // 主题自带的 UI 组件演示页（含 /zh/elements、/en/elements）已 noindex
          p.endsWith("/elements")
        ) {
          return false;
        }

        return true;
      },
      // 逐条写入真实的最后修改时间；没有日期的页面不输出 lastmod，
      // 这比全站统一输出构建时间更诚实（后者会被 Google 直接忽略）。
      serialize(item) {
        const { pathname } = new URL(item.url);
        let p = pathname;
        try {
          p = decodeURIComponent(pathname);
        } catch {
          // 解码失败则保留原始形式参与匹配
        }
        p = p.replace(/\/$/, "");

        const date = lastmodMap.get(p);
        if (date) {
          item.lastmod = date.toISOString();
        } else {
          delete item.lastmod;
        }

        return item;
      },
    }),
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Notice",
        "@/shortcodes/Video",
        "@/shortcodes/Youtube",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
      ],
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
      // 公式支持：remarkMath 负责把 $...$ / $$...$$ 解析成 math 节点，
      // rehypeKatex 负责在构建期编译成 HTML（SSR 输出，不依赖客户端 JS）。
      // 全站已审计：103 个文件 / 2069 个公式节点，编译失败 0 个。
      // 注意：正文里若出现字面量 $（价格、shell 变量），必须写成 \$ 转义，
      // 否则会和相邻的 $ 配对成公式。
      remarkMath,
    ],
    rehypePlugins: [
      // throwOnError 保持默认 false：单个公式写错只影响它自己，不会炸整站构建
      rehypeKatex,
    ],
    shikiConfig: { theme: "one-dark-pro", wrap: true },
  },
});
