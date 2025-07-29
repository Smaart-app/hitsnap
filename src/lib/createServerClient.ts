// src/lib/createServerClientAstro.ts
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createServerClientAstro(cookies: AstroCookies) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables:');
    console.error('PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    throw new Error('Missing required Supabase environment variables');
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        get(name) {
          const cookie = cookies.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          cookies.set(name, value, {
            ...options,
            httpOnly: import.meta.env.PROD,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            path: '/',
            ...(import.meta.env.PROD ? { domain: 'hitsnap.com' } : {}),
          });
        },
        remove(name, options) {
          cookies.delete(name, {
            ...options,
            path: '/',
            ...(import.meta.env.PROD ? { domain: 'hitsnap.com' } : {}),
          });
        },
      },
    }
  );
}
