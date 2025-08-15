// src/lib/createServerClientAstro.ts
import supabasePkg from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const { createClient } = supabasePkg;

export function createServerClient(cookies: AstroCookies | any) {
  // Προσπάθησε και από τα PUBLIC_ και από τα σκέτα, καθώς και από process.env (Netlify runtime)
  const supabaseUrl =
    (import.meta as any)?.env?.SUPABASE_URL ??
    (import.meta as any)?.env?.PUBLIC_SUPABASE_URL ??
    (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined) ??
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : undefined);

  const supabaseAnonKey =
    (import.meta as any)?.env?.SUPABASE_ANON_KEY ??
    (import.meta as any)?.env?.PUBLIC_SUPABASE_ANON_KEY ??
    (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined) ??
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_ANON_KEY : undefined);

  if (!supabaseUrl || !supabaseAnonKey) {
    // Κάνε fail fast με καθαρό μήνυμα (χωρίς να εκθέτεις secrets)
    throw new Error(
      'Missing Supabase URL or ANON KEY. Check Netlify env names: SUPABASE_URL / SUPABASE_ANON_KEY (or PUBLIC_ variants).'
    );
  }

  // Υποστήριξη AstroCookies ή iterable cookies
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  if (cookies && typeof cookies.get === 'function') {
    accessToken = cookies.get('sb-access-token')?.value ?? null;
    refreshToken = cookies.get('sb-refresh-token')?.value ?? null;
  } else if (cookies && typeof cookies[Symbol.iterator] === 'function') {
    for (const cookie of cookies) {
      if (cookie.name === 'sb-access-token') accessToken = cookie.value;
      if (cookie.name === 'sb-refresh-token') refreshToken = cookie.value;
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
  });
}
