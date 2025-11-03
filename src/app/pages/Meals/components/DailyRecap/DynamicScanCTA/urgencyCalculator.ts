/**
 * Urgency Calculator - Calcul des niveaux d'urgence
 * Détermine l'urgence et les effets visuels du CTA
 */

import { UrgencyLevel, type NutritionalContext } from './contextAnalysis';

export interface UrgencyConfig {
  level: UrgencyLevel;
  color: string;
  icon: string;
  animation: 'none' | 'pulse' | 'breathing';
  audioFeedback: 'click' | 'success' | 'successMajor';
  priority: 'low' | 'medium' | 'high';
}

/**
 * Calculer la configuration d'urgence
 */
export function calculateUrgencyConfig(context: NutritionalContext): UrgencyConfig {
  const { urgencyLevel, nutritionalStatus, mealTiming } = context;

  // Toujours utiliser le vert (#10B981) pour harmoniser avec l'onglet Aujourd'hui
  const greenColor = '#10B981';

  switch (urgencyLevel) {
    case UrgencyLevel.HIGH:
      return {
        level: UrgencyLevel.HIGH,
        color: greenColor,
        icon: 'AlertCircle',
        animation: 'pulse',
        audioFeedback: 'successMajor',
        priority: 'high'
      };

    case UrgencyLevel.LOW:
      return {
        level: UrgencyLevel.LOW,
        color: greenColor,
        icon: 'Check',
        animation: 'none',
        audioFeedback: 'success',
        priority: 'low'
      };

    case UrgencyLevel.NORMAL:
    default:
      return {
        level: UrgencyLevel.NORMAL,
        color: greenColor,
        icon: 'Camera',
        animation: 'breathing',
        audioFeedback: 'click',
        priority: 'medium'
      };
  }
}

/**
 * Générer les styles CSS dynamiques
 */
export function generateUrgencyStyles(config: UrgencyConfig): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    background: `
      radial-gradient(circle at 30% 20%, color-mix(in srgb, ${config.color} 12%, transparent) 0%, transparent 60%),
      radial-gradient(circle at 70% 80%, color-mix(in srgb, ${config.color} 8%, transparent) 0%, transparent 50%),
      var(--glass-opacity)
    `,
    borderColor: `color-mix(in srgb, ${config.color} 25%, transparent)`,
    boxShadow: config.priority === 'high' ? `
      0 16px 48px rgba(0, 0, 0, 0.3),
      0 0 40px color-mix(in srgb, ${config.color} 25%, transparent),
      0 0 80px color-mix(in srgb, ${config.color} 15%, transparent),
      inset 0 2px 0 rgba(255, 255, 255, 0.2)
    ` : `
      0 12px 40px rgba(0, 0, 0, 0.25),
      0 0 30px color-mix(in srgb, ${config.color} 15%, transparent),
      inset 0 2px 0 rgba(255, 255, 255, 0.15)
    `,
    backdropFilter: 'blur(24px) saturate(160%)'
  };
  
  return baseStyles;
}

/**
 * Générer les styles pour l'icône principale
 */
export function generateIconStyles(config: UrgencyConfig): React.CSSProperties {
  return {
    background: `
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
      linear-gradient(135deg, color-mix(in srgb, ${config.color} 40%, transparent), color-mix(in srgb, ${config.color} 30%, transparent))
    `,
    border: `2px solid color-mix(in srgb, ${config.color} 60%, transparent)`,
    boxShadow: config.priority === 'high' ? `
      0 0 50px color-mix(in srgb, ${config.color} 60%, transparent),
      0 0 100px color-mix(in srgb, ${config.color} 30%, transparent),
      inset 0 3px 0 rgba(255, 255, 255, 0.4)
    ` : `
      0 0 40px color-mix(in srgb, ${config.color} 50%, transparent),
      inset 0 2px 0 rgba(255, 255, 255, 0.3)
    `
  };
}

/**
 * Générer les styles pour le bouton principal
 */
export function generateButtonStyles(config: UrgencyConfig): React.CSSProperties {
  return {
    borderRadius: '999px',
    background: `
      linear-gradient(135deg, 
        color-mix(in srgb, ${config.color} 90%, transparent), 
        color-mix(in srgb, ${config.color} 70%, transparent),
        color-mix(in srgb, ${config.color} 80%, transparent)
      )
    `,
    backdropFilter: 'blur(20px) saturate(160%)',
    boxShadow: config.priority === 'high' ? `
      0 20px 60px color-mix(in srgb, ${config.color} 50%, transparent),
      0 0 100px color-mix(in srgb, ${config.color} 40%, transparent),
      0 0 150px color-mix(in srgb, ${config.color} 25%, transparent),
      inset 0 3px 0 rgba(255,255,255,0.4),
      inset 0 -3px 0 rgba(0,0,0,0.2)
    ` : `
      0 12px 40px color-mix(in srgb, ${config.color} 40%, transparent), 
      0 0 60px color-mix(in srgb, ${config.color} 30%, transparent),
      inset 0 3px 0 rgba(255,255,255,0.4),
      inset 0 -3px 0 rgba(0,0,0,0.2)
    `,
    border: `2px solid color-mix(in srgb, ${config.color} 80%, transparent)`,
    minHeight: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
}

/**
 * Déterminer si des particules doivent être affichées
 */
export function shouldShowParticles(config: UrgencyConfig): boolean {
  return config.priority === 'high' || config.animation === 'pulse';
}

/**
 * Générer le nombre de particules selon l'urgence
 */
export function getParticleCount(config: UrgencyConfig): number {
  switch (config.priority) {
    case 'high': return 6;
    case 'medium': return 4;
    case 'low': return 2;
    default: return 4;
  }
}