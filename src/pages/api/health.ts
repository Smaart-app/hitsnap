import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const env = import.meta.env;

  const publicUrl = env.PUBLIC_SUPABASE_URL || null;
  const serverUrl = env.SUPABASE_URL || null; // για server-only routes, αν υπάρχει
  const chosen = publicUrl || serverUrl || null;

  const getRef = (url: string | null) =>
    url ? url.replace(/^https?:\/\//, '').split('.')[0] : null;

  const info = {
    app: env.PUBLIC_APP_NAME || null,
    siteUrl: env.PUBLIC_SITE_URL || null,
    supabaseUrl: chosen,
    used: publicUrl ? 'PUBLIC_SUPABASE_URL' : (serverUrl ? 'SUPABASE_URL' : null),
    supabaseProjectRef: getRef(chosen),
    buildTimeUTC: new Date().toISOString(),
  };

  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
