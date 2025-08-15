// src/pages/api/debug-env.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const url =
    (import.meta as any)?.env?.SUPABASE_URL ??
    (import.meta as any)?.env?.PUBLIC_SUPABASE_URL ??
    (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined) ??
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : undefined);

  const anon =
    (import.meta as any)?.env?.SUPABASE_ANON_KEY ??
    (import.meta as any)?.env?.PUBLIC_SUPABASE_ANON_KEY ??
    (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined) ??
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_ANON_KEY : undefined);

  const mask = (v?: string) => (v ? v.slice(0, 6) + '…' + v.slice(-6) : null);
  const refFromUrl = (u?: string) =>
    u ? u.replace(/^https?:\/\//, '').split('.')[0] /* project ref */ : null;

  return new Response(
    JSON.stringify(
      {
        url_present: !!url,
        anon_present: !!anon,
        project_ref: refFromUrl(url), // πρέπει να ταιριάζει με το ref του project στο Supabase
        anon_length: anon?.length ?? 0,
        anon_preview: mask(anon),
        prod_flag: import.meta.env.PROD ?? null,
      },
      null,
      2
    ),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
