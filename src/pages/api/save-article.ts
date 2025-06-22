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
      cover_image,    // <-- ΣΩΖΕΤΑΙ ΣΩΣΤΑ
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
      return new Response("Unauthorized", { status: 401 });
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
        return new Response(`Error checking slug: ${slugError.message}`, {
          status: 500,
        });
      }
      if (!existing) break;

      fullSlug = `${baseSlug}-${lang}-${index}`;
      index++;
    }

    // Εδώ το ΜΟΝΑΔΙΚΟ σημείο που κάνω add/διορθώνω:
    // Αν δεν έχεις βάλει ήδη το cover_image, πρόσθεσέ το!
    const { error } = await admin.from("articles").insert([
      {
        user_id: user.id,
        title,
        slug: fullSlug,
        excerpt: excerpt || null,
        content,
        cover_image: cover_image || null,  // <-- ΕΔΩ Η ΔΙΟΡΘΩΣΗ
        lang,
        published: !!published,
        publish_date: publish_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Article saved successfully", { status: 200 });
  } catch (e) {
    console.error("Unhandled error in save-article:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
};