"""
Comprehensive Pydantic models for Deep Research Agents API
Provides detailed request/response schemas with OpenAPI documentation
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# Enum definitions
class AgentStatus(str, Enum):
    """Agent status enumeration"""

    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"
    PAUSED = "paused"


class SearchProvider(str, Enum):
    """Available search providers"""

    AZURE = "azure"
    TAVILY = "tavily"
    INTERNAL = "internal"


class MemoryType(str, Enum):
    """Memory storage types"""

    SESSION = "session"
    PERSISTENT = "persistent"
    TEMPORARY = "temporary"


class EntryType(str, Enum):
    """Memory entry types"""

    GENERAL = "general"
    RESEARCH = "research"
    CITATION = "citation"
    AGENT_COMMUNICATION = "agent_communication"
    SYSTEM = "system"


class TemperatureLevel(str, Enum):
    """LLM temperature levels"""

    CONSERVATIVE = "conservative"
    BALANCED = "balanced"
    CREATIVE = "creative"


# Base response model
class BaseResponse(BaseModel):
    """Base response model with common fields"""

    success: bool = Field(True, description="Request success status")
    message: str | None = Field(None, description="Response message")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Pagination models
class PaginationParams(BaseModel):
    """Pagination parameters"""

    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")


class PaginatedResponse(BaseResponse):
    """Paginated response base"""

    total: int = Field(0, description="Total items count")
    page: int = Field(1, description="Current page")
    page_size: int = Field(20, description="Items per page")
    total_pages: int = Field(0, description="Total pages")
    has_next: bool = Field(False, description="Has next page")
    has_prev: bool = Field(False, description="Has previous page")


# Health check
class HealthResponse(BaseResponse):
    """Health check response"""

    services: dict[str, bool] = Field(..., description="Service health status")
    version: str = Field("1.0.0", description="API version")
    uptime: float | None = Field(None, description="Uptime in seconds")


# Agent models
class AgentInfo(BaseModel):
    """Agent information"""

    id: str = Field(..., description="Unique agent identifier")
    name: str = Field(..., description="Agent display name")
    description: str | None = Field(None, description="Agent description")
    status: AgentStatus = Field(AgentStatus.IDLE, description="Current status")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime | None = Field(None, description="Last activity time")
    plugins: list[str] = Field(default_factory=list, description="Enabled plugins")
    temperature: float | None = Field(None, ge=0.0, le=2.0, description="LLM temperature")
    config: dict[str, Any] | None = Field(None, description="Agent configuration")


class AgentStats(BaseModel):
    """Agent statistics"""

    total_agents: int = Field(0, description="Total number of agents")
    active_agents: int = Field(0, description="Currently active agents")
    completed_tasks: int = Field(0, description="Total completed tasks")
    failed_tasks: int = Field(0, description="Total failed tasks")
    average_response_time: float = Field(0.0, description="Average response time in milliseconds")
    total_memory_usage: str | None = Field(None, description="System memory usage information")
    uptime_percent: float = Field(100.0, ge=0.0, le=100.0, description="System uptime percentage")


class AgentListResponse(PaginatedResponse):
    """Agent list response"""

    agents: list[AgentInfo] = Field(..., description="List of agents")


# Search models
class SearchQuery(BaseModel):
    """Search request model"""

    query: str = Field(..., min_length=1, max_length=1000, description="Search query")
    document_type: str | None = Field(None, description="Filter by document type")
    provider: SearchProvider | None = Field(None, description="Search provider")
    max_results: int = Field(10, ge=1, le=100, description="Maximum results to return")
    include_web: bool = Field(True, description="Include web search as fallback")
    temperature: TemperatureLevel | None = Field(TemperatureLevel.BALANCED, description="Search temperature")
    filters: dict[str, Any] | None = Field(None, description="Additional search filters")


class SearchResult(BaseModel):
    """Individual search result"""

    id: str = Field(..., description="Unique result identifier")
    content: str = Field(..., description="Result content/text")
    title: str | None = Field(None, description="Document title")
    source: str = Field(..., description="Source identifier")
    document_type: str | None = Field(None, description="Document type")
    url: str | None = Field(None, description="Source URL")
    score: float = Field(0.0, ge=0.0, le=1.0, description="Relevance score")
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="Confidence score")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    highlights: dict[str, list[str]] | None = Field(None, description="Search highlights")
    created_at: datetime | None = Field(None, description="Document creation date")


class SearchResponse(BaseModel):
    """Search response"""

    query_id: str = Field(..., description="Unique query identifier")
    query: str = Field(..., description="Original search query")
    results: list[SearchResult] = Field(..., description="Search results")
    total_results: int = Field(0, description="Total results found")
    execution_time: float = Field(..., description="Search execution time in seconds")
    provider: SearchProvider = Field(..., description="Search provider used")
    next_page: str | None = Field(None, description="Next page URL")


class SearchProviderInfo(BaseModel):
    """Search provider information"""

    name: str = Field(..., description="Provider name")
    description: str = Field(..., description="Provider description")
    available: bool = Field(True, description="Whether provider is available")
    document_types: list[str] = Field(default_factory=list, description="Supported document types")


class DocumentType(BaseModel):
    """Document type information"""

    name: str = Field(..., description="Document type name")
    display_name: str = Field(..., description="Human-readable name")
    description: str | None = Field(None, description="Document type description")
    index_name: str | None = Field(None, description="Search index name")
    key_fields: list[str] = Field(default_factory=list, description="Key fields for this type")
    content_fields: list[str] = Field(default_factory=list, description="Content fields for this type")


# Memory models
class MemoryEntryCreate(BaseModel):
    """Memory entry creation request"""

    content: str = Field(..., min_length=1, max_length=10000, description="Memory content")
    entry_type: EntryType = Field(EntryType.GENERAL, description="Type of memory entry")
    source: str = Field("system", min_length=1, max_length=100, description="Source of the entry")
    memory_type: MemoryType = Field(MemoryType.SESSION, description="Memory storage type")
    additional_metadata: dict[str, Any] | None = Field(None, description="Additional metadata")
    tags: list[str] = Field(default_factory=list, description="Entry tags")


class MemoryEntry(BaseModel):
    """Memory entry"""

    id: str = Field(..., description="Unique memory entry identifier")
    content: str = Field(..., description="Memory content")
    entry_type: EntryType = Field(..., description="Type of memory entry")
    source: str = Field(..., description="Source of the entry")
    memory_type: MemoryType = Field(..., description="Memory storage type")
    additional_metadata: dict[str, Any] | None = Field(None, description="Additional metadata")
    tags: list[str] = Field(default_factory=list, description="Entry tags")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    relevance_score: float | None = Field(None, ge=0.0, le=1.0, description="Search relevance score")


class MemoryQuery(BaseModel):
    """Memory search query"""

    query: str = Field(..., min_length=1, max_length=1000, description="Search query")
    entry_types: list[EntryType] | None = Field(None, description="Filter by entry types")
    sources: list[str] | None = Field(None, description="Filter by sources")
    memory_types: list[MemoryType] | None = Field(None, description="Filter by memory types")
    tags: list[str] | None = Field(None, description="Filter by tags")
    min_relevance_score: float | None = Field(None, ge=0.0, le=1.0, description="Minimum relevance score")
    date_from: datetime | None = Field(None, description="Start date filter")
    date_to: datetime | None = Field(None, description="End date filter")


class MemoryStats(BaseModel):
    """Memory statistics"""

    total_entries: int = Field(0, description="Total memory entries")
    entry_types: dict[str, int] = Field(default_factory=dict, description="Entries by type")
    sources: dict[str, int] = Field(default_factory=dict, description="Entries by source")
    memory_types: dict[str, int] = Field(default_factory=dict, description="Entries by memory type")
    tags: dict[str, int] = Field(default_factory=dict, description="Entries by tag")
    storage_size: int | None = Field(None, description="Storage size in bytes")


class MemoryListResponse(PaginatedResponse):
    """Memory entries list response"""

    entries: list[MemoryEntry] = Field(..., description="List of memory entries")


# Citation models
class CitationCreate(BaseModel):
    """Citation creation request"""

    content: str = Field(..., min_length=1, max_length=5000, description="Citation content")
    source_title: str = Field(..., min_length=1, max_length=500, description="Source title")
    source_url: str | None = Field(None, description="Source URL")
    case_number: str | None = Field(None, max_length=100, description="Case identifier")
    page_number: int | None = Field(None, ge=1, description="Page number")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Confidence score")
    tags: list[str] = Field(default_factory=list, description="Citation tags")
    metadata: dict[str, Any] | None = Field(None, description="Additional metadata")


class CitationUpdate(BaseModel):
    """Citation update request"""

    content: str | None = Field(None, min_length=1, max_length=5000, description="Citation content")
    source_title: str | None = Field(None, min_length=1, max_length=500, description="Source title")
    source_url: str | None = Field(None, description="Source URL")
    case_number: str | None = Field(None, max_length=100, description="Case identifier")
    page_number: int | None = Field(None, ge=1, description="Page number")
    confidence: float | None = Field(None, ge=0.0, le=1.0, description="Confidence score")
    tags: list[str] | None = Field(None, description="Citation tags")
    metadata: dict[str, Any] | None = Field(None, description="Additional metadata")


class Citation(BaseModel):
    """Citation model"""

    id: str = Field(..., description="Unique citation identifier")
    content: str = Field(..., description="Citation content")
    source_title: str = Field(..., description="Source title")
    source_url: str | None = Field(None, description="Source URL")
    case_number: str | None = Field(None, description="Case identifier")
    page_number: int | None = Field(None, description="Page number")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    tags: list[str] = Field(default_factory=list, description="Citation tags")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class CitationListResponse(PaginatedResponse):
    """Citation list response"""

    citations: list[Citation] = Field(..., description="List of citations")


# Configuration models
class ConfigInfo(BaseModel):
    """Configuration information"""

    document_types: list[DocumentType] = Field(..., description="Available document types")
    search_providers: list[SearchProviderInfo] = Field(..., description="Available search providers")
    temperature_settings: dict[str, float] = Field(
        default_factory=lambda: {"conservative": 0.2, "balanced": 0.6, "creative": 0.9},
        description="Temperature settings",
    )
    max_results_limit: int = Field(100, description="Maximum results per request")
    supported_languages: list[str] = Field(default_factory=lambda: ["en", "ja"], description="Supported languages")


# Error models
class ErrorDetail(BaseModel):
    """Error detail"""

    field: str | None = Field(None, description="Field with error")
    message: str = Field(..., description="Error message")
    code: str | None = Field(None, description="Error code")


class ErrorResponse(BaseResponse):
    """Error response"""

    success: bool = Field(False, description="Request success status")
    error: ErrorDetail = Field(..., description="Error details")
    details: list[ErrorDetail] | None = Field(None, description="Additional error details")


# Research task models
class ResearchTaskCreate(BaseModel):
    """Research task creation request"""

    query: str = Field(..., min_length=1, max_length=1000, description="Research query")
    agents: list[str] | None = Field(None, description="Specific agents to use")
    temperature: TemperatureLevel = Field(TemperatureLevel.BALANCED, description="Research temperature")
    max_iterations: int = Field(3, ge=1, le=10, description="Maximum quality iterations")
    include_web: bool = Field(True, description="Include web search")
    save_results: bool = Field(True, description="Save results to memory")


class ResearchTask(BaseModel):
    """Research task"""

    id: str = Field(..., description="Unique task identifier")
    query: str = Field(..., description="Original research query")
    agents: list[str] = Field(..., description="Agents involved")
    temperature: TemperatureLevel = Field(..., description="Research temperature")
    status: str = Field(..., description="Task status")
    progress: float = Field(0.0, ge=0.0, le=100.0, description="Task progress percentage")
    results: list[dict[str, Any]] | None = Field(None, description="Task results")
    created_at: datetime = Field(..., description="Creation timestamp")
    started_at: datetime | None = Field(None, description="Start timestamp")
    completed_at: datetime | None = Field(None, description="Completion timestamp")
    error_message: str | None = Field(None, description="Error message if failed")


class ResearchTaskListResponse(PaginatedResponse):
    """Research task list response"""

    tasks: list[ResearchTask] = Field(..., description="List of research tasks")
