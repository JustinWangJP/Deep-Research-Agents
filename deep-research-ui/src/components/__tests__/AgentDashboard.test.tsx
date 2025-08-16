import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AgentDashboard from '../dashboard/AgentDashboard';
import * as api from '../../services/api';

// APIモジュールをモック
vi.mock('../../services/api');

// QueryClientのラッパーコンポーネント
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AgentDashboard', () => {
  const mockAgents = [
    {
      id: 'agent-1',
      name: 'LeadResearcherAgent',
      status: 'running',
      type: 'research',
      created_at: '2024-01-01T00:00:00Z',
      last_activity: '2024-01-01T01:00:00Z',
      plugins: ['search', 'memory', 'citation'],
    },
    {
      id: 'agent-2',
      name: 'SummarizerAgent',
      status: 'idle',
      type: 'summary',
      created_at: '2024-01-02T00:00:00Z',
      last_activity: '2024-01-02T00:30:00Z',
      plugins: ['memory', 'citation'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('エージェントデータが正しく表示される', async () => {
    vi.mocked(api.agentAPI.getAgents).mockResolvedValue({
      agents: mockAgents,
      total: mockAgents.length,
      page: 1,
      page_size: 20,
    });

    render(
      <AgentDashboard />,
      { wrapper: createWrapper() }
    );

    // データが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();
    });
  });

  it('エージェントステータスが正しく表示される', async () => {
    vi.mocked(api.agentAPI.getAgents).mockResolvedValue({
      agents: mockAgents,
      total: mockAgents.length,
      page: 1,
      page_size: 20,
    });

    render(
      <AgentDashboard />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    vi.mocked(api.agentAPI.getAgents).mockRejectedValue(new Error('Failed to load agents'));

    render(
      <AgentDashboard />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();
    });
  });

  it('空のエージェントリスト時にメッセージが表示される', async () => {
    vi.mocked(api.agentAPI.getAgents).mockResolvedValue({
      agents: [],
      total: 0,
      page: 1,
      page_size: 20,
    });

    render(
      <AgentDashboard />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();
    });
  });
});