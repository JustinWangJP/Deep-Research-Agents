import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryInterface } from '../MemoryInterface';
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

describe('MemoryInterface', () => {
  const mockMemoryData = [
    {
      id: '1',
      content: 'Test memory content 1',
      source: 'internal-document',
      timestamp: '2024-01-01T00:00:00Z',
      relevance: 0.9,
    },
    {
      id: '2',
      content: 'Test memory content 2',
      source: 'user-input',
      timestamp: '2024-01-02T00:00:00Z',
      relevance: 0.8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('メモリデータが正しく表示される', async () => {
    // API呼び出しをモック
    vi.mocked(api.memoryAPI.search).mockResolvedValue(mockMemoryData);

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    // ローディング状態を表示
    expect(screen.getByText('メモリを検索中...')).toBeInTheDocument();

    // データが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('Test memory content 1')).toBeInTheDocument();
      expect(screen.getByText('Test memory content 2')).toBeInTheDocument();
    });
  });

  it('検索機能が正しく動作する', async () => {
    vi.mocked(api.memoryAPI.search).mockResolvedValue(mockMemoryData);

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Test memory content 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('メモリを検索...');
    const searchButton = screen.getByText('検索');

    // 検索クエリを入力
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    // 検索APIが正しいパラメータで呼ばれたことを確認
    await waitFor(() => {
      expect(api.memoryAPI.search).toHaveBeenCalledWith('test query');
    });
  });

  it('メモリ追加機能が正しく動作する', async () => {
    vi.mocked(api.memoryAPI.search).mockResolvedValue(mockMemoryData);
    vi.mocked(api.memoryAPI.store).mockResolvedValue({
      id: '3',
      content: 'New memory content',
      source: 'user-input',
      timestamp: new Date().toISOString(),
      relevance: 0.0
    });

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Test memory content 1')).toBeInTheDocument();
    });

    const addButton = screen.getByText('メモリ追加');
    fireEvent.click(addButton);

    // モーダルが表示される
    const modalTitle = await screen.findByText('新規メモリ追加');
    expect(modalTitle).toBeInTheDocument();

    const contentInput = screen.getByLabelText('内容');
    const sourceInput = screen.getByLabelText('ソース');
    const submitButton = screen.getByText('追加');

    // フォームに入力
    fireEvent.change(contentInput, { target: { value: 'New memory content' } });
    fireEvent.change(sourceInput, { target: { value: 'user-input' } });
    fireEvent.click(submitButton);

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.memoryAPI.store).toHaveBeenCalledWith({
        content: 'New memory content',
        entry_type: 'general',
        source: 'user-input',
        memory_type: 'persistent',
      });
    });
  });

  it('メモリ削除機能が正しく動作する', async () => {
    vi.mocked(api.memoryAPI.search).mockResolvedValue(mockMemoryData);
    vi.mocked(api.memoryAPI.delete).mockResolvedValue({ success: true });

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Test memory content 1')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログでOKをクリック
    const confirmButton = await screen.findByText('削除する');
    fireEvent.click(confirmButton);

    // 削除APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.memoryAPI.delete).toHaveBeenCalledWith('1');
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    vi.mocked(api.memoryAPI.search).mockRejectedValue(new Error('Search failed'));

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('エラー: Search failed')).toBeInTheDocument();
    });
  });

  it('空の検索結果時にメッセージが表示される', async () => {
    vi.mocked(api.memoryAPI.search).mockResolvedValue([]);

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('メモリが見つかりません')).toBeInTheDocument();
    });
  });

  it('関連度スコアが正しく表示される', async () => {
    vi.mocked(api.memoryAPI.search).mockResolvedValue(mockMemoryData);

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('関連度: 90%')).toBeInTheDocument();
      expect(screen.getByText('関連度: 80%')).toBeInTheDocument();
    });
  });

  it('タイムスタンプが正しくフォーマットされる', async () => {
    vi.mocked(api.memoryAPI.search).mockResolvedValue(mockMemoryData);

    render(
      <MemoryInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('2024年1月1日')).toBeInTheDocument();
      expect(screen.getByText('2024年1月2日')).toBeInTheDocument();
    });
  });
});