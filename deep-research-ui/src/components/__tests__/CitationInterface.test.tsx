import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CitationInterface from '../citations/CitationInterface';

// APIをモック
vi.mock('../../services/api', () => ({
  citationAPI: {
    list: vi.fn().mockResolvedValue({
      citations: [],
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

describe('CitationInterface', () => {
  it('Citation Managerタイトルが表示される', async () => {
    render(
      <CitationInterface />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Citation Manager')).toBeInTheDocument();
    });
  });

  it('Citationsセクションが表示される', async () => {
    render(
      <CitationInterface />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Citations')).toBeInTheDocument();
    });
  });
});