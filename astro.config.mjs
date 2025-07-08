import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap"; // 🟢 ΝΕΟ: import το sitemap!
import path from "path";

export default defineConfig({
  output: "server",
  adapter: netlify(),
  integrations: [
    tailwind(),
    mdx(),
    react(),
    sitemap({ baseUrl: 'https://hitlift.app' }) // 🟢 ΝΕΟ: το integration με baseUrl
  ],
  vite: {
    resolve: {
      alias: {
        "@lib": path.resolve("./src/lib"),
        "@components": path.resolve("./src/components"),
        "@utils": path.resolve("./src/utils"),
        "@layouts": path.resolve("./src/layouts") // ✅
      }
    },
    build: {
      rollupOptions: {
        external: ['formidable']
      }
    }
  }
});
