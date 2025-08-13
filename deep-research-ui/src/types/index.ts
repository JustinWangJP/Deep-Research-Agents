export interface SearchResult {
  content_text: string;
  search_type: string;
  search_mode: string;
  document_title?: string;
  content_path?: string;
  page_number?: number;
  score?: number;
  reranker_score?: number;
  highlights?: Record<string, any>;
  captions?: Array<Record<string, any>>;
  answers?: Array<Record<string, any>>;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastActivity?: string;
  temperature?: number;
  plugins: string[];
}

export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: string;
  type: 'system' | 'user' | 'assistant' | 'error';
}

export interface MemoryEntry {
  id: string;
  content: string;
  entry_type: string;
  source: string;
  memory_type: string;
  additional_metadata?: Record<string, any>;
  created_at: string;
  relevance_score?: number;
}

export interface Citation {
  id: string;
  content: string;
  source_title: string;
  case_number?: string;
  page_number?: number;
  confidence: number;
  created_at: string;
}

export interface SearchQuery {
  query: string;
  document_type?: string;
  max_results?: number;
  provider?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  provider: string;
  query: string;
  execution_time: number;
}

export interface MemoryStats {
  total_entries: number;
  entry_types: Record<string, number>;
  sources: Record<string, number>;
  memory_types: Record<string, number>;
}

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  completed_tasks: number;
  failed_tasks: number;
  average_response_time: number;
}

export interface WebSocketMessage {
  type: 'agent_update' | 'search_result' | 'memory_update' | 'log_message';
  payload: any;
  timestamp: string;
}

export interface TemperatureConfig {
  conservative: number; // 0.2
  balanced: number;     // 0.6
  creative: number;     // 0.9
}

export interface DocumentType {
  name: string;
  display_name: string;
  index_name: string;
  key_fields: string[];
  content_fields: string[];
}

export interface ResearchTask {
  id: string;
  query: string;
  agents: string[];
  temperature: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: any[];
  created_at: string;
}