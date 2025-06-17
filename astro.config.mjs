import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import path from "path"; // ✅ Χρειάζεται για τα alias

export default defineConfig({
  output: "server",
  adapter: netlify(),
  integrations: [tailwind(), mdx(), react()],
  vite: {
    resolve: {
      alias: {
        "@lib": path.resolve("./src/lib"),
        "@components": path.resolve("./src/components"),
        "@utils": path.resolve("./src/utils")
      }
    }
  }
});