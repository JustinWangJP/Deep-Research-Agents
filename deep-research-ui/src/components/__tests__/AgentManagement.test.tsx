import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

describe('AgentManagement', () => {
  const mockAgents = [
    {
      id: 'agent-1',
      name: 'LeadResearcherAgent',
      status: 'active',
      type: 'research',
      createdAt: '2024-01-01T00:00:00Z',
      lastActivity: '2024-01-01T01:00:00Z',
      taskCount: 5,
      config: {
        temperature: 0.7,
        maxTokens: 4000,
      },
    },
    {
      id: 'agent-2',
      name: 'SummarizerAgent',
      status: 'idle',
      type: 'summary',
      createdAt: '2024-01-02T00:00:00Z',
      lastActivity: '2024-01-02T00:30:00Z',
      taskCount: 3,
      config: {
        temperature: 0.5,
        maxTokens: 2000,
      },
    },
    {
      id: 'agent-3',
      name: 'CriticAgent',
      status: 'error',
      type: 'validation',
      createdAt: '2024-01-03T00:00:00Z',
      lastActivity: '2024-01-03T00:15:00Z',
      taskCount: 1,
      config: {
        temperature: 0.3,
        maxTokens: 1000,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('エージェントデータが正しく表示される', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    // ローディング状態を表示
    expect(screen.getByText('エージェントを読み込んでいます...')).toBeInTheDocument();

    // データが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
      expect(screen.getByText('SummarizerAgent')).toBeInTheDocument();
      expect(screen.getByText('CriticAgent')).toBeInTheDocument();
    });
  });

  it('エージェントステータスが正しく表示される', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('アクティブ')).toBeInTheDocument();
      expect(screen.getByText('待機中')).toBeInTheDocument();
      expect(screen.getByText('エラー')).toBeInTheDocument();
    });
  });

  it('エージェント作成機能が正しく動作する', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);
    vi.mocked(api.agentApi.create).mockResolvedValue({ id: 'agent-4', success: true });

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
    });

    const createButton = screen.getByText('エージェント作成');
    fireEvent.click(createButton);

    // モーダルが表示される
    const modalTitle = await screen.findByText('新規エージェント作成');
    expect(modalTitle).toBeInTheDocument();

    const nameInput = screen.getByLabelText('名前');
    const typeSelect = screen.getByLabelText('タイプ');
    const temperatureInput = screen.getByLabelText('Temperature');
    const maxTokensInput = screen.getByLabelText('最大トークン数');
    const submitButton = screen.getByText('作成');

    // フォームに入力
    fireEvent.change(nameInput, { target: { value: 'New Agent' } });
    fireEvent.change(typeSelect, { target: { value: 'research' } });
    fireEvent.change(temperatureInput, { target: { value: '0.6' } });
    fireEvent.change(maxTokensInput, { target: { value: '3000' } });
    fireEvent.click(submitButton);

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.agentApi.create).toHaveBeenCalledWith({
        name: 'New Agent',
        type: 'research',
        config: {
          temperature: 0.6,
          maxTokens: 3000,
        },
      });
    });
  });

  it('エージェント編集機能が正しく動作する', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);
    vi.mocked(api.agentApi.update).mockResolvedValue({ success: true });

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
    });

    // 編集ボタンをクリック
    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);

    // モーダルが表示される
    const modalTitle = await screen.findByText('エージェント編集');
    expect(modalTitle).toBeInTheDocument();

    const nameInput = screen.getByLabelText('名前') as HTMLInputElement;
    expect(nameInput.value).toBe('LeadResearcherAgent');

    const submitButton = screen.getByText('更新');
    fireEvent.change(nameInput, { target: { value: 'Updated Agent' } });
    fireEvent.click(submitButton);

    // 更新APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.agentApi.update).toHaveBeenCalledWith('agent-1', {
        name: 'Updated Agent',
        type: 'research',
        config: {
          temperature: 0.7,
          maxTokens: 4000,
        },
      });
    });
  });

  it('エージェント削除機能が正しく動作する', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);
    vi.mocked(api.agentApi.delete).mockResolvedValue({ success: true });

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログでOKをクリック
    const confirmButton = await screen.findByText('削除する');
    fireEvent.click(confirmButton);

    // 削除APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.agentApi.delete).toHaveBeenCalledWith('agent-1');
    });
  });

  it('エージェント起動機能が正しく動作する', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);
    vi.mocked(api.agentApi.start).mockResolvedValue({ success: true });

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
    });

    // 起動ボタンをクリック（待機中のエージェント）
    const startButtons = screen.getAllByText('起動');
    fireEvent.click(startButtons[0]);

    // 起動APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.agentApi.start).toHaveBeenCalledWith('agent-2');
    });
  });

  it('エージェント停止機能が正しく動作する', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);
    vi.mocked(api.agentApi.stop).mockResolvedValue({ success: true });

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
    });

    // 停止ボタンをクリック（アクティブなエージェント）
    const stopButtons = screen.getAllByText('停止');
    fireEvent.click(stopButtons[0]);

    // 停止APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.agentApi.stop).toHaveBeenCalledWith('agent-1');
    });
  });

  it('エージェントログが正しく表示される', async () => {
    const mockLogs = [
      { timestamp: '2024-01-01T01:00:00Z', level: 'INFO', message: 'Agent started' },
      { timestamp: '2024-01-01T01:05:00Z', level: 'ERROR', message: 'Task failed' },
    ];

    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);
    vi.mocked(api.agentApi.getLogs).mockResolvedValue(mockLogs);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
    });

    // ログボタンをクリック
    const logButtons = screen.getAllByText('ログ');
    fireEvent.click(logButtons[0]);

    // ログが表示される
    await waitFor(() => {
      expect(screen.getByText('Agent started')).toBeInTheDocument();
      expect(screen.getByText('Task failed')).toBeInTheDocument();
    });
  });

  it('タスク数が正しく表示される', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('タスク数: 5')).toBeInTheDocument();
      expect(screen.getByText('タスク数: 3')).toBeInTheDocument();
      expect(screen.getByText('タスク数: 1')).toBeInTheDocument();
    });
  });

  it('最終活動時刻が正しく表示される', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('最終活動: 2024/01/01 01:00')).toBeInTheDocument();
      expect(screen.getByText('最終活動: 2024/01/02 00:30')).toBeInTheDocument();
    });
  });

  it('設定情報が正しく表示される', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Temperature: 0.7')).toBeInTheDocument();
      expect(screen.getByText('Max Tokens: 4000')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    vi.mocked(api.agentApi.getAll).mockRejectedValue(new Error('Failed to load agents'));

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to load agents')).toBeInTheDocument();
    });
  });

  it('空のエージェントリスト時にメッセージが表示される', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue([]);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('エージェントが見つかりません')).toBeInTheDocument();
    });
  });

  it('フィルタリング機能が正しく動作する', async () => {
    vi.mocked(api.agentApi.getAll).mockResolvedValue(mockAgents);

    render(
      <AgentManagement />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
    });

    const filterSelect = screen.getByLabelText('ステータスフィルタ');
    fireEvent.change(filterSelect, { target: { value: 'active' } });

    // フィルタリングされた結果が表示される
    await waitFor(() => {
      expect(screen.getByText('LeadResearcherAgent')).toBeInTheDocument();
      expect(screen.queryByText('SummarizerAgent')).not.toBeInTheDocument();
    });
  });
});