import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import path from "path";

export default defineConfig({
  site: 'https://hitsnap.app',
  output: "server",
  adapter: netlify(),

  // ✅ Προστέθηκε SMTP_ για να λειτουργούν οι email μεταβλητές
  envPrefix: ['PUBLIC_', 'SUPABASE_', 'SMTP_'],

  integrations: [
    tailwind(),
    mdx(),
    react(),
    sitemap()
  ],

  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
        "@/config": path.resolve("./src/content/config.ts"),
        "@lib": path.resolve("./src/lib"),
        "@components": path.resolve("./src/components"),
        "@utils": path.resolve("./src/utils"),
        "@layouts": path.resolve("./src/layouts")
      }
    },
    define: {
      'process.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
      'process.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY),
      'process.env.PUBLIC_SITE_URL': JSON.stringify(process.env.PUBLIC_SITE_URL),
    }
  }
});
