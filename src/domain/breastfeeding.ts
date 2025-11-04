/**
 * Breastfeeding Domain Types
 *
 * Types and interfaces for breastfeeding tracking and management
 */

export type BreastfeedingType = 'exclusive' | 'mixed' | 'weaning';

export interface BreastfeedingTracking {
  id: string;
  user_id: string;
  is_breastfeeding: boolean;
  breastfeeding_type: BreastfeedingType | null;
  baby_age_months: number | null;
  start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreastfeedingFormData {
  is_breastfeeding: boolean;
  breastfeeding_type: BreastfeedingType | null;
  baby_age_months: string;
  start_date: string;
  notes: string;
}

export interface BreastfeedingContext {
  isBreastfeeding: boolean;
  breastfeedingType: BreastfeedingType | null;
  babyAgeMonths: number | null;
  durationMonths: number | null;
  nutritionalNeeds: {
    extraCalories: number;
    calciumMultiplier: number;
    ironNeed: 'high' | 'moderate' | 'low';
    hydrationImportance: 'critical' | 'high' | 'moderate';
  };
}

export interface BreastfeedingRecommendations {
  nutrition: string[];
  hydration: string[];
  exercise: string[];
  fasting: string[];
  foodsToFavor: string[];
  foodsToAvoid: string[];
  supplements: string[];
}

export interface BreastfeedingNutritionalGuide {
  // Nutritional needs based on breastfeeding type and baby age
  calorieIncrease: number; // kcal per day
  proteinIncrease: number; // g per day
  calciumNeed: number; // mg per day
  ironNeed: number; // mg per day
  omega3Need: number; // mg per day (DHA)
  waterIntake: number; // liters per day
  vitaminDNeed: number; // IU per day
  iodinNeed: number; // mcg per day

  // Food recommendations
  priorityFoods: string[];
  limitedFoods: string[];
  avoidFoods: string[];

  // Timing considerations
  mealFrequency: string;
  snackRecommendations: string[];
}

/**
 * Get nutritional guide based on breastfeeding type and baby age
 */
export function getBreastfeedingNutritionalGuide(
  breastfeedingType: BreastfeedingType | null,
  babyAgeMonths: number | null
): BreastfeedingNutritionalGuide {
  if (!breastfeedingType) {
    return getDefaultNutritionalGuide();
  }

  const baseCalorieIncrease = breastfeedingType === 'exclusive' ? 500 :
                              breastfeedingType === 'mixed' ? 350 : 250;

  // Adjust based on baby age (needs decrease as baby gets older and starts solids)
  const ageAdjustment = babyAgeMonths && babyAgeMonths > 6 ? 0.85 : 1.0;
  const adjustedCalories = Math.round(baseCalorieIncrease * ageAdjustment);

  return {
    calorieIncrease: adjustedCalories,
    proteinIncrease: breastfeedingType === 'exclusive' ? 25 : 15,
    calciumNeed: 1300,
    ironNeed: 9,
    omega3Need: 300,
    waterIntake: 3.0,
    vitaminDNeed: 600,
    iodinNeed: 290,

    priorityFoods: [
      'Poissons gras (saumon, sardines)',
      'Oeufs',
      'Légumes verts (épinards, brocoli)',
      'Produits laitiers (lait, yaourt, fromage)',
      'Noix et graines (amandes, graines de lin)',
      'Avoine',
      'Légumineuses (lentilles, pois chiches)',
      'Viandes maigres',
      'Fruits rouges',
      'Patates douces'
    ],

    limitedFoods: [
      'Caféine (max 300mg/jour - 2 cafés)',
      'Poissons à mercure élevé (thon, espadon)',
      'Aliments très épicés (peuvent altérer goût du lait)',
      'Chou, ail, oignon (coliques possibles chez bébé)',
      'Agrumes en excès (irritation possible)'
    ],

    avoidFoods: [
      'Alcool',
      'Compléments à base de plantes non vérifiés',
      'Aliments crus/non pasteurisés à risque',
      'Excès de sucres raffinés'
    ],

    mealFrequency: 'Privilégier 3 repas + 2-3 collations nutritives par jour',
    snackRecommendations: [
      'Yaourt grec avec fruits et noix',
      'Houmous avec légumes crus',
      'Smoothie protéiné',
      'Fromage avec crackers complets',
      'Barre énergétique maison (avoine, dattes, amandes)'
    ]
  };
}

function getDefaultNutritionalGuide(): BreastfeedingNutritionalGuide {
  return {
    calorieIncrease: 0,
    proteinIncrease: 0,
    calciumNeed: 1000,
    ironNeed: 18,
    omega3Need: 250,
    waterIntake: 2.0,
    vitaminDNeed: 600,
    iodinNeed: 150,
    priorityFoods: [],
    limitedFoods: [],
    avoidFoods: [],
    mealFrequency: 'Standard',
    snackRecommendations: []
  };
}

/**
 * Get breastfeeding type label in French
 */
export function getBreastfeedingTypeLabel(type: BreastfeedingType | null): string {
  if (!type) return '';

  const labels: Record<BreastfeedingType, string> = {
    exclusive: 'Allaitement exclusif',
    mixed: 'Allaitement mixte',
    weaning: 'Sevrage en cours'
  };

  return labels[type];
}

/**
 * Get baby age category for recommendations
 */
export function getBabyAgeCategory(ageMonths: number | null): string {
  if (ageMonths === null) return 'Non spécifié';

  if (ageMonths <= 1) return 'Nouveau-né (0-1 mois)';
  if (ageMonths <= 3) return 'Nourrisson jeune (1-3 mois)';
  if (ageMonths <= 6) return 'Nourrisson (3-6 mois)';
  if (ageMonths <= 12) return 'Bébé (6-12 mois)';
  if (ageMonths <= 24) return 'Jeune enfant (12-24 mois)';
  return 'Enfant (24+ mois)';
}

/**
 * Get emoji for breastfeeding status
 */
export function getBreastfeedingEmoji(isBreastfeeding: boolean): string {
  return isBreastfeeding ? '🤱' : '👶';
}
