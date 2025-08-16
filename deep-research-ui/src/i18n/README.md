# Deep Research Agents UI - 国際化（i18n）実装

このドキュメントは、Deep Research Agents UIアプリケーションの国際化実装について説明します。

## 概要

このアプリケーションは、以下の言語をサポートしています：
- 英語 (en) - デフォルト言語
- 日本語 (ja)

## アーキテクチャ

### ディレクトリ構造

```
src/i18n/
├── config.ts                    # i18next設定
├── types.ts                     # TypeScript型定義
├── formatters.ts                # 数値・日時フォーマット関数
├── cache.ts                     # 翻訳キャッシュシステム
├── fallback.ts                  # フォールバック機能
├── I18nErrorBoundary.tsx        # エラー境界コンポーネント
├── unused-keys-detector.ts      # 未使用キー検出ツール
├── __tests__/                   # テストファイル
└── locales/
    ├── en/                      # 英語翻訳
    │   ├── common.json
    │   ├── dashboard.json
    │   ├── agents.json
    │   ├── search.json
    │   ├── memory.json
    │   ├── citations.json
    │   ├── forms.json
    │   └── errors.json
    └── ja/                      # 日本語翻訳
        ├── common.json
        ├── dashboard.json
        ├── agents.json
        ├── search.json
        ├── memory.json
        ├── citations.json
        ├── forms.json
        └── errors.json
```

### 翻訳名前空間

| 名前空間 | 説明 |
|---------|------|
| `common` | 共通UI要素、ナビゲーション、基本アクション |
| `dashboard` | ダッシュボード関連の翻訳 |
| `agents` | エージェント管理機能 |
| `search` | 検索インターフェース |
| `memory` | メモリ管理機能 |
| `citations` | 引用管理機能 |
| `forms` | フォーム検証とメッセージ |
| `errors` | エラーメッセージ |

## 使用方法

### 基本的な翻訳

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent: React.FC = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.subtitle')}</p>
    </div>
  );
};
```

### 複数の名前空間を使用

```typescript
const { t } = useTranslation(['common', 'dashboard']);

// 名前空間を明示的に指定
const title = t('dashboard:agentDashboard.title');
const loading = t('common:common.loading');
```

### 数値・日時フォーマット

```typescript
import { useNumberFormat, useDateTimeFormat } from '../i18n/formatters';

const MyComponent: React.FC = () => {
  const { formatNumber, formatPercent, formatFileSize } = useNumberFormat();
  const { formatShortDate, formatRelativeTime } = useDateTimeFormat();
  
  return (
    <div>
      <p>数値: {formatNumber(1234.56)}</p>
      <p>パーセンテージ: {formatPercent(0.75)}</p>
      <p>ファイルサイズ: {formatFileSize(1048576)}</p>
      <p>日付: {formatShortDate(new Date())}</p>
      <p>相対時間: {formatRelativeTime(new Date())}</p>
    </div>
  );
};
```

### エラー境界の使用

```typescript
import { I18nErrorBoundary } from '../i18n/I18nErrorBoundary';

const App: React.FC = () => {
  return (
    <I18nErrorBoundary>
      <MyComponent />
    </I18nErrorBoundary>
  );
};
```

## 開発ガイド

### 新しい翻訳キーの追加

1. 適切な名前空間のJSONファイルに翻訳を追加
2. 両言語（英語・日本語）で翻訳を提供
3. TypeScript型定義を更新（必要に応じて）

例：
```json
// en/common.json
{
  "buttons": {
    "newAction": "New Action"
  }
}

// ja/common.json
{
  "buttons": {
    "newAction": "新しいアクション"
  }
}
```

### 翻訳キーの命名規則

- 階層的な構造を使用: `section.subsection.key`
- キャメルケースを使用: `myActionButton`
- 説明的な名前を使用: `confirmDeleteDialog` > `dialog1`

### 補間変数の使用

```json
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

```typescript
t('welcome', { name: 'John' })
t('itemCount', { count: 5 })
```

## テスト

### 翻訳の完全性テスト

```bash
npm test src/i18n/__tests__/translations.test.ts
```

### コンポーネントの翻訳テスト

```bash
npm test src/components/__tests__/i18n-components.test.tsx
```

### フォーマット関数のテスト

```bash
npm test src/i18n/__tests__/formatters.test.ts
```

### E2Eテスト

```bash
node playwright-test-i18n.js
```

## パフォーマンス最適化

### 翻訳キャッシュ

翻訳キャッシュシステムが自動的に有効になり、頻繁に使用される翻訳をメモリにキャッシュします。

### 未使用キーの検出

```bash
npm run detect-unused-keys
```

このコマンドは未使用の翻訳キーを検出し、レポートを生成します。

### デバッグ情報

開発環境では、コンソールに定期的にi18nのデバッグ情報が出力されます：

```javascript
// コンソール出力例
i18n Debug Info: {
  cache: { size: 45, hitRate: 2.3 },
  usage: { totalKeys: 120, totalUsages: 340 },
  language: "ja",
  loadedNamespaces: ["common", "dashboard", "agents"]
}
```

## トラブルシューティング

### よくある問題

1. **翻訳が表示されない**
   - 翻訳キーが正しいか確認
   - 名前空間が正しく読み込まれているか確認
   - ブラウザの開発者ツールでエラーを確認

2. **フォーマットが正しくない**
   - ロケール設定を確認
   - フォーマット関数の使用方法を確認

3. **パフォーマンスの問題**
   - 未使用キー検出ツールを実行
   - キャッシュ統計を確認

### デバッグ方法

```typescript
import { getDebugInfo } from '../i18n/fallback';

// デバッグ情報を取得
const debugInfo = getDebugInfo();
console.log('i18n Debug Info:', debugInfo);
```

## 新しい言語の追加

1. `src/i18n/locales/` に新しい言語ディレクトリを作成
2. 既存の翻訳ファイルをコピーして翻訳
3. `src/i18n/config.ts` のリソース設定を更新
4. フォーマット設定を追加（必要に応じて）

## ベストプラクティス

1. **一貫性**: 翻訳キーの命名規則を統一する
2. **コンテキスト**: 翻訳者が理解しやすいキー名を使用する
3. **テスト**: 新しい翻訳を追加したらテストを実行する
4. **レビュー**: 翻訳の品質をネイティブスピーカーにレビューしてもらう
5. **メンテナンス**: 定期的に未使用キーをクリーンアップする

## 貢献

翻訳の改善や新しい言語の追加に貢献する場合は、以下の手順に従ってください：

1. 翻訳ファイルを更新
2. テストを実行して品質を確認
3. プルリクエストを作成
4. レビューを受ける

## サポート

問題や質問がある場合は、開発チームにお問い合わせください。