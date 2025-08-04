// src/lib/createApiSupabase.ts
import { createServerClient } from '@/lib/createServerClient'
import type { APIRoute } from 'astro'

export function createApiSupabase({ cookies }: APIRoute['context']) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll: () => {
          const cookieList = cookies.getAll()
          return Object.fromEntries(cookieList.map(c => [c.name, c.value]))
        },
        setAll: (newCookies) => {
          newCookies.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              path: '/',
              sameSite: 'lax',
              httpOnly: import.meta.env.PROD,
              secure: import.meta.env.PROD,
              ...(import.meta.env.PROD ? { domain: 'hitsnap.com' } : {}),
              ...options,
            })
          })
        },
      },
    }
  )
}
