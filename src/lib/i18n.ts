// src/lib/i18n.ts
export type Lang = 'en' | 'nl' | 'el';
export const SUPPORTED: Lang[] = ['en', 'nl', 'el'];

type Dict = {
  nav: { home: string; gallery: string; about: string; articles: string; contact: string };
  hero: { title: string; subtitle: string; cta: string };
  footer: { rights: string };
  auth: { signup: string; signin: string; logout: string; adminArticles: string; adminNew: string; adminGallery: string; language: string; menu: string };
};

const dict: Record<Lang, Dict> = {
  en: {
    nav: { home: 'Home', gallery: 'Gallery', about: 'About', articles: 'Articles', contact: 'Contact' },
    hero: { title: 'Moments. Framed.', subtitle: 'Where stillness tells a story.', cta: 'Explore Gallery' },
    footer: { rights: 'All rights reserved.' },
    auth: { signup: 'Sign Up', signin: 'Sign In', logout: 'Logout', adminArticles: 'Articles', adminNew: 'New Article', adminGallery: 'Gallery Upload', language: 'Language', menu: 'Menu' },
  },
  nl: {
    nav: { home: 'Home', gallery: 'Galerij', about: 'Over', articles: 'Artikelen', contact: 'Contact' },
    hero: { title: 'Momenten. Gekaderd.', subtitle: 'Waar stilstand een verhaal vertelt.', cta: 'Bekijk galerij' },
    footer: { rights: 'Alle rechten voorbehouden.' },
    auth: { signup: 'Registreren', signin: 'Inloggen', logout: 'Uitloggen', adminArticles: 'Artikelen', adminNew: 'Nieuw artikel', adminGallery: 'Galerij upload', language: 'Taal', menu: 'Menu' },
  },
  el: {
    nav: { home: 'Αρχική', gallery: 'Gallery', about: 'Σχετικά', articles: 'Άρθρα', contact: 'Επικοινωνία' },
    hero: { title: 'Στιγμές. Καδραρισμένες.', subtitle: 'Όπου η ακινησία λέει μια ιστορία.', cta: 'Δες το Gallery' },
    footer: { rights: 'Με επιφύλαξη παντός δικαιώματος.' },
    auth: { signup: 'Εγγραφή', signin: 'Είσοδος', logout: 'Έξοδος', adminArticles: 'Άρθρα', adminNew: 'Νέο άρθρο', adminGallery: 'Μεταφόρτωση Gallery', language: 'Γλώσσα', menu: 'Μενού' },
  },
};

export function t(lang: Lang): Dict {
  return dict[SUPPORTED.includes(lang) ? lang : 'en'];
}
