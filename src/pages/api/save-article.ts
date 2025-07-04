import type { APIRoute } from "astro"; 
import { createAdminClientNoCookies } from "../../lib/createAdminClientNoCookies.ts";

export const prerender = false;

function isValidUUID(uuid: string) {
  // Basic UUID v4 validation (accepts all valid UUIDs)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    let raw;
    if (request.clone) {
      const clone = request.clone();
      raw = await clone.text();
    } else {
      raw = await request.text();
    }

    let data: any = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = JSON.parse(raw);
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        data[key] = value;
      }
    } else {
      throw new Error(`Unsupported Content-Type: ${contentType}`);
    }

    // Λήψη όλων των απαραίτητων πεδίων από το frontend
    const {
      slug = '',
      title = '',
      excerpt = '',
      content = '',
      cover_image = '',
      lang = '',
      published = false,
      publish_date = new Date().toISOString(),
      user_id = '',
      translation_of = null,
    } = data;

    // ----- ΕΠΑΓΓΕΛΜΑΤΙΚΟΣ ΕΛΕΓΧΟΣ user_id -----
    // ΜΗΝ ΔΕΧΕΣΑΙ ποτέ template string/undefined/null/""
    if (
      !user_id ||
      typeof user_id !== "string" ||
      user_id.includes("{") ||
      user_id.includes("}") ||
      user_id.trim() === "" ||
      user_id.trim().toLowerCase() === "undefined" ||
      user_id.trim().toLowerCase() === "null" ||
      !isValidUUID(user_id.trim())
    ) {
      return new Response(
        JSON.stringify({
          article: null,
          error: "Invalid or missing user_id (UUID)!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Επαγγελματικός έλεγχος lang
    if (!lang || typeof lang !== "string" || lang.length < 2) {
      return new Response(
        JSON.stringify({ article: null, error: "Λείπει ή είναι λάθος το lang code!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const admin = createAdminClientNoCookies();

    // ΕΛΕΓΧΟΣ αν υπάρχει ήδη άρθρο με ΙΔΙΟ slug ΚΑΙ ΙΔΙΑ γλώσσα
    const { data: existing, error: slugError } = await admin
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .eq("lang", lang)
      .maybeSingle();

    if (slugError) {
      return new Response(
        JSON.stringify({ article: null, error: `Error checking slug: ${slugError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (existing) {
      return new Response(
        JSON.stringify({ article: null, error: "Υπάρχει ήδη άρθρο με αυτό το slug και γλώσσα!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ΚΑΤΑΧΩΡΗΣΗ νέου άρθρου, με πλήρη υποστήριξη translation_of
    const { error } = await admin.from("articles").insert([{
      title,
      slug: slug.trim(),
      excerpt: excerpt || null,
      content,
      cover_image: cover_image || null,
      lang,
      published: !!published,
      publish_date: publish_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      user_id: user_id.trim(),
      translation_of: translation_of || null
    }]);

    if (error) {
      return new Response(
        JSON.stringify({ article: null, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ article: { slug, lang }, error: null }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ article: null, error: e?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
