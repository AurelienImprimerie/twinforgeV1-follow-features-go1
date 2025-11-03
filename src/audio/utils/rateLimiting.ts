/**
 * Audio Rate Limiting Utilities
 * Prevents audio fatigue from rapid repeated sounds
 */

import type { FeedbackType } from '../definitions/soundTypes';

// Rate limiting state
const lastPlayedTimestamps: Map<string, number> = new Map();
const RATE_LIMIT_MS = 50; // Minimum time between same sound plays

/**
 * Check if a sound should be played based on rate limiting
 */
export function shouldPlaySound(
  feedbackType: FeedbackType,
  soundId?: string
): boolean {
  const key = soundId || feedbackType;
  const now = Date.now();
  const lastPlayed = lastPlayedTimestamps.get(key);

  if (lastPlayed && now - lastPlayed < RATE_LIMIT_MS) {
    return false;
  }

  lastPlayedTimestamps.set(key, now);
  return true;
}

/**
 * Reset rate limit state (useful for testing)
 */
export function resetRateLimitState(): void {
  lastPlayedTimestamps.clear();
}
