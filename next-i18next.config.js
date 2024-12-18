/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['da', 'de', 'el', 'en', 'es', 'fr', 'it', 'lt', 'nb-NO', 'nl', 'pt', 'pt-BR', 'ru', 'sv', 'tr']
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development'
}
