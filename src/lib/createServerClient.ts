import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createServerClientReadOnly(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookies.get(name)?.value;
        },
        // Δεν κάνουμε set/remove για να μην πετάει AstroError
        set() {},
        remove() {},
      },
    }
  );
}

export function createServerClientFull(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name) {
          return cookies.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
}

// 🔧 Αυτή είναι η συνάρτηση που σου έλειπε
export const createServerClientWithCookies = createServerClientFull;
