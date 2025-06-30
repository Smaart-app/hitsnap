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
            secure: false, // false για local, true για prod με https
            sameSite: 'Lax',
            ...options,
          }),
        remove: (name, options) =>
          cookies.delete(name, { path: '/', ...options }),
      },
    }
  );

  // Παίρνει από POST form
  const form = await request.formData();
  const email = form.get('email') as string | null;
  const password = form.get('password') as string | null;
  const lang = form.get('lang') as string | null;

  // Προσοχή: αν λείπουν πεδία, error!
  if (!email || !password || !lang) {
    return new Response(
      JSON.stringify({ error: 'Λείπουν στοιχεία login.' }),
      { status: 400 }
    );
  }

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

  // Τα cookies μπαίνουν αυτόματα από τον Supabase client!
  // Κάνε redirect μετά το login
  return redirect(`/${lang}/admin/preview`);
};