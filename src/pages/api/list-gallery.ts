// src/pages/api/list-gallery.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isFsMode } from '@/lib/isFsMode';
import fs from 'node:fs';
import path from 'node:path';

export const GET: APIRoute = async () => {
  try {
    // =========================
    // FS MODE (No-Backend Mode)
    // =========================
    if (isFsMode()) {
      const DIR = path.join(process.cwd(), 'public', 'assets', 'images');

      let files: string[] = [];
      try {
        files = fs
          .readdirSync(DIR)
          .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));
      } catch {
        files = [];
      }

      // Ταξινόμηση κατά ημερομηνία τροποποίησης (νεότερα πρώτα)
      const items = files
        .map((name) => {
          const p = path.join(DIR, name);
          let size: number | null = null;
          let mtime = 0;
          try {
            const st = fs.statSync(p);
            size = st.size;
            mtime = st.mtimeMs;
          } catch {}
          return {
            name,
            path: name, // στο FS δεν υπάρχουν “φάκελοι χρηστών”
            url: `/assets/images/${name}`,
            size,
            mtime,
          };
        })
        .sort((a, b) => b.mtime - a.mtime)
        .map(({ mtime, ...rest }) => rest); // μην εκθέτουμε το mtime προς τα έξω

      return new Response(JSON.stringify({ items }), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // =========================
    // REAL MODE (Supabase path)
    // =========================
    const url =
      import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const key =
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase env' }),
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const BUCKET = 'gallery';

    // 1) Δες τι υπάρχει στο root
    const root = await supabase.storage
      .from(BUCKET)
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if ((root as any).error)
      return new Response(JSON.stringify({ error: (root as any).error.message }), { status: 500 });

    // Αν υπάρχουν φάκελοι, πάμε στον πιο πρόσφατο
    const folders = (root.data || []).filter((x: any) => x.id === null);
    let prefix = '';
    if (folders.length) prefix = folders[0].name;

    // 2) Πάρε τα αρχεία (είτε root είτε μέσα στον φάκελο)
    const filesRes = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if ((filesRes as any).error)
      return new Response(JSON.stringify({ error: (filesRes as any).error.message }), { status: 500 });

    const items = (filesRes.data || [])
      .filter((x: any) => x.id) // μόνο αρχεία
      .map((x: any) => {
        const p = prefix ? `${prefix}/${x.name}` : x.name;
        return {
          name: x.name,
          path: p,
          url: `${url}/storage/v1/object/public/${BUCKET}/${p}`,
          size: x.metadata?.size ?? null,
        };
      });

    return new Response(JSON.stringify({ items }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } }
    );
  }
};
