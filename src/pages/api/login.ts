// src/pages/api/login.ts
import type { APIRoute } from 'astro';
// Αν το helper σου έχει άλλο όνομα/μονοπάτι, άλλαξέ το εδώ:
import { createServerAuthClient } from '@/lib/createServerAuthClient';

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Δέξου JSON ή form-data
    const ctype = request.headers.get('content-type') || '';
    let email = '';
    let password = '';
    let lang = 'en';

    if (ctype.includes('application/json')) {
      const body = await request.json().catch(() => ({} as any));
      email = (body.email ?? '').toString().trim();
      password = (body.password ?? '').toString();
      lang = (body.lang ?? 'en').toString();
    } else {
      const form = await request.formData();
      email = (form.get('email') ?? '').toString().trim();
      password = (form.get('password') ?? '').toString();
      lang = (form.get('lang') ?? 'en').toString();
    }

    if (!email || !password) {
      return json({ success: false, error: 'Missing email or password' }, 400);
    }

    // SSR Supabase client με cookies adapter
    const supabase = createServerAuthClient({ cookies });

    // Login με password (χρειάζεται anon key, ΟΧΙ service role)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Πέρνα το κανονικό μήνυμα προς τα έξω
      return json({ success: false, error: error.message }, 401);
    }

    // Τα auth cookies γράφτηκαν από τον adapter
    return json(
      {
        success: true,
        redirectTo: `/${lang}/admin/preview`,
        user: data?.user?.id ?? null,
      },
      200
    );
  } catch (e: any) {
    return json(
      { success: false, error: e?.message || 'Internal error' },
      500
    );
  }
};
