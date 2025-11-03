import React from 'react';

/**
 * Calculate intelligent daily calorie target based on user profile and objective
 */
export function calculateIntelligentCalorieTarget(profile: any): {
  target: number;
  bmr: number;
  tdee: number;
  adjustedForObjective: number;
  objectiveType: 'maintenance' | 'deficit' | 'surplus';
} {
  // Default fallback values
  const fallback = {
    target: 2000,
    bmr: 1600,
    tdee: 2000,
    adjustedForObjective: 2000,
    objectiveType: 'maintenance' as const
  };

  if (!profile?.height_cm || !profile?.weight_kg || !profile?.sex) {
    return fallback;
  }

  // Calculate age from birthdate
  const age = profile.birthdate ? 
    new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : 25;

  // Calculate BMR using Harris-Benedict equation
  const bmr = profile.sex === 'male' 
    ? 88.362 + (13.397 * profile.weight_kg) + (4.799 * profile.height_cm) - (5.677 * age)
    : 447.593 + (9.247 * profile.weight_kg) + (3.098 * profile.height_cm) - (4.330 * age);

  // Calculate TDEE based on activity level
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'athlete': 1.9
  };
  
  const activityFactor = activityMultipliers[profile.activity_level as keyof typeof activityMultipliers] || 1.55;
  const tdee = bmr * activityFactor;

  // Adjust for objective
  let adjustedForObjective = tdee;
  let objectiveType: 'maintenance' | 'deficit' | 'surplus' = 'maintenance';

  if (profile.objective === 'fat_loss') {
    adjustedForObjective = tdee - 500; // 500 kcal deficit for fat loss
    objectiveType = 'deficit';
  } else if (profile.objective === 'muscle_gain') {
    adjustedForObjective = tdee + 300; // 300 kcal surplus for muscle gain
    objectiveType = 'surplus';
  } else if (profile.objective === 'recomp') {
    adjustedForObjective = tdee; // Maintenance for recomposition
    objectiveType = 'maintenance';
  }

  return {
    target: Math.round(adjustedForObjective),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    adjustedForObjective: Math.round(adjustedForObjective),
    objectiveType
  };
}

/**
 * Analyze calorie status with intelligent thresholds
 */
export function analyzeCalorieStatus(
  totalCalories: number, 
  target: number, 
  objectiveType: 'maintenance' | 'deficit' | 'surplus'
): {
  status: 'optimal' | 'slight_deficit' | 'deficit' | 'slight_surplus' | 'surplus' | 'excessive';
  message: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
} {
  const percentage = (totalCalories / target) * 100;
  
  // Define thresholds based on objective type
  const thresholds = {
    maintenance: { optimal: [90, 110], slight: [80, 115], excessive: [70, 130] },
    deficit: { optimal: [85, 105], slight: [75, 115], excessive: [65, 130] },
    surplus: { optimal: [95, 115], slight: [85, 125], excessive: [75, 140] }
  };
  
  const t = thresholds[objectiveType];
  
  if (percentage >= t.optimal[0] && percentage <= t.optimal[1]) {
    return {
      status: 'optimal',
      message: 'Apport calorique optimal pour vos objectifs',
      color: '#22C55E',
      priority: 'low',
      recommendation: 'Continuez sur cette lancée !'
    };
  } else if (percentage < t.optimal[0] && percentage >= t.slight[0]) {
    return {
      status: 'slight_deficit',
      message: `Apport légèrement en dessous de votre objectif (${Math.round(percentage)}%)`,
      color: '#F59E0B',
      priority: 'medium',
      recommendation: 'Ajoutez une collation nutritive pour atteindre votre objectif.'
    };
  } else if (percentage < t.slight[0]) {
    return {
      status: 'deficit',
      message: `Apport insuffisant pour vos objectifs (${Math.round(percentage)}%)`,
      color: '#EF4444',
      priority: 'high',
      recommendation: 'Augmentez vos portions ou ajoutez un repas supplémentaire.'
    };
  } else if (percentage > t.optimal[1] && percentage <= t.slight[1]) {
    return {
      status: 'slight_surplus',
      message: `Apport légèrement au-dessus de votre objectif (${Math.round(percentage)}%)`,
      color: objectiveType === 'surplus' ? '#22C55E' : '#F59E0B',
      priority: objectiveType === 'surplus' ? 'low' : 'medium',
      recommendation: objectiveType === 'surplus' ? 
        'Parfait pour votre objectif de prise de muscle !' :
        'Réduisez légèrement les portions ou privilégiez des aliments moins caloriques.'
    };
  } else if (percentage > t.slight[1]) {
    return {
      status: 'surplus',
      message: `Apport excessif par rapport à votre objectif (${Math.round(percentage)}%)`,
      color: '#EF4444',
      priority: 'high',
      recommendation: objectiveType === 'deficit' ?
        'Cet excès peut compromettre votre perte de graisse. Réduisez les portions demain.' :
        'Apport très élevé. Surveillez vos portions pour éviter un gain de graisse.'
    };
  }
  
  return {
    status: 'excessive',
    message: `Apport très excessif (${Math.round(percentage)}%)`,
    color: '#DC2626',
    priority: 'high',
    recommendation: 'Consultez un professionnel de santé si cela devient récurrent.'
  };
}