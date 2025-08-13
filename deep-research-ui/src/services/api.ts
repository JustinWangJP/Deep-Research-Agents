import axios from 'axios';
import type { SearchQuery, SearchResponse, AgentInfo, MemoryEntry, MemoryStats, AgentStats, Citation, CitationCreate, MemoryEntryCreate, ConfigInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Rate limit - implement exponential backoff
      return new Promise((resolve) => {
        setTimeout(() => resolve(api.request(error.config)), 1000);
      });
    }
    return Promise.reject(error);
  }
);

// Search API
export const searchAPI = {
  search: async (query: SearchQuery): Promise<SearchResponse> => {
    const response = await api.post('/search', query);
    return response.data;
  },

  getProviders: async () => {
    const response = await api.get('/search/providers');
    return response.data;
  },

  getDocumentTypes: async () => {
    const response = await api.get('/search/document-types');
    return response.data;
  },
};

// Memory API
export const memoryAPI = {
  store: async (entry: MemoryEntryCreate): Promise<MemoryEntry> => {
    const response = await api.post('/memory', entry);
    return response.data;
  },

  search: async (
    query: string,
    page: number = 1,
    page_size: number = 20,
    filters: {
      entry_type?: string;
      source?: string;
      memory_type?: string;
    } = {}
  ) => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      page_size: page_size.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined))
    });
    
    const response = await api.get(`/memory?${params.toString()}`);
    return response.data;
  },

  getStats: async (): Promise<MemoryStats> => {
    const response = await api.get('/memory/stats');
    return response.data;
  },

  delete: async (memory_id: string) => {
    const response = await api.delete(`/memory/${memory_id}`);
    return response.data;
  },
};

// Citation API
export const citationAPI = {
  create: async (citation: CitationCreate): Promise<Citation> => {
    const response = await api.post('/citations', citation);
    return response.data;
  },

  list: async (
    page: number = 1,
    page_size: number = 20,
    filters: {
      case_number?: string;
      source_title?: string;
      tags?: string[];
    } = {}
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined))
    });
    
    const response = await api.get(`/citations?${params.toString()}`);
    return response.data;
  },

  get: async (id: string): Promise<Citation> => {
    const response = await api.get(`/citations/${id}`);
    return response.data;
  },

  update: async (id: string, updates: Partial<Citation>): Promise<Citation> => {
    const response = await api.put(`/citations/${id}`, updates);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/citations/${id}`);
    return response.data;
  },
};

// Agent API
export const agentAPI = {
  getAgents: async (
    page: number = 1,
    page_size: number = 20,
    status?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(status && { status })
    });
    
    const response = await api.get(`/agents?${params.toString()}`);
    return response.data;
  },

  getAgent: async (agent_id: string): Promise<AgentInfo> => {
    const response = await api.get(`/agents/${agent_id}`);
    return response.data;
  },

  getStats: async (): Promise<AgentStats> => {
    const response = await api.get('/agents/stats');
    return response.data;
  },
};

// Research API
export const researchAPI = {
  createTask: async (query: string, agents?: string[], temperature = 'balanced', max_iterations = 3) => {
    const response = await api.post('/research', {
      query,
      agents,
      temperature,
      max_iterations,
    });
    return response.data;
  },

  getTasks: async (
    page: number = 1,
    page_size: number = 20,
    status?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      ...(status && { status })
    });
    
    const response = await api.get(`/research?${params.toString()}`);
    return response.data;
  },

  getTask: async (task_id: string) => {
    const response = await api.get(`/research/${task_id}`);
    return response.data;
  },
};

// Config API
export const configAPI = {
  getConfig: async (): Promise<ConfigInfo> => {
    const response = await api.get('/config');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },
};

// HTTP-only mode utilities
export const httpUtils = {
  // Check if backend is available via HTTP
  isBackendAvailable: async () => {
    try {
      await healthAPI.check();
      return true;
    } catch {
      return false;
    }
  },

  // Get API documentation URL
  getApiDocsUrl: () => `${API_BASE_URL}/docs`,

  // Get API version
  getApiVersion: async () => {
    try {
      const response = await healthAPI.check();
      return response.version;
    } catch {
      return 'unknown';
    }
  },
};

export default api;