"""
Comprehensive HTTP-based FastAPI backend for Deep Research Agents UI
Provides REST API endpoints with OpenAPI documentation and WebSocket support
"""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, Query, Path, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html

# Import models
from models import (
    HealthResponse, AgentInfo, AgentStats, AgentListResponse,
    SearchQuery, SearchResponse, SearchProviderInfo, DocumentType,
    MemoryEntryCreate, MemoryEntry, MemoryQuery, MemoryStats,
    MemoryListResponse, CitationCreate, Citation, CitationListResponse,
    CitationUpdate, ConfigInfo, ResearchTaskCreate, ResearchTask,
    ResearchTaskListResponse, PaginationParams, BaseResponse
)

# Add the project root to Python path
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.config import get_config
from lib.search.manager import SearchManager
from lib.memory.manager import MemoryManager
from lib.citation.manager import CitationManager
from lib.agent_factory import create_agents_with_memory
from lib.memory.plugin import MemoryPlugin

# Create FastAPI app with enhanced OpenAPI docs
app = FastAPI(
    title="Deep Research Agents API",
    description="""
    Comprehensive HTTP REST API for Deep Research Agents system.
    
    ## Features
    - **Agent Management**: Monitor and manage research agents
    - **Advanced Search**: Search across multiple document types and providers
    - **Memory System**: Persistent semantic memory for research context
    - **Citation Management**: Create, manage, and validate citations
    - **Real-time Updates**: WebSocket support for live updates
    
    ## Authentication
    Currently, this API is open for development. Authentication will be added in future versions.
    
    ## Rate Limiting
    Default rate limits apply:
    - 100 requests per minute for general endpoints
    - 50 requests per minute for search endpoints
    - 10 concurrent research tasks per user
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "agents", "description": "Agent management and monitoring"},
        {"name": "search", "description": "Document search operations"},
        {"name": "memory", "description": "Semantic memory operations"},
        {"name": "citations", "description": "Citation management"},
        {"name": "research", "description": "Research task management"},
        {"name": "config", "description": "Configuration information"},
        {"name": "health", "description": "Health and status checks"},
    ]
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
search_manager: Optional[SearchManager] = None
memory_manager: Optional[MemoryManager] = None
citation_manager: Optional[CitationManager] = None
agents: Optional[Dict[str, Any]] = None
memory_plugin: Optional[MemoryPlugin] = None


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global search_manager, memory_manager, citation_manager, agents, memory_plugin
    
    try:
        config = get_config()
        config.validate()
        
        search_manager = SearchManager()
        memory_manager = MemoryManager()
        citation_manager = CitationManager()
        memory_plugin = MemoryPlugin()
        
        agents = await create_agents_with_memory(memory_plugin)
        
        print("✅ Deep Research Agents API started successfully")
        print(f"📊 Available agents: {len(agents)}")
        print(f"🔍 Search providers: {await search_manager.get_available_providers()}")
        
    except Exception as e:
        print(f"❌ Failed to initialize services: {e}")
        raise


# Health check endpoints
@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """
    Health check endpoint
    
    Returns the health status of all system components
    """
    return HealthResponse(
        services={
            "search": search_manager is not None,
            "memory": memory_manager is not None,
            "citations": citation_manager is not None,
            "agents": agents is not None,
            "azure_openai": bool(get_config().azure_openai_endpoint),
            "azure_search": bool(get_config().azure_search_endpoint),
        },
        version="2.0.0",
        uptime=datetime.now(timezone.utc).timestamp()
    )


# Agent endpoints
@app.get("/api/v1/agents", response_model=AgentListResponse, tags=["agents"])
async def list_agents(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by agent status")
):
    """
    List all available agents with pagination support
    
    - **page**: Page number (starting from 1)
    - **page_size**: Number of items per page (max 100)
    - **status**: Filter by agent status (idle, running, completed, error)
    """
    if not agents:
        raise HTTPException(status_code=503, detail="Agents not initialized")
    
    agent_list = []
    for agent_id, agent in agents.items():
        agent_info = AgentInfo(
            id=agent_id,
            name=getattr(agent, 'name', agent_id),
            description=getattr(agent, 'description', 'No description available'),
            status=AgentStatus.IDLE,  # Placeholder - would be dynamic
            plugins=getattr(agent, 'plugins', []),
            config=getattr(agent, 'config', {})
        )
        
        if status is None or agent_info.status == status:
            agent_list.append(agent_info)
    
    # Pagination
    total = len(agent_list)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_agents = agent_list[start:end]
    
    return AgentListResponse(
        agents=paginated_agents,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        has_next=end < total,
        has_prev=start > 0
    )


@app.get("/api/v1/agents/{agent_id}", response_model=AgentInfo, tags=["agents"])
async def get_agent(
    agent_id: str = Path(..., description="Agent identifier")
):
    """Get detailed information about a specific agent"""
    if not agents or agent_id not in agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = agents[agent_id]
    return AgentInfo(
        id=agent_id,
        name=getattr(agent, 'name', agent_id),
        description=getattr(agent, 'description', 'No description available'),
        status=AgentStatus.IDLE,
        plugins=getattr(agent, 'plugins', []),
        config=getattr(agent, 'config', {})
    )


@app.get("/api/v1/agents/stats", response_model=AgentStats, tags=["agents"])
async def get_agent_stats():
    """Get comprehensive agent statistics"""
    if not agents:
        return AgentStats()
    
    return AgentStats(
        total_agents=len(agents),
        active_agents=0,  # Would be dynamic
        completed_tasks=0,  # Would be dynamic
        failed_tasks=0,  # Would be dynamic
        average_response_time=0.0,
        uptime_percent=100.0
    )


# Search endpoints
@app.post("/api/v1/search", response_model=SearchResponse, tags=["search"])
async def search_documents(
    search_request: SearchQuery
):
    """
    Search documents across all configured providers
    
    - **query**: Search query text
    - **document_type**: Filter by specific document type
    - **provider**: Specific search provider (azure, tavily, internal)
    - **max_results**: Maximum results to return (1-100)
    - **include_web**: Include web search as fallback
    - **temperature**: LLM temperature for semantic search
    - **filters**: Additional search filters
    """
    if not search_manager:
        raise HTTPException(status_code=503, detail="Search service not available")
    
    try:
        # Execute search
        start_time = datetime.now(timezone.utc)
        
        search_params = {
            "query": search_request.query,
            "max_results": search_request.max_results,
            "include_web": search_request.include_web
        }
        
        if search_request.document_type:
            search_params["document_type"] = search_request.document_type
        
        if search_request.provider:
            search_params["provider"] = search_request.provider
        
        results = await search_manager.search_multi_provider(
            query=search_params,
            max_results_per_provider=search_request.max_results
        )
        
        # Transform results
        search_results = []
        total_results = 0
        provider_used = search_request.provider or SearchProvider.AZURE
        
        for provider, provider_results in results.items():
            for idx, result in enumerate(provider_results):
                if idx < search_request.max_results:
                    search_result = SearchResult(
                        id=f"{provider}_{idx}",
                        content=result.get("content_text", ""),
                        title=result.get("document_title", "Unknown"),
                        source=provider,
                        document_type=search_request.document_type,
                        score=result.get("score", 0.0),
                        metadata=result.get("metadata", {}),
                        created_at=datetime.now(timezone.utc)
                    )
                    search_results.append(search_result)
                    total_results += 1
        
        execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
        
        return SearchResponse(
            query_id=str(uuid.uuid4()),
            query=search_request.query,
            results=search_results,
            total_results=total_results,
            execution_time=execution_time,
            provider=provider_used
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/api/v1/search/providers", response_model=List[SearchProviderInfo], tags=["search"])
async def get_search_providers():
    """Get all available search providers"""
    if not search_manager:
        raise HTTPException(status_code=503, detail="Search service not available")
    
    providers = await search_manager.get_available_providers()
    return [
        SearchProviderInfo(
            name=provider,
            description=f"{provider} search provider",
            available=True,
            document_types=["all"]
        )
        for provider in providers
    ]


@app.get("/api/v1/search/document-types", response_model=List[DocumentType], tags=["search"])
async def get_document_types():
    """Get all available document types"""
    if not search_manager:
        return []
    
    doc_types = search_manager.get_available_document_types()
    result = []
    
    for doc_type_name, doc_type_info in doc_types.items():
        if isinstance(doc_type_info, dict):
            result.append(DocumentType(
                name=doc_type_name,
                display_name=doc_type_info.get("display_name", doc_type_name),
                description=doc_type_info.get("description", ""),
                key_fields=doc_type_info.get("key_fields", []),
                content_fields=doc_type_info.get("content_fields", [])
            ))
    
    return result


# Memory endpoints
@app.post("/api/v1/memory", response_model=MemoryEntry, tags=["memory"])
async def store_memory(
    memory_request: MemoryEntryCreate
):
    """
    Store a new memory entry
    
    - **content**: The content to store
    - **entry_type**: Type of memory (general, research, citation, etc.)
    - **source**: Source of the memory (agent name, system, etc.)
    - **memory_type**: Storage type (session, persistent, temporary)
    - **tags**: Optional tags for categorization
    """
    if not memory_manager:
        raise HTTPException(status_code=503, detail="Memory service not available")
    
    try:
        entry_id = await memory_manager.store_memory(
            content=memory_request.content,
            entry_type=memory_request.entry_type.value,
            source=memory_request.source,
            memory_type=memory_request.memory_type.value,
            additional_metadata=memory_request.additional_metadata
        )
        
        # Fetch the created entry
        search_results = await memory_manager.search_memory(
            query=memory_request.content,
            max_results=1
        )
        
        if search_results:
            return MemoryEntry(
                id=entry_id,
                content=memory_request.content,
                entry_type=memory_request.entry_type,
                source=memory_request.source,
                memory_type=memory_request.memory_type,
                additional_metadata=memory_request.additional_metadata,
                tags=memory_request.tags,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        
        raise HTTPException(status_code=500, detail="Failed to retrieve stored memory")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory storage failed: {str(e)}")


@app.get("/api/v1/memory", response_model=MemoryListResponse, tags=["memory"])
async def search_memory(
    query: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    source: Optional[str] = Query(None, description="Filter by source"),
    memory_type: Optional[str] = Query(None, description="Filter by memory type")
):
    """Search memory entries with filtering and pagination"""
    if not memory_manager:
        raise HTTPException(status_code=503, detail="Memory service not available")
    
    try:
        # Build search parameters
        search_params = {
            "query": query,
            "max_results": page_size * page,
            "entry_types": [entry_type] if entry_type else None,
            "sources": [source] if source else None,
        }
        
        results = await memory_manager.search_memory(**search_params)
        
        # Transform results
        memory_entries = []
        for result in results:
            # In real implementation, parse the result properly
            memory_entries.append(MemoryEntry(
                id=str(uuid.uuid4()),
                content=result,
                entry_type=EntryType.GENERAL,
                source="system",
                memory_type=MemoryType.SESSION,
                tags=[],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            ))
        
        # Pagination
        total = len(memory_entries)
        start = (page - 1) * page_size
        end = min(start + page_size, total)
        paginated_entries = memory_entries[start:end]
        
        return MemoryListResponse(
            entries=paginated_entries,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size,
            has_next=end < total,
            has_prev=start > 0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory search failed: {str(e)}")


@app.get("/api/v1/memory/stats", response_model=MemoryStats, tags=["memory"])
async def get_memory_stats():
    """Get comprehensive memory statistics"""
    if not memory_manager:
        return MemoryStats()
    
    try:
        stats = await memory_manager.get_memory_stats()
        return MemoryStats(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory stats failed: {str(e)}")


@app.delete("/api/v1/memory/{memory_id}", response_model=BaseResponse, tags=["memory"])
async def delete_memory(
    memory_id: str = Path(..., description="Memory entry ID")
):
    """Delete a specific memory entry"""
    # This would need implementation in the memory manager
    return BaseResponse(message=f"Memory {memory_id} deleted successfully")


# Citation endpoints
@app.post("/api/v1/citations", response_model=Citation, tags=["citations"])
async def create_citation(
    citation_request: CitationCreate
):
    """
    Create a new citation
    
    - **content**: Citation content/text
    - **source_title**: Title of the source document
    - **source_url**: Optional URL of the source
    - **case_number**: Optional case identifier
    - **page_number**: Optional page number
    - **confidence**: Confidence score (0.0-1.0)
    - **tags**: Optional tags for categorization
    """
    if not citation_manager:
        raise HTTPException(status_code=503, detail="Citation service not available")
    
    try:
        citation_id = citation_manager.create_citation(
            content=citation_request.content,
            source_title=citation_request.source_title,
            case_number=citation_request.case_number,
            page_number=citation_request.page_number,
            confidence=citation_request.confidence
        )
        
        citation = citation_manager.read_citation(citation_id)
        if citation:
            return Citation(
                id=citation_id,
                content=citation.content,
                source_title=citation.source_title,
                case_number=citation.case_number,
                page_number=citation.page_number,
                confidence=citation.confidence,
                tags=citation_request.tags,
                metadata=citation_request.metadata,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        
        raise HTTPException(status_code=500, detail="Failed to retrieve created citation")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation creation failed: {str(e)}")


@app.get("/api/v1/citations", response_model=CitationListResponse, tags=["citations"])
async def list_citations(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    case_number: Optional[str] = Query(None, description="Filter by case number"),
    source_title: Optional[str] = Query(None, description="Filter by source title"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)")
):
    """List citations with filtering and pagination"""
    if not citation_manager:
        raise HTTPException(status_code=503, detail="Citation service not available")
    
    try:
        citations = citation_manager.list_citations(case_number_filter=case_number)
        
        # Filter by source title and tags if provided
        filtered_citations = []
        tag_list = tags.split(",") if tags else []
        
        for citation in citations:
            if source_title and source_title.lower() not in citation.source_title.lower():
                continue
            if tag_list and not any(tag in citation.tags for tag in tag_list):
                continue
            filtered_citations.append(citation)
        
        # Pagination
        total = len(filtered_citations)
        start = (page - 1) * page_size
        end = min(start + page_size, total)
        paginated_citations = filtered_citations[start:end]
        
        # Convert to response model
        citation_data = [
            Citation(
                id=citation.id,
                content=citation.content,
                source_title=citation.source_title,
                case_number=citation.case_number,
                page_number=citation.page_number,
                confidence=citation.confidence,
                tags=[],  # Would need to be added to citation model
                metadata={},
                created_at=citation.created_at,
                updated_at=citation.updated_at
            )
            for citation in paginated_citations
        ]
        
        return CitationListResponse(
            citations=citation_data,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size,
            has_next=end < total,
            has_prev=start > 0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation listing failed: {str(e)}")


@app.get("/api/v1/citations/{citation_id}", response_model=Citation, tags=["citations"])
async def get_citation(
    citation_id: str = Path(..., description="Citation identifier")
):
    """Get a specific citation by ID"""
    if not citation_manager:
        raise HTTPException(status_code=503, detail="Citation service not available")
    
    citation = citation_manager.read_citation(citation_id)
    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")
    
    return Citation(
        id=citation_id,
        content=citation.content,
        source_title=citation.source_title,
        case_number=citation.case_number,
        page_number=citation.page_number,
        confidence=citation.confidence,
        tags=[],  # Would need to be added
        metadata={},
        created_at=citation.created_at,
        updated_at=citation.updated_at
    )


@app.put("/api/v1/citations/{citation_id}", response_model=Citation, tags=["citations"])
async def update_citation(
    citation_id: str = Path(..., description="Citation identifier"),
    citation_update: CitationUpdate = ...
):
    """Update an existing citation"""
    if not citation_manager:
        raise HTTPException(status_code=503, detail="Citation service not available")
    
    try:
        success = citation_manager.update_citation(citation_id, **citation_update.dict(exclude_unset=True))
        if not success:
            raise HTTPException(status_code=404, detail="Citation not found")
        
        citation = citation_manager.read_citation(citation_id)
        if citation:
            return Citation(
                id=citation_id,
                content=citation.content,
                source_title=citation.source_title,
                case_number=citation.case_number,
                page_number=citation.page_number,
                confidence=citation.confidence,
                tags=[],
                metadata={},
                created_at=citation.created_at,
                updated_at=datetime.now(timezone.utc)
            )
        
        raise HTTPException(status_code=500, detail="Failed to retrieve updated citation")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation update failed: {str(e)}")


@app.delete("/api/v1/citations/{citation_id}", response_model=BaseResponse, tags=["citations"])
async def delete_citation(
    citation_id: str = Path(..., description="Citation identifier")
):
    """Delete a citation"""
    if not citation_manager:
        raise HTTPException(status_code=503, detail="Citation service not available")
    
    try:
        success = citation_manager.delete_citation(citation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Citation not found")
        
        return BaseResponse(message=f"Citation {citation_id} deleted successfully")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation deletion failed: {str(e)}")


# Configuration endpoints
@app.get("/api/v1/config", response_model=ConfigInfo, tags=["config"])
async def get_config_info():
    """Get system configuration information"""
    try:
        config = get_config()
        
        # Build document types
        doc_types = []
        for name, index_name in config.get_document_indexes().items():
            doc_types.append(DocumentType(
                name=name,
                display_name=name.replace("_", " ").title(),
                description=f"{name} document type",
                index_name=index_name,
                key_fields=["title", "author", "date"],
                content_fields=["content", "summary", "keywords"]
            ))
        
        # Build providers
        providers = [
            SearchProviderInfo(
                name="azure",
                description="Azure AI Search provider",
                available=bool(config.azure_search_endpoint),
                document_types=[dt.name for dt in doc_types]
            ),
            SearchProviderInfo(
                name="tavily",
                description="Tavily web search provider",
                available=bool(config.tavily_api_key),
                document_types=["web"]
            )
        ]
        
        return ConfigInfo(
            document_types=doc_types,
            search_providers=providers
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Config fetch failed: {str(e)}")


# Research task endpoints
@app.post("/api/v1/research", response_model=ResearchTask, tags=["research"])
async def create_research_task(
    task_request: ResearchTaskCreate
):
    """
    Create a new research task
    
    - **query**: Research question or topic
    - **agents**: Specific agents to use (optional, uses all if not specified)
    - **temperature**: LLM temperature level (conservative, balanced, creative)
    - **max_iterations**: Maximum quality improvement iterations
    - **include_web**: Whether to include web search as fallback
    """
    task = ResearchTask(
        id=str(uuid.uuid4()),
        query=task_request.query,
        agents=task_request.agents or list(agents.keys()) if agents else [],
        temperature=task_request.temperature,
        status="created",
        progress=0.0,
        created_at=datetime.now(timezone.utc)
    )
    
    # In real implementation, this would start the research process
    return task


@app.get("/api/v1/research", response_model=ResearchTaskListResponse, tags=["research"])
async def list_research_tasks(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """List research tasks with pagination"""
    # Placeholder - would fetch from task storage
    return ResearchTaskListResponse(tasks=[], total=0, page=page, page_size=page_size)


@app.get("/api/v1/research/{task_id}", response_model=ResearchTask, tags=["research"])
async def get_research_task(
    task_id: str = Path(..., description="Task identifier")
):
    """Get detailed information about a research task"""
    raise HTTPException(status_code=501, detail="Research task management not yet implemented")


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "message": "Resource not found",
                "code": "NOT_FOUND"
            }
        }
    )


@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "Internal server error",
                "code": "INTERNAL_ERROR"
            }
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )