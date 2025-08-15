// src/lib/createApiSupabase.ts
import { createServerClient } from '@/lib/createServerClient';
import type { APIRoute } from 'astro';

export function createApiSupabase({ cookies }: APIRoute['context']) {
  const supabaseUrl =
    (import.meta as any)?.env?.SUPABASE_URL ??
    (import.meta as any)?.env?.PUBLIC_SUPABASE_URL ??
    (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined) ??
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : undefined);

  const serviceRoleKey =
    (import.meta as any)?.env?.SUPABASE_SERVICE_ROLE_KEY ??
    (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll: () => Object.fromEntries(cookies.getAll().map(c => [c.name, c.value])),
      setAll: (newCookies) => {
        newCookies.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            path: '/',
            sameSite: 'lax',
            httpOnly: import.meta.env.PROD,
            secure: import.meta.env.PROD,
            // ΧΩΡΙΣ domain → ισχύει για το τρέχον host (π.χ. hitsnap.app)
            ...options,
          });
        });
      },
    },
  });
}
