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
      lastmod: new Date(),
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
          p.startsWith("/article/")
        ) {
          return false;
        }

        return true;
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
      // remarkMath,
    ],
    rehypePlugins: [],
    shikiConfig: { theme: "one-dark-pro", wrap: true },
  },
});
