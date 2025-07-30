import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
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

  const form = await request.formData();
  const email = form.get('email') as string | null;
  const password = form.get('password') as string | null;
  const lang = form.get('lang') as string || 'el';

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Λείπουν στοιχεία.' }), {
      status: 400,
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Αποτυχία σύνδεσης.' }),
      { status: 401 }
    );
  }

  return new Response(
    JSON.stringify({ success: true, redirectTo: `/${lang}/admin/preview` }),
    { status: 200 }
  );
};
