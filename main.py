"""
Main entry point for Deep Research Agent.
"""
import argparse
import asyncio
import logging
import os
import sys
import uuid
from typing import Optional

from semantic_kernel.agents import (MagenticOrchestration,
                                    StandardMagenticManager)
from semantic_kernel.agents.runtime import InProcessRuntime
from semantic_kernel.utils.logging import setup_logging

from lib.agent_factory import create_agents_with_sk_memory
from lib.config import get_config
from lib.memory import (SharedMemoryPluginSK, SKMemoryPlugin,
                        create_azure_openai_text_embedding)
from lib.prompts.agents.final_answer import FINAL_ANSWER_PROMPT
from lib.prompts.agents.manager import MANAGER_PROMPT
from lib.util import dbg, get_azure_openai_service

# Configure logging with UTF-8 encoding to support emojis
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    encoding='utf-8',
    force=True  # Override any existing configuration
)

# Early suppression of verbose loggers before setup_logging
logging.getLogger("config.project_config").setLevel(logging.WARNING)
logging.getLogger("main_config").setLevel(logging.WARNING)
logging.getLogger("lib.config").setLevel(logging.WARNING)

setup_logging()
logger = logging.getLogger(__name__)


def configure_logging(debug_mode: bool = False) -> None:
    """Configure logging levels based on debug mode."""
    if debug_mode or os.getenv("DEBUG", "").lower() in ("true", "1", "yes"):
        # Enable detailed debugging
        logging.getLogger("kernel").setLevel(logging.DEBUG)
        logging.getLogger("semantic_kernel").setLevel(logging.DEBUG)
        logging.getLogger("lib.agent_factory").setLevel(logging.DEBUG)
        logging.getLogger("lib.azure_search_plugin").setLevel(logging.DEBUG)
        logging.getLogger("lib.sk_memory_plugin").setLevel(logging.DEBUG)
        logger.info("🐛 DEBUG mode enabled - detailed logging active")
    else:
        # Normal logging levels - reduce verbosity
        logging.getLogger("kernel").setLevel(logging.WARNING)
        logging.getLogger("in_process_runtime.events").setLevel(logging.WARNING)
        logging.getLogger("in_process_runtime").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("semantic_kernel").setLevel(logging.WARNING)
        logging.getLogger("openai").setLevel(logging.WARNING)
        logging.getLogger("semantic_kernel.functions.kernel_function").setLevel(logging.WARNING)
        logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(logging.WARNING)
        
        # Aggressively reduce config-related logging
        logging.getLogger("config").setLevel(logging.ERROR)
        logging.getLogger("config.project_config").setLevel(logging.ERROR)
        logging.getLogger("main_config").setLevel(logging.ERROR)
        logging.getLogger("lib.config").setLevel(logging.ERROR)
        logging.getLogger("lib.config.project_config").setLevel(logging.ERROR)
        
        # Reduce search and memory initialization logs
        logging.getLogger("lib.search").setLevel(logging.WARNING)
        logging.getLogger("lib.search.providers").setLevel(logging.WARNING)
        logging.getLogger("lib.search.manager").setLevel(logging.WARNING)
        logging.getLogger("lib.search.plugin").setLevel(logging.WARNING)
        logging.getLogger("lib.memory.utils").setLevel(logging.WARNING)
        logging.getLogger("lib.memory.manager").setLevel(logging.WARNING)
        logging.getLogger("lib.memory.manager.MemoryManager").setLevel(logging.WARNING)
        
        # Reduce agent creation logs but keep important ones
        logging.getLogger("lib.orchestration").setLevel(logging.WARNING)
        logging.getLogger("lib.orchestration.lead_researcher_agent").setLevel(logging.WARNING)
        logging.getLogger("lib.orchestration.parallel_research_plugin").setLevel(logging.INFO)
        logging.getLogger("lib.util").setLevel(logging.WARNING)
        
        # Keep only essential agent_factory logs - summary only
        logging.getLogger("lib.agent_factory").setLevel(logging.WARNING)


class DeepResearchAgent:
    """Main orchestrator for the Deep Research Agent system using Semantic Kernel memory."""

    def __init__(
            self,
            session_id: Optional[str] = None,
            project_id: Optional[str] = None):
        """Initialize the research agent system with SK memory capabilities."""
        self.session_id = session_id or str(uuid.uuid4())
        self.project_id = project_id or f"project_{self.session_id[:8]}"
        self.is_new_session = session_id is None  # Track if this is a new session
        self.orchestration: Optional[MagenticOrchestration] = None
        self.runtime: Optional[InProcessRuntime] = None
        self.sk_memory_plugin: Optional[SKMemoryPlugin] = None
        self.shared_memory_plugin: Optional[SharedMemoryPluginSK] = None

    async def initialize(self) -> None:
        """Initialize the agent orchestration system with SK memory."""
        try:
            logger.info(f"🚀 Initializing Deep Research Agent (Session: {self.session_id[:8]}...)")

            # Get config instance
            config = get_config()

            # Create embedding generator for Azure OpenAI
            embedding_generator = create_azure_openai_text_embedding(
                api_key=config.azure_openai_api_key,
                endpoint=config.azure_openai_endpoint,
                api_version=config.azure_openai_api_version,
                deployment_name=config.azure_openai_embedding_deployment,
                service_id="azure_embedding"
            )

            # Initialize SK memory plugin
            self.sk_memory_plugin = SKMemoryPlugin(
                embedding_generator=embedding_generator,
                session_id=self.session_id,
                project_id=self.project_id
            )
            await self.sk_memory_plugin.initialize()

            # Create backward-compatible wrapper
            self.shared_memory_plugin = SharedMemoryPluginSK(
                self.sk_memory_plugin)

            logger.info("💾 SK Memory system initialized")

            # Store initial research session in memory
            await self.sk_memory_plugin.store_memory(
                content=f"Research session started: {self.session_id}",
                entry_type="session",
                source="system",
                memory_type="short")

            # Create all agents with SK memory support
            logger.info("🤖 Creating 7 research agents...")
            agents_dict = await create_agents_with_sk_memory(
                session_id=self.session_id,
                project_id=self.project_id
            )
            logger.info("✅ Research agents created successfully")

            # Extract agent list for orchestration
            members = list(agents_dict.values())

            # Create orchestration with manager
            logger.info("🎯 Setting up orchestration manager...")
            self.orchestration = MagenticOrchestration(
                members=members,
                manager=StandardMagenticManager(
                    chat_completion_service=get_azure_openai_service(
                        config.get_model_config("o3")),
                    system_prompt=MANAGER_PROMPT,
                    final_answer_prompt=FINAL_ANSWER_PROMPT,
                ),
                agent_response_callback=dbg)

            # Initialize runtime
            self.runtime = InProcessRuntime()
            self.runtime.start()

            logger.info("✅ Deep Research Agent initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Deep Research Agent: {e}")
            raise

    async def research(self, query: str) -> str:
        """
        Execute research task and return final report.

        Args:
            query: Research query/task        Returns:
            str: Final research report
        """
        if not self.orchestration or not self.runtime:
            raise RuntimeError(
                "Agent system not initialized. Call initialize() first.")

        try:
            logger.info(f"🔍 Starting research: {query[:50]}{'...' if len(query) > 50 else ''}")
            
            # Use SK memory for context check (simple approach)
            if self.sk_memory_plugin:
                # Store research query
                query_id = await self.sk_memory_plugin.store_memory(
                    content=f"Research Query: {query}",
                    source="DeepResearchAgent",
                    entry_type="query"
                )
                logger.info(f"💾 Query stored (ID: {query_id[:8]}...)")
            else:
                logger.warning("⚠️  SK Memory not available - continuing without memory context")

            # Execute research orchestration (agents can access memory independently)
            logger.info("🤖 Starting multi-agent orchestration...")
            result_proxy = await self.orchestration.invoke(task=query, runtime=self.runtime)

            # Handle different result types from Semantic Kernel
            result = await result_proxy.get()

            # Extract content from ChatMessageContent object
            if hasattr(result, 'content'):
                final_report = str(result.content)
            elif hasattr(result, 'value'):
                final_report = str(result.value)
            else:
                final_report = str(result)

            print("Final report generated by orchestration:")
            print(final_report)

            # Optional: Store final report in SK memory (agents can also store
            # their results)
            if self.sk_memory_plugin and final_report:
                # Safely slice the string content
                report_summary = final_report[:1000] + \
                    "..." if len(final_report) > 1000 else final_report
                await self.sk_memory_plugin.store_memory(
                    content=f"Final Report: {report_summary}",
                    source="DeepResearchAgent",
                    entry_type="report",
                    memory_type="medium"
                )
                logger.info("💾 Research report stored in memory")

            logger.info("✅ Research task completed successfully")
            return final_report

        except Exception as e:
            logger.error(f"❌ Research task failed: {e}")
            raise

    async def cleanup(self) -> None:
        """Clean up resources."""
        try:
            # SK Memory Plugin automatically persists data, no manual save
            # needed
            if self.sk_memory_plugin:
                logger.info("SK Memory cleanup completed (auto-persist)")

            if self.runtime:
                await self.runtime.stop_when_idle()
                logger.info("Runtime stopped successfully")
        except Exception as e:
            logger.warning(f"Error during cleanup: {e}")


async def main() -> None:
    """Main entry point."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Deep Research Agent")
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging")
    parser.add_argument("--query", type=str, help="Research query to execute")
    args = parser.parse_args()

    # Configure logging based on arguments
    configure_logging(debug_mode=args.debug)

    try:
        # Validate configuration
        config = get_config()
        logger.info("⚙️  Configuration validated")

        # Initialize research agent
        agent = DeepResearchAgent()
        await agent.initialize()

        # Define research task for internal R&D document analysis
        user_task = args.query or "What is Azure OpenAI?"

        # Execute research
        logger.info("=" * 60)
        logger.info("🔬 DEEP RESEARCH AGENT")
        logger.info("=" * 60)

        final_report = await agent.research(user_task)
        
        # Display results
        print("\n" + "=" * 60)
        print("📋 FINAL RESEARCH REPORT")
        print("=" * 60)
        print(final_report)
        print("=" * 60)

        logger.info("🎉 Research process completed successfully")

    except KeyboardInterrupt:
        logger.info("Process interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
    finally:
        if 'agent' in locals():
            await agent.cleanup()


if __name__ == "__main__":
    try:
        # Configure logging FIRST before importing anything else that might log
        configure_logging(
            debug_mode=os.getenv(
                "DEBUG_MODE",
                "").lower() in (
                "true",
                "1",
                "yes"))

        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Deep Research Agent stopped by user")
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)
