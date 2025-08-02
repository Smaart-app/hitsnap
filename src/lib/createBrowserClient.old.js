import { createBrowserClient } from '@supabase/ssr';

let supabase = null;

export function getBrowserClient() {
  if (!supabase) {
    supabase = createBrowserClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return supabase;
}
