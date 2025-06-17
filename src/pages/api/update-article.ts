import type { APIRoute } from "astro";
import { createServerClientWithCookies } from "../../lib/createServerClient.ts";

export const prerender = false;

// 🍃 Γεννήτρια slug από τίτλο
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerClientWithCookies(cookies);
  const body = await request.json();

  const {
    id,
    title,
    excerpt,
    content,
    cover_image,
    lang,
    published,
  } = body;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 🔧 Δημιουργία slug με γλώσσα
  const baseSlug = generateSlug(title);
  let fullSlug = `${baseSlug}-${lang}`;

  // 🔍 Έλεγχος για conflict (εξαιρώντας το ίδιο άρθρο)
  let index = 1;
  while (true) {
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", fullSlug)
      .eq("user_id", user.id)
      .neq("id", id)
      .maybeSingle();

    if (!existing) break;
    fullSlug = `${baseSlug}-${lang}-${index}`;
    index++;
  }

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug: fullSlug,
      excerpt,
      content,
      cover_image,
      lang,
      published,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response("OK");
};