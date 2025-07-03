import type { APIRoute } from "astro";
import { createAdminClientNoCookies } from "../../lib/createAdminClientNoCookies.ts";

export const prerender = false;

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
      translation_of = null, // <--- Εδώ θα μπαίνει το id του "πρωτογενούς" άρθρου (ελληνικού)
    } = data;

    // Βεβαιώσου ότι έχει user_id
    if (!user_id) {
      return new Response(
        JSON.stringify({ article: null, error: "Λείπει το user_id! Δεν μπορεί να αποθηκευτεί το άρθρο." }),
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
      user_id,
      translation_of: translation_of || null // <--- Εδώ μπαίνει το id του ελληνικού άρθρου (αν υπάρχει)
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
