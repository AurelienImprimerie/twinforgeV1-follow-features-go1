/**
 * useActivityPerformance Hook
 * Activity-specific performance adaptations for the Energy Forge
 * Uses the centralized PerformanceModeContext for performance settings
 */

import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';

export interface ActivityPerformanceSettings {
  mode: 'high' | 'medium' | 'low';
  enableAnimations: boolean;
  enableComplexEffects: boolean;
  enableRings: boolean;
  enableParticles: boolean;
  enableGlows: boolean;
  enableShimmers: boolean;
  enablePulseEffects: boolean;
  enableRotations: boolean;
  maxActivitiesDisplayed: number;
  chartPointsLimit: number;
  animationDelay: number;
  staggerDelay: number;
  transitionDuration: number;
  calendarDays: number;
}

// Map performance modes to legacy mode format
const mapPerformanceMode = (mode: string): 'high' | 'medium' | 'low' => {
  switch (mode) {
    case 'high-performance':
      return 'high';
    case 'battery-saver':
      return 'low';
    case 'balanced':
    default:
      return 'medium';
  }
};

export const useActivityPerformance = (): ActivityPerformanceSettings => {
  const { mode: performanceMode, isPerformanceMode } = usePerformanceMode();

  // Convert new mode system to legacy mode format
  const mode = mapPerformanceMode(performanceMode);

  // Derive settings from performance mode
  const enableAnimations = mode !== 'low';
  const enableComplexEffects = mode === 'high';

  const maxDataPoints = mode === 'high' ? 90 : mode === 'medium' ? 60 : 30;
  const animationDelay = mode === 'high' ? 0.01 : mode === 'medium' ? 0.02 : 0;
  const calendarDays = mode === 'high' ? 180 : mode === 'medium' ? 90 : 60;

  const activitySettings: ActivityPerformanceSettings = {
    mode,
    enableAnimations,
    enableComplexEffects,
    animationDelay,
    calendarDays,

    enableRings: mode === 'high',
    enableParticles: mode === 'high',
    enableGlows: mode !== 'low',
    enableShimmers: mode !== 'low',
    enablePulseEffects: mode !== 'low',
    enableRotations: mode === 'high',

    maxActivitiesDisplayed:
      mode === 'high' ? 30 :
      mode === 'medium' ? 20 : 10,

    chartPointsLimit: maxDataPoints,

    staggerDelay:
      mode === 'high' ? 0.15 :
      mode === 'medium' ? 0.08 : 0,

    transitionDuration:
      mode === 'high' ? 0.5 :
      mode === 'medium' ? 0.3 : 0.15,
  };

  return activitySettings;
};
