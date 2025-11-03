/**
 * Spatial Audio Effects - Reverb & Echo for Forge Atmosphere
 * Simule l'ambiance d'une forge spatiale avec des délais et de la résonance
 */

import type { SoundDefinition } from '../definitions/soundTypes';

/**
 * Ajoute une reverb spatiale simulée via des délais courts
 * Simule l'écho d'une forge spatiale
 */
export function addSpatialReverb(soundDef: SoundDefinition, intensity: number = 1.0): SoundDefinition {
  // Délais en secondes pour simuler les réflexions dans une forge
  const reverbDelays = [0.025, 0.045, 0.070];  // 25ms, 45ms, 70ms
  const reverbGains = [0.15, 0.10, 0.06].map(g => g * intensity);  // Decay progressif
  
  // Pour chaque layer original, créer des échos
  const spatialLayers = soundDef.layers.flatMap((layer) => {
    return [
      layer,  // Layer original
      ...reverbDelays.map((delay, delayIdx) => ({
        ...layer,
        gain: layer.gain * reverbGains[delayIdx],
        adsr: {
          ...layer.adsr,
          attack: layer.adsr.attack + delay  // Délai de l'attaque
        }
      }))
    ];
  });
  
  return {
    ...soundDef,
    layers: spatialLayers,
    masterGain: soundDef.masterGain * 0.9  // Réduction légère pour compenser les layers additionnels
  };
}

/**
 * Ajoute un écho plus long pour les actions importantes
 * Simule la profondeur de l'espace
 */
export function addLongEcho(soundDef: SoundDefinition): SoundDefinition {
  const echoDelays = [0.120, 0.240];  // 120ms, 240ms
  const echoGains = [0.08, 0.04];     // Très atténués
  
  const echoLayers = soundDef.layers.flatMap((layer) => {
    return [
      layer,
      ...echoDelays.map((delay, delayIdx) => ({
        ...layer,
        gain: layer.gain * echoGains[delayIdx],
        adsr: {
          ...layer.adsr,
          attack: layer.adsr.attack + delay,
          release: layer.adsr.release * 1.5  // Release plus long pour l'écho
        },
        filter: layer.filter ? {
          ...layer.filter,
          frequency: layer.filter.frequency * 0.7,  // Plus sombre
          Q: layer.filter.Q * 0.8                   // Moins résonant
        } : undefined
      }))
    ];
  });
  
  return {
    ...soundDef,
    layers: echoLayers,
    masterGain: soundDef.masterGain * 0.85
  };
}

/**
 * Calcule l'intensité de reverb selon la vitesse de frappe
 * Frappe rapide = moins de reverb (pas le temps)
 * Frappe lente = plus de reverb (espace pour résonner)
 */
let lastImpactTime = 0;

export function calculateReverbIntensity(): number {
  const now = Date.now();
  const timeSinceLastImpact = now - lastImpactTime;
  lastImpactTime = now;
  
  // Frappe très rapide (< 200ms) : reverb minimal
  if (timeSinceLastImpact < 200) return 0.5;
  
  // Frappe rapide (200-500ms) : reverb réduite
  if (timeSinceLastImpact < 500) return 0.7;
  
  // Frappe normale (500-1000ms) : reverb normale
  if (timeSinceLastImpact < 1000) return 1.0;
  
  // Frappe lente (> 1000ms) : reverb augmentée
  return 1.3;
}
