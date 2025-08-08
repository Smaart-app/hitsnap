// /src/pages/api/gallery-upload.ts
import { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Μικρό, self-contained slugify για να μην εξαρτόμαστε από πακέτα
function slugifyLocal(input: string): string {
  return input
    .normalize('NFKD')                     // σπάει τόνους/διακριτικά
    .replace(/[\u0300-\u036f]/g, '')       // αφαιρεί τόνους
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')           // ό,τι δεν είναι a-z0-9 -> "-"
    .replace(/^-+|-+$/g, '')               // trim στα άκρα
    .slice(0, 80);                         // όριο μήκους (προαιρετικό)
}

const url = import.meta.env.PUBLIC_SUPABASE_URL!;
const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Απλό gate: απαιτείται session (βασιζόμαστε στο υπάρχον auth σου)
  const token = cookies.get('sb-access-token')?.value;
  const sb = createClient(url, token || '', {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });

  try {
    const { data: auth } = await sb.auth.getUser();
    if (!auth?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const lang = (form.get('lang') as string | null) || 'en';
  const title = (form.get('title') as string | null) || '';
  const caption = (form.get('caption') as string | null) || '';
  const album = (form.get('album') as string | null) || '';

  if (!file || file.size === 0) {
    return new Response(JSON.stringify({ error: 'No file' }), { status: 400 });
  }

  const baseNameFromFile = file.name.split('.').slice(0, -1).join('.') || 'photo';
  const base = slugifyLocal(title || baseNameFromFile) || 'photo';
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const key = `${lang}/${base}-${Date.now()}.${ext}`;

  // Upload στο storage (bucket: "gallery")
  const { error: upErr } = await supabase.storage.from('gallery').upload(
    key,
    await file.arrayBuffer(),
    { contentType: file.type || 'image/jpeg', upsert: false }
  );
  if (upErr) return new Response(JSON.stringify({ error: upErr.message }), { status: 500 });

  // Αποθήκευση metadata
  const { error: insErr, data: row } = await supabase
    .from('gallery_photos')
    .insert({ lang, title, caption, album, image_path: key })
    .select()
    .single();

  if (insErr) return new Response(JSON.stringify({ error: insErr.message }), { status: 500 });

  return new Response(JSON.stringify({ ok: true, photo: row }), { status: 200 });
};
