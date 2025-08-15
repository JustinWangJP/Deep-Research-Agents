# 🔬 Deep Research Agents

企業向けの内部文書検索と詳細調査を自動化するAIエージェントシステム

## 🎯 概要

Deep Research Agentsは、**Semantic Kernel**上に構築された次世代のMultiAgentシステムです。**MagenticOrchestration**を通じて、複数の専門AIエージェントが動的に連携し、企業の内部文書から高品質な調査レポートを自動生成します。Azure AI Search、Semantic Kernel Memoryによる内部文書検索から包括的な信頼性評価まで、企業の調査プロセス全体をインテリジェントに自動化します。

### 🌟 主要機能

- **🤖 Magentic Multi-Agent Orchestration**: Semantic Kernelの最新オーケストレーション技術
- **🔍 高度な内部文書検索**: Azure AI Search + Semantic Kernel Memory統合
- **🌐 Web検索統合**: 外部Web検索フォールバックによる調査能力の強化
- **🧠 コンテキストメモリ管理**: Semantic Kernel Memoryによる永続的な調査コンテキストと知識統合
- **🛡️ AI信頼性評価**: 多層Confidence評価とソース品質管理
- **📝 構造化レポート生成**: 引用管理付きエビデンスベースレポート
- **🌐 多言語インテリジェンス**: 専門用語翻訳システム
- **⚡ 動的品質管理**: リアルタイム品質評価と自己改善ループ


## 🏗️ アーキテクチャ

Deep Research Agentsは、**Microsoft Semantic Kernel**と**MagenticOrchestration**を中心とした次世代MultiAgentシステムです。企業R\&D向けに特化した内部文書検索、分析、レポート生成を完全自動化します。

### 🎭 システム概要図

```
                         ┌─────────────────────────────────┐
                         │    MagenticOrchestration        │
                         │  (StandardMagenticManager)      │
                         │     + R&D Logic Engine          │
                         └──────────┬──────────────────────┘
                                    │ Dynamic Coordination
                                    ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │                     Specialized Agent System                    │
   │                    (Semantic Kernel Agents)                     │
   │                                                                 │
   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
   │  │ LeadResearcher  │ │ Credibility     │ │   Summarizer    │    │
   │  │    Agent        │ │ Critic Agent    │ │     Agent       │    │
   │  │ ┌─────────────┐ │ │ (Source Quality │ │ (Knowledge      │    │
   │  │ │RESEARCHER1  │ │ │  Assessment)    │ │  Synthesis)     │    │
   │  │ │RESEARCHER2  │ │ │                 │ │                 │    │
   │  │ │RESEARCHER3+ │ │ │                 │ │                 │    │
   │  │ └─────────────┘ │ │                 │ │                 │    │
   │  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
   │                                                                 │
   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
   │  │ ReportWriter    │ │ Reflection      │ │  Translator     │    │
   │  │    Agent        │ │ Critic Agent    │ │    Agent        │    │
   │  │ (Confidence +   │ │ (Quality        │ │ (Professional   │    │
   │  │  Citations)     │ │  Validation)    │ │  Translation)   │    │
   │  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
   │                                                                 │
   │  ┌─────────────────┐                                            │
   │  │  Citation       │                                            │
   │  │    Agent        │                                            │
   │  │ (Reference      │                                            │
   │  │  Management)    │                                            │
   │  └─────────────────┘                                            │
   └─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │                     Plugin & Infrastructure Layer               │
   │                                                                 │
   │  ┌─────────────────┐ ┌─────────────────┐                        │
   │  │  Memory        │ │ ModularSearch   │                        │
   │  │   Plugin        │ │    Plugin       │                        │
   │  │ (Research       │ │ (Azure AI       │                        │
   │  │  Context)       │ │  Search)        │                        │
   │  └─────────────────┘ └─────────────────┘                        │
   └─────────────────────────────────────────────────────────────────┘
```


### 🔬 内部文書検索システム

**ModularSearchPlugin**は包括的な検索機能を提供します：

プロジェクト設定（`config/project_config.yaml`）に基づいて動的に構成されるAzure AI Search統合システム。設定ファイルで定義された複数のインデックスにわたる統一インターフェース検索機能を提供します。

検索システムは企業固有の文書構造とインデックス設定に柔軟に適応し、Vector検索、Semantic検索、Full-text検索の組み合わせにより高精度な情報検索を実現します。

#### 🌐 Web検索統合

**強化された調査機能**: システムには追加の情報源およびフォールバック機能としてWeb検索機能が含まれています：

- **プライマリ検索**: Azure AI Searchによる内部文書検索
- **Web検索フォールバック**: 内部ソースが不十分な場合、システムは自動的にWeb検索にフォールバック
- **設定可能な統合**: Web検索は`project_config.yaml`で有効/無効化および設定可能
- **品質保証**: Web検索結果は内部文書と同じ信頼性評価を受ける

<details>
<summary>

### 🎭 専門エージェント構成

</summary>

#### 1. **LeadResearcherAgent** 🎯 *リードリサーチャー*
   - **役割**: 複数の内部サブResearchAgentsのマネージャーおよびコーディネーター
   - **アーキテクチャ**: 3つ以上のサブResearchAgents（RESEARCHER1, RESEARCHER2, RESEARCHER3...）を含み、オーケストレート
   - **特別な機能**: 複数の調査クエリの並列オーケストレーションと同時実行
   - **実装**: `ConcurrentOrchestration`と`ParallelResearchPlugin`による内部エージェント管理
   - **機能**:
     - サブResearchAgents間での調査クエリの分散
     - 複数のエージェントからの結果の集約と統合
     - 品質管理と結果統合
     - ワークロードに基づく動的エージェントスケーリング
   - **メモリ**: 全サブエージェント間で共有されるSemantic Kernel Memory統合によるコンテキスト継続

#### 2. **CredibilityCriticAgent** 🔍 *信頼性評価スペシャリスト*
   - **役割**: 内部ソースの信頼性とカバレッジの科学的評価
   - **評価基準**: ソース品質、情報の一貫性、エビデンス強度
   - **機能**: 追加検索による補強、信頼性スコア計算
   - **出力**: 構造化信頼性レポート + 改善推奨事項

#### 3. **SummarizerAgent** 📋 *知識統合スペシャリスト*
   - **役割**: 大量の内部文書の構造化要約
   - **専門分野**: 企業テーマによる分類、優先順位付け
   - **技術**: 階層要約、キーワード抽出、関連性分析
   - **出力**: 構造化要約 + キーポイント抽出

#### 4. **ReportWriterAgent** ✍️ *レポート生成スペシャリスト*
   - **役割**: 最終レポート作成とConfidenceスコア割り当て
   - **技術**: 構造化文書生成、引用管理、エビデンス実証
   - **評価**: 多軸Confidence評価（ソース品質、一貫性、包括性）
   - **出力**: 意思決定支援レポート + 信頼性指標

#### 5. **ReflectionCriticAgent** 🎯 *品質保証スペシャリスト*
   - **役割**: レポート品質とConfidence評価妥当性の検証
   - **技術**: メタ認知評価、論理一貫性チェック、改善推奨
   - **基準**: 企業R&D品質基準への準拠
   - **出力**: 品質評価レポート + 改善指導

#### 6. **TranslatorAgent** 🌐 *多言語スペシャリスト*
   - **役割**: 専門用語サポート付き高精度翻訳
   - **専門分野**: 技術文書フォーマット保持、専門用語辞書
   - **機能**: 日英双方向翻訳、コンテキスト認識翻訳
   - **品質**: 翻訳品質評価、用語標準化

#### 7. **CitationAgent** 📚 *引用管理スペシャリスト*
   - **役割**: 内部文書引用と参考文献管理
   - **技術**: 自動引用生成、ソーストレーサビリティ
   - **検証**: 引用精度、ソース存在確認
   - **出力**: 構造化引用リスト + メタデータ

</details>

## 🚀 セットアップ

### 前提条件

Deep Research Agentsを使用する前に、以下を準備してください：

- **Python 3.12+**（推奨：3.12.10以降）
- 以下にアクセス可能な**Azure OpenAI**アカウント：
    - GPT-4.1、GPT-4.1-mini、o3または同等モデル
    - テキスト埋め込みモデル（text-embedding-3-small、text-embedding-3-large等）
- 以下が設定された**Azure AI Search**サービス：
    - セマンティック検索設定が有効
    - ベクター検索機能
    - 企業文書を含む既存の検索インデックス
- **Web検索API**（オプション、Web検索機能用）：
    - Tavily APIキー
    - 現在、このリポジトリはTavilyのみをサポートしており、他の検索エンジンを使用したい場合は検索プロバイダーを実装してください


### 📦 インストール

Deep Research Agentsをセットアップするには、以下の手順に従ってください：

#### ステップ1：リポジトリのクローン

```powershell
git clone <repository-url>
cd <directory-name>
```


#### ステップ2：Python仮想環境の作成（必要に応じて）

```powershell
# 仮想環境の作成
python -m venv deepresearchagent

# 仮想環境の有効化
.\deepresearchagent\Scripts\Activate.ps1

# 有効化の確認（仮想環境のパスが表示されるはず）
where python
```


#### ステップ3：Python依存関係のインストール

```powershell
pip install -r requirements.txt
```


#### ステップ4：テンプレートから設定ファイルの作成

**4.1 環境変数ファイルの作成**

```powershell
# テンプレートをコピーして.envファイルを作成
Copy-Item .env.example .env
```

設定に基づいて更新してください

**4.2 プロジェクト設定ファイルの作成**

```powershell
# テンプレートをコピーしてプロジェクト設定を作成
Copy-Item config\project_config_templates.yaml config\project_config.yaml
```

特定の設定でプロジェクト設定を更新してください

**`config/project_config.yaml`で必要な設定：**

- 会社情報（system.company）
- **Azure AI Searchインデックス設定（data_sources.document_types）**
- Web検索設定（data_sources.web_search）
- エージェント動作パラメータ（agents）


#### ステップ5：スクリプトの実行

```powershell
# 調査エージェントの開始
python main.py --query "2025年のAzure OpenAIの最新アップデートについて要約していただけますか？"
```


### 🚀 FastAPIバックエンド起動

HTTP REST APIとWebSocket対応のFastAPIバックエンドを起動します：

```bash
# プロジェクトルートディレクトリで実行
cd /workspaces/Deep-Research-Agents

# 依存関係のインストール
uv sync

# FastAPIバックエンド起動（開発モード）
cd deep-research-ui/backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 本番環境での起動
uv run uvicorn main:app --host 0.0.0.0 --port 8000

# 起動確認
curl http://localhost:8000/health
```

**アクセス可能なエンドポイント：**
- **APIドキュメント**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc  
- **ヘルスチェック**: http://localhost:8000/health

### 🛠️ 設定詳細

#### テンプレートファイル構造

システムでは、コピーしてカスタマイズする必要があるテンプレートファイルを使用します：

```
Deep-Research-Agents/
├── config/
│   ├── project_config_templates.yaml # プロジェクト設定用テンプレート
│   └── project_config.yaml           # カスタマイズした設定（作成してください）
├── .env.example                      # 環境変数用テンプレート
└── .env                              # 環境変数（作成してください）
```
