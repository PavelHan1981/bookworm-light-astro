import fs from "fs";
import path from "path";
import matter from "gray-matter";

const baseUrl = "https://pavelhan.tech";
const zhPostsDir = path.resolve("src/content/posts/zh");
const enPostsDir = path.resolve("src/content/posts/en");

function getPosts(dir, lang) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  return files
    .map((file) => {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(content);
      const slug = data.slug || file.replace(/\.mdx?$/, "");
      const title = data.title || slug;
      const description = data.description || "";
      const categories = data.categories || ["General"];
      const date = data.date ? new Date(data.date).toISOString().split("T")[0] : "";
      const url = `${baseUrl}/${lang}/article/${slug}`;

      return {
        slug,
        title,
        description,
        categories: Array.isArray(categories) ? categories : [categories],
        date,
        url,
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function groupByCategory(posts) {
  const groups = {};
  for (const post of posts) {
    for (const cat of post.categories) {
      const categoryName = cat || "General";
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(post);
    }
  }
  return groups;
}

// 1. 生成全量中文文章库 (public/llms-full.txt)
const zhPosts = getPosts(zhPostsDir, "zh");
const zhGrouped = groupByCategory(zhPosts);

let zhFullMd = `# PavelHan.tech (中文全量技术文章目录)\n\n`;
zhFullMd += `> 本文件包含 PavelHan.tech 的全量 ${zhPosts.length} 篇中文技术深度解析文章索引，涵盖毫米波雷达感知的物理原理与算法、计算机视觉（YOLO/RT-DETR）、Transformer/LLM 大模型结构、RK3588 边缘 NPU 部署、音频信号处理及物联网底层协议等。\n\n`;
zhFullMd += `## 全量文章索引 (${zhPosts.length} 篇)\n\n`;

for (const [cat, posts] of Object.entries(zhGrouped)) {
  zhFullMd += `### 分类：${cat} (${posts.length} 篇)\n`;
  for (const p of posts) {
    const descStr = p.description ? `: ${p.description.replace(/\n/g, " ")}` : "";
    zhFullMd += `- [${p.title}](${p.url})${descStr}\n`;
  }
  zhFullMd += `\n`;
}

zhFullMd += `## Language Versions & Links\n`;
zhFullMd += `- Curated Chinese LLM Guide: ${baseUrl}/llms.txt\n`;
zhFullMd += `- Full English Catalog (${zhPosts.length} articles): ${baseUrl}/llms-full-en.txt\n`;
zhFullMd += `- Full Sitemap Index: ${baseUrl}/sitemap-index.xml\n`;

fs.writeFileSync(path.resolve("public/llms-full.txt"), zhFullMd, "utf-8");
console.log(`✅ 成功生成 public/llms-full.txt，包含 ${zhPosts.length} 篇中文文章！`);

// 2. 生成全量英文文章库 (public/llms-full-en.txt)
const enPosts = getPosts(enPostsDir, "en");
const enGrouped = groupByCategory(enPosts);

let enFullMd = `# PavelHan.tech (Full English Technical Articles Catalog)\n\n`;
enFullMd += `> This file contains the complete index of all ${enPosts.length} English technical articles on PavelHan.tech, covering mmWave radar sensing principles, computer vision (YOLO, RT-DETR), Transformer/LLM architectures, RK3588 edge NPU deployment, audio signal processing, and IoT hardware engineering.\n\n`;
enFullMd += `## Complete Article Index (${enPosts.length} Articles)\n\n`;

for (const [cat, posts] of Object.entries(enGrouped)) {
  enFullMd += `### Category: ${cat} (${posts.length} Articles)\n`;
  for (const p of posts) {
    const descStr = p.description ? `: ${p.description.replace(/\n/g, " ")}` : "";
    enFullMd += `- [${p.title}](${p.url})${descStr}\n`;
  }
  enFullMd += `\n`;
}

enFullMd += `## Language Versions & Links\n`;
enFullMd += `- Curated English LLM Guide: ${baseUrl}/llms-en.txt\n`;
enFullMd += `- Full Chinese Catalog (${enPosts.length} articles): ${baseUrl}/llms-full.txt\n`;
enFullMd += `- Full Sitemap Index: ${baseUrl}/sitemap-index.xml\n`;

fs.writeFileSync(path.resolve("public/llms-full-en.txt"), enFullMd, "utf-8");
console.log(`✅ 成功生成 public/llms-full-en.txt，包含 ${enPosts.length} 篇英文文章！`);

// 3. 更新 public/llms.txt 中的全量链接指引
const llmsPath = path.resolve("public/llms.txt");
if (fs.existsSync(llmsPath)) {
  let llmsContent = fs.readFileSync(llmsPath, "utf-8");
  if (!llmsContent.includes("llms-full.txt")) {
    llmsContent += `\n- Full Chinese Catalog (${zhPosts.length} articles): ${baseUrl}/llms-full.txt\n`;
    llmsContent += `- Full English Catalog (${enPosts.length} articles): ${baseUrl}/llms-full-en.txt\n`;
    fs.writeFileSync(llmsPath, llmsContent, "utf-8");
  }
}

// 4. 更新 public/llms-en.txt 中的全量链接指引
const llmsEnPath = path.resolve("public/llms-en.txt");
if (fs.existsSync(llmsEnPath)) {
  let llmsEnContent = fs.readFileSync(llmsEnPath, "utf-8");
  if (!llmsEnContent.includes("llms-full-en.txt")) {
    llmsEnContent += `\n- Full English Catalog (${enPosts.length} articles): ${baseUrl}/llms-full-en.txt\n`;
    llmsEnContent += `- Full Chinese Catalog (${zhPosts.length} articles): ${baseUrl}/llms-full.txt\n`;
    fs.writeFileSync(llmsEnPath, llmsEnContent, "utf-8");
  }
}

// 5. 生成核心支柱文章全文 (public/llms-pillars.txt)
const pillarSlugs = [
  "2026-07-01-the-detailed-summary-of-mmWave-sensing-workflow-and-calculation",
  "2026-02-22-transformer-encoder-structure-and-workflow",
  "2026-03-11-the-development-environment-of-RK3588-NPU",
  "2026-04-14-the-detailed-explanation-of-RTDETR-network-and-workflow",
  "2026-03-28-the-summary-of-audio-FFT-calculation-workflow-and-spectrum-diagram",
  "2026-07-22-the-webhooks-and-http-push-feature-of-security-camera",
];

let pillarsMd = `# PavelHan.tech Core Technical Pillars (支柱内容全文库)\n\n`;
pillarsMd += `> 本文件嵌入 PavelHan.tech 最核心的 6 篇技术支柱文章全文，供大语言模型（ChatGPT/Gemini/Claude）及 AI 搜索引擎直接读取、理解与精确引用。\n\n`;

for (const slug of pillarSlugs) {
  const fileNames = fs.readdirSync(zhPostsDir);
  const matchedFile = fileNames.find((f) => f.includes(slug));
  if (matchedFile) {
    const rawContent = fs.readFileSync(path.join(zhPostsDir, matchedFile), "utf-8");
    const { data, content } = matter(rawContent);
    pillarsMd += `---\n\n# ${data.title || slug}\n\n`;
    pillarsMd += `> URL: ${baseUrl}/zh/article/${slug}\n`;
    pillarsMd += `> 摘要: ${data.description || ""}\n\n`;
    pillarsMd += `${content.trim()}\n\n`;
  }
}

fs.writeFileSync(path.resolve("public/llms-pillars.txt"), pillarsMd, "utf-8");
console.log(`✅ 成功生成 public/llms-pillars.txt，包含 ${pillarSlugs.length} 篇核心支柱文章全文！`);

// 6. 更新 public/robots.txt 及 public/llms.txt 指引
const robotsPath = path.resolve("public/robots.txt");
if (fs.existsSync(robotsPath)) {
  let robotsContent = fs.readFileSync(robotsPath, "utf-8");
  if (!robotsContent.includes("llms-pillars.txt")) {
    robotsContent = robotsContent.replace(
      "# Full Catalog (EN): https://pavelhan.tech/llms-full-en.txt",
      "# Full Catalog (EN): https://pavelhan.tech/llms-full-en.txt\n# Pillars Full-Text: https://pavelhan.tech/llms-pillars.txt"
    );
    fs.writeFileSync(robotsPath, robotsContent, "utf-8");
  }
}

if (fs.existsSync(llmsPath)) {
  let llmsContent = fs.readFileSync(llmsPath, "utf-8");
  if (!llmsContent.includes("llms-pillars.txt")) {
    llmsContent += `- Core Technical Pillars Full-Text (6 articles): ${baseUrl}/llms-pillars.txt\n`;
    fs.writeFileSync(llmsPath, llmsContent, "utf-8");
  }
}
