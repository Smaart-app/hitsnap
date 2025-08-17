// src/pages/api/check-supabase-key.ts
import type { APIRoute } from "astro";

const fp = (s?: string) =>
  s ? `${s.slice(0,6)}...${s.slice(-6)} (len:${s.length})` : "(missing)";

export const GET: APIRoute = async () => {
  const url =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const key =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY ?? "";

  if (!url || !key) {
    return new Response(
      JSON.stringify({ ok: false, reason: "missing url or anon key", url, key_fp: fp(key) }, null, 2),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Καλούμε ένα public endpoint του GoTrue για settings. 200 => valid key, 401 => invalid.
  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  const body = await res.text(); // απλά για debug
  return new Response(
    JSON.stringify(
      {
        ok: res.ok,
        status: res.status,
        url,
        anon_key_fp: fp(key),
        sample_of_body: body.slice(0, 200),
      },
      null,
      2
    ),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
