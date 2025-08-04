// src/lib/createServerClient.ts
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  const url = process.env.PUBLIC_SUPABASE_URL
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables:')
    console.error('PUBLIC_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing')
    console.error('PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✅ Set' : '❌ Missing')
    throw new Error('Missing required Supabase environment variables')
  }

  return createClient(url, anonKey)
}
