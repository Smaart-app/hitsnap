import { defineCollection, z } from 'astro:content';

const articleSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  slug: z.string(),
});

// Χρησιμοποίησε μόνο αυτήν ή προσαρμόσου αργότερα για περισσότερες γλώσσες
export const collections = {
  articles: defineCollection({ schema: articleSchema })
};
