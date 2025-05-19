import { supabase } from '../lib/supabaseClient';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  published: boolean;
  cover_image?: string;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, content, created_at, published, cover_image')
    .eq('published', true)
    .order('created_at', { ascending: false });

  console.log("🧪 Supabase data:", data);
  console.log("⚠️ Supabase error:", error);

  if (error) {
    console.error('Error fetching articles:', error.message);
    return [];
  }

  return data ?? [];
}
