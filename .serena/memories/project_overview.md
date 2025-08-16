# Deep Research Agents - Project Overview

## Project Purpose
Deep Research Agents is an enterprise-grade AI research system built on Microsoft Semantic Kernel. It orchestrates multiple specialized AI agents to conduct comprehensive research on internal corporate documents, combining Azure AI Search integration with web search fallback capabilities.

## Core Architecture
- **Framework**: Microsoft Semantic Kernel with MagenticOrchestration
- **Language**: Python 3.12+
- **Package Manager**: uv (modern Python package manager)
- **Orchestration**: StandardMagenticManager with dynamic agent coordination

## Key Components
1. **Agent Layer**: 7 specialized agents (LeadResearcher, CredibilityCritic, Summarizer, ReportWriter, ReflectionCritic, Translator, Citation)
2. **Search System**: Azure AI Search + Tavily web search integration
3. **Memory System**: Semantic Kernel Memory for persistent context
4. **Orchestration Layer**: Multi-agent coordination and workflow management

## Technology Stack
- **Core**: semantic-kernel==1.32.1
- **Search**: azure-search-documents==11.5.2, tavily-python==0.7.5
- **AI**: openai==1.86.0, azure-identity==1.23.0
- **Dev Tools**: black, isort, mypy, pytest, pre-commit
- **Configuration**: python-dotenv, PyYAML, pydantic