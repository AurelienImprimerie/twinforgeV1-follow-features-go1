/**
 * Configuration centralisée pour les pages placeholder
 * Définit les métadonnées, onglets et features pour chaque page en construction
 */

import { ICONS } from '../ui/icons/registry';

export interface TabConfig {
  value: string;
  label: string;
  icon?: keyof typeof ICONS;
  description: string;
  features: string[];
  color?: string;
}

export interface PageConfig {
  title: string;
  subtitle: string;
  icon: keyof typeof ICONS;
  color: string;
  circuit: string;
  tabs: TabConfig[];
}

export const PLACEHOLDER_PAGES_CONFIG: Record<string, PageConfig> = {
  meals: {
    title: 'Forge Nutritionnelle',
    subtitle: 'Scanner et journal de vos repas quotidiens',
    icon: 'Utensils',
    color: '#10B981',
    circuit: 'meals',
    tabs: [
      {
        value: 'journal',
        label: 'Journal',
        icon: 'FileText',
        description: 'Enregistrez vos repas, suivez vos apports nutritionnels et analysez vos habitudes alimentaires.',
        features: [
          'Scan de codes-barres',
          'Base de données nutritionnelle',
          'Suivi des macronutriments',
          'Analyses et recommandations'
        ]
      },
      {
        value: 'statistiques',
        label: 'Statistiques',
        icon: 'BarChart3',
        description: 'Visualisez vos statistiques nutritionnelles, tendances et objectifs quotidiens.',
        features: [
          'Graphiques de progression',
          'Analyse des tendances',
          'Objectifs personnalisés',
          'Rapports détaillés'
        ]
      }
    ]
  },

  fasting: {
    title: 'Forge du Temps',
    subtitle: 'Suivi de votre jeûne intermittent',
    icon: 'Timer',
    color: '#F59E0B',
    circuit: 'fasting',
    tabs: [
      {
        value: 'timer',
        label: 'Timer',
        icon: 'Clock',
        description: 'Suivez vos sessions de jeûne en temps réel avec un timer intelligent et des notifications.',
        features: [
          'Timer de jeûne en temps réel',
          'Notifications personnalisées',
          'Widgets de suivi',
          'Mode sombre optimisé'
        ]
      },
      {
        value: 'historique',
        label: 'Historique',
        icon: 'History',
        description: 'Consultez l\'historique complet de vos sessions de jeûne et analysez vos performances.',
        features: [
          'Historique des sessions',
          'Statistiques détaillées',
          'Graphiques de progression',
          'Comparaisons temporelles'
        ]
      },
      {
        value: 'protocoles',
        label: 'Protocoles',
        icon: 'Settings',
        description: 'Gérez et personnalisez vos protocoles de jeûne intermittent selon vos objectifs.',
        features: [
          'Protocoles personnalisés',
          'Templates pré-configurés',
          'Objectifs adaptatifs',
          'Recommandations personnalisées'
        ]
      }
    ]
  },

  training: {
    title: 'Atelier de Training',
    subtitle: 'Générateur de programmes d\'entraînement personnalisés',
    icon: 'Dumbbell',
    color: '#18E3FF',
    circuit: 'training',
    tabs: [
      {
        value: 'aujourd hui',
        label: 'Aujourd\'hui',
        icon: 'Home',
        description: 'Votre hub d\'entraînement quotidien avec statut instantané et action rapide.',
        features: [],
        pageHeader: {
          icon: 'Home',
          title: 'Aujourd\'hui',
          subtitle: 'Votre entraînement du jour',
          color: '#18E3FF'
        }
      },
      {
        value: 'conseils',
        label: 'Conseils',
        icon: 'Lightbulb',
        description: 'Coach personnel analysant vos données pour des recommandations ultra-personnalisées.',
        features: [],
        pageHeader: {
          icon: 'Lightbulb',
          title: 'Conseils',
          subtitle: 'Recommandations personnalisées',
          color: '#10B981'
        }
      },
      {
        value: 'progression',
        label: 'Progression',
        icon: 'TrendingUp',
        description: 'Visualisez votre évolution détaillée avec insights personnalisés.',
        features: [
          'Graphiques progression volume et intensité',
          'Évolution de la force par groupe musculaire',
          'Calendrier de constance et streaks',
          'Système de niveaux et XP'
        ],
        pageHeader: {
          icon: 'TrendingUp',
          title: 'Progression',
          subtitle: 'Évolution de vos performances',
          color: '#F59E0B'
        }
      },
      {
        value: 'records',
        label: 'Records',
        icon: 'Trophy',
        description: 'Tous vos records personnels et meilleurs performances.',
        features: [
          'Timeline des records personnels',
          'Achievements et badges débloqués',
          'Parcours et milestones',
          'Historique des améliorations'
        ],
        pageHeader: {
          icon: 'Trophy',
          title: 'Records',
          subtitle: 'Vos records et meilleures performances',
          color: '#EF4444'
        }
      },
      {
        value: 'historique',
        label: 'Historique',
        icon: 'History',
        description: 'Toutes vos séances passées avec détails complets et filtres avancés.',
        features: [
          'Timeline chronologique complète',
          'Filtres par période et type',
          'Statistiques globales',
          'Export des données'
        ],
        pageHeader: {
          icon: 'History',
          title: 'Historique',
          subtitle: 'Toutes vos séances passées',
          color: '#8B5CF6'
        }
      }
    ]
  },

  settings: {
    title: 'Réglages',
    subtitle: 'Paramètres de l\'application',
    icon: 'Settings',
    color: '#8B5CF6',
    circuit: 'settings',
    tabs: [
      {
        value: 'preferences',
        label: 'Préférences',
        icon: 'User',
        description: 'Personnalisez votre expérience utilisateur',
        color: '#8B5CF6',
        features: [
          'Choix du thème (clair/sombre/auto)',
          'Choix de la voix du coach vocal',
          'Préférences d\'interface',
          'Langue et région',
          'Unités de mesure'
        ]
      },
      {
        value: 'notifications',
        label: 'Notifications',
        icon: 'Bell',
        description: 'Alertes et rappels personnalisés',
        color: '#EC4899',
        features: [
          'Notifications personnalisées',
          'Horaires de rappel',
          'Canaux de notification',
          'Sons et vibrations'
        ]
      },
      {
        value: 'appareils',
        label: 'Appareils',
        icon: 'Watch',
        description: 'Synchronisez vos trackers fitness',
        color: '#06B6D4',
        features: [
          'Strava, Garmin, Fitbit, Apple Health',
          'Polar, Wahoo, WHOOP, Oura',
          'Synchronisation automatique',
          'Données de santé et fitness',
          'Historique de synchronisation',
          'Mode simulation pour développement'
        ]
      },
      {
        value: 'performance',
        label: 'Performance',
        icon: 'Zap',
        description: 'Optimisez les performances visuelles selon votre appareil',
        color: '#F59E0B',
        features: [
          'Mode Ultra Performance pour iPhone 8-10',
          'Mode Équilibré pour iPhone 11-12',
          'Mode Premium pour iPhone 13+',
          'Détection automatique de l\'appareil',
          'Optimisations GPU adaptatives'
        ]
      },
      {
        value: 'confidentialite',
        label: 'Confidentialité',
        icon: 'Shield',
        description: 'Données et confidentialité',
        color: '#3B82F6',
        features: [
          'Synchronisation des données',
          'Paramètres de confidentialité',
          'Export de données',
          'Suppression de compte'
        ]
      },
      {
        value: 'account',
        label: 'Forfaits',
        icon: 'CreditCard',
        description: 'Gérez vos forfaits, abonnement et tokens',
        color: '#10B981',
        features: [
          'Solde de tokens en temps réel',
          'Forfaits mensuels de 9€ à 99€',
          'Changement de forfait flexible',
          'Pack de tokens supplémentaires',
          'Historique des transactions',
          'Annulation à tout moment'
        ]
      }
    ]
  },

  notifications: {
    title: 'Notifications',
    subtitle: 'Centre de gestion de vos alertes et rappels',
    icon: 'Bell',
    color: '#EC4899',
    circuit: 'notifications',
    tabs: [
      {
        value: 'recentes',
        label: 'Récentes',
        icon: 'Bell',
        description: 'Consultez toutes vos notifications récentes et alertes en temps réel.',
        features: [
          'Notifications en temps réel',
          'Filtres intelligents',
          'Actions rapides',
          'Marquage lu/non-lu'
        ]
      },
      {
        value: 'parametres',
        label: 'Paramètres',
        icon: 'Settings',
        description: 'Configurez vos préférences de notifications et la fréquence des alertes.',
        features: [
          'Alertes personnalisées',
          'Historique des notifications',
          'Paramètres de fréquence',
          'Gestion des canaux'
        ]
      }
    ]
  },

  bodyScan: {
    title: 'Forge Corporelle',
    subtitle: 'Scanner corporel 3D et suivi morphologique',
    icon: 'Scan',
    color: '#D946EF',
    circuit: 'avatar',
    tabs: [
      {
        value: 'scanner',
        label: 'Scanner 3D',
        icon: 'Scan',
        description: 'Créez votre avatar 3D personnalisé avec notre scanner corporel intelligent.',
        features: [
          'Scan corporel 3D',
          'Génération d\'avatar',
          'Mesures automatiques',
          'Modèle haute fidélité'
        ]
      },
      {
        value: 'historique',
        label: 'Historique',
        icon: 'History',
        description: 'Consultez l\'historique de vos scans et suivez l\'évolution de votre morphologie.',
        features: [
          'Historique des scans',
          'Comparaisons temporelles',
          'Graphiques d\'évolution',
          'Export des données'
        ]
      },
      {
        value: 'comparaison',
        label: 'Comparaison',
        icon: 'GitCompare',
        description: 'Comparez vos scans dans le temps et visualisez vos transformations.',
        features: [
          'Vue comparative 3D',
          'Superposition de modèles',
          'Mesures différentielles',
          'Rapports visuels'
        ]
      }
    ]
  }
};
