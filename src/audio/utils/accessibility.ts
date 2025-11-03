/**
 * Audio Accessibility Utilities
 * Handles audio preferences and accessibility modifications
 */

import type { AudioPreferences, SoundDefinition } from '../definitions/soundTypes';

// Default audio preferences
const audioPreferences: AudioPreferences = {
  enabled: true,
  volume: 1.0,
  reducedMotion: false,
};

/**
 * Get current audio preferences
 */
export function getAudioPreferences(): AudioPreferences {
  return { ...audioPreferences };
}

/**
 * Set audio preferences
 */
export function setAudioPreferences(prefs: Partial<AudioPreferences>): void {
  Object.assign(audioPreferences, prefs);
}

/**
 * Check if audio is enabled
 */
export function isAudioEnabled(): boolean {
  return audioPreferences.enabled;
}

/**
 * Apply accessibility modifications to a sound definition
 */
export function applyAccessibilityMods(soundDef: SoundDefinition): SoundDefinition {
  if (!audioPreferences.enabled) {
    return soundDef;
  }

  const modifiedDef: SoundDefinition = {
    ...soundDef,
    masterGain: (soundDef.masterGain || 1.0) * audioPreferences.volume,
  };

  // If reduced motion is enabled, simplify animations/envelopes
  if (audioPreferences.reducedMotion && modifiedDef.layers) {
    modifiedDef.layers = modifiedDef.layers.map(layer => ({
      ...layer,
      adsr: layer.adsr ? {
        ...layer.adsr,
        attack: Math.max(layer.adsr.attack, 0.01),
        release: Math.max(layer.adsr.release, 0.01),
      } : layer.adsr,
    }));
  }

  return modifiedDef;
}

/**
 * Add pitch variance for anti-fatigue (±2%)
 */
export function addPitchVariance(baseFrequency: number, variancePercent: number = 2): number {
  // Skip variance if reduced motion is enabled
  if (audioPreferences.reducedMotion) {
    return baseFrequency;
  }

  const variance = (Math.random() - 0.5) * 2 * (variancePercent / 100);
  return baseFrequency * (1 + variance);
}
