// 未使用翻訳キーの検出ツール

import fs from 'fs';
import path from 'path';

interface TranslationFile {
  namespace: string;
  language: string;
  keys: string[];
  filePath: string;
}

interface UsageAnalysis {
  totalKeys: number;
  usedKeys: string[];
  unusedKeys: string[];
  usageRate: number;
  keysByNamespace: Record<string, {
    total: number;
    used: number;
    unused: string[];
  }>;
}

class UnusedKeysDetector {
  private sourceDir: string;
  private translationDir: string;
  private translationFiles: TranslationFile[] = [];

  constructor(sourceDir = 'src', translationDir = 'src/i18n/locales') {
    this.sourceDir = sourceDir;
    this.translationDir = translationDir;
  }

  // 翻訳ファイルからすべてのキーを抽出
  private extractKeysFromTranslationFile(filePath: string, namespace: string, language: string): string[] {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(content);
      return this.extractKeysFromObject(translations, namespace);
    } catch (error) {
      console.error(`Error reading translation file ${filePath}:`, error);
      return [];
    }
  }

  // オブジェクトから翻訳キーを再帰的に抽出
  private extractKeysFromObject(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys.push(...this.extractKeysFromObject(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
    }
    
    return keys;
  }

  // ソースファイルから使用されている翻訳キーを抽出
  private extractUsedKeysFromSourceFiles(): string[] {
    const usedKeys = new Set<string>();
    
    const scanDirectory = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          this.extractKeysFromSourceContent(content, usedKeys);
        }
      }
    };
    
    scanDirectory(this.sourceDir);
    return Array.from(usedKeys);
  }

  // ソースコードから翻訳キーを抽出
  private extractKeysFromSourceContent(content: string, usedKeys: Set<string>): void {
    // t('key') パターンを検索
    const tFunctionPattern = /t\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = tFunctionPattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
    
    // t("namespace:key") パターンを検索
    const namespacedPattern = /t\s*\(\s*['"`]([^'"`]+):([^'"`]+)['"`]/g;
    while ((match = namespacedPattern.exec(content)) !== null) {
      usedKeys.add(`${match[1]}:${match[2]}`);
    }
    
    // useTranslation(['namespace']) パターンを検索
    const useTranslationPattern = /useTranslation\s*\(\s*\[([^\]]+)\]/g;
    while ((match = useTranslationPattern.exec(content)) !== null) {
      const namespaces = match[1].split(',').map(ns => ns.trim().replace(/['"`]/g, ''));
      // この情報は後で名前空間の使用状況分析に使用可能
    }
  }

  // 翻訳ファイルを読み込み
  private loadTranslationFiles(): void {
    this.translationFiles = [];
    
    const languages = fs.readdirSync(this.translationDir);
    
    for (const language of languages) {
      const languageDir = path.join(this.translationDir, language);
      
      if (fs.statSync(languageDir).isDirectory()) {
        const files = fs.readdirSync(languageDir);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const namespace = file.replace('.json', '');
            const filePath = path.join(languageDir, file);
            const keys = this.extractKeysFromTranslationFile(filePath, namespace, language);
            
            this.translationFiles.push({
              namespace,
              language,
              keys,
              filePath,
            });
          }
        }
      }
    }
  }

  // 未使用キーの分析を実行
  public analyze(): UsageAnalysis {
    this.loadTranslationFiles();
    const usedKeys = this.extractUsedKeysFromSourceFiles();
    
    // すべての翻訳キーを収集（英語版をベースとする）
    const allKeys = new Set<string>();
    const keysByNamespace: Record<string, string[]> = {};
    
    for (const file of this.translationFiles) {
      if (file.language === 'en') { // 英語版をベースとする
        keysByNamespace[file.namespace] = file.keys;
        for (const key of file.keys) {
          allKeys.add(`${file.namespace}:${key}`);
        }
      }
    }
    
    const totalKeys = allKeys.size;
    const usedKeysSet = new Set(usedKeys);
    const unusedKeys = Array.from(allKeys).filter(key => !usedKeysSet.has(key));
    
    // 名前空間別の分析
    const namespaceAnalysis: Record<string, {
      total: number;
      used: number;
      unused: string[];
    }> = {};
    
    for (const [namespace, keys] of Object.entries(keysByNamespace)) {
      const namespacedKeys = keys.map(key => `${namespace}:${key}`);
      const usedInNamespace = namespacedKeys.filter(key => usedKeysSet.has(key));
      const unusedInNamespace = namespacedKeys.filter(key => !usedKeysSet.has(key));
      
      namespaceAnalysis[namespace] = {
        total: keys.length,
        used: usedInNamespace.length,
        unused: unusedInNamespace,
      };
    }
    
    return {
      totalKeys,
      usedKeys: Array.from(usedKeysSet),
      unusedKeys,
      usageRate: totalKeys > 0 ? (usedKeys.length / totalKeys) * 100 : 0,
      keysByNamespace: namespaceAnalysis,
    };
  }

  // 分析結果をレポートとして出力
  public generateReport(): string {
    const analysis = this.analyze();
    
    let report = '# Translation Keys Usage Report\n\n';
    report += `## Summary\n`;
    report += `- Total Keys: ${analysis.totalKeys}\n`;
    report += `- Used Keys: ${analysis.usedKeys.length}\n`;
    report += `- Unused Keys: ${analysis.unusedKeys.length}\n`;
    report += `- Usage Rate: ${analysis.usageRate.toFixed(2)}%\n\n`;
    
    report += `## Namespace Analysis\n\n`;
    for (const [namespace, stats] of Object.entries(analysis.keysByNamespace)) {
      const usageRate = stats.total > 0 ? (stats.used / stats.total) * 100 : 0;
      report += `### ${namespace}\n`;
      report += `- Total: ${stats.total}\n`;
      report += `- Used: ${stats.used}\n`;
      report += `- Unused: ${stats.unused.length}\n`;
      report += `- Usage Rate: ${usageRate.toFixed(2)}%\n\n`;
      
      if (stats.unused.length > 0) {
        report += `#### Unused Keys:\n`;
        for (const key of stats.unused) {
          report += `- ${key}\n`;
        }
        report += '\n';
      }
    }
    
    if (analysis.unusedKeys.length > 0) {
      report += `## All Unused Keys\n\n`;
      for (const key of analysis.unusedKeys) {
        report += `- ${key}\n`;
      }
    }
    
    return report;
  }

  // 未使用キーを削除（注意：実際のファイルを変更します）
  public removeUnusedKeys(dryRun = true): void {
    const analysis = this.analyze();
    
    if (dryRun) {
      console.log('DRY RUN: The following keys would be removed:');
      analysis.unusedKeys.forEach(key => console.log(`- ${key}`));
      return;
    }
    
    // 実際の削除処理（実装は慎重に行う必要があります）
    console.log('Removing unused keys is not implemented for safety reasons.');
    console.log('Please review the unused keys manually and remove them if appropriate.');
  }
}

// CLI使用のためのエクスポート
export { UnusedKeysDetector };

// 直接実行された場合の処理
if (require.main === module) {
  const detector = new UnusedKeysDetector();
  const report = detector.generateReport();
  
  console.log(report);
  
  // レポートをファイルに保存
  fs.writeFileSync('translation-usage-report.md', report);
  console.log('\nReport saved to translation-usage-report.md');
}