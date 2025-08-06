import type { APIRoute } from "astro";
import { createServerClient } from "../../lib/createServerClientAstro";

export const prerender = false;

// Basic UUID v4 validation
function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log("[UPDATE-ARTICLE] HEADERS:", request.headers);
    console.log("[UPDATE-ARTICLE] METHOD:", request.method);

    let body: any;
    try {
      body = await request.json();
    } catch (jsonErr) {
      console.error("[UPDATE-ARTICLE] Failed to parse JSON body!", jsonErr);
      return new Response(
        JSON.stringify({ article: null, error: "Σφάλμα ανάγνωσης δεδομένων (μήπως δεν στέλνεις JSON;)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!body || typeof body !== "object") {
      console.error("[UPDATE-ARTICLE] Empty or invalid body:", body);
      return new Response(
        JSON.stringify({ article: null, error: "Δεν ελήφθησαν δεδομένα για ενημέρωση." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[UPDATE-ARTICLE] BODY RECEIVED:", body);

    let {
      id,
      title,
      excerpt,
      content,
      cover_image,
      lang,
      published,
      publish_date,
    } = body;

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

    if (typeof published === "string") {
      published = published === "true";
    }
    published = !!published;

    const supabase = createServerClient(cookies);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.id || !isValidUUID(user.id)) {
      console.error("[UPDATE-ARTICLE] User not authenticated or missing/invalid UUID.");
      return new Response(
        JSON.stringify({ article: null, error: "Unauthorized or invalid user" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[UPDATE-ARTICLE] GOING TO UPDATE WITH:", {
      id: id.trim(), user_id: user.id.trim(), title, excerpt, content, cover_image, lang, published, publish_date
    });

    const { error, data } = await supabase
      .from("articles")
      .update({
        title,
        excerpt: excerpt || null,
        content,
        cover_image: cover_image || null,
        lang,
        published,
        publish_date: publish_date || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id.trim())
      .eq("user_id", user.id.trim())
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
