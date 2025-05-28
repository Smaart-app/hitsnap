import type { APIRoute } from 'astro';
import { createServerClientReadOnly } from '../../lib/createServerClient';
import { serialize } from 'cookie';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  const supabase = createServerClientReadOnly(cookies);

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

  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    serialize('sb-access-token', session.access_token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 12, // 12 ώρες
      sameSite: 'lax',
    })
  );
  headers.append(
    'Set-Cookie',
    serialize('sb-refresh-token', session.refresh_token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 ημέρες
      sameSite: 'lax',
    })
  );
  headers.append('Content-Type', 'application/json');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
};