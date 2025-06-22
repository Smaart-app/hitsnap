import type { APIRoute } from "astro";
import { createServerClientWithCookies } from "../../lib/createServerClient.ts";
import { createAdminClientNoCookies } from "../../lib/createAdminClientNoCookies.ts";

export const prerender = false;

// Λειτουργία για καθαρό slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const {
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

    // Slug γενιά με έλεγχο μοναδικότητας
    const baseSlug = generateSlug(title);
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

    // Το μόνο που επιστρέφω προς το παρόν είναι τα βασικά για redirect
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