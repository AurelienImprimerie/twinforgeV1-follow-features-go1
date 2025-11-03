import { create } from 'zustand';
import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

export type PerformanceMode = 'high-performance' | 'balanced' | 'quality';

interface PerformanceModeState {
  // Legacy support
  isPerformanceMode: boolean;
  // New 3-mode system
  mode: PerformanceMode;
  isLoading: boolean;
  // Auto-detected recommendation
  recommendedMode: PerformanceMode | null;

  setMode: (mode: PerformanceMode, userId?: string) => Promise<void>;
  loadMode: (userId?: string, recommendedMode?: PerformanceMode) => Promise<void>;

  // Legacy methods for backward compatibility
  setPerformanceMode: (enabled: boolean, userId?: string) => Promise<void>;
  loadPerformanceMode: (userId?: string) => Promise<void>;
}

const STORAGE_KEY = 'twinforge-performance-mode-v2';
const LEGACY_STORAGE_KEY = 'twinforge-performance-mode';

export const usePerformanceModeStore = create<PerformanceModeState>((set, get) => ({
  isPerformanceMode: false,
  mode: 'balanced',
  isLoading: true,
  recommendedMode: null,

  loadMode: async (userId?: string, recommendedMode?: PerformanceMode) => {
    try {
      set({ isLoading: true });

      if (recommendedMode) {
        set({ recommendedMode });
      }

      // Try localStorage first for immediate feedback
      const localValue = localStorage.getItem(STORAGE_KEY);

      // Migration: check legacy key
      if (localValue === null) {
        const legacyValue = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyValue !== null) {
          const wasEnabled = legacyValue === 'true';
          const migratedMode: PerformanceMode = wasEnabled ? 'high-performance' : 'balanced';
          localStorage.setItem(STORAGE_KEY, migratedMode);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          set({
            mode: migratedMode,
            isPerformanceMode: wasEnabled,
            isLoading: false
          });
          applyModeClass(migratedMode);
          return;
        }
      }

      if (localValue !== null && (localValue === 'high-performance' || localValue === 'balanced' || localValue === 'quality')) {
        const mode = localValue as PerformanceMode;
        set({
          mode,
          isPerformanceMode: mode === 'high-performance',
          isLoading: false
        });
        applyModeClass(mode);
      } else if (recommendedMode) {
        // Use recommended mode if no preference saved
        set({
          mode: recommendedMode,
          isPerformanceMode: recommendedMode === 'high-performance',
          isLoading: false
        });
        applyModeClass(recommendedMode);
        localStorage.setItem(STORAGE_KEY, recommendedMode);
      }

      // If user is logged in, sync with Supabase
      if (userId) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('performance_mode, performance_mode_enabled')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          logger.error('PERFORMANCE_MODE', 'Failed to load from Supabase', { error });
        } else if (data) {
          // New field has priority
          const mode: PerformanceMode = data.performance_mode ||
            (data.performance_mode_enabled ? 'high-performance' : 'balanced');

          set({
            mode,
            isPerformanceMode: mode === 'high-performance',
            isLoading: false
          });

          localStorage.setItem(STORAGE_KEY, mode);
          applyModeClass(mode);

          logger.info('PERFORMANCE_MODE', 'Loaded from Supabase', { mode });
        }
      }

      set({ isLoading: false });
    } catch (error) {
      logger.error('PERFORMANCE_MODE', 'Error loading performance mode', { error });
      set({ isLoading: false });
    }
  },

  setMode: async (mode: PerformanceMode, userId?: string) => {
    try {
      set({
        mode,
        isPerformanceMode: mode === 'high-performance'
      });

      localStorage.setItem(STORAGE_KEY, mode);
      applyModeClass(mode);

      logger.info('PERFORMANCE_MODE', 'Mode changed', { mode });

      // If user is logged in, persist to Supabase
      if (userId) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            performance_mode: mode,
            performance_mode_enabled: mode === 'high-performance',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          logger.error('PERFORMANCE_MODE', 'Failed to save to Supabase', { error });
        } else {
          logger.info('PERFORMANCE_MODE', 'Saved to Supabase', { mode });
        }
      }
    } catch (error) {
      logger.error('PERFORMANCE_MODE', 'Error setting performance mode', { error });
    }
  },

  // Legacy methods for backward compatibility
  loadPerformanceMode: async (userId?: string) => {
    await get().loadMode(userId);
  },

  setPerformanceMode: async (enabled: boolean, userId?: string) => {
    const mode: PerformanceMode = enabled ? 'high-performance' : 'balanced';
    await get().setMode(mode, userId);
  },
}));

/**
 * Apply CSS classes based on performance mode
 */
function applyModeClass(mode: PerformanceMode) {
  const html = document.documentElement;

  // Remove all mode classes
  html.classList.remove('performance-mode', 'mode-high-performance', 'mode-balanced', 'mode-quality');

  // Add new mode class
  html.classList.add(`mode-${mode}`);

  // Legacy class for backward compatibility
  if (mode === 'high-performance') {
    html.classList.add('performance-mode');
  }

  // Set CSS custom property for conditional styles
  html.style.setProperty('--performance-mode', mode);

  logger.debug('PERFORMANCE_MODE', 'Applied mode class', { mode });
}
