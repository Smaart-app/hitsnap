// src/lib/createServerAuthClient.ts
// SSR Supabase client με @supabase/ssr, χωρίς δυναμικά import.meta.env.
// Ο adapter πλέον επιστρέφει ARRAY { name, value }[] όπως περιμένει η βιβλιοθήκη.

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
    // 🔧 Το @supabase/ssr περιμένει array { name, value }[]
    getAll: (): CookiePair[] => {
      const names = ['sb-access-token', 'sb-refresh-token'];
      const out: CookiePair[] = [];

      // 1) Δοκίμασε από Astro cookies API
      for (const n of names) {
        const v = ctx.cookies.get(n)?.value;
        if (v) out.push({ name: n, value: v });
      }

      // 2) Fallback από raw Cookie header (σε edge περιπτώσεις)
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

    // Η βιβλιοθήκη δίνει [{ name, value, options }, ...]
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

export function createServerAuthClient(ctx: APIRoute['context']): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error('Missing PUBLIC_SUPABASE_URL');
  if (!anon) throw new Error('Missing PUBLIC_SUPABASE_ANON_KEY');

  return createServerClient(url, anon, {
    cookies: makeCookieAdapter(ctx),
  });
}
