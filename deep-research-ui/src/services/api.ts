import axios from 'axios';
import { SearchQuery, SearchResult, Agent, MemoryEntry, Citation, MemoryStats, AgentStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

// Search API
export const searchAPI = {
  search: async (query: SearchQuery) => {
    const response = await api.post('/search', query);
    return response.data;
  },

  getProviders: async () => {
    const response = await api.get('/search/providers');
    return response.data.providers;
  },

  getDocumentTypes: async () => {
    const response = await api.get('/search/document-types');
    return response.data.document_types;
  },
};

// Memory API
export const memoryAPI = {
  store: async (entry: Omit<MemoryEntry, 'id' | 'created_at' | 'relevance_score'>) => {
    const response = await api.post('/memory/store', entry);
    return response.data;
  },

  search: async (query: string, max_results = 5, filters = {}) => {
    const response = await api.post('/memory/search', { query, max_results, ...filters });
    return response.data.results;
  },

  getStats: async () => {
    const response = await api.get('/memory/stats');
    return response.data;
  },

  clear: async () => {
    const response = await api.delete('/memory/clear?confirm=true');
    return response.data;
  },
};

// Citation API
export const citationAPI = {
  create: async (citation: Omit<Citation, 'id' | 'created_at'>) => {
    const response = await api.post('/citations', citation);
    return response.data;
  },

  list: async (case_number?: string) => {
    const response = await api.get('/citations', { params: { case_number } });
    return response.data.citations;
  },

  get: async (id: string) => {
    const response = await api.get(`/citations/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/citations/${id}`);
    return response.data;
  },
};

// Agent API
export const agentAPI = {
  getAgents: async () => {
    const response = await api.get('/agents');
    return response.data.agents;
  },

  getStats: async () => {
    const response = await api.get('/agents/stats');
    return response.data;
  },
};

// Config API
export const configAPI = {
  getConfig: async () => {
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

export default api;