import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const SRC_BUCKET = 'gallery';
const DEST_BUCKET = 'site_assets';
const DEST_KEY = 'hero/hero.jpg'; // πάντα αυτό – σταθερό URL

export const POST: APIRoute = async ({ request }) => {
  try {
    const { path } = await request.json();
    if (!path) return new Response(JSON.stringify({ error: 'Missing "path"' }), { status: 400 });

    const url = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 });

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // Κατεβάζουμε από gallery → ανεβάζουμε σε site_assets/hero/hero.jpg (overwrite)
    const dl = await supabase.storage.from(SRC_BUCKET).download(path);
    if (dl.error || !dl.data) return new Response(JSON.stringify({ error: dl.error?.message || 'Download failed' }), { status: 500 });

    const contentType = dl.data.type || 'image/jpeg';
    const up = await supabase.storage.from(DEST_BUCKET).upload(DEST_KEY, dl.data, {
      cacheControl: '3600', upsert: true, contentType
    });
    if (up.error) return new Response(JSON.stringify({ error: up.error.message }), { status: 500 });

    const publicUrl = `${url}/storage/v1/object/public/${DEST_BUCKET}/${DEST_KEY}`;
    return new Response(JSON.stringify({ ok: true, url: `${publicUrl}?v=${Date.now()}` }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed' }), { status: 500 });
  }
};
