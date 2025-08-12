import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async () => {
  const url = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Response(JSON.stringify({ error: 'Missing Supabase env' }), { status: 500 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Προσαρμόζεις bucket & prefix αν χρειάζεται
  const BUCKET = 'gallery';
  const PREFIX = ''; // π.χ. 'albums/flowers'
  const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, {
    limit: 100, sortBy: { column: 'created_at', order: 'desc' }
  });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const items = (data || [])
    .filter(x => x.id) // μόνο αρχεία
    .map(x => {
      const path = PREFIX ? `${PREFIX}/${x.name}` : x.name;
      return {
        name: x.name,
        path,
        url: `${url}/storage/v1/object/public/${BUCKET}/${path}`,
        size: x.metadata?.size ?? null,
      };
    });

  return new Response(JSON.stringify({ items }), { headers: { 'content-type': 'application/json' } });
};
