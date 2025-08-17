// src/lib/createServerClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Δημιουργεί server-side Supabase client με service role key.
 * Καλείται από createApiSupabase(supabaseUrl, serviceRoleKey, { cookies })
 */
export function createServerClient(
  url: string,
  serviceRoleKey: string,
  // Δεκτό για μελλοντική χρήση (π.χ. cookies), δεν το περνάμε στη supabase-js
  _opts?: unknown
): SupabaseClient {
  if (!url) throw new Error('Missing SUPABASE_URL')
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  // Στον server δεν θέλουμε persist session / auto refresh από τη βιβλιοθήκη
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
