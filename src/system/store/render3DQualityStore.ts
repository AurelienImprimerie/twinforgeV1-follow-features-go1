import { create } from 'zustand';
import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

export type Render3DQuality = 'auto' | 'low' | 'medium' | 'high';

interface Render3DQualityState {
  quality: Render3DQuality;
  isLoading: boolean;

  // Auto-detected quality based on device capabilities
  detectedQuality: Render3DQuality | null;

  // Methods
  setQuality: (quality: Render3DQuality, userId?: string) => Promise<void>;
  loadQuality: (userId?: string, detectedQuality?: Render3DQuality) => Promise<void>;

  // Helper to get effective quality (respects 'auto' setting)
  getEffectiveQuality: () => Render3DQuality;
}

const STORAGE_KEY = 'twinforge-3d-quality';

export const useRender3DQualityStore = create<Render3DQualityState>((set, get) => ({
  quality: 'auto',
  isLoading: true,
  detectedQuality: null,

  loadQuality: async (userId?: string, detectedQuality?: Render3DQuality) => {
    try {
      set({ isLoading: true });

      if (detectedQuality) {
        set({ detectedQuality });
      }

      // Try localStorage first for immediate feedback
      const localValue = localStorage.getItem(STORAGE_KEY);

      if (localValue !== null && isValidQuality(localValue)) {
        const quality = localValue as Render3DQuality;
        set({
          quality,
          isLoading: false
        });

        logger.info('RENDER_3D_QUALITY', 'Loaded from localStorage', { quality });
      } else if (detectedQuality) {
        // Use detected quality as default if no preference saved
        set({
          quality: 'auto',
          isLoading: false
        });
        localStorage.setItem(STORAGE_KEY, 'auto');
      }

      // If user is logged in, sync with Supabase
      if (userId) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('render_quality_3d')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          logger.error('RENDER_3D_QUALITY', 'Failed to load from Supabase', { error });
        } else if (data && data.render_quality_3d) {
          const quality = data.render_quality_3d as Render3DQuality;

          set({
            quality,
            isLoading: false
          });

          localStorage.setItem(STORAGE_KEY, quality);
          logger.info('RENDER_3D_QUALITY', 'Loaded from Supabase', { quality });
        }
      }

      set({ isLoading: false });
    } catch (error) {
      logger.error('RENDER_3D_QUALITY', 'Error loading 3D quality', { error });
      set({ isLoading: false });
    }
  },

  setQuality: async (quality: Render3DQuality, userId?: string) => {
    try {
      set({ quality });

      localStorage.setItem(STORAGE_KEY, quality);
      logger.info('RENDER_3D_QUALITY', 'Quality changed', { quality });

      // If user is logged in, persist to Supabase
      if (userId) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            render_quality_3d: quality,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          logger.error('RENDER_3D_QUALITY', 'Failed to save to Supabase', { error });
        } else {
          logger.info('RENDER_3D_QUALITY', 'Saved to Supabase', { quality });
        }
      }
    } catch (error) {
      logger.error('RENDER_3D_QUALITY', 'Error setting 3D quality', { error });
    }
  },

  getEffectiveQuality: () => {
    const state = get();
    if (state.quality === 'auto') {
      return state.detectedQuality || 'medium';
    }
    return state.quality;
  },
}));

/**
 * Validate if a string is a valid Render3DQuality value
 */
function isValidQuality(value: string): value is Render3DQuality {
  return ['auto', 'low', 'medium', 'high'].includes(value);
}

/**
 * Map quality setting to performance config overrides
 */
export function getQualityConfigOverrides(quality: Render3DQuality): {
  pixelRatio?: number;
  enableAntialias?: boolean;
  shadowsEnabled?: boolean;
  maxLights?: number;
  targetFPS?: number;
  envMapIntensity?: number;
} {
  switch (quality) {
    case 'low':
      return {
        pixelRatio: 1.0,
        enableAntialias: false,
        shadowsEnabled: false,
        maxLights: 3,
        targetFPS: 30,
        envMapIntensity: 0.2
      };
    case 'medium':
      return {
        pixelRatio: 1.25,
        enableAntialias: false,
        shadowsEnabled: false,
        maxLights: 4,
        targetFPS: 30,
        envMapIntensity: 0.4
      };
    case 'high':
      return {
        pixelRatio: 1.5,
        enableAntialias: true,
        shadowsEnabled: false, // Still disabled for battery
        maxLights: 5,
        targetFPS: 60,
        envMapIntensity: 0.6
      };
    case 'auto':
    default:
      return {}; // Use auto-detected settings
  }
}
