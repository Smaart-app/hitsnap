import type { APIRoute } from "astro";
import { createServerClientWithCookies } from "../../lib/createServerClient.ts";
import { createAdminClientNoCookies } from "../../lib/createAdminClientNoCookies.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const {
      slug,
      title,
      excerpt,
      content,
      cover_image,
      lang,
      published,
      publish_date,
    } = body;

    // Supabase client για authentication
    const supabase = createServerClientWithCookies(cookies);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ article: null, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Admin client για write rights
    const admin = createAdminClientNoCookies();

    // Έλεγχος μοναδικότητας slug (με βάση το slug που περνάει η φόρμα)
    let baseSlug = slug;
    let fullSlug = `${baseSlug}-${lang}`;
    let index = 1;

    while (true) {
      const { data: existing, error: slugError } = await admin
        .from("articles")
        .select("id")
        .eq("slug", fullSlug)
        .maybeSingle();

      if (slugError) {
        return new Response(
          JSON.stringify({ article: null, error: `Error checking slug: ${slugError.message}` }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!existing) break;

      fullSlug = `${baseSlug}-${lang}-${index}`;
      index++;
    }

    const { error } = await admin.from("articles").insert([
      {
        user_id: user.id,
        title,
        slug: fullSlug,
        excerpt: excerpt || null,
        content,
        cover_image: cover_image || null,
        lang,
        published: !!published,
        publish_date: publish_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return new Response(
        JSON.stringify({ article: null, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ article: { slug: fullSlug, lang }, error: null }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Unhandled error in save-article:", e);
    return new Response(
      JSON.stringify({ article: null, error: e?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};