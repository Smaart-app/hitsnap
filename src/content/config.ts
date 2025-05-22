import { defineCollection, z } from 'astro:content';

const articleSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  slug: z.string(),
  lang: z.enum(["el", "en"]),
  published: z.boolean(),
  image: z.string().optional()
}).strict(); // ← αυτό είναι κλειδί

export const collections = {
  articles: defineCollection({ schema: articleSchema })
};