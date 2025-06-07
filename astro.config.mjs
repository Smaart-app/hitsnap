import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify/functions"; // ✅ Εδώ αλλάζει!

export default defineConfig({
  output: "server",
  adapter: netlify(), // ✅ Εδώ αλλάζει!
  integrations: [tailwind(), mdx(), react()],
});
