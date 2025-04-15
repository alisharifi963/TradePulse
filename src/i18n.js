import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import faTranslation from './locales/fa/translation.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fa: { translation: faTranslation },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
