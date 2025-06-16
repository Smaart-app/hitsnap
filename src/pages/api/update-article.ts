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
    id,
    slug,
    title,
    content,
    excerpt,
    lang,
    published,
    publish_date,
    cover_image,
    translation_of,
  } = body;

  if (!id || !slug || !lang || !title || !content) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // Check ownership before update
  const { data: existing, error: fetchError } = await supabase
    .from('articles')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  if (!existing || existing.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Not authorized to edit this article' }), { status: 403 });
  }

  const publish_datetime = publish_date ? new Date(publish_date) : null;

  const { error: updateError } = await supabase
    .from('articles')
    .update({
      slug,
      title,
      content,
      excerpt,
      lang,
      published,
      publish_date: publish_datetime,
      cover_image,
      translation_of,
    })
    .eq('id', id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Article updated',
      article: { slug, lang },
    }),
    { status: 200 }
  );
};
