// src/pages/api/debug-env.ts
import type { APIRoute } from 'astro';

function b64urlToUtf8(b64url: string) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf8');
}

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

  const urlProjectRef = url ? url.replace(/^https?:\/\//, '').split('.')[0] : null;

  let keyProjectRef: string | null = null;
  let jwtRole: string | null = null;
  let decodeError: string | null = null;

  try {
    if (anon) {
      const parts = anon.split('.');
      if (parts.length >= 2) {
        const payloadJson = b64urlToUtf8(parts[1]);
        const payload = JSON.parse(payloadJson);
        const iss: string | undefined = payload?.iss;
        jwtRole = payload?.role ?? null;
        if (iss) {
          const m = iss.match(/^https?:\/\/([^.]+)\./);
          if (m) keyProjectRef = m[1];
        }
      }
    }
  } catch (e: any) {
    decodeError = String(e?.message || e);
  }

  const match = !!urlProjectRef && !!keyProjectRef && urlProjectRef === keyProjectRef;

  return new Response(
    JSON.stringify(
      {
        url_present: !!url,
        anon_present: !!anon,
        url_project_ref: urlProjectRef,
        key_project_ref: keyProjectRef,
        jwt_role: jwtRole,          // περιμένουμε "anon" εδώ
        match_url_and_key: match,   // πρέπει να είναι true
        anon_length: anon?.length ?? 0,
        anon_preview: anon ? anon.slice(0, 6) + '…' + anon.slice(-6) : null,
        decode_error: decodeError,
        prod_flag: import.meta.env.PROD ?? null,
      },
      null,
      2
    ),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
