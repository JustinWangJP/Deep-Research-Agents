import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';

// コンポーネントをインポート
import AgentManagement from '../agents/AgentManagement';
import SearchInterface from '../search/SearchInterface';
import MemoryInterface from '../memory/MemoryInterface';
import CitationInterface from '../citations/CitationInterface';

// APIをモック
vi.mock('../../services/api', () => ({
  agentAPI: {
    getAgents: vi.fn().mockResolvedValue({
      agents: [
        {
          id: '1',
          name: 'Test Agent',
          status: 'running',
          description: 'Test description',
          plugins: ['web_search'],
          last_activity: new Date().toISOString()
        }
      ],
      total: 1,
      page: 1,
      has_next: false
    })
  },
  searchAPI: {
    search: vi.fn().mockResolvedValue({
      results: [],
      total_results: 0,
      query: '',
      execution_time: 0,
      provider: 'test'
    })
  },
  memoryAPI: {
    search: vi.fn().mockResolvedValue({
      entries: [],
      total: 0,
      page: 1,
      has_next: false
    })
  },
  citationAPI: {
    list: vi.fn().mockResolvedValue({
      citations: [],
      total: 0,
      page: 1,
      has_next: false
    })
  }
}));

// フックをモック
vi.mock('../../hooks/useAgents', () => ({
  useAgents: vi.fn().mockReturnValue({
    agents: [
      {
        id: '1',
        name: 'Test Agent',
        status: 'running',
        description: 'Test description',
        plugins: ['web_search'],
        last_activity: new Date().toISOString()
      }
    ],
    stats: {
      total_agents: 5,
      active_agents: 3,
      completed_tasks: 100
    },
    isLoading: false
  })
}));

// テスト用のラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode; language?: string }> = ({ 
  children, 
  language = 'en' 
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  // 言語を同期的に設定
  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe('Component i18n Integration', () => {
  beforeEach(async () => {
    // i18nが初期化されるまで待機
    if (!i18n.isInitialized) {
      await i18n.init();
    }
  });



  describe('AgentManagement Component', () => {
    test('renders agent management loading state in English', () => {
      render(
        <TestWrapper language="en">
          <AgentManagement />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders agent management loading state in Japanese', () => {
      render(
        <TestWrapper language="ja">
          <AgentManagement />
        </TestWrapper>
      );

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('SearchInterface Component', () => {
    test('renders search interface in English', () => {
      render(
        <TestWrapper language="en">
          <SearchInterface />
        </TestWrapper>
      );

      expect(screen.getByText('Search Interface')).toBeInTheDocument();
      expect(screen.getByText('Search through research documents and data')).toBeInTheDocument();
      expect(screen.getByLabelText('Search Query')).toBeInTheDocument();
    });

    test('renders search interface in Japanese', () => {
      render(
        <TestWrapper language="ja">
          <SearchInterface />
        </TestWrapper>
      );

      expect(screen.getByText('検索インターフェース')).toBeInTheDocument();
      expect(screen.getByText('研究文書とデータを検索')).toBeInTheDocument();
      expect(screen.getByLabelText('検索クエリ')).toBeInTheDocument();
    });

    test('renders form elements with correct placeholders', () => {
      render(
        <TestWrapper language="en">
          <SearchInterface />
        </TestWrapper>
      );

      const queryInput = screen.getByPlaceholderText('Enter your search query...');
      expect(queryInput).toBeInTheDocument();
    });
  });

  describe('MemoryInterface Component', () => {
    test('renders memory interface in English', () => {
      render(
        <TestWrapper language="en">
          <MemoryInterface />
        </TestWrapper>
      );

      expect(screen.getByText('Memory Management')).toBeInTheDocument();
      expect(screen.getByText('Manage agent memory and knowledge base')).toBeInTheDocument();
    });

    test('renders memory interface in Japanese', () => {
      render(
        <TestWrapper language="ja">
          <MemoryInterface />
        </TestWrapper>
      );

      expect(screen.getByText('メモリ管理')).toBeInTheDocument();
      expect(screen.getByText('エージェントメモリと知識ベースの管理')).toBeInTheDocument();
    });
  });

  describe('CitationInterface Component', () => {
    test('renders citation interface loading state in English', () => {
      render(
        <TestWrapper language="en">
          <CitationInterface />
        </TestWrapper>
      );

      expect(screen.getByText('Loading citations...')).toBeInTheDocument();
    });

    test('renders citation interface loading state in Japanese', () => {
      render(
        <TestWrapper language="ja">
          <CitationInterface />
        </TestWrapper>
      );

      expect(screen.getByText('引用を読み込み中...')).toBeInTheDocument();
    });
  });
});

describe('Dynamic Content Translation', () => {
  test('status translations work correctly', () => {
    const statuses = ['idle', 'running', 'completed', 'error', 'paused'];
    
    statuses.forEach(status => {
      // 英語でのステータス翻訳をテスト
      i18n.changeLanguage('en');
      const enTranslation = i18n.t(`common:status.${status}`);
      expect(enTranslation).not.toBe(`common:status.${status}`); // キーがそのまま返されていないことを確認
      
      // 日本語でのステータス翻訳をテスト
      i18n.changeLanguage('ja');
      const jaTranslation = i18n.t(`common:status.${status}`);
      expect(jaTranslation).not.toBe(`common:status.${status}`); // キーがそのまま返されていないことを確認
      
      // 英語と日本語の翻訳が異なることを確認
      expect(enTranslation).not.toBe(jaTranslation);
    });
  });

  test('navigation translations work correctly', () => {
    const navItems = ['dashboard', 'agents', 'search', 'memory', 'citations'];
    
    navItems.forEach(item => {
      // 英語でのナビゲーション翻訳をテスト
      i18n.changeLanguage('en');
      const enTranslation = i18n.t(`common:navigation.${item}`);
      expect(enTranslation).not.toBe(`common:navigation.${item}`);
      
      // 日本語でのナビゲーション翻訳をテスト
      i18n.changeLanguage('ja');
      const jaTranslation = i18n.t(`common:navigation.${item}`);
      expect(jaTranslation).not.toBe(`common:navigation.${item}`);
      
      // 英語と日本語の翻訳が異なることを確認（dashboardを除く）
      if (item !== 'dashboard') {
        expect(enTranslation).not.toBe(jaTranslation);
      }
    });
  });
});

describe('Error Handling Translation', () => {
  test('error messages are translated correctly', () => {
    const errorTypes = ['agentNotFound', 'searchFailed', 'memoryError', 'citationError'];
    
    errorTypes.forEach(errorType => {
      // 英語でのエラー翻訳をテスト
      i18n.changeLanguage('en');
      const enTranslation = i18n.t(`errors:api.${errorType}`);
      expect(enTranslation).not.toBe(`errors:api.${errorType}`);
      
      // 日本語でのエラー翻訳をテスト
      i18n.changeLanguage('ja');
      const jaTranslation = i18n.t(`errors:api.${errorType}`);
      expect(jaTranslation).not.toBe(`errors:api.${errorType}`);
      
      // 英語と日本語の翻訳が異なることを確認
      expect(enTranslation).not.toBe(jaTranslation);
    });
  });

  test('form validation messages are translated correctly', () => {
    const validationTypes = ['required', 'email', 'minLength', 'maxLength'];
    
    validationTypes.forEach(validationType => {
      // 英語での検証メッセージ翻訳をテスト
      i18n.changeLanguage('en');
      const enTranslation = i18n.t(`forms:validation.${validationType}`);
      expect(enTranslation).not.toBe(`forms:validation.${validationType}`);
      
      // 日本語での検証メッセージ翻訳をテスト
      i18n.changeLanguage('ja');
      const jaTranslation = i18n.t(`forms:validation.${validationType}`);
      expect(jaTranslation).not.toBe(`forms:validation.${validationType}`);
      
      // 英語と日本語の翻訳が異なることを確認
      expect(enTranslation).not.toBe(jaTranslation);
    });
  });
});