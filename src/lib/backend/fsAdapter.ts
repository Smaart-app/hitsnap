import fs from 'node:fs';
import path from 'node:path';
import { Article, ArticleStore, AuthProvider, Mailer } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles');
const LOCAL_DIR = path.join(process.cwd(), '.local');
const DRAFTS_DB = path.join(LOCAL_DIR, 'drafts.json');

function ensureDirs() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
  if (!fs.existsSync(DRAFTS_DB)) fs.writeFileSync(DRAFTS_DB, JSON.stringify({}), 'utf8');
}

function toFrontmatter(a: Article) {
  const { body, ...meta } = a;
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join('\n')}\n---\n\n${body ?? ''}`;
}

function fromFrontmatter(raw: string): any {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
  if (!m) throw new Error('Invalid markdown with frontmatter');
  const metaLines = m[1].split('\n');
  const meta: any = {};
  for (const line of metaLines) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    try {
      meta[key] = JSON.parse(val);
    } catch {
      meta[key] = val.replace(/^"+|"+$/g, '');
    }
  }
  const body = m[2] ?? '';
  return { ...meta, body };
}

// filename => { slug, lang? }
function parseName(file: string) {
  const name = path.basename(file);
  // επιτρέπουμε suffix .xx ή .xxx..xxxx
  const m = name.match(/^(.+?)\.(?:([a-z]{2,5}))\.md$/i);
  if (m) return { slug: m[1], lang: m[2].toLowerCase() };
  const m2 = name.match(/^(.+?)\.md$/i);
  if (m2) return { slug: m2[1], lang: undefined };
  return { slug: name.replace(/\.md$/i, ''), lang: undefined };
}

function readArticleFile(filepath: string): Article {
  const raw = fs.readFileSync(filepath, 'utf8');
  const fm = fromFrontmatter(raw);
  const { slug: fileSlug, lang: nameLang } = parseName(filepath);

  const slug = (fm.slug ?? fileSlug) as string;
  const lang = (fm.language ?? fm.lang ?? nameLang ?? 'en') as string;

  const a: Article = {
    id: slug,
    slug,
    title: String(fm.title ?? '').trim(),
    language: lang,
    excerpt: fm.excerpt ?? '',
    coverImage: fm.coverImage ?? fm.cover_image ?? '',
    body: String(fm.body ?? ''),
    publishDate: fm.publishDate ?? fm.publish_date ?? new Date().toISOString(),
    status: fm.status ?? (fm.published ? 'published' : 'draft'),
    tags: fm.tags ?? [],
  };
  return a;
}

function writePathFor(slug: string, language: string) {
  const safeLang = (language || 'en').toLowerCase();
  return path.join(CONTENT_DIR, `${slug}.${safeLang}.md`);
}

export class FSArticleStore implements ArticleStore {
  async list(params?: { language?: string; includeDrafts?: boolean; now?: Date }): Promise<Article[]> {
    ensureDirs();
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const nowIso = (params?.now ?? new Date()).toISOString();
    const out: Article[] = [];

    for (const f of files) {
      const fp = path.join(CONTENT_DIR, f);
      try {
        const a = readArticleFile(fp);
        if (params?.language && a.language !== params.language) continue;

        if (!params?.includeDrafts) {
          if (a.status === 'draft') continue;
          if (a.status === 'scheduled' && (a.publishDate ?? '') > nowIso) continue;
        }
        out.push(a);
      } catch (e) {
        console.warn(`[FSArticleStore] Failed to read ${f}:`, e);
      }
    }

    out.sort((x, y) => (y.publishDate ?? '').localeCompare(x.publishDate ?? ''));
    return out;
  }

  async get(slug: string, language?: string): Promise<Article | null> {
    ensureDirs();
    if (!slug) return null;

    // Αν δόθηκε γλώσσα -> προσπάθησε <slug>.<lang>.md
    if (language) {
      const p = writePathFor(slug, language);
      if (fs.existsSync(p)) return readArticleFile(p);
    }

    // Διαφορετικά, προτίμησε en αν υπάρχει, αλλιώς ό,τι βρεις πρώτο
    const pref = [
      writePathFor(slug, 'en'),
      writePathFor(slug, 'el'),
      writePathFor(slug, 'nl'),
      path.join(CONTENT_DIR, `${slug}.md`), // παλιό μοτίβο
    ];
    for (const p of pref) {
      if (fs.existsSync(p)) return readArticleFile(p);
    }

    // ως έσχατη λύση, σκάναρε τον φάκελο για οποιοδήποτε slug.*.md
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.startsWith(`${slug}.`) && f.endsWith('.md'));
    if (files[0]) return readArticleFile(path.join(CONTENT_DIR, files[0]));
    return null;
  }

  async upsert(article: Article): Promise<Article> {
    ensureDirs();
    const file = writePathFor(article.slug, article.language);
    fs.writeFileSync(file, toFrontmatter(article), 'utf8');
    return article;
  }

  async delete(slug: string, language?: string): Promise<void> {
    ensureDirs();
    if (language) {
      const file = writePathFor(slug, language);
      if (fs.existsSync(file)) fs.unlinkSync(file);
      return;
    }
    // χωρίς γλώσσα -> σβήσε όλα τα variants
    const files = fs.readdirSync(CONTENT_DIR).filter(f =>
      f === `${slug}.md` || (f.startsWith(`${slug}.`) && f.endsWith('.md'))
    );
    for (const f of files) fs.unlinkSync(path.join(CONTENT_DIR, f));
  }

  async listLanguages(slug: string): Promise<string[]> {
    ensureDirs();
    const langs = new Set<string>();
    const files = fs.readdirSync(CONTENT_DIR).filter(f =>
      f === `${slug}.md` || (f.startsWith(`${slug}.`) && f.endsWith('.md'))
    );
    for (const f of files) {
      const { lang } = parseName(f);
      if (lang) {
        langs.add(lang.toLowerCase());
      } else {
        // παλιό μοτίβο: προσπάθησε να διαβάσεις το frontmatter
        try {
          const a = readArticleFile(path.join(CONTENT_DIR, f));
          if (a.language) langs.add(String(a.language).toLowerCase());
        } catch {}
      }
    }
    return Array.from(langs);
  }
}

export class DemoAuth implements AuthProvider {
  async getSession(): Promise<{ userId: string | null }> {
    return { userId: 'demo-user' };
  }
}

export class NoopMailer implements Mailer {
  async send({ to, subject, text }: { to: string; subject: string; text: string }) {
    console.log(`[MAIL demo] To:${to} | ${subject}\n${text}`);
  }
}
