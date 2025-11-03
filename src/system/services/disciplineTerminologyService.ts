/**
 * Discipline Terminology Service
 * Provides discipline-specific translations and contextual content
 * Maps generic training terms to discipline-appropriate vocabulary
 */

import type { DisciplineConfig } from '../../hooks/useDisciplineAdaptiveContent';

export interface DisciplineTerms {
  volume: string;
  volumeDescription: string;
  intensity: string;
  intensityDescription: string;
  session: string;
  sessions: string;
  recovery: string;
  recoveryDescription: string;
  progression: string;
  strategy: string;
  weeklyFocus: string;
  performanceMetric: string;
}

export interface DisciplineRecommendations {
  volumeIncreasing: {
    title: string;
    descriptions: string[];
  };
  volumeDecreasing: {
    title: string;
    descriptions: string[];
  };
  volumeStable: {
    title: string;
    descriptions: string[];
  };
  intensityHigh: {
    title: string;
    descriptions: string[];
  };
  intensityLow: {
    title: string;
    descriptions: string[];
  };
  intensityOptimal: {
    title: string;
    descriptions: string[];
  };
}

const DISCIPLINE_TERMINOLOGY: Record<string, DisciplineTerms> = {
  // Force & Powerbuilding
  strength: {
    volume: 'Volume d\'Entraînement',
    volumeDescription: 'Analyse de votre charge de travail totale en kg',
    intensity: 'Intensité de Charge',
    intensityDescription: 'Votre RPE moyen et charge relative',
    session: 'séance',
    sessions: 'séances',
    recovery: 'Récupération Musculaire',
    recoveryDescription: 'État de récupération de vos groupes musculaires',
    progression: 'Progression en Force',
    strategy: 'Plan de Séances',
    weeklyFocus: 'Groupes Musculaires',
    performanceMetric: 'Volume total (kg)',
  },

  powerlifting: {
    volume: 'Volume de Powerlifting',
    volumeDescription: 'Analyse du tonnage total sur les lifts principaux',
    intensity: 'Intensité Relative',
    intensityDescription: 'Votre % de 1RM moyen',
    session: 'session',
    sessions: 'sessions',
    recovery: 'Récupération CNS',
    recoveryDescription: 'État de votre système nerveux central',
    progression: 'PRs et Records',
    strategy: 'Périodisation',
    weeklyFocus: 'Lifts Principaux',
    performanceMetric: 'Intensité moyenne (%1RM)',
  },

  // Endurance
  running: {
    volume: 'Volume de Kilométrage',
    volumeDescription: 'Analyse de votre distance totale hebdomadaire',
    intensity: 'Distribution des Zones',
    intensityDescription: 'Répartition de vos zones cardio',
    session: 'sortie',
    sessions: 'sorties',
    recovery: 'Récupération Active',
    recoveryDescription: 'Niveau de fatigue cardio-vasculaire',
    progression: 'Amélioration de l\'Allure',
    strategy: 'Plan d\'Entraînement',
    weeklyFocus: 'Zones d\'Entraînement',
    performanceMetric: 'Distance totale (km)',
  },

  cycling: {
    volume: 'Volume d\'Entraînement',
    volumeDescription: 'Analyse de votre kilométrage et TSS',
    intensity: 'Distribution de Puissance',
    intensityDescription: 'Répartition de vos zones de puissance',
    session: 'sortie',
    sessions: 'sorties',
    recovery: 'Récupération Cardio',
    recoveryDescription: 'Niveau de fraîcheur pour performer',
    progression: 'Amélioration du FTP',
    strategy: 'Planification',
    weeklyFocus: 'Zones de Puissance',
    performanceMetric: 'TSS hebdomadaire',
  },

  // Functional
  crossfit: {
    volume: 'Volume de Travail',
    volumeDescription: 'Analyse de votre charge de WODs',
    intensity: 'Intensité des WODs',
    intensityDescription: 'Difficulté moyenne de vos sessions',
    session: 'WOD',
    sessions: 'WODs',
    recovery: 'Récupération Globale',
    recoveryDescription: 'État général après les WODs',
    progression: 'Performance Fonctionnelle',
    strategy: 'Programmation',
    weeklyFocus: 'Modalités',
    performanceMetric: 'Rounds complétés',
  },

  hiit: {
    volume: 'Volume d\'Intervals',
    volumeDescription: 'Analyse de vos sessions haute intensité',
    intensity: 'Intensité Maximale',
    intensityDescription: 'Votre effort relatif moyen',
    session: 'session',
    sessions: 'sessions',
    recovery: 'Récupération Métabolique',
    recoveryDescription: 'Capacité à enchaîner les intervals',
    progression: 'Capacité Anaérobie',
    strategy: 'Périodisation HIIT',
    weeklyFocus: 'Protocoles',
    performanceMetric: 'Temps total haute intensité',
  },

  // Calisthenics
  calisthenics: {
    volume: 'Volume de Skills',
    volumeDescription: 'Analyse de votre pratique totale',
    intensity: 'Difficulté des Skills',
    intensityDescription: 'Niveau moyen de vos mouvements',
    session: 'session',
    sessions: 'sessions',
    recovery: 'Récupération Tendineuse',
    recoveryDescription: 'État de vos articulations et tendons',
    progression: 'Maîtrise des Skills',
    strategy: 'Plan de Skills',
    weeklyFocus: 'Patterns de Mouvements',
    performanceMetric: 'Skills maîtrisés',
  },

  // Competitions
  hyrox: {
    volume: 'Volume d\'Entraînement HYROX',
    volumeDescription: 'Analyse de votre préparation aux 8 stations',
    intensity: 'Intensité Compétition',
    intensityDescription: 'Votre capacité à maintenir le rythme',
    session: 'session',
    sessions: 'sessions',
    recovery: 'Récupération Hybride',
    recoveryDescription: 'État musculaire et cardio-vasculaire',
    progression: 'Temps sur Stations',
    strategy: 'Stratégie de Course',
    weeklyFocus: 'Stations Prioritaires',
    performanceMetric: 'Temps total estimé',
  },
};

const DISCIPLINE_RECOMMENDATIONS: Record<string, DisciplineRecommendations> = {
  strength: {
    volumeIncreasing: {
      title: 'Surveiller la récupération musculaire',
      descriptions: [
        'Avec l\'augmentation du volume, assurez-vous d\'avoir une récupération suffisante entre les séances',
        'Ne sacrifiez pas la qualité technique pour la quantité de séries',
        'Considérez un deload si la fatigue s\'accumule',
      ],
    },
    volumeDecreasing: {
      title: 'Reprendre le volume progressivement',
      descriptions: [
        'Augmentez le volume graduellement (10-15% de séries par semaine)',
        'Identifiez les groupes musculaires négligés',
        'Vérifiez si la baisse est due à la fatigue ou au temps disponible',
      ],
    },
    volumeStable: {
      title: 'Phase de consolidation',
      descriptions: [
        'Profitez de cette période pour perfectionner votre technique',
        'Travaillez la connexion esprit-muscle',
        'Préparez une augmentation progressive du volume',
      ],
    },
    intensityHigh: {
      title: 'Intensité élevée détectée',
      descriptions: [
        'RPE élevé détecté sur plusieurs séances',
        'Alternez avec des séances à RPE plus modéré',
        'Surveillez les signes de surentraînement',
      ],
    },
    intensityLow: {
      title: 'Marge de progression disponible',
      descriptions: [
        'Vous pouvez augmenter les charges progressivement',
        'Tentez des séries avec un RPE plus élevé',
        'N\'oubliez pas la surcharge progressive',
      ],
    },
    intensityOptimal: {
      title: 'Intensité bien calibrée',
      descriptions: [
        'Votre RPE moyen est dans la zone optimale',
        'Maintenez cette intensité pour progresser',
        'Variez les schémas de répétitions',
      ],
    },
  },

  running: {
    volumeIncreasing: {
      title: 'Attention au sur-kilométrage',
      descriptions: [
        'Augmentation du kilométrage détectée, surveillez les blessures',
        'Respectez la règle des 10% d\'augmentation par semaine',
        'Intégrez des jours de repos complet',
      ],
    },
    volumeDecreasing: {
      title: 'Reprendre le kilométrage prudemment',
      descriptions: [
        'Reprenez progressivement avec des sorties faciles',
        'Privilégiez la régularité à l\'intensité',
        'Écoutez les signaux de votre corps',
      ],
    },
    volumeStable: {
      title: 'Kilométrage stable et adapté',
      descriptions: [
        'Profitez de cette base pour travailler la vitesse',
        'Intégrez des séances de qualité',
        'Travaillez votre économie de course',
      ],
    },
    intensityHigh: {
      title: 'Trop de temps en zones élevées',
      descriptions: [
        'Réduisez la proportion de sorties intenses',
        'Appliquez la règle 80/20 (80% facile, 20% intense)',
        'Vos sorties longues doivent rester en zone 2',
      ],
    },
    intensityLow: {
      title: 'Intégrer plus de séances de qualité',
      descriptions: [
        'Ajoutez des intervalles ou du tempo',
        'Variez les allures pour progresser',
        'Une séance de qualité par semaine minimum',
      ],
    },
    intensityOptimal: {
      title: 'Distribution des zones optimale',
      descriptions: [
        'Votre répartition zones faciles/intenses est excellente',
        'Continuez à respecter cette distribution',
        'Base aérobie solide en zone 2',
      ],
    },
  },

  crossfit: {
    volumeIncreasing: {
      title: 'Volume de WODs en augmentation',
      descriptions: [
        'Attention à la fatigue cumulée des WODs',
        'Variez les modalités pour éviter la monotonie',
        'Prévoyez des jours de mobilité',
      ],
    },
    volumeDecreasing: {
      title: 'Reprendre la fréquence des WODs',
      descriptions: [
        'Reprenez avec des WODs scaled',
        'Focus sur la technique avant l\'intensité',
        'Identifiez vos goats et travaillez-les',
      ],
    },
    volumeStable: {
      title: 'Régularité dans les WODs',
      descriptions: [
        'Profitez de cette base pour améliorer vos faiblesses',
        'Travaillez les skills qui vous limitent',
        'Variez les time domains',
      ],
    },
    intensityHigh: {
      title: 'WODs trop intenses',
      descriptions: [
        'Réduisez l\'intensité sur certains WODs',
        'Alternez avec des sessions de skills',
        'Ne visez pas le redline à chaque fois',
      ],
    },
    intensityLow: {
      title: 'Intensité à augmenter',
      descriptions: [
        'Poussez plus fort sur les WODs',
        'Réduisez les temps de repos',
        'Testez-vous sur des benchmarks',
      ],
    },
    intensityOptimal: {
      title: 'Intensité bien dosée',
      descriptions: [
        'Bon équilibre entre effort et récupération',
        'Continuez à varier les stimulus',
        'Mix parfait de MetCons et skills',
      ],
    },
  },

  cycling: {
    volumeIncreasing: {
      title: 'Volume et TSS en augmentation',
      descriptions: [
        'Surveillez votre CTL et évitez les pics de TSS',
        'Respectez les semaines de récupération',
        'Adaptez votre nutrition au volume',
      ],
    },
    volumeDecreasing: {
      title: 'Reprendre le kilométrage vélo',
      descriptions: [
        'Reprenez avec des sorties en endurance',
        'Travaillez votre cadence',
        'Reconstruisez votre base aérobie',
      ],
    },
    volumeStable: {
      title: 'Volume stable et adapté',
      descriptions: [
        'Base solide pour intégrer des intervals',
        'Travaillez vos zones de puissance',
        'Testez votre FTP régulièrement',
      ],
    },
    intensityHigh: {
      title: 'Trop de temps en haute intensité',
      descriptions: [
        'Réduisez les sorties au-dessus de votre FTP',
        'Privilégiez les longues sorties en Z2',
        'La base aérobie est essentielle',
      ],
    },
    intensityLow: {
      title: 'Intégrer plus d\'intensité',
      descriptions: [
        'Ajoutez des intervals structurés',
        'Travaillez votre VO2max',
        'Variez les formats (sweet spot, threshold)',
      ],
    },
    intensityOptimal: {
      title: 'Distribution de puissance optimale',
      descriptions: [
        'Excellente répartition des zones',
        'Continuez cette approche polarisée',
        'Bonne base pour performer',
      ],
    },
  },
};

// Fallback pour les disciplines non mappées
const DEFAULT_TERMS: DisciplineTerms = DISCIPLINE_TERMINOLOGY.strength;
const DEFAULT_RECOMMENDATIONS: DisciplineRecommendations = DISCIPLINE_RECOMMENDATIONS.strength;

class DisciplineTerminologyService {
  /**
   * Get discipline-specific terminology
   */
  getTerminology(disciplineId: string): DisciplineTerms {
    return DISCIPLINE_TERMINOLOGY[disciplineId] || DEFAULT_TERMS;
  }

  /**
   * Get discipline-specific recommendations
   */
  getRecommendations(disciplineId: string): DisciplineRecommendations {
    return DISCIPLINE_RECOMMENDATIONS[disciplineId] || DEFAULT_RECOMMENDATIONS;
  }

  /**
   * Get a specific term translation
   */
  getTerm(disciplineId: string, key: keyof DisciplineTerms): string {
    const terminology = this.getTerminology(disciplineId);
    return terminology[key];
  }

  /**
   * Get volume-related recommendations based on trend
   */
  getVolumeRecommendations(
    disciplineId: string,
    trend: 'increasing' | 'stable' | 'decreasing'
  ): { title: string; descriptions: string[] } {
    const recommendations = this.getRecommendations(disciplineId);

    switch (trend) {
      case 'increasing':
        return recommendations.volumeIncreasing;
      case 'decreasing':
        return recommendations.volumeDecreasing;
      default:
        return recommendations.volumeStable;
    }
  }

  /**
   * Get intensity-related recommendations
   */
  getIntensityRecommendations(
    disciplineId: string,
    level: 'high' | 'optimal' | 'low'
  ): { title: string; descriptions: string[] } {
    const recommendations = this.getRecommendations(disciplineId);

    switch (level) {
      case 'high':
        return recommendations.intensityHigh;
      case 'low':
        return recommendations.intensityLow;
      default:
        return recommendations.intensityOptimal;
    }
  }

  /**
   * Format session count with discipline-specific term
   */
  formatSessionCount(disciplineId: string, count: number): string {
    const terminology = this.getTerminology(disciplineId);
    return `${count} ${count === 1 ? terminology.session : terminology.sessions}`;
  }

  /**
   * Get contextual description for metric
   */
  getMetricDescription(disciplineId: string, metricType: 'volume' | 'intensity' | 'recovery'): string {
    const terminology = this.getTerminology(disciplineId);
    switch (metricType) {
      case 'volume':
        return terminology.volumeDescription;
      case 'intensity':
        return terminology.intensityDescription;
      case 'recovery':
        return terminology.recoveryDescription;
      default:
        return '';
    }
  }
}

export const disciplineTerminologyService = new DisciplineTerminologyService();
