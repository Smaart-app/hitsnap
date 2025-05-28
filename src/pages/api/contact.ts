import { createServerClientFull } from '../../lib/createServerClient';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerClientFull(cookies);
  const data = await request.json();
  const { name, email, message } = data;

  if (!email || !message) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const { error } = await supabase
    .from('contacts')
    .insert([{ name, email, message }]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};