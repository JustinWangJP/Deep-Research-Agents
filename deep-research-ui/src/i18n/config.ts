import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translationCache, usageTracker } from './cache';
import { logMissingKey, updateFallbackConfig } from './fallback';

// 日本語翻訳ファイル
import jaDashboard from './locales/ja/dashboard.json';
import jaCommon from './locales/ja/common.json';
import jaAgents from './locales/ja/agents.json';
import jaSearch from './locales/ja/search.json';
import jaMemory from './locales/ja/memory.json';
import jaCitations from './locales/ja/citations.json';
import jaForms from './locales/ja/forms.json';
import jaErrors from './locales/ja/errors.json';

// 英語翻訳ファイル
import enDashboard from './locales/en/dashboard.json';
import enCommon from './locales/en/common.json';
import enAgents from './locales/en/agents.json';
import enSearch from './locales/en/search.json';
import enMemory from './locales/en/memory.json';
import enCitations from './locales/en/citations.json';
import enForms from './locales/en/forms.json';
import enErrors from './locales/en/errors.json';

const resources = {
  ja: {
    dashboard: jaDashboard,
    common: jaCommon,
    agents: jaAgents,
    search: jaSearch,
    memory: jaMemory,
    citations: jaCitations,
    forms: jaForms,
    errors: jaErrors,
  },
  en: {
    dashboard: enDashboard,
    common: enCommon,
    agents: enAgents,
    search: enSearch,
    memory: enMemory,
    citations: enCitations,
    forms: enForms,
    errors: enErrors,
  },
};

// 数値フォーマット設定
const numberFormats = {
  ja: {
    decimal: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    percent: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
    currency: {
      style: 'currency',
      currency: 'JPY',
    },
  },
  en: {
    decimal: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    percent: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
    currency: {
      style: 'currency',
      currency: 'USD',
    },
  },
};

// 日時フォーマット設定
const dateTimeFormats = {
  ja: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    time: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
  },
  en: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    time: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
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
    fallbackLng: ['en', 'ja'], // 複数のフォールバック言語を設定
    debug: process.env.NODE_ENV === 'development',
    detection: detectorOptions,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // 欠落した翻訳キーの処理
    missingKeyHandler: (lng: readonly string[], ns: string, key: string) => {
      logMissingKey(key, ns, Array.isArray(lng) ? lng[0] : lng);
    },
  });

// 翻訳使用状況の追跡を追加（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  const originalT = i18n.t.bind(i18n);
  // @ts-ignore - 型の複雑さを回避
  i18n.t = (key: any, ...args: any[]) => {
    if (typeof key === 'string') {
      usageTracker.track(key);
    }
    return originalT(key, ...args);
  };
}

// フォールバック設定を初期化
updateFallbackConfig({
  showMissingKeyWarnings: process.env.NODE_ENV === 'development',
  logMissingKeys: process.env.NODE_ENV === 'development',
  useKeyAsDefaultValue: process.env.NODE_ENV === 'development',
  fallbackLanguages: ['en', 'ja'],
});

// パフォーマンス監視（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  // 10秒ごとにデバッグ情報をログ出力
  setInterval(() => {
    const debugInfo = {
      cache: translationCache.getStats(),
      usage: usageTracker.getUsageStats(),
      language: i18n.language,
      loadedNamespaces: i18n.options.ns || [],
    };
    console.log('i18n Debug Info:', debugInfo);
  }, 10000);
}

export default i18n;