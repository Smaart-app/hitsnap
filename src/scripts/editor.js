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
const translateBtn = document.getElementById('translateBtn');

let translationOf = null;

const urlParams = new URLSearchParams(window.location.search);
const editingSlug = urlParams.get('slug');
const baseLang = urlParams.get('base_lang'); // π.χ. ?slug=my-article&base_lang=el

if (dateField) {
  dateField.value = new Date().toISOString().split('T')[0];
}

excerptField?.addEventListener('input', () => {
  countLabel.textContent = `${excerptField.value.length}/160`;
});

contentField?.addEventListener('input', () => {
  preview.innerHTML = marked.parse(contentField.value);
});

// Αν επεξεργαζόμαστε άρθρο ή δημιουργούμε μετάφραση
if (editingSlug) {
  (async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', editingSlug)
      .eq('lang', baseLang || 'el')
      .single();

    if (error) {
      output.classList.remove('hidden');
      output.textContent = `❌ Σφάλμα κατά τη φόρτωση: ${error.message}`;
      return;
    }

    if (baseLang && langField?.value !== baseLang) {
      // Εάν πρόκειται για μετάφραση, γέμισε μόνο τα μεταφράσιμα
      titleField.value = '';
      excerptField.value = '';
      contentField.value = '';
      preview.innerHTML = '';
      translationOf = data.translation_of || data.id;
    } else {
      // Επεξεργασία υπάρχοντος άρθρου
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
      translationOf = data.translation_of || null;
    }
  })();
}

// Υποβολή
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
    ...(translationOf && { translation_of: translationOf }),
  };

  let response;
  if (editingSlug && !baseLang) {
    response = await supabase.from('articles').update(article).eq('slug', editingSlug);
  } else {
    response = await supabase.from('articles').insert([article]);
  }

  const { data, error } = response;

  output.classList.remove('hidden');
  output.textContent = error
    ? `❌ Σφάλμα: ${error.message}`
    : editingSlug && !baseLang
      ? `✅ Το άρθρο ενημερώθηκε επιτυχώς.`
      : `✅ Το άρθρο καταχωρήθηκε με ID: ${data[0].id}`;

  console.log({ article, data, error });
});

// ➤ Μετάφραση με AI (mock ή OpenAI)
translateBtn?.addEventListener('click', async () => {
  const originalText = contentField.value;
  if (!originalText) return alert("Δεν υπάρχει περιεχόμενο για μετάφραση.");

  translateBtn.textContent = '⏳ Μετάφραση...';

  // 🔧 Εδώ βάλε OpenAI fetch αν έχεις κλειδί (ή mock)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.PUBLIC_OPENAI_API_KEY}`, // αν θες
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Translate the following article to English in markdown. Keep structure.' },
        { role: 'user', content: originalText }
      ],
      temperature: 0.7
    })
  });

  const result = await response.json();
  const translated = result.choices?.[0]?.message?.content;

  if (translated) {
    contentField.value = translated;
    preview.innerHTML = marked.parse(translated);
    translateBtn.textContent = '✅ Μεταφράστηκε';
  } else {
    translateBtn.textContent = '❌ Σφάλμα Μετάφρασης';
  }
});
