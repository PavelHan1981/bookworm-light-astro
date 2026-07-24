import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("❌ 错误：未在环境变量或 .env 中检测到 GEMINI_API_KEY 或 GOOGLE_API_KEY。");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const zhDir = path.resolve("src/content/posts/zh");
const enDir = path.resolve("src/content/posts/en");

if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest"
];

async function translateContent(zhContent) {
  const prompt = `You are an expert technical translator. Translate the following Chinese Markdown blog post into professional, natural English.

Strict Rules:
1. Preserve the Frontmatter format (between --- and ---) exactly. Translate title, description, categories, tags into English while keeping keys (title, slug, description, date, image, categories, tags, draft) untouched. Keep slug value identical.
2. DO NOT translate code blocks (between \`\`\` and \`\`\`), inline code (\`...\`), HTML tags, or image URLs (/images/blog/...).
3. Translate all Markdown headings, paragraphs, lists, and quotes smoothly into technical English.
4. Output ONLY the complete translated Markdown string (starting with ---). Do NOT wrap the result in additional code blocks (no \`\`\`markdown ... \`\`\`).

Here is the Chinese Markdown content:
${zhContent}`;

  while (true) {
    for (const modelName of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        let text = response.text ? response.text.trim() : "";
        if (text.startsWith("```markdown")) {
          text = text.replace(/^```markdown\s*/, "").replace(/```$/, "").trim();
        } else if (text.startsWith("```")) {
          text = text.replace(/^```\s*/, "").replace(/```$/, "").trim();
        }
        if (text) return text;
      } catch (err) {
        if (err.message?.includes("RESOURCE_EXHAUSTED") || err.status === 429) {
          console.warn(`⚠️ 模型 ${modelName} 限额配额已满，尝试下一个候选模型...`);
          continue;
        }
        console.warn(`⚠️ 模型 ${modelName} 响应异常: ${err.message}`);
      }
    }

    console.warn("⏳ 所有候选模型均暂无配额，等待 30 秒后再次自动重试...");
    await new Promise((r) => setTimeout(r, 30000));
  }
}

async function main() {
  const files = fs.readdirSync(zhDir).filter((f) => f.endsWith(".md"));
  console.log(`📚 本地共有 ${files.length} 篇中文文章。`);

  let translated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const enPath = path.join(enDir, file);
    const zhPath = path.join(zhDir, file);

    if (fs.existsSync(enPath)) {
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${files.length}] 🤖 正在使用 Gemini 翻译: ${file}...`);
    try {
      const zhContent = fs.readFileSync(zhPath, "utf-8");
      const enContent = await translateContent(zhContent);
      if (enContent) {
        fs.writeFileSync(enPath, enContent, "utf-8");
        translated++;
        console.log(`   ✅ 成功保存至: src/content/posts/en/${file}`);
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`   ❌ 翻译 ${file} 失败: ${err.message}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n🎉 翻译处理结束！已跳过: ${skipped}，成功翻译: ${translated}，失败: ${failed}。`);
}

main();
