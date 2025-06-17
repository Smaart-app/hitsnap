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

  // 👉 Φέρνουμε πρώτα το άρθρο
  const { data: article, error: fetchError } = await admin
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !article) {
    return new Response("❌ Δεν βρέθηκε άρθρο", { status: 404 });
  }

  // 🔒 Επίτρεψε update μόνο αν είσαι ο δημιουργός
  if (article.user_id !== user.id) {
    return new Response("🚫 Δεν έχεις δικαίωμα επεξεργασίας αυτού του άρθρου", {
      status: 403,
    });
  }

  // 🧠 Δημιουργία slug ΜΟΝΟ αν άλλαξε ο τίτλος
  const baseSlug = generateSlug(title);
  let fullSlug = `${baseSlug}-${lang}`;
  let index = 1;

  while (true) {
    const { data: existing } = await admin
      .from("articles")
      .select("id")
      .eq("slug", fullSlug)
      .neq("id", id)
      .maybeSingle();

    if (!existing) break;
    fullSlug = `${baseSlug}-${lang}-${index}`;
    index++;
  }

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
    return new Response(updateError.message, { status: 500 });
  }

  return new Response("✅ Το άρθρο ενημερώθηκε");
};