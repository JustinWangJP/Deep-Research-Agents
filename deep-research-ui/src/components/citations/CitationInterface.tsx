import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { citationAPI } from '../../services/api';
import type { Citation } from '../../types';

const CitationInterface: React.FC = () => {
  const { data: citations, isLoading, error } = useQuery({
    queryKey: ['citations', 1],
    queryFn: () => citationAPI.list(1),
  });

  if (isLoading) {
    return (
      <div className="p-6" data-testid="citation-skeleton">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading citations: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Citation Manager</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Citations</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {citations?.citations?.map((citation: Citation) => (
            <div key={citation.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {citation.source_title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {citation.content.substring(0, 100)}...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitationInterface;