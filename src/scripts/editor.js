import { supabase } from '../lib/supabaseClient';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

const form = document.getElementById('articleForm');
const output = document.getElementById('output');

const slugField = document.getElementById('slug');
const titleField = document.getElementById('title');
const excerptField = document.getElementById('excerpt');
const contentField = document.getElementById('content');
const langField = document.getElementById('lang');
const coverField = document.getElementById('cover_image');
const publishedField = document.getElementById('published');
const dateField = document.getElementById('publish_date');
const countLabel = document.getElementById('excerptCount');
const preview = document.getElementById('preview');

// Προεπιλεγμένη ημερομηνία
if (dateField) {
  dateField.value = new Date().toISOString().split('T')[0];
}

// Μετρητής χαρακτήρων excerpt
excerptField?.addEventListener('input', () => {
  countLabel.textContent = `${excerptField.value.length}/160`;
});

// Ζωντανό preview markdown
contentField?.addEventListener('input', () => {
  preview.innerHTML = marked.parse(contentField.value);
});

// Υποβολή φόρμας
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  output.classList.add('hidden');

  const article = {
    slug: slugField?.value,
    title: titleField?.value,
    excerpt: excerptField?.value,
    content: contentField?.value,
    lang: langField?.value,
    publish_date: dateField?.value,
    cover_image: coverField?.value,
    published: publishedField?.value === 'true',
  };

  const { data, error } = await supabase.from('articles').insert([article]);

  output.classList.remove('hidden');
  output.textContent = error
    ? `❌ Σφάλμα: ${error.message}`
    : `✅ Το άρθρο καταχωρήθηκε με ID: ${data[0].id}`;

  console.log({ article, data, error });
});
