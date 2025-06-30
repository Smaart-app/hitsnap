import type { APIRoute } from 'astro';
import { serialize } from 'cookie';

export const POST: APIRoute = async ({ request }) => {
  const { access_token, refresh_token } = await request.json();

  const headers = new Headers();

  // ΠΡΟΣΟΧΗ! Τα κάνουμε httpOnly: true για να τα "βλέπει" ο server.
  headers.append('Set-Cookie', serialize('sb-access-token', access_token, {
    httpOnly: true,      // <-- ΤΟ ΚΡΙΣΙΜΟ
    path: '/',
    sameSite: 'Lax',
    secure: false,       // σε production: true
    maxAge: 60 * 60 * 24 * 7,
  }));

  headers.append('Set-Cookie', serialize('sb-refresh-token', refresh_token, {
    httpOnly: true,      // <-- ΤΟ ΚΡΙΣΙΜΟ
    path: '/',
    sameSite: 'Lax',
    secure: false,       // σε production: true
    maxAge: 60 * 60 * 24 * 30,
  }));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
};