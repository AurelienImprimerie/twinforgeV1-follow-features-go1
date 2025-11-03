/**
 * Step 4 Coach Messages Configuration
 * Templates de messages variés pour la phase d'analyse post-séance
 */

export type Step4NotificationId =
  | 'step4-arrival-welcome'
  | 'step4-analysis-ready'
  | 'step4-insights-highlight'
  | 'step4-analysis-started'
  | 'step4-analysis-progress'
  | 'step4-analysis-complete';

interface MessageTemplate {
  templates: string[];
  getRandomMessage: () => string;
}

const createMessageTemplate = (templates: string[]): MessageTemplate => ({
  templates,
  getRandomMessage: () => {
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
});

export const STEP4_COACH_MESSAGES: Record<Step4NotificationId, MessageTemplate> = {
  'step4-arrival-welcome': createMessageTemplate([
    'Excellent travail ! Analysons ta performance ensemble',
    'Wow, belle séance ! Voyons ce que tu as accompli',
    'Tu as tout donné ! Regardons tes résultats en détail',
    'Super boulot ! Place à l\'analyse personnalisée',
    'Félicitations ! Décortiquons ta performance'
  ]),

  'step4-analysis-ready': createMessageTemplate([
    'J\'ai calculé tous tes metrics de performance',
    'Tes données sont prêtes, c\'est impressionnant !',
    'J\'ai analysé chaque exercice en détail pour toi',
    'Toutes tes métriques sont là, c\'est du lourd !',
    'Analyse complète ! Tu vas voir, c\'est précis'
  ]),

  'step4-insights-highlight': createMessageTemplate([
    'J\'ai détecté des patterns intéressants dans ta séance',
    'Quelques insights personnalisés pour toi ci-dessous',
    'Regarde mes recommandations, elles sont sur-mesure',
    'J\'ai des conseils basés sur ta performance d\'aujourd\'hui',
    'Insights perso prêts ! Tu vas progresser encore plus vite'
  ]),

  'step4-analysis-started': createMessageTemplate([
    'Je lance l\'analyse de ta séance... Ça va être top !',
    'Analyse en cours... Je regarde tout en détail',
    'Analyse de ta séance en cours... Patience, ça arrive !',
    'Je traite tes données... Les insights arrivent bientôt',
    'Analyse lancée ! Je calcule tout pour toi'
  ]),

  'step4-analysis-progress': createMessageTemplate([
    'Analyse en cours... Je traite tes performances',
    'Presque prêt... Je peaufine les détails',
    'Ça avance bien ! Encore quelques secondes',
    'Je continue l\'analyse... C\'est prometteur !',
    'Bientôt terminé... Patience, ça vaut le coup'
  ]),

  'step4-analysis-complete': createMessageTemplate([
    'Analyse terminée ! Tes résultats sont prêts',
    'C\'est bon ! J\'ai tout analysé, regarde ci-dessous',
    'Analyse complète ! Tu vas adorer les insights',
    'Voilà ! Ton analyse personnalisée est prête',
    'Terminé ! Découvre tes performances en détail'
  ])
};

export const getStep4Message = (id: Step4NotificationId): string => {
  const messageTemplate = STEP4_COACH_MESSAGES[id];
  return messageTemplate.getRandomMessage();
};
