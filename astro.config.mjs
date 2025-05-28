import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import staticAdapter from "@astrojs/adapter-static";

export default defineConfig({
  output: "static",
  adapter: staticAdapter(),
  integrations: [tailwind(), mdx(), react()],
});