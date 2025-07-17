import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import sv from './locales/sv.json';
import da from './locales/da.json';
import no from './locales/no.json';
import nl from './locales/nl.json';
import de from './locales/de.json';
import it from './locales/it.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const resources = {
  en: {
    translation: en,
  },
  sv: {
    translation: sv,
  },
  da: {
    translation: da,
  },
  no: {
    translation: no,
  },
  nl: {
    translation: nl,
  },
  de: {
    translation: de,
  },
  it: {
    translation: it,
  },
  fr: {
    translation: fr,
  },
  es: {
    translation: es,
  },
};

const i18nInstance = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18nInstance;