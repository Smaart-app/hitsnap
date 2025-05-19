import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ighqljuycyjfwgysmaaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaHFsanV5Y3lqZndneXNtYWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTY0MzMsImV4cCI6MjA2Mjk3MjQzM30.RgqMPgS96y7dUdKX5s-MR2KbqJqiMbDtf1l6_i-PXD8'
);

const form = document.getElementById('articleForm');
const output = document.getElementById('output');
const excerptField = document.getElementById('excerpt');
const countLabel = document.getElementById('excerptCount');
const dateField = document.getElementById('created_at');

dateField.value = new Date().toISOString().split('T')[0];

excerptField?.addEventListener('input', () => {
  countLabel.textContent = `${excerptField.value.length}/160`;
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const article = {
    slug: document.getElementById('slug').value,
    title: document.getElementById('title').value,
    excerpt: document.getElementById('excerpt').value,
    content: document.getElementById('content').value,
    created_at: document.getElementById('created_at').value,
    cover_image: document.getElementById('cover_image').value,
    published: document.getElementById('published').value === 'true',
  };

  const { data, error } = await supabase.from('articles').insert([article]);

  output.classList.remove('hidden');
  output.textContent = error
    ? `❌ Σφάλμα: ${error.message}`
    : `✅ Το άρθρο καταχωρήθηκε με ID: ${data[0].id}`;

  console.log({ article, data, error });
});
