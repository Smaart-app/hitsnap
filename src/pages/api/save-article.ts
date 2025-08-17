// src/pages/api/save-article.ts
import type { APIRoute } from 'astro';
import { createAdminClientNoCookies } from '@/lib/createAdminClientNoCookies';

export const prerender = false;

// UUID v1–v5
function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // ---- Parse body με ασφάλεια για 3 περιπτώσεις
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    let data: any = {};

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const form = await request.formData();
      for (const [k, v] of form.entries()) data[k] = v;
    } else {
      return new Response(
        JSON.stringify({ article: null, error: `Unsupported Content-Type: ${contentType || '(none)'}` }),
        { status: 415, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ---- Πεδία
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

    // ---- Έλεγχοι
    if (typeof slug !== 'string' || !slug.trim()) {
      return new Response(JSON.stringify({ article: null, error: 'Missing slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!lang || typeof lang !== 'string' || lang.trim().length < 2) {
      return new Response(JSON.stringify({ article: null, error: 'Λείπει ή είναι λάθος το lang code!' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (
      !user_id ||
      typeof user_id !== 'string' ||
      user_id.includes('{') ||
      user_id.includes('}') ||
      ['undefined', 'null', ''].includes(user_id.trim().toLowerCase()) ||
      !isValidUUID(user_id.trim())
    ) {
      return new Response(
        JSON.stringify({ article: null, error: 'Invalid or missing user_id (UUID)!' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ---- Supabase (admin)
    const admin = createAdminClientNoCookies();

    // Μοναδικότητα ανά (slug, lang)
    const { data: existing, error: slugError } = await admin
      .from('articles')
      .select('id')
      .eq('slug', slug.trim())
      .eq('lang', lang.trim())
      .maybeSingle();

    if (slugError) {
      return new Response(
        JSON.stringify({ article: null, error: `Error checking slug: ${slugError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (existing) {
      return new Response(
        JSON.stringify({ article: null, error: 'Υπάρχει ήδη άρθρο με αυτό το slug και γλώσσα!' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Εισαγωγή
    const { error } = await admin.from('articles').insert([
      {
        title: String(title || '').trim(),
        slug: String(slug).trim(),
        excerpt: excerpt ? String(excerpt) : null,
        content: String(content || ''),
        cover_image: cover_image ? String(cover_image) : null,
        lang: String(lang).trim(),
        published: !!published,
        publish_date: publish_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_id: user_id.trim(),
        translation_of: translation_of || null,
      },
    ]);

    if (error) {
      return new Response(JSON.stringify({ article: null, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ article: { slug: slug.trim(), lang: String(lang).trim() }, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ article: null, error: e?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
