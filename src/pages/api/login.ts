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
            httpOnly: true, // ✅ Τώρα ο server θα βλέπει το session
            secure: true,
            sameSite: 'Lax',
            ...options,
          }),
        remove: (name, options) =>
          cookies.delete(name, { path: '/', ...options }),
      },
    }
  );

  const { email, password } = await request.json();

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

  // ✅ Redirect ώστε ο Layout.astro να πιάσει το session
  return redirect('/el/admin/preview');
};