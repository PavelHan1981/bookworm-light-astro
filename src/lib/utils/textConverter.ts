// slugify (Custom implementation to avoid external library conflicts in Vite)
export const slugify = (content: string): string => {
  if (!content) return "";
  return String(content)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
