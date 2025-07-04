/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,ts,svelte,vue,mdx}",
    "./public/**/*.html"
  ],
  safelist: [
    // Background SVG classes
    'absolute',
    'inset-0',
    'top-0',
    'left-0',
    'w-full',
    'h-screen',
    'z-[-1]',
    'pointer-events-none',
    'select-none',
    'opacity-5',
    'opacity-10',
    'bg-[#f4f3f0]',
    'text-[#1a1a1a]',

    // 👇 Custom animation classes
    'fade-in-up',
    'fade-in-left',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
