import { createClient } from '@supabase/supabase-js';

export function createAdminClientNoCookies() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
