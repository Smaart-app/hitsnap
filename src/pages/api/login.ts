// src/pages/api/login.ts
import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/createServerClientAstro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerClient(cookies);

  const form = await request.formData();
  const email = form.get('email')?.toString() ?? '';
  const password = form.get('password')?.toString() ?? '';
  const lang = form.get('lang')?.toString() ?? 'en';

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Λείπουν στοιχεία.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Αν λείπει/λάθος το ANON KEY στο Netlify, εδώ γυρνάει "Invalid API key"
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return new Response(JSON.stringify({ error: error?.message || 'Αποτυχία σύνδεσης.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- Γράψε ΚΑΙ τα δύο cookies σωστά (όχι array σε plain object)
  const { access_token, refresh_token } = data.session;
  const headers = new Headers({ 'Content-Type': 'application/json' });

  // Netlify/HTTPS → καλό είναι να βάζουμε Secure
  const baseFlags = 'Path=/; HttpOnly; SameSite=Lax; Secure';

  headers.append('Set-Cookie', `sb-access-token=${access_token}; ${baseFlags}`);
  headers.append('Set-Cookie', `sb-refresh-token=${refresh_token}; ${baseFlags}`);

  const body = JSON.stringify({
    success: true,
    redirectTo: `/${lang}/admin/preview`,
  });

  return new Response(body, { status: 200, headers });
};
