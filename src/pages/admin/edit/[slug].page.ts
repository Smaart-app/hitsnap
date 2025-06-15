import type { APIContext } from "astro";
import { createServerClient } from "@supabase/ssr";

export const prerender = false;

export async function get(context: APIContext) {
  const { params, cookies } = context;
  const { slug } = params;

  console.log("[.page.ts] Incoming slug param:", slug);

  if (!slug || typeof slug !== "string") {
    console.warn("[.page.ts] Invalid or missing slug param:", slug);
    return new Response("⛔ Invalid slug", {
      status: 400,
    });
  }

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { cookies }
  );

  // Προσωρινά fetch όλα τα slug για debug
  const allSlugs = await supabase.from("articles").select("slug");
  console.log("[.page.ts] Available slugs in DB:", allSlugs.data?.map((a) => a.slug));

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  console.log("[.page.ts] Supabase result:", article);
  console.log("[.page.ts] Supabase error:", error);

  if (error || !article) {
    console.warn("[.page.ts] Article not found, redirecting to 404");
    return new Response(`❌ Article not found for slug: ${slug}`, {
      status: 404,
    });
  }

  // 🔁 Αν θέλεις απλά να δεις ότι δουλεύει, μπορείς να αλλάξεις εδώ
  // και να επιστρέψεις προσωρινά debug κείμενο:
  // return new Response(`✅ Found: ${article.title}`);

  return {
    props: { article },
  };
}

export { default } from './edit-article.astro';
