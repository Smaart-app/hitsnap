import type { APIRoute } from 'astro';
import { serialize } from 'cookie';

export const GET: APIRoute = async () => {
  const headers = new Headers();

  headers.append('Set-Cookie', serialize('sb-access-token', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
    sameSite: 'lax',
  }));

  headers.append('Set-Cookie', serialize('sb-refresh-token', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
    sameSite: 'lax',
  }));

  headers.append('Location', '/login');

  return new Response(null, {
    status: 302,
    headers,
  });
};