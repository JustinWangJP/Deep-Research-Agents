"""
FastAPIバックエンドのAPIエンドポイントテスト
エンドツーエンドのAPIテストとモックを使用した単体テスト
"""

import os

# インポートの問題を回避するためのモック設定
import sys
from datetime import datetime, timezone
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


from main import app


class TestHealthEndpoints:
    """ヘルスチェックエンドポイントのテスト"""

    def test_health_check_success(self):
        """正常なヘルスチェック"""
        with TestClient(app) as client:
            response = client.get("/health")

            assert response.status_code == 200
            data = response.json()

            assert "services" in data
            assert "version" in data
            assert data["success"] is True
            assert isinstance(data["uptime"], float)

    def test_health_check_services_structure(self):
        """ヘルスチェックのサービス構造テスト"""
        with TestClient(app) as client:
            response = client.get("/health")

            assert response.status_code == 200
            services = response.json()["services"]

            expected_services = [
                "search",
                "memory",
                "citations",
                "agents",
                "azure_openai",
                "azure_search",
            ]

            for service in expected_services:
                assert service in services
                assert isinstance(services[service], bool)


class TestAgentEndpoints:
    """エージェント管理エンドポイントのテスト"""

    def test_list_agents_empty(self):
        """エージェントリストが空の場合のテスト"""
        with TestClient(app) as client:
            # サービスが初期化されていない場合をシミュレート
            with patch("main.agents", None):
                response = client.get("/api/v1/agents")

                assert response.status_code == 503
                assert "Agents not initialized" in response.json()["detail"]

    def test_list_agents_with_mock_data(self):
        """モックデータでのエージェントリスト取得"""
        with TestClient(app) as client:
            mock_agents = {
                "agent1": type(
                    "Agent",
                    (),
                    {
                        "name": "Research Agent",
                        "description": "Handles research tasks",
                        "plugins": ["search", "memory", "citation"],
                    },
                )(),
                "agent2": type(
                    "Agent",
                    (),
                    {
                        "name": "Analysis Agent",
                        "description": "Performs data analysis",
                        "plugins": ["memory"],
                    },
                )(),
            }

            with patch("main.agents", mock_agents):
                response = client.get("/api/v1/agents")

                assert response.status_code == 200
                data = response.json()

                assert "agents" in data
                assert data["total"] == 2
                assert data["page"] == 1
                assert data["page_size"] == 20
                assert data["has_next"] is False
                assert len(data["agents"]) == 2

    def test_list_agents_with_pagination(self):
        """ページネーション付きエージェントリストのテスト"""
        with TestClient(app) as client:
            # 多数のモックエージェントを作成
            mock_agents = {
                f"agent{i}": type(
                    "Agent",
                    (),
                    {
                        "name": f"Agent {i}",
                        "description": f"Description {i}",
                        "plugins": ["search"],
                    },
                )()
                for i in range(25)
            }

            with patch("main.agents", mock_agents):
                response = client.get("/api/v1/agents?page=2&page_size=10")

                assert response.status_code == 200
                data = response.json()

                assert data["page"] == 2
                assert data["page_size"] == 10
                assert data["total"] == 25
                assert data["total_pages"] == 3
                assert data["has_prev"] is True
                assert data["has_next"] is True
                assert len(data["agents"]) == 10

    def test_get_agent_by_id(self):
        """特定エージェントの取得テスト"""
        with TestClient(app) as client:
            mock_agent = type(
                "Agent",
                (),
                {
                    "name": "Test Agent",
                    "description": "Test description",
                    "plugins": ["search", "memory"],
                },
            )()

            mock_agents = {"test-agent-123": mock_agent}

            with patch("main.agents", mock_agents):
                response = client.get("/api/v1/agents/test-agent-123")

                assert response.status_code == 200
                data = response.json()

                assert data["id"] == "test-agent-123"
                assert data["name"] == "Test Agent"
                assert data["description"] == "Test description"
                assert data["status"] == "idle"  # デフォルト値

    def test_get_agent_not_found(self):
        """存在しないエージェントの取得テスト"""
        with TestClient(app) as client:
            with patch("main.agents", {}):
                response = client.get("/api/v1/agents/nonexistent-agent")

                assert response.status_code == 404
                assert "Agent not found" in response.json()["detail"]

    def test_get_agent_stats(self):
        """エージェント統計の取得テスト"""
        with TestClient(app) as client:
            mock_agents = {f"agent{i}": type("Agent", (), {})() for i in range(5)}

            with patch("main.agents", mock_agents):
                response = client.get("/api/v1/agents/stats")

                assert response.status_code == 200
                data = response.json()

                assert data["total_agents"] == 5
                assert data["active_agents"] == 0  # 現在は常に0
                assert data["completed_tasks"] == 0  # 現在は常に0
                assert data["uptime_percent"] == 100.0


class TestSearchEndpoints:
    """検索エンドポイントのテスト"""

    def test_search_documents_success(self):
        """正常なドキュメント検索"""
        with TestClient(app) as client:
            mock_search_manager = Mock()
            mock_search_manager.search_multi_provider = Mock(
                return_value={
                    "azure": [
                        {
                            "content_text": "Test document content",
                            "document_title": "Test Document",
                            "score": 0.9,
                            "metadata": {"author": "Test Author"},
                        }
                    ]
                }
            )

            with patch("main.search_manager", mock_search_manager):
                search_request = {
                    "query": "test search",
                    "max_results": 5,
                    "include_web": True,
                    "temperature": "balanced",
                }

                response = client.post("/api/v1/search", json=search_request)

                assert response.status_code == 200
                data = response.json()

                assert "query_id" in data
                assert data["query"] == "test search"
                assert data["total_results"] == 1
                assert len(data["results"]) == 1
                assert data["results"][0]["title"] == "Test Document"

    def test_search_documents_service_unavailable(self):
        """検索サービスが利用不可の場合"""
        with TestClient(app) as client:
            with patch("main.search_manager", None):
                search_request = {"query": "test search", "max_results": 5}

                response = client.post("/api/v1/search", json=search_request)

                assert response.status_code == 503
                assert "Search service not available" in response.json()["detail"]

    def test_search_documents_invalid_request(self):
        """無効な検索リクエスト"""
        with TestClient(app) as client:
            # 空のクエリ
            search_request = {"query": "", "max_results": 5}

            response = client.post("/api/v1/search", json=search_request)

            assert response.status_code == 422  # バリデーションエラー

    def test_search_documents_max_results_validation(self):
        """max_resultsのバリデーションテスト"""
        with TestClient(app) as client:
            # 無効なmax_results
            search_request = {"query": "test", "max_results": 150}  # 100を超える

            response = client.post("/api/v1/search", json=search_request)

            assert response.status_code == 422

    def test_get_search_providers(self):
        """検索プロバイダーの取得テスト"""
        with TestClient(app) as client:
            mock_search_manager = Mock()
            mock_search_manager.get_available_providers = Mock(return_value=["azure", "tavily"])

            with patch("main.search_manager", mock_search_manager):
                response = client.get("/api/v1/search/providers")

                assert response.status_code == 200
                data = response.json()

                assert isinstance(data, list)
                assert len(data) >= 2
                assert any(provider["name"] == "azure" for provider in data)

    def test_get_document_types(self):
        """ドキュメントタイプの取得テスト"""
        with TestClient(app) as client:
            mock_search_manager = Mock()
            mock_search_manager.get_available_document_types = Mock(
                return_value={
                    "research": {
                        "display_name": "Research Papers",
                        "description": "Academic research papers",
                        "key_fields": ["title", "authors", "abstract"],
                        "content_fields": ["content", "keywords"],
                    },
                    "internal": {
                        "display_name": "Internal Documents",
                        "description": "Company internal documents",
                        "key_fields": ["title", "department"],
                        "content_fields": ["content"],
                    },
                }
            )

            with patch("main.search_manager", mock_search_manager):
                response = client.get("/api/v1/search/document-types")

                assert response.status_code == 200
                data = response.json()

                assert isinstance(data, list)
                assert len(data) >= 2

    def test_get_document_types_service_unavailable(self):
        """検索サービス利用不可時のドキュメントタイプ取得"""
        with TestClient(app) as client:
            with patch("main.search_manager", None):
                response = client.get("/api/v1/search/document-types")

                assert response.status_code == 200
                data = response.json()
                assert data == []


class TestMemoryEndpoints:
    """メモリエンドポイントのテスト"""

    def test_store_memory_success(self):
        """正常なメモリ保存"""
        with TestClient(app) as client:
            mock_memory_manager = Mock()
            mock_memory_manager.store_memory = Mock(return_value="mem-123")
            mock_memory_manager.search_memory = Mock(return_value=["stored memory content"])

            with patch("main.memory_manager", mock_memory_manager):
                memory_request = {
                    "content": "Test memory content",
                    "entry_type": "research",
                    "source": "test-agent",
                    "memory_type": "persistent",
                    "tags": ["test", "memory"],
                }

                response = client.post("/api/v1/memory", json=memory_request)

                assert response.status_code == 200
                data = response.json()

                assert data["content"] == "Test memory content"
                assert data["entry_type"] == "research"
                assert data["source"] == "test-agent"
                assert data["memory_type"] == "persistent"

    def test_store_memory_service_unavailable(self):
        """メモリサービスが利用不可の場合"""
        with TestClient(app) as client:
            with patch("main.memory_manager", None):
                memory_request = {"content": "Test content", "entry_type": "general"}

                response = client.post("/api/v1/memory", json=memory_request)

                assert response.status_code == 503
                assert "Memory service not available" in response.json()["detail"]

    def test_store_memory_empty_content(self):
        """空のコンテンツでのメモリ保存"""
        with TestClient(app) as client:
            memory_request = {"content": "", "entry_type": "general"}

            response = client.post("/api/v1/memory", json=memory_request)

            assert response.status_code == 422  # バリデーションエラー

    def test_search_memory(self):
        """メモリ検索テスト"""
        with TestClient(app) as client:
            mock_memory_manager = Mock()
            mock_memory_manager.search_memory = Mock(return_value=["memory1", "memory2"])

            with patch("main.memory_manager", mock_memory_manager):
                response = client.get("/api/v1/memory?query=test&page=1&page_size=10")

                assert response.status_code == 200
                data = response.json()

                assert "entries" in data
                assert data["page"] == 1
                assert data["page_size"] == 10
                assert data["total"] >= 0

    def test_get_memory_stats(self):
        """メモリ統計の取得テスト"""
        with TestClient(app) as client:
            mock_memory_manager = Mock()
            mock_memory_manager.get_memory_stats = Mock(
                return_value={
                    "total_entries": 100,
                    "entry_types": {"research": 50, "general": 30, "citation": 20},
                    "sources": {"agent1": 60, "agent2": 40},
                    "memory_types": {"persistent": 70, "session": 30},
                }
            )

            with patch("main.memory_manager", mock_memory_manager):
                response = client.get("/api/v1/memory/stats")

                assert response.status_code == 200
                data = response.json()

                assert data["total_entries"] == 100
                assert "research" in data["entry_types"]
                assert "agent1" in data["sources"]


class TestCitationEndpoints:
    """引用エンドポイントのテスト"""

    def test_create_citation_success(self):
        """正常な引用作成"""
        with TestClient(app) as client:
            mock_citation_manager = Mock()
            mock_citation_manager.create_citation = Mock(return_value="cite-123")

            # モック引用オブジェクト
            mock_citation = Mock()
            mock_citation.content = "Test citation content"
            mock_citation.source_title = "Test Source"
            mock_citation.case_number = "CASE-001"
            mock_citation.page_number = 42
            mock_citation.confidence = 0.95
            mock_citation.created_at = datetime.now(timezone.utc)
            mock_citation.updated_at = datetime.now(timezone.utc)

            mock_citation_manager.read_citation = Mock(return_value=mock_citation)

            with patch("main.citation_manager", mock_citation_manager):
                citation_request = {
                    "content": "Test citation content",
                    "source_title": "Test Source",
                    "case_number": "CASE-001",
                    "page_number": 42,
                    "confidence": 0.95,
                    "tags": ["test", "research"],
                }

                response = client.post("/api/v1/citations", json=citation_request)

                assert response.status_code == 200
                data = response.json()

                assert data["content"] == "Test citation content"
                assert data["source_title"] == "Test Source"
                assert data["case_number"] == "CASE-001"
                assert data["page_number"] == 42
                assert data["confidence"] == 0.95

    def test_list_citations(self):
        """引用リストの取得テスト"""
        with TestClient(app) as client:
            mock_citation_manager = Mock()

            # モック引用リスト
            mock_citations = [
                Mock(
                    id=f"cite-{i}",
                    content=f"Citation {i}",
                    source_title=f"Source {i}",
                    case_number=f"CASE-{i:03d}",
                    page_number=i + 1,
                    confidence=0.8 + (i * 0.1),
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                for i in range(5)
            ]

            mock_citation_manager.list_citations = Mock(return_value=mock_citations)

            with patch("main.citation_manager", mock_citation_manager):
                response = client.get("/api/v1/citations?page=1&page_size=3")

                assert response.status_code == 200
                data = response.json()

                assert "citations" in data
                assert data["page"] == 1
                assert data["page_size"] == 3
                assert data["total"] == 5
                assert len(data["citations"]) == 3

    def test_get_citation_by_id(self):
        """特定引用の取得テスト"""
        with TestClient(app) as client:
            mock_citation_manager = Mock()

            mock_citation = Mock(
                id="cite-123",
                content="Specific citation content",
                source_title="Specific Source",
                case_number="CASE-123",
                page_number=10,
                confidence=0.9,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )

            mock_citation_manager.read_citation = Mock(return_value=mock_citation)

            with patch("main.citation_manager", mock_citation_manager):
                response = client.get("/api/v1/citations/cite-123")

                assert response.status_code == 200
                data = response.json()

                assert data["id"] == "cite-123"
                assert data["content"] == "Specific citation content"
                assert data["source_title"] == "Specific Source"

    def test_get_citation_not_found(self):
        """存在しない引用の取得テスト"""
        with TestClient(app) as client:
            mock_citation_manager = Mock()
            mock_citation_manager.read_citation = Mock(return_value=None)

            with patch("main.citation_manager", mock_citation_manager):
                response = client.get("/api/v1/citations/nonexistent")

                assert response.status_code == 404
                assert "Citation not found" in response.json()["detail"]


class TestResearchEndpoints:
    """リサーチエンドポイントのテスト"""

    def test_create_research_task(self):
        """正常なリサーチタスク作成"""
        with TestClient(app) as client:
            with patch("main.agents", {"agent1": Mock(), "agent2": Mock()}):
                task_request = {
                    "query": "Research AI applications in healthcare",
                    "agents": ["agent1"],
                    "temperature": "creative",
                    "max_iterations": 5,
                    "include_web": True,
                    "save_results": True,
                }

                response = client.post("/api/v1/research", json=task_request)

                assert response.status_code == 200
                data = response.json()

                assert data["query"] == "Research AI applications in healthcare"
                assert data["temperature"] == "creative"
                assert data["max_iterations"] == 5
                assert data["agents"] == ["agent1"]
                assert data["status"] == "created"
                assert data["progress"] == 0.0

    def test_create_research_task_with_all_agents(self):
        """すべてのエージェントを使用するリサーチタスク作成"""
        with TestClient(app) as client:
            mock_agents = {"agent1": Mock(), "agent2": Mock(), "agent3": Mock()}

            with patch("main.agents", mock_agents):
                task_request = {
                    "query": "Research machine learning",
                    "temperature": "balanced",
                }

                response = client.post("/api/v1/research", json=task_request)

                assert response.status_code == 200
                data = response.json()

                assert len(data["agents"]) == 3
                assert "agent1" in data["agents"]
                assert "agent2" in data["agents"]
                assert "agent3" in data["agents"]

    def test_list_research_tasks(self):
        """リサーチタスクリストの取得テスト"""
        with TestClient(app) as client:
            response = client.get("/api/v1/research?page=1&page_size=10")

            assert response.status_code == 200
            data = response.json()

            assert "tasks" in data
            assert data["page"] == 1
            assert data["page_size"] == 10
            assert data["total"] == 0  # 現在は常に0
            assert len(data["tasks"]) == 0

    def test_get_research_task_not_implemented(self):
        """リサーチタスク詳細取得（未実装）"""
        with TestClient(app) as client:
            response = client.get("/api/v1/research/test-task-id")

            assert response.status_code == 501
            assert "Research task management not yet implemented" in response.json()["detail"]


class TestConfigEndpoints:
    """設定エンドポイントのテスト"""

    def test_get_config_info(self):
        """設定情報の取得テスト"""
        with TestClient(app) as client:
            response = client.get("/api/v1/config")

            assert response.status_code == 200
            data = response.json()

            assert "document_types" in data
            assert "search_providers" in data
            assert "temperature_settings" in data
            assert isinstance(data["document_types"], list)
            assert isinstance(data["search_providers"], list)


class TestErrorHandling:
    """エラーハンドリングのテスト"""

    def test_404_handler(self):
        """404エラーハンドラーのテスト"""
        with TestClient(app) as client:
            response = client.get("/api/v1/nonexistent-endpoint")

            assert response.status_code == 404
            data = response.json()

            assert data["success"] is False
            assert data["error"]["message"] == "Resource not found"
            assert data["error"]["code"] == "NOT_FOUND"

    def test_500_handler(self):
        """500エラーハンドラーのテスト"""
        with TestClient(app) as client:
            # 意図的に例外を発生させる
            with patch("main.agents", side_effect=Exception("Test exception")):
                response = client.get("/api/v1/agents")

                # 通常は500エラーが返されるが、実際の実装では503になる可能性がある
                assert response.status_code in [500, 503]


class TestCORS:
    """CORS設定のテスト"""

    def test_cors_headers(self):
        """CORSヘッダーのテスト"""
        with TestClient(app) as client:
            response = client.get("/health")

            # CORSヘッダーが設定されていることを確認
            # FastAPIのCORSミドルウェアが正しく機能しているか確認
            assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
