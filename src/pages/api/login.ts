// src/pages/api/login.ts
import type { APIRoute } from 'astro';
import { createServerAuthClient } from '@/lib/createServerAuthClient';

export const prerender = false;

// — helpers —
function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function readCredentials(req: Request): Promise<{ email: string; password: string } | null> {
  const ct = (req.headers.get('content-type') || '').toLowerCase();

  // 1) application/json
  if (ct.includes('application/json')) {
    const data = await req.json().catch(() => null);
    if (!data) return null;
    return {
      email: typeof data.email === 'string' ? data.email.trim() : '',
      password: typeof data.password === 'string' ? data.password : '',
    };
  }

  // 2) form submissions (form-data ή x-www-form-urlencoded)
  if (ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData();
    return {
      email: String(form.get('email') ?? '').trim(),
      password: String(form.get('password') ?? ''),
    };
  }

  // 3) τίποτα από τα παραπάνω → δεν υποστηρίζεται
  return null;
}

// — routes —
export const GET: APIRoute = async (ctx) => {
  try {
    const supabase = createServerAuthClient(ctx);
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return json({ session: null, error: error.message }, 401);
    return json({ session, error: null }, 200);
  } catch (e: any) {
    return json({ session: null, error: e?.message || 'Internal error' }, 500);
  }
};

export const POST: APIRoute = async (ctx) => {
  try {
    const supabase = createServerAuthClient(ctx);

    const creds = await readCredentials(ctx.request);
    if (!creds) {
      // Δείξε καθαρό μήνυμα για να ξέρουμε τι έστειλε ο client
      return json({ user: null, error: 'Unsupported Media Type: send JSON or form-encoded body' }, 415);
    }

    const { email, password } = creds;
    if (!email || !password) {
      return json({ user: null, error: 'Missing email or password' }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return json({ user: null, error: error.message }, 401);

    // Τα auth cookies γράφτηκαν ήδη από τον adapter
    return json({ user: data.user, error: null }, 200);
  } catch (e: any) {
    return json({ user: null, error: e?.message || 'Internal error' }, 500);
  }
};

export const DELETE: APIRoute = async (ctx) => {
  try {
    const supabase = createServerAuthClient(ctx);
    const { error } = await supabase.auth.signOut();
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true, error: null }, 200);
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'Internal error' }, 500);
  }
};
