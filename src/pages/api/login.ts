import type { APIRoute } from 'astro'
import { createServerClient } from '@supabase/ssr'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) =>
          cookies.set(name, value, {
            path: '/',
            httpOnly: true,
            secure: false, // true σε production
            sameSite: 'Lax',
            ...options,
          }),
        remove: (name, options) =>
          cookies.delete(name, { path: '/', ...options }),
      },
    }
  )

  const form = await request.formData()
  const email = form.get('email') as string | null
  const password = form.get('password') as string | null
  const lang = form.get('lang') as string | null

  if (!email || !password || !lang) {
    return new Response(JSON.stringify({ error: 'Λείπουν στοιχεία login.' }), {
      status: 400,
    })
  }

  // Προσπάθεια login
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Αν αποτύχει, δοκίμασε sign up (μόνο για development/initial use)
  if (error || !data.session) {
    const signUpResult = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpResult.error) {
      return new Response(
        JSON.stringify({ error: signUpResult.error.message }),
        { status: 401 }
      )
    }

    // Δοκίμασε login ξανά
    const retry = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (retry.error || !retry.data.session) {
      return new Response(
        JSON.stringify({ error: retry.error?.message || 'Login failed' }),
        { status: 401 }
      )
    }

    return redirect(`/${lang}/admin/preview`)
  }

  // Επιτυχία από το πρώτο login
  return redirect(`/${lang}/admin/preview`)
}
