/**
 * ダッシュボードコンポーネントのユニットテスト
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../dashboard/Dashboard';

// APIサービスのモック
vi.mock('../../services/api', () => ({
  agentAPI: {
    getStats: vi.fn().mockResolvedValue({
      total_agents: 5,
      active_agents: 3,
      completed_tasks: 100,
      failed_tasks: 5,
      average_response_time: 1.5,
      uptime_percent: 99.9
    })
  },
  searchAPI: {
    getProviders: vi.fn().mockResolvedValue([
      { name: 'azure', available: true },
      { name: 'tavily', available: true }
    ])
  },
  memoryAPI: {
    getStats: vi.fn().mockResolvedValue({
      total_entries: 150,
      entry_types: { research: 80, general: 40, citation: 30 }
    })
  }
}));

describe('Dashboard', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render loading state initially', () => {
    render(
      <Dashboard />,
      { wrapper }
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display agent statistics when loaded', async () => {
    render(
      <Dashboard />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('should display memory statistics', async () => {
    render(
      <Dashboard />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });
});