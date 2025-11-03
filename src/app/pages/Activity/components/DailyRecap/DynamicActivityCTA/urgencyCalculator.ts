import { ActivityContext } from './contextAnalysis';

export interface UrgencyConfig {
  priority: 'none' | 'low' | 'medium' | 'high' | 'critical';
  color: string;
  icon: string; // Nom de l'icône dans le registry
  animation: 'none' | 'breathing' | 'pulse';
  particleCount: number;
}

/**
 * Déterminer la configuration d'urgence basée sur le contexte d'activité
 */
export function calculateUrgencyConfig(context: ActivityContext): UrgencyConfig {
  const { urgencyLevel, daysSinceLastActivity, totalActivitiesToday } = context;

  // Configuration basée sur le niveau d'urgence
  switch (urgencyLevel) {
    case 'critical':
      // Aucune activité depuis très longtemps (7+ jours) ou jamais
      return {
        priority: 'critical',
        color: '#EF4444', // Rouge vif
        icon: 'AlertTriangle',
        animation: 'pulse',
        particleCount: 8
      };

    case 'high':
      // 2-7 jours sans activité
      return {
        priority: 'high',
        color: '#F59E0B', // Orange
        icon: 'Zap',
        animation: 'pulse',
        particleCount: 6
      };

    case 'medium':
      // 1 jour sans activité ou activité aujourd'hui mais il y a plusieurs heures
      return {
        priority: 'medium',
        color: '#06B6D4', // Cyan
        icon: 'Activity',
        animation: 'breathing',
        particleCount: 4
      };

    case 'low':
      // Activité très récente ou une activité aujourd'hui
      return {
        priority: 'low',
        color: '#3B82F6', // Bleu
        icon: 'TrendingUp',
        animation: 'breathing',
        particleCount: 2
      };

    case 'none':
    default:
      // Plusieurs activités aujourd'hui, objectifs atteints
      return {
        priority: 'none',
        color: '#22C55E', // Vert
        icon: 'Target',
        animation: 'none',
        particleCount: 0
      };
  }
}

/**
 * Vérifier si les particules doivent être affichées
 */
export function shouldShowParticles(config: UrgencyConfig): boolean {
  return config.particleCount > 0;
}

/**
 * Obtenir le nombre de particules à afficher
 */
export function getParticleCount(config: UrgencyConfig): number {
  return config.particleCount;
}
