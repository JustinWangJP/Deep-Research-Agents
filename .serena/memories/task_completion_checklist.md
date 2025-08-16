# Task Completion Checklist

## After Completing Any Code Changes

### Code Quality Checks
- [ ] **Code Formatting**: Run `uv run black .` to format all Python files
- [ ] **Import Sorting**: Run `uv run isort .` to organize imports
- [ ] **Type Checking**: Run `uv run mypy lib/` to verify type annotations
- [ ] **Linting**: Run `uv run flake8` (if flake8 config exists)

### Testing
- [ ] **Unit Tests**: Run `uv run pytest` (when tests are available)
- [ ] **Integration Tests**: Verify system works end-to-end
- [ ] **Error Handling**: Test edge cases and error conditions

### Configuration Validation
- [ ] **Environment Variables**: Ensure `.env` file has required variables
- [ ] **Project Config**: Verify `config/project_config.yaml` is properly formatted
- [ ] **Azure Credentials**: Test Azure OpenAI and Azure Search connectivity

### System Testing
- [ ] **Basic Functionality**: Run basic research query to test system
- [ ] **Memory System**: Verify Semantic Kernel Memory is working
- [ ] **Search Integration**: Test Azure AI Search and web search fallback
- [ ] **Agent Orchestration**: Ensure all 7 agents are functioning correctly

### Final Verification
- [ ] **No Breaking Changes**: Ensure existing functionality still works
- [ ] **Error Messages**: Verify helpful error messages for common issues
- [ ] **Documentation**: Update relevant documentation if needed
- [ ] **Commit Message**: Write clear commit message describing changes

## Common Debug Commands
```bash
# Check system health
uv run python -c "from lib.config import get_config; print('Config valid:', get_config().validate())"

# Test memory system
uv run python -c "from lib.memory.manager import MemoryManager; print('Memory system ready')"

# Test search functionality
uv run python -c "from lib.search.manager import SearchManager; print('Search system ready')"

# Quick integration test
uv run python main.py --query "Test system functionality"
```