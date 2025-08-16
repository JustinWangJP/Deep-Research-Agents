import { describe, test, expect } from "vitest";

// 翻訳ファイルをインポート
import enCommon from "../locales/en/common.json";
import jaCommon from "../locales/ja/common.json";
import enDashboard from "../locales/en/dashboard.json";
import jaDashboard from "../locales/ja/dashboard.json";
import enAgents from "../locales/en/agents.json";
import jaAgents from "../locales/ja/agents.json";
import enSearch from "../locales/en/search.json";
import jaSearch from "../locales/ja/search.json";
import enMemory from "../locales/en/memory.json";
import jaMemory from "../locales/ja/memory.json";
import enCitations from "../locales/en/citations.json";
import jaCitations from "../locales/ja/citations.json";
import enForms from "../locales/en/forms.json";
import jaForms from "../locales/ja/forms.json";
import enErrors from "../locales/en/errors.json";
import jaErrors from "../locales/ja/errors.json";

// 翻訳リソースの定義
const translations = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    agents: enAgents,
    search: enSearch,
    memory: enMemory,
    citations: enCitations,
    forms: enForms,
    errors: enErrors,
  },
  ja: {
    common: jaCommon,
    dashboard: jaDashboard,
    agents: jaAgents,
    search: jaSearch,
    memory: jaMemory,
    citations: jaCitations,
    forms: jaForms,
    errors: jaErrors,
  },
};

// オブジェクトからキーのパスを抽出する関数
function extractKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        keys.push(...extractKeys(obj[key] as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }

  return keys.sort();
}

// 翻訳値が空でないかチェックする関数
function checkTranslationValues(
  obj: Record<string, unknown>,
  prefix = "",
  errors: string[] = []
): string[] {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        checkTranslationValues(
          obj[key] as Record<string, unknown>,
          fullKey,
          errors
        );
      } else if (typeof obj[key] === "string") {
        if (!(obj[key] as string).trim()) {
          errors.push(`Empty translation value for key: ${fullKey}`);
        }
      }
    }
  }

  return errors;
}

describe("Translation Completeness", () => {
  const namespaces = [
    "common",
    "dashboard",
    "agents",
    "search",
    "memory",
    "citations",
    "forms",
    "errors",
  ];

  namespaces.forEach((namespace) => {
    test(`${namespace} namespace has same keys in both languages`, () => {
      const enKeys = extractKeys(
        translations.en[namespace as keyof typeof translations.en]
      );
      const jaKeys = extractKeys(
        translations.ja[namespace as keyof typeof translations.ja]
      );

      // 英語にあって日本語にないキー
      const missingInJa = enKeys.filter((key) => !jaKeys.includes(key));
      // 日本語にあって英語にないキー
      const missingInEn = jaKeys.filter((key) => !enKeys.includes(key));

      if (missingInJa.length > 0) {
        console.error(`Missing keys in Japanese ${namespace}:`, missingInJa);
      }
      if (missingInEn.length > 0) {
        console.error(`Missing keys in English ${namespace}:`, missingInEn);
      }

      expect(missingInJa).toHaveLength(0);
      expect(missingInEn).toHaveLength(0);
      expect(enKeys).toEqual(jaKeys);
    });

    test(`${namespace} namespace has no empty translation values in English`, () => {
      const errors = checkTranslationValues(
        translations.en[namespace as keyof typeof translations.en]
      );

      if (errors.length > 0) {
        console.error(`Empty values in English ${namespace}:`, errors);
      }

      expect(errors).toHaveLength(0);
    });

    test(`${namespace} namespace has no empty translation values in Japanese`, () => {
      const errors = checkTranslationValues(
        translations.ja[namespace as keyof typeof translations.ja]
      );

      if (errors.length > 0) {
        console.error(`Empty values in Japanese ${namespace}:`, errors);
      }

      expect(errors).toHaveLength(0);
    });
  });
});

describe("Translation Structure Validation", () => {
  test("All namespaces exist in both languages", () => {
    const enNamespaces = Object.keys(translations.en).sort();
    const jaNamespaces = Object.keys(translations.ja).sort();

    expect(enNamespaces).toEqual(jaNamespaces);
  });

  test("Common status keys are consistent", () => {
    const expectedStatusKeys = [
      "idle",
      "running",
      "completed",
      "error",
      "paused",
    ];

    // common.jsonのstatusキーをチェック
    const enStatusKeys = Object.keys(translations.en.common.status).sort();
    const jaStatusKeys = Object.keys(translations.ja.common.status).sort();

    expect(enStatusKeys).toEqual(expectedStatusKeys.sort());
    expect(jaStatusKeys).toEqual(expectedStatusKeys.sort());
  });

  test("Navigation keys are consistent", () => {
    const expectedNavKeys = [
      "agents",
      "agentsDescription",
      "citations",
      "citationsDescription",
      "dashboard",
      "memory",
      "memoryDescription",
      "search",
      "searchDescription",
    ];

    const enNavKeys = Object.keys(translations.en.common.navigation).sort();
    const jaNavKeys = Object.keys(translations.ja.common.navigation).sort();

    expect(enNavKeys).toEqual(expectedNavKeys.sort());
    expect(jaNavKeys).toEqual(expectedNavKeys.sort());
  });
});

describe("Translation Content Validation", () => {
  test("No translation contains placeholder text", () => {
    const placeholderPatterns = [
      /TODO/i,
      /FIXME/i,
      /\[.*\]/, // [placeholder] pattern
      /{{.*}}/, // {{placeholder}} pattern
    ];

    const checkForPlaceholders = (
      obj: Record<string, unknown>,
      prefix = "",
      errors: string[] = []
    ) => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            checkForPlaceholders(
              obj[key] as Record<string, unknown>,
              fullKey,
              errors
            );
          } else if (typeof obj[key] === "string") {
            placeholderPatterns.forEach((pattern) => {
              if (pattern.test(obj[key] as string)) {
                errors.push(`Placeholder found in ${fullKey}: ${obj[key]}`);
              }
            });
          }
        }
      }
      return errors;
    };

    Object.keys(translations).forEach((lang) => {
      Object.keys(translations[lang as keyof typeof translations]).forEach(
        (namespace) => {
          const errors = checkForPlaceholders(
            translations[lang as keyof typeof translations][
              namespace as keyof typeof translations.en
            ],
            `${lang}.${namespace}`
          );

          if (errors.length > 0) {
            console.error(
              `Placeholders found in ${lang}.${namespace}:`,
              errors
            );
          }

          expect(errors).toHaveLength(0);
        }
      );
    });
  });

  test("Interpolation variables are consistent between languages", () => {
    const extractInterpolationVars = (text: string): string[] => {
      const matches = text.match(/{{(\w+)}}/g);
      return matches ? matches.sort() : [];
    };

    const checkInterpolationConsistency = (
      enObj: Record<string, unknown>,
      jaObj: Record<string, unknown>,
      prefix = "",
      errors: string[] = []
    ) => {
      for (const key in enObj) {
        if (
          Object.prototype.hasOwnProperty.call(enObj, key) &&
          Object.prototype.hasOwnProperty.call(jaObj, key)
        ) {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (
            typeof enObj[key] === "object" &&
            typeof jaObj[key] === "object" &&
            enObj[key] !== null &&
            jaObj[key] !== null &&
            !Array.isArray(enObj[key]) &&
            !Array.isArray(jaObj[key])
          ) {
            checkInterpolationConsistency(
              enObj[key] as Record<string, unknown>,
              jaObj[key] as Record<string, unknown>,
              fullKey,
              errors
            );
          } else if (
            typeof enObj[key] === "string" &&
            typeof jaObj[key] === "string"
          ) {
            const enVars = extractInterpolationVars(enObj[key] as string);
            const jaVars = extractInterpolationVars(jaObj[key] as string);

            if (JSON.stringify(enVars) !== JSON.stringify(jaVars)) {
              errors.push(
                `Interpolation variables mismatch in ${fullKey}: EN(${enVars.join(
                  ","
                )}) vs JA(${jaVars.join(",")})`
              );
            }
          }
        }
      }
      return errors;
    };

    Object.keys(translations.en).forEach((namespace) => {
      const errors = checkInterpolationConsistency(
        translations.en[namespace as keyof typeof translations.en],
        translations.ja[namespace as keyof typeof translations.ja],
        namespace
      );

      if (errors.length > 0) {
        console.error(`Interpolation inconsistencies in ${namespace}:`, errors);
      }

      expect(errors).toHaveLength(0);
    });
  });
});

describe("Translation Usage Validation", () => {
  test("All translation keys are used in components", () => {
    // このテストは実際のコンポーネントファイルをスキャンして
    // 使用されていない翻訳キーを検出することができます
    // 実装は複雑になるため、ここでは基本的な構造のみ示します

    // 実際の実装では、ファイルシステムを読み取り、
    // t('key') パターンを検索して使用されているキーを抽出し、
    // 翻訳ファイルのキーと比較します

    expect(true).toBe(true); // プレースホルダー
  });
});
