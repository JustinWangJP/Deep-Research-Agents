import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentAPI, webSocketService } from '../services';
import { Agent, AgentStats } from '../types';

export const useAgents = () => {
  const queryClient = useQueryClient();
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([]);

  // Fetch agents
  const { data: agents = [], isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: agentAPI.getAgents,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch agent stats
  const { data: stats } = useQuery({
    queryKey: ['agent-stats'],
    queryFn: agentAPI.getStats,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // WebSocket for real-time updates
  useEffect(() => {
    const handleAgentUpdate = (data: any) => {
      setRealtimeUpdates(prev => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
    };

    webSocketService.onAgentUpdate(handleAgentUpdate);
    webSocketService.connect();

    return () => {
      webSocketService.off('agent_update', handleAgentUpdate);
    };
  }, [queryClient]);

  // Update agent status (mock implementation)
  const updateAgentStatus = (agentId: string, status: Agent['status']) => {
    // This would typically be an API call
    console.log(`Updating agent ${agentId} status to ${status}`);
  };

  // Get agent by ID
  const getAgentById = (agentId: string): Agent | undefined => {
    return agents.find(agent => agent.id === agentId);
  };

  // Get agents by status
  const getAgentsByStatus = (status: Agent['status']): Agent[] => {
    return agents.filter(agent => agent.status === status);
  };

  return {
    agents,
    stats: stats || {} as AgentStats,
    isLoading,
    error,
    realtimeUpdates,
    updateAgentStatus,
    getAgentById,
    getAgentsByStatus,
  };
};

// Hook for a single agent
export const useAgent = (agentId: string) => {
  const { agents, updateAgentStatus } = useAgents();
  const agent = agents.find(a => a.id === agentId);

  return {
    agent,
    updateStatus: (status: Agent['status']) => updateAgentStatus(agentId, status),
  };
};