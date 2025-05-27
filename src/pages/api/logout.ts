import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/login'
    }
  });
};