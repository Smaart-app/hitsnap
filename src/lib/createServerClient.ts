import { createServerClient as supabaseClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createServerClientWithCookies(cookies: AstroCookies) {
  return supabaseClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
}
