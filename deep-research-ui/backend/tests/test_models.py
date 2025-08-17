"""
Pydanticモデルのユニットテスト
バリデーション、シリアライゼーション、デフォルト値のテスト
"""

from datetime import datetime

import pytest
from models import (
    AgentInfo,
    AgentStats,
    AgentStatus,
    BaseResponse,
    CitationCreate,
    EntryType,
    HealthResponse,
    MemoryEntryCreate,
    MemoryType,
    SearchProvider,
    SearchQuery,
    SearchResult,
    TemperatureLevel,
)
from pydantic import ValidationError


class TestEnums:
    """列挙型のテスト"""

    def test_agent_status_values(self):
        """AgentStatusの値確認"""
        assert AgentStatus.IDLE.value == "idle"
        assert AgentStatus.RUNNING.value == "running"
        assert AgentStatus.COMPLETED.value == "completed"
        assert AgentStatus.ERROR.value == "error"
        assert AgentStatus.PAUSED.value == "paused"

    def test_search_provider_values(self):
        """SearchProviderの値確認"""
        assert SearchProvider.AZURE.value == "azure"
        assert SearchProvider.TAVILY.value == "tavily"
        assert SearchProvider.INTERNAL.value == "internal"

    def test_memory_type_values(self):
        """MemoryTypeの値確認"""
        assert MemoryType.SESSION.value == "session"
        assert MemoryType.PERSISTENT.value == "persistent"
        assert MemoryType.TEMPORARY.value == "temporary"

    def test_entry_type_values(self):
        """EntryTypeの値確認"""
        assert EntryType.GENERAL.value == "general"
        assert EntryType.RESEARCH.value == "research"
        assert EntryType.CITATION.value == "citation"
        assert EntryType.AGENT_COMMUNICATION.value == "agent_communication"
        assert EntryType.SYSTEM.value == "system"

    def test_temperature_level_values(self):
        """TemperatureLevelの値確認"""
        assert TemperatureLevel.CONSERVATIVE.value == "conservative"
        assert TemperatureLevel.BALANCED.value == "balanced"
        assert TemperatureLevel.CREATIVE.value == "creative"


class TestAgentInfo:
    """AgentInfoモデルのテスト"""

    def test_valid_agent_info(self):
        """有効なAgentInfoの作成"""
        agent = AgentInfo(
            id="test-agent-1",
            name="Test Agent",
            description="A test agent for unit testing",
            status=AgentStatus.IDLE,
            plugins=["search", "memory"],
            temperature=0.6,
        )

        assert agent.id == "test-agent-1"
        assert agent.name == "Test Agent"
        assert agent.status == AgentStatus.IDLE
        assert len(agent.plugins) == 2
        assert agent.temperature == 0.6
        assert agent.created_at is not None

    def test_agent_info_defaults(self):
        """AgentInfoのデフォルト値"""
        agent = AgentInfo(id="test-agent-2", name="Default Agent")

        assert agent.status == AgentStatus.IDLE
        assert agent.description is None
        assert agent.plugins == []
        assert agent.temperature is None
        assert agent.config is None

    def test_agent_info_invalid_temperature(self):
        """無効なtemperature値のテスト"""
        with pytest.raises(ValidationError):
            AgentInfo(id="test-agent-3", name="Invalid Agent", temperature=3.0)  # 0-2の範囲外


class TestSearchQuery:
    """SearchQueryモデルのテスト"""

    def test_valid_search_query(self):
        """有効なSearchQueryの作成"""
        query = SearchQuery(
            query="artificial intelligence",
            document_type="research",
            provider=SearchProvider.AZURE,
            max_results=10,
            include_web=True,
            temperature=TemperatureLevel.BALANCED,
        )

        assert query.query == "artificial intelligence"
        assert query.document_type == "research"
        assert query.provider == SearchProvider.AZURE
        assert query.max_results == 10
        assert query.include_web is True
        assert query.temperature == TemperatureLevel.BALANCED

    def test_search_query_defaults(self):
        """SearchQueryのデフォルト値"""
        query = SearchQuery(query="test query")

        assert query.max_results == 10
        assert query.include_web is True
        assert query.temperature == TemperatureLevel.BALANCED
        assert query.document_type is None
        assert query.provider is None

    def test_search_query_invalid_max_results(self):
        """無効なmax_results値のテスト"""
        with pytest.raises(ValidationError):
            SearchQuery(query="test", max_results=150)  # 100を超える

    def test_search_query_empty_query(self):
        """空のクエリテスト"""
        with pytest.raises(ValidationError):
            SearchQuery(query="")


class TestSearchResult:
    """SearchResultモデルのテスト"""

    def test_valid_search_result(self):
        """有効なSearchResultの作成"""
        result = SearchResult(
            id="result-1",
            content="This is a test search result content",
            title="Test Result",
            source="azure",
            score=0.85,
            metadata={"author": "test", "date": "2024-01-01"},
        )

        assert result.id == "result-1"
        assert result.content == "This is a test search result content"
        assert result.title == "Test Result"
        assert result.source == "azure"
        assert result.score == 0.85
        assert result.metadata["author"] == "test"

    def test_search_result_score_validation(self):
        """スコアのバリデーションテスト"""
        # 有効なスコア
        result1 = SearchResult(id="result-1", content="content", source="azure", score=0.5)
        assert result1.score == 0.5

        # 無効なスコア（0-1の範囲外）
        with pytest.raises(ValidationError):
            SearchResult(id="result-2", content="content", source="azure", score=1.5)


class TestMemoryEntryCreate:
    """MemoryEntryCreateモデルのテスト"""

    def test_valid_memory_entry_create(self):
        """有効なMemoryEntryCreateの作成"""
        entry = MemoryEntryCreate(
            content="This is a test memory entry",
            entry_type=EntryType.RESEARCH,
            source="test-agent",
            memory_type=MemoryType.PERSISTENT,
            tags=["test", "research", "ai"],
        )

        assert entry.content == "This is a test memory entry"
        assert entry.entry_type == EntryType.RESEARCH
        assert entry.source == "test-agent"
        assert entry.memory_type == MemoryType.PERSISTENT
        assert len(entry.tags) == 3

    def test_memory_entry_create_defaults(self):
        """MemoryEntryCreateのデフォルト値"""
        entry = MemoryEntryCreate(content="Test content")

        assert entry.entry_type == EntryType.GENERAL
        assert entry.source == "system"
        assert entry.memory_type == MemoryType.SESSION
        assert entry.tags == []
        assert entry.additional_metadata is None

    def test_memory_entry_create_content_length(self):
        """コンテンツ長のバリデーションテスト"""
        # 有効な長さ
        entry = MemoryEntryCreate(content="a" * 10000)
        assert len(entry.content) == 10000

        # 無効な長さ（空）
        with pytest.raises(ValidationError):
            MemoryEntryCreate(content="")


class TestCitationCreate:
    """CitationCreateモデルのテスト"""

    def test_valid_citation_create(self):
        """有効なCitationCreateの作成"""
        citation = CitationCreate(
            content="This is a test citation content",
            source_title="Test Document",
            source_url="https://example.com/test.pdf",
            case_number="CASE-2024-001",
            page_number=42,
            confidence=0.95,
            tags=["test", "research"],
        )

        assert citation.content == "This is a test citation content"
        assert citation.source_title == "Test Document"
        assert citation.source_url == "https://example.com/test.pdf"
        assert citation.case_number == "CASE-2024-001"
        assert citation.page_number == 42
        assert citation.confidence == 0.95
        assert len(citation.tags) == 2

    def test_citation_create_defaults(self):
        """CitationCreateのデフォルト値"""
        citation = CitationCreate(content="Test citation", source_title="Test Document")

        assert citation.confidence == 1.0
        assert citation.source_url is None
        assert citation.case_number is None
        assert citation.page_number is None
        assert citation.tags == []

    def test_citation_create_invalid_confidence(self):
        """無効なconfidence値のテスト"""
        with pytest.raises(ValidationError):
            CitationCreate(content="Test", source_title="Test", confidence=1.5)  # 0-1の範囲外


class TestResponseModels:
    """レスポンスモデルのテスト"""

    def test_base_response_defaults(self):
        """BaseResponseのデフォルト値"""
        response = BaseResponse()

        assert response.success is True
        assert response.message is None
        assert isinstance(response.timestamp, datetime)

    def test_health_response_creation(self):
        """HealthResponseの作成"""
        health = HealthResponse(
            services={"search": True, "memory": True, "agents": False},
            version="1.0.0",
            uptime=123.45,
        )

        assert health.services["search"] is True
        assert health.services["memory"] is True
        assert health.services["agents"] is False
        assert health.version == "1.0.0"
        assert health.uptime == 123.45

    def test_agent_stats_creation(self):
        """AgentStatsの作成"""
        stats = AgentStats(
            total_agents=10,
            active_agents=5,
            completed_tasks=100,
            failed_tasks=5,
            average_response_time=1.5,
            uptime_percent=99.9,
        )

        assert stats.total_agents == 10
        assert stats.active_agents == 5
        assert stats.completed_tasks == 100
        assert stats.failed_tasks == 5
        assert stats.average_response_time == 1.5
        assert stats.uptime_percent == 99.9

    def test_agent_stats_defaults(self):
        """AgentStatsのデフォルト値"""
        stats = AgentStats()

        assert stats.total_agents == 0
        assert stats.active_agents == 0
        assert stats.completed_tasks == 0
        assert stats.failed_tasks == 0
        assert stats.average_response_time == 0.0
        assert stats.uptime_percent == 100.0


class TestSerialization:
    """シリアライゼーションのテスト"""

    def test_agent_info_serialization(self):
        """AgentInfoのシリアライゼーション"""
        agent = AgentInfo(id="test-serial", name="Serialization Test", status=AgentStatus.RUNNING)

        json_str = agent.model_dump_json()
        assert '"id":"test-serial"' in json_str
        assert '"name":"Serialization Test"' in json_str
        assert '"status":"running"' in json_str

        # デシリアライゼーション
        deserialized = AgentInfo.model_validate_json(json_str)
        assert deserialized.id == "test-serial"
        assert deserialized.name == "Serialization Test"
        assert deserialized.status == AgentStatus.RUNNING

    def test_complex_model_serialization(self):
        """複雑なモデルのシリアライゼーション"""
        search_result = SearchResult(
            id="complex-1",
            content="Complex search result with metadata",
            source="azure",
            score=0.75,
            metadata={"key": "value", "nested": {"data": True}},
        )

        json_str = search_result.model_dump_json()
        assert '"metadata":{"key":"value"' in json_str
        assert '"nested":{"data":true}' in json_str


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
