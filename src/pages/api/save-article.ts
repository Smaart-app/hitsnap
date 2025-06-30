import type { APIRoute } from "astro";
import { createAdminClientNoCookies } from "../../lib/createAdminClientNoCookies.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Debug
  console.log('[SAVE-ARTICLE] Content-Type:', request.headers.get('content-type'));
  try {
    let raw;
    try {
      if (request.clone) {
        const clone = request.clone();
        raw = await clone.text();
      } else {
        raw = await request.text();
      }
      console.log('[SAVE-ARTICLE] RAW BODY:', raw);
    } catch (e) {
      console.log('[SAVE-ARTICLE] Body read error:', e);
    }

    let data: any = {};
    let isJson = false;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = JSON.parse(raw);
      isJson = true;
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

    // DEBUG
    console.log('[SAVE-ARTICLE] PARSED DATA:', data);

    const {
      slug = '',
      title = '',
      excerpt = '',
      content = '',
      cover_image = '',
      lang = '',
      published = false,
      publish_date = new Date().toISOString(),
      user_id = '', // ΝΕΟ - Θέλεις αυτό το πεδίο!
    } = data;

    if (!user_id) {
      return new Response(
        JSON.stringify({ article: null, error: "Λείπει το user_id! Δεν μπορεί να αποθηκευτεί το άρθρο." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const admin = createAdminClientNoCookies();

    // Check if slug already exists (χωρίς -el/-en)
    const { data: existing, error: slugError } = await admin
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugError) {
      return new Response(
        JSON.stringify({ article: null, error: `Error checking slug: ${slugError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (existing) {
      return new Response(
        JSON.stringify({ article: null, error: "Υπάρχει ήδη άρθρο με αυτό το slug!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { error } = await admin.from("articles").insert([
      {
        title,
        slug: slug.trim(),
        excerpt: excerpt || null,
        content,
        cover_image: cover_image || null,
        lang,
        published: !!published,
        publish_date: publish_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_id, // ΝΕΟ - Καταγραφή user_id
      },
    ]);

    if (error) {
      console.error('[SAVE-ARTICLE] DB error:', error);
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
    console.error("[SAVE-ARTICLE] Unhandled error in save-article:", e);
    return new Response(
      JSON.stringify({ article: null, error: e?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};