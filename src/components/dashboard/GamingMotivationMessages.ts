/**
 * GamingMotivationMessages - Service de génération de messages motivationnels
 * Utilisé pour afficher des encouragements contextuels dans les empty states et CTAs
 */

export interface MotivationMessage {
  title: string;
  subtitle: string;
  encouragement?: string;
}

/**
 * Messages pour les scans de frigo (30 pts)
 */
export const FRIDGE_SCAN_MESSAGES: MotivationMessage[] = [
  {
    title: 'Analysez Votre Frigo',
    subtitle: 'Scannez votre réfrigérateur pour découvrir toutes les recettes possibles',
    encouragement: 'Première analyse = 30 points !'
  },
  {
    title: 'Optimisez Votre Inventaire',
    subtitle: 'Une photo suffit pour transformer vos ingrédients en délicieux repas',
    encouragement: 'Gagnez 30 pts dès maintenant'
  },
  {
    title: 'Zéro Gaspillage',
    subtitle: 'Découvrez comment utiliser tous vos ingrédients efficacement',
    encouragement: 'Scanner = 30 points offerts'
  }
];

/**
 * Messages pour la génération de recettes (20 pts)
 */
export const RECIPE_GENERATION_MESSAGES: MotivationMessage[] = [
  {
    title: 'Créez Une Nouvelle Recette',
    subtitle: 'L\'IA génère des recettes uniques basées sur vos ingrédients',
    encouragement: '20 points par recette créée'
  },
  {
    title: 'Inspiration Culinaire',
    subtitle: 'Transformez votre inventaire en créations gastronomiques',
    encouragement: 'Générez et gagnez 20 pts'
  },
  {
    title: 'Chef Virtuel Activé',
    subtitle: 'Des recettes personnalisées adaptées à vos goûts et restrictions',
    encouragement: 'Chaque recette vaut 20 points'
  }
];

/**
 * Messages pour la génération de plans alimentaires (35 pts)
 */
export const MEAL_PLAN_MESSAGES: MotivationMessage[] = [
  {
    title: 'Planifiez Votre Semaine',
    subtitle: 'Un plan alimentaire complet généré en quelques secondes',
    encouragement: '35 points pour votre organisation !'
  },
  {
    title: 'Organisation Nutritionnelle',
    subtitle: 'Gagnez du temps avec une planification hebdomadaire intelligente',
    encouragement: 'Planifier = 35 pts garantis'
  },
  {
    title: 'Simplicité Maximale',
    subtitle: 'Une semaine de repas équilibrés basée sur votre frigo',
    encouragement: '35 points de récompense'
  }
];

/**
 * Messages pour la génération de listes de courses (15 pts)
 */
export const SHOPPING_LIST_MESSAGES: MotivationMessage[] = [
  {
    title: 'Générez Votre Liste',
    subtitle: 'Une liste de courses optimisée basée sur vos plans repas',
    encouragement: 'Liste créée = 15 points'
  },
  {
    title: 'Courses Facilitées',
    subtitle: 'Ne manquez plus jamais un ingrédient essentiel',
    encouragement: 'Gagnez 15 pts en générant'
  },
  {
    title: 'Shopping Intelligent',
    subtitle: 'Achetez exactement ce dont vous avez besoin, rien de plus',
    encouragement: '15 points offerts'
  }
];

/**
 * Messages pour les scans de repas (25 pts)
 */
export const MEAL_SCAN_MESSAGES: MotivationMessage[] = [
  {
    title: 'Analysez Votre Repas',
    subtitle: 'Photographiez votre assiette pour une analyse nutritionnelle complète',
    encouragement: '25 points par scan !'
  },
  {
    title: 'Suivi Nutritionnel',
    subtitle: 'Chaque repas scanné vous rapproche de vos objectifs',
    encouragement: 'Scanner = 25 pts automatiques'
  },
  {
    title: 'Tracking Facile',
    subtitle: 'Une photo suffit pour tout calculer: calories, macros, micros',
    encouragement: 'Première photo vaut 25 points'
  }
];

/**
 * Messages pour les scans de code-barres (15 pts)
 */
export const BARCODE_SCAN_MESSAGES: MotivationMessage[] = [
  {
    title: 'Scannez Un Produit',
    subtitle: 'Analysez instantanément les valeurs nutritionnelles',
    encouragement: '15 points par scan'
  },
  {
    title: 'Info Nutritionnelle',
    subtitle: 'Découvrez tout sur vos produits en un scan',
    encouragement: 'Chaque scan = 15 pts'
  }
];

/**
 * Messages génériques d'encouragement par streak
 */
export function getStreakEncouragement(streakDays: number): string {
  if (streakDays === 0) {
    return 'Commencez votre série dès aujourd\'hui !';
  }

  if (streakDays < 7) {
    return `Continuez ! Série de ${streakDays} jour${streakDays > 1 ? 's' : ''}`;
  }

  if (streakDays < 30) {
    return `Excellent ! ${streakDays} jours consécutifs 🔥`;
  }

  return `Incroyable ! ${streakDays} jours de suite 🏆`;
}

/**
 * Messages d'encouragement par niveau
 */
export function getLevelEncouragement(currentLevel: number, xpToNext: number): string {
  if (xpToNext <= 50) {
    return `Plus que ${xpToNext} pts pour le niveau ${currentLevel + 1} !`;
  }

  if (currentLevel < 5) {
    return 'Continuez pour débloquer de nouvelles fonctionnalités !';
  }

  if (currentLevel < 10) {
    return `Niveau ${currentLevel}: vous progressez rapidement !`;
  }

  return `Niveau ${currentLevel}: vous êtes un champion !`;
}

/**
 * Obtenir un message aléatoire d'une catégorie
 */
export function getRandomMessage(messages: MotivationMessage[]): MotivationMessage {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Obtenir un message selon le type d'action
 */
export function getMessageForAction(
  actionType:
    | 'fridge_scan'
    | 'recipe_generated'
    | 'meal_plan_generated'
    | 'shopping_list_generated'
    | 'meal_scan'
    | 'barcode_scan'
): MotivationMessage {
  switch (actionType) {
    case 'fridge_scan':
      return getRandomMessage(FRIDGE_SCAN_MESSAGES);
    case 'recipe_generated':
      return getRandomMessage(RECIPE_GENERATION_MESSAGES);
    case 'meal_plan_generated':
      return getRandomMessage(MEAL_PLAN_MESSAGES);
    case 'shopping_list_generated':
      return getRandomMessage(SHOPPING_LIST_MESSAGES);
    case 'meal_scan':
      return getRandomMessage(MEAL_SCAN_MESSAGES);
    case 'barcode_scan':
      return getRandomMessage(BARCODE_SCAN_MESSAGES);
    default:
      return {
        title: 'Action Gaming',
        subtitle: 'Gagnez des points en utilisant l\'application',
        encouragement: 'Chaque action compte !'
      };
  }
}
