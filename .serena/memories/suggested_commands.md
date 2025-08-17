# Essential Commands for Deep Research Agents

## Development Setup
```bash
# Install dependencies
uv sync

# Install development dependencies
uv sync --dev

# Create configuration files
cp .env.example .env
cp config/project_config_templates.yaml config/project_config.yaml
```

## Running the System
```bash
# Basic research query
uv run python main.py --query "Your research question here"

# Debug mode with detailed logging
uv run python main.py --debug --query "Your research question here"

# Enable debug via environment variable
DEBUG_MODE=true uv run python main.py --query "test question"
```

## Code Quality
```bash
# Format code
uv run black .

# Sort imports
uv run isort .

# Type checking
uv run mypy lib/

# Run all quality checks
uv run black . && uv run isort . && uv run mypy lib/
```

## Testing
```bash
# Run all tests (if tests are added)
uv run pytest

# Run specific test file
uv run pytest tests/test_search.py

# Run with coverage
uv run pytest --cov=lib
```

## Environment Management
```bash
# Check configuration
uv run python -c "from lib.config import get_config; print(get_config().validate())"

# Test search functionality
uv run python -c "from lib.search import ModularSearchPlugin; print('Search ready')"

# Test memory system
uv run python -c "from lib.memory import MemoryManager; print('Memory ready')"
```

## System Commands
```bash
# List project files
find . -path "./.venv" -prune -o -type f -print | head -20

# Check git status
git status

# View logs
tail -f deep_research_agent.log
```
