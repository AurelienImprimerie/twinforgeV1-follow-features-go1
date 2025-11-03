/**
 * User Progression Store
 * Zustand store for managing user progression data and milestones
 */

import { create } from 'zustand';
import logger from '../../lib/utils/logger';
import type { Recommendation, RecoveryData, UserProgressionData } from '../services/step5RecommendationService';

interface UserProgressionStore {
  // State
  currentRecommendation: Recommendation | null;
  recoveryStatus: RecoveryData | null;
  progressionPath: UserProgressionData | null;
  motivationalMessage: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setRecommendation: (recommendation: Recommendation) => void;
  setRecoveryStatus: (recovery: RecoveryData) => void;
  setProgressionPath: (progression: UserProgressionData) => void;
  setMotivationalMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  acceptRecommendation: () => void;
  reset: () => void;
}

export const useUserProgressionStore = create<UserProgressionStore>((set, get) => ({
  // Initial state
  currentRecommendation: null,
  recoveryStatus: null,
  progressionPath: null,
  motivationalMessage: null,
  isLoading: false,
  error: null,

  // Set recommendation
  setRecommendation: (recommendation: Recommendation) => {
    set({ currentRecommendation: recommendation });
    logger.debug('USER_PROGRESSION_STORE', 'Recommendation set', {
      type: recommendation.type,
      confidence: recommendation.confidence
    });
  },

  // Set recovery status
  setRecoveryStatus: (recovery: RecoveryData) => {
    set({ recoveryStatus: recovery });
    logger.debug('USER_PROGRESSION_STORE', 'Recovery status set', {
      muscular: recovery.muscularRecovery,
      systemic: recovery.systemicRecovery
    });
  },

  // Set progression path
  setProgressionPath: (progression: UserProgressionData) => {
    set({ progressionPath: progression });
    logger.debug('USER_PROGRESSION_STORE', 'Progression path set', {
      currentLevel: progression.currentLevel,
      sessionsCompleted: progression.sessionsCompleted
    });
  },

  // Set motivational message
  setMotivationalMessage: (message: string) => {
    set({ motivationalMessage: message });
    logger.debug('USER_PROGRESSION_STORE', 'Motivational message set', {
      messageLength: message.length
    });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
    if (error) {
      logger.error('USER_PROGRESSION_STORE', 'Error set', { error });
    }
  },

  // Accept recommendation
  acceptRecommendation: () => {
    const { currentRecommendation } = get();
    if (currentRecommendation) {
      logger.info('USER_PROGRESSION_STORE', 'Recommendation accepted', {
        type: currentRecommendation.type,
        recommendedDate: currentRecommendation.recommendedDate
      });
      // TODO: Implement actual acceptance logic (create calendar event, etc.)
    }
  },

  // Reset store
  reset: () => {
    set({
      currentRecommendation: null,
      recoveryStatus: null,
      progressionPath: null,
      motivationalMessage: null,
      isLoading: false,
      error: null
    });
    logger.info('USER_PROGRESSION_STORE', 'Store reset');
  }
}));
