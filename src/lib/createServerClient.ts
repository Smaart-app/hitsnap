import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// 🌍 Φόρτωσε .env μόνο αν λείπει (π.χ. σε build ή dev crash)
if (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_ANON_KEY) {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
    console.log('✅ .env loaded from createServerClient.ts');
  } catch (err) {
    console.error('❌ Failed to load dotenv:', err);
  }
}

export function createServerClientReadOnly(cookies: AstroCookies) {
  return createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
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

export function createServerClientFull(cookies: AstroCookies) {
  return createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

export const createServerClientWithCookies = createServerClientFull;

export function createAdminClientNoCookies() {
  return createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    }
  );
}