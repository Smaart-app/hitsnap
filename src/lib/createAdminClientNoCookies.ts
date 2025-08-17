// src/lib/createAdminClientNoCookies.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only admin client (service role). Δεν κάνει persist sessions.
 */
export function createAdminClientNoCookies(): SupabaseClient {
  const url = import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Missing SUPABASE_URL (or PUBLIC_SUPABASE_URL)');
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
