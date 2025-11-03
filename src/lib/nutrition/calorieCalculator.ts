/**
 * Calorie Calculator
 * Calculate daily caloric needs based on user profile data
 * Uses Mifflin-St Jeor equation (most accurate for modern populations)
 */

export interface CalorieCalculatorInput {
  sex?: 'male' | 'female';
  weight_kg?: number;
  height_cm?: number;
  birthdate?: string;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  objective?: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle';
}

/**
 * Activity level multipliers for Total Daily Energy Expenditure (TDEE)
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,           // Little to no exercise
  lightly_active: 1.375,    // Light exercise 1-3 days/week
  moderately_active: 1.55,  // Moderate exercise 3-5 days/week
  very_active: 1.725,       // Hard exercise 6-7 days/week
  extremely_active: 1.9     // Very hard exercise, physical job
};

/**
 * Objective adjustments (caloric surplus/deficit)
 */
const OBJECTIVE_ADJUSTMENTS = {
  lose_weight: -500,    // 500 kcal deficit for healthy weight loss
  maintain: 0,          // Maintenance calories
  gain_weight: 300,     // 300 kcal surplus for slow bulk
  gain_muscle: 500      // 500 kcal surplus for muscle gain
};

/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate: string): number | null {
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age > 0 && age < 120 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 */
function calculateBMR(
  sex: 'male' | 'female',
  weight_kg: number,
  height_cm: number,
  age: number
): number {
  const baseBMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);

  if (sex === 'male') {
    return baseBMR + 5;
  } else {
    return baseBMR - 161;
  }
}

/**
 * Calculate daily caloric needs based on user profile
 * Returns null if insufficient data
 */
export function calculateDailyCalories(input: CalorieCalculatorInput): number | null {
  const { sex, weight_kg, height_cm, birthdate, activity_level, objective } = input;

  // Validate required inputs
  if (!sex || !weight_kg || !height_cm || !birthdate) {
    return null;
  }

  if (weight_kg <= 0 || height_cm <= 0) {
    return null;
  }

  // Calculate age
  const age = calculateAge(birthdate);
  if (!age) {
    return null;
  }

  // Calculate BMR
  const bmr = calculateBMR(sex, weight_kg, height_cm, age);

  // Apply activity level multiplier for TDEE
  const activityMultiplier = activity_level
    ? ACTIVITY_MULTIPLIERS[activity_level]
    : ACTIVITY_MULTIPLIERS.moderately_active; // Default to moderate

  const tdee = bmr * activityMultiplier;

  // Apply objective adjustment
  const objectiveAdjustment = objective
    ? OBJECTIVE_ADJUSTMENTS[objective]
    : OBJECTIVE_ADJUSTMENTS.maintain; // Default to maintenance

  const finalCalories = tdee + objectiveAdjustment;

  // Round to nearest 50 for practical use
  return Math.round(finalCalories / 50) * 50;
}

/**
 * Get a human-readable explanation of the calculation
 */
export function getCalorieCalculationExplanation(
  input: CalorieCalculatorInput,
  calculatedCalories: number | null
): string {
  if (!calculatedCalories) {
    return 'Complétez votre profil pour calculer vos besoins caloriques';
  }

  const { sex, activity_level, objective } = input;

  const sexLabel = sex === 'male' ? 'homme' : 'femme';
  const activityLabel = activity_level
    ? {
        sedentary: 'sédentaire',
        lightly_active: 'légèrement actif',
        moderately_active: 'modérément actif',
        very_active: 'très actif',
        extremely_active: 'extrêmement actif'
      }[activity_level]
    : 'activité modérée';

  const objectiveLabel = objective
    ? {
        lose_weight: 'perte de poids',
        maintain: 'maintien',
        gain_weight: 'prise de poids',
        gain_muscle: 'prise de muscle'
      }[objective]
    : 'maintien';

  return `${calculatedCalories} kcal/jour (${sexLabel}, ${activityLabel}, objectif: ${objectiveLabel})`;
}

/**
 * Check if we have enough data to calculate calories
 */
export function canCalculateCalories(input: CalorieCalculatorInput): boolean {
  return !!(input.sex && input.weight_kg && input.height_cm && input.birthdate);
}
