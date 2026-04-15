import { slug } from "github-slugger";

// slugify
export const slugify = (content: string) => {
  if (!content) return "";
  return slug(content);
};

// markdownify (Simplified version without heavy parser to avoid Vite environment crashes)
export const markdownify = (content: string, div?: boolean) => {
  if (!content) return "";
  
  // Very basic markdown patterns for simple UI strings
  let html = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)\__/g, "<strong>$1</strong>")
    .replace(/_(.*?)\_/g, "<em>$1</em>");

  return div ? `<div>${html}</div>` : html;
};

// humanize
export const humanize = (content: string) => {
  if (!content) return "";
  return content
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/[-\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

// titleify
export const titleify = (content: string) => {
  const humanized = humanize(content);
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// plainify (Using Regex instead of a full Markdown parser to prevent crashes with formulas)
export const plainify = (content: string) => {
  if (!content) return "";
  
  const filterMarkdown = content
    .replace(/^#+\s+/gm, "") // remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // remove bold
    .replace(/\*(.*?)\*/g, "$1") // remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // remove links
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`([^`]+)`/g, "$1") // remove inline code
    .replace(/\$\$([\s\S]*?)\$\$/g, "") // remove display math
    .replace(/\$([^\$]+)\$/g, "") // remove inline math
    .replace(/<\/?[^>]+(>|$)/gm, ""); // remove HTML tags

  const filterSpaces = filterMarkdown.replace(/[\r\n]\s*[\r\n]/gm, " ").trim();
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    }
  );
  return htmlWithoutEntities;
};
