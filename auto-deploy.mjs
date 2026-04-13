#!/usr/bin/env node
/**
 * 自动部署脚本
 * 1. 从 Notion 同步新文章
 * 2. 如果有新文章，提交到 git 并推送到 GitHub
 * 3. 触发部署
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// 配置
const CONFIG = {
  postsDir: "./src/content/posts",
  imagesDir: "./public/images/blog",
  gitBranch: "main",
};

// 颜色输出
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
  } catch (error) {
    if (options.ignoreError) {
      return null;
    }
    throw error;
  }
}

function getCurrentTime() {
  return new Date().toLocaleString("zh-CN");
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => !f.startsWith(".")).length;
}

async function main() {
  log("\n🚀 开始自动部署流程...", "cyan");
  log(`⏰ 当前时间: ${getCurrentTime()}\n`, "blue");

  // 步骤 1: 记录同步前的文件数量
  const postsBefore = countFiles(CONFIG.postsDir);
  const imagesBefore = countFiles(CONFIG.imagesDir);
  log(`📊 同步前文章数量: ${postsBefore}`, "blue");
  log(`📊 同步前图片数量: ${imagesBefore}\n`, "blue");

  // 步骤 2: 执行 Notion 同步
  log("📥 步骤 1/4: 从 Notion 同步文章...", "yellow");
  try {
    exec("node sync.mjs");
  } catch (error) {
    log("❌ Notion 同步失败", "red");
    log(error.message, "red");
    process.exit(1);
  }

  // 步骤 3: 检查是否有新文件
  const postsAfter = countFiles(CONFIG.postsDir);
  const imagesAfter = countFiles(CONFIG.imagesDir);
  const newPosts = postsAfter - postsBefore;
  const newImages = imagesAfter - imagesBefore;

  log(`\n📊 同步后文章数量: ${postsAfter}`, "blue");
  log(`📊 同步后图片数量: ${imagesAfter}\n`, "blue");

  if (newPosts === 0 && newImages === 0) {
    log("✅ 没有新文章需要同步，部署流程结束。\n", "green");
    return;
  }

  log(`🎉 发现 ${newPosts} 篇新文章和 ${newImages} 张新图片！\n`, "green");

  // 步骤 4: Git 操作
  log("📤 步骤 2/4: 提交更改到 Git...", "yellow");

  // 检查 git 状态
  const status = exec("git status --porcelain", { silent: true }) || "";

  if (!status.trim()) {
    log("⚠️ 没有需要提交的更改\n", "yellow");
    return;
  }

  // 添加所有更改
  log("📝 添加文件到暂存区...", "blue");
  exec("git add .");

  // 创建提交
  const commitMessage = `content: sync ${newPosts} new posts from Notion

- 新增文章: ${newPosts} 篇
- 新增图片: ${newImages} 张
- 同步时间: ${getCurrentTime()}`;

  log("💾 创建提交...", "blue");
  exec(`git commit -m "${commitMessage}"`);

  // 步骤 5: 推送到 GitHub
  log("\n📤 步骤 3/4: 推送到 GitHub...", "yellow");
  try {
    exec(`git push origin ${CONFIG.gitBranch}`);
    log("✅ 推送成功！\n", "green");
  } catch (error) {
    log("❌ 推送失败", "red");
    log(error.message, "red");
    process.exit(1);
  }

  // 步骤 6: 完成
  log("🎉 步骤 4/4: 部署流程完成！", "green");
  log(`\n📌 总结:`, "cyan");
  log(`   - 新增文章: ${newPosts} 篇`, "blue");
  log(`   - 新增图片: ${newImages} 张`, "blue");
  log(`   - 总文章数: ${postsAfter} 篇`, "blue");
  log(`   - 推送分支: ${CONFIG.gitBranch}`, "blue");
  log(`   - 完成时间: ${getCurrentTime()}`, "blue");
  log(`\n✨ GitHub Actions 将自动构建并部署网站\n`, "green");
}

// 运行主函数
main().catch((error) => {
  log(`\n❌ 发生错误: ${error.message}`, "red");
  process.exit(1);
});
