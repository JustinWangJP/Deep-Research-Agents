// Core types matching backend models
export interface SearchResult {
  id: string;
  content: string;
  title?: string;
  source: string;
  document_type?: string;
  url?: string;
  score: number;
  confidence: number;
  metadata: Record<string, unknown>;
  highlights?: Record<string, string[]>;
  created_at?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  created_at: string;
  last_activity?: string;
  plugins: string[];
  temperature?: number;
  config?: Record<string, unknown>;
}

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  completed_tasks: number;
  failed_tasks: number;
  average_response_time: number;
  uptime_percent: number;
}

export interface MemoryEntry {
  id: string;
  content: string;
  entry_type: 'general' | 'research' | 'citation' | 'agent_communication' | 'system';
  source: string;
  memory_type: 'session' | 'persistent' | 'temporary';
  additional_metadata?: Record<string, unknown>;
  tags: string[];
  created_at: string;
  updated_at: string;
  relevance_score?: number;
}

export interface MemoryEntryCreate {
  content: string;
  entry_type: 'general' | 'research' | 'citation' | 'agent_communication' | 'system';
  source: string;
  memory_type: 'session' | 'persistent' | 'temporary';
  additional_metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface MemoryStats {
  total_entries: number;
  entry_types: Record<string, number>;
  sources: Record<string, number>;
  memory_types: Record<string, number>;
  tags: Record<string, number>;
  storage_size?: number;
}

export interface Citation {
  id: string;
  content: string;
  source_title: string;
  source_url?: string;
  case_number?: string;
  page_number?: number;
  confidence: number;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CitationCreate {
  content: string;
  source_title: string;
  source_url?: string;
  case_number?: string;
  page_number?: number;
  confidence?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  document_type?: string;
  provider?: 'azure' | 'tavily' | 'internal';
  max_results?: number;
  include_web?: boolean;
  temperature?: 'conservative' | 'balanced' | 'creative';
  filters?: Record<string, unknown>;
}

export interface SearchResponse {
  query_id: string;
  query: string;
  results: SearchResult[];
  total_results: number;
  execution_time: number;
  provider: string;
  next_page?: string;
}

export interface SearchProviderInfo {
  name: string;
  description: string;
  available: boolean;
  document_types: string[];
}

export interface DocumentType {
  name: string;
  display_name: string;
  description?: string;
  index_name?: string;
  key_fields: string[];
  content_fields: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AgentListResponse extends PaginatedResponse<AgentInfo> {
  agents: AgentInfo[];
}

export interface MemoryListResponse extends PaginatedResponse<MemoryEntry> {
  entries: MemoryEntry[];
}

export interface CitationListResponse extends PaginatedResponse<Citation> {
  citations: Citation[];
}

export interface ResearchTask {
  id: string;
  query: string;
  agents: string[];
  temperature: 'conservative' | 'balanced' | 'creative';
  status: 'created' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: unknown[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface ResearchTaskListResponse extends PaginatedResponse<ResearchTask> {
  tasks: ResearchTask[];
}

export interface ResearchTaskCreate {
  query: string;
  agents?: string[];
  temperature?: 'conservative' | 'balanced' | 'creative';
  max_iterations?: number;
  include_web?: boolean;
  save_results?: boolean;
}

export interface ConfigInfo {
  document_types: DocumentType[];
  search_providers: SearchProviderInfo[];
  temperature_settings: Record<'conservative' | 'balanced' | 'creative', number>;
  max_results_limit: number;
  supported_languages: string[];
}

export interface HealthResponse {
  services: Record<string, boolean>;
  version: string;
  uptime?: number;
  message?: string;
}

// Legacy interfaces for backward compatibility
export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: string;
  type: 'system' | 'user' | 'assistant' | 'error';
}

export interface WebSocketMessage {
  type: 'agent_update' | 'search_result' | 'memory_update' | 'log_message';
  payload: unknown;
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
  description?: string;
  index_name?: string;
  key_fields: string[];
  content_fields: string[];
}

export interface ResearchTask {
  id: string;
  query: string;
  agents: string[];
  temperature: 'conservative' | 'balanced' | 'creative';
  status: 'created' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: unknown[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}