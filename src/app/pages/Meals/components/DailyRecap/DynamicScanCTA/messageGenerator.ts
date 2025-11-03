/**
 * Message Generator - Génération des messages dynamiques
 * Génère les messages contextuels pour le CTA dynamique
 */

import { UrgencyLevel, type NutritionalContext } from './contextAnalysis';

export interface DynamicMessage {
  title: string;
  subtitle: string;
  buttonText: string;
  encouragement?: string;
  metrics?: string[];
}

/**
 * Générer le message principal selon le contexte
 */
export function generateDynamicMessage(context: NutritionalContext): DynamicMessage {
  const { mealTiming, nutritionalStatus, urgencyLevel, contextualMetrics } = context;
  
  // Messages pour première utilisation
  if (!nutritionalStatus.hasScannedToday) {
    return generateFirstTimeMessage(mealTiming.timeOfDay, mealTiming.expectedMealType);
  }
  // Messages pour utilisateur actif
  if (nutritionalStatus.mealsCount > 0 && nutritionalStatus.mealsCount < 3) {
    return generateActiveUserMessage(context);
  }
  
  // Messages pour objectifs atteints
  if (nutritionalStatus.isOnTrack && nutritionalStatus.completionPercentage > 80) {
    return generateCompletedMessage(context);
  }
  
  // Message par défaut
  return generateDefaultMessage(context);
}

/**
 * Messages pour première utilisation
 */
function generateFirstTimeMessage(
  timeOfDay: string, 
  expectedMealType: string
): DynamicMessage {
  const timeMessages = {
    morning: {
      title: 'Forgez Votre Matinée',
      subtitle: 'Commencez votre journée nutritionnelle avec une analyse avancée',
      buttonText: 'Scanner le Petit-déjeuner',
      encouragement: 'Le carburant parfait pour démarrer votre forge quotidienne'
    },
    afternoon: {
      title: 'Forge de Midi',
      subtitle: 'Analysez votre déjeuner pour optimiser votre énergie',
      buttonText: 'Scanner le Déjeuner',
      encouragement: 'Rechargez votre forge énergétique pour l\'après-midi'
    },
    evening: {
      title: 'Forge du Soir',
      subtitle: 'Scannez votre dîner pour une récupération optimale',
      buttonText: 'Scanner le Dîner',
      encouragement: 'Préparez votre corps pour une récupération nocturne'
    },
    night: {
      title: 'Forge Nocturne',
      subtitle: 'Capturez votre collation tardive',
      buttonText: 'Scanner la Collation',
      encouragement: 'Même les forges spatiales ont besoin de carburant nocturne'
    }
  };
  
  return timeMessages[timeOfDay as keyof typeof timeMessages] || timeMessages.evening;
}

/**
 * Messages pour utilisateur actif
 */
function generateActiveUserMessage(context: NutritionalContext): DynamicMessage {
  const { nutritionalStatus, mealTiming, contextualMetrics } = context;
  
  // Messages selon le statut calorique
  if (nutritionalStatus.calorieStatus === 'deficit') {
    return {
      title: 'Complétez Votre Énergie',
      subtitle: 'Votre forge a besoin de plus de carburant pour atteindre vos objectifs',
      buttonText: 'Ajouter un Repas',
      encouragement: `${contextualMetrics.caloriesRemaining || 0} kcal restantes pour votre cible`,
      metrics: contextualMetrics.showCaloriesRemaining ? 
        [`${contextualMetrics.caloriesRemaining} kcal manquantes`] : undefined
    };
  }
  
  if (nutritionalStatus.calorieStatus === 'surplus') {
    return {
      title: 'Équilibrez Votre Forge',
      subtitle: 'Privilégiez des aliments moins caloriques pour vos prochains repas',
      buttonText: 'Scanner un Repas Léger',
      encouragement: 'Maintenez l\'équilibre de votre forge énergétique'
    };
  }
  
  // Statut optimal
  return {
    title: 'Excellente Progression',
    subtitle: 'Maintenez votre rythme nutritionnel optimal',
    buttonText: 'Continuer la Forge',
    encouragement: `${nutritionalStatus.completionPercentage}% de votre journée nutritionnelle accomplie`,
    metrics: [`${nutritionalStatus.mealsCount}/3 repas`, `${nutritionalStatus.completionPercentage}% complété`]
  };
}

/**
 * Messages pour objectifs atteints
 */
function generateCompletedMessage(context: NutritionalContext): DynamicMessage {
  const { nutritionalStatus, mealTiming } = context;
  
  return {
    title: 'Forge Accomplie ! 🏆',
    subtitle: 'Journée nutritionnelle réussie - Collation optionnelle ?',
    buttonText: 'Scanner une Collation',
    encouragement: 'Votre forge spatiale fonctionne à plein régime',
    metrics: [`${nutritionalStatus.completionPercentage}% accompli`, 'Objectifs atteints']
  };
}

/**
 * Message par défaut
 */
function generateDefaultMessage(context: NutritionalContext): DynamicMessage {
  return {
    title: 'Forgez Votre Nutrition',
    subtitle: 'Scannez votre repas pour une analyse personnalisée',
    buttonText: 'Scanner un Repas',
    encouragement: 'Optimisez votre carburant énergétique avec TwinForge'
  };
}

/**
 * Générer les métriques contextuelles à afficher
 */
export function generateContextualMetrics(context: NutritionalContext): string[] {
  const { contextualMetrics, mealTiming, nutritionalStatus } = context;
  const metrics: string[] = [];
  
  if (contextualMetrics.showTimeSinceLastMeal && mealTiming.timeSinceLastMeal < 999) {
    const hours = Math.floor(mealTiming.timeSinceLastMeal / 60);
    const minutes = mealTiming.timeSinceLastMeal % 60;
    
    if (hours > 0) {
      metrics.push(`${hours}h${minutes > 0 ? `${minutes}m` : ''} depuis le dernier repas`);
    } else {
      metrics.push(`${minutes}m depuis le dernier repas`);
    }
  }
  
  if (contextualMetrics.showCaloriesRemaining) {
    metrics.push(`${contextualMetrics.caloriesRemaining} kcal restantes`);
  }
  
  if (contextualMetrics.showProteinDeficit) {
    metrics.push(`+${contextualMetrics.proteinDeficit}g protéines nécessaires`);
  }
  
  if (contextualMetrics.showNextMealWindow && !nutritionalStatus.hasScannedToday) {
    metrics.push(mealTiming.nextMealWindow);
  }
  
  return metrics.slice(0, 2); // Maximum 2 métriques pour rester synthétique
}