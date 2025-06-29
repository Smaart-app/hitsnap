import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function createBrowserClient() {
  if (!supabase) {
    supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return supabase;
}