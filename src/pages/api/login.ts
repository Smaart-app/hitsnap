// src/pages/api/login.ts
import type { APIRoute } from 'astro';
import { createServerAuthClient } from '@/lib/createServerAuthClient';
import { isFsMode } from '@/lib/isFsMode';

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
      const body = (await request.json().catch(() => ({}))) as any;
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

    // =========================
    // FS MODE (No-Backend Mode)
    // =========================
    if (isFsMode()) {
      // Θέλουμε το header/Upload να σε "βλέπει": βάζουμε demo cookie ορατό από JS
      cookies.set('fs-auth', '1', {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,             // να το βλέπει και ο browser (UserStatusWrapper)
        secure: import.meta.env.PROD,
        maxAge: 60 * 60 * 24 * 7,    // 7 μέρες
      });

      return json(
        {
          success: true,
          redirectTo: `/${lang}/admin/preview`,
          user: 'demo-user',
          mode: 'fs',
        },
        200
      );
    }

    // =========================
    // REAL MODE (Supabase)
    // =========================
    const supabase = createServerAuthClient({ cookies } as any);

    // Login με password (χρειάζεται anon key)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return json({ success: false, error: error.message }, 401);
    }

    // Τα auth cookies γράφτηκαν από τον adapter
    return json(
      {
        success: true,
        redirectTo: `/${lang}/admin/preview`,
        user: data?.user?.id ?? null,
        mode: 'supabase',
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
