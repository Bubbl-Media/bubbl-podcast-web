import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { locales } from './src/lib/utility/locales';  // Import your locales

i18n
  .use(initReactI18next)
  .init({
    resources: locales,
    fallbackLng: 'en',
    defaultLocale: 'en',
    supportedLngs: ['da', 'de', 'el', 'en', 'es', 'fr', 'it', 'lt', 'nb-NO', 'nl', 'pt', 'pt-BR', 'ru', 'sv', 'tr'],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
