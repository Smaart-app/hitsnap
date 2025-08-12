import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async () => {
  const url = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const BUCKET = 'gallery';

  // 1) Δες τι υπάρχει στο root
  const root = await supabase.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  if (root.error) return new Response(JSON.stringify({ error: root.error.message }), { status: 500 });

  // Αν υπάρχουν φάκελοι, πάμε στον πιο πρόσφατο
  const folders = (root.data || []).filter((x: any) => x.id === null); // supabase: folders => id === null
  let prefix = '';
  if (folders.length) {
    prefix = folders[0].name; // πρώτος/νεότερος φάκελος
  }

  // 2) Πάρε τα αρχεία (είτε root είτε μέσα στον φάκελο)
  const filesRes = await supabase.storage.from(BUCKET).list(prefix, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  if (filesRes.error) return new Response(JSON.stringify({ error: filesRes.error.message }), { status: 500 });

  const items = (filesRes.data || [])
    .filter((x: any) => x.id) // μόνο αρχεία
    .map((x: any) => {
      const path = prefix ? `${prefix}/${x.name}` : x.name;
      return {
        name: x.name,
        path,
        url: `${url}/storage/v1/object/public/${BUCKET}/${path}`,
        size: x.metadata?.size ?? null,
      };
    });

  return new Response(JSON.stringify({ items }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
};
