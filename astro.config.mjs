import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify"; // ✅ Διορθώθηκε

export default defineConfig({
  output: "server",
  adapter: netlify(), // ✅ Συμβατό με το νέο import
  integrations: [tailwind(), mdx(), react()],
});
