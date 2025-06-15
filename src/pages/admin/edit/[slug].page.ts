import type { APIContext } from "astro";
import { createServerClientWithCookies } from "../../../lib/createServerClient.ts";

export const prerender = false;

export async function get({ params, cookies }: APIContext) {
  const { slug } = params;

  console.log("[.page.ts] Incoming slug param:", slug);

  if (!slug || typeof slug !== "string") {
    return new Response("⛔ Invalid slug", { status: 400 });
  }

  const supabase = createServerClientWithCookies(cookies);

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  console.log("[.page.ts] Supabase query result:", article);
  console.log("[.page.ts] Supabase error:", error);

  if (error || !article) {
    return new Response(`❌ Article not found for slug: ${slug}`, {
      status: 404,
    });
  }

  return {
    props: { article },
  };
}

export { default } from "./edit-article.astro";
