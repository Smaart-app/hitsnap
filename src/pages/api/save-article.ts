import type { APIRoute, APIContext } from 'astro';
import { createServerClientWithCookies } from '../../lib/createServerClient';

export const POST: APIRoute = async (context: APIContext) => {
  const { request, cookies } = context;
  const supabase = createServerClientWithCookies(cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();

  const {
    slug,
    title,
    content,
    excerpt,
    lang,
    published,
    publish_date,
    cover_image,
    translation_of
  } = body;

  if (!slug || !lang || !title || !content) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const cleanedSlug = slug.trim(); // 💥 η κρίσιμη αλλαγή
  const publish_datetime = publish_date ? new Date(publish_date) : null;
  const now = new Date().toISOString();

  // Έλεγχος αν υπάρχει ήδη άρθρο με ίδιο slug/γλώσσα/χρήστη
  const { data: existing, error: fetchError } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', cleanedSlug)
    .eq('lang', lang)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  let result;

  if (existing) {
    const { error } = await supabase
      .from('articles')
      .update({
        title,
        content,
        excerpt,
        published,
        publish_date: publish_datetime,
        cover_image,
        translation_of,
        updated_at: now,
        user_id: user.id
      })
      .eq('id', existing.id);

    result = error
      ? { error: error.message }
      : { success: true, message: 'Article updated' };

  } else {
    const { error } = await supabase.from('articles').insert({
      slug: cleanedSlug,
      title,
      content,
      excerpt,
      lang,
      published,
      publish_date: publish_datetime,
      cover_image,
      translation_of,
      user_id: user.id,
      updated_at: now
    });

    result = error
      ? { error: error.message }
      : { success: true, message: 'Article created' };
  }

  return new Response(JSON.stringify(result), {
    status: result.error ? 500 : 200,
    headers: { 'Content-Type': 'application/json' }
  });
};