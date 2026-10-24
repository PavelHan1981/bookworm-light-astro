/**
 * 分类页 / 标签页的 URL 前缀。
 *
 * 中英两套 taxonomy 各自完整生成、互不混排：
 *   /zh/categories/{slug}  ← 只含中文文章的分类
 *   /en/categories/{slug}  ← 只含英文文章的分类
 * 与 /zh/article/*、/en/article/* 保持对称，语言切换器可以按前缀直接映射。
 */
export const taxonomyBase = (
  lang: "zh" | "en",
  kind: "categories" | "tags",
): string => `/${lang}/${kind}`;

export const taxonomyLang = (postId: string): "zh" | "en" =>
  postId.startsWith("en/") ? "en" : "zh";
