// src/app/pages/BodyScan/BodyScanCapture/services/scanInsightsGenerator.ts
/**
 * Scan Insights Generator
 * Generates meaningful insights from scan results
 */

import logger from '../../../../../lib/utils/logger';

interface Insight {
  id: string;
  type: 'achievement' | 'observation' | 'recommendation';
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
  color: string;
}

interface InsightsResult {
  items: Insight[];
  source: string;
  confidence: number;
}

/**
 * Generate insights from scan results
 */
export function generateInsights(
  estimateResult: any,
  semanticResult: any,
  matchResult: any
): InsightsResult {
  const insights: Insight[] = [];
  const confidence = estimateResult?.extracted_data?.processing_confidence || 0;

  // Add confidence insight
  if (confidence > 0.8) {
    insights.push({
      id: 'high-confidence',
      type: 'achievement',
      title: 'Analyse de Haute Qualité',
      description: `Votre scan a été analysé avec ${Math.round(confidence * 100)}% de confiance.`,
      category: 'morphology',
      priority: 'high',
      confidence: confidence,
      source: 'ai_analysis',
      color: '#22C55E'
    });
  } else if (confidence > 0.6) {
    insights.push({
      id: 'medium-confidence',
      type: 'observation',
      title: 'Analyse Standard',
      description: `Votre scan a été analysé avec ${Math.round(confidence * 100)}% de confiance.`,
      category: 'morphology',
      priority: 'medium',
      confidence: confidence,
      source: 'ai_analysis',
      color: '#F59E0B'
    });
  }

  // Add archetype insight
  if (matchResult?.selected_archetypes?.length > 0) {
    const primaryArchetype = matchResult.selected_archetypes[0];
    insights.push({
      id: 'archetype-match',
      type: 'observation',
      title: 'Profil Morphologique',
      description: `Votre morphologie correspond au profil "${primaryArchetype.name}".`,
      category: 'morphology',
      priority: 'medium',
      confidence: 0.8,
      source: 'archetype',
      color: '#8B5CF6'
    });
  }

  // Add semantic insights
  if (semanticResult?.semantic_profile) {
    const semantic = semanticResult.semantic_profile;
    insights.push({
      id: 'semantic-classification',
      type: 'observation',
      title: 'Classification Morphologique',
      description: `Profil: ${semantic.obesity} • ${semantic.muscularity} • ${semantic.morphotype}`,
      category: 'morphology',
      priority: 'medium',
      confidence: semanticResult.semantic_confidence || 0.6,
      source: 'semantic',
      color: '#06B6D4'
    });
  }

  // Add AI refinement insight
  if (matchResult?.ai_refinement?.ai_refine) {
    insights.push({
      id: 'ai-refinement',
      type: 'achievement',
      title: 'Affinement IA',
      description: `Votre avatar a été affiné par IA avec ${Math.round((matchResult.ai_refinement.ai_confidence || 0.85) * 100)}% de confiance.`,
      category: 'morphology',
      priority: 'high',
      confidence: matchResult.ai_refinement.ai_confidence || 0.85,
      source: 'ai_refinement',
      color: '#10B981'
    });
  }

  // Add BMI insight
  const bmi = estimateResult?.extracted_data?.estimated_bmi;
  if (bmi) {
    let bmiCategory = '';
    let bmiColor = '';
    let bmiType: 'achievement' | 'observation' | 'recommendation' = 'observation';

    if (bmi < 18.5) {
      bmiCategory = 'Insuffisance pondérale';
      bmiColor = '#3B82F6';
      bmiType = 'recommendation';
    } else if (bmi < 25) {
      bmiCategory = 'Poids normal';
      bmiColor = '#22C55E';
      bmiType = 'achievement';
    } else if (bmi < 30) {
      bmiCategory = 'Surpoids';
      bmiColor = '#F59E0B';
      bmiType = 'observation';
    } else {
      bmiCategory = 'Obésité';
      bmiColor = '#EF4444';
      bmiType = 'recommendation';
    }

    insights.push({
      id: 'bmi-analysis',
      type: bmiType,
      title: 'Indice de Masse Corporelle',
      description: `IMC: ${bmi.toFixed(1)} - ${bmiCategory}`,
      category: 'health',
      priority: 'medium',
      confidence: 0.9,
      source: 'anthropometry',
      color: bmiColor
    });
  }

  logger.info('INSIGHTS_GENERATOR', 'Generated insights', {
    totalInsights: insights.length,
    categories: [...new Set(insights.map(i => i.category))],
    priorities: [...new Set(insights.map(i => i.priority))]
  });

  return {
    items: insights,
    source: 'generated',
    confidence: confidence || 0.8
  };
}

/**
 * Generate personalized recommendations based on scan results
 */
export function generateRecommendations(
  estimateResult: any,
  semanticResult: any
): Insight[] {
  const recommendations: Insight[] = [];

  const bmi = estimateResult?.extracted_data?.estimated_bmi;
  const muscularity = semanticResult?.semantic_profile?.muscularity;

  // BMI-based recommendations
  if (bmi && bmi > 25) {
    recommendations.push({
      id: 'weight-management',
      type: 'recommendation',
      title: 'Gestion du Poids',
      description: 'Envisagez un programme de nutrition et d\'exercice adapté.',
      category: 'health',
      priority: 'high',
      confidence: 0.85,
      source: 'health_analysis',
      color: '#F59E0B'
    });
  }

  // Muscularity-based recommendations
  if (muscularity === 'faible' || muscularity === 'très faible') {
    recommendations.push({
      id: 'muscle-building',
      type: 'recommendation',
      title: 'Renforcement Musculaire',
      description: 'Un programme de musculation pourrait améliorer votre composition corporelle.',
      category: 'fitness',
      priority: 'medium',
      confidence: 0.75,
      source: 'morphology_analysis',
      color: '#8B5CF6'
    });
  }

  return recommendations;
}

/**
 * Calculate insight priority score
 */
export function calculateInsightPriority(
  confidence: number,
  category: string,
  type: string
): 'high' | 'medium' | 'low' {
  if (confidence > 0.85 && (type === 'achievement' || category === 'health')) {
    return 'high';
  }

  if (confidence > 0.7) {
    return 'medium';
  }

  return 'low';
}
