/* eslint-disable @typescript-eslint/no-var-requires */
const { i18n } = require('./next-i18next.config')

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const isProd = process.env.NODE_ENV === 'production'

const envVars = {}

const moduleExports = {
  async headers() {
    return [
      {
        source: "/embed/player",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  reactStrictMode: true,
  i18n,
  serverRuntimeConfig: {
    IS_DEV: isDev,
    API_PATH: process.env.API_PATH,
    API_VERSION: process.env.API_VERSION,
    API_DOMAIN: process.env.API_DOMAIN,
    API_PROTOCOL: process.env.API_PROTOCOL,
    WEB_PROTOCOL: process.env.WEB_PROTOCOL,
    WEB_DOMAIN: process.env.PUBLIC_WEB_DOMAIN,
    APP_DOWNLOAD_ON_THE_APP_STORE_URL: process.env.APP_DOWNLOAD_ON_THE_APP_STORE_URL,
    APP_GET_IT_ON_FDROID_URL: process.env.APP_GET_IT_ON_FDROID_URL,
    APP_GET_IT_ON_GOOGLE_PLAY_URL: process.env.APP_GET_IT_ON_GOOGLE_PLAY_URL,
    PAYPAL_ENV: process.env.PAYPAL_ENV,
    PAYPAL_CLIENT_ID_PRODUCTION: process.env.PAYPAL_CLIENT_ID_PRODUCTION,
    PAYPAL_CLIENT_ID_SANDBOX: process.env.PAYPAL_CLIENT_ID_SANDBOX,
    EMAIL_CONTACT: process.env.EMAIL_CONTACT,
    MATOMO_BASE_URL: process.env.MATOMO_BASE_URL,
    MATOMO_ENDPOINT_PATH: process.env.MATOMO_ENDPOINT_PATH,
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID,
    V4V_APP_NAME: process.env.V4V_APP_NAME,
    V4V_APP_RECIPIENT_CUSTOM_KEY: process.env.V4V_APP_RECIPIENT_CUSTOM_KEY,
    V4V_APP_RECIPIENT_CUSTOM_VALUE: process.env.V4V_APP_RECIPIENT_CUSTOM_VALUE,
    V4V_APP_RECIPIENT_LN_ADDRESS: process.env.V4V_APP_RECIPIENT_LN_ADDRESS,
    V4V_APP_RECIPIENT_VALUE_DEFAULT: process.env.V4V_APP_RECIPIENT_VALUE_DEFAULT,
    V4V_RECIPIENT_VALUE_DEFAULT: process.env.V4V_RECIPIENT_VALUE_DEFAULT
  },
  publicRuntimeConfig: {
    IS_DEV: isDev,
    API_PATH: process.env.API_PATH,
    API_VERSION: process.env.API_VERSION,
    API_DOMAIN: process.env.PUBLIC_API_DOMAIN,
    API_PROTOCOL: process.env.PUBLIC_API_PROTOCOL,
    WEB_PROTOCOL: process.env.PUBLIC_WEB_PROTOCOL,
    WEB_DOMAIN: process.env.PUBLIC_WEB_DOMAIN,
    APP_DOWNLOAD_ON_THE_APP_STORE_URL: process.env.APP_DOWNLOAD_ON_THE_APP_STORE_URL,
    APP_GET_IT_ON_FDROID_URL: process.env.APP_GET_IT_ON_FDROID_URL,
    APP_GET_IT_ON_GOOGLE_PLAY_URL: process.env.APP_GET_IT_ON_GOOGLE_PLAY_URL,
    PAYPAL_ENV: process.env.PAYPAL_ENV,
    PAYPAL_CLIENT_ID_PRODUCTION: process.env.PAYPAL_CLIENT_ID_PRODUCTION,
    PAYPAL_CLIENT_ID_SANDBOX: process.env.PAYPAL_CLIENT_ID_SANDBOX,
    EMAIL_CONTACT: process.env.EMAIL_CONTACT,
    MATOMO_BASE_URL: process.env.MATOMO_BASE_URL,
    MATOMO_ENDPOINT_PATH: process.env.MATOMO_ENDPOINT_PATH,
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID,
    V4V_APP_NAME: process.env.V4V_APP_NAME,
    V4V_APP_RECIPIENT_CUSTOM_KEY: process.env.V4V_APP_RECIPIENT_CUSTOM_KEY,
    V4V_APP_RECIPIENT_CUSTOM_VALUE: process.env.V4V_APP_RECIPIENT_CUSTOM_VALUE,
    V4V_APP_RECIPIENT_LN_ADDRESS: process.env.V4V_APP_RECIPIENT_LN_ADDRESS,
    V4V_APP_RECIPIENT_VALUE_DEFAULT: process.env.V4V_APP_RECIPIENT_VALUE_DEFAULT,
    V4V_RECIPIENT_VALUE_DEFAULT: process.env.V4V_RECIPIENT_VALUE_DEFAULT
  },
  webpack(c) {
    c.module.rules.push({
      test: [
        /src\/components\/index.tsx/i,
      ],
      sideEffects: false,
    });

    return c;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = moduleExports
