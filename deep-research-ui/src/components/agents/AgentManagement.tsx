import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { agentAPI } from '../../services/api';
import type { AgentInfo } from '../../types';
import { useDateTimeFormat } from '../../i18n/formatters';

const AgentManagement: React.FC = () => {
  const { t } = useTranslation(['agents', 'common', 'errors']);
  const { formatRelativeTime } = useDateTimeFormat();
  const { data: agentsData, isLoading, error } = useQuery({
    queryKey: ['agents', 1, undefined],
    queryFn: () => agentAPI.getAgents(1, 20, undefined),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="text-center text-gray-500 mt-4">
          {t('common:common.loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium">{t('common:common.error')}</h3>
          <p className="mt-1">{t('errors:api.agentNotFound')}: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('agents:title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('agents:subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('agents:list.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('agents:list.subtitle')}
          </p>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {agentsData?.agents && agentsData.agents.length > 0 ? (
            agentsData.agents.map((agent: AgentInfo) => {
              // エージェント名のキーを生成（例: LeadResearcherAgent -> leadResearcherAgent）
              const agentKey = agent.name.charAt(0).toLowerCase() + agent.name.slice(1);
              
              // エージェント名のマッピング（APIから返される名前とi18nキーの対応）
              const agentNameMapping: { [key: string]: string } = {
                'LeadResearcherAgent': 'leadResearcherAgent',
                'CredibilityCriticAgent': 'credibilityCriticAgent',
                'CitationAgent': 'citationAgent',
                'ReportWriterAgent': 'reportWriterAgent',
                'TranslatorAgent': 'translatorAgent',
                'ReflectionCriticAgent': 'reflectionCriticAgent'
              };
              
              const mappedKey = agentNameMapping[agent.name] || agentKey;
              
              return (
                <div key={agent.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(`agents:agents.${mappedKey}.name`, { defaultValue: agent.name })}
                        </h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          agent.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          agent.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          agent.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {t(`agents:status.${agent.status}`, { defaultValue: agent.status })}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t(`agents:agents.${mappedKey}.description`, { defaultValue: agent.description || '' })}
                      </p>
                      {agent.last_activity && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {t('agents:list.lastActivity')}: {formatRelativeTime(agent.last_activity)}
                        </p>
                      )}
                      {!agent.last_activity && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {t('agents:list.noActivity')}
                        </p>
                      )}
                      {agent.plugins && agent.plugins.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t('agents:list.plugins')}:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {agent.plugins.slice(0, 3).map((plugin) => (
                              <span
                                key={plugin}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                              >
                                {t(`agents:plugins.${plugin}`, { defaultValue: plugin })}
                              </span>
                            ))}
                            {agent.plugins.length > 3 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                +{agent.plugins.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t('agents:list.empty')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;