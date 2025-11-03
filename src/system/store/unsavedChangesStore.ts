/**
 * Unsaved Changes Store
 * Manages the dirty state of profile tabs to warn users about unsaved changes
 */

import { create } from 'zustand';

interface TabDirtyInfo {
  isDirty: boolean;
  changedFields?: string[];
  sectionName?: string;
}

interface UnsavedChangesState {
  dirtyTabs: Record<string, TabDirtyInfo>;
  setTabDirty: (tabId: string, isDirty: boolean, changedFields?: string[], sectionName?: string) => void;
  resetTabDirty: (tabId: string) => void;
  isAnyTabDirty: () => boolean;
  getDirtyTabs: () => Array<{ tabId: string; info: TabDirtyInfo }>;
  resetAllDirtyStatus: () => void;
}

export const useUnsavedChangesStore = create<UnsavedChangesState>((set, get) => ({
  dirtyTabs: {},

  setTabDirty: (tabId: string, isDirty: boolean, changedFields?: string[], sectionName?: string) => {
    set((state) => ({
      dirtyTabs: {
        ...state.dirtyTabs,
        [tabId]: {
          isDirty,
          changedFields,
          sectionName,
        },
      },
    }));
  },

  resetTabDirty: (tabId: string) => {
    set((state) => ({
      dirtyTabs: {
        ...state.dirtyTabs,
        [tabId]: {
          isDirty: false,
        },
      },
    }));
  },

  isAnyTabDirty: () => {
    const { dirtyTabs } = get();
    return Object.values(dirtyTabs).some(info => info.isDirty === true);
  },

  getDirtyTabs: () => {
    const { dirtyTabs } = get();
    return Object.entries(dirtyTabs)
      .filter(([_, info]) => info.isDirty)
      .map(([tabId, info]) => ({ tabId, info }));
  },

  resetAllDirtyStatus: () => {
    set({ dirtyTabs: {} });
  },
}));
