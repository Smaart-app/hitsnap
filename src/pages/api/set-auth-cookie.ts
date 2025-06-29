import type { APIRoute } from 'astro';
import { serialize } from 'cookie';

export const POST: APIRoute = async ({ request }) => {
  const { access_token /*, refresh_token*/ } = await request.json();

  const headers = new Headers();
  headers.append('Set-Cookie', serialize('sb-access-token', access_token, {
    httpOnly: false, // ΜΟΝΟ για debug να το δούμε στον browser!
    path: '/',
    sameSite: 'Lax',
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
  }));

  // ΤΟ refresh_token το αφαιρούμε προσωρινά για να δούμε αν δουλεύει το απλό!
  // headers.append('Set-Cookie', serialize('sb-refresh-token', refresh_token, {
  //   httpOnly: true,
  //   path: '/',
  //   sameSite: 'Lax',
  //   secure: false,
  //   maxAge: 60 * 60 * 24 * 7,
  // }));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
};