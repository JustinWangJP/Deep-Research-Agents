"""
ディープリサーチエージェントのメインエントリーポイント。
"""

import argparse
import asyncio
import logging
import os
import sys
import uuid
from typing import Optional

from semantic_kernel.agents import MagenticOrchestration, StandardMagenticManager
from semantic_kernel.agents.runtime import InProcessRuntime
from semantic_kernel.connectors.ai.open_ai import AzureChatPromptExecutionSettings
from semantic_kernel.utils.logging import setup_logging


class ColoredFormatter(logging.Formatter):
    """ログレベルに基づいてログメッセージに色を追加するカスタムフォーマッター。"""

    # ANSIカラーコード
    COLORS = {
        "DEBUG": "\033[36m",  # シアン
        "INFO": "\033[32m",  # 緑
        "WARNING": "\033[33m",  # 黄色
        "ERROR": "\033[31m",  # 赤
        "CRITICAL": "\033[35m",  # マゼンタ
        "RESET": "\033[0m",  # リセット
    }

    def format(self, record):
        """色付きでログレコードをフォーマットする。"""
        # このログレベルの色を取得
        color = self.COLORS.get(record.levelname, self.COLORS["RESET"])
        reset = self.COLORS["RESET"]

        # レベル名に色を適用
        original_levelname = record.levelname
        record.levelname = f"{color}{record.levelname}{reset}"

        # メッセージをフォーマット
        formatted_message = super().format(record)

        # 元のレベル名を復元
        record.levelname = original_levelname

        return formatted_message


from lib.agent_factory import create_agents_with_memory
from lib.config import get_config
from lib.memory import MemoryManager, MemoryPlugin, SharedMemoryPluginSK, create_azure_openai_text_embedding
from lib.prompts.agents.final_answer import FINAL_ANSWER_PROMPT
from lib.prompts.agents.manager import MANAGER_PROMPT
from lib.util import dbg, get_azure_openai_service


# UTF-8エンコーディングで絵文字と色をサポートするようにログを設定
def setup_colored_logging():
    """色付きログ設定を行う。"""
    # 色付きフォーマッターを作成
    colored_formatter = ColoredFormatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # ルートロガーを設定
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # 既存のハンドラーを削除して重複を回避
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # 色付きフォーマッターを持つコンソールハンドラーを作成
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(colored_formatter)
    console_handler.setLevel(logging.INFO)

    # ルートロガーにハンドラーを追加
    root_logger.addHandler(console_handler)


# Setup colored logging
setup_colored_logging()

# setup_loggingの前に冗長なロガーを抑制
logging.getLogger("config.project_config").setLevel(logging.WARNING)
logging.getLogger("main_config").setLevel(logging.WARNING)
logging.getLogger("lib.config").setLevel(logging.WARNING)

setup_logging()
logger = logging.getLogger(__name__)


def configure_logging(debug_mode: bool = False) -> None:
    """デバッグモードに基づいてログレベルを設定する。"""
    if debug_mode or os.getenv("DEBUG", "").lower() in ("true", "1", "yes"):
        # 詳細なデバッグを有効化
        logging.getLogger().setLevel(logging.DEBUG)
        logging.getLogger("kernel").setLevel(logging.DEBUG)
        logging.getLogger("semantic_kernel").setLevel(logging.DEBUG)
        logging.getLogger("lib").setLevel(logging.DEBUG)
        # デバッグモード用にコンソールハンドラーのレベルを更新
        for handler in logging.getLogger().handlers:
            if isinstance(handler, logging.StreamHandler):
                handler.setLevel(logging.DEBUG)

        logger.info("🐛 DEBUG mode enabled - detailed logging active")
    else:
        # 通常のログレベル - 冗長性を削減
        logging.getLogger("kernel").setLevel(logging.WARNING)
        logging.getLogger("in_process_runtime.events").setLevel(logging.WARNING)
        logging.getLogger("in_process_runtime").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("semantic_kernel").setLevel(logging.WARNING)
        logging.getLogger("openai").setLevel(logging.WARNING)
        logging.getLogger("semantic_kernel.functions.kernel_function").setLevel(logging.WARNING)
        logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(logging.WARNING)

        # 設定関連のログを積極的に削減
        logging.getLogger("config").setLevel(logging.ERROR)
        logging.getLogger("config.project_config").setLevel(logging.ERROR)
        logging.getLogger("main_config").setLevel(logging.ERROR)
        logging.getLogger("lib.config").setLevel(logging.ERROR)
        logging.getLogger("lib.config.project_config").setLevel(logging.ERROR)

        # 検索とメモリ初期化のログを削減
        logging.getLogger("lib.search").setLevel(logging.WARNING)
        logging.getLogger("lib.search.providers").setLevel(logging.WARNING)
        logging.getLogger("lib.search.manager").setLevel(logging.WARNING)
        logging.getLogger("lib.search.plugin").setLevel(logging.WARNING)
        logging.getLogger("lib.memory.utils").setLevel(logging.WARNING)
        logging.getLogger("lib.memory.manager").setLevel(logging.WARNING)
        logging.getLogger("lib.memory.manager.MemoryManager").setLevel(logging.WARNING)

        # エージェント作成のログを削減し、重要なものだけを保持
        logging.getLogger("lib.orchestration").setLevel(logging.WARNING)
        logging.getLogger("lib.orchestration.lead_researcher_agent").setLevel(logging.WARNING)
        logging.getLogger("lib.orchestration.parallel_research_plugin").setLevel(logging.INFO)
        logging.getLogger("lib.util").setLevel(logging.WARNING)

        # 本質的なagent_factoryログのみ保持 - サマリーのみ
        logging.getLogger("lib.agent_factory").setLevel(logging.WARNING)


class DeepResearchAgent:
    """Semantic Kernelメモリを使用したディープリサーチエージェントシステムのメインオーケストレーター。"""

    def __init__(self, session_id: str | None = None, project_id: str | None = None):
        """メモリ機能を持つリサーチエージェントシステムを初期化する。"""
        self.session_id = session_id or str(uuid.uuid4())
        self.project_id = project_id or f"project_{self.session_id[:8]}"
        self.is_new_session = session_id is None  # 新しいセッションかどうかを追跡
        self.orchestration: MagenticOrchestration | None = None
        self.runtime: InProcessRuntime | None = None
        self.memory_plugin: MemoryPlugin | None = None
        self.shared_memory_plugin: SharedMemoryPluginSK | None = None

    async def initialize(self) -> None:
        """メモリを持つエージェントオーケストレーションシステムを初期化する。"""
        try:
            logger.info(f"🚀 Initializing Deep Research Agent (Session: {self.session_id[:8]}...)")

            # 設定インスタンスを取得
            config = get_config()

            # Azure OpenAI用のエンベディングジェネレーターを作成
            embedding_generator = create_azure_openai_text_embedding(
                api_key=config.azure_openai_api_key,
                endpoint=config.azure_openai_endpoint,
                api_version=config.azure_openai_api_version,
                deployment_name=config.azure_openai_embedding_deployment,
                service_id="azure_embedding",
            )

            # メモリプラグインを初期化
            memory_manager = MemoryManager(
                embedding_generator=embedding_generator,
                session_id=self.session_id,
                project_id=self.project_id,
            )
            await memory_manager.initialize()
            self.memory_plugin = MemoryPlugin(memory_manager)
            logger.info("💾 Memory system initialized")
            # メモリサポート付きの全エージェントを作成
            reasoning_high_settings = AzureChatPromptExecutionSettings(reasoning_effort="high")
            logger.info("🤖 Creating 7 research agents...")
            agents_dict = await create_agents_with_memory(memory_plugin=self.memory_plugin)
            logger.info("✅ Research agents created successfully")

            # オーケストレーション用のエージェントリストを抽出
            members = list(agents_dict.values())

            # マネージャー付きでオーケストレーションを作成
            logger.info("🎯 Setting up orchestration manager...")
            self.orchestration = MagenticOrchestration(
                members=members,
                manager=StandardMagenticManager(
                    chat_completion_service=get_azure_openai_service(config.get_model_config("o3")),
                    system_prompt=MANAGER_PROMPT,
                    final_answer_prompt=FINAL_ANSWER_PROMPT,
                    prompt_execution_settings=reasoning_high_settings,
                ),
                agent_response_callback=dbg,
            )

            # ランタイムを初期化
            self.runtime = InProcessRuntime()
            self.runtime.start()

            logger.info("✅ Deep Research Agent initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Deep Research Agent: {e}")
            raise

    async def research(self, query: str) -> str:
        """
        リサーチタスクを実行し、最終レポートを返す。

        引数:
            query: リサーチクエリ/タスク        戻り値:
            str: 最終リサーチレポート
        """
        if not self.orchestration or not self.runtime:
            raise RuntimeError("エージェントシステムが初期化されていません。initialize()を先に呼び出してください。")

        try:
            logger.info(f"🔍 リサーチ開始: {query[:50]}{'...' if len(query) > 50 else ''}")
            # リサーチオーケストレーションを実行（エージェントはメモリに独立してアクセス可能）
            logger.info("🤖 マルチエージェントオーケストレーションを開始...")
            result_proxy = await self.orchestration.invoke(task=query, runtime=self.runtime)

            # Semantic Kernelからの異なる結果タイプを処理
            result = await result_proxy.get()

            # ChatMessageContentオブジェクトからコンテンツを抽出
            if hasattr(result, "content"):
                final_report = str(result.content)
            elif hasattr(result, "value"):
                final_report = str(result.value)
            else:
                final_report = str(result)

            print("オーケストレーションによって生成された最終レポート:")
            print(final_report)

            logger.info("✅ リサーチタスクが正常に完了しました")
            return final_report

        except Exception as e:
            logger.error(f"❌ リサーチタスクが失敗しました: {e}")
            raise

    async def cleanup(self) -> None:
        """リソースをクリーンアップする。"""
        try:
            # メモリプラグインはデータを自動的に永続化し、手動での保存は不要
            if self.memory_plugin:
                logger.info("メモリクリーンアップが完了しました（自動永続化）")

            if self.runtime:
                await self.runtime.stop_when_idle()
                logger.info("ランタイムが正常に停止しました")
        except Exception as e:
            logger.warning(f"クリーンアップ中にエラーが発生しました: {e}")


async def main() -> None:
    """メインエントリーポイント。"""
    # コマンドライン引数を解析
    parser = argparse.ArgumentParser(description="ディープリサーチエージェント")
    parser.add_argument("--debug", action="store_true", help="デバッグログを有効化")
    parser.add_argument("--query", type=str, help="実行するリサーチクエリ")
    args = parser.parse_args()

    # 引数に基づいてログを設定
    configure_logging(debug_mode=args.debug)

    try:
        # 設定を検証
        config = get_config()
        logger.info("⚙️  設定が検証されました")

        # リサーチエージェントを初期化
        agent = DeepResearchAgent()
        await agent.initialize()

        # 内部R&D文書分析用のリサーチタスクを定義
        user_task = args.query or "Azure OpenAIとは何ですか？"

        # リサーチを実行
        logger.info("=" * 60)
        logger.info("🔬 ディープリサーチエージェント")
        logger.info("=" * 60)

        final_report = await agent.research(user_task)

        # 結果を表示
        print("\n" + "=" * 60)
        print("📋 最終リサーチレポート")
        print("=" * 60)
        print(final_report)
        print("=" * 60)

        logger.info("🎉 リサーチプロセスが正常に完了しました")

    except KeyboardInterrupt:
        logger.info("ユーザーによってプロセスが中断されました")
        sys.exit(0)
    except Exception as e:
        logger.error(f"致命的なエラー: {e}")
        sys.exit(1)
    finally:
        if "agent" in locals():
            await agent.cleanup()


if __name__ == "__main__":
    try:
        # 他のものがログを出力する前に最初に色付きログを設定
        setup_colored_logging()
        configure_logging(debug_mode=os.getenv("DEBUG_MODE", "").lower() in ("true", "1", "yes"))

        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 ディープリサーチエージェントがユーザーによって停止されました")
    except Exception as e:
        print(f"❌ 致命的なエラー: {e}")
        sys.exit(1)
