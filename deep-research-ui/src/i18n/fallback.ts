// 翻訳フォールバック機能

import i18n from 'i18next';

// フォールバック設定
export interface FallbackConfig {
  showMissingKeyWarnings: boolean;
  logMissingKeys: boolean;
  useKeyAsDefaultValue: boolean;
  fallbackLanguages: string[];
  missingKeyHandler?: (key: string, namespace: string, language: string) => string;
}

const defaultFallbackConfig: FallbackConfig = {
  showMissingKeyWarnings: process.env.NODE_ENV === 'development',
  logMissingKeys: true,
  useKeyAsDefaultValue: process.env.NODE_ENV === 'development',
  fallbackLanguages: ['en', 'ja'],
  missingKeyHandler: undefined,
};

let fallbackConfig = { ...defaultFallbackConfig };

// フォールバック設定を更新
export const updateFallbackConfig = (config: Partial<FallbackConfig>): void => {
  fallbackConfig = { ...fallbackConfig, ...config };
};

// 現在のフォールバック設定を取得
export const getFallbackConfig = (): FallbackConfig => {
  return { ...fallbackConfig };
};

// 欠落した翻訳キーのログ
const missingKeys = new Set<string>();

// 欠落した翻訳キーを記録
export const logMissingKey = (key: string, namespace: string, language: string): void => {
  const fullKey = `${language}:${namespace}:${key}`;
  
  if (!missingKeys.has(fullKey)) {
    missingKeys.add(fullKey);
    
    if (fallbackConfig.logMissingKeys) {
      console.warn(`Missing translation key: ${fullKey}`);
    }
    
    // カスタムハンドラーがある場合は呼び出し
    if (fallbackConfig.missingKeyHandler) {
      fallbackConfig.missingKeyHandler(key, namespace, language);
    }
  }
};

// 欠落したキーの統計を取得
export const getMissingKeysStats = (): {
  total: number;
  byLanguage: Record<string, number>;
  byNamespace: Record<string, number>;
  keys: string[];
} => {
  const keys = Array.from(missingKeys);
  const byLanguage: Record<string, number> = {};
  const byNamespace: Record<string, number> = {};
  
  keys.forEach(key => {
    const [language, namespace] = key.split(':');
    byLanguage[language] = (byLanguage[language] || 0) + 1;
    byNamespace[namespace] = (byNamespace[namespace] || 0) + 1;
  });
  
  return {
    total: keys.length,
    byLanguage,
    byNamespace,
    keys,
  };
};

// 欠落したキーをクリア
export const clearMissingKeys = (): void => {
  missingKeys.clear();
};

// 安全な翻訳関数（フォールバック付き）
export const safeTranslate = (
  key: string,
  options?: any,
  fallbackValue?: string
): string => {
  try {
    const translation = i18n.t(key, options);
    
    // 翻訳が見つからない場合（キーがそのまま返される）
    if (translation === key) {
      const [namespace, ...keyParts] = key.split(':');
      const actualKey = keyParts.join(':') || namespace;
      const currentNamespace = keyParts.length > 0 ? namespace : 'common';
      
      logMissingKey(actualKey, currentNamespace, i18n.language);
      
      // フォールバック値を返す
      if (fallbackValue) {
        return fallbackValue;
      }
      
      if (fallbackConfig.useKeyAsDefaultValue) {
        return actualKey;
      }
      
      return `[${key}]`; // 開発時に翻訳が欠落していることを明確にする
    }
    
    return translation as string;
  } catch (error) {
    console.error(`Error translating key "${key}":`, error);
    
    if (fallbackValue) {
      return fallbackValue;
    }
    
    return fallbackConfig.useKeyAsDefaultValue ? key : `[Error: ${key}]`;
  }
};

// 複数のフォールバック言語を試す翻訳関数
export const translateWithFallback = (
  key: string,
  options?: any,
  fallbackValue?: string
): string => {
  const currentLanguage = i18n.language;
  
  // 現在の言語で試す
  try {
    const translation = i18n.t(key, { ...options, lng: currentLanguage });
    if (translation !== key) {
      return translation;
    }
  } catch (error) {
    console.warn(`Translation failed for key "${key}" in language "${currentLanguage}":`, error);
  }
  
  // フォールバック言語で試す
  for (const fallbackLang of fallbackConfig.fallbackLanguages) {
    if (fallbackLang === currentLanguage) continue;
    
    try {
      const translation = i18n.t(key, { ...options, lng: fallbackLang });
      if (translation !== key) {
        console.warn(`Using fallback language "${fallbackLang}" for key "${key}"`);
        return translation;
      }
    } catch (error) {
      console.warn(`Translation failed for key "${key}" in fallback language "${fallbackLang}":`, error);
    }
  }
  
  // すべてのフォールバックが失敗した場合
  const [namespace, ...keyParts] = key.split(':');
  const actualKey = keyParts.join(':') || namespace;
  const currentNamespace = keyParts.length > 0 ? namespace : 'common';
  
  logMissingKey(actualKey, currentNamespace, currentLanguage);
  
  if (fallbackValue) {
    return fallbackValue;
  }
  
  return fallbackConfig.useKeyAsDefaultValue ? actualKey : `[Missing: ${key}]`;
};

// 翻訳の存在確認
export const hasTranslation = (key: string, language?: string): boolean => {
  try {
    const lng = language || i18n.language;
    const translation = i18n.t(key, { lng });
    return translation !== key;
  } catch (error) {
    return false;
  }
};

// 名前空間の翻訳が読み込まれているかチェック
export const isNamespaceLoaded = (namespace: string, language?: string): boolean => {
  try {
    const lng = language || i18n.language;
    return i18n.hasResourceBundle(lng, namespace);
  } catch (error) {
    return false;
  }
};

// 翻訳リソースの動的読み込み
export const loadNamespaceIfNeeded = async (
  namespace: string,
  language?: string
): Promise<boolean> => {
  const lng = language || i18n.language;
  
  if (isNamespaceLoaded(namespace, lng)) {
    return true;
  }
  
  try {
    await i18n.loadNamespaces(namespace);
    return true;
  } catch (error) {
    console.error(`Failed to load namespace "${namespace}" for language "${lng}":`, error);
    return false;
  }
};

// 翻訳品質チェック
export const checkTranslationQuality = (
  key: string,
  expectedLength?: number
): {
  isValid: boolean;
  issues: string[];
  translation: string;
} => {
  const translation = i18n.t(key);
  const issues: string[] = [];
  
  // 基本的な品質チェック
  if (translation === key) {
    issues.push('Translation not found');
  }
  
  if (translation.includes('{{') && translation.includes('}}')) {
    issues.push('Contains unresolved interpolation variables');
  }
  
  if (translation.trim() === '') {
    issues.push('Translation is empty');
  }
  
  if (expectedLength && translation.length > expectedLength * 2) {
    issues.push('Translation is significantly longer than expected');
  }
  
  if (expectedLength && translation.length < expectedLength * 0.5) {
    issues.push('Translation is significantly shorter than expected');
  }
  
  // HTMLタグの不整合チェック
  const htmlTagPattern = /<[^>]+>/g;
  const originalTags = (key.match(htmlTagPattern) || []).sort();
  const translationTags = (translation.match(htmlTagPattern) || []).sort();
  
  if (JSON.stringify(originalTags) !== JSON.stringify(translationTags)) {
    issues.push('HTML tags mismatch between original and translation');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    translation,
  };
};

// 開発時のデバッグ情報
export const getDebugInfo = (): {
  currentLanguage: string;
  loadedNamespaces: string[];
  missingKeys: ReturnType<typeof getMissingKeysStats>;
  fallbackConfig: FallbackConfig;
} => {
  return {
    currentLanguage: i18n.language,
    loadedNamespaces: i18n.options.ns || [],
    missingKeys: getMissingKeysStats(),
    fallbackConfig: getFallbackConfig(),
  };
};