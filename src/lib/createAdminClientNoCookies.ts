// src/lib/createAdminClientNoCookies.ts
import { createServerClient } from '@/lib/createServerClient'

export function createAdminClientNoCookies() {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
