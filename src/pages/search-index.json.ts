import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { excerpt } from "@/lib/utils/textConverter";

// 搜索索引在构建期生成成独立 JSON。
// 之前 SearchBar 通过 client:load props 接收全部文章的完整正文，
// 导致 /search 页 HTML 高达 2.8MB。改为按需 fetch 后，首屏只传索引本身。
export const GET: APIRoute = async () => {
  const all = await getCollection("posts");

  const list = all
    .filter((post) => post.id.startsWith("zh/") && post.data.draft !== true)
    .map((post) => {
      const slug =
        post.data.slug || post.id.replace(/^zh\//, "").replace(/\.mdx?$/, "");

      return {
        url: `/zh/article/${slug}`,
        title: post.data.title,
        date: post.data.date ? new Date(post.data.date).toISOString() : null,
        categories: post.data.categories ?? [],
        tags: post.data.tags ?? [],
        image: post.data.image ?? null,
        excerpt: excerpt(post.body ?? "", 120),
      };
    });

  return new Response(JSON.stringify(list), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
