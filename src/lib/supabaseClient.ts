// supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// 🔍 Συνάρτηση για να φέρνουμε άρθρο βάσει slug (single object)
export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single(); // ✅ Επιστρέφει αντικείμενο, όχι array

  return { data, error };
}
