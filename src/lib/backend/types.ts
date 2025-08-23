export type Article = {
  id: string;            // ίδιο με slug
  slug: string;
  title: string;
  language: 'el' | 'en' | 'nl' | string; // ευέλικτο
  excerpt?: string;
  coverImage?: string;   // /article-images/slug.png
  body: string;          // markdown
  publishDate: string;   // ISO
  status: 'draft' | 'published' | 'scheduled';
  tags?: string[];
};

export interface ArticleStore {
  list(params?: { language?: string; includeDrafts?: boolean; now?: Date }): Promise<Article[]>;
  // get με προαιρετική γλώσσα: αν δοθεί language -> ίδια γλώσσα, αλλιώς "ό,τι βρεθεί"
  get(slug: string, language?: string): Promise<Article | null>;
  upsert(article: Article): Promise<Article>;
  // delete συγκεκριμένης γλώσσας, ή όλες αν δεν δοθεί
  delete(slug: string, language?: string): Promise<void>;
  // λίστα διαθέσιμων γλωσσών για ένα slug
  listLanguages(slug: string): Promise<string[]>;
}

export interface AuthProvider {
  getSession(): Promise<{ userId: string | null }>;
}

export interface Mailer {
  send(props: { to: string; subject: string; text: string; html?: string }): Promise<void>;
}
