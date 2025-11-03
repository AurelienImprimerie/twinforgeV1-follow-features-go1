/**
 * Haptic Feedback Utilities
 * Cross-platform haptic feedback for mobile interactions
 */

import logger from '../lib/utils/logger';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface VibrationPattern {
  pattern: number | number[];
  description: string;
}

const VIBRATION_PATTERNS: Record<HapticPattern, VibrationPattern> = {
  light: {
    pattern: 10,
    description: 'Light tap',
  },
  medium: {
    pattern: 20,
    description: 'Medium tap',
  },
  heavy: {
    pattern: 30,
    description: 'Heavy tap',
  },
  success: {
    pattern: [10, 50, 10],
    description: 'Success double tap',
  },
  warning: {
    pattern: [20, 100, 20, 100, 20],
    description: 'Warning triple tap',
  },
  error: {
    pattern: [30, 50, 30],
    description: 'Error alert pattern',
  },
  selection: {
    pattern: 5,
    description: 'Selection tick',
  },
};

/**
 * Check if vibration API is supported
 */
function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Check if Vibration API should be used (user preference + support)
 */
function shouldVibrate(): boolean {
  // Check if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // Check if vibration is supported
  if (!isVibrationSupported()) {
    return false;
  }

  // Check localStorage preference (default: enabled)
  try {
    const preference = localStorage.getItem('haptics-enabled');
    return preference === null || preference === 'true';
  } catch {
    return true;
  }
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (!shouldVibrate()) {
    return;
  }

  try {
    const vibrationData = VIBRATION_PATTERNS[pattern];

    // Some devices don't support pattern vibrations, fallback to simple vibration
    const vibrated = navigator.vibrate(vibrationData.pattern);

    if (!vibrated) {
      logger.debug('HAPTICS', 'Vibration pattern not supported, using fallback');
      navigator.vibrate(10);
    }

    logger.debug('HAPTICS', 'Triggered haptic feedback', {
      pattern,
      description: vibrationData.description,
    });
  } catch (error) {
    logger.error('HAPTICS', 'Failed to trigger haptic feedback', error);
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
  if (!isVibrationSupported()) {
    return;
  }

  try {
    navigator.vibrate(0);
  } catch (error) {
    logger.error('HAPTICS', 'Failed to stop haptic feedback', error);
  }
}

/**
 * Enable haptic feedback
 */
export function enableHaptics(): void {
  try {
    localStorage.setItem('haptics-enabled', 'true');
    logger.info('HAPTICS', 'Haptic feedback enabled');
  } catch (error) {
    logger.error('HAPTICS', 'Failed to enable haptics', error);
  }
}

/**
 * Disable haptic feedback
 */
export function disableHaptics(): void {
  try {
    localStorage.setItem('haptics-enabled', 'false');
    stopHaptic();
    logger.info('HAPTICS', 'Haptic feedback disabled');
  } catch (error) {
    logger.error('HAPTICS', 'Failed to disable haptics', error);
  }
}

/**
 * Check if haptics are currently enabled
 */
export function areHapticsEnabled(): boolean {
  try {
    const preference = localStorage.getItem('haptics-enabled');
    return preference === null || preference === 'true';
  } catch {
    return true;
  }
}

/**
 * React hook for haptic feedback
 */
export function useHaptics() {
  return {
    trigger: triggerHaptic,
    stop: stopHaptic,
    enable: enableHaptics,
    disable: disableHaptics,
    isEnabled: areHapticsEnabled(),
    isSupported: isVibrationSupported(),
  };
}

/**
 * Haptic feedback shortcuts for common interactions
 */
export const Haptics = {
  /**
   * Light tap for button presses
   */
  tap: () => triggerHaptic('light'),

  /**
   * Medium tap for important actions
   */
  press: () => triggerHaptic('medium'),

  /**
   * Heavy tap for critical actions
   */
  impact: () => triggerHaptic('heavy'),

  /**
   * Success pattern for completed actions
   */
  success: () => triggerHaptic('success'),

  /**
   * Warning pattern for cautions
   */
  warning: () => triggerHaptic('warning'),

  /**
   * Error pattern for failures
   */
  error: () => triggerHaptic('error'),

  /**
   * Selection tick for list selections
   */
  selection: () => triggerHaptic('selection'),
};

export default Haptics;
