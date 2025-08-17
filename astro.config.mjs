// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import path from "path";

function detectDynamicEnv() {
  return {
    name: "detect-dynamic-env",
    enforce: "pre",
    transform(code, id) {
      // αγνόησε node_modules
      if (id.includes("node_modules")) return null;

      // patterns που δεν επιτρέπονται
      const dyn = code.match(/import\.meta\.env\[[^\]]+\]/g);
      const anyEnv = code.match(/\(import\.meta\s+as\s+any\)\?\.\s*env/g);

      if (dyn || anyEnv) {
        const found = []
          .concat(dyn || [])
          .concat(anyEnv || [])
          .slice(0, 5)
          .join("\n");
        this.error(
          `❌ Dynamic import.meta.env usage in:\n${id}\n\nFound:\n${found}`
        );
      }
      return null;
    },
  };
}

export default defineConfig({
  site: "https://hitsnap.app",
  output: "server",
  adapter: netlify(),

  // περνάμε PUBLIC_, SUPABASE_, SMTP_
  envPrefix: ["PUBLIC_", "SUPABASE_", "SMTP_"],

  integrations: [tailwind(), mdx(), react(), sitemap()],

  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
        "@/config": path.resolve("./src/content/config.ts"),
        "@lib": path.resolve("./src/lib"),
        "@components": path.resolve("./src/components"),
        "@utils": path.resolve("./src/utils"),
        "@layouts": path.resolve("./src/layouts"),
      },
    },
    define: {
      "process.env.PUBLIC_SUPABASE_URL": JSON.stringify(
        process.env.PUBLIC_SUPABASE_URL
      ),
      "process.env.PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.PUBLIC_SUPABASE_ANON_KEY
      ),
      "process.env.PUBLIC_SITE_URL": JSON.stringify(
        process.env.PUBLIC_SITE_URL
      ),
    },
    plugins: [detectDynamicEnv()], // 👈 προσωρινός ανιχνευτής
  },
});
