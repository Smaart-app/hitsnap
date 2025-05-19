/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  // μπορείς να προσθέσεις κι άλλες εδώ αν χρειαστεί
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
