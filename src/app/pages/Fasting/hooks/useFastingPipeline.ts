/**
 * Fasting Pipeline Hook
 * Gestion persistante de l'état de la pipeline de jeûne intermittent
 */

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useUserStore } from '../../../../system/store/userStore';
import logger from '../../../../lib/utils/logger';

// Types pour la pipeline de jeûne
export type FastingPipelineStep = 'setup' | 'active' | 'completion';

export interface FastingStepData {
  id: FastingPipelineStep;
  title: string;
  subtitle: string;
  icon: keyof typeof import('../../../../ui/icons/registry').ICONS;
  color: string;
}

export interface FastingSession {
  id?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  targetHours: number;
  actualDurationHours?: number;
  protocol: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface FastingPipelineState {
  currentStep: FastingPipelineStep;
  isActive: boolean;
  session: FastingSession | null;
  steps: FastingStepData[];
  lastTick: number;
  
  // Actions
  startFasting: (targetHours: number, protocol: string) => void;
  stopFasting: () => void;
  cancelFasting: () => void;
  saveFastingSession: () => Promise<void>;
  tick: () => void; // Force re-render for timer updates
}

// Configuration des étapes de la Forge du Temps
const FASTING_STEPS: FastingStepData[] = [
  {
    id: 'setup',
    title: 'Configuration Temporelle',
    subtitle: 'Paramétrez votre protocole de jeûne',
    icon: 'Settings',
    color: '#F59E0B'
  },
  {
    id: 'active',
    title: 'Session Active',
    subtitle: 'Votre jeûne est en cours',
    icon: 'Timer',
    color: '#EF4444'
  },
  {
    id: 'completion',
    title: 'Forge Accomplie',
    subtitle: 'Session terminée avec succès',
    icon: 'Check',
    color: '#22C55E'
  }
];

// Stable storage key
const STORAGE_KEY = 'twinforge:fasting:pipeline';

export const useFastingPipeline = create<FastingPipelineState>()(
  persist(
    (set, get) => ({
      currentStep: 'setup',
      isActive: false,
      session: null,
      steps: FASTING_STEPS,
      lastTick: Date.now(),


      startFasting: (targetHours: number, protocol: string) => {
        const userStore = useUserStore.getState();
        const session = userStore.session;
        
        if (!session?.user?.id) {
          console.error('User not authenticated for fasting session');
          return;
        }

        const now = new Date();
        const newSession: FastingSession = {
          userId: session.user.id,
          startTime: now,
          targetHours,
          protocol,
          status: 'active'
        };

        set({
          currentStep: 'active',
          isActive: true,
          session: newSession,
        });

        logger.info('FASTING_PIPELINE', 'Fasting session started', {
          userId: session.user.id,
          targetHours,
          protocol,
          startTime: now.toISOString(),
          timestamp: new Date().toISOString()
        });
      },

      stopFasting: () => {
        const state = get();
        if (!state.session) return;

        const endTime = new Date();
        const startTime = new Date(state.session.startTime).getTime();
        const elapsedSeconds = Math.floor((endTime.getTime() - startTime) / 1000);
        const actualDurationHours = elapsedSeconds / 3600;

        const completedSession: FastingSession = {
          ...state.session,
          endTime,
          actualDurationHours,
          status: 'completed'
        };

        set({
          currentStep: 'completion',
          isActive: true, // Keep active until saved
          session: completedSession
        });

        logger.info('FASTING_PIPELINE', 'Fasting session completed', {
          userId: state.session.userId,
          sessionId: state.session.id,
          actualDurationMinutes: (elapsedSeconds / 60).toFixed(1),
          actualDurationHours: actualDurationHours.toFixed(3),
          targetHours: state.session.targetHours,
          timestamp: new Date().toISOString()
        });
      },

      cancelFasting: () => {
        const state = get();
        
        logger.info('FASTING_PIPELINE', 'Fasting session cancelled', {
          userId: state.session?.userId,
          sessionDuration: state.getElapsedMinutes(),
          timestamp: new Date().toISOString()
        });

        set({
          currentStep: 'setup',
          isActive: false,
          session: null,
        });
      },

      saveFastingSession: async () => {
        const state = get();
        if (!state.session) return;

        try {
          logger.info('FASTING_PIPELINE', 'Saving fasting session to database', {
            userId: state.session.userId,
            sessionId: state.session.id,
            actualDurationHours: state.session.actualDurationHours,
            targetHours: state.session.targetHours,
            timestamp: new Date().toISOString()
          });

          // Import supabase client
          const { supabase } = await import('../../../../system/supabase/client');

          // Prepare session data for database insertion
          const sessionData = {
            user_id: state.session.userId,
            start_time: new Date(state.session.startTime).toISOString(),
            end_time: state.session.endTime ? new Date(state.session.endTime).toISOString() : null,
            target_hours: state.session.targetHours,
            actual_duration_hours: state.session.actualDurationHours || null,
            protocol_id: state.session.protocol || null,
            status: state.session.status,
            notes: state.session.notes || null
          };

          // Insert session into database
          const { data, error } = await supabase
            .from('fasting_sessions')
            .insert([sessionData])
            .select()
            .single();

          if (error) {
            throw new Error(`Database insertion failed: ${error.message}`);
          }

          logger.info('FASTING_PIPELINE', 'Session successfully saved to database', {
            userId: state.session.userId,
            sessionId: data?.id,
            actualDurationHours: state.session.actualDurationHours,
            timestamp: new Date().toISOString()
          });

          // Reset pipeline state AFTER successful save
          set({
            currentStep: 'setup',
            isActive: false,
            session: null,
          });

          logger.info('FASTING_PIPELINE', 'Session saved and pipeline reset', {
            userId: state.session.userId,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          logger.error('FASTING_PIPELINE', 'Failed to save fasting session', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: state.session?.userId,
            timestamp: new Date().toISOString()
          });
          throw error;
        }
      },

      tick: () => {
        // Update lastTick to force re-render for timer updates
        set({ lastTick: Date.now() });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        currentStep: state.currentStep,
        isActive: state.isActive,
        session: state.session,
        lastTick: state.lastTick,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        // Ensure steps are always from current state (not persisted)
        steps: currentState.steps,
        // Update lastTick to current time on hydration
        lastTick: Date.now(),
        // Fix Date objects that were serialized as strings
        session: persistedState.session ? {
          ...persistedState.session,
          startTime: persistedState.session.startTime ? 
            (() => {
              const parsedDate = new Date(persistedState.session.startTime);
              return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
            })() : 
            persistedState.session.startTime,
          endTime: persistedState.session.endTime ? 
            (() => {
              const parsedDate = new Date(persistedState.session.endTime);
              return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
            })() : 
            persistedState.session.endTime,
        } : null,
      }),
    }
  )
);

// Computed selectors for dynamic values
export const useFastingElapsedSeconds = () => {
  return useFastingPipeline((state) => {
    if (!state.isActive || !state.session?.startTime) return 0;
    
    const now = Date.now();
    const startTime = new Date(state.session.startTime).getTime();
    return Math.floor((now - startTime) / 1000);
  });
};

export const useFastingProgressPercentage = () => {
  return useFastingPipeline((state) => {
    if (!state.session?.targetHours) return 0;

    if (!state.isActive || !state.session?.startTime) return 0;

    const now = Date.now();
    const startTime = new Date(state.session.startTime).getTime();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const targetSeconds = state.session.targetHours * 60 * 60;
    return Math.min(100, (elapsedSeconds / targetSeconds) * 100);
  });
};

/**
 * Hook pour forcer la mise à jour du timer en temps réel
 * Déclenche automatiquement tick() toutes les secondes quand une session est active
 */
export const useFastingTimerTick = () => {
  const isActive = useFastingPipeline((state) => state.isActive);
  const tick = useFastingPipeline((state) => state.tick);

  React.useEffect(() => {
    if (!isActive) return;

    // Déclencher tick() immédiatement
    tick();

    // Puis toutes les secondes
    const intervalId = setInterval(() => {
      tick();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, tick]);
};

// Hook wrapper for easier usage with feedback and toast
export function useFastingPipelineWithActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useUserStore();
  const { success, error: errorSound } = useFeedback();
  const { showToast } = useToast();

  const store = useFastingPipeline();

  const startFasting = (targetHours: number, protocol: string) => {
    if (!session?.user?.id) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur d\'authentification',
        message: 'Vous devez être connecté pour démarrer un jeûne',
        duration: 4000
      });
      return;
    }

    store.startFasting(targetHours, protocol);
    
    success();
    showToast({
      type: 'success',
      title: 'Forge du Temps Activée',
      message: `Session de jeûne ${targetHours}h démarrée`,
      duration: 4000
    });
  };

  const stopFasting = () => {
    const state = store;
    const elapsedSeconds = state.session ? 
      Math.floor((Date.now() - new Date(state.session.startTime).getTime()) / 1000) : 0;
    
    store.stopFasting();
    
    success();
    showToast({
      type: 'success',
      title: 'Session Terminée',
      message: `Jeûne de ${Math.floor(elapsedSeconds / 60)} minutes complété`,
      duration: 4000
    });
  };

  const cancelFasting = () => {
    store.cancelFasting();
    const state = store;
    const elapsedMinutes = state.session ? 
      Math.floor((Date.now() - new Date(state.session.startTime).getTime()) / 60000) : 0;
    
    logger.info('FASTING_PIPELINE', 'Fasting session cancelled', {
      userId: state.session?.userId,
      sessionDuration: elapsedMinutes,
      timestamp: new Date().toISOString()
    });
    
    navigate('/fasting');
  };

  const saveFastingSession = async () => {
    try {
      await store.saveFastingSession();
      
      // Invalidate all fasting-related queries
      queryClient.invalidateQueries({ queryKey: ['fasting'] });
      
      success();
      showToast({
        type: 'success',
        title: 'Session Sauvegardée',
        message: 'Votre session de jeûne a été enregistrée',
        duration: 3000
      });

      // Redirection vers l'onglet Aujourd'hui
      navigate('/fasting#daily');

    } catch (error) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur de Sauvegarde',
        message: 'Impossible de sauvegarder votre session',
        duration: 4000
      });
    }
  };

  return {
    ...store,
    actions: {
      startFasting,
      stopFasting,
      cancelFasting,
      saveFastingSession
    }
  };
}