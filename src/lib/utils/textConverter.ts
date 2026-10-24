// slugify (Custom implementation to avoid external library conflicts in Vite)
export const slugify = (content: string): string => {
  if (!content) return "";
  return String(content)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// slugifyTaxonomy
// 用于分类/标签（taxonomy）的 slug。与 slugify 的区别：保留 Unicode 字母，
// 因此中文分类名（如「网络安全」）会生成可读 URL，而不是被剥成空串。
// slugify 的 [^\w\s-] 会把所有 CJK 字符删掉，导致中文分类页从未被生成、
// 文章页的分类链接退化成 href="/categories/"。
export const slugifyTaxonomy = (content: string): string => {
  if (!content) return "";
  return String(content)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s_-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
};

// safeDecode
// Astro 的动态路由参数可能已被解码，也可能仍是百分号编码；二次解码遇到裸 % 会抛异常，
// 这里统一兜住。
export const safeDecode = (value?: string): string => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// markdownify (Simplified version without heavy parser to avoid Vite environment crashes)
export const markdownify = (content: string, div?: boolean): string => {
  if (!content) return "";
  
  // Very basic markdown patterns for simple UI strings
  let html = String(content)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)\__/g, "<strong>$1</strong>")
    .replace(/_(.*?)\_/g, "<em>$1</em>");

  return div ? `<div>${html}</div>` : html;
};

// humanize
export const humanize = (content: string): string => {
  if (!content) return "";
  const str = String(content);
  const h = str
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/[-\s]+/g, " ");
  
  return h.charAt(0).toUpperCase() + h.slice(1);
};

// titleify
export const titleify = (content: string): string => {
  if (!content) return "";
  const humanized = humanize(content);
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// plainify (Using Regex instead of a full Markdown parser to prevent crashes with formulas)
export const plainify = (content: string): string => {
  if (!content) return "";

  const str = String(content);
  const filterMarkdown = str
    .replace(/^#+\s+/gm, "") // remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold
    .replace(/\*(.*?)\*/g, "$1") // remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // remove links
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`([^`]+)`/g, "$1") // remove inline code
    .replace(/\$\$[\s\S]*?\$\$/g, "") // remove display math (multiline)
    .replace(/\$[^$]+\$/g, "") // remove inline math
    .replace(/<mjx-container[\s\S]*?<\/mjx-container>/g, "") // remove MathJax SVG containers
    .replace(/<\/?[^>]+(>|$)/gm, ""); // remove HTML tags

  const filterSpaces = filterMarkdown.replace(/[\r\n]\s*[\r\n]/gm, " ").trim();

  // simple entity decoder
  return filterSpaces
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

// excerpt：列表页摘要，必须在服务端截断。
// 之前列表页直接输出 plainify(post.body) 再用 CSS line-clamp-2 视觉截断，
// 结果是整篇正文都被写进 HTML（分类页因此膨胀到 700KB+）。
export const excerpt = (content: string, limit = 140): string => {
  const text = plainify(content).replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};
