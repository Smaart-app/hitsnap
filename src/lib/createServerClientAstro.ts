// src/lib/createServerClientAstro.ts
import supabasePkg from '@supabase/supabase-js'
import type { AstroCookies } from 'astro'

const { createClient } = supabasePkg

export function createServerClient(cookies: AstroCookies | any) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

  // Υποστήριξη AstroCookies ή iterable cookies
  let accessToken: string | null = null
  let refreshToken: string | null = null

  if (typeof cookies.get === 'function') {
    accessToken = cookies.get('sb-access-token')?.value ?? null
    refreshToken = cookies.get('sb-refresh-token')?.value ?? null
  } else if (typeof cookies[Symbol.iterator] === 'function') {
    for (const cookie of cookies) {
      if (cookie.name === 'sb-access-token') accessToken = cookie.value
      if (cookie.name === 'sb-refresh-token') refreshToken = cookie.value
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
