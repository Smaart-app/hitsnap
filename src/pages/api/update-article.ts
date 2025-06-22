import type { APIRoute } from "astro";
import { createServerClientWithCookies } from "../../lib/createServerClient.ts";
import { createAdminClientNoCookies } from "../../lib/createAdminClientNoCookies.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    console.log("BODY RECEIVED AT UPDATE:", body);
    console.log("UPDATE id που πήρα:", body.id);

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

    if (!id) {
      console.error("NO ARTICLE ID SENT!");
      return new Response(
        JSON.stringify({ article: null, error: "Missing article ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fix id (cast to string and trim in case of invisible chars)
    const cleanId = String(id).trim();

    // Δες αν υπάρχει το άρθρο πριν προσπαθήσεις update (με .in αντί για .eq)
    const admin = createAdminClientNoCookies();
    const { data: found, error: findError } = await admin
      .from("articles")
      .select("id")
      .in("id", [cleanId]);
    console.log("Βρήκα άρθρο πριν το update:", found, "Error:", findError);

    // Έλεγχος χρήστη
    const supabase = createServerClientWithCookies(cookies);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated.");
      return new Response(
        JSON.stringify({ article: null, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ενημέρωση άρθρου στη βάση (πάλι .in αντί για .eq)
    const { error, data } = await admin
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
      .in("id", [cleanId])
      .select();

    console.log("SUPABASE UPDATE RESULT:", { error, data });

    if (error) {
      return new Response(
        JSON.stringify({ article: null, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ article: null, error: "No article updated (wrong ID?)" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Επιστροφή του ενημερωμένου άρθρου (μόνο βασικά αν δεν θέλεις όλο)
    const updated = data[0];
    return new Response(
      JSON.stringify({
        article: { id: updated.id, slug: updated.slug, lang: updated.lang },
        error: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Unhandled error in update-article:", e);
    return new Response(
      JSON.stringify({ article: null, error: e?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};