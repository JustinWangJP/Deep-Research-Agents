import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { memoryAPI } from '../../services/api';
import type { MemoryEntry } from '../../types';
import { useNumberFormat, useDateTimeFormat } from '../../i18n/formatters';

const MemoryInterface: React.FC = () => {
  const { t } = useTranslation(['memory', 'common', 'errors']);
  const { formatNumber } = useNumberFormat();
  const { formatShortDate } = useDateTimeFormat();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('');
  const [memoryTypeFilter, setMemoryTypeFilter] = useState<string>('');
  
  const { data: memoryData, isLoading, error } = useQuery({
    queryKey: ['memory', query, page, entryTypeFilter, memoryTypeFilter],
    queryFn: () => memoryAPI.search(query, page, 20, { entry_type: entryTypeFilter || undefined }),
    enabled: query.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
          {t('memory:list.loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-medium">{t('common:common.error')}</h3>
          <p className="mt-1">{t('errors:api.memoryError')}: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('memory:title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('memory:subtitle')}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('memory:actions.search')}
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('memory:actions.search')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('memory:entry.type')}
              </label>
              <select
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('common:common.filter')} - {t('memory:entry.type')}</option>
                <option value="general">{t('memory:types.general')}</option>
                <option value="research">{t('memory:types.research')}</option>
                <option value="citation">{t('memory:types.citation')}</option>
                <option value="agent_communication">{t('memory:types.agent_communication')}</option>
                <option value="system">{t('memory:types.system')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('memory:entry.memoryType')}
              </label>
              <select
                value={memoryTypeFilter}
                onChange={(e) => setMemoryTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('common:common.filter')} - {t('memory:entry.memoryType')}</option>
                <option value="session">{t('memory:memoryTypes.session')}</option>
                <option value="persistent">{t('memory:memoryTypes.persistent')}</option>
                <option value="temporary">{t('memory:memoryTypes.temporary')}</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!query.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('memory:actions.search')}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setEntryTypeFilter('');
                setMemoryTypeFilter('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('common:common.reset')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('memory:list.title')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Add entry functionality can be added here
                  console.log('Add memory entry');
                }}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                {t('memory:actions.add')}
              </button>
              <button
                onClick={() => {
                  // Export functionality can be added here
                  console.log('Export memory');
                }}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {t('memory:actions.export')}
              </button>
            </div>
          </div>
          {memoryData?.total && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {memoryData.total} {t('memory:stats.totalEntries')}
            </p>
          )}
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {memoryData?.entries && memoryData.entries.length > 0 ? (
            memoryData.entries.map((entry: MemoryEntry) => (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(`memory:types.${entry.entry_type}`, { defaultValue: entry.entry_type })}
                      </h3>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                        {t(`memory:memoryTypes.${entry.memory_type}`, { defaultValue: entry.memory_type })}
                      </span>
                      {entry.relevance_score && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                          {t('memory:entry.relevanceScore')}: {formatNumber(entry.relevance_score, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">
                      {entry.content.length > 200 ? `${entry.content.substring(0, 200)}...` : entry.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{t('memory:entry.source')}: {entry.source}</span>
                        <span>{t('memory:entry.createdAt')}: {formatShortDate(entry.created_at)}</span>
                        {entry.updated_at && entry.updated_at !== entry.created_at && (
                          <span>{t('memory:entry.updatedAt')}: {formatShortDate(entry.updated_at)}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Edit functionality can be added here
                            console.log('Edit entry', entry.id);
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {t('memory:actions.edit')}
                        </button>
                        <button
                          onClick={() => {
                            // Delete functionality can be added here
                            console.log('Delete entry', entry.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('memory:actions.delete')}
                        </button>
                      </div>
                    </div>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('memory:entry.tags')}:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {query ? t('memory:list.empty') : t('memory:actions.search')}
              </p>
            </div>
          )}
        </div>
        
        {memoryData?.has_next && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setPage(page + 1)}
              className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {t('common:common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryInterface;