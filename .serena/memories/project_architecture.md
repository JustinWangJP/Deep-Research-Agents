# Deep Research Agents - Architecture Overview

## System Architecture

### 1. Entry Point (`main.py`)
- **DeepResearchAgent**: Main orchestrator class
- **ColoredFormatter**: Custom logging with ANSI colors
- **Async Main**: Asyncio-based execution with proper error handling

### 2. Agent Factory (`lib/agent_factory.py`)
- **create_agents_with_memory()**: Creates 7 specialized agents with memory support
- **Agent Types**:
  - LeadResearcherAgent: Orchestrates 3+ internal research agents
  - CredibilityCriticAgent: Source quality assessment
  - SummarizerAgent: Knowledge synthesis
  - ReportWriterAgent: Final report generation
  - ReflectionCriticAgent: Quality validation
  - TranslatorAgent: Japanese-English translation
  - CitationAgent: Reference management

### 3. Configuration System (`lib/config.py`)
- **Config Class**: Centralized configuration management
- **YAML Support**: Project configuration via YAML files
- **Environment Variables**: Secure credential management
- **Validation**: Runtime configuration validation

### 4. Memory System (`lib/memory/`)
- **MemoryManager**: Semantic Kernel Memory integration
- **MemoryPlugin**: SK plugin for memory operations
- **SharedMemoryPluginSK**: Cross-agent memory sharing
- **Persistent Storage**: Research context saved across sessions

### 5. Search System (`lib/search/`)
- **ModularSearchPlugin**: Azure AI Search integration
- **WebSearchProvider**: Tavily API for web search fallback
- **SearchManager**: Unified search interface
- **Multiple Indexes**: Support for different document types

### 6. Orchestration (`lib/orchestration/`)
- **LeadResearcherAgent**: Internal multi-agent coordination
- **ParallelResearchPlugin**: Concurrent research execution
- **ResearchExecutor**: Research workflow management
- **TemperatureManager**: LLM temperature variation strategies

### 7. Citation System (`lib/citation/`)
- **CitationAgent**: Automated citation management
- **Formatters**: Multiple citation formats (APA, MLA, etc.)
- **Validators**: Source validation and verification
- **Reference Tracking**: Automatic source tracking

### 8. Prompt Management (`lib/prompts/`)
- **Agent Prompts**: Specialized prompts for each agent type
- **System Prompts**: Manager and orchestration prompts
- **Multi-language**: Japanese and English prompt support
- **Template Engine**: Jinja2-based prompt templates

## Data Flow
1. **User Query** → DeepResearchAgent
2. **Query Processing** → LeadResearcherAgent creates 3+ internal research agents
3. **Parallel Research** → Multiple agents search different document types
4. **Knowledge Synthesis** → SummarizerAgent consolidates findings
5. **Quality Assessment** → CredibilityCriticAgent validates sources
6. **Report Generation** → ReportWriterAgent creates final report
7. **Citation** → CitationAgent adds proper references
8. **Translation** → TranslatorAgent handles Japanese/English

## External Dependencies
- **Azure OpenAI**: GPT-4.1, o3 models
- **Azure AI Search**: Internal document search
- **Tavily API**: Web search fallback
- **Semantic Kernel**: Agent orchestration framework