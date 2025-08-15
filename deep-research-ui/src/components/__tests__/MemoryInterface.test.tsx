import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemoryInterface from '../memory/MemoryInterface';

// APIをモック
vi.mock('../../services/api', () => ({
  memoryAPI: {
    search: vi.fn().mockResolvedValue({
      entries: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    })
  }
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('MemoryInterface', () => {
  it('Memory Explorerタイトルが表示される', async () => {
    render(
      <MemoryInterface />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Memory Explorer')).toBeInTheDocument();
    });
  });

  it('検索フォームが表示される', async () => {
    render(
      <MemoryInterface />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search memory...')).toBeInTheDocument();
    });
  });
});