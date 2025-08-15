/**
 * APIサービスのユニットテスト
 * HTTP通信、エラーハンドリング、リトライ機能をテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { searchAPI, memoryAPI, citationAPI, agentAPI, researchAPI, configAPI, healthAPI, httpUtils } from '../api';
import type { SearchQuery, SearchResponse, MemoryEntryCreate, CitationCreate } from '../types';

// axiosのモック
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// モックレスポンスの設定
const mockAxiosInstance = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    response: {
      use: vi.fn()
    }
  }
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAxios.create.mockReturnValue(mockAxiosInstance as never);
  
  // 環境変数のモック
  vi.stubEnv('VITE_API_URL', 'http://localhost:8000');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Search API', () => {
  describe('search', () => {
    it('should perform search successfully', async () => {
      const mockResponse: SearchResponse = {
        query_id: 'test-query-123',
        query: 'artificial intelligence',
        results: [
          {
            id: 'result-1',
            content: 'Test content about AI',
            title: 'AI Research Paper',
            source: 'azure',
            document_type: 'research',
            score: 0.9,
            confidence: 0.85,
            metadata: { author: 'Test Author' },
            created_at: new Date().toISOString()
          }
        ],
        total_results: 1,
        execution_time: 1.5,
        provider: SearchProvider.AZURE
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const query: SearchQuery = {
        query: 'artificial intelligence',
        max_results: 10,
        include_web: true
      };

      const result = await searchAPI.search(query);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/search', query);
      expect(result).toEqual(mockResponse);
    });

    it('should handle search error', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.post.mockRejectedValue(error);

      const query: SearchQuery = { query: 'test', max_results: 5 };

      await expect(searchAPI.search(query)).rejects.toThrow('Network error');
    });
  });

  describe('getProviders', () => {
    it('should fetch search providers', async () => {
      const mockProviders = [
        { name: 'azure', description: 'Azure AI Search', available: true, document_types: ['all'] },
        { name: 'tavily', description: 'Tavily Search', available: true, document_types: ['web'] }
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockProviders });

      const result = await searchAPI.getProviders();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/providers');
      expect(result).toEqual(mockProviders);
    });
  });

  describe('getDocumentTypes', () => {
    it('should fetch document types', async () => {
      const mockDocumentTypes = [
        { name: 'research', display_name: 'Research Papers', description: 'Academic papers' },
        { name: 'internal', display_name: 'Internal Documents', description: 'Company docs' }
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockDocumentTypes });

      const result = await searchAPI.getDocumentTypes();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/document-types');
      expect(result).toEqual(mockDocumentTypes);
    });
  });
});

describe('Memory API', () => {
  describe('store', () => {
    it('should store memory entry successfully', async () => {
      const mockEntry = {
        id: 'mem-123',
        content: 'Test memory content',
        entry_type: 'research',
        source: 'test-agent',
        memory_type: 'persistent',
        tags: ['test'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockEntry });

      const entry: MemoryEntryCreate = {
        content: 'Test memory content',
        entry_type: 'research',
        source: 'test-agent',
        memory_type: 'persistent',
        tags: ['test']
      };

      const result = await memoryAPI.store(entry);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/memory', entry);
      expect(result).toEqual(mockEntry);
    });
  });

  describe('search', () => {
    it('should search memory entries', async () => {
      const mockResponse = {
        entries: [
          { id: 'mem-1', content: 'Memory 1' },
          { id: 'mem-2', content: 'Memory 2' }
        ],
        total: 2,
        page: 1,
        page_size: 20
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await memoryAPI.search('test query', 1, 20, {
        entry_type: 'research',
        source: 'test-agent'
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/memory?query=test%20query&page=1&page_size=20&entry_type=research&source=test-agent'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle search with minimal parameters', async () => {
      const mockResponse = { entries: [], total: 0, page: 1, page_size: 20 };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      await memoryAPI.search('test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/memory?query=test&page=1&page_size=20'
      );
    });
  });

  describe('getStats', () => {
    it('should fetch memory statistics', async () => {
      const mockStats = {
        total_entries: 100,
        entry_types: { research: 50, general: 30, citation: 20 },
        sources: { agent1: 60, agent2: 40 },
        memory_types: { persistent: 70, session: 30 }
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockStats });

      const result = await memoryAPI.getStats();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/memory/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('delete', () => {
    it('should delete memory entry', async () => {
      const mockResponse = { success: true, message: 'Memory deleted' };
      mockAxiosInstance.delete.mockResolvedValue({ data: mockResponse });

      const result = await memoryAPI.delete('mem-123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/memory/mem-123');
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('Citation API', () => {
  describe('create', () => {
    it('should create citation successfully', async () => {
      const mockCitation = {
        id: 'cite-123',
        content: 'Test citation',
        source_title: 'Test Source',
        source_url: 'https://example.com',
        case_number: 'CASE-001',
        page_number: 42,
        confidence: 0.95,
        tags: ['test'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockCitation });

      const citation: CitationCreate = {
        content: 'Test citation',
        source_title: 'Test Source',
        source_url: 'https://example.com',
        case_number: 'CASE-001',
        page_number: 42,
        confidence: 0.95,
        tags: ['test']
      };

      const result = await citationAPI.create(citation);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/citations', citation);
      expect(result).toEqual(mockCitation);
    });
  });

  describe('list', () => {
    it('should list citations with pagination', async () => {
      const mockResponse = {
        citations: [
          { id: 'cite-1', content: 'Citation 1', source_title: 'Source 1' },
          { id: 'cite-2', content: 'Citation 2', source_title: 'Source 2' }
        ],
        total: 2,
        page: 1,
        page_size: 20
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      await citationAPI.list(1, 20, {
        case_number: 'CASE-001',
        source_title: 'Test'
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/citations?page=1&page_size=20&case_number=CASE-001&source_title=Test'
      );
    });
  });

  describe('get', () => {
    it('should get citation by id', async () => {
      const mockCitation = { id: 'cite-123', content: 'Test citation' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockCitation });

      const result = await citationAPI.get('cite-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/citations/cite-123');
      expect(result).toEqual(mockCitation);
    });
  });

  describe('update', () => {
    it('should update citation', async () => {
      const mockUpdated = { id: 'cite-123', content: 'Updated content' };
      mockAxiosInstance.put.mockResolvedValue({ data: mockUpdated });

      const updates = { content: 'Updated content' };
      const result = await citationAPI.update('cite-123', updates);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/citations/cite-123', updates);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('delete', () => {
    it('should delete citation', async () => {
      const mockResponse = { success: true, message: 'Citation deleted' };
      mockAxiosInstance.delete.mockResolvedValue({ data: mockResponse });

      const result = await citationAPI.delete('cite-123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/citations/cite-123');
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('Agent API', () => {
  describe('getAgents', () => {
    it('should fetch agents with pagination', async () => {
      const mockResponse = {
        agents: [
          { id: 'agent1', name: 'Agent 1', status: 'idle' },
          { id: 'agent2', name: 'Agent 2', status: 'running' }
        ],
        total: 2,
        page: 1,
        page_size: 20
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await agentAPI.getAgents(1, 20, 'idle');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/agents?page=1&page_size=20&status=idle'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch agents without status filter', async () => {
      const mockResponse = { agents: [], total: 0, page: 1, page_size: 20 };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      await agentAPI.getAgents(1, 20);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/agents?page=1&page_size=20'
      );
    });
  });

  describe('getAgent', () => {
    it('should fetch single agent', async () => {
      const mockAgent = { id: 'agent1', name: 'Test Agent', status: 'idle' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockAgent });

      const result = await agentAPI.getAgent('agent1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/agents/agent1');
      expect(result).toEqual(mockAgent);
    });
  });

  describe('getStats', () => {
    it('should fetch agent statistics', async () => {
      const mockStats = {
        total_agents: 10,
        active_agents: 5,
        completed_tasks: 100,
        uptime_percent: 99.9
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockStats });

      const result = await agentAPI.getStats();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/agents/stats');
      expect(result).toEqual(mockStats);
    });
  });
});

describe('Research API', () => {
  describe('createTask', () => {
    it('should create research task', async () => {
      const mockTask = {
        id: 'task-123',
        query: 'Test research',
        agents: ['agent1', 'agent2'],
        temperature: 'balanced',
        status: 'created',
        progress: 0
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockTask });

      const result = await researchAPI.createTask(
        'Test research',
        ['agent1', 'agent2'],
        'balanced',
        3
      );

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/research', {
        query: 'Test research',
        agents: ['agent1', 'agent2'],
        temperature: 'balanced',
        max_iterations: 3
      });
      expect(result).toEqual(mockTask);
    });

    it('should create task with defaults', async () => {
      const mockTask = { id: 'task-456', query: 'Test' };
      mockAxiosInstance.post.mockResolvedValue({ data: mockTask });

      await researchAPI.createTask('Test');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/research', {
        query: 'Test',
        temperature: 'balanced',
        max_iterations: 3
      });
    });
  });

  describe('getTasks', () => {
    it('should fetch research tasks', async () => {
      const mockResponse = {
        tasks: [
          { id: 'task-1', query: 'Query 1', status: 'completed' },
          { id: 'task-2', query: 'Query 2', status: 'running' }
        ],
        total: 2,
        page: 1,
        page_size: 20
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await researchAPI.getTasks(1, 20, 'completed');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/research?page=1&page_size=20&status=completed'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTask', () => {
    it('should fetch single task', async () => {
      const mockTask = { id: 'task-123', query: 'Test', status: 'running' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockTask });

      const result = await researchAPI.getTask('task-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/research/task-123');
      expect(result).toEqual(mockTask);
    });
  });
});

describe('Config API', () => {
  describe('getConfig', () => {
    it('should fetch configuration', async () => {
      const mockConfig = {
        document_types: [
          { name: 'research', display_name: 'Research Papers' }
        ],
        search_providers: [
          { name: 'azure', available: true }
        ],
        temperature_settings: { conservative: 0.2, balanced: 0.6 }
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockConfig });

      const result = await configAPI.getConfig();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/config');
      expect(result).toEqual(mockConfig);
    });
  });
});

describe('Health API', () => {
  describe('check', () => {
    it('should check health successfully', async () => {
      const mockHealth = {
        success: true,
        services: { search: true, memory: true },
        version: '2.0.0'
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockHealth });

      const result = await healthAPI.check();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('http://localhost:8000/health');
      expect(result).toEqual(mockHealth);
    });

    it('should handle health check failure', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(healthAPI.check()).rejects.toThrow('Network error');
    });
  });
});

describe('HTTP Utils', () => {
  describe('isBackendAvailable', () => {
    it('should return true when backend is available', async () => {
      const mockHealth = { success: true };
      mockAxiosInstance.get.mockResolvedValue({ data: mockHealth });

      const result = await httpUtils.isBackendAvailable();

      expect(result).toBe(true);
    });

    it('should return false when backend is not available', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await httpUtils.isBackendAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getApiDocsUrl', () => {
    it('should return correct API docs URL', () => {
      const url = httpUtils.getApiDocsUrl();
      expect(url).toBe('http://localhost:8000/docs');
    });
  });

  describe('getApiVersion', () => {
    it('should return API version when available', async () => {
      const mockHealth = { version: '2.0.0' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockHealth });

      const result = await httpUtils.getApiVersion();

      expect(result).toBe('2.0.0');
    });

    it('should return unknown when version fetch fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Failed'));

      const result = await httpUtils.getApiVersion();

      expect(result).toBe('unknown');
    });
  });
});

describe('Error Handling', () => {
  describe('Rate Limit Retry', () => {
    it('should retry on 429 error', async () => {
      const mockResponse = { data: { success: true } };
      
      // 最初は429エラー、次は成功
      mockAxiosInstance.post
        .mockRejectedValueOnce({ response: { status: 429 } })
        .mockResolvedValueOnce(mockResponse);

      const query: SearchQuery = { query: 'test', max_results: 5 };
      
      // タイマーをモック
      vi.useFakeTimers();
      
      const promise = searchAPI.search(query);
      
      // タイマーを進める
      vi.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });

    it('should not retry on non-429 errors', async () => {
      const error = { response: { status: 500 } };
      mockAxiosInstance.post.mockRejectedValue(error);

      const query: SearchQuery = { query: 'test', max_results: 5 };

      await expect(searchAPI.search(query)).rejects.toEqual(error);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });
  });
});