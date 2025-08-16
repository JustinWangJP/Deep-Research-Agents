import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchAPI } from '../../services/api';
import { useNumberFormat, useDateTimeFormat } from '../../i18n/formatters';

const SearchInterface: React.FC = () => {
  const { t } = useTranslation(['search', 'common', 'errors']);
  const { formatNumber } = useNumberFormat();
  const { formatShortDate } = useDateTimeFormat();
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [documentType, setDocumentType] = useState<string>('');
  
  const [searchParams, setSearchParams] = useState<{
    query: string;
    maxResults: number;
    documentType?: string;
  } | null>(null);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', searchParams],
    queryFn: () => {
      if (!searchParams) return Promise.resolve(null);
      return searchAPI.search(searchParams);
    },
    enabled: !!searchParams,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({
        query: query.trim(),
        maxResults,
        documentType: documentType || undefined,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('search:title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('search:subtitle')}
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('search:form.query.label')}
            </label>
            <input
              id="search-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search:form.query.placeholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
            {!query.trim() && (
              <p className="text-xs text-red-500 mt-1">
                {t('search:form.query.required')}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="max-results" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search:form.maxResults.label')}
              </label>
              <input
                id="max-results"
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search:form.documentType.label')}
              </label>
              <select
                id="document-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('search:form.documentType.all')}</option>
                <option value="research">Research Papers</option>
                <option value="documentation">Documentation</option>
                <option value="code">Code</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoading ? t('search:results.loading') : t('search:actions.search')}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDocumentType('');
                setSearchParams(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('search:actions.clear')}
            </button>
          </div>
        </div>
      </form>

      {isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
            {t('search:results.loading')}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-medium">{t('search:results.error')}</h3>
            <p className="mt-1">{t('errors:api.searchFailed')}: {(error as Error).message}</p>
          </div>
        </div>
      )}

      {searchResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('search:results.title')} ({searchResults.total_results} {t('search:results.totalResults')})
              </h2>
              <button
                type="button"
                onClick={() => {
                  // Export functionality can be added here
                  console.log('Export results');
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('search:actions.export')}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>"{searchResults.query}"</span>
              <span>{t('search:results.executionTime')}: {formatNumber(searchResults.execution_time, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}s</span>
              <span>{t('search:results.provider')}: {searchResults.provider}</span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.results && searchResults.results.length > 0 ? (
              searchResults.results.map((result) => (
                <div key={result.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                      {result.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                        {t('search:results.score')}: {formatNumber(result.score, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                        {t('search:results.confidence')}: {formatNumber(result.confidence, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                    {result.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{t('search:results.source')}: {result.source}</span>
                      {result.document_type && (
                        <span>Type: {result.document_type}</span>
                      )}
                      {result.created_at && (
                        <span>{formatShortDate(result.created_at)}</span>
                      )}
                    </div>
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {t('common:common.view')} →
                      </a>
                    )}
                  </div>
                  {result.highlights && Object.keys(result.highlights).length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('search:results.highlights')}:
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(result.highlights).map(([field, highlights]) => (
                          <div key={field} className="text-xs">
                            <span className="font-medium text-gray-600 dark:text-gray-400">{field}:</span>
                            {highlights.map((highlight, index) => (
                              <span key={index} className="ml-2 text-gray-700 dark:text-gray-300">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('search:results.empty')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;