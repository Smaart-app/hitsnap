import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "server", // 🔧 Χρειάζεται για να επιτραπεί POST /api/contact
  adapter: netlify(), // ✅ Συμβατό με Netlify serverless functions
  integrations: [tailwind(), mdx(), react()],
  vite: {
    define: {
      'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY),
      'process.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
    }
  }
});
