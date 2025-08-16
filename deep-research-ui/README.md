# Deep Research UI

ディープリサーチエージェントシステムのためのモダンなReactベースのWebインターフェース

## 📋 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [ソースコード構造](#ソースコード構造)
3. [アプリケーション起動手順](#アプリケーション起動手順)
4. [コーディング規約](#コーディング規約)
5. [フロントエンド画面一覧](#フロントエンド画面一覧)
6. [バックエンドAPIエンドポイント](#バックエンドapiエンドポイント)

## 🏗️ アーキテクチャ概要

### システム全体像

Deep Research UIは**HTTP-firstアーキテクチャ**を採用し、リアルタイム通信にはWebSocketを、フォールバックにはHTTPポーリングを使用するモダンなWebアプリケーションです。

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   React     │  │  TanStack    │  │   WebSocket        │  │
│  │ Components  │  │  Query       │  │   Client           │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Backend (FastAPI + Python)               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   REST      │  │  Semantic    │  │   Memory           │  │
│  │   API       │  │  Kernel      │  │   System           │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 通信プロトコル

- **プライマリ**: HTTP/2 REST API (`/api/v1/*`)
- **セカンダリ**: WebSocket (`ws://localhost:8000/ws`)
- **フォールバック**: HTTPポーリング (3秒間隔)
- **認証**: 現在は開発用にオープン、将来的にJWT実装予定

### 技術スタック

**Frontend:**
- React 19.1.1 with TypeScript
- Vite 7.1.2 (ビルドツール)
- Tailwind CSS 4.1.11 (スタイリング)
- TanStack Query 5.85.0 (データフェッチング)
- Socket.IO Client 4.8.1 (リアルタイム通信)
- Zustand 5.0.7 (状態管理)

**Backend:**
- FastAPI 0.104.1 (Webフレームワーク)
- Python 3.11+
- Microsoft Semantic Kernel (AIオーケストレーション)
- Uvicorn (ASGIサーバー)

## 📁 ソースコード構造

### Frontend構成

```
src/
├── components/           # Reactコンポーネント
│   ├── agents/          # エージェント管理コンポーネント
│   ├── citations/       # 引用管理コンポーネント
│   ├── dashboard/       # ダッシュボードコンポーネント
│   ├── memory/          # メモリ管理コンポーネント
│   ├── search/          # 検索コンポーネント
│   └── shared/          # 共通コンポーネント
├── hooks/               # カスタムフック
│   └── useAgents.ts     # エージェント管理フック
├── services/            # API通信サービス
│   ├── api.ts          # HTTP APIクライアント
│   └── websocket.ts    # WebSocketクライアント
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
```

### Backend構成

```
backend/
├── main.py             # FastAPIアプリケーションエントリーポイント
├── models.py           # Pydanticモデル定義
├── tests/              # バックエンドテスト
│   ├── test_api.py     # APIエンドポイントテスト
│   └── test_models.py  # モデルテスト
└── pytest.ini         # テスト設定
```

### 主要なファイル説明

**Frontend:**
- `App.tsx`: メインアプリケーションコンポーネント、タブナビゲーション
- `useAgents.ts`: エージェントデータ管理のカスタムフック
- `api.ts`: HTTP APIクライアント実装
- `websocket.ts`: WebSocket接続管理

**Backend:**
- `main.py`: FastAPIルーター定義、全エンドポイント実装
- `models.py`: リクエスト/レスポンスのPydanticスキーマ

## 🚀 アプリケーション起動手順

### 前提条件

```bash
# Node.js 18+ と npm が必要
node --version  # v18.0.0以上を確認
npm --version   # 9.0.0以上を確認

# Python 3.11+ と uv が必要
python --version  # Python 3.11以上を確認
uv --version     # インストール済みか確認
```

### バックエンド起動

```bash
# プロジェクトルートディレクトリで実行
cd /workspaces/Deep-Research-Agents

# 依存関係のインストール
uv sync

# バックエンドサーバー起動（推奨方法）
cd deep-research-ui/backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 別の方法: Pythonで直接起動
uv run python main.py

# 本番環境での起動
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

### フロントエンド起動

```bash
# deep-research-uiディレクトリに移動
cd deep-research-ui

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173 でアクセス可能

# 本番ビルド
npm run build
npm run preview  # ビルド結果のプレビュー

# テスト実行
npm run test              # 開発モード
npm run test:ci          # CI用（カバレッジ付き）
npm run test:watch       # ウォッチモード
```

### 完全な起動チェックリスト

1. **環境変数の設定**
   ```bash
   # .envファイルの作成（プロジェクトルート）
   cp .env.example .env
   # 必要な値を設定（Azure OpenAIキー、エンドポイント等）
   ```

2. **バックエンドヘルスチェック**
   ```bash
   curl http://localhost:8000/health
   # 正常ならJSONレスポンスが返る
   ```

3. **フロントエンド接続確認**
   - ブラウザで http://localhost:5173 にアクセス
   - 開発者ツールでコンソールエラーを確認

## 📝 コーディング規約

### 1. コンポーネント設計規約

#### コンポーネントの種類と使い分け

**ページコンポーネント (Page Components)**
- 命名規則: `{Feature}Page.tsx`
- 責務: 特定の機能全体を表現、ルーティング対象
- 例: `AgentDashboard.tsx`, `SearchInterface.tsx`

**機能コンポーネント (Feature Components)**
- 命名規則: `{Feature}{Component}.tsx`
- 責務: 特定の機能の一部を担当
- 例: `AgentCard.tsx`, `SearchResult.tsx`

**共通コンポーネント (Shared Components)**
- 命名規則: `{Purpose}.tsx`
- 責務: 複数の場所で再利用される汎用コンポーネント
- 例: `Header.tsx`, `Button.tsx`

#### コンポーネント実装規約

```typescript
// ✅ Good: 明確なProps定義と型安全性
interface AgentCardProps {
  agent: AgentInfo;
  onStatusChange?: (agentId: string, status: AgentStatus) => void;
  className?: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  onStatusChange, 
  className 
}) => {
  // ロジックはカスタムフックに分離
  const { getStatusColor } = useAgentStatus();
  
  return (
    <div className={cn("p-4 rounded-lg", className)}>
      {/* JSX実装 */}
    </div>
  );
};

// ❌ Bad: any型の使用や不明確なProps
const BadComponent = (props: any) => {
  return <div>{props.something}</div>;
};
```

### 2. カスタムフック規約

#### フックの責務分離

**データフック (Data Hooks)**
- 命名規則: `use{DataType}`
- 責務: データフェッチングと状態管理
- 例: `useAgents()`, `useSearchResults()`

**UIフック (UI Hooks)**
- 命名規則: `use{UIBehavior}`
- 責務: UI状態の管理
- 例: `useDarkMode()`, `useModal()`

**ビジネスロジックフック**
- 命名規則: `use{BusinessLogic}`
- 責務: ビジネスロジックのカプセル化
- 例: `useAgentOrchestration()`

#### フック実装規約

```typescript
// ✅ Good: 明確な戻り値型と再利用可能な設計
export const useAgents = (options?: UseAgentsOptions) => {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await agentAPI.getAgents();
      setAgents(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
  };
};

// 使用例
const { agents, loading, refetch } = useAgents({ pageSize: 20 });
```

### 3. 状態管理規約

#### グローバル状態 vs ローカル状態

**グローバル状態 (Zustand)**
- 使用場面: 複数コンポーネントで共有される状態
- 例: ダークモード、ユーザー設定、リアルタイム更新

**ローカル状態 (React State)**
- 使用場面: コンポーネント内でのみ使用される状態
- 例: フォーム入力値、モーダルの開閉状態

**サーバー状態 (TanStack Query)**
- 使用場面: APIから取得するデータ
- 例: エージェント一覧、検索結果

### 4. スタイリング規約

#### Tailwind CSS使用規約

```typescript
// ✅ Good: 意味のあるクラス名の組み合わせ
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
    {title}
  </h2>
</div>

// ❌ Bad: インラインスタイルや魔法の数値
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
    {title}
  </h2>
</div>
```

#### レスポンシブデザイン

```typescript
// ✅ Good: モバイルファーストアプローチ
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* コンテンツ */}
</div>
```

## 🖥️ フロントエンド画面一覧

### 1. Agent Dashboard（エージェントダッシュボード）

**ファイル**: `components/dashboard/AgentDashboard.tsx`

**役割**: 
- 全エージェントの状態監視と管理
- リアルタイムパフォーマンスメトリクスの表示
- エージェントごとの詳細情報アクセス

**主要機能**:
- エージェントステータス表示（実行中、完了、エラー）
- 統計カード（総エージェント数、アクティブ数、完了タスク数）
- リアルタイム更新フィード
- ページネーション対応のエージェント一覧

**基本的な使い方**:
1. ダッシュボード上部の統計カードで全体状況を把握
2. 各エージェントカードで個別のステータスを確認
3. リアルタイム更新セクションで最新の活動を監視

### 2. Search Interface（検索インターフェース）

**ステータス**: 🚧 開発中

**予定機能**:
- 複数プロバイダーでの統合検索
- 検索結果のフィルタリングとソート
- 検索履歴の管理
- プログレスインジケーター

### 3. Memory Explorer（メモリエクスプローラー）

**ステータス**: 🚧 開発中

**予定機能**:
- セマンティックメモリの閲覧
- メモリエントリの検索とフィルタリング
- メモリ統計の可視化
- メモリの削除と更新機能

### 4. Citation Manager（引用管理）

**ステータス**: 🚧 開発中

**予定機能**:
- 引用文献の一覧表示
- 新規引用の追加と編集
- 引用スタイルの選択
- エクスポート機能（BibTeX, JSON）

## 🔧 バックエンドAPIエンドポイント

### ヘルスチェック

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/health` | GET | システム全体のヘルスステータス |

### エージェント管理

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/v1/agents` | GET | 全エージェントの一覧取得 |
| `/api/v1/agents/{agent_id}` | GET | 特定エージェントの詳細取得 |
| `/api/v1/agents/stats` | GET | エージェント統計情報 |

**使用例**:
```bash
# 全エージェントの取得
curl http://localhost:8000/api/v1/agents

# 特定エージェントの詳細
curl http://localhost:8000/api/v1/agents/lead-researcher

# 統計情報
curl http://localhost:8000/api/v1/agents/stats
```

### 検索機能

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/v1/search` | POST | ドキュメント検索実行 |
| `/api/v1/search/providers` | GET | 利用可能な検索プロバイダー |
| `/api/v1/search/document-types` | GET | 利用可能なドキュメントタイプ |

**使用例**:
```bash
# 検索実行
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "マシンラーニング", "max_results": 10}'

# プロバイダー一覧
curl http://localhost:8000/api/v1/search/providers
```

### メモリ管理

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/v1/memory` | POST | 新規メモリエントリの保存 |
| `/api/v1/memory` | GET | メモリ検索 |
| `/api/v1/memory/stats` | GET | メモリ統計 |
| `/api/v1/memory/{memory_id}` | DELETE | メモリエントリの削除 |

### 引用管理

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/v1/citations` | POST | 新規引用の作成 |
| `/api/v1/citations` | GET | 引用一覧 |
| `/api/v1/citations/{citation_id}` | GET | 特定引用の取得 |
| `/api/v1/citations/{citation_id}` | PUT | 引用の更新 |
| `/api/v1/citations/{citation_id}` | DELETE | 引用の削除 |

### リサーチタスク

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/v1/research` | POST | 新規リサーチタスク作成 |
| `/api/v1/research` | GET | タスク一覧 |
| `/api/v1/research/{task_id}` | GET | タスク詳細 |

### 設定情報

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/v1/config` | GET | システム設定情報 |

## 📊 開発ツールとデバッグ

### フロントエンド開発ツール

```bash
# 開発モードで起動
npm run dev

# TypeScriptチェック
npm run type-check

# ESLint実行
npm run lint

# テストカバレッジ
npm run test:ci
```

### バックエンド開発ツール

```bash
# 自動リロード開発モード
uv run fastapi dev main.py --reload

# データベースマイグレーション（将来的に）
uv run alembic upgrade head

# ログレベル変更
uv run python main.py --log-level debug
```

### トラブルシューティング

**フロントエンドがバックエンドに接続できない場合**:
1. バックエンドが起動しているか確認: `curl http://localhost:8000/health`
2. CORS設定を確認: `backend/main.py`の`allow_origins`
3. ネットワーク接続を確認: ブラウザ開発者ツールのNetworkタブ

**WebSocket接続エラーの場合**:
1. 自動的にHTTPポーリングにフォールバック
2. コンソールログで警告メッセージを確認
3. バックエンドのWebSocketエンドポイントを確認

## 🔄 今後の機能追加ガイドライン

### 新規画面追加手順

1. **設計フェーズ**
   - 画面の目的とユーザーストーリーを定義
   - 必要なAPIエンドポイントを設計
   - ワイヤーフレーム作成

2. **実装フェーズ**
   - コンポーネントファイル作成 (`components/新機能/`)
   - カスタムフック作成 (`hooks/use新機能.ts`)
   - APIサービス拡張 (`services/api.ts`)
   - 型定義追加 (`types/index.ts`)

3. **テストフェーズ**
   - コンポーネントテスト作成
   - 統合テスト実装
   - E2Eテスト追加

### バックエンド拡張手順

1. **モデル定義**: `backend/models.py`にPydanticスキーマ追加
2. **ルーター実装**: `backend/main.py`に新規エンドポイント追加
3. **サービス層**: 必要に応じて新規サービスクラス作成
4. **テスト実装**: `backend/tests/`にテストケース追加

## 📞 サポートと貢献

- **バグ報告**: GitHub Issuesを使用
- **機能要望**: GitHub Discussionsを使用
- **プルリクエスト**: 開発ブランチから作成
- **ドキュメント**: 本README.mdの更新も歓迎

## 🌐 国際化 (i18n) 実装ガイド

### i18nシステム概要

このプロジェクトは **React i18next** を使用した完全な多言語対応システムを実装しています。日本語と英語をサポートし、将来的な言語追加も容易に拡張可能です。

### ディレクトリ構造

```
src/i18n/
├── config.ts              # i18next設定ファイル
├── cache.ts              # 翻訳キャッシュ管理
├── fallback.ts           # フォールバック処理
├── formatters.ts         # カスタムフォーマッター
├── types.ts              # TypeScript型定義
├── unused-keys-detector.ts # 未使用キー検出ツール
├── locales/
│   ├── en/               # 英語翻訳ファイル
│   │   ├── common.json   # 共通UIテキスト
│   │   ├── dashboard.json # ダッシュボード専用
│   │   ├── agents.json   # エージェント管理
│   │   ├── search.json   # 検索機能
│   │   ├── memory.json   # メモリ管理
│   │   ├── citations.json # 引用管理
│   │   ├── forms.json    # フォーム要素
│   │   └── errors.json   # エラーメッセージ
│   └── ja/               # 日本語翻訳ファイル（同様の構造）
└── __tests__/            # テストファイル
```

### 使用方法

#### 1. 新しい翻訳キーの追加

**共通UIテキストの場合**:
```typescript
// src/i18n/locales/ja/common.json
{
  "navigation": {
    "newFeature": "新機能",
    "newFeatureDescription": "最新の機能をご利用ください"
  }
}

// src/i18n/locales/en/common.json
{
  "navigation": {
    "newFeature": "New Feature",
    "newFeatureDescription": "Try our latest features"
  }
}
```

**機能固有のテキストの場合**:
```typescript
// src/i18n/locales/ja/agents.json
{
  "createAgent": {
    "title": "エージェント作成",
    "description": "新しいAIエージェントを設定します",
    "form": {
      "name": "エージェント名",
      "type": "タイプ",
      "submit": "作成"
    }
  }
}
```

#### 2. コンポーネントでの使用

**基本的な使用方法**:
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['common', 'agents']);
  
  return (
    <div>
      <h1>{t('navigation.newFeature')}</h1>
      <p>{t('agents:createAgent.description')}</p>
      <button>{t('common:actions.submit')}</button>
    </div>
  );
};
```

**動的な翻訳**:
```typescript
const { t } = useTranslation();

// 変数を含む翻訳
const message = t('agents:errors.notFound', { agentName: 'TestAgent' });

// 複数形対応
const countText = t('agents:list.count', { count: 5 });
```

#### 3. 日付・数値のフォーマット

```typescript
import { useTranslation } from 'react-i18next';

const FormattedData = ({ date, number }) => {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <p>{t('common:date.created', { date: new Date(date) })}</p>
      <p>{t('common:number.results', { count: number })}</p>
    </div>
  );
};
```

### 開発者向けガイド

#### 新しい言語の追加

1. **言語ディレクトリの作成**:
```bash
mkdir src/i18n/locales/{new-language-code}
```

2. **翻訳ファイルのコピー**:
```bash
# 英語をベースにコピー
cp src/i18n/locales/en/*.json src/i18n/locales/{new-language-code}/
```

3. **設定ファイルの更新**:
```typescript
// src/i18n/config.ts
const supportedLanguages = ['en', 'ja', '{new-language-code}'] as const;
```

#### 翻訳キーの命名規則

**階層的な構造**:
```
{機能}.{コンポーネント}.{要素}.{状態}
例: agents.dashboard.card.status.running
```

**共通パターン**:
- `common:*` - 複数の場所で使用される汎用テキスト
- `{feature}:*` - 特定の機能に限定されるテキスト
- `errors:*` - エラーメッセージ
- `forms:*` - フォーム要素（ラベル、プレースホルダーなど）

#### 翻訳のテスト

```bash
# 未使用キーの検出
node src/i18n/unused-keys-detector.js

# 翻訳の整合性チェック
npm run test:i18n

# カバレッジレポート
npm run test:i18n:coverage
```

#### デバッグとトラブルシューティング

**翻訳が表示されない場合**:
1. キー名が正しいか確認
2. 対応する翻訳ファイルにキーが存在するか確認
3. 言語ファイルが正しくインポートされているか確認
4. ブラウザのコンソールでエラーメッセージを確認

**動的に言語を変更**:
```typescript
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <select onChange={(e) => changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
};
```

### ベストプラクティス

1. **キーの再利用**: 同じ意味を持つテキストは同じキーを使用
2. **文脈を含める**: 曖昧な翻訳を避けるため、文脈情報をキー名に含める
3. **プレースホルダー**: 変数を含む翻訳は、プレースホルダーを明確に定義
4. **一貫性**: 同じ機能内では、用語の使い方を統一

### 翻訳の管理ワークフロー

1. **開発時**: 英語ベースで開発
2. **翻訳時**: 専用のブランチで日本語翻訳を追加
3. **レビュー時**: ネイティブスピーカーによるレビュー
4. **リリース時**: 両言語での完全なテスト

---

*このi18nガイドは継続的に更新されます。最新の情報についてはソースコードを確認してください。*
