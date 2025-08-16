// 翻訳キャッシュシステム

interface CacheEntry {
  value: string;
  timestamp: number;
  accessCount: number;
}

class TranslationCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000; // 最大キャッシュサイズ
  private ttl = 5 * 60 * 1000; // 5分のTTL

  // キャッシュからエントリを取得
  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // TTLチェック
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // アクセス回数を増やす
    entry.accessCount++;
    return entry.value;
  }

  // キャッシュにエントリを設定
  set(key: string, value: string): void {
    // キャッシュサイズが上限に達した場合、古いエントリを削除
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  // 最も使用頻度の低いエントリを削除
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let minAccessCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  // キャッシュをクリア
  clear(): void {
    this.cache.clear();
  }

  // キャッシュ統計を取得
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
  } {
    let totalAccesses = 0;
    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalAccesses / this.cache.size : 0,
      totalAccesses,
    };
  }

  // 期限切れのエントリを削除
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// グローバルキャッシュインスタンス
export const translationCache = new TranslationCache();

// 定期的なクリーンアップ（5分ごと）
setInterval(() => {
  translationCache.cleanup();
}, 5 * 60 * 1000);

// 翻訳キーの使用状況を追跡
class TranslationUsageTracker {
  private usageMap = new Map<string, number>();
  private sessionStart = Date.now();

  // 翻訳キーの使用を記録
  track(key: string): void {
    const currentCount = this.usageMap.get(key) || 0;
    this.usageMap.set(key, currentCount + 1);
  }

  // 使用統計を取得
  getUsageStats(): {
    totalKeys: number;
    totalUsages: number;
    mostUsedKeys: Array<{ key: string; count: number }>;
    sessionDuration: number;
  } {
    const entries = Array.from(this.usageMap.entries());
    const totalUsages = entries.reduce((sum, [, count]) => sum + count, 0);
    const mostUsedKeys = entries
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }));

    return {
      totalKeys: this.usageMap.size,
      totalUsages,
      mostUsedKeys,
      sessionDuration: Date.now() - this.sessionStart,
    };
  }

  // 未使用のキーを検出（開発時用）
  getUnusedKeys(allKeys: string[]): string[] {
    return allKeys.filter(key => !this.usageMap.has(key));
  }

  // 統計をリセット
  reset(): void {
    this.usageMap.clear();
    this.sessionStart = Date.now();
  }
}

export const usageTracker = new TranslationUsageTracker();

// 翻訳の遅延読み込み
export const loadTranslationNamespace = async (
  language: string,
  namespace: string
): Promise<any> => {
  const cacheKey = `${language}-${namespace}`;
  
  // キャッシュから確認
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    // 動的インポートで翻訳ファイルを読み込み
    const translations = await import(`./locales/${language}/${namespace}.json`);
    const translationData = translations.default;
    
    // キャッシュに保存
    translationCache.set(cacheKey, JSON.stringify(translationData));
    
    return translationData;
  } catch (error) {
    console.error(`Failed to load translation namespace: ${language}/${namespace}`, error);
    return {};
  }
};

// 翻訳キーの最適化ユーティリティ
export const optimizeTranslationKeys = (translations: any): {
  optimized: any;
  savings: number;
} => {
  const originalSize = JSON.stringify(translations).length;
  
  // 重複する値を検出して最適化
  const valueMap = new Map<string, string>();
  const optimized = JSON.parse(JSON.stringify(translations));
  
  const processObject = (obj: any, path = ''): void => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          processObject(obj[key], currentPath);
        } else if (typeof obj[key] === 'string') {
          const value = obj[key];
          if (valueMap.has(value)) {
            // 重複する値が見つかった場合の処理
            console.log(`Duplicate value found: "${value}" at ${currentPath} and ${valueMap.get(value)}`);
          } else {
            valueMap.set(value, currentPath);
          }
        }
      }
    }
  };
  
  processObject(optimized);
  
  const optimizedSize = JSON.stringify(optimized).length;
  const savings = originalSize - optimizedSize;
  
  return {
    optimized,
    savings,
  };
};

// メモリ使用量の監視
export const getMemoryUsage = (): {
  cacheSize: number;
  usageTrackerSize: number;
  totalMemoryEstimate: number;
} => {
  const cacheStats = translationCache.getStats();
  const usageStats = usageTracker.getUsageStats();
  
  // 概算メモリ使用量（バイト）
  const cacheMemory = cacheStats.size * 100; // エントリあたり約100バイトと仮定
  const trackerMemory = usageStats.totalKeys * 50; // キーあたり約50バイトと仮定
  
  return {
    cacheSize: cacheStats.size,
    usageTrackerSize: usageStats.totalKeys,
    totalMemoryEstimate: cacheMemory + trackerMemory,
  };
};

// 開発時のデバッグ情報
export const getDebugInfo = (): {
  cache: ReturnType<TranslationCache['getStats']>;
  usage: ReturnType<TranslationUsageTracker['getUsageStats']>;
  memory: ReturnType<typeof getMemoryUsage>;
} => {
  return {
    cache: translationCache.getStats(),
    usage: usageTracker.getUsageStats(),
    memory: getMemoryUsage(),
  };
};