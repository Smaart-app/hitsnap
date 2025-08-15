import supabasePkg from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const { createClient } = supabasePkg;

export function createServerClient(cookies: AstroCookies | any) {
  // Διαβάζουμε env από PUBLIC_ και non-PUBLIC και από process.env (Netlify)
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
    throw new Error('Missing Supabase URL or ANON KEY.');
  }

  // Διαβάζουμε τυχόν tokens από cookies
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

  // 🔑 ΜΗΝ ΣΤΕΛΝΕΙΣ Authorization όταν δεν έχεις access token
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers }, // άδειο object όταν δεν έχει token => δεν override-ρουμε τίποτα
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
