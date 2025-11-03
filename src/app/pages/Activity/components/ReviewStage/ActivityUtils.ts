/**
 * Activity Utils - Utilitaires pour les activités
 * Fonctions de calcul et constantes pour la gestion des activités
 */

// Table MET pour le calcul des calories
export const MET_VALUES: Record<string, Record<string, number>> = {
  'course': { low: 6.0, medium: 8.0, high: 10.0, very_high: 12.0 },
  'marche': { low: 2.5, medium: 3.5, high: 4.5, very_high: 5.0 },
  'vélo': { low: 4.0, medium: 6.0, high: 8.0, very_high: 10.0 },
  'musculation': { low: 3.0, medium: 4.0, high: 5.0, very_high: 6.0 },
  'yoga': { low: 2.0, medium: 2.5, high: 3.0, very_high: 3.5 },
  'natation': { low: 4.0, medium: 6.0, high: 8.0, very_high: 10.0 },
  'football': { low: 4.0, medium: 6.0, high: 8.0, very_high: 10.0 },
  'tennis': { low: 4.0, medium: 5.5, high: 7.0, very_high: 8.5 },
  'danse': { low: 3.0, medium: 4.5, high: 6.0, very_high: 7.5 },
  'étirements': { low: 2.0, medium: 2.5, high: 3.0, very_high: 3.5 },
  'default': { low: 3.0, medium: 4.0, high: 5.0, very_high: 6.0 }
};

/**
 * Calculer les calories brûlées pour une activité
 */
export function calculateCalories(activityType: string, intensity: string, durationMin: number, weightKg: number): number {
  const normalizedType = activityType.toLowerCase();
  let metValue = MET_VALUES.default[intensity] || 4.0;
  
  // Recherche de correspondance dans la table MET
  for (const [key, values] of Object.entries(MET_VALUES)) {
    if (normalizedType.includes(key)) {
      metValue = values[intensity] || values.medium;
      break;
    }
  }
  
  // Formule MET: Calories = METs × Poids (kg) × Durée (heures)
  const durationHours = durationMin / 60;
  return Math.round(metValue * weightKg * durationHours);
}

/**
 * Obtenir la couleur d'intensité
 */
export function getIntensityColor(intensity: string): string {
  switch (intensity) {
    case 'low': return '#22C55E';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'very_high': return '#DC2626';
    default: return '#3B82F6';
  }
}

/**
 * Obtenir l'icône appropriée pour un type d'activité
 */
export function getActivityIcon(type: string): string {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('course') || lowerType.includes('running')) return 'Activity';
  if (lowerType.includes('marche') || lowerType.includes('walk')) return 'Activity';
  if (lowerType.includes('vélo') || lowerType.includes('bike')) return 'Activity';
  if (lowerType.includes('natation') || lowerType.includes('swim')) return 'Activity';
  if (lowerType.includes('musculation')) return 'Dumbbell';
  if (lowerType.includes('yoga')) return 'Smile';
  if (lowerType.includes('football') || lowerType.includes('sport')) return 'Target';
  if (lowerType.includes('tennis')) return 'Target';
  if (lowerType.includes('danse')) return 'Smile';
  if (lowerType.includes('étirement')) return 'Smile';
  return 'Zap';
}

/**
 * Obtenir le label d'intensité en français
 */
export function getIntensityLabel(intensity: string): string {
  switch (intensity) {
    case 'low': return 'Faible';
    case 'medium': return 'Modérée';
    case 'high': return 'Intense';
    case 'very_high': return 'Très Intense';
    default: return 'Modérée';
  }
}