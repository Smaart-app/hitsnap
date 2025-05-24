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

// Ανάλυση του slug από το URL
const urlParams = new URLSearchParams(window.location.search);
const editingSlug = urlParams.get('slug');

// Προκαθορισμένη ημερομηνία
if (dateField) {
  dateField.value = new Date().toISOString().split('T')[0];
}

// Μετρητής χαρακτήρων excerpt
excerptField?.addEventListener('input', () => {
  countLabel.textContent = `${excerptField.value.length}/160`;
});

// Ζωντανό preview Markdown
contentField?.addEventListener('input', () => {
  preview.innerHTML = marked.parse(contentField.value);
});

// Αν επεξεργαζόμαστε άρθρο, φέρε το από τη βάση και γέμισε τη φόρμα
if (editingSlug) {
  (async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', editingSlug)
      .single();

    if (error) {
      output.classList.remove('hidden');
      output.textContent = `❌ Σφάλμα κατά τη φόρτωση: ${error.message}`;
      return;
    }

    // Γέμισμα πεδίων με τα υπάρχοντα δεδομένα
    slugField.value = data.slug;
    titleField.value = data.title;
    excerptField.value = data.excerpt;
    contentField.value = data.content;
    langField.value = data.lang;
    coverField.value = data.cover_image;
    publishedField.value = data.published.toString();
    dateField.value = data.publish_date?.split('T')[0] || '';
    preview.innerHTML = marked.parse(data.content || '');
    countLabel.textContent = `${data.excerpt?.length || 0}/160`;
  })();
}

// Υποβολή φόρμας (insert ή update ανάλογα με το mode)
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

  let response;
  if (editingSlug) {
    // Ενημέρωση άρθρου
    response = await supabase
      .from('articles')
      .update(article)
      .eq('slug', editingSlug);
  } else {
    // Νέο άρθρο
    response = await supabase
      .from('articles')
      .insert([article]);
  }

  const { data, error } = response;

  output.classList.remove('hidden');
  output.textContent = error
    ? `❌ Σφάλμα: ${error.message}`
    : editingSlug
      ? `✅ Το άρθρο ενημερώθηκε επιτυχώς.`
      : `✅ Το άρθρο καταχωρήθηκε με ID: ${data[0].id}`;

  console.log({ article, data, error });
});
