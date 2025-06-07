import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel"; // 👉 άλλαξε από netlify σε vercel

export default defineConfig({
  output: "server", // 🔧 Παραμένει γιατί χρειάζεσαι API routes
  adapter: vercel(), // ✅ Αυτό χρειάζεται για να λειτουργεί στο Vercel
  integrations: [tailwind(), mdx(), react()],
  vite: {
    define: {
      'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY),
      'process.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
    }
  }
});