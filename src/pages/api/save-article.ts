// src/pages/api/save-article.ts
import type { APIRoute } from 'astro';
import { getBackend } from '@/lib/backend';
import type { Article } from '@/lib/backend/types';

export const prerender = false;

async function parseBody(request: Request): Promise<Record<string, any>> {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) return await request.json();
  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const form = await request.formData();
    const data: Record<string, any> = {};
    for (const [k, v] of form.entries()) data[k] = v;
    return data;
  }
  throw new Error(`Unsupported Content-Type: ${contentType || '(none)'}`);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const backend = getBackend();
    const session = await backend.auth.getSession();
    if (!session.userId) {
      return new Response(JSON.stringify({ article: null, error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    let data: any;
    try {
      data = await parseBody(request);
    } catch (err: any) {
      return new Response(JSON.stringify({ article: null, error: err?.message || 'Unsupported Content-Type' }), {
        status: 415, headers: { 'Content-Type': 'application/json' },
      });
    }

    const {
      slug = '',
      title = '',
      excerpt = '',
      content = '',
      cover_image = '',
      lang = '',
      published = false,
      publish_date = new Date().toISOString(),
    } = data;

    if (!slug || typeof slug !== 'string') {
      return new Response(JSON.stringify({ article: null, error: 'Missing slug' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!lang || typeof lang !== 'string' || lang.trim().length < 2) {
      return new Response(JSON.stringify({ article: null, error: 'Λείπει ή είναι λάθος το lang code!' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ article: null, error: 'Missing title' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (typeof content !== 'string') {
      return new Response(JSON.stringify({ article: null, error: 'Missing content' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Μοναδικότητα ανά (slug, lang)
    const existing = await backend.articles.get(String(slug).trim(), String(lang).trim());
    if (existing) {
      return new Response(
        JSON.stringify({ article: null, error: 'Υπάρχει ήδη άρθρο με αυτό το slug και γλώσσα!' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const nowIso = new Date().toISOString();
    const publishIso = publish_date || nowIso;

    let status: Article['status'] = 'draft';
    if (published) {
      status = publishIso > nowIso ? 'scheduled' : 'published';
    }

    const article: Article = {
      id: String(slug).trim(),
      slug: String(slug).trim(),
      title: String(title || '').trim(),
      language: String(lang).trim(),
      excerpt: excerpt ? String(excerpt) : '',
      coverImage: cover_image ? String(cover_image) : '',
      body: String(content || ''),
      publishDate: publishIso,
      status,
      tags: [],
    };

    const saved = await backend.articles.upsert(article);
    return new Response(
      JSON.stringify({ article: { slug: saved.slug, lang: saved.language }, error: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e: any) {
    console.error('[save-article] error:', e);
    return new Response(
      JSON.stringify({ article: null, error: e?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
