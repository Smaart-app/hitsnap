import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  const url = process.env.PUBLIC_SUPABASE_URL
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error('⛔ Missing PUBLIC_SUPABASE_URL')
  if (!anonKey) throw new Error('⛔ Missing PUBLIC_SUPABASE_ANON_KEY')

  return createClient(url, anonKey)
}
