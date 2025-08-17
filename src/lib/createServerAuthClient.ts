// src/lib/createServerAuthClient.ts
import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

type CookiePair = { name: string; value: string };

function parseCookieHeaderToArray(header: string | null | undefined): CookiePair[] {
  if (!header) return [];
  return header
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const i = part.indexOf('=');
      if (i === -1) return null;
      const name = part.slice(0, i).trim();
      const value = decodeURIComponent(part.slice(i + 1).trim());
      return { name, value };
    })
    .filter(Boolean) as CookiePair[];
}

function makeCookieAdapter(ctx: APIRoute['context']) {
  return {
    getAll: (): CookiePair[] => {
      const names = ['sb-access-token', 'sb-refresh-token'];
      const out: CookiePair[] = [];
      for (const n of names) {
        const v = ctx.cookies.get(n)?.value;
        if (v) out.push({ name: n, value: v });
      }
      const header = ctx.request?.headers?.get('cookie') ?? null;
      if (header) {
        const parsed = parseCookieHeaderToArray(header);
        for (const n of names) {
          if (!out.find((c) => c.name === n)) {
            const found = parsed.find((c) => c.name === n);
            if (found) out.push(found);
          }
        }
      }
      return out;
    },
    setAll: (newCookies: { name: string; value: string; options?: any }[]) => {
      for (const { name, value, options } of newCookies) {
        ctx.cookies.set(name, value, {
          path: '/',
          sameSite: 'lax',
          httpOnly: import.meta.env.PROD,
          secure: import.meta.env.PROD,
          ...options,
        });
      }
    },
  };
}

// Μικρο-έλεγχοι για να μη σκάμε σιωπηλά με λάθος URL/KEY
function assertEnv(url: string | undefined, anon: string | undefined) {
  if (!url) throw new Error('Missing SUPABASE_URL / PUBLIC_SUPABASE_URL');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co/i.test(url)) {
    throw new Error(`Suspicious SUPABASE_URL format: ${url}`);
  }
  if (!anon || anon.length < 20 || !anon.includes('.')) {
    // anon/service keys είναι JWT-like (έχουν τελείες και είναι μεγάλα)
    throw new Error('PUBLIC_SUPABASE_ANON_KEY looks invalid/empty');
  }
}

export function createServerAuthClient(ctx: APIRoute['context']): SupabaseClient {
  // Προτιμά server-only, fallback στο PUBLIC_
  const url =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const anon =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

  assertEnv(url, anon);

  return createServerClient(url!, anon!, {
    cookies: makeCookieAdapter(ctx),
  });
}
