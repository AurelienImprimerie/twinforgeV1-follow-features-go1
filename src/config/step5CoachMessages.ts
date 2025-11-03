/**
 * Step 5 Coach Messages
 * Motivational and contextual messages for Step 5 (Avancer)
 */

export type Step5NotificationId =
  | 'step5-arrival-welcome'
  | 'step5-recommendation-ready'
  | 'step5-recovery-optimal'
  | 'step5-action-accepted';

/**
 * Notification messages for Step 5
 */
const STEP5_NOTIFICATION_MESSAGES: Record<Step5NotificationId, string> = {
  'step5-arrival-welcome': 'Séance complétée ! Découvre ta prochaine étape 🎯',
  'step5-recommendation-ready': 'Ta recommandation personnalisée est prête',
  'step5-recovery-optimal': 'Ton corps est prêt pour la prochaine séance !',
  'step5-action-accepted': 'Parfait ! Ta prochaine séance est programmée 📅'
};

export const getStep5Message = (id: Step5NotificationId): string => {
  return STEP5_NOTIFICATION_MESSAGES[id] || 'Continue sur ta lancée !';
};

/**
 * Motivational message patterns based on performance
 */
export interface MotivationalPattern {
  type: string;
  messages: string[];
}

export const MOTIVATIONAL_PATTERNS: Record<string, MotivationalPattern> = {
  streak: {
    type: 'streak',
    messages: [
      'Impressionnant ! {count} séances consécutives complétées. Ta constance est remarquable ! 🔥',
      'Quelle régularité ! {count} séances d\'affilée. Continue comme ça, les résultats suivront ! 💪',
      '{count} séances sans interruption. Ta discipline est ton plus grand atout ! ⭐',
      'Série de {count} séances ! Ta persévérance va te mener loin. Bravo ! 🚀'
    ]
  },

  pr: {
    type: 'pr',
    messages: [
      'Nouveau record personnel ! Volume de {volume}kg. Tu te dépasses à chaque fois ! 🏆',
      'Record battu ! {volume}kg de volume total. Ton travail acharné paie ! 💎',
      'Performance exceptionnelle ! Nouveau PR à {volume}kg. Continue de repousser tes limites ! 🌟',
      '{volume}kg ! Nouveau record absolu. Ta progression est impressionnante ! 🔥'
    ]
  },

  consistency: {
    type: 'consistency',
    messages: [
      'Excellente régularité d\'effort. RPE moyen de {rpe}/10 maintenu. C\'est la clé du succès ! 📈',
      'Ta constance est remarquable. {rpe}/10 d\'intensité moyenne. Tu gères parfaitement ! ⚖️',
      'Effort bien calibré ! RPE moyen à {rpe}/10. Continue à écouter ton corps ! 🎯',
      'Intensité parfaite : {rpe}/10 en moyenne. Tu connais tes limites ! 💯'
    ]
  },

  technique: {
    type: 'technique',
    messages: [
      'Technique excellente ! {technique}/10 en moyenne. La qualité avant tout ! 🎯',
      'Exécution impeccable : {technique}/10. Ta technique est ta force ! 💪',
      'Maîtrise technique remarquable ! {technique}/10. Continue sur cette voie ! ⭐',
      '{technique}/10 de moyenne technique. L\'excellence dans chaque mouvement ! 🌟'
    ]
  },

  resilience: {
    type: 'resilience',
    messages: [
      'Bravo ! Malgré les difficultés (RPE {rpe}), tu as terminé la séance. Ton mental est solide ! 💪',
      'Séance intense (RPE {rpe}) mais terminée ! Ta détermination est impressionnante ! 🔥',
      'Tu as su gérer une séance difficile (RPE {rpe}). C\'est ça, l\'état d\'esprit de champion ! 🏆',
      'Malgré le challenge (RPE {rpe}), tu n\'as pas lâché. Respect ! 💎'
    ]
  },

  progression: {
    type: 'progression',
    messages: [
      'Progression de {percent}% sur les dernières semaines. Ton travail paie ! 📈',
      'Amélioration constante : +{percent}% ! Continue sur cette lancée ! 🚀',
      '{percent}% d\'augmentation récente. Ta courbe de progression est parfaite ! 📊',
      'Performance en hausse de {percent}% ! Les résultats sont là ! ⬆️'
    ]
  },

  completion: {
    type: 'completion',
    messages: [
      '100% de complétion ! Tu as terminé tous les exercices. Excellent travail ! ✅',
      'Séance complète ! Tous les exercices réalisés. Ta discipline est exemplaire ! 🎯',
      'Pas un exercice manqué ! C\'est de la détermination pure. Bravo ! 💯',
      'Complétion totale ! Tu ne laisses rien au hasard. Continue ! 🔥'
    ]
  },

  default: {
    type: 'default',
    messages: [
      'Séance terminée ! Tu es sur la bonne voie. Continue ce bon travail ! 💪',
      'Encore une séance de qualité dans ta poche. Bravo ! 🎯',
      'Performance solide aujourd\'hui. Continue à progresser ! 📈',
      'Bon travail ! Chaque séance te rapproche de tes objectifs ! ⭐',
      'Séance accomplie ! Ta régularité fera la différence ! 🚀'
    ]
  }
};

/**
 * Generate motivational message based on pattern and context
 */
export const generateMotivationalMessage = (
  pattern: string,
  context: Record<string, any>
): string => {
  const patternData = MOTIVATIONAL_PATTERNS[pattern] || MOTIVATIONAL_PATTERNS.default;
  const messages = patternData.messages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  // Replace placeholders
  let message = randomMessage;
  Object.keys(context).forEach(key => {
    message = message.replace(`{${key}}`, context[key].toString());
  });

  return message;
};

/**
 * Determine which motivational pattern to use based on session data
 */
export const determineMotivationalPattern = (sessionData: {
  overallRpe: number;
  exercisesCompleted: number;
  totalExercises: number;
  avgTechnique: number;
  consecutiveSessions: number;
  totalVolume: number;
  previousMaxVolume: number;
  recentAvgRpe: number;
  progressionPercent: number;
}): { pattern: string; context: Record<string, any> } => {
  const {
    overallRpe,
    exercisesCompleted,
    totalExercises,
    avgTechnique,
    consecutiveSessions,
    totalVolume,
    previousMaxVolume,
    recentAvgRpe,
    progressionPercent
  } = sessionData;

  // Priority 1: Streak (5+ consecutive sessions)
  if (consecutiveSessions >= 5) {
    return {
      pattern: 'streak',
      context: { count: consecutiveSessions }
    };
  }

  // Priority 2: Personal Record
  if (totalVolume > previousMaxVolume && previousMaxVolume > 0) {
    return {
      pattern: 'pr',
      context: { volume: Math.round(totalVolume) }
    };
  }

  // Priority 3: Excellent technique
  if (avgTechnique >= 8) {
    return {
      pattern: 'technique',
      context: { technique: avgTechnique.toFixed(1) }
    };
  }

  // Priority 4: Resilience (high RPE but completed)
  if (overallRpe >= 8.5 && exercisesCompleted === totalExercises) {
    return {
      pattern: 'resilience',
      context: { rpe: overallRpe.toFixed(1) }
    };
  }

  // Priority 5: Visible progression
  if (progressionPercent >= 5) {
    return {
      pattern: 'progression',
      context: { percent: Math.round(progressionPercent) }
    };
  }

  // Priority 6: Full completion
  if (exercisesCompleted === totalExercises) {
    return {
      pattern: 'completion',
      context: {}
    };
  }

  // Priority 7: Consistency
  if (recentAvgRpe >= 7 && recentAvgRpe <= 8) {
    return {
      pattern: 'consistency',
      context: { rpe: recentAvgRpe.toFixed(1) }
    };
  }

  // Default
  return {
    pattern: 'default',
    context: {}
  };
};
