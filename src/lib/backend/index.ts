import { ArticleStore, AuthProvider, Mailer } from './types';
import { FSArticleStore, DemoAuth, NoopMailer } from './fsAdapter';

// Αν/όταν ξαναβάλεις Supabase, θα προσθέσουμε εδώ imports του supabaseAdapter:
// import { SupabaseArticleStore, SupabaseAuth, ResendMailer } from './supabaseAdapter';

type Backend = {
  articles: ArticleStore;
  auth: AuthProvider;
  mailer: Mailer;
};

export function getBackend(): Backend {
  // Προτιμά PUBLIC_ για χρήση σε client-safe περιβάλλοντα αν ποτέ χρειαστεί.
  const backend =
    (import.meta as any).env?.PUBLIC_BACKEND ??
    process.env.PUBLIC_BACKEND ??
    'fs';

  switch (backend) {
    case 'fs':
      return {
        articles: new FSArticleStore(),
        auth: new DemoAuth(),
        mailer: new NoopMailer(),
      };
    // case 'supabase':
    //   return {
    //     articles: new SupabaseArticleStore(),
    //     auth: new SupabaseAuth(),
    //     mailer: new ResendMailer(),
    //   };
    default:
      throw new Error(`Unknown BACKEND: ${backend}`);
  }
}
