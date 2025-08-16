import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class I18nErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // エラーログを記録
    console.error('I18n Error Boundary caught an error:', error, errorInfo);

    // カスタムエラーハンドラーを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // エラー追跡サービスに送信（例：Sentry）
    if (process.env.NODE_ENV === 'production') {
      // window.Sentry?.captureException(error, { extra: errorInfo });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback, t } = this.props;

    if (hasError && error) {
      // カスタムフォールバックコンポーネントが提供されている場合
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetError} />;
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('errors:generic.unknown', 'Something went wrong')}
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('errors:generic.tryAgain', 'Please try refreshing the page or contact support if the problem persists.')}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                  Development Error Details:
                </h4>
                <pre className="text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap">
                  {error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-red-600 dark:text-red-500 whitespace-pre-wrap mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('common:common.refresh', 'Try Again')}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {t('common:common.refresh', 'Refresh Page')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// withTranslationでラップしてエクスポート
export const I18nErrorBoundary = withTranslation(['common', 'errors'])(I18nErrorBoundaryClass);

// デフォルトのフォールバックコンポーネント
export const DefaultI18nFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Translation Error
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          There was an error loading the translations.
        </p>
        <button
          onClick={resetError}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 text-left text-sm text-red-600 bg-red-50 p-4 rounded">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
};