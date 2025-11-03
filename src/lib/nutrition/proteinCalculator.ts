/**
 * Protein Calculator - Calcul automatique des besoins en protéines
 * Calcule la cible de protéines basée sur le profil utilisateur
 */

export interface ProteinCalculationResult {
  recommended: number;
  min: number;
  max: number;
  reasoning: string;
  formula: string;
}

/**
 * Calculer la cible de protéines recommandée
 */
export function calculateProteinTarget(profile: any): ProteinCalculationResult {
  // Valeurs par défaut si pas assez d'informations
  const fallback = {
    recommended: 120,
    min: 100,
    max: 150,
    reasoning: 'Estimation basée sur un adulte moyen',
    formula: 'Valeur par défaut'
  };

  if (!profile?.weight_kg || profile.weight_kg <= 0) {
    return fallback;
  }

  const weight = profile.weight_kg;
  let multiplier = 1.6; // Base pour sédentaire
  let reasoning = '';
  
  // Ajuster selon l'objectif
  if (profile.objective === 'muscle_gain') {
    multiplier = 2.2;
    reasoning = 'Prise de muscle - besoins élevés pour la synthèse protéique';
  } else if (profile.objective === 'fat_loss') {
    multiplier = 2.0;
    reasoning = 'Perte de graisse - protéines élevées pour préserver la masse musculaire';
  } else if (profile.objective === 'recomp') {
    multiplier = 1.8;
    reasoning = 'Recomposition - équilibre entre maintien et développement musculaire';
  } else {
    multiplier = 1.6;
    reasoning = 'Maintenance - besoins standards pour un adulte actif';
  }

  // Ajuster selon le niveau d'activité
  if (profile.activity_level === 'athlete') {
    multiplier += 0.2;
    reasoning += ' + bonus athlète';
  } else if (profile.activity_level === 'active') {
    multiplier += 0.1;
    reasoning += ' + bonus actif';
  } else if (profile.activity_level === 'sedentary') {
    multiplier -= 0.1;
    reasoning += ' - ajustement sédentaire';
  }

  const recommended = Math.round(weight * multiplier);
  const min = Math.round(weight * (multiplier - 0.2));
  const max = Math.round(weight * (multiplier + 0.3));

  return {
    recommended,
    min,
    max,
    reasoning,
    formula: `${weight}kg × ${multiplier.toFixed(1)}g/kg = ${recommended}g`
  };
}

/**
 * Vérifier si le profil a assez d'informations pour calculer les protéines
 */
export function canCalculateProteinTarget(profile: any): boolean {
  return !!(profile?.weight_kg && profile.weight_kg > 0);
}