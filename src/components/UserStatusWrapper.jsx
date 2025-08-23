// src/components/UserStatusWrapper.jsx
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { isFsMode } from '@/lib/isFsMode' // FS-MODE: ανίχνευση demo mode

export default function UserStatusWrapper({ lang = 'en' }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const base = lang === 'el' ? '/el' : lang === 'nl' ? '/nl' : '/en'
  const pollRef = useRef(null) // FS-MODE: interval polling όταν δεν υπάρχει onAuthStateChange

  useEffect(() => {
    let unsub = null
    let mounted = true

    const refresh = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        setUser(data?.user ?? null)
      } catch {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // αρχικό fetch κατά mount
    refresh()

    if (isFsMode()) {
      // FS-MODE: δεν βασιζόμαστε σε onAuthStateChange — κάνουμε ελαφρύ polling στο cookie state
      pollRef.current = setInterval(refresh, 800)
      const onFocus = () => refresh()
      window.addEventListener('focus', onFocus)
      unsub = () => window.removeEventListener('focus', onFocus)
    } else if (typeof supabase?.auth?.onAuthStateChange === 'function') {
      // Real mode: η κλασική ροή Supabase
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        setUser(session?.user || null)
        setLoading(false)
      })
      unsub = () => listener?.subscription?.unsubscribe?.()
    }

    return () => {
      mounted = false
      if (pollRef.current) clearInterval(pollRef.current)
      if (typeof unsub === 'function') unsub()
    }
  }, [lang])

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await supabase.auth.signOut() // FS-MODE: σβήνει το fs-auth cookie, Real mode: κάνει signOut
    } catch {}
    // Προτιμάμε να περάσουμε από το server route για καθάρισμα τυχόν cookies
    window.location.href = `${base}/logout`
  }

  if (loading) {
    return <span style={{ minWidth: 68, display: 'inline-block' }}>...</span>
  }

  if (user) {
    return (
      <a
        href={`${base}/logout`}
        onClick={handleLogout}
        className="px-2 py-1 rounded-sm text-[#50c7c2] hover:underline transition hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
        title={user?.email || ''}
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
