/**
 * Forgeron (Blacksmith) Sounds - Premium Audio for Central Actions Menu
 * Custom synthesized sounds for the "Outils du Forgeron" panel
 * Now with rate limiting and accessibility support
 */

import { playEnhancedSound } from '../core/soundSynthesis';
import { shouldPlaySound } from '../utils/rateLimiting';
import { isAudioEnabled, applyAccessibilityMods, addPitchVariance } from '../utils/accessibility';
import { TWINFORGE_AUDIO_LAYERS, RESONANCE_LAYER_PARAMS, TEXTURE_LAYER_PARAMS } from '../definitions/soundLayers';
import type { FeedbackType, SoundDefinition } from '../definitions/soundTypes';
import { Haptics } from '../../utils/haptics';
import { addSpatialReverb, calculateReverbIntensity } from './spatialEffects';

/**
 * Play enhanced sound with rate limiting and accessibility checks
 */
function playForgeronSound(soundDef: SoundDefinition, soundType: 'navigation' | 'click' = 'click', soundId?: string): void {
  if (!isAudioEnabled() || !shouldPlaySound(soundType, soundId)) {
    return;
  }

  const finalSoundDef = applyAccessibilityMods(soundDef);
  playEnhancedSound(finalSoundDef, soundType, soundId);
}

/**
 * Forge Strike - Opening the central actions menu
 * Combines metallic strike with ethereal bloom
 */
export function forgeStrike() {
  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(280),
        waveform: 'triangle',
        adsr: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.25 },
        gain: 0.35
      },
      {
        frequency: addPitchVariance(440),
        waveform: 'sine',
        adsr: { attack: 0.02, decay: 0.2, sustain: 0.25, release: 0.3 },
        gain: 0.25
      },
      {
        frequency: addPitchVariance(660),
        waveform: 'sine',
        adsr: { attack: 0.03, decay: 0.25, sustain: 0.2, release: 0.35 },
        gain: 0.15
      }
    ],
    masterGain: 1.2
  };

  playForgeronSound(soundDef, 'navigation', 'forge-strike');
  Haptics.press();
}

/**
 * Tile Click - Large tracking tiles
 * Solid, confident sound with resonance
 */
export function tileClick(color: string) {
  const baseFreq = getFrequencyFromColor(color);

  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(baseFreq),
        waveform: 'triangle',
        adsr: { attack: 0.008, decay: 0.12, sustain: 0.25, release: 0.18 },
        gain: 0.28
      },
      {
        frequency: addPitchVariance(baseFreq * 1.5),
        waveform: 'sine',
        adsr: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.22 },
        gain: 0.18
      }
    ],
    masterGain: 1.0
  };

  playForgeronSound(soundDef, 'click', `tile-${color}`);
  Haptics.tap();
}

/**
 * Pill Click - Small action pills
 * Quick, light, crystalline sound
 */
export function pillClick(color: string) {
  const baseFreq = getFrequencyFromColor(color);

  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(baseFreq * 1.2),
        waveform: 'sine',
        adsr: { attack: 0.005, decay: 0.08, sustain: 0.15, release: 0.12 },
        gain: 0.22
      },
      {
        frequency: addPitchVariance(baseFreq * 2),
        waveform: 'sine',
        adsr: { attack: 0.008, decay: 0.1, sustain: 0.12, release: 0.15 },
        gain: 0.12
      }
    ],
    masterGain: 1.0
  };

  playForgeronSound(soundDef, 'click', `pill-${color}`);
  Haptics.selection();
}

/**
 * Panel Close - Closing the central menu
 * Gentle descending sound
 */
export function panelClose() {
  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(440),
        waveform: 'sine',
        adsr: { attack: 0.01, decay: 0.12, sustain: 0.15, release: 0.2 },
        gain: 0.18
      },
      {
        frequency: addPitchVariance(330),
        waveform: 'sine',
        adsr: { attack: 0.02, decay: 0.15, sustain: 0.12, release: 0.25 },
        gain: 0.15
      }
    ],
    masterGain: 0.9
  };

  playForgeronSound(soundDef, 'navigation', 'panel-close');
  Haptics.tap();
}

/**
 * Home Button - Return to dashboard
 * Warm, welcoming orange/copper tones with rich harmonics
 */
export function homeClick() {
  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(261.63), // C4 - warm fundamental
        waveform: 'sine',
        adsr: { attack: 0.008, decay: 0.15, sustain: 0.32, release: 0.28 },
        gain: 0.35
      },
      {
        frequency: addPitchVariance(329.63), // E4 - harmonic warmth
        waveform: 'sine',
        adsr: { attack: 0.012, decay: 0.18, sustain: 0.28, release: 0.32 },
        gain: 0.28
      },
      {
        frequency: addPitchVariance(523.25), // C5 - bright overtone
        waveform: 'sine',
        adsr: { attack: 0.015, decay: 0.2, sustain: 0.25, release: 0.35 },
        gain: 0.22
      }
    ],
    masterGain: 1.15
  };

  playForgeronSound(soundDef, 'navigation', 'home-click');
  Haptics.press();
}

/**
 * Bottom Bar Button Click
 * Enhanced sound for navigation bar buttons
 */
export function bottomBarClick(color: string, isActive: boolean) {
  const baseFreq = getFrequencyFromColor(color);
  const volumeMultiplier = isActive ? 1.2 : 1.0;

  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(baseFreq),
        waveform: 'sine',
        adsr: { attack: 0.008, decay: 0.12, sustain: 0.2, release: 0.18 },
        gain: 0.25 * volumeMultiplier
      },
      {
        frequency: addPitchVariance(baseFreq * 1.5),
        waveform: 'sine',
        adsr: { attack: 0.012, decay: 0.15, sustain: 0.18, release: 0.22 },
        gain: 0.15 * volumeMultiplier
      }
    ],
    masterGain: 1.0
  };

  playForgeronSound(soundDef, 'navigation', `bottom-bar-${color}`);

  if (isActive) {
    Haptics.press();
  } else {
    Haptics.tap();
  }
}

/**
 * Central Button - Main action button in bottom bar
 * Most prominent sound with full harmonic richness
 */
export function centralButtonClick(isOpening: boolean) {
  if (isOpening) {
    const soundDef: SoundDefinition = {
      layers: [
        {
          frequency: addPitchVariance(261.63),
          waveform: 'sine',
          adsr: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.25 },
          gain: 0.32
        },
        {
          frequency: addPitchVariance(329.63),
          waveform: 'sine',
          adsr: { attack: 0.015, decay: 0.18, sustain: 0.28, release: 0.28 },
          gain: 0.28
        },
        {
          frequency: addPitchVariance(392.00),
          waveform: 'sine',
          adsr: { attack: 0.02, decay: 0.2, sustain: 0.25, release: 0.3 },
          gain: 0.22
        }
      ],
      masterGain: 1.3
    };
    playForgeronSound(soundDef, 'navigation', 'central-open');
    Haptics.impact();
  } else {
    const soundDef: SoundDefinition = {
      layers: [
        {
          frequency: addPitchVariance(392.00),
          waveform: 'sine',
          adsr: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.25 },
          gain: 0.25
        },
        {
          frequency: addPitchVariance(329.63),
          waveform: 'sine',
          adsr: { attack: 0.015, decay: 0.18, sustain: 0.18, release: 0.28 },
          gain: 0.2
        }
      ],
      masterGain: 1.0
    };
    playForgeronSound(soundDef, 'navigation', 'central-close');
    Haptics.tap();
  }
}

/**
 * Convert hex color to musical frequency
 * Maps color hue to musical scale frequencies
 */
function getFrequencyFromColor(color: string): number {
  const colorMap: Record<string, number> = {
    // Nutrition green
    '#10B981': 349.23, // F4
    // Activity blue
    '#3B82F6': 392.00, // G4
    // Fasting orange
    '#F59E0B': 440.00, // A4
    // Body violet
    '#A855F7': 493.88, // B4
    // Plasma cyan (central)
    '#18E3FF': 523.25, // C5
    // Indigo
    '#3D13B3': 329.63, // E4
    // Pink
    '#EC4899': 466.16, // A#4
    // Violet
    '#8B5CF6': 493.88, // B4
    // Orange (home/dashboard)
    '#F7931E': 329.63, // E4
    // Red
    '#EF4444': 261.63, // C4
  };

  return colorMap[color] || 440.00; // Default to A4
}

/**
 * Hover Sound - Subtle feedback on hover
 * Very quiet, high frequency tick
 */
export function glassHover() {
  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(880),
        waveform: 'sine',
        adsr: { attack: 0.005, decay: 0.05, sustain: 0.08, release: 0.08 },
        gain: 0.08
      }
    ],
    masterGain: 0.7
  };

  playForgeronSound(soundDef, 'click', 'glass-hover');
}

/**
 * Active State Pulse - Continuous active indicator
 * Very subtle, doesn't play on every pulse, only on state change
 */
export function activePulse() {
  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(523.25),
        waveform: 'sine',
        adsr: { attack: 0.01, decay: 0.1, sustain: 0.15, release: 0.2 },
        gain: 0.12
      }
    ],
    masterGain: 0.8
  };

  playForgeronSound(soundDef, 'click', 'active-pulse');
}

/**
 * HAMMER STRIKE - Son marteau sur enclume pour GlassCard
 * Impact violent avec étincelles sonores et résonance métallique
 */
export function hammerStrike(intensity: number = 1.0) {
  const reverbIntensity = calculateReverbIntensity();

  const soundDef: SoundDefinition = {
    layers: [
      // Impact initial (grave et puissant)
      {
        frequency: addPitchVariance(180),
        waveform: 'square',
        adsr: { attack: 0.001, decay: 0.040, sustain: 0, release: 0.015 },
        gain: 0.9 * intensity
      },
      // Résonance métallique avec les nouveaux layers
      {
        ...RESONANCE_LAYER_PARAMS,
        frequency: addPitchVariance(RESONANCE_LAYER_PARAMS.frequency),
        gain: RESONANCE_LAYER_PARAMS.gain * intensity
      },
      // Texture haute (étincelles sonores)
      {
        ...TEXTURE_LAYER_PARAMS,
        frequency: addPitchVariance(2400),
        gain: TEXTURE_LAYER_PARAMS.gain * intensity * 1.3
      }
    ],
    masterGain: 1.1
  };

  // Ajouter reverb spatiale selon intensité
  const spatialSound = addSpatialReverb(soundDef, reverbIntensity);
  playForgeronSound(spatialSound, 'click', 'hammer-strike');
  Haptics.press();
}

/**
 * HOT METAL HISS - Son épée chaude/métal refroidi
 * Plus doux, sifflant, avec vapeur
 */
export function hotMetalHiss() {
  const soundDef: SoundDefinition = {
    layers: [
      // Corps métallique chaud
      {
        frequency: addPitchVariance(340),
        waveform: 'triangle',
        adsr: { attack: 0.010, decay: 0.120, sustain: 0.15, release: 0.180 },
        gain: 0.45
      },
      // Sifflement vapeur
      {
        frequency: addPitchVariance(680),
        waveform: 'sawtooth',
        adsr: { attack: 0.020, decay: 0.100, sustain: 0.08, release: 0.150 },
        gain: 0.25,
        filter: {
          type: 'bandpass',
          frequency: 650,
          Q: 4.0
        }
      },
      // Texture métallique légère
      {
        ...TEXTURE_LAYER_PARAMS,
        frequency: addPitchVariance(1600),
        gain: TEXTURE_LAYER_PARAMS.gain * 0.6
      }
    ],
    masterGain: 0.9
  };

  const spatialSound = addSpatialReverb(soundDef, 0.8);
  playForgeronSound(spatialSound, 'click', 'hot-metal');
  Haptics.selection();
}

/**
 * ANVIL RING - Enclume qui résonne après le marteau
 * Son long et métallique pour les actions importantes
 */
export function anvilRing() {
  const soundDef: SoundDefinition = {
    layers: [
      // Ton fondamental
      {
        frequency: addPitchVariance(220),
        waveform: 'triangle',
        adsr: { attack: 0.005, decay: 0.200, sustain: 0.15, release: 0.350 },
        gain: 0.5
      },
      // Résonance longue
      {
        ...RESONANCE_LAYER_PARAMS,
        frequency: addPitchVariance(440),
        adsr: {
          ...RESONANCE_LAYER_PARAMS.adsr,
          decay: 0.300,
          release: 0.400
        },
        gain: RESONANCE_LAYER_PARAMS.gain * 1.2
      },
      // Harmonique haute
      {
        frequency: addPitchVariance(880),
        waveform: 'sine',
        adsr: { attack: 0.015, decay: 0.250, sustain: 0.1, release: 0.300 },
        gain: 0.18
      }
    ],
    masterGain: 1.0
  };

  const spatialSound = addSpatialReverb(soundDef, 1.2);
  playForgeronSound(spatialSound, 'click', 'anvil-ring');
  Haptics.impact();
}

/**
 * Export all forgeron sounds
 */
export const ForgeronSounds = {
  forgeStrike,
  tileClick,
  pillClick,
  panelClose,
  homeClick,
  bottomBarClick,
  centralButtonClick,
  glassHover,
  activePulse,
  hammerStrike,
  hotMetalHiss,
  anvilRing,
};
