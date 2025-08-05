# Code Style and Conventions

## Code Formatting
- **Formatter**: Black with 88 character line length
- **Import Sorting**: isort with black profile
- **Type Checking**: mypy with strict mode (`disallow_untyped_defs=true`)
- **Linting**: flake8

## Naming Conventions
- **Variables**: snake_case (e.g., `memory_plugin`, `search_results`)
- **Functions**: snake_case with descriptive names (e.g., `create_agents_with_memory`)
- **Classes**: PascalCase (e.g., `DeepResearchAgent`, `MemoryManager`)
- **Constants**: UPPER_SNAKE_CASE for prompts (e.g., `CREDIBILITY_CRITIC_PROMPT`)

## Type Hints
- **Required**: All functions must have type hints
- **Async Functions**: All I/O operations use async/await
- **Return Types**: Explicit return type annotations
- **Optional Types**: Use `Optional[T]` from typing module

## Documentation Style
- **Docstrings**: Google style with Args/Returns sections
- **Line Length**: 88 characters (aligned with Black)
- **Comments**: English for technical explanations, Japanese in prompts/configs
- **Logging**: Structured logging with colored output and emoji indicators

## File Structure
- **Entry Point**: `main.py` with DeepResearchAgent class
- **Library Code**: `lib/` directory with modular components
- **Configuration**: `config/` directory with YAML templates
- **Prompts**: `lib/prompts/` directory with agent-specific prompts

## Error Handling
- **Graceful Degradation**: Missing services don't crash the system
- **Structured Logging**: Different log levels with colored output
- **Exception Handling**: Try/catch blocks with informative error messages
- **Validation**: Runtime configuration validation