import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Αυτή είναι η function που χρησιμοποιείς παντού!
export function createServerClientAstro(cookies: AstroCookies) {
  // ΠΑΙΡΝΕΙ τα env variables ΣΩΣΤΑ!
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // ΕΛΕΓΧΟΣ αν έχεις τα σωστά κλειδιά
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:');
    console.error('PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    throw new Error('Missing required Supabase environment variables');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          const cookie = cookies.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          cookies.set(name, value, {
            ...options,
            httpOnly: false, // false για dev, true για prod αν θέλεις!
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            path: '/',
          });
        },
        remove(name, options) {
          cookies.delete(name, {
            ...options,
            path: '/',
          });
        },
      },
    }
  );
}
