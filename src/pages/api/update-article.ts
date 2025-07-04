import type { APIRoute } from "astro";
import { createServerClientAstro } from "../../lib/createServerClient.ts";

export const prerender = false;

// Basic UUID v4 validation
function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    console.log("[UPDATE-ARTICLE] BODY RECEIVED:", body);

    const {
      id,
      title,
      excerpt,
      content,
      cover_image,
      lang,
      published,
      publish_date,
    } = body;

    // --- ΕΠΑΓΓΕΛΜΑΤΙΚΟΙ ΕΛΕΓΧΟΙ INPUTS ---
    if (!id || typeof id !== "string" || !isValidUUID(id.trim())) {
      console.error("[UPDATE-ARTICLE] No valid article ID sent!");
      return new Response(
        JSON.stringify({ article: null, error: "Missing or invalid article ID (UUID)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!lang || typeof lang !== "string" || lang.length < 2) {
      return new Response(
        JSON.stringify({ article: null, error: "Λείπει ή είναι λάθος το lang code!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Έλεγχος χρήστη (πρέπει να είναι authenticated)
    const supabase = createServerClientAstro(cookies);
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user || !user.id || !isValidUUID(user.id)) {
      console.error("[UPDATE-ARTICLE] User not authenticated or missing/invalid UUID.");
      return new Response(
        JSON.stringify({ article: null, error: "Unauthorized or invalid user" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ενημέρωση άρθρου στη βάση
    const { error, data } = await supabase
      .from("articles")
      .update({
        title,
        excerpt: excerpt || null,
        content,
        cover_image: cover_image || null,
        lang,
        published: !!published,
        publish_date: publish_date || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id.trim())
      .eq("user_id", user.id.trim()) // <-- update μόνο αν ανήκει στον χρήστη
      .select();

    console.log("[UPDATE-ARTICLE] SUPABASE UPDATE RESULT:", { error, data });

    if (error) {
      return new Response(
        JSON.stringify({ article: null, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ article: null, error: "No article updated (wrong ID or no permission?)" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Επιστροφή του ενημερωμένου άρθρου (μόνο βασικά)
    const updated = data[0];
    return new Response(
      JSON.stringify({
        article: { id: updated.id, slug: updated.slug, lang: updated.lang },
        error: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[UPDATE-ARTICLE] Unhandled error:", e);
    return new Response(
      JSON.stringify({ article: null, error: e?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
