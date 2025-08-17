// src/pages/api/debug-env.ts
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Επιστρέφει τις βασικές ENV μεταβλητές για debugging (μόνο server).
 * Μην το αφήνεις ανοιχτό σε production!
 */
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify(
      {
        SUPABASE_URL: import.meta.env.SUPABASE_URL ?? "(missing)",
        SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "(missing)",
        PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL ?? "(missing)",
        PUBLIC_SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? "set" : "(missing)",
        PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL ?? "(missing)",
      },
      null,
      2
    ),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
