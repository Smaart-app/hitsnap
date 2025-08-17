// src/lib/createApiSupabase.ts
import { createServerClient } from '@/lib/createServerClient';
import type { APIRoute } from 'astro';

export function createApiSupabase({ cookies }: APIRoute['context']) {
  const supabaseUrl =
    import.meta.env.SUPABASE_URL ??
    import.meta.env.PUBLIC_SUPABASE_URL;

  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL (or PUBLIC_SUPABASE_URL).');
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.');

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll: () => Object.fromEntries(cookies.getAll().map(c => [c.name, c.value])),
      setAll: (newCookies) => {
        for (const { name, value, options } of newCookies) {
          cookies.set(name, value, {
            path: '/',
            sameSite: 'lax',
            httpOnly: import.meta.env.PROD,
            secure: import.meta.env.PROD,
            ...options,
          });
        }
      },
    },
  });
}
