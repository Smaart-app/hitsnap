import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const env = import.meta.env;
  const supa = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "";
  const projectRef = supa.replace(/^https?:\/\//, "").split(".")[0] || null;

  const info = {
    app: env.PUBLIC_APP_NAME || null,      // Βάλε στο Netlify: PUBLIC_APP_NAME=hitsnap ή hitlift
    siteUrl: env.PUBLIC_SITE_URL || null,
    supabaseUrl: supa || null,
    supabaseProjectRef: projectRef,        // <— αυτό θέλουμε να δούμε
    buildTimeUTC: new Date().toISOString(),
  };

  return new Response(JSON.stringify(info, null, 2), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
};
