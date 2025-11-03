/**
 * Today Fasting Sessions Hook
 * React Query hook to fetch completed fasting sessions for the current day
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/system/supabase/client';
import { useUserStore } from '@/system/store/userStore';
import { startOfDay, endOfDay } from 'date-fns';
import logger from '@/lib/utils/logger';

export interface FastingSession {
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

export interface TodayFastingStats {
  totalFastedHours: number;
  sessionsCount: number;
  averageDuration: number;
  longestSession: number;
  consistency: 'excellent' | 'good' | 'needs_improvement';
  motivationalMessage: string;
}

/**
 * Calculate today's fasting statistics from sessions
 */
function calculateTodayStats(sessions: FastingSession[]): TodayFastingStats {
  if (sessions.length === 0) {
    return {
      totalFastedHours: 0,
      sessionsCount: 0,
      averageDuration: 0,
      longestSession: 0,
      consistency: 'needs_improvement',
      motivationalMessage: 'Commencez votre première session de jeûne pour forger votre discipline temporelle !'
    };
  }

  const completedSessions = sessions.filter(s => s.status === 'completed' && s.actual_duration_hours);
  const totalFastedHours = completedSessions.reduce((sum, session) => 
    sum + (session.actual_duration_hours || 0), 0
  );
  
  const averageDuration = completedSessions.length > 0 ? 
    totalFastedHours / completedSessions.length : 0;
  
  const longestSession = Math.max(0, ...completedSessions.map(s => s.actual_duration_hours || 0));

  // Determine consistency based on performance
  let consistency: 'excellent' | 'good' | 'needs_improvement' = 'needs_improvement';
  let motivationalMessage = '';

  if (totalFastedHours >= 16) {
    consistency = 'excellent';
    motivationalMessage = 'Excellente discipline ! Votre forge temporelle est parfaitement maîtrisée aujourd\'hui.';
  } else if (totalFastedHours >= 12) {
    consistency = 'good';
    motivationalMessage = 'Bonne progression ! Vous développez une solide discipline temporelle.';
  } else if (totalFastedHours > 0) {
    consistency = 'needs_improvement';
    motivationalMessage = 'Bon début ! Continuez à forger votre discipline temporelle étape par étape.';
  } else {
    motivationalMessage = 'Prêt à commencer votre forge temporelle ? Chaque session vous rapproche de vos objectifs.';
  }

  return {
    totalFastedHours,
    sessionsCount: completedSessions.length,
    averageDuration,
    longestSession,
    consistency,
    motivationalMessage
  };
}

/**
 * Hook to fetch today's fasting sessions and calculate statistics
 */
export function useTodayFastingSessions() {
  const { session } = useUserStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['fasting', 'today', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const today = new Date();
      const startDate = startOfDay(today).toISOString();
      const endDate = endOfDay(today).toISOString();

      logger.info('FASTING_TODAY_SESSIONS', 'Fetching today fasting sessions', {
        userId,
        startDate,
        endDate,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: false });

      if (error) {
        logger.error('FASTING_TODAY_SESSIONS', 'Failed to fetch today sessions', {
          error: error.message,
          userId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      const sessions = data || [];
      const stats = calculateTodayStats(sessions);

      logger.info('FASTING_TODAY_SESSIONS', 'Today sessions fetched and stats calculated', {
        userId,
        sessionsCount: sessions.length,
        stats,
        timestamp: new Date().toISOString()
      });

      return {
        sessions,
        stats
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (reduced from 1 minute)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}