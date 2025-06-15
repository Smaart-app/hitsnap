import type { APIContext } from "astro";
import { createServerClient } from "@supabase/ssr";

export const prerender = false;

export async function get(context: APIContext) {
  const { params, cookies } = context;
  const { slug } = params;

  console.log("[.page.ts] Incoming slug param:", slug);

  if (!slug) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/404" },
    });
  }

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { cookies }
  );

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  console.log("[.page.ts] Supabase result:", article);
  console.log("[.page.ts] Supabase error:", error);

  if (error || !article) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/404" },
    });
  }

  return {
    props: { article },
  };
}

export { default } from './edit-article.astro';