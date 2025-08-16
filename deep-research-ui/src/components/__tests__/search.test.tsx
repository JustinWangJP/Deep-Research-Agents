/**
 * 検索コンポーネントのユニットテスト
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchInterface from '../search/SearchInterface';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('SearchInterface', () => {
  it('Search Interfaceタイトルが表示される', () => {
    render(
      <SearchInterface />,
      { wrapper }
    );

    expect(screen.getByText('Search Interface')).toBeInTheDocument();
  });

  it('検索フォームが表示される', () => {
    render(
      <SearchInterface />,
      { wrapper }
    );

    expect(screen.getByPlaceholderText('Enter your search query...')).toBeInTheDocument();
  });

  it('Max Results入力フィールドが表示される', () => {
    render(
      <SearchInterface />,
      { wrapper }
    );

    expect(screen.getByText('Max Results')).toBeInTheDocument();
  });

  it('Document Type選択フィールドが表示される', () => {
    render(
      <SearchInterface />,
      { wrapper }
    );

    expect(screen.getByText('Document Type')).toBeInTheDocument();
  });
});