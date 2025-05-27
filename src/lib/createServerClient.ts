import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createServerClientWithCookies(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
    { cookies } as any
  );
}