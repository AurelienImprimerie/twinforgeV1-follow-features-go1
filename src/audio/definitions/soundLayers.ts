/**
 * TwinForge Sound Layer Definitions
 * "Strike & Bloom" DNA sound parameters
 */

import type { SoundLayer } from './soundTypes';

// STRIKE Layer - Grave compact métallique (290 Hz, square filtered) - TwinForge DNA Enhanced
export const STRIKE_LAYER_PARAMS: SoundLayer = {
  frequency: 290,
  waveform: 'square',
  adsr: {
    attack: 0.003,   // 3ms - Plus rapide pour impact
    decay: 0.085,    // 85ms - Plus long pour résonance
    sustain: 0,      // 0 (no sustain phase)
    release: 0.020   // 20ms - Plus long pour queue
  },
  gain: 0.85,
  filter: {
    type: 'lowpass',
    frequency: 1600, // 1.6 kHz - Plus sombre, plus métallique
    Q: 1.2          // Plus résonant
  }
};

// BODY Layer - Sub-thump (95-110 Hz, sine) - TwinForge DNA
export const BODY_LAYER_PARAMS: SoundLayer = {
  frequency: 102,  // Middle of 95-110 Hz range
  waveform: 'sine',
  adsr: {
    attack: 0.008,   // 8ms
    decay: 0.055,    // 55ms
    sustain: 0,      // 0 (no sustain phase)
    release: 0.012   // 12ms
  },
  gain: 0.6,
  filter: {
    type: 'highpass',
    frequency: 60,   // HPF at 60 Hz
    Q: 1
  }
};

// BLOOM Layer - Brillance métallique (1.2-1.8 kHz, triangle) - TwinForge DNA
export const BLOOM_LAYER_PARAMS: SoundLayer = {
  frequency: 1500, // Middle of 1.2-1.8 kHz range
  waveform: 'triangle',
  adsr: {
    attack: 0.010,   // 10ms
    decay: 0.150,    // 150ms
    sustain: 0,      // 0 (no sustain phase)
    release: 0.030   // 30ms
  },
  gain: 0.4, // -12 dB vs STRIKE (roughly 0.4 vs 0.8)
  filter: {
    type: 'lowpass',
    frequency: 6000, // Cut >6 kHz
    Q: 1
  }
};

/**
 * COOLING HISS Layer - Band-limited cooling effect for success sounds
 */
export const COOLING_HISS_LAYER_PARAMS: SoundLayer = {
  frequency: 525, // Middle of 450-600 Hz range
  waveform: 'triangle',
  adsr: {
    attack: 0.020,   // 20ms
    decay: 0.100,    // 100ms
    sustain: 0,      // 0 (no sustain phase)
    release: 0.020   // 20ms
  },
  gain: 0.15, // -18 dB as specified
  filter: {
    type: 'bandpass',
    frequency: 525,  // Center frequency
    Q: 2.5          // Narrow band for "hiss" effect
  }
};

/**
 * RESONANCE Layer - Métal qui vibre (440 Hz, sawtooth) - FORGE DNA
 * Simule la résonance métallique après l'impact
 */
export const RESONANCE_LAYER_PARAMS: SoundLayer = {
  frequency: 440,      // A4 - résonance métallique naturelle
  waveform: 'sawtooth', // Texture métallique riche en harmoniques
  adsr: {
    attack: 0.015,   // 15ms - Démarrage progressif
    decay: 0.180,    // 180ms - Longue décroissance
    sustain: 0.1,    // 10% - Sustain léger pour résonance
    release: 0.250   // 250ms - Queue longue
  },
  gain: 0.25,
  filter: {
    type: 'bandpass',
    frequency: 800,  // Fréquence centrale de résonance
    Q: 3.5          // Très résonant, bande étroite
  }
};

/**
 * TEXTURE Layer - Grain métallique rugueux (1800 Hz, sawtooth) - FORGE DNA
 * Ajoute la texture de surface du métal
 */
export const TEXTURE_LAYER_PARAMS: SoundLayer = {
  frequency: 1800,
  waveform: 'sawtooth',  // Texture rugueuse
  adsr: {
    attack: 0.002,   // 2ms - Impact immédiat
    decay: 0.050,    // 50ms - Décroissance rapide
    sustain: 0,      // 0 (no sustain phase)
    release: 0.010   // 10ms - Queue courte
  },
  gain: 0.15,
  filter: {
    type: 'highpass',
    frequency: 1200, // Coupe les basses, garde le grain
    Q: 1.0
  }
};

// Export all layers as a collection
export const TWINFORGE_AUDIO_LAYERS = {
  STRIKE: STRIKE_LAYER_PARAMS,
  BODY: BODY_LAYER_PARAMS,
  BLOOM: BLOOM_LAYER_PARAMS,
  COOLING_HISS: COOLING_HISS_LAYER_PARAMS,
  RESONANCE: RESONANCE_LAYER_PARAMS,
  TEXTURE: TEXTURE_LAYER_PARAMS
};