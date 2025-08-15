import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CitationInterface } from '../CitationInterface';
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

describe('CitationInterface', () => {
  const mockCitations = [
    {
      id: '1',
      content: 'Citation content 1',
      source: 'https://example.com/source1',
      title: 'Source Title 1',
      author: 'Author 1',
      publishDate: '2024-01-01',
      confidence: 0.95,
      relevance: 0.9,
    },
    {
      id: '2',
      content: 'Citation content 2',
      source: 'https://example.com/source2',
      title: 'Source Title 2',
      author: 'Author 2',
      publishDate: '2024-01-02',
      confidence: 0.85,
      relevance: 0.8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('引用データが正しく表示される', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    // ローディング状態を表示
    expect(screen.getByText('引用を読み込んでいます...')).toBeInTheDocument();

    // データが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('Citation content 1')).toBeInTheDocument();
      expect(screen.getByText('Citation content 2')).toBeInTheDocument();
    });
  });

  it('検索機能が正しく動作する', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: [mockCitations[0]],
      total: 1,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Citation content 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('引用を検索...');
    const searchButton = screen.getByText('検索');

    // 検索クエリを入力
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(searchButton);

    // 検索APIが正しいパラメータで呼ばれたことを確認
    await waitFor(() => {
      expect(api.citationApi.search).toHaveBeenCalledWith('test query');
    });
  });

  it('新規引用追加機能が正しく動作する', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });
    vi.mocked(api.citationApi.add).mockResolvedValue({ id: '3', success: true });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Citation content 1')).toBeInTheDocument();
    });

    const addButton = screen.getByText('引用追加');
    fireEvent.click(addButton);

    // モーダルが表示される
    const modalTitle = await screen.findByText('新規引用追加');
    expect(modalTitle).toBeInTheDocument();

    const contentInput = screen.getByLabelText('内容');
    const sourceInput = screen.getByLabelText('ソースURL');
    const titleInput = screen.getByLabelText('タイトル');
    const authorInput = screen.getByLabelText('著者');
    const submitButton = screen.getByText('追加');

    // フォームに入力
    fireEvent.change(contentInput, { target: { value: 'New citation content' } });
    fireEvent.change(sourceInput, { target: { value: 'https://example.com/new' } });
    fireEvent.change(titleInput, { target: { value: 'New Source Title' } });
    fireEvent.change(authorInput, { target: { value: 'New Author' } });
    fireEvent.click(submitButton);

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.citationApi.add).toHaveBeenCalledWith({
        content: 'New citation content',
        source: 'https://example.com/new',
        title: 'New Source Title',
        author: 'New Author',
      });
    });
  });

  it('引用編集機能が正しく動作する', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });
    vi.mocked(api.citationApi.update).mockResolvedValue({ success: true });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Citation content 1')).toBeInTheDocument();
    });

    // 編集ボタンをクリック
    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);

    // モーダルが表示される
    const modalTitle = await screen.findByText('引用編集');
    expect(modalTitle).toBeInTheDocument();

    const contentInput = screen.getByLabelText('内容') as HTMLInputElement;
    expect(contentInput.value).toBe('Citation content 1');

    const submitButton = screen.getByText('更新');
    fireEvent.change(contentInput, { target: { value: 'Updated citation content' } });
    fireEvent.click(submitButton);

    // 更新APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.citationApi.update).toHaveBeenCalledWith('1', {
        content: 'Updated citation content',
        source: 'https://example.com/source1',
        title: 'Source Title 1',
        author: 'Author 1',
        publishDate: '2024-01-01',
        confidence: 0.95,
        relevance: 0.9,
      });
    });
  });

  it('引用削除機能が正しく動作する', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });
    vi.mocked(api.citationApi.delete).mockResolvedValue({ success: true });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Citation content 1')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログでOKをクリック
    const confirmButton = await screen.findByText('削除する');
    fireEvent.click(confirmButton);

    // 削除APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.citationApi.delete).toHaveBeenCalledWith('1');
    });
  });

  it('信頼度スコアが正しく表示される', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('信頼度: 95%')).toBeInTheDocument();
      expect(screen.getByText('信頼度: 85%')).toBeInTheDocument();
    });
  });

  it('関連度スコアが正しく表示される', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('関連度: 90%')).toBeInTheDocument();
      expect(screen.getByText('関連度: 80%')).toBeInTheDocument();
    });
  });

  it('出版日が正しく表示される', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('2024年1月1日')).toBeInTheDocument();
      expect(screen.getByText('2024年1月2日')).toBeInTheDocument();
    });
  });

  it('ソースURLがリンクとして表示される', async () => {
    vi.mocked(api.citationAPI.list).mockResolvedValue({
      citations: mockCitations,
      total: mockCitations.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    });

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', 'https://example.com/source1');
      expect(links[1]).toHaveAttribute('href', 'https://example.com/source2');
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    vi.mocked(api.citationApi.getAll).mockRejectedValue(new Error('Failed to load'));

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('エラー: Failed to load')).toBeInTheDocument();
    });
  });

  it('空の検索結果時にメッセージが表示される', async () => {
    vi.mocked(api.citationApi.getAll).mockResolvedValue([]);

    render(
      <CitationInterface />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('引用が見つかりません')).toBeInTheDocument();
    });
  });
});