import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Cpu, Clock, AlertCircle, Users, TrendingUp, Zap } from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { cn } from '../../utils/cn';
import type { AgentInfo } from '../../types';

const AgentDashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { agents, stats, isLoading } = useAgents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'idle': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'completed': return <Cpu className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'idle': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPluginIcon = (plugin: string) => {
    switch (plugin) {
      case 'web_search': return '🌐';
      case 'pdf_reader': return '📄';
      case 'citation_manager': return '📚';
      case 'data_analyzer': return '📊';
      case 'chart_generator': return '📈';
      case 'statistics': return '📉';
      case 'legal_database': return '⚖️';
      case 'case_analyzer': return '🔍';
      case 'precedent_finder': return '📋';
      case 'pubmed_search': return '🏥';
      case 'clinical_trials': return '🧬';
      case 'medical_analyzer': return '💊';
      default: return '🔧';
    }
  };

  const getPluginName = (plugin: string) => {
    return t(`plugins.${plugin}`) || plugin.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('agentDashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('agentDashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">{t('agentDashboard.systemOnline')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.totalAgents')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_agents || agents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.activeAgents')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_agents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.completedTasks')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('stats.failedTasks')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failed_tasks || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('stats.systemPerformance')}</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.memoryUsage')}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.total_memory_usage || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.avgResponseTime')}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.average_response_time || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('stats.agentStatus')}</h3>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.running')}</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {agents.filter(a => a.status === 'running').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.completed')}</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {agents.filter(a => a.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.error')}</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {agents.filter(a => a.status === 'error').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('agentsList.title')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('agentsList.subtitle')}
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {agents.map((agent: AgentInfo) => (
            <div key={agent.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                    <div className={cn(
                      "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(agent.status)
                    )}>
                      {getStatusIcon(agent.status)}
                      <span className="capitalize">{t(`status.${agent.status}`)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{agent.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('agentsList.plugins')}:</span>
                    <div className="flex space-x-1">
                      {agent.plugins.map((plugin, index) => (
                        <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {getPluginIcon(plugin)} {getPluginName(plugin)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {agent.last_activity ? (
                      <>
                        <div>{t('agentsList.lastActivity')}</div>
                        <div className="font-medium">{new Date(agent.last_activity).toLocaleTimeString()}</div>
                      </>
                    ) : (
                      <div className="text-gray-400">{t('agentsList.noActivity')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;