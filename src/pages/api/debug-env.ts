// src/pages/api/debug-env.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const publicUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  return new Response(
    JSON.stringify({
      PUBLIC_SUPABASE_URL: publicUrl?.slice(0, 20) + '...'
        || '❌ NOT FOUND',
      PUBLIC_SUPABASE_ANON_KEY: anonKey?.slice(0, 20) + '...'
        || '❌ NOT FOUND',
      SUPABASE_SERVICE_ROLE_KEY: serviceKey?.slice(0, 20) + '...'
        || '❌ NOT FOUND',
      serviceKeyLength: serviceKey?.length || '❌ Missing',
      loaded: typeof serviceKey,
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
