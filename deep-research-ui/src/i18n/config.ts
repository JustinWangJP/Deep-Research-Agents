import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import jaDashboard from './locales/ja/dashboard.json';
import jaCommon from './locales/ja/common.json';
import enDashboard from './locales/en/dashboard.json';
import enCommon from './locales/en/common.json';

const resources = {
  ja: {
    dashboard: jaDashboard,
    common: jaCommon,
  },
  en: {
    dashboard: enDashboard,
    common: enCommon,
  },
};

const detectorOptions = {
  order: ['localStorage', 'navigator', 'htmlTag'],
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    detection: detectorOptions,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;