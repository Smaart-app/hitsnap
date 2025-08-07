// src/pages/api/login.ts 
import type { APIRoute } from 'astro'
import { createServerClient } from '@/lib/createServerClientAstro'

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerClient(cookies)

  const form = await request.formData()
  const email = form.get('email')?.toString() ?? ''
  const password = form.get('password')?.toString() ?? ''
  const lang = form.get('lang')?.toString() ?? 'el'

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Λείπουν στοιχεία.' }),
      { status: 400 }
    )
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Αποτυχία σύνδεσης.' }),
      { status: 401 }
    )
  }

  // ✅ Set auth cookies manually
  const { access_token, refresh_token } = data.session

  const responseBody = JSON.stringify({
    success: true,
    redirectTo: `/${lang}/admin/preview`,
  })

  return new Response(responseBody, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': [
        `sb-access-token=${access_token}; Path=/; HttpOnly; SameSite=Lax`,
        `sb-refresh-token=${refresh_token}; Path=/; HttpOnly; SameSite=Lax`,
      ],
    },
  })
}
