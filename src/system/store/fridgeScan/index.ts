/**
 * Fridge Scan Pipeline Store
 * Zustand store for managing the Recipe Workshop fridge scanning pipeline
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import logger from '../../../lib/utils/logger';

// Import types and constants
import type { FridgeScanPipelineState } from './types';
import { FRIDGE_SCAN_STEPS, STORAGE_KEY, MINIMUM_ITEMS_THRESHOLD } from './constants';

// Import action creators
import { createProgressActions } from './actions/progressActions';
import { createPhotoActions } from './actions/photoActions';
import { createInventoryActions } from './actions/inventoryActions';
import { createRecipeActions } from './actions/recipeActions';
import { createSessionActions } from './actions/sessionActions';
import { createNavigationActions } from './actions/navigationActions';

export const useFridgeScanPipeline = create<FridgeScanPipelineState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'photo',
      isActive: false,
      currentSessionId: null,
      simulatedLoadingStep: 0,
      simulatedScanProgress: 0,
      simulatedOverallProgress: 0,
      progressIntervalId: null,
      progressTimeoutId: null,
      capturedPhotos: [],
      rawDetectedItems: [],
      userEditedInventory: [],
      suggestedComplementaryItems: [],
      recipeCandidates: [],
      selectedRecipes: [],
      recentSessions: [],
      externalGenerationTriggered: false,
      mealPlan: null,
      loadingState: 'idle',
      loadingMessage: '',
      steps: FRIDGE_SCAN_STEPS,

      // Integrate all actions
      ...createProgressActions(set, get),
      ...createPhotoActions(set, get),
      ...createInventoryActions(set, get),
      ...createRecipeActions(set, get),
      ...createSessionActions(set, get),
      ...createNavigationActions(set, get),
      
      // Action pour déclencher la génération externe
      setExternalGenerationTriggered: (triggered: boolean) => {
        set({ externalGenerationTriggered: triggered });
      },
      
      // Action to set loading state
      setLoadingState: (state: 'idle' | 'uploading' | 'analyzing' | 'generating' | 'saving') => {
        set({ loadingState: state });
        
        logger.debug('FRIDGE_SCAN_PIPELINE', 'Loading state updated', {
          newLoadingState: state,
          timestamp: new Date().toISOString()
        });
      },
      
      // Action to explicitly set user edited inventory
      setUserEditedInventory: (inventory: FridgeItem[]) => {
        set({ userEditedInventory: inventory });
        
        logger.debug('FRIDGE_SCAN_PIPELINE', 'User edited inventory set explicitly', {
          inventoryCount: inventory.length,
          timestamp: new Date().toISOString()
        });
      },
      
      // Action to clear recipe candidates
      clearRecipeCandidates: () => {
        set({ recipeCandidates: [] });

        logger.info('FRIDGE_SCAN_PIPELINE', 'Recipe candidates cleared', {
          sessionId: get().currentSessionId,
          timestamp: new Date().toISOString()
        });
      },

      // Action to load recent sessions from Supabase
      loadRecentSessions: async () => {
        try {
          const { supabase } = await import('../../supabase/client');
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            logger.warn('FRIDGE_SCAN_PIPELINE', 'No user found, cannot load recent sessions');
            set({ recentSessions: [] });
            return;
          }

          const { data, error } = await supabase
            .from('fridge_scan_sessions')
            .select('session_id, user_id, stage, created_at, updated_at, captured_photos, raw_detected_items')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) {
            // Si la table n'existe pas encore (404/PGRST205), c'est normal
            if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
              logger.warn('FRIDGE_SCAN_PIPELINE', 'fridge_scan_sessions table not found (migration pending)', {
                code: error.code,
                message: error.message
              });
              set({ recentSessions: [] });
              return;
            }

            // Pour les autres erreurs, logger comme erreur
            logger.error('FRIDGE_SCAN_PIPELINE', 'Failed to load recent sessions', {
              error: error.message,
              code: error.code
            });
            set({ recentSessions: [] });
            return;
          }

          const sessions = (data || []).map(session => ({
            sessionId: session.session_id,
            userId: session.user_id,
            stage: session.stage,
            createdAt: session.created_at,
            updatedAt: session.updated_at,
            capturedPhotos: session.captured_photos,
            rawDetectedItems: session.raw_detected_items
          }));

          set({ recentSessions: sessions });

          logger.info('FRIDGE_SCAN_PIPELINE', 'Recent sessions loaded', {
            count: sessions.length,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Gérer les erreurs réseau et autres exceptions
          logger.warn('FRIDGE_SCAN_PIPELINE', 'Exception loading recent sessions', {
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: error instanceof Error ? error.constructor.name : typeof error
          });
          set({ recentSessions: [] });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const partializedState = {
          currentStep: state.currentStep,
          isActive: state.isActive,
          currentSessionId: state.currentSessionId,
          simulatedLoadingStep: state.simulatedLoadingStep,
          simulatedScanProgress: state.simulatedScanProgress,
          simulatedOverallProgress: state.simulatedOverallProgress,
          rawDetectedItems: state.rawDetectedItems,
          userEditedInventory: state.userEditedInventory,
          mealPlan: state.mealPlan,
        };
        
        logger.debug('FRIDGE_SCAN_PIPELINE_STORE', 'Partializing state for persistence', {
          currentStep: partializedState.currentStep,
          isActive: partializedState.isActive,
          sessionId: partializedState.currentSessionId,
          rawDetectedItemsCount: partializedState.rawDetectedItems?.length || 0,
          userEditedInventoryCount: partializedState.userEditedInventory?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        return partializedState;
      },
      merge: (persistedState, currentState) => {
        const persistedData = persistedState as any;
        
        logger.debug('FRIDGE_SCAN_PIPELINE_STORE', 'Loading persisted data for merge', {
          persistedStep: persistedData?.currentStep,
          persistedIsActive: persistedData?.isActive,
          persistedSessionId: persistedData?.currentSessionId,
          persistedOverallProgress: persistedData?.simulatedOverallProgress,
          persistedRawDetectedItemsCount: persistedData?.rawDetectedItems?.length || 0,
          persistedUserEditedInventoryCount: persistedData?.userEditedInventory?.length || 0,
          timestamp: new Date().toISOString()
        });

        // Ensure array fields are always valid arrays
        const safePersistedData = {
          ...persistedData,
          rawDetectedItems: Array.isArray(persistedData?.rawDetectedItems) ? persistedData.rawDetectedItems : [],
          userEditedInventory: Array.isArray(persistedData?.userEditedInventory) ? persistedData.userEditedInventory : [],
        };

        const mergedState = { ...currentState, ...safePersistedData };

        logger.info('FRIDGE_SCAN_PIPELINE_STORE', 'Hydrating store state from persistence', {
          persistedStep: persistedData?.currentStep,
          persistedIsActive: persistedData?.isActive,
          persistedSessionId: persistedData?.currentSessionId,
          persistedOverallProgress: persistedData?.simulatedOverallProgress,
          hasInventory: persistedData?.userEditedInventory?.length > 0,
          timestamp: new Date().toISOString()
        });

        // Validate session ID format
        const isValidSessionId = persistedData?.currentSessionId && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(persistedData.currentSessionId);
        
        if (isValidSessionId) {
          mergedState.currentSessionId = persistedData.currentSessionId;
          
          // Determine if pipeline should be active based on persisted data
          const hasPersistedData = (persistedData?.rawDetectedItems?.length > 0) ||
                                 (persistedData?.userEditedInventory?.length > 0);
          
          mergedState.isActive = hasPersistedData;
          
          // Determine the correct step based on available data
          if (persistedData?.userEditedInventory?.length > 0) {
            mergedState.currentStep = 'validation';
          } else if (persistedData?.suggestedComplementaryItems?.length > 0 && 
                     (persistedData?.rawDetectedItems?.length || 0) < MINIMUM_ITEMS_THRESHOLD) {
            mergedState.currentStep = 'complement';
          } else if (persistedData?.rawDetectedItems?.length > 0) {
            mergedState.currentStep = 'validation';
          } else {
            mergedState.currentStep = 'photo';
          }
          
          logger.debug('FRIDGE_SCAN_PIPELINE_STORE', 'Session validation result', {
            sessionId: persistedData.currentSessionId,
            hasPersistedData,
            rawDetectedItemsCount: persistedData?.rawDetectedItems?.length || 0,
            inventoryCount: persistedData?.userEditedInventory?.length || 0,
            setActive: hasPersistedData,
            determinedStep: mergedState.currentStep,
          });
        } else {
          mergedState.currentSessionId = null;
          mergedState.isActive = false;
          mergedState.currentStep = 'photo';
        }

        // Reset loading states to prevent stuck UI
        mergedState.simulatedLoadingStep = 0;
        mergedState.simulatedScanProgress = 0;
        mergedState.progressIntervalId = null;
        mergedState.progressTimeoutId = null;
        mergedState.loadingState = 'idle';
        mergedState.loadingMessage = '';

        // Calculate simulatedOverallProgress based on current step
        if (mergedState.currentStep) {
          const currentStepData = FRIDGE_SCAN_STEPS.find(step => step.id === mergedState.currentStep);
          mergedState.simulatedOverallProgress = currentStepData?.startProgress || 0;
          
          logger.debug('FRIDGE_SCAN_PIPELINE_STORE', 'Setting progress from current step', {
            currentStep: mergedState.currentStep,
            foundStepData: !!currentStepData,
            startProgress: currentStepData?.startProgress,
            finalProgress: mergedState.simulatedOverallProgress,
            timestamp: new Date().toISOString()
          });
        } else {
          mergedState.simulatedOverallProgress = 0;
          
          logger.debug('FRIDGE_SCAN_PIPELINE_STORE', 'Setting progress to 0 (no step)', {
            currentStep: mergedState.currentStep,
            timestamp: new Date().toISOString()
          });
        }

        // Ensure steps are always from current state
        mergedState.steps = currentState.steps;

        logger.info('FRIDGE_SCAN_PIPELINE_STORE', 'Store state hydration completed', {
          finalIsActive: mergedState.isActive,
          finalCurrentStep: mergedState.currentStep,
          finalSessionId: mergedState.currentSessionId,
          finalOverallProgress: mergedState.simulatedOverallProgress,
          sessionValid: isValidSessionId,
          hasInventory: mergedState.userEditedInventory?.length > 0,
          timestamp: new Date().toISOString()
        });

        return mergedState;
      },
    }
  )
);

// Export types for external use
export type { FridgeScanStep, FridgeScanStepData, RawDetectedItem, FridgeScanPipelineState } from './types';
export { FRIDGE_SCAN_STEPS } from './constants';