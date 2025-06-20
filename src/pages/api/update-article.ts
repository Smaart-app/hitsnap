import type { APIRoute } from "astro";
import { createServerClientWithCookies } from "../../lib/createServerClient.ts";
import { createAdminClientNoCookies } from "../../lib/createAdminClientNoCookies.ts";

export const prerender = false;

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
    const { id, title, excerpt, content, cover_image, lang, published } = body;

    const supabase = createServerClientWithCookies(cookies);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const admin = createAdminClientNoCookies();

    // Φέρνουμε το άρθρο
    const { data: article, error: fetchError } = await admin
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return new Response(`Error fetching article: ${fetchError.message}`, {
        status: 500,
      });
    }
    if (!article) {
      return new Response("Article not found", { status: 404 });
    }

    // Έλεγχος δικαιωμάτων
    if (article.user_id !== user.id) {
      return new Response("Forbidden: You cannot edit this article", {
        status: 403,
      });
    }

    // Δημιουργία μοναδικού slug αν άλλαξε ο τίτλος
    const baseSlug = generateSlug(title);
    let fullSlug = `${baseSlug}-${lang}`;
    let index = 1;

    while (true) {
      const { data: existing, error: slugError } = await admin
        .from("articles")
        .select("id")
        .eq("slug", fullSlug)
        .neq("id", id)
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

    // Ενημέρωση άρθρου
    const { error: updateError } = await admin
      .from("articles")
      .update({
        title,
        slug: fullSlug,
        excerpt,
        content,
        cover_image,
        lang,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return new Response(`Error updating article: ${updateError.message}`, {
        status: 500,
      });
    }

    return new Response("Article updated successfully", { status: 200 });
  } catch (e) {
    console.error("Unhandled error in update-article:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
};