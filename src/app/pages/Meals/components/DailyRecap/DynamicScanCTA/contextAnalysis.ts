/**
 * Context Analysis - Analyse du contexte nutritionnel
 * Logique d'analyse contextuelle pour le CTA dynamique
 */

import { format, differenceInMinutes, differenceInHours } from 'date-fns';

export interface NutritionalContext {
  mealTiming: MealTimingContext;
  nutritionalStatus: NutritionalStatus;
  urgencyLevel: UrgencyLevel;
  timeSinceLastMeal: number; // en minutes
  nextMealSuggestion: string;
  contextualMetrics: ContextualMetrics;
}

export interface MealTimingContext {
  currentHour: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  expectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timeSinceLastMeal: number; // en minutes
  isWithinMealWindow: boolean;
  nextMealWindow: string;
}

export interface NutritionalStatus {
  hasScannedToday: boolean;
  mealsCount: number;
  calorieStatus: 'deficit' | 'optimal' | 'surplus';
  proteinStatus: 'low' | 'optimal' | 'high';
  isOnTrack: boolean;
  completionPercentage: number;
}

export enum UrgencyLevel {
  LOW = 'low',      // Objectifs atteints, mode encouragement
  NORMAL = 'normal', // Progression normale
  HIGH = 'high'     // Heure de repas + pas de scan récent
}

export interface ContextualMetrics {
  showTimeSinceLastMeal: boolean;
  showCaloriesRemaining: boolean;
  showProteinDeficit: boolean;
  showNextMealWindow: boolean;
  caloriesRemaining?: number;
  proteinDeficit?: number;
}

/**
 * Analyser le contexte temporel des repas
 */
function getMealTimingContext(
  currentHour: number, 
  lastMealTime: Date | null,
  chronotype?: 'morning' | 'evening' | 'intermediate'
): MealTimingContext {
  // Déterminer le moment de la journée
  const timeOfDay = currentHour < 10 ? 'morning' :
                   currentHour < 14 ? 'afternoon' :
                   currentHour < 20 ? 'evening' : 'night';
  
  // Adapter les fenêtres de repas selon le chronotype
  const mealWindows = chronotype === 'morning' ? {
    breakfast: [6, 9],
    lunch: [11, 13],
    dinner: [17, 19]
  } : chronotype === 'evening' ? {
    breakfast: [8, 11],
    lunch: [12, 15],
    dinner: [19, 22]
  } : {
    breakfast: [7, 10],
    lunch: [12, 14],
    dinner: [18, 21]
  };
  
  // Déterminer le type de repas attendu
  let expectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'dinner';
  let isWithinMealWindow = false;
  
  if (currentHour >= mealWindows.breakfast[0] && currentHour <= mealWindows.breakfast[1]) {
    expectedMealType = 'breakfast';
    isWithinMealWindow = true;
  } else if (currentHour >= mealWindows.lunch[0] && currentHour <= mealWindows.lunch[1]) {
    expectedMealType = 'lunch';
    isWithinMealWindow = true;
  } else if (currentHour >= mealWindows.dinner[0] && currentHour <= mealWindows.dinner[1]) {
    expectedMealType = 'dinner';
    isWithinMealWindow = true;
  } else {
    expectedMealType = 'snack';
  }
  
  // Calculer le temps depuis le dernier repas
  const timeSinceLastMeal = lastMealTime ? 
    differenceInMinutes(new Date(), lastMealTime) : 
    999; // Valeur élevée si aucun repas
  
  // Déterminer la prochaine fenêtre de repas
  let nextMealWindow = '';
  if (currentHour < mealWindows.breakfast[0]) {
    nextMealWindow = `Petit-déjeuner dans ${mealWindows.breakfast[0] - currentHour}h`;
  } else if (currentHour < mealWindows.lunch[0]) {
    nextMealWindow = `Déjeuner dans ${mealWindows.lunch[0] - currentHour}h`;
  } else if (currentHour < mealWindows.dinner[0]) {
    nextMealWindow = `Dîner dans ${mealWindows.dinner[0] - currentHour}h`;
  } else {
    nextMealWindow = 'Prochaine journée nutritionnelle';
  }
  
  return {
    currentHour,
    timeOfDay,
    expectedMealType,
    timeSinceLastMeal,
    isWithinMealWindow,
    nextMealWindow
  };
}

/**
 * Analyser le statut nutritionnel
 */
function getNutritionalStatus(
  todayStats: any,
  calorieStatus: any,
  calorieTarget: number,
  proteinTarget: number
): NutritionalStatus {
  const hasScannedToday = todayStats.mealsCount > 0;
  const mealsCount = todayStats.mealsCount;
  
  // Statut calorique simplifié
  const calorieStatusSimple = calorieStatus.status === 'optimal' ? 'optimal' :
                             calorieStatus.status.includes('deficit') ? 'deficit' : 'surplus';
  
  // Statut protéique
  const proteinStatus = todayStats.macros.proteins < proteinTarget * 0.8 ? 'low' :
                       todayStats.macros.proteins > proteinTarget * 1.3 ? 'high' : 'optimal';
  
  // Évaluer si l'utilisateur est sur la bonne voie
  const isOnTrack = calorieStatusSimple === 'optimal' && proteinStatus !== 'low' && mealsCount >= 2;
  
  // Pourcentage de complétion de la journée nutritionnelle
  const completionPercentage = Math.min(100, 
    (mealsCount / 3) * 40 + // 40% pour la fréquence des repas
    (Math.min(todayStats.totalCalories / calorieTarget, 1)) * 40 + // 40% pour les calories
    (proteinStatus === 'optimal' ? 20 : proteinStatus === 'low' ? 0 : 10) // 20% pour les protéines
  );
  
  return {
    hasScannedToday,
    mealsCount,
    calorieStatus: calorieStatusSimple,
    proteinStatus,
    isOnTrack,
    completionPercentage: Math.round(completionPercentage)
  };
}

/**
 * Calculer le niveau d'urgence
 */
function calculateUrgencyLevel(
  mealTiming: MealTimingContext,
  nutritionalStatus: NutritionalStatus
): UrgencyLevel {
  // Urgence élevée : heure de repas + pas de scan récent
  if (mealTiming.isWithinMealWindow && mealTiming.timeSinceLastMeal > 240) { // 4h
    return UrgencyLevel.HIGH;
  }
  
  // Urgence élevée : déficit calorique important en fin de journée
  if (mealTiming.currentHour > 18 && nutritionalStatus.calorieStatus === 'deficit' && nutritionalStatus.mealsCount < 2) {
    return UrgencyLevel.HIGH;
  }
  
  // Urgence faible : objectifs atteints
  if (nutritionalStatus.isOnTrack && nutritionalStatus.completionPercentage > 80) {
    return UrgencyLevel.LOW;
  }
  
  // Urgence normale par défaut
  return UrgencyLevel.NORMAL;
}

/**
 * Déterminer les métriques contextuelles à afficher
 */
function getContextualMetrics(
  mealTiming: MealTimingContext,
  nutritionalStatus: NutritionalStatus,
  calorieTarget: number,
  proteinTarget: number,
  todayStats: any
): ContextualMetrics {
  const showTimeSinceLastMeal = mealTiming.timeSinceLastMeal > 180 && mealTiming.timeSinceLastMeal < 999;
  const showCaloriesRemaining = nutritionalStatus.calorieStatus === 'deficit' && 
                               (calorieTarget - todayStats.totalCalories) > 200;
  const showProteinDeficit = nutritionalStatus.proteinStatus === 'low' && 
                            (proteinTarget - todayStats.macros.proteins) > 10;
  const showNextMealWindow = !nutritionalStatus.hasScannedToday || mealTiming.timeSinceLastMeal > 300;
  
  return {
    showTimeSinceLastMeal,
    showCaloriesRemaining,
    showProteinDeficit,
    showNextMealWindow,
    caloriesRemaining: showCaloriesRemaining ? calorieTarget - todayStats.totalCalories : undefined,
    proteinDeficit: showProteinDeficit ? Math.round(proteinTarget - todayStats.macros.proteins) : undefined
  };
}

/**
 * Fonction principale d'analyse du contexte nutritionnel
 */
export function analyzeNutritionalContext(
  todayStats: any,
  profile: any,
  calorieStatus: any,
  calorieTargetAnalysis: any
): NutritionalContext {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Calculer les cibles
  const calorieTarget = calorieTargetAnalysis.target;
  const proteinTarget = profile?.nutrition?.proteinTarget_g || 
    (profile?.weight_kg ? profile.weight_kg * (profile.objective === 'muscle_gain' ? 2.2 : 1.6) : 120);
  
  // Analyser les différents contextes
  const mealTiming = getMealTimingContext(currentHour, todayStats.lastMealTime, profile?.emotions?.chronotype);
  const nutritionalStatus = getNutritionalStatus(todayStats, calorieStatus, calorieTarget, proteinTarget);
  const urgencyLevel = calculateUrgencyLevel(mealTiming, nutritionalStatus);
  const contextualMetrics = getContextualMetrics(mealTiming, nutritionalStatus, calorieTarget, proteinTarget, todayStats);
  
  // Suggestion du prochain repas
  const nextMealSuggestion = mealTiming.expectedMealType === 'breakfast' ? 'Commencez votre journée' :
                            mealTiming.expectedMealType === 'lunch' ? 'Scannez votre déjeuner' :
                            mealTiming.expectedMealType === 'dinner' ? 'Analysez votre dîner' :
                            'Capturez votre collation';
  
  return {
    mealTiming,
    nutritionalStatus,
    urgencyLevel,
    timeSinceLastMeal: mealTiming.timeSinceLastMeal,
    nextMealSuggestion,
    contextualMetrics
  };
}