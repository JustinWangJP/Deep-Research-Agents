import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { searchAPI } from '../../services/api';

const SearchInterface: React.FC = () => {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Interface</h1>
      
      <form onSubmit={handleSearch} className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Results
              </label>
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="research">Research Papers</option>
                <option value="documentation">Documentation</option>
                <option value="code">Code</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6">
          <div className="text-red-500">Error: {(error as Error).message}</div>
        </div>
      )}

      {searchResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results ({searchResults.total_results} found)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Query: "{searchResults.query}" - Completed in {searchResults.execution_time.toFixed(2)}s
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.results.map((result) => (
              <div key={result.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {result.title}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Score: {result.score.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {result.content}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Source: {result.source}</span>
                  <span>Type: {result.document_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;