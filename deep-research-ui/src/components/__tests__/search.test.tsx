/**
 * 検索コンポーネントのユニットテスト
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchInterface from '../search/SearchInterface';

// APIサービスのモック
vi.mock('../../services/api', () => ({
  searchAPI: {
    search: vi.fn().mockResolvedValue({
      query_id: 'test-123',
      query: 'test query',
      results: [
        {
          id: 'result-1',
          title: 'Test Result 1',
          content: 'Test content 1',
          source: 'azure',
          score: 0.9
        },
        {
          id: 'result-2',
          title: 'Test Result 2',
          content: 'Test content 2',
          source: 'tavily',
          score: 0.8
        }
      ],
      total_results: 2
    }),
    getProviders: vi.fn().mockResolvedValue([
      { name: 'azure', description: 'Azure AI Search', available: true },
      { name: 'tavily', description: 'Web Search', available: true }
    ]),
    getDocumentTypes: vi.fn().mockResolvedValue([
      { name: 'research', display_name: 'Research Papers' },
      { name: 'internal', display_name: 'Internal Documents' }
    ])
  }
}));

describe('SearchInterface', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render search form', () => {
    render(
      <SearchInterface />,
      { wrapper }
    );

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    render(
      <SearchInterface />,
      { wrapper }
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput).toHaveValue('test query');
  });

  it('should trigger search on submit', async () => {
    render(
      <SearchInterface />,
      { wrapper }
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Result 1')).toBeInTheDocument();
      expect(screen.getByText('Test Result 2')).toBeInTheDocument();
    });
  });

  it('should display loading state during search', async () => {
    const { searchAPI } = await import('../../services/api');
    vi.mocked(searchAPI.search).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <SearchInterface />,
      { wrapper }
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('should display no results message', async () => {
    const { searchAPI } = await import('../../services/api');
    vi.mocked(searchAPI.search).mockResolvedValue({
      query_id: 'test-456',
      query: 'no results',
      results: [],
      total_results: 0
    });

    render(
      <SearchInterface />,
      { wrapper }
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'no results' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });
});