import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cpu, Activity, Clock } from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { useNumberFormat } from '../../i18n/formatters';

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { agents, stats, isLoading } = useAgents();
  const { formatNumber } = useNumberFormat();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="text-center text-gray-500 mt-4">
          {t('common:common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('common:navigation.dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard:stats.totalAgents')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.total_agents || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Activity className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard:stats.activeAgents')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.active_agents || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard:stats.completedTasks')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.completed_tasks || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard:recentActivity')}</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {agents.slice(0, 5).map((agent: any) => (
              <div key={agent.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{agent.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  agent.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  agent.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  agent.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {t(`common:status.${agent.status}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;