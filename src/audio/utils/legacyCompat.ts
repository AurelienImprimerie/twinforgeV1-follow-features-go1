/**
 * Legacy Compatibility Layer
 * Provides backwards compatibility for old sound APIs
 */

import { playEnhancedSound } from '../core/soundSynthesis';
import type { SoundDefinition } from '../definitions/soundTypes';

/**
 * Legacy sound playback function
 * @deprecated Use playEnhancedSound directly
 */
export function playSoundLegacy(soundDef: SoundDefinition): void {
  playEnhancedSound(soundDef);
}
