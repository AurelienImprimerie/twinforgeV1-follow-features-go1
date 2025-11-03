/**
 * Fasting Utilities
 * Utility functions for fasting calculations and formatting
 */

/**
 * Format elapsed time from total seconds to readable format
 */
export function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Format elapsed time from hours to readable format (for session duration)
 */
export function formatElapsedTimeHours(totalHours: number): string {
  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalHours - hours) * 60);
  const seconds = Math.floor(((totalHours - hours) * 60 - minutes) * 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Calculate fasting progress percentage
 */
export function calculateFastingProgress(elapsedSeconds: number, targetHours: number): number {
  const targetSeconds = targetHours * 60 * 60;
  return Math.min(100, (elapsedSeconds / targetSeconds) * 100);
}

/**
 * Get protocol display name
 */
export function getProtocolDisplayName(targetHours: number): string {
  const eatingHours = 24 - targetHours;
  return `${targetHours}:${eatingHours}`;
}

/**
 * Determine session outcome based on target vs actual duration
 */
export function determineSessionOutcome(
  actualDurationHours: number,
  targetHours: number
): 'success' | 'partial' | 'missed' {
  const completionPercentage = (actualDurationHours / targetHours) * 100;
  
  if (completionPercentage >= 90) return 'success';    // 90%+ = Success
  if (completionPercentage >= 50) return 'partial';    // 50-89% = Partial
  return 'missed';                                     // <50% = Missed
}

/**
 * Get outcome theme colors and content
 */
export function getOutcomeTheme(outcome: 'success' | 'partial' | 'missed') {
  switch (outcome) {
    case 'success':
      return {
        primaryColor: '#22C55E',
        secondaryColor: '#10B981',
        icon: 'Check' as const,
        title: 'Forge Accomplie !',
        subtitle: 'Votre session de jeûne a été complétée avec succès',
        message: 'Félicitations ! Vous avez atteint votre objectif de jeûne.'
      };
    case 'partial':
      return {
        primaryColor: '#F59E0B',
        secondaryColor: '#EF4444',
        icon: 'Target' as const,
        title: 'Objectif Partiellement Atteint',
        subtitle: 'Votre session de jeûne a été terminée avant l\'objectif',
        message: 'Bonne progression ! Chaque effort compte pour votre bien-être.'
      };
    case 'missed':
      return {
        primaryColor: '#EF4444',
        secondaryColor: '#F59E0B',
        icon: 'Clock' as const,
        title: 'Session Terminée',
        subtitle: 'Votre session de jeûne a été interrompue tôt',
        message: 'Pas de souci ! Chaque tentative vous rapproche de vos objectifs.'
      };
  }
}