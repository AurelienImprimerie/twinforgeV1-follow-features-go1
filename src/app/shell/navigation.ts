/**
 * Navigation System - TwinForge
 * Architecture hiérarchisée en 3 niveaux:
 * 1. Navigation Principale (Tableau de Bord)
 * 2. Navigation Twin (Mon Twin)
 * 3. Forges par Catégories (Alimentation, Activité, Santé)
 */

import { ICONS } from '../../ui/icons/registry';

interface NavSubItem {
  to: string;
  icon: keyof typeof ICONS;
  label: string;
  isPrimarySubMenu?: boolean; // Le sous-menu principal mis en avant
  color?: string; // Couleur personnalisée pour ce sous-item
}

interface NavItem {
  to: string;
  icon: keyof typeof ICONS;
  label: string;
  subtitle: string;
  actionLabel?: string; // Label de l'action principale (Scanner, Tracker, etc.)
  isPrimary?: boolean;
  isTwin?: boolean;
  isForge?: boolean;
  circuitColor?: string;
  tabs?: string[]; // Onglets disponibles pour cette page
  subItems?: NavSubItem[]; // Sous-menus pour les forges
}

interface NavSection {
  title: string;
  type?: 'primary' | 'twin' | 'forge-category'; // Type de section pour styling différencié
  items: NavItem[];
}

/**
 * Structure de navigation hiérarchisée pour TwinForge
 */
export function navFor(): NavSection[] {
  const sections: NavSection[] = [
    // ========================================
    // NIVEAU 1: Navigation Principale
    // ========================================
    {
      title: '',
      type: 'primary',
      items: [
        {
          to: '/',
          icon: 'Home',
          label: 'Coeur de la Forge',
          subtitle: 'Tableau de Bord',
          isPrimary: true,
          circuitColor: '#FDC830', // Jaune/Orange - Coeur de la Forge
          actionLabel: undefined // No action badge for dashboard
        },
      ],
    },

    // ========================================
    // NIVEAU 2: Navigation Twin
    // ========================================
    {
      title: '',
      type: 'twin',
      items: [
        {
          to: '/avatar',
          icon: 'User',
          label: 'Mon Twin',
          subtitle: 'Avatar 3D',
          isTwin: true,
          circuitColor: '#A855F7', // Violet/Pourpre
          tabs: ['Scanner', 'Avatar', 'Projection', 'Insights', 'Historique']
        },
      ],
    },

    // ========================================
    // NIVEAU 3: Forges par Catégories
    // ========================================

    // CATÉGORIE: Alimentation
    {
      title: 'Alimentation',
      type: 'forge-category',
      items: [
        {
          to: '/meals',
          icon: 'Utensils',
          label: 'Forge Nutritionnelle',
          subtitle: 'Scanner de Repas',
          isForge: true,
          circuitColor: '#10B981', // Vert
          tabs: ['Scanner', 'Insights', 'Progression', 'Historique'],
          subItems: [
            {
              to: '/meals#daily',
              icon: 'ScanLine',
              label: 'Scanner de Repas & Code',
              isPrimarySubMenu: true
            },
            {
              to: '/meals#insights',
              icon: 'TrendingUp',
              label: 'Insights'
            },
            {
              to: '/meals#progression',
              icon: 'BarChart3',
              label: 'Progression'
            },
            {
              to: '/meals#history',
              icon: 'History',
              label: 'Historique'
            }
          ]
        },
        {
          to: '/fridge',
          icon: 'ChefHat',
          label: 'Forge Culinaire',
          subtitle: 'Scanner de Frigo',
          isForge: true,
          circuitColor: '#EC4899', // Rose
          tabs: ['Scanner', 'Inventaire', 'Recettes', 'Plan', 'Courses'],
          subItems: [
            {
              to: '/fridge#scanner',
              icon: 'ScanLine',
              label: 'Scanner de Frigo',
              isPrimarySubMenu: true
            },
            {
              to: '/fridge#inventaire',
              icon: 'Refrigerator',
              label: 'Inventaire'
            },
            {
              to: '/fridge#recipes',
              icon: 'ChefHat',
              label: 'Recettes'
            },
            {
              to: '/fridge#plan',
              icon: 'Calendar',
              label: 'Plan'
            },
            {
              to: '/fridge#courses',
              icon: 'ShoppingCart',
              label: 'Courses'
            }
          ]
        },
      ],
    },

    // CATÉGORIE: Activité
    {
      title: 'Activité',
      type: 'forge-category',
      items: [
        {
          to: '/activity',
          icon: 'Activity',
          label: 'Forge Énergétique',
          subtitle: 'Tracker d\'Activités',
          isForge: true,
          circuitColor: '#3B82F6', // Bleu
          tabs: ['Tracker', 'Insights', 'Progression', 'Historique'],
          subItems: [
            {
              to: '/activity#daily',
              icon: 'Activity',
              label: 'Tracker d\'Activités',
              isPrimarySubMenu: true
            },
            {
              to: '/activity#insights',
              icon: 'BarChart3',
              label: 'Insights',
              color: '#10B981' // Vert
            },
            {
              to: '/activity#progression',
              icon: 'TrendingUp',
              label: 'Progression',
              color: '#10B981' // Vert
            },
            {
              to: '/activity#history',
              icon: 'History',
              label: 'Historique'
            }
          ]
        },
        {
          to: '/training',
          icon: 'Dumbbell',
          label: 'Forge Corporelle',
          subtitle: 'Coaching live',
          isForge: true,
          circuitColor: '#18E3FF', // Cyan électrique
          tabs: ['Coaching', 'Conseils', 'Progression', 'Records', 'Historique'],
          subItems: [
            {
              to: '/training#aujourd hui',
              icon: 'Home',
              label: 'Coaching Live',
              isPrimarySubMenu: true
            },
            {
              to: '/training#conseils',
              icon: 'Lightbulb',
              label: 'Conseils'
            },
            {
              to: '/training#progression',
              icon: 'TrendingUp',
              label: 'Progression'
            },
            {
              to: '/training#records',
              icon: 'Trophy',
              label: 'Records'
            },
            {
              to: '/training#historique',
              icon: 'History',
              label: 'Historique'
            }
          ]
        },
      ],
    },

    // CATÉGORIE: Santé
    {
      title: 'Santé',
      type: 'forge-category',
      items: [
        {
          to: '/fasting',
          icon: 'Timer',
          label: 'Forge du Temps',
          subtitle: 'Jeûne Intermittent',
          isForge: true,
          circuitColor: '#F59E0B', // Orange
          tabs: ['Tracker', 'Insights', 'Progression', 'Historique'],
          subItems: [
            {
              to: '/fasting#daily',
              icon: 'Timer',
              label: 'Tracker de Jeûne',
              isPrimarySubMenu: true
            },
            {
              to: '/fasting#insights',
              icon: 'TrendingUp',
              label: 'Insights',
              color: '#10B981' // Vert (harmonisé avec l'onglet)
            },
            {
              to: '/fasting#progression',
              icon: 'BarChart3',
              label: 'Progression'
            },
            {
              to: '/fasting#history',
              icon: 'History',
              label: 'Historique'
            }
          ]
        },
        {
          to: '/vital',
          icon: 'HeartPulse',
          label: 'Forge Vitale',
          subtitle: 'Médecine Préventive',
          isForge: true,
          circuitColor: '#EF4444', // Rouge santé
          tabs: ['Dossier', 'Analyses', 'Suivi', 'Prévention'],
          subItems: [
            {
              to: '/vital#dossier',
              icon: 'FileText',
              label: 'Dossier',
              isPrimarySubMenu: true
            },
            {
              to: '/vital#analyses',
              icon: 'Activity',
              label: 'Analyses'
            },
            {
              to: '/vital#suivi',
              icon: 'TrendingUp',
              label: 'Suivi'
            },
            {
              to: '/vital#prevention',
              icon: 'Shield',
              label: 'Prévention'
            }
          ]
        },
      ],
    },
  ];

  return sections;
}
