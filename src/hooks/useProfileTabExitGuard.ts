/**
 * useProfileTabExitGuard Hook
 * Manages exit modal for Profile tabs with unsaved changes
 * Intercepts beforeunload and popstate events to prevent data loss
 */

import { useEffect, useCallback } from 'react';
import { useExitModalStore } from '../system/store/exitModalStore';
import { useUnsavedChangesStore } from '../system/store/unsavedChangesStore';
import logger from '../lib/utils/logger';

interface UseProfileTabExitGuardOptions {
  tabId: string;
  isDirty: boolean;
  onSaveAndExit?: () => Promise<void>;
  processName: string;
}

/**
 * Hook to guard against accidental exits from Profile tabs with unsaved changes
 *
 * Usage:
 * ```tsx
 * useProfileTabExitGuard({
 *   tabId: 'health',
 *   isDirty: form.isDirty,
 *   onSaveAndExit: async () => await onSubmit(watchedValues),
 *   processName: 'Santé & Médical'
 * });
 * ```
 */
export function useProfileTabExitGuard({
  tabId,
  isDirty,
  onSaveAndExit,
  processName
}: UseProfileTabExitGuardOptions) {
  const { showModal } = useExitModalStore();
  const { getDirtyTabs } = useUnsavedChangesStore();

  // Get current tab's dirty field information
  const getDirtyFieldsInfo = useCallback(() => {
    const dirtyTabs = getDirtyTabs();
    const currentTabInfo = dirtyTabs.find(tab => tab.tabId === tabId);

    if (!currentTabInfo || !currentTabInfo.info.isDirty) {
      return [];
    }

    return [{
      section: currentTabInfo.info.sectionName || processName,
      fields: currentTabInfo.info.changedFields || []
    }];
  }, [tabId, getDirtyTabs, processName]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    logger.info('PROFILE_TAB_EXIT_GUARD', 'Exit guard activated', {
      tabId,
      isDirty,
      processName,
      timestamp: new Date().toISOString()
    });

    // Handle browser close/refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';

        logger.warn('PROFILE_TAB_EXIT_GUARD', 'User attempted to close browser with unsaved changes', {
          tabId,
          processName,
          timestamp: new Date().toISOString()
        });

        // Show exit modal
        showModal({
          title: 'Modifications non sauvegardées',
          message: `Vous avez des modifications non sauvegardées dans l'onglet ${processName}. Voulez-vous les sauvegarder avant de quitter ?`,
          processName,
          dirtyFields: getDirtyFieldsInfo(),
          onConfirm: () => {
            logger.info('PROFILE_TAB_EXIT_GUARD', 'User confirmed exit without saving', {
              tabId,
              timestamp: new Date().toISOString()
            });
            // User wants to leave without saving
            window.location.reload();
          },
          onCancel: () => {
            logger.info('PROFILE_TAB_EXIT_GUARD', 'User cancelled exit', {
              tabId,
              timestamp: new Date().toISOString()
            });
            // User wants to stay
          },
          onSaveAndExit: onSaveAndExit ? async () => {
            logger.info('PROFILE_TAB_EXIT_GUARD', 'User chose to save and exit', {
              tabId,
              timestamp: new Date().toISOString()
            });
            await onSaveAndExit();
            window.location.reload();
          } : undefined
        });

        return '';
      }
    };

    // Handle back button navigation
    const handlePopState = (e: PopStateEvent) => {
      if (isDirty) {
        e.preventDefault();

        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);

        logger.warn('PROFILE_TAB_EXIT_GUARD', 'User attempted back navigation with unsaved changes', {
          tabId,
          processName,
          timestamp: new Date().toISOString()
        });

        showModal({
          title: 'Modifications non sauvegardées',
          message: `Vous avez des modifications non sauvegardées dans l'onglet ${processName}. Voulez-vous les sauvegarder avant de quitter ?`,
          processName,
          dirtyFields: getDirtyFieldsInfo(),
          onConfirm: () => {
            logger.info('PROFILE_TAB_EXIT_GUARD', 'User confirmed back navigation without saving', {
              tabId,
              timestamp: new Date().toISOString()
            });
            // User wants to go back without saving
            window.history.back();
          },
          onCancel: () => {
            logger.info('PROFILE_TAB_EXIT_GUARD', 'User cancelled back navigation', {
              tabId,
              timestamp: new Date().toISOString()
            });
            // User wants to stay
          },
          onSaveAndExit: onSaveAndExit ? async () => {
            logger.info('PROFILE_TAB_EXIT_GUARD', 'User chose to save before back navigation', {
              tabId,
              timestamp: new Date().toISOString()
            });
            await onSaveAndExit();
            window.history.back();
          } : undefined
        });
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Prevent back navigation when there are unsaved changes
    if (isDirty) {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);

      logger.info('PROFILE_TAB_EXIT_GUARD', 'Exit guard deactivated', {
        tabId,
        timestamp: new Date().toISOString()
      });
    };
  }, [isDirty, tabId, processName, showModal, getDirtyFieldsInfo, onSaveAndExit]);
}
