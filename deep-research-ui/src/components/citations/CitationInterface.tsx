import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { citationAPI } from '../../services/api';
import type { Citation } from '../../types';
import { useNumberFormat, useDateTimeFormat } from '../../i18n/formatters';

const CitationInterface: React.FC = () => {
  const { t } = useTranslation(['citations', 'common', 'errors']);
  const { formatNumber } = useNumberFormat();
  const { formatShortDate } = useDateTimeFormat();
  const [page, setPage] = useState(1);
  const [caseNumberFilter, setCaseNumberFilter] = useState('');
  const [sourceTitleFilter, setSourceTitleFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  
  const { data: citations, isLoading, error } = useQuery({
    queryKey: ['citations', page, caseNumberFilter, sourceTitleFilter, tagsFilter],
    queryFn: () => citationAPI.list(page, 20, { case_number: caseNumberFilter || undefined }),
  });

  if (isLoading) {
    return (
      <div className="p-6" data-testid="citation-skeleton">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
          {t('citations:list.loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-medium">{t('common:common.error')}</h3>
          <p className="mt-1">{t('errors:api.citationError')}: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('citations:title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('citations:subtitle')}
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('common:common.filter')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('citations:filters.caseNumber')}
            </label>
            <input
              type="text"
              value={caseNumberFilter}
              onChange={(e) => setCaseNumberFilter(e.target.value)}
              placeholder={t('citations:filters.caseNumber')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('citations:filters.sourceTitle')}
            </label>
            <input
              type="text"
              value={sourceTitleFilter}
              onChange={(e) => setSourceTitleFilter(e.target.value)}
              placeholder={t('citations:filters.sourceTitle')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('citations:filters.tags')}
            </label>
            <input
              type="text"
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              placeholder={t('citations:filters.tags')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => {
              setCaseNumberFilter('');
              setSourceTitleFilter('');
              setTagsFilter('');
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {t('common:common.reset')}
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('citations:list.title')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Add citation functionality can be added here
                  console.log('Add citation');
                }}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                {t('citations:actions.add')}
              </button>
              <button
                onClick={() => {
                  // Import functionality can be added here
                  console.log('Import citations');
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('citations:actions.import')}
              </button>
              <button
                onClick={() => {
                  // Export functionality can be added here
                  console.log('Export citations');
                }}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {t('citations:actions.export')}
              </button>
            </div>
          </div>
          {citations?.total && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {citations.total} {t('citations:list.title')}
            </p>
          )}
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {citations?.citations && citations.citations.length > 0 ? (
            citations.citations.map((citation: Citation) => (
              <div key={citation.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {citation.source_title}
                      </h3>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                        {t('citations:citation.confidence')}: {formatNumber(citation.confidence, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {citation.case_number && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                          {t('citations:citation.caseNumber')}: {citation.case_number}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">
                      {citation.content.length > 200 ? `${citation.content.substring(0, 200)}...` : citation.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        {citation.source_url && (
                          <a
                            href={citation.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {t('citations:citation.sourceUrl')} →
                          </a>
                        )}
                        {citation.page_number && (
                          <span>{t('citations:citation.pageNumber')}: {citation.page_number}</span>
                        )}
                        <span>{t('citations:citation.createdAt')}: {formatShortDate(citation.created_at)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Copy functionality can be added here
                            navigator.clipboard.writeText(citation.content);
                          }}
                          className="text-xs text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          {t('citations:actions.copy')}
                        </button>
                        <button
                          onClick={() => {
                            // Edit functionality can be added here
                            console.log('Edit citation', citation.id);
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {t('citations:actions.edit')}
                        </button>
                        <button
                          onClick={() => {
                            // Delete functionality can be added here
                            console.log('Delete citation', citation.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('citations:actions.delete')}
                        </button>
                      </div>
                    </div>
                    {citation.tags && citation.tags.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t('citations:citation.tags')}:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {citation.tags.map((tag, index) => (
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
                    {citation.metadata && Object.keys(citation.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {t('citations:citation.metadata')}:
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {JSON.stringify(citation.metadata, null, 2)}
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
                {t('citations:list.empty')}
              </p>
            </div>
          )}
        </div>
        
        {citations?.has_next && (
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

export default CitationInterface;