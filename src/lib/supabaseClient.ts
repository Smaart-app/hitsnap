import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('🗝️ PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase URL ή Anon Key λείπει από το .env. Βεβαιώσου ότι έχεις ορίσει PUBLIC_SUPABASE_URL και PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
