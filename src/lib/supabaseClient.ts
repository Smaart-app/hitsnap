// src/lib/supabaseClient.ts
// Ενιαίος browser client για όλη την εφαρμογή.
// Χρησιμοποιεί ΜΟΝΟ public envs (browser-safe).

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.PUBLIC_SUPABASE_URL
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!url) {
  throw new Error('⛔ Missing PUBLIC_SUPABASE_URL (browser)')
}
if (!anonKey) {
  throw new Error('⛔ Missing PUBLIC_SUPABASE_ANON_KEY (browser)')
}

// Σταθερός singleton client για χρήση σε components/pages
export const supabase: SupabaseClient = createClient(url, anonKey)

// Προαιρετικό factory αν θες απομόνωση σε tests ή ειδικές ροές
export function createBrowserSupabaseClient(): SupabaseClient {
  return createClient(url, anonKey)
}
