// src/lib/supabaseClient.ts
// Ενιαίος browser client για όλη την εφαρμογή.
// Σε FS mode δίνουμε mock client με cookie-based demo session.
// Εκτός FS mode χρησιμοποιούμε κανονικά το Supabase client.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isFsMode } from '@/lib/isFsMode';

const FS_AUTH_COOKIE = 'fs-auth';

// -------- helpers (cookies) ----------
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const hit = document.cookie
    .split(';')
    .map(s => s.trim())
    .find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=')[1]) : '';
}
function setCookie(name: string, value: string, maxAgeSec = 60 * 60 * 24 * 7) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAgeSec}`;
}
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0`;
}
function hasDemoSession(): boolean {
  return getCookie(FS_AUTH_COOKIE) === '1';
}

// -------- client ----------
let supabase: SupabaseClient;

if (isFsMode()) {
  // FS-MODE: mock client μόνο για UI/auth ροές στο browser.
  const demoUser = { id: 'demo-user' };

  const mock: any = {
    auth: {
      async getUser() {
        return { data: { user: hasDemoSession() ? demoUser : null }, error: null };
      },
      async getSession() {
        return { data: { session: hasDemoSession() ? { user: demoUser } : null }, error: null };
      },
      async signInWithPassword() {
        setCookie(FS_AUTH_COOKIE, '1');
        return { data: { user: demoUser }, error: null };
      },
      async signOut() {
        deleteCookie(FS_AUTH_COOKIE);
        return { error: null };
      },
    },
    from() {
      // Σε FS mode δεν υπάρχει DB. Ό,τι data θέλεις, τα παίρνεις από τον backend adapter.
      throw new Error('supabase.from(...) is not available in FS mode. Use backend adapter instead.');
    },
  };

  supabase = mock as SupabaseClient;
} else {
  // REAL MODE: κανονικός Supabase client
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error('⛔ Missing PUBLIC_SUPABASE_URL (browser)');
  if (!anonKey) throw new Error('⛔ Missing PUBLIC_SUPABASE_ANON_KEY (browser)');

  supabase = createClient(url, anonKey);
}

// Σταθερός singleton client για χρήση σε components/pages
export { supabase };

// Προαιρετικό factory αν θες απομόνωση σε tests ή ειδικές ροές
export function createBrowserSupabaseClient(): SupabaseClient {
  return supabase;
}
