const i18n = require('i18next');
const { initReactI18next } = require('react-i18next');

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultLocale: 'en',
    supportedLngs: ['da', 'de', 'el', 'en', 'es', 'fr', 'it', 'lt', 'nb-NO', 'nl', 'pt', 'pt-BR', 'ru', 'sv', 'tr'],
    interpolation: {
      escapeValue: false
    }
  });

module.exports = i18n;
