import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/createSupabaseClient';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const lang = formData.get('lang')?.toString() ?? 'el';

  if (!email || !password) {
    return new Response(
      JSON.stringify({ success: false, error: 'Email και κωδικός είναι υποχρεωτικά.' }),
      { status: 400 }
    );
  }

  const supabase = createSupabaseClient();

  const siteURL = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const redirectTo = `${siteURL}/${lang}/login`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 401 }
    );
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
