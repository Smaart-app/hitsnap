import { useEffect, useState } from 'react';
import { createBrowserClient } from '../lib/createBrowserClient.js';

export default function UserStatus({ lang = 'el' }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    let ignore = false;

    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) setUser(session?.user || null);
    });

    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("Supabase user state", user);
  }, [user]);

  const base = lang === 'el' ? '/el' : '/en';

  const handleLogout = async (e) => {
    e.preventDefault();
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = `${base}/login`;
  };

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
