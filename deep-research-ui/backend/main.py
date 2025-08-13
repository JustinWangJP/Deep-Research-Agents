"""
FastAPI backend for Deep Research Agents UI
Provides REST API endpoints for React frontend
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
search_manager = None
memory_manager = None
citation_manager = None
agents = None
memory_plugin = None

# Pydantic models
class SearchQuery(BaseModel):
    query: str
    document_type: Optional[str] = None
    max_results: Optional[int] = 10
    provider: Optional[str] = None

class MemoryEntry(BaseModel):
    content: str
    entry_type: str = "general"
    source: str = "system"
    memory_type: str = "session"
    additional_metadata: Optional[Dict] = None

class CitationCreate(BaseModel):
    content: str
    source_title: str
    case_number: Optional[str] = None
    page_number: Optional[int] = None
    confidence: float = 1.0

class ResearchTask(BaseModel):
    query: str
    agents: List[str] = []
    temperature: str = "balanced"

class ConnectionManager:
    """WebSocket connection manager"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending message to websocket: {e}")
    
    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to websocket: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting Deep Research Agents API...")
    
    try:
        global search_manager, memory_manager, citation_manager, agents, memory_plugin
        
        # Initialize configuration
        config = get_config()
        config.validate()
        
        # Initialize managers
        search_manager = SearchManager()
        memory_manager = MemoryManager()
        citation_manager = CitationManager()
        memory_plugin = MemoryPlugin()
        
        # Initialize agents
        agents = await create_agents_with_memory(memory_plugin)
        
        logger.info("All services initialized successfully")
        logger.info(f"Available agents: {list(agents.keys())}")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Deep Research Agents API...")

app = FastAPI(
    title="Deep Research Agents API",
    description="REST API for Deep Research Agents UI",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Deep Research Agents API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "search": search_manager is not None,
            "memory": memory_manager is not None,
            "citations": citation_manager is not None,
            "agents": agents is not None
        }
    }

# Search endpoints
@app.post("/api/search")
async def search_documents(query: SearchQuery):
    """Search documents across all providers"""
    try:
        search_params = {
            "query": query.query,
            "max_results": query.max_results,
            "provider": query.provider
        }
        
        if query.document_type:
            search_params["document_type"] = query.document_type
            
        results = await search_manager.search_multi_provider(
            query=search_params,
            document_type=query.document_type,
            max_results_per_provider=query.max_results
        )
        
        # Broadcast search activity
        await manager.broadcast(json.dumps({
            "type": "search_result",
            "payload": {
                "query": query.query,
                "results_count": sum(len(r) for r in results.values()),
                "providers": list(results.keys())
            }
        }))
        
        return {"results": results, "query": query.query}
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/providers")
async def get_search_providers():
    """Get available search providers"""
    try:
        providers = search_manager.get_available_providers()
        return {"providers": providers}
    except Exception as e:
        logger.error(f"Error getting providers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/document-types")
async def get_document_types():
    """Get available document types"""
    try:
        doc_types = search_manager.get_available_document_types()
        return {"document_types": doc_types}
    except Exception as e:
        logger.error(f"Error getting document types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Memory endpoints
@app.post("/api/memory/store")
async def store_memory(entry: MemoryEntry):
    """Store information in memory"""
    try:
        result = await memory_manager.store_memory(
            content=entry.content,
            entry_type=entry.entry_type,
            source=entry.source,
            memory_type=entry.memory_type,
            additional_metadata=entry.additional_metadata
        )
        
        await manager.broadcast(json.dumps({
            "type": "memory_update",
            "payload": {
                "action": "store",
                "entry_id": result,
                "source": entry.source
            }
        }))
        
        return {"id": result, "status": "stored"}
    except Exception as e:
        logger.error(f"Memory store error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/search")
async def search_memory(query: dict):
    """Search memory entries"""
    try:
        results = await memory_manager.search_memory(
            query=query.get("query", ""),
            max_results=query.get("max_results", 5),
            entry_types=query.get("entry_types"),
            sources=query.get("sources"),
            min_relevance_score=query.get("min_relevance_score")
        )
        return {"results": results}
    except Exception as e:
        logger.error(f"Memory search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memory/stats")
async def get_memory_stats():
    """Get memory statistics"""
    try:
        stats = await memory_manager.get_memory_stats()
        return stats
    except Exception as e:
        logger.error(f"Memory stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/memory/clear")
async def clear_memory(confirm: str = "false"):
    """Clear all memory (requires confirmation)"""
    if confirm != "true":
        raise HTTPException(status_code=400, detail="Confirmation required")
    
    try:
        result = await memory_manager.clear_memory(confirm_session_id="confirmed")
        return {"cleared": result}
    except Exception as e:
        logger.error(f"Memory clear error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Citation endpoints
@app.post("/api/citations")
async def create_citation(citation: CitationCreate):
    """Create a new citation"""
    try:
        citation_id = citation_manager.create_citation(
            content=citation.content,
            source_title=citation.source_title,
            case_number=citation.case_number,
            page_number=citation.page_number,
            confidence=citation.confidence
        )
        return {"id": citation_id, "status": "created"}
    except Exception as e:
        logger.error(f"Citation creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/citations")
async def list_citations(case_number: Optional[str] = None):
    """List all citations"""
    try:
        citations = citation_manager.list_citations(case_number_filter=case_number)
        return {"citations": [c.to_dict() for c in citations]}
    except Exception as e:
        logger.error(f"Citation list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/citations/{citation_id}")
async def get_citation(citation_id: str):
    """Get a specific citation"""
    try:
        citation = citation_manager.read_citation(citation_id)
        if not citation:
            raise HTTPException(status_code=404, detail="Citation not found")
        return citation.to_dict()
    except Exception as e:
        logger.error(f"Citation retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/citations/{citation_id}")
async def delete_citation(citation_id: str):
    """Delete a citation"""
    try:
        result = citation_manager.delete_citation(citation_id)
        if not result:
            raise HTTPException(status_code=404, detail="Citation not found")
        return {"deleted": True}
    except Exception as e:
        logger.error(f"Citation deletion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Agent endpoints
@app.get("/api/agents")
async def get_agents():
    """Get all available agents"""
    try:
        agent_info = []
        for name, agent in agents.items():
            agent_info.append({
                "id": name,
                "name": agent.name,
                "description": agent.description,
                "status": "idle"  # Placeholder
            })
        return {"agents": agent_info}
    except Exception as e:
        logger.error(f"Agents error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agents/stats")
async def get_agent_stats():
    """Get agent statistics"""
    try:
        return {
            "total_agents": len(agents),
            "active_agents": 0,  # Placeholder
            "completed_tasks": 0,  # Placeholder
            "failed_tasks": 0,  # Placeholder
            "average_response_time": 0  # Placeholder
        }
    except Exception as e:
        logger.error(f"Agent stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await manager.send_personal_message(
                        json.dumps({"type": "pong", "timestamp": asyncio.get_event_loop().time()}),
                        websocket
                    )
                elif message.get("type") == "subscribe":
                    # Handle subscription logic here
                    await manager.send_personal_message(
                        json.dumps({"type": "subscribed", "channel": message.get("channel")}),
                        websocket
                    )
                    
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({"type": "error", "message": "Invalid JSON"}),
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Configuration endpoints
@app.get("/api/config")
async def get_config_info():
    """Get configuration information"""
    try:
        config = get_config()
        return {
            "document_types": config.get_document_indexes(),
            "search_providers": ["azure", "tavily"],
            "temperature_settings": {
                "conservative": 0.2,
                "balanced": 0.6,
                "creative": 0.9
            }
        }
    except Exception as e:
        logger.error(f"Config error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )