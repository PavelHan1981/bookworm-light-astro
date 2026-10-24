import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import config from "@/config/config.json";

export async function GET(context: any) {
  const posts = await getCollection("posts");
  const enPosts = posts.filter(
    (post) => post.id.startsWith("en/") && !post.data.draft
  );

  const sortedPosts = enPosts.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });

  return rss({
    title: "Pavel Han - Tech Blog",
    description:
      "Understanding and explaining technical topics from low-level fundamental principles.",
    site: context.site || config.site.base_url,
    items: sortedPosts.map((post) => {
      const slug =
        post.data.slug || post.id.replace(/^en\//, "").replace(/\.mdx?$/, "");
      return {
        title: post.data.title,
        pubDate: post.data.date ? new Date(post.data.date) : new Date(),
        description: post.data.description || "",
        link: `/en/article/${slug}`,
      };
    }),
    customData: `<language>en</language>`,
  });
}
