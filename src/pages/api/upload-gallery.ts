// src/pages/api/upload-gallery.ts
// (Αν το αρχείο σου λεγόταν gallery-upload.ts, μετονόμασέ το σε upload-gallery.ts
//  για να ταιριάζει με το action του form: /api/upload-gallery)

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { isFsMode } from '@/lib/isFsMode';

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

export const prerender = false;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // --- Parse multipart form
    const ct = (request.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('multipart/form-data')) {
      return json(415, { ok: false, error: 'Expected multipart/form-data' });
    }

    const form = await request.formData();
    const file = form.get('file') as unknown as File | null;
    const title = (form.get('title') as string) || '';
    const caption = (form.get('caption') as string) || '';
    const album = (form.get('album') as string) || '';
    const lang = (form.get('lang') as string) || 'en';

    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return json(400, { ok: false, error: 'No file' });
    }

    // =========================
    // FS MODE (No-Backend Mode)
    // =========================
    if (isFsMode()) {
      // Απαιτούμε demo login cookie
      const logged = cookies.get('fs-auth')?.value === '1';
      if (!logged) return json(401, { ok: false, error: 'Unauthorized' });

      const outDir = path.join(process.cwd(), 'public', 'assets', 'images');
      fs.mkdirSync(outDir, { recursive: true });

      const orig = ((file as any).name as string) || 'image';
      const ext = (path.extname(orig) || '.png').toLowerCase();
      const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
      if (!allowed.includes(ext)) {
        return json(400, { ok: false, error: `Unsupported file type: ${ext}` });
      }

      const base = slugifyLocal(path.basename(orig, ext)) || 'img';
      const filename = `${base}-${Date.now()}${ext}`;
      const buf = Buffer.from(await (file as any).arrayBuffer());
      fs.writeFileSync(path.join(outDir, filename), buf);

      const publicUrl = `/assets/images/${filename}`;
      return json(200, { ok: true, publicUrl, title, caption, album, lang });
    }

    // =========================
    // REAL MODE (Supabase path)
    // =========================
    const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
    const SERVICE_ROLE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
    const BUCKET = 'gallery';

    // Server-side admin client (bypasses RLS)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // Απαιτούμε logged-in χρήστη (με supabase cookie)
    const token = cookies.get('sb-access-token')?.value;
    if (!token) return json(401, { ok: false, error: 'Unauthorized (no token)' });

    const { data: authUser, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !authUser?.user) return json(401, { ok: false, error: 'Unauthorized (invalid token)' });

    const user = authUser.user;

    // Unique path για να μην χρειάζεται upsert
    const orig = ((file as any).name as string) || 'image';
    const dot = orig.lastIndexOf('.');
    const ext = (dot > -1 ? orig.slice(dot + 1) : 'png').toLowerCase();
    const base = slugifyLocal(dot > -1 ? orig.slice(0, dot) : orig) || 'img';
    const storagePath = `${user.id}/${Date.now()}-${base}.${ext}`;

    const arrayBuffer = await (file as any).arrayBuffer();
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: (file as any).type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });

    if (upErr) return json(400, { ok: false, error: `Upload failed: ${upErr.message}` });

    // Καταχώριση στον πίνακα (προαιρετικό – όπως το είχες)
    const { error: dbErr } = await admin.from('gallery_photos').insert({
      lang,
      title,
      caption,
      album,
      image_path: storagePath,
      sort_order: 0,
      published: true,
      user_id: user.id,
    });

    if (dbErr) {
      // καθάρισμα αρχείου αν αποτύχει το insert
      await admin.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      return json(400, { ok: false, error: `DB insert failed: ${dbErr.message}` });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    return json(200, { ok: true, path: storagePath, publicUrl, title, caption, album, lang });
  } catch (e: any) {
    console.error('[upload-gallery] error:', e);
    return json(500, { ok: false, error: e?.message || 'Internal Server Error' });
  }
};
