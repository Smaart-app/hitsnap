import { defineCollection, z } from 'astro:content'

// ✳️ Διατηρούμε το schema σε περίπτωση που το χρειαστείς αργότερα
const articleSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  publish_date: z.string(),
  slug: z.string(),
  lang: z.enum(["el", "en"]),
  published: z.boolean(),
  image: z.string().optional()
})

// ✳️ Απενεργοποιούμε προσωρινά τη συλλογή articles για να μην ψάχνει για αρχεία
export const collections = {
  // articles: defineCollection({ schema: articleSchema })
}

// ✅ Custom config για εύκολη παραμετροποίηση του template
export const siteConfig = {
  siteTitle: 'HitSnap',
  siteTagline: 'The subtle art of website design.',
  brandName: 'SMAart',
  signature: 'HitSnap',
  year: 2025
}
