'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '@/i18n/locales/en.json';
import sv from '@/i18n/locales/sv.json';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n when component mounts (client-side only)
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          sv: { translation: sv },
        },
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ['localStorage', 'cookie', 'navigator'],
          caches: ['localStorage', 'cookie'],
        },
      })
      .then(() => {
        setIsInitialized(true);
      });
  }, []);

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading translations...</div>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}