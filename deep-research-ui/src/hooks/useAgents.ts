import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { agentAPI } from '../services/api';
import type { AgentInfo, AgentStats } from '../types';

export const useAgents = () => {
  const queryClient = useQueryClient();

  // HTTP-only configuration
  const [useWebSocket] = useState(false);
  const [httpFallback] = useState(true);

  // Fetch agents with pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: agentsData, isLoading, error } = useQuery({
    queryKey: ['agents', page, pageSize, statusFilter],
    queryFn: () => agentAPI.getAgents(page, pageSize, statusFilter),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  // Fetch agent stats
  const { data: stats } = useQuery({
    queryKey: ['agent-stats'],
    queryFn: agentAPI.getStats,
    refetchInterval: 5000,
    staleTime: 5000,
  });

  // Update agent status
  const updateAgentStatus = (agentId: string, status: AgentInfo['status']) => {
    console.log(`Updating agent ${agentId} status to ${status}`);
    queryClient.invalidateQueries({ queryKey: ['agents'] });
  };

  // Get agent by ID
  const getAgentById = (agentId: string): AgentInfo | undefined => {
    return agentsData?.agents.find((agent: AgentInfo) => agent.id === agentId);
  };

  // Get agents by status
  const getAgentsByStatus = (status: AgentInfo['status']): AgentInfo[] => {
    return agentsData?.agents.filter((agent: AgentInfo) => agent.status === status) || [];
  };

  // Pagination helpers
  const nextPage = () => {
    if (agentsData?.has_next) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (agentsData?.has_prev) {
      setPage(prev => Math.max(1, prev - 1));
    }
  };

  const goToPage = (pageNum: number) => {
    setPage(Math.max(1, pageNum));
  };

  const changeStatusFilter = (status?: string) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filtering
  };

  return {
    agents: agentsData?.agents || [],
    stats: stats || {} as AgentStats,
    pagination: {
      page,
      pageSize,
      total: agentsData?.total || 0,
      totalPages: agentsData?.total_pages || 0,
      hasNext: agentsData?.has_next || false,
      hasPrev: agentsData?.has_prev || false,
      nextPage,
      prevPage,
      goToPage,
    },
    isLoading,
    error,
    updateAgentStatus,
    getAgentById,
    getAgentsByStatus,
    setStatusFilter: changeStatusFilter,
    useWebSocket,
    httpFallback,
  };
};

// Hook for a single agent
export const useAgent = (agentId: string) => {
  const { agents, updateAgentStatus } = useAgents();
  const agent = agents.find((a: AgentInfo) => a.id === agentId);

  return {
    agent,
    updateStatus: (status: AgentInfo['status']) => updateAgentStatus(agentId, status),
  };
};