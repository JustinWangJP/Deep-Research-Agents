import React from 'react';
import { Activity, Cpu, Clock, AlertCircle } from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { cn } from '../../utils/cn';

const AgentDashboard: React.FC = () => {
  const { agents, stats, isLoading, realtimeUpdates } = useAgents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500 bg-green-50';
      case 'completed': return 'text-blue-500 bg-blue-50';
      case 'error': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'completed': return <Cpu className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

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
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{realtimeUpdates.length} updates</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_agents || agents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_agents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failed_tasks || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Agents List -->
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agents Overview</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {agents.map((agent) => (
            <div key={agent.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{agent.description}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Plugins: {agent.plugins.join(', ')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(agent.status)
                  )}>
                    {getStatusIcon(agent.status)}
                    <span>{agent.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {agent.lastActivity ? new Date(agent.lastActivity).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <!-- Real-time Updates -->
      {realtimeUpdates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Updates</h2>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {realtimeUpdates.slice(-10).reverse().map((update, index) => (
              <div key={index} className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {JSON.stringify(update, null, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;