import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // 🔐 Χειροκίνητη φόρτωση .env για server route

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), { status: 415 });
  }

  let data;
  try {
    data = await request.json();
  } catch (err) {
    console.error('❌ Invalid JSON:', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { name, email, message } = data;

  if (!email || !message) {
    console.warn('⚠️ Missing fields:', { email, message });
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  try {
    const { data: result, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message }]);

    if (error) {
      console.error('🔥 Supabase insert error:', error.message);
      throw error;
    }

    console.log('✅ Supabase insert success:', result);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Supabase insert failed' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
