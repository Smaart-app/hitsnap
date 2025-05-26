# Hitlift – A Creative Content Playground ✨

A modern, markdown-first CMS and blog platform built with Astro, Supabase, and Tailwind.  
Designed for experimentation, multilingual publishing, and editorial freedom.

---

## 🛠 Tech Stack

- Astro (static site generator)
- Supabase (backend, auth, and DB)
- Tailwind CSS (utility-first styling)
- TypeScript

---

## ✨ Features

- 🔤 Multilingual content (🇬🇷 el + 🇬🇧 en, easily extendable)
- 📝 Markdown support + schema-based content modeling
- 🔐 Supabase authentication-ready
- 🧠 AI integration architecture (for future smart editor)
- 🧩 Modular layout system (Astro components)
- 🗂 Admin dashboard for content management
- ✏️ Editor with preview and publish scheduling

---

## 🧪 Local Development Setup

1. **Clone the repo**

```bash
git clone https://github.com/your-username/hitlift.git
cd hitlift
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root with the following:

```env
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> These keys are available in your Supabase project under Project Settings → API.

4. **Run the development server**

```bash
npm run dev
```

It will start the local site at:

```
http://localhost:4321/
```

or fallback to another port if it's already used.

---

## 🧱 Folder Structure (short)

```
src/
├── components/       → UI blocks (Header, Footer, etc.)
├── pages/
│   ├── [lang]/       → Dynamic language-based routes
│   │   └── blog/     → Articles, editor, slug pages
│   └── login.astro   → Admin login page
├── lib/              → Supabase client setup
└── layouts/          → Base layout components
```

---

## 🔐 Login Error Handling

To handle incorrect login attempts:

1. In `src/pages/login.astro`, after verifying that `password !== expectedPassword`, redirect to:

```
/login?error=true
```

2. On the login page, check for the query parameter and show an error message if present:

```astro
---
const error = Astro.url.searchParams.get('error') === 'true';
---

{error && (
  <p class="text-red-500 text-sm mt-2">Incorrect password. Please try again.</p>
)}
```

3. Ensure this logic is placed near the login form to display clearly when authentication fails.

---

## 🌐 Translation Link Logic

By default, `hasTranslation = true` was used as a placeholder. Instead:

1. In `src/pages/[lang]/blog/index.astro`, use Supabase to check for alternate language versions:

```ts
const { data: altArticles } = await supabase
  .from('articles')
  .select('slug')
  .eq('translation_of', article.id)
  .eq('lang', altLang)
  .eq('published', true)
  .limit(1);

const hasTranslation = altArticles?.length > 0;
```

2. Use `hasTranslation` to conditionally show the link:

```astro
{hasTranslation && (
  <a href={`/${altLang}/blog/${translatedSlug}`} class="text-[#50c7c2] hover:underline">
    {lang === 'el' ? 'Δες και στα Αγγλικά →' : 'View in Greek →'}
  </a>
)}
```

This ensures translated links only appear when a real translation exists.

---

## 🖼 Asset Directory Cleanup

The file `public/assets/images` was previously a placeholder.

**To fix this:**

1. Delete the `public/assets/images` file if it is not an actual image folder.

```bash
rm public/assets/images
```

2. Replace it with a real folder:

```bash
mkdir -p public/assets/images
```

3. Add any placeholder images (e.g. `placeholder.png`, `default-cover.jpg`) that are needed, or update your documentation to explain how to obtain them.

> Optional: Include a `.gitkeep` file if the folder must stay empty but tracked by Git.

---

## 🚧 Routing Consistency

To avoid conflicts between dynamic and static routes:

1. Choose **either**:
   - Dynamic routing via `src/pages/[lang]/...`
   - Or static folders like `src/pages/el/`, `src/pages/en/`

2. **Delete or merge** duplicated content across those folders.

> Example: If `src/pages/[lang]/index.astro` exists, remove `src/pages/el/index.astro` and `src/pages/en/index.astro` to avoid shadowing or path confusion.
