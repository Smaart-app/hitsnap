// src/lib/createServerClientAstro.ts
import type { APIRoute } from 'astro';
import type { AstroCookies } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerAuthClient } from '@/lib/createServerAuthClient';

export function createServerClient(input: APIRoute['context'] | AstroCookies): SupabaseClient {
  const ctx =
    (input as any)?.cookies
      ? (input as APIRoute['context']) // δόθηκε ολόκληρο το context
      : ({ cookies: input } as unknown as APIRoute['context']); // δόθηκαν σκέτα cookies

  return createServerAuthClient(ctx);
}

export { createServerClient as createServerClientAstro };
