import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UserStatusWrapper({ lang = 'en' }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const base = lang === 'el' ? '/el' : '/en'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  const handleLogout = async (e) => {
    e.preventDefault()
    await supabase.auth.signOut()
    window.location.href = `${base}/login`
  }

  if (loading) {
    return <span style={{ minWidth: 68, display: "inline-block" }}>...</span>
  }

  if (user) {
    return (
      <a
        href={`${base}/logout`}
        onClick={handleLogout}
        className="px-2 py-1 rounded-sm text-[#50c7c2] hover:underline transition hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
        title={user.email}
      >
        🚪 {lang === 'el' ? 'Έξοδος' : 'Logout'}
      </a>
    )
  }

  return (
    <div className="flex gap-2">
      <a
        href={`${base}/register`}
        className="px-2 py-1 rounded-sm text-[#50c7c2] hover:underline transition hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
      >
        📝 {lang === 'el' ? 'Εγγραφή' : 'Sign Up'}
      </a>
      <a
        href={`${base}/login`}
        className="px-2 py-1 rounded-sm text-[#50c7c2] hover:underline transition hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
      >
        🔐 {lang === 'el' ? 'Είσοδος' : 'Sign In'}
      </a>
    </div>
  )
}
