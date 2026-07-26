import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

const savedLang = localStorage.getItem('acg-lang') || 'ar';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Keeps <html> lang & dir in sync with the active language. */
export function applyDirection(lang: string) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

applyDirection(savedLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('acg-lang', lng);
  applyDirection(lng);
});

export default i18n;
