/**
 * Gaming Colors - Constantes de couleurs pour le système de gamification
 * Utilisées dans tous les composants gaming pour cohérence visuelle
 */

export const GAMING_COLORS = {
  // Couleurs par Forge
  FORGE_CULINAIRE: {
    primary: '#EC4899',      // Rose vif
    secondary: '#F472B6',    // Rose moyen
    accent: '#DB2777',       // Rose foncé
    glow: 'rgba(236, 72, 153, 0.4)',
    badge: {
      background: 'color-mix(in srgb, #EC4899 20%, transparent)',
      border: 'color-mix(in srgb, #EC4899 40%, transparent)',
      text: '#EC4899',
    },
    hint: {
      background: 'color-mix(in srgb, #EC4899 10%, transparent)',
      border: 'color-mix(in srgb, #EC4899 25%, transparent)',
      iconBackground: 'color-mix(in srgb, #EC4899 15%, transparent)',
      iconBorder: 'color-mix(in srgb, #EC4899 30%, transparent)',
    },
    success: {
      background: 'color-mix(in srgb, #EC4899 12%, transparent)',
      border: 'color-mix(in srgb, #EC4899 35%, transparent)',
      iconBackground: 'color-mix(in srgb, #EC4899 20%, transparent)',
      iconBorder: 'color-mix(in srgb, #EC4899 45%, transparent)',
    }
  },

  FORGE_NUTRITIONNELLE: {
    primary: '#10B981',      // Vert vif (emerald)
    secondary: '#34D399',    // Vert moyen
    accent: '#059669',       // Vert foncé
    glow: 'rgba(16, 185, 129, 0.4)',
    badge: {
      background: 'color-mix(in srgb, #10B981 20%, transparent)',
      border: 'color-mix(in srgb, #10B981 40%, transparent)',
      text: '#10B981',
    },
    hint: {
      background: 'color-mix(in srgb, #10B981 10%, transparent)',
      border: 'color-mix(in srgb, #10B981 25%, transparent)',
      iconBackground: 'color-mix(in srgb, #10B981 15%, transparent)',
      iconBorder: 'color-mix(in srgb, #10B981 30%, transparent)',
    },
    success: {
      background: 'color-mix(in srgb, #10B981 12%, transparent)',
      border: 'color-mix(in srgb, #10B981 35%, transparent)',
      iconBackground: 'color-mix(in srgb, #10B981 20%, transparent)',
      iconBorder: 'color-mix(in srgb, #10B981 45%, transparent)',
    }
  },

  FORGE_ENTRAINEMENT: {
    primary: '#3B82F6',      // Bleu vif
    secondary: '#60A5FA',    // Bleu moyen
    accent: '#2563EB',       // Bleu foncé
    glow: 'rgba(59, 130, 246, 0.4)',
    badge: {
      background: 'color-mix(in srgb, #3B82F6 20%, transparent)',
      border: 'color-mix(in srgb, #3B82F6 40%, transparent)',
      text: '#3B82F6',
    },
    hint: {
      background: 'color-mix(in srgb, #3B82F6 10%, transparent)',
      border: 'color-mix(in srgb, #3B82F6 25%, transparent)',
      iconBackground: 'color-mix(in srgb, #3B82F6 15%, transparent)',
      iconBorder: 'color-mix(in srgb, #3B82F6 30%, transparent)',
    },
    success: {
      background: 'color-mix(in srgb, #3B82F6 12%, transparent)',
      border: 'color-mix(in srgb, #3B82F6 35%, transparent)',
      iconBackground: 'color-mix(in srgb, #3B82F6 20%, transparent)',
      iconBorder: 'color-mix(in srgb, #3B82F6 45%, transparent)',
    }
  },

  FORGE_JEUNE: {
    primary: '#F59E0B',      // Orange vif (amber)
    secondary: '#FBBF24',    // Orange moyen
    accent: '#D97706',       // Orange foncé
    glow: 'rgba(245, 158, 11, 0.4)',
    badge: {
      background: 'color-mix(in srgb, #F59E0B 20%, transparent)',
      border: 'color-mix(in srgb, #F59E0B 40%, transparent)',
      text: '#F59E0B',
    },
    hint: {
      background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
      border: 'color-mix(in srgb, #F59E0B 25%, transparent)',
      iconBackground: 'color-mix(in srgb, #F59E0B 15%, transparent)',
      iconBorder: 'color-mix(in srgb, #F59E0B 30%, transparent)',
    },
    success: {
      background: 'color-mix(in srgb, #F59E0B 12%, transparent)',
      border: 'color-mix(in srgb, #F59E0B 35%, transparent)',
      iconBackground: 'color-mix(in srgb, #F59E0B 20%, transparent)',
      iconBorder: 'color-mix(in srgb, #F59E0B 45%, transparent)',
    }
  },

  // Couleurs pour les niveaux et achievements
  LEVEL: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  },

  // Couleurs pour les streaks
  STREAK: {
    low: '#10B981',      // 1-6 jours
    medium: '#F59E0B',   // 7-29 jours
    high: '#EF4444',     // 30+ jours
  },

  // Couleurs génériques gaming
  GENERIC: {
    primary: '#8B5CF6',      // Violet (pour actions générales)
    secondary: '#A78BFA',
    accent: '#7C3AED',
    glow: 'rgba(139, 92, 246, 0.4)',
    badge: {
      background: 'color-mix(in srgb, #8B5CF6 20%, transparent)',
      border: 'color-mix(in srgb, #8B5CF6 40%, transparent)',
      text: '#8B5CF6',
    },
    hint: {
      background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
      border: 'color-mix(in srgb, #8B5CF6 25%, transparent)',
      iconBackground: 'color-mix(in srgb, #8B5CF6 15%, transparent)',
      iconBorder: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
    },
    success: {
      background: 'color-mix(in srgb, #8B5CF6 12%, transparent)',
      border: 'color-mix(in srgb, #8B5CF6 35%, transparent)',
      iconBackground: 'color-mix(in srgb, #8B5CF6 20%, transparent)',
      iconBorder: 'color-mix(in srgb, #8B5CF6 45%, transparent)',
    }
  }
} as const;

/**
 * Obtenir la couleur d'une forge par son nom
 */
export function getForgeColor(forgeName: string) {
  const normalized = forgeName.toLowerCase().replace(/\s+/g, '_');

  if (normalized.includes('culinaire') || normalized.includes('culinary')) {
    return GAMING_COLORS.FORGE_CULINAIRE;
  }

  if (normalized.includes('nutrition')) {
    return GAMING_COLORS.FORGE_NUTRITIONNELLE;
  }

  if (normalized.includes('entrainement') || normalized.includes('training')) {
    return GAMING_COLORS.FORGE_ENTRAINEMENT;
  }

  if (normalized.includes('jeune') || normalized.includes('fasting')) {
    return GAMING_COLORS.FORGE_JEUNE;
  }

  return GAMING_COLORS.GENERIC;
}

/**
 * Obtenir la couleur de streak selon le nombre de jours
 */
export function getStreakColor(streakDays: number): string {
  if (streakDays >= 30) return GAMING_COLORS.STREAK.high;
  if (streakDays >= 7) return GAMING_COLORS.STREAK.medium;
  return GAMING_COLORS.STREAK.low;
}

/**
 * Types d'actions par forge avec leurs couleurs
 */
export const FORGE_ACTIONS = {
  // Forge Culinaire
  FRIDGE_SCAN: { points: 30, forge: 'culinaire', color: GAMING_COLORS.FORGE_CULINAIRE },
  RECIPE_GENERATED: { points: 20, forge: 'culinaire', color: GAMING_COLORS.FORGE_CULINAIRE },
  MEAL_PLAN_GENERATED: { points: 35, forge: 'culinaire', color: GAMING_COLORS.FORGE_CULINAIRE },
  SHOPPING_LIST_GENERATED: { points: 15, forge: 'culinaire', color: GAMING_COLORS.FORGE_CULINAIRE },

  // Forge Nutritionnelle
  MEAL_SCAN: { points: 25, forge: 'nutritionnelle', color: GAMING_COLORS.FORGE_NUTRITIONNELLE },
  BARCODE_SCAN: { points: 15, forge: 'nutritionnelle', color: GAMING_COLORS.FORGE_NUTRITIONNELLE },
  DAILY_RECAP_VIEWED: { points: 10, forge: 'nutritionnelle', color: GAMING_COLORS.FORGE_NUTRITIONNELLE },
  TREND_ANALYSIS_VIEWED: { points: 10, forge: 'nutritionnelle', color: GAMING_COLORS.FORGE_NUTRITIONNELLE },

  // Forge Entraînement
  TRAINING_SESSION: { points: 30, forge: 'entrainement', color: GAMING_COLORS.FORGE_ENTRAINEMENT },
  BODY_SCAN: { points: 25, forge: 'entrainement', color: GAMING_COLORS.FORGE_ENTRAINEMENT },

  // Forge Jeûne
  FASTING_SUCCESS: { points: 50, forge: 'jeune', color: GAMING_COLORS.FORGE_JEUNE },
  FASTING_PARTIAL_12H: { points: 35, forge: 'jeune', color: GAMING_COLORS.FORGE_JEUNE },
  FASTING_PARTIAL_8H: { points: 25, forge: 'jeune', color: GAMING_COLORS.FORGE_JEUNE },

  // Actions générales
  WEIGHT_UPDATE: { points: 15, forge: 'general', color: GAMING_COLORS.GENERIC },
  WEARABLE_SYNC: { points: 15, forge: 'general', color: GAMING_COLORS.GENERIC },
} as const;
