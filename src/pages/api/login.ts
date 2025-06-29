import type { APIRoute } from 'astro';  
import { createServerClient } from '@supabase/ssr';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) =>
          cookies.set(name, value, {
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            ...options,
          }),
        remove: (name, options) =>
          cookies.delete(name, { path: '/', ...options }),
      },
    }
  );

  // ΔΙΑΒΑΖΕΙ ΤΩΡΑ ΑΠΟ FORM DATA, ΟΧΙ JSON!
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  const lang = form.get('lang');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Login failed' }),
      { status: 401 }
    );
  }

  // Redirect στο σωστό locale dashboard
  return redirect(`/${lang}/admin/preview`);
};