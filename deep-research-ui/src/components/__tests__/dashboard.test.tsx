/**
 * ダッシュボードコンポーネントのユニットテスト
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import Dashboard from '../dashboard/Dashboard';

// モックデータ
const mockAgents = [
  { id: '1', name: 'Test Agent 1', description: 'Test description 1', status: 'running' },
  { id: '2', name: 'Test Agent 2', description: 'Test description 2', status: 'completed' },
];

const mockStats = {
  total_agents: 5,
  active_agents: 3,
  completed_tasks: 100,
  failed_tasks: 5,
  average_response_time: 1.5,
  uptime_percent: 99.9
};

vi.mock('../../hooks/useAgents', () => ({
  useAgents: () => ({ agents: mockAgents, stats: mockStats, isLoading: false })
}));

describe('Dashboard', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    i18n.changeLanguage('en');
    return (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </QueryClientProvider>
    );
  };

  it('should display agent statistics when loaded', async () => {
    render(
      <Dashboard />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('should display recent activity', async () => {
    render(
      <Dashboard />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });
});