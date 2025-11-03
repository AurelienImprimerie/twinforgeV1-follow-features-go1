/**
 * Unsaved Changes Warning Hook
 * Warns user before leaving page or changing tabs with unsaved changes
 */

import { useEffect } from 'react';

interface UseUnsavedChangesWarningOptions {
  isDirty: boolean;
  message?: string;
  enabled?: boolean;
}

/**
 * Hook to warn user about unsaved changes
 * - Shows browser confirmation dialog on page unload
 * - Can be used to show custom modals before tab changes
 */
export function useUnsavedChangesWarning({
  isDirty,
  message = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?',
  enabled = true,
}: UseUnsavedChangesWarningOptions) {
  // Warn user before page unload
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, isDirty, message]);

  return {
    hasUnsavedChanges: isDirty && enabled,
    warningMessage: message,
  };
}

export default useUnsavedChangesWarning;
