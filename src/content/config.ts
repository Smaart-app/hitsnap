import { defineCollection, z } from 'astro:content';

const articleSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  slug: z.string(), // ✅ Εδώ ήταν το πρόβλημα
});

export const collections = {
  el: defineCollection({ schema: articleSchema }),
  en: defineCollection({ schema: articleSchema }),
};
