import type { APIRoute } from 'astro';
import { createServerClientWithCookies } from '../../lib/createServerClient';

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;

  const { email, password } = await request.json();

  const supabase = createServerClientWithCookies(cookies);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return new Response(
      JSON.stringify({ error: 'Wrong email or password' }),
      { status: 401 }
    );
  }

  const { session } = data;

  cookies.set('sb-access-token', session.access_token, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 12, // 12 ώρες
  });

  cookies.set('sb-refresh-token', session.refresh_token, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 ημέρες
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
