import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import path from "path";

// 🟢 Πρόσθεσε το site εδώ!
export default defineConfig({
  site: 'https://hitsnap.app', // <-- ΒΑΣΙΚΟ για sitemap & SEO!
  output: "server",
  adapter: netlify(),

  // ✅ Λύση για το Invalid API key: Ενεργοποιεί την πρόσβαση στις env μεταβλητές
  envPrefix: ['PUBLIC_', 'SUPABASE_'],

  integrations: [
    tailwind(),
    mdx(),
    react(),
    sitemap() // <-- Απλά κάλεσέ το χωρίς baseUrl, το παίρνει από το site πάνω!
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
    }
  }
});
