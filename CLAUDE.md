# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Quick Start Commands

### Development Setup
```bash
# Install dependencies
uv sync

# Install development dependencies
uv sync --dev

# Run the agent
uv run python main.py --query "Your research question here"

# Run with debug mode
uv run python main.py --debug --query "Your research question here"

# Run tests
uv run pytest

# Format code
uv run black .
uv run isort .

# Type checking
uv run mypy .
```

### Core Commands
- `uv run python main.py --query "question"` - Run research agent
- `uv run python main.py --debug` - Enable debug logging
- `uv run pytest` - Run all tests
- `uv run pytest tests/test_specific.py::test_function` - Run single test
- `uv run black . && uv run isort .` - Format code
- `uv run mypy lib/` - Type checking
- `cd deep-research-ui && npm run dev` - Start React dev server

## 🏗️ Architecture Overview

### System Architecture
This is a **Microsoft Semantic Kernel**-based multi-agent research system with a **HTTP-first React frontend** and **FastAPI backend**. The system uses **MagenticOrchestration** for dynamic agent coordination and provides a comprehensive REST API with OpenAPI documentation.

### Communication Protocols
- **Primary**: HTTP REST API (`/api/v1/*`)
- **Secondary**: WebSocket for optional real-time updates
- **Fallback**: Automatic HTTP polling when WebSocket unavailable

## 📁 Directory Structure

### Core Research System
```
├── main.py                          # Entry point for research agent
├── lib/                            # Core agent system
│   ├── agent_factory.py            # Agent creation factory
│   ├── config.py                   # Configuration management
│   ├── util.py                     # Utility functions
│   ├── memory/                     # Semantic Kernel memory system
│   ├── search/                     # Search providers and plugins
│   ├── orchestration/              # Multi-agent coordination
│   ├── prompts/                    # Agent prompt templates
│   ├── citation/                   # Citation management
│   └── utils/                      # Logging and utilities
├── config/
│   ├── project_config.yaml         # Your project configuration
│   └── project_config_templates.yaml # Configuration template
└── pyproject.toml                  # Dependencies and tooling
```

### React UI System
```
deep-research-ui/
├── backend/
│   ├── main.py                     # FastAPI HTTP server
│   └── models.py                   # Pydantic API models
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── memory/
│   │   ├── citations/
│   │   └── shared/                 # Header, LanguageSwitcher
│   ├── services/
│   │   ├── api.ts                  # HTTP API client
│   │   └── websocket.ts            # WebSocket client
│   ├── hooks/
│   │   └── useAgents.ts            # React Query hooks
│   ├── i18n/                       # Complete i18n system
│   │   ├── locales/                # Translation files (en/ja)
│   │   └── config.ts               # i18next configuration
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── utils/
├── package.json                    # Frontend dependencies
└── playwright-test-i18n.js         # i18n testing utilities
```

## 🔧 Configuration

### Required Environment Variables
Create `.env` from `.env.example`:
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `AZURE_SEARCH_ENDPOINT` - Azure AI Search endpoint
- `AZURE_SEARCH_API_KEY` - Azure AI Search key
- `TAVILY_API_KEY` - Web search API key (optional)

### Project Configuration
Create `config/project_config.yaml` from `config/project_config_templates.yaml`:
- Configure Azure AI Search indexes
- Set company information
- Configure agent parameters
- Enable/disable web search

## 🎯 Core Workflows

### Research Process Flow
1. **Query Processing**: User query → LeadResearcherAgent
2. **Parallel Research**: 3+ internal agents search different document types
3. **Synthesis**: SummarizerAgent consolidates findings
4. **Quality Check**: CredibilityCriticAgent validates sources
5. **Report Generation**: ReportWriterAgent creates final report
6. **Citation**: CitationAgent adds proper references
7. **Translation**: TranslatorAgent handles Japanese/English

### Memory Usage
- **Persistent Storage**: Research context saved across sessions
- **Cross-Agent Sharing**: Memory shared between all agents
- **Document Indexing**: Internal documents indexed for semantic search

## 🧪 Testing

### Test Structure
- Unit tests for individual components
- Integration tests for agent coordination
- Mock external services for testing

### Running Tests
```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/test_search.py

# Run specific test function
uv run pytest tests/test_search.py::test_function_name

# Run with coverage
uv run pytest --cov=lib

# Frontend tests
cd deep-research-ui && npm test

# Frontend tests in watch mode
cd deep-research-ui && npm test -- --watch

# i18n testing
node deep-research-ui/playwright-test-i18n.js
```

## 🔍 Debugging

### Debug Mode
```bash
# Enable debug logging
uv run python main.py --debug --query "test question"

# Or set environment variable
DEBUG_MODE=true uv run python main.py --query "test question"
```

### Key Debug Points
- `lib/util.py:dbg()` - Agent response callback
- `lib/config.py` - Configuration validation
- `lib/search/manager.py` - Search execution
- `lib/memory/manager.py` - Memory operations

## 📊 Performance Optimization

### Temperature Management
- **Conservative (0.2)**: Fact-based analysis
- **Balanced (0.6)**: Comprehensive research
- **Creative (0.9)**: Exploratory analysis

### Agent Scaling
- LeadResearcherAgent creates 3 internal research agents
- Parallel execution across document types
- Configurable agent count via parameters

## 🌐 External Dependencies

### Azure Services
- **Azure OpenAI**: GPT-4.1, o3 models
- **Azure AI Search**: Internal document search
- **Azure Identity**: Authentication

### Third-party Services
- **Tavily**: Web search API
- **Semantic Kernel**: Agent orchestration framework

## 📝 Development Notes

### Code Style
- **Black**: Code formatting (88 char line length)
- **isort**: Import sorting
- **mypy**: Type checking (strict mode)
- **flake8**: Linting

### Lint Commands
```bash
# Run all linting tools
uv run black . && uv run isort . && uv run flake8 lib/ && uv run mypy lib/

# Run individual linting tools
uv run flake8 lib/                          # Core library linting
uv run flake8 deep-research-ui/backend/     # Backend linting
uv run flake8 --fix lib/                    # Auto-fix where possible
```

### Common Patterns
- **Async/Await**: All I/O operations are async
- **Dependency Injection**: Plugins and services injected
- **Configuration-driven**: Behavior controlled via YAML
- **Error Handling**: Graceful degradation for missing services

### Adding New Agents
1. Create agent prompt in `lib/prompts/agents/`
2. Add agent creation in `lib/agent_factory.py`
3. Register with MagenticOrchestration in `main.py`
4. Update configuration if needed

## 🚨 Common Issues

### Configuration Errors
- Missing `.env` file → Copy from `.env.example`
- Invalid Azure credentials → Check endpoint and keys
- Missing search indexes → Verify Azure AI Search setup

### Runtime Issues
- Memory errors → Reduce agent count or document scope
- API timeouts → Increase timeout values in config
- Search failures → Check Azure AI Search health

### Debug Commands
```bash
# Check configuration
uv run python -c "from lib.config import get_config; print(get_config().validate())"

# Test search
uv run python -c "from lib.search.manager import SearchManager; print('Search ready')"

# Test memory
uv run python -c "from lib.memory.manager import MemoryManager; print('Memory ready')"

# Test HTTP API
uv run python -c "import requests; print(requests.get('http://localhost:8000/health').json())"
```
