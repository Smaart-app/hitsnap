import React from "react";

export default function Footer({ lang = 'el' }) {
  const tagline =
    lang === 'en'
      ? 'The smart rise in real estate, beyond the obvious.'
      : 'Η έξυπνη άνοδος στο real estate, πέρα από το προφανές.';

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 text-center py-6 text-sm text-zinc-600 dark:text-zinc-400">
      <p className="italic text-sm text-center text-gray-600 mb-2">
        {tagline}
      </p>
      <p className="text-sm text-center text-gray-500">
        © 2025 Hitlift — All rights reserved.
        <br />
        <span className="text-xs opacity-70">Designed & created by Anna Fokidou</span>
      </p>
    </footer>
  );
}
