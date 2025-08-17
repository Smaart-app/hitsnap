import type { APIRoute } from "astro";
export const prerender = false;

const fp = (s?: string) =>
  s ? `${s.slice(0,6)}...${s.slice(-6)} (len:${s.length})` : "(missing)";

function b64urlDecode(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  if (pad) s += "=".repeat(pad);
  return Buffer.from(s, "base64").toString("utf8");
}

function jwtIss(token?: string) {
  if (!token) return "(missing)";
  const parts = token.split(".");
  if (parts.length < 2) return "(parse-failed)";
  try {
    const payload = JSON.parse(b64urlDecode(parts[1]));
    return payload?.iss ?? "(no-iss)";
  } catch {
    return "(parse-failed)";
  }
}

function projectRefFromUrl(url?: string) {
  if (!url) return "(missing)";
  const m = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m ? m[1] : "(parse-failed)";
}

export const GET: APIRoute = async () => {
  const url =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL ?? "";

  const anon =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

  const iss = jwtIss(anon);
  const ref = projectRefFromUrl(url);
  const match =
    iss && ref && typeof iss === "string"
      ? iss.includes(`${ref}.supabase.co`)
      : false;

  const data = {
    SUPABASE_URL: url || "(missing)",
    PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL ?? "(missing)",
    SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "(missing)",
    PUBLIC_SUPABASE_ANON_KEY_FP: fp(anon),
    ANON_ISS: iss,                // π.χ. "https://<project-ref>.supabase.co"
    PROJECT_REF: ref,             // π.χ. "<project-ref>"
    KEY_MATCHES_URL: !!match,     // ✅ αυτό θες να είναι true
    PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL ?? "(missing)",
  };

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
