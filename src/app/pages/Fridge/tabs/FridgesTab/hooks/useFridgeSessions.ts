import { useEffect, useState } from 'react';
import { supabase } from '../../../../../../system/supabase/client';
import logger from '../../../../../../lib/utils/logger';

interface FridgeSession {
  id: string;
  created_at: string;
  inventory_final: any[];
  status: string;
}

export const useFridgeSessions = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<FridgeSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to manually trigger refresh
  const refreshSessions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let mounted = true;

    async function loadFridgeSessions() {
      if (!userId) {
        setSessions([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        logger.info('FRIDGES_TAB', 'Loading fridge sessions', {
          userId,
          timestamp: new Date().toISOString()
        });

        const { data, error: fetchError } = await supabase
          .from('recipe_sessions')
          .select('id, created_at, inventory_final, status')
          .eq('user_id', userId)
          .not('inventory_final', 'is', null)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error(`Failed to fetch fridge sessions: ${fetchError.message}`);
        }

        if (!mounted) return;
        
        const validSessions = (data || []).filter(session => 
          session.inventory_final && 
          Array.isArray(session.inventory_final) && 
          session.inventory_final.length > 0
        );
        
        setSessions(validSessions);
        
        logger.info('FRIDGES_TAB', 'Loaded fridge sessions', {
          sessionsCount: validSessions.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        logger.error('FRIDGES_TAB', 'Failed to load fridge sessions', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          timestamp: new Date().toISOString()
        });
        
        if (!mounted) return;
        setError('Erreur lors du chargement des inventaires');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFridgeSessions();
    return () => { mounted = false; };
  }, [userId, refreshTrigger]);

  return {
    loading,
    sessions,
    error,
    setSessions,
    setLoading,
    refreshSessions
  };
};