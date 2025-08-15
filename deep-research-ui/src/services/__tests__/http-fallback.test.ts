import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpUtils, healthAPI } from '../api';

// Test HTTP fallback functionality
describe('HTTP Fallback Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect when backend is available', async () => {
    vi.spyOn(healthAPI, 'check').mockResolvedValueOnce({
      services: { agents: true },
      version: '2.0.0',
      uptime: 12345
    });

    const isAvailable = await httpUtils.isBackendAvailable();
    expect(isAvailable).toBe(true);
  });

  it('should detect when backend is unavailable', async () => {
    vi.spyOn(healthAPI, 'check').mockRejectedValueOnce(new Error('Network error'));

    const isAvailable = await httpUtils.isBackendAvailable();
    expect(isAvailable).toBe(false);
  });

  it('should return correct API documentation URL', () => {
    const docsUrl = httpUtils.getApiDocsUrl();
    expect(docsUrl).toBe('http://localhost:8000/docs');
  });

  it('should handle API version retrieval', async () => {
    const mockResponse = {
      version: '2.0.0'
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const version = await httpUtils.getApiVersion();
    expect(version).toBe('2.0.0');
  });

  it('should handle API version retrieval failure', async () => {
    vi.spyOn(healthAPI, 'check').mockRejectedValueOnce(new Error('Network error'));

    const version = await httpUtils.getApiVersion();
    expect(version).toBe('unknown'); // Default version when fetch fails
  });
});

// Test agent API with HTTP endpoints
describe('Agent API Tests', () => {
  it('should format pagination parameters correctly', () => {
    const params = new URLSearchParams({
      page: '1',
      page_size: '20',
      status: 'idle'
    });
    expect(params.toString()).toBe('page=1&page_size=20&status=idle');
  });

  it('should handle empty filters gracefully', () => {
    const params = new URLSearchParams({
      page: '1',
      page_size: '20',
    });
    expect(params.toString()).toBe('page=1&page_size=20');
  });
});