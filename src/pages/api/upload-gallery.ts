// /src/pages/api/gallery-upload.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

/** Small local slugify (no external deps) */
function slugifyLocal(input: string): string {
  return (input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const BUCKET = 'gallery';

// Server-side admin client (bυpasses RLS). ΜΗΝ διαρρεύσει στο client το SERVICE_ROLE.
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Απαιτούμε logged-in χρήστη (χρησιμοποιούμε το cookie του Supabase)
  const token = cookies.get('sb-access-token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized (no token)' }), { status: 401 });
  }
  const { data: authUser, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !authUser?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized (invalid token)' }), { status: 401 });
  }
  const user = authUser.user;

  // Διαβάζουμε multipart form
  const form = await request.formData();
  const file = form.get('file') as File | null;
  const title = (form.get('title') as string) || '';
  const caption = (form.get('caption') as string) || '';
  const album = (form.get('album') as string) || '';
  const lang = (form.get('lang') as string) || 'en';

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file' }), { status: 400 });
  }

  // Μοναδικό path για να ΜΗΝ χρειάζεται UPDATE policy (δεν κάνουμε upsert)
  const orig = (file.name || 'image').trim();
  const dot = orig.lastIndexOf('.');
  const ext = dot > -1 ? orig.slice(dot + 1).toLowerCase() : 'png';
  const base = slugifyLocal(dot > -1 ? orig.slice(0, dot) : orig);
  const path = `${user.id}/${Date.now()}-${base}.${ext}`;

  // Upload ΧΩΡΙΣ upsert
  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });

  if (upErr) {
    return new Response(JSON.stringify({ error: `Upload failed: ${upErr.message}` }), { status: 400 });
  }

  // Καταχώριση στον πίνακα (με service role)
  const image_path = path;
  const { error: dbErr } = await admin
    .from('gallery_photos')
    .insert({
      lang,
      title,
      caption,
      album,
      image_path,
      sort_order: 0,
      published: true,
      user_id: user.id,
    });

  if (dbErr) {
    // Προαιρετικά: καθάρισε το αρχείο αν αποτύχει το insert
    await admin.storage.from(BUCKET).remove([path]).catch(() => {});
    return new Response(JSON.stringify({ error: `DB insert failed: ${dbErr.message}` }), { status: 400 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  return new Response(JSON.stringify({ ok: true, path, publicUrl }), { status: 200 });
};
