/**
 * Fasting History Hook
 * React Query hook to fetch and manage fasting session history
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/system/supabase/client';
import { useUserStore } from '@/system/store/userStore';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { useToast } from '@/ui/components/ToastProvider';
import { useFeedback } from '@/hooks/useFeedback';
import logger from '@/lib/utils/logger';

export interface FastingHistorySession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  target_hours: number;
  actual_duration_hours: number | null;
  protocol_id: string | null;
  status: 'active' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export interface FastingHistoryFilters {
  status?: 'all' | 'completed' | 'cancelled';
  protocol?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minDuration?: number;
  maxDuration?: number;
}

export interface FastingHistoryStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalHours: number;
  averageDuration: number;
  longestSession: number;
  shortestSession: number;
  mostUsedProtocol: string | null;
  firstSessionDate: string | null;
  lastSessionDate: string | null;
}

/**
 * Calculate history statistics from sessions
 */
function calculateHistoryStats(sessions: FastingHistorySession[]): FastingHistoryStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      totalHours: 0,
      averageDuration: 0,
      longestSession: 0,
      shortestSession: 0,
      mostUsedProtocol: null,
      firstSessionDate: null,
      lastSessionDate: null
    };
  }

  const completedSessions = sessions.filter(s => s.status === 'completed' && s.actual_duration_hours);
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
  
  const totalHours = completedSessions.reduce((sum, s) => sum + (s.actual_duration_hours || 0), 0);
  const averageDuration = completedSessions.length > 0 ? totalHours / completedSessions.length : 0;
  
  const durations = completedSessions.map(s => s.actual_duration_hours || 0).filter(d => d > 0);
  const longestSession = durations.length > 0 ? Math.max(...durations) : 0;
  const shortestSession = durations.length > 0 ? Math.min(...durations) : 0;

  // Find most used protocol
  const protocolCounts: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.protocol_id) {
      protocolCounts[s.protocol_id] = (protocolCounts[s.protocol_id] || 0) + 1;
    }
  });
  const mostUsedProtocol = Object.entries(protocolCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

  // Get date range
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const firstSessionDate = sortedSessions[0]?.start_time || null;
  const lastSessionDate = sortedSessions[sortedSessions.length - 1]?.start_time || null;

  return {
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    cancelledSessions: cancelledSessions.length,
    totalHours: Math.round(totalHours * 10) / 10,
    averageDuration: Math.round(averageDuration * 10) / 10,
    longestSession: Math.round(longestSession * 10) / 10,
    shortestSession: Math.round(shortestSession * 10) / 10,
    mostUsedProtocol,
    firstSessionDate,
    lastSessionDate
  };
}

/**
 * Apply filters to sessions
 */
function applyFilters(sessions: FastingHistorySession[], filters: FastingHistoryFilters): FastingHistorySession[] {
  let filtered = [...sessions];

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(s => s.status === filters.status);
  }

  // Protocol filter
  if (filters.protocol) {
    filtered = filtered.filter(s => s.protocol_id === filters.protocol);
  }

  // Date range filter
  if (filters.dateRange) {
    const startDate = startOfDay(filters.dateRange.start).toISOString();
    const endDate = endOfDay(filters.dateRange.end).toISOString();
    filtered = filtered.filter(s => 
      s.start_time >= startDate && s.start_time <= endDate
    );
  }

  // Duration filters
  if (filters.minDuration !== undefined) {
    filtered = filtered.filter(s => 
      s.actual_duration_hours && s.actual_duration_hours >= filters.minDuration!
    );
  }

  if (filters.maxDuration !== undefined) {
    filtered = filtered.filter(s => 
      s.actual_duration_hours && s.actual_duration_hours <= filters.maxDuration!
    );
  }

  return filtered;
}

/**
 * Hook to fetch fasting session history with filtering
 */
export function useFastingHistory(
  limit: number = 50,
  filters: FastingHistoryFilters = {}
) {
  const { session } = useUserStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['fasting', 'history', userId, limit, filters],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      logger.debug('FASTING_HISTORY', 'Fetching fasting history', {
        userId,
        limit,
        filters,
        timestamp: new Date().toISOString()
      });

      let query = supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      // Apply limit
      if (limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('FASTING_HISTORY', 'Failed to fetch fasting history', {
          error: error.message,
          userId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      const allSessions = data || [];
      
      // Apply client-side filters
      const filteredSessions = applyFilters(allSessions, filters);
      
      // Calculate statistics
      const stats = calculateHistoryStats(filteredSessions);

      logger.debug('FASTING_HISTORY', 'History fetched and processed', {
        userId,
        totalSessions: allSessions.length,
        filteredSessions: filteredSessions.length,
        stats,
        timestamp: new Date().toISOString()
      });

      return {
        sessions: filteredSessions,
        allSessions,
        stats,
        filters
      };
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes - aggressive cache
    cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache very long
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Deduplicate requests that happen at the same time
    structuralSharing: false, // Faster comparison
  });
}

/**
 * Hook to delete a fasting session
 */
export function useDeleteFastingSession() {
  const queryClient = useQueryClient();
  const { session } = useUserStore();
  const { showToast } = useToast();
  const { success, error: errorSound } = useFeedback();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      logger.info('FASTING_HISTORY', 'Deleting fasting session', {
        sessionId,
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase
        .from('fasting_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', session.user.id); // Security: ensure user can only delete their own sessions

      if (error) {
        logger.error('FASTING_HISTORY', 'Failed to delete session', {
          error: error.message,
          sessionId,
          userId: session.user.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      logger.info('FASTING_HISTORY', 'Session deleted successfully', {
        sessionId,
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      // Invalidate all fasting-related queries
      queryClient.invalidateQueries({ queryKey: ['fasting'] });
      
      success();
      showToast({
        type: 'success',
        title: 'Session supprimée',
        message: 'La session de jeûne a été supprimée avec succès',
        duration: 3000,
      });
    },
    onError: (error) => {
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur de suppression',
        message: 'Impossible de supprimer la session. Réessayez plus tard.',
        duration: 4000,
      });
    },
  });
}

/**
 * Hook to get available protocols from history
 */
export function useFastingProtocolsFromHistory() {
  const { session } = useUserStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['fasting', 'protocols', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('protocol_id')
        .eq('user_id', userId)
        .not('protocol_id', 'is', null);

      if (error) {
        throw error;
      }

      // Get unique protocols
      const protocols = [...new Set((data || []).map(s => s.protocol_id))].filter(Boolean);
      
      return protocols;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}