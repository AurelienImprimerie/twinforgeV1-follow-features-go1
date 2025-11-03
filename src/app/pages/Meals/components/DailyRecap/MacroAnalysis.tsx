import React from 'react';

/**
 * Analyze macronutrients against targets and recommendations
 */
export function analyzeMacronutrients(
  macros: { proteins: number; carbs: number; fats: number; fiber: number },
  profile: any
): {
  protein: { status: 'low' | 'optimal' | 'high'; target: number; current: number };
  fiber: { status: 'low' | 'optimal' | 'high'; target: number; current: number };
  recommendations: string[];
} {
  const proteinTarget = profile?.nutrition?.proteinTarget_g || 
    (profile?.weight_kg ? profile.weight_kg * (profile.objective === 'muscle_gain' ? 2.2 : 1.6) : 120);
  
  const proteinStatus = macros.proteins < proteinTarget * 0.8 ? 'low' :
                       macros.proteins > proteinTarget * 1.3 ? 'high' : 'optimal';
  
  // Fiber analysis (recommended 25-35g per day)
  const fiberTarget = 25;
  const fiberStatus = macros.fiber < 20 ? 'low' :
                     macros.fiber > 40 ? 'high' : 'optimal';
  
  const recommendations: string[] = [];
  
  if (proteinStatus === 'low') {
    recommendations.push(`Augmentez vos apports en protéines (+${Math.round(proteinTarget - macros.proteins)}g)`);
  }
  
  if (proteinStatus === 'high') {
    recommendations.push('Apports en protéines élevés, vérifiez l\'équilibre avec les autres macros');
  }
  
  if (fiberStatus === 'low') {
    recommendations.push('Ajoutez plus de légumes et céréales complètes pour les fibres');
  }
  
  return {
    protein: { status: proteinStatus, target: proteinTarget, current: macros.proteins },
    fiber: { status: fiberStatus, target: fiberTarget, current: macros.fiber },
    recommendations
  };
}