// src/hooks/useFeedback.ts
/**
 * Feedback Hook - TwinForge "Strike & Bloom" Audio System
 * Modularized implementation using the new audio system
 */

import { useMemo } from 'react';
import {
  // Interaction sounds
  click,
  glassClick,
  formInput,
  toggle,
  notif,
  timer,

  // Status sounds
  formSubmit,
  success,
  error,
  successMajor,

  // Navigation sounds
  tabClick,
  sidebarClick,
  headerClick,
  navOpen,
  navClose,

  // Forgeron sounds
  hammerStrike,
  hotMetalHiss,
  anvilRing,

  // Utilities
  setAudioPreferences,
  getAudioPreferences,
  playEnhancedSound,
  playSoundLegacy,

  // Exports
  TWINFORGE_AUDIO_LAYERS,
  TWINFORGE_AUDIO_CONTROLS
} from '../audio';

/**
 * TwinForge Feedback Hook with "Strike & Bloom" DNA
 * Now using modular audio system for better maintainability
 */
export function useFeedback() {
  return useMemo(() => ({
    // Basic interactions
    click,
    glassClick,
    formInput,
    toggle,
    notif,
    timer,

    // Status feedback
    formSubmit,
    success,
    error,
    successMajor,

    // Navigation feedback
    tabClick,
    sidebarClick,
    headerClick,
    navOpen,
    navClose,

    // Forgeron feedback - NEW SPATIAL SOUNDS
    hammerStrike,
    hotMetalHiss,
    anvilRing,

    // Audio preferences control
    setAudioEnabled: (enabled: boolean) => {
      setAudioPreferences({ enabled });
    },

    setDiscreteMode: (discrete: boolean) => {
      setAudioPreferences({ discreteMode: discrete });
    },

    getAudioPreferences
  }), []);
}

// Re-export for backward compatibility
export { 
  playEnhancedSound,
  playSoundLegacy,
  TWINFORGE_AUDIO_LAYERS,
  TWINFORGE_AUDIO_CONTROLS
};
