import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function UserStatus({ lang = 'el' }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Δημιουργεί τον Supabase client μόνο στον browser
    const supabase = typeof window !== 'undefined'
      ? createBrowserClient(
          import.meta.env.PUBLIC_SUPABASE_URL,
          import.meta.env.PUBLIC_SUPABASE_ANON_KEY
        )
      : null;

    if (!supabase) return;

    let ignore = false;

    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) {
        setUser(data.user);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) {
        setUser(session?.user || null);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const base = lang === 'el' ? '/el' : '/en';

  const handleLogout = async (e) => {
    e.preventDefault();

    const supabase = typeof window !== 'undefined'
      ? createBrowserClient(
          import.meta.env.PUBLIC_SUPABASE_URL,
          import.meta.env.PUBLIC_SUPABASE_ANON_KEY
        )
      : null;

    if (!supabase) return;

    await supabase.auth.signOut();
    window.location.href = `${base}/login`;
  };

  if (loading) {
    return <span style={{ minWidth: 68, display: "inline-block" }}>...</span>;
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
    );
  }

  return (
    <a
      href={`${base}/login`}
      className="px-2 py-1 rounded-sm text-[#50c7c2] hover:underline transition hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
    >
      🔐 {lang === 'el' ? 'Είσοδος' : 'Login'}
    </a>
  );
}
