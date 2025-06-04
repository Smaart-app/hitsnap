import { useEffect, useState } from 'react';

export default function ThemeButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const html = document.documentElement;

    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      html.classList.add('dark');
    }

    setMounted(true);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="text-base hover:scale-110 transition"
      aria-label="Toggle theme"
    >
      🌓
    </button>
  );
}
