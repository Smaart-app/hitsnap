export const prerender = false;

import type { APIRoute } from 'astro';
import { createServerClientReadOnly } from '../../lib/createServerClient';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return new Response(JSON.stringify({ error: 'Missing request body' }), {
        status: 400,
      });
    }

    const { email, password } = JSON.parse(bodyText);

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), {
        status: 400,
      });
    }

    const supabase = createServerClientReadOnly(cookies);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return new Response(JSON.stringify({ error: error?.message || 'Login failed' }), {
        status: 401,
      });
    }

    return new Response(null, {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request format' }), {
      status: 400,
    });
  }
};
