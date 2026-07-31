import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

// About collection schema
const aboutCollection = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "src/content/about",
    generateId: ({ entry }) => entry,
  }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    tech_tags: z.array(z.string()).optional(),
    competencies: z
      .array(
        z.object({
          icon: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    what_i_do: z
      .object({
        title: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          }),
        ),
      })
      .optional(),
  }),
});

// Contact collection schema
const contactCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/contact" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

// Authors collection schema
const authorsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/authors" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    social: z
      .object({
        facebook: z.url().optional(),
        x: z.url().optional(),
        instagram: z.url().optional(),
        linkedin: z.url().optional(),
        github: z.url().optional(),
        website: z.url().optional(),
        youtube: z.url().optional(),
      })
      .optional(),
  }),
});

// Posts collection schema
const postsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/content/posts",
    generateId: ({ entry }) => entry,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    dateModified: z.coerce.date().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()).default(() => ["others"]),
    authors: z.array(z.string()).default(() => ["Admin"]),
    tags: z.array(z.string()).default(() => ["others"]),
    draft: z.boolean().optional(),
    faq: z
      .array(
        z.object({
          q: z.string().optional(),
          question: z.string().optional(),
          a: z.string().optional(),
          answer: z.string().optional(),
        })
      )
      .optional(),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/content/pages",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, "").replace(/^\//, ""),
  }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    layout: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

// Export collections
export const collections = {
  posts: postsCollection,
  about: aboutCollection,
  contact: contactCollection,
  authors: authorsCollection,
  pages: pagesCollection,
};
