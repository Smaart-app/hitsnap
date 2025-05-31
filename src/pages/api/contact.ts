import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
  const SUPABASE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });

  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), { status: 415 });
  }

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { name, email, message } = data;

  if (!email || !message) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  // Supabase insert μέσω SDK (παρακάμπτει RLS όταν έχεις service_role key)
  try {
    const { data: insertResult, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message }])
      .select();

    if (error) throw error;
    console.log('✅ Supabase SDK insert success:', insertResult);
  } catch (err: any) {
    console.error('🔥 Supabase SDK error:', err.message);
    return new Response(JSON.stringify({ error: 'Supabase insert failed' }), { status: 500 });
  }

  // EmailJS (όπως πριν)
  try {
    const emailPayload = {
      service_id: 'service_rmsqduf',
      template_id: 'template_ewoapex',
      user_id: 'Tfu4LjZEcoZIh-UtA',
      template_params: {
        rating: '5',
        message
      }
    };

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });

    const result = await emailRes.text();

    if (!emailRes.ok) {
      console.error('⚠️ EmailJS response error:', result);
      return new Response(JSON.stringify({ error: 'Email sending failed' }), { status: 502 });
    }

    console.log('✅ EmailJS success:', result);
  } catch (err) {
    console.error('❌ EmailJS exception:', err);
    return new Response(JSON.stringify({ error: 'Unexpected error while sending email' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
