/**
 * Status Sound Effects
 * Success, error, and form submission sounds
 */

import { playEnhancedSound } from '../core/soundSynthesis';
import { shouldPlaySound } from '../utils/rateLimiting';
import { isAudioEnabled, applyAccessibilityMods, addPitchVariance } from '../utils/accessibility';
import { STRIKE_LAYER_PARAMS, BODY_LAYER_PARAMS, BLOOM_LAYER_PARAMS } from '../definitions/soundLayers';
import type { SoundDefinition } from '../definitions/soundTypes';

/**
 * Play enhanced sound with rate limiting and accessibility checks
 */
function playSound(soundDef: SoundDefinition, soundType: 'success' | 'error' = 'success', soundId?: string): void {
  if (!isAudioEnabled() || !shouldPlaySound(soundType, soundId)) {
    return;
  }
  
  const finalSoundDef = applyAccessibilityMods(soundDef);
  playEnhancedSound(finalSoundDef, soundType, soundId);
}

/**
 * Confirm - STRIKE 60% + BLOOM 40% (tf_confirm.wav equivalent)
 */
export function formSubmit(): void {
  const soundDef: SoundDefinition = {
    layers: [
      {
        ...STRIKE_LAYER_PARAMS,
        frequency: addPitchVariance(STRIKE_LAYER_PARAMS.frequency),
        gain: STRIKE_LAYER_PARAMS.gain * 0.6
      },
      {
        ...BLOOM_LAYER_PARAMS,
        frequency: addPitchVariance(BLOOM_LAYER_PARAMS.frequency),
        gain: BLOOM_LAYER_PARAMS.gain * 0.4
      }
    ],
    masterGain: 1.26 // +1 dB relative
  };
  playSound(soundDef, 'success');
}

/**
 * Success minor - STRIKE 60% + micro BLOOM 20% + cooling hiss (tf_success_minor.wav equivalent)
 */
export function success(): void {
  const soundDef: SoundDefinition = {
    layers: [
      {
        ...STRIKE_LAYER_PARAMS,
        frequency: addPitchVariance(STRIKE_LAYER_PARAMS.frequency),
        gain: STRIKE_LAYER_PARAMS.gain * 0.6
      },
      {
        ...BLOOM_LAYER_PARAMS,
        frequency: addPitchVariance(BLOOM_LAYER_PARAMS.frequency),
        gain: BLOOM_LAYER_PARAMS.gain * 0.2
      }
    ],
    masterGain: 1.58 // +2 dB relative
  };
  playSound(soundDef, 'success');
}

/**
 * Error - Double knock sequence (tf_error.wav equivalent)
 */
export function error(): void {
  // First knock at 220 Hz (90ms duration)
  const firstKnock: SoundDefinition = {
    layers: [
      {
        frequency: 220,
        waveform: 'sine',
        adsr: {
          attack: 0.005,
          decay: 0.080,    // 85ms total (5+80)
          sustain: 0,
          release: 0.010
        },
        gain: 0.6,
        // No filter for error sounds - clean sine waves
      }
    ],
    masterGain: 0.79 // -1 dB relative
  };
  
  playSound(firstKnock, 'error');
  
  // Second knock at 180 Hz after 110ms (110ms duration)
  setTimeout(() => {
    const secondKnock: SoundDefinition = {
      layers: [
        {
          frequency: 180,
          waveform: 'sine',
          adsr: {
            attack: 0.005,
            decay: 0.100,   // 105ms total (5+100)
            sustain: 0,
            release: 0.010
          },
          gain: 0.6,
          // No filter for error sounds - clean sine waves
        }
      ],
      masterGain: 0.79 // -1 dB relative
    };
    playSound(secondKnock, 'error');
  }, 110);
}

/**
 * Countdown tick - Subtle rhythmic sound for countdown numbers
 * Frequency increases as countdown gets lower (urgency)
 */
export function countdownTick(count: number, maxCount: number = 10): void {
  // Map countdown to frequency: higher numbers = lower frequency
  const baseFreq = 400;
  const freqRange = 600;
  const normalizedCount = count / maxCount; // 1.0 at start, 0.0 at end
  const frequency = baseFreq + (freqRange * (1 - normalizedCount)); // 400Hz -> 1000Hz

  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: addPitchVariance(frequency, 0.02), // Subtle variance
        waveform: 'sine',
        adsr: {
          attack: 0.005,
          decay: 0.080,
          sustain: 0,
          release: 0.015
        },
        gain: 0.4,
        filter: {
          type: 'lowpass',
          frequency: frequency * 2.5,
          Q: 1.0
        }
      },
      // Add subtle body for presence
      {
        frequency: frequency * 0.5, // Sub-harmonic
        waveform: 'triangle',
        adsr: {
          attack: 0.010,
          decay: 0.060,
          sustain: 0,
          release: 0.010
        },
        gain: 0.15,
      }
    ],
    masterGain: count <= 3 ? 1.41 : 1.0 // +1.5dB boost for final countdown
  };
  playSound(soundDef, 'success', `countdown-${count}`);
}

/**
 * Countdown complete - Energetic "GO!" sound
 */
export function countdownGo(): void {
  // Upward sweep for energy and motivation
  const soundDef: SoundDefinition = {
    layers: [
      {
        frequency: 600,
        waveform: 'sine',
        adsr: {
          attack: 0.010,
          decay: 0.150,
          sustain: 0,
          release: 0.040
        },
        gain: 0.6,
        filter: {
          type: 'bandpass',
          frequency: 1200,
          Q: 2.0
        }
      },
      // Harmonic richness
      {
        frequency: 900,
        waveform: 'triangle',
        adsr: {
          attack: 0.015,
          decay: 0.180,
          sustain: 0,
          release: 0.050
        },
        gain: 0.4,
      }
    ],
    masterGain: 2.0 // +3dB for emphasis
  };
  playSound(soundDef, 'success', 'countdown-go');
}

/**
 * Success major - Forge Stamp sequence (tf_success_major_stamp.wav equivalent)
 */
export function successMajor(): void {
  // Stage 1: STRIKE fort (0-120ms)
  const stage1: SoundDefinition = {
    layers: [
      {
        ...STRIKE_LAYER_PARAMS,
        frequency: addPitchVariance(STRIKE_LAYER_PARAMS.frequency),
        gain: STRIKE_LAYER_PARAMS.gain * 1.0, // Full STRIKE power
        adsr: {
          attack: 0.005,
          decay: 0.110,  // Extended decay for "stamp" effect
          sustain: 0,
          release: 0.015
        }
      }
    ],
    masterGain: 2.51 // +4 dB relative (success major)
  };
  playSound(stage1, 'success');
  
  // Stage 2: BLOOM cuivré with EQ "smile" (120-280ms)
  setTimeout(() => {
    const stage2: SoundDefinition = {
      layers: [
        {
          ...BLOOM_LAYER_PARAMS,
          frequency: 1400, // Centered around 1.4 kHz for "smile" EQ
          gain: BLOOM_LAYER_PARAMS.gain * 0.8, // Enhanced BLOOM
          adsr: {
            attack: 0.010,
            decay: 0.150,
            sustain: 0,
            release: 0.030
          },
          filter: {
            type: 'bandpass', // "Smile" EQ effect
            frequency: 1400,
            Q: 1.5
          }
        }
      ],
      masterGain: 2.51 // +4 dB relative
    };
    playSound(stage2, 'success');
  }, 120);
  
  // Stage 3: Cooling cyan down-swell (220-380ms)
  setTimeout(() => {
    const stage3: SoundDefinition = {
      layers: [
        {
          frequency: 600, // Start frequency
          waveform: 'sine',
          adsr: {
            attack: 0.020,
            decay: 0.140,   // 160ms total duration
            sustain: 0,
            release: 0.020
          },
          gain: 0.35, // -12 dB as specified
          filter: {
            type: 'lowpass',
            frequency: 800, // Muffled down-swell
            Q: 1.2
          }
        }
      ],
      masterGain: 2.51 // +4 dB relative
    };
    playSound(stage3, 'success');
  }, 220);
}