/**
 * Training Coach Messages Configuration
 * Templates de messages variés pour chaque événement de la Step 3
 */

import type { TrainingNotificationId, TrainingNotificationContext } from '../domain/trainingCoachNotification';

interface MessageTemplate {
  templates: string[];
  getRandomMessage: (context?: TrainingNotificationContext) => string;
}

const interpolate = (template: string, context?: TrainingNotificationContext): string => {
  if (!context) return template;

  return template
    .replace('{exerciseName}', context.exerciseName || '')
    .replace('{exerciseVariant}', context.exerciseVariant || '')
    .replace('{currentSet}', context.currentSet?.toString() || '')
    .replace('{totalSets}', context.totalSets?.toString() || '')
    .replace('{load}', context.load?.toString() || '')
    .replace('{oldLoad}', context.oldLoad?.toString() || '')
    .replace('{newLoad}', context.newLoad?.toString() || '')
    .replace('{loadAdjustment}', context.loadAdjustment?.toString() || '')
    .replace('{loadIncrement}', context.loadIncrement?.toString() || '')
    .replace('{restTime}', context.restTime?.toString() || '')
    .replace('{nextExerciseName}', context.nextExerciseName || '')
    .replace('{nextExerciseVariant}', context.nextExerciseVariant || '')
    .replace('{substitutionName}', context.substitutionName || '');
};

const createMessageTemplate = (templates: string[]): MessageTemplate => ({
  templates,
  getRandomMessage: (context?: TrainingNotificationContext) => {
    const randomIndex = Math.floor(Math.random() * templates.length);
    const template = templates[randomIndex];
    return interpolate(template, context);
  }
});

export const TRAINING_COACH_MESSAGES: Record<TrainingNotificationId, MessageTemplate> = {
  'step2-generation-start': createMessageTemplate([
    'Je commence à créer ton plan personnalisé ! 🎯',
    'Préparation de ta séance sur mesure ! 💪',
    'Je m\'attelle à ton programme ! ⚡'
  ]),

  'step3-warmup-start': createMessageTemplate([
    'Commence par l\'échauffement articulaire ! 🔥',
    'Préparons tes articulations en douceur ! 💪',
    'Mobilité d\'abord, ensuite on attaque ! ⚡'
  ]),

  'step3-warmup-tip': createMessageTemplate([
    'Mouvements lents et contrôlés ! 🎯',
    'Amplitude complète sans forcer ! ✓',
    'Réveille tes articulations en douceur ! 💫'
  ]),

  'step3-warmup-complete': createMessageTemplate([
    'Échauffement terminé ! Tu es prêt ! 🔥',
    'Articulations chaudes, c\'est parti ! 💪',
    'Parfait ! Passons aux choses sérieuses ! ⚡'
  ]),

  'step3-warmup-skipped': createMessageTemplate([
    'Échauffement passé, fais attention ! ⚠️',
    'Sans échauffement, sois prudent ! 👀',
    'OK, mais écoute ton corps ! 💭'
  ]),

  'step2-generation-analyzing': createMessageTemplate([
    'J\'analyse ton profil et tes capacités... 🧠',
    'Étude de ton niveau et de tes objectifs... 📊'
  ]),

  'step2-generation-selecting': createMessageTemplate([
    'Sélection des exercices adaptés à ton équipement... 🏋️',
    'Je choisis les meilleurs mouvements pour toi... 🎯'
  ]),

  'step2-generation-calculating': createMessageTemplate([
    'Calcul des charges progressives optimales... ⚖️',
    'Ajustement des séries et répétitions... 📊'
  ]),

  'step2-generation-complete': createMessageTemplate([
    'Ton plan est prêt ! Check-le ! 🎉',
    'Programme généré avec succès ! 💪'
  ]),

  'step2-welcome-intro': createMessageTemplate([
    'Voici ta séance personnalisée ! 💪',
    'Ton plan d\'entraînement est prêt ! 🔥'
  ]),

  'step2-welcome-help': createMessageTemplate([
    'Utilise les +/- pour ajuster facilement ! 🎚️',
    'Tu peux tout modifier avec les boutons +/- ! 👆'
  ]),

  'step2-sets-increased': createMessageTemplate([
    '{exerciseName} : {sets} séries ! Tu en veux plus ! 💪',
    'Une série de plus pour {exerciseName} ! 🔥'
  ]),

  'step2-sets-decreased': createMessageTemplate([
    '{exerciseName} : {sets} séries, qualité optimale ! ✓',
    'Réduction à {sets} séries pour {exerciseName} ! 👍'
  ]),

  'step2-reps-increased': createMessageTemplate([
    '{exerciseName} : {reps} reps par série ! Plus d\'intensité ! 🔥',
    'Montée à {reps} reps sur {exerciseName} ! 💪'
  ]),

  'step2-reps-decreased': createMessageTemplate([
    '{exerciseName} : {reps} reps, focus sur la qualité ! ✓',
    'Ajustement à {reps} reps pour {exerciseName} ! 👍'
  ]),

  'step2-load-increased': createMessageTemplate([
    '{exerciseName} : Charge à {newLoad}kg ! Tu progresses ! 💪',
    'Montée à {newLoad}kg sur {exerciseName} ! 🔥'
  ]),

  'step2-load-decreased': createMessageTemplate([
    '{exerciseName} : {newLoad}kg pour une technique parfaite ! ✓',
    'Ajustement à {newLoad}kg sur {exerciseName} ! 👍'
  ]),

  'step2-alternative-selected': createMessageTemplate([
    'Alternative choisie : {substitutionName} ! 🔄',
    'Changement validé : {substitutionName} ! ✓'
  ]),

  'step2-exercise-regenerating': createMessageTemplate([
    'Je cherche un nouvel exercice pour toi... 🔍',
    'Génération d\'une nouvelle option... ⚡'
  ]),

  'step2-exercise-regenerated': createMessageTemplate([
    'Voici {newExerciseName} ! Tu vas kiffer ! 🔥',
    'Nouvel exercice trouvé : {newExerciseName} ! 💪'
  ]),

  'step2-exercise-error': createMessageTemplate([
    'Oups, petit souci. Réessaie ! 🔄',
    'Erreur de génération. Retry ! ⚠️'
  ]),

  'step3-arrival': createMessageTemplate([
    'Prêt à donner le meilleur de toi ? 💪',
    'C\'est parti pour une séance intense !',
    'On va tout déchirer ensemble ! 🔥',
    'Let\'s go, je suis là pour te guider !',
    'Concentré et déterminé, c\'est le moment !'
  ]),

  'step3-countdown-10s': createMessageTemplate([
    'Prépare-toi, ça commence dans 10 secondes !',
    '10 secondes pour te concentrer, tu vas assurer !',
    'Dernières respirations, on démarre bientôt !',
    'Visualise ton mouvement, 10 secondes...'
  ]),

  'step3-countdown-5s': createMessageTemplate([
    '5 secondes, prépare tes muscles !',
    'C\'est imminent, reste focus !',
    'Respire profondément, 5... 4... 3...',
    'Position de départ, on y va !'
  ]),

  'step3-countdown-3s': createMessageTemplate([
    '3... 2... 1...',
    'C\'est maintenant !',
    'Go go go !',
    'À toi de jouer !'
  ]),

  'step3-countdown-go': createMessageTemplate([
    'GO ! 🔥',
    'C\'est parti !',
    'Vas-y !',
    'Maintenant !'
  ]),

  'step3-new-exercise': createMessageTemplate([
    'Nouvel exercice : {exerciseName} ! Tu vas cartonner ! 💪',
    '{exerciseName} - Montre ce que tu sais faire !',
    'C\'est parti pour {exerciseName}, tu gères ! 🔥',
    'Concentré sur {exerciseName}, je suis avec toi !',
    '{exerciseName} - Technique parfaite, allez !'
  ]),

  'step3-set-complete': createMessageTemplate([
    'Excellente série ! Continue comme ça ! 🎯',
    'Bien joué, tu es au top ! 💪',
    'Parfait ! Respire et prépare la suite !',
    'Super série, tu gères de ouf ! 🔥',
    'Top ! Garde cette intensité !'
  ]),

  'step3-load-adjust-up': createMessageTemplate([
    'Charge augmentée à {load}kg - Tu relèves le défi ! 💪',
    '+{load}kg ! Tu es prêt pour plus ! 🔥',
    'On monte à {load}kg, tu vas gérer !',
    'Challenge accepté : {load}kg ! Let\'s go !'
  ]),

  'step3-load-adjust-down': createMessageTemplate([
    'Charge ajustée à {load}kg - Écoute ton corps ! 👍',
    '{load}kg c\'est parfait, qualité > quantité !',
    'Adaptation à {load}kg, c\'est intelligent !',
    'Bien vu l\'ajustement à {load}kg !'
  ]),

  'step3-rest-tip-1': createMessageTemplate([
    'Prochaine série : {newLoad}kg. Tu vas gérer ! 💪',
    'Charge qui monte à {newLoad}kg - C\'est la progression ! 📈',
    '{newLoad}kg arrive, tu es prêt pour le challenge !',
    'Série suivante : {newLoad}kg. Focus et technique ! 🎯',
    'Progression : {newLoad}kg pour la prochaine ! 🔥'
  ]),

  'step3-rest-tip-2': createMessageTemplate([
    'Respire profondément, oxygène tes muscles ! 🫁',
    'Profite du repos, hydrate-toi si besoin 💧',
    'Relâche les tensions, tu es au top !',
    'La charge monte de {loadIncrement}kg - tu suis le plan ! 💯',
    'Progression +{loadIncrement}kg : la clé du progrès ! 📈'
  ]),

  'step3-rest-tip-3': createMessageTemplate([
    'Prochaine série arrive - Concentration max ! ⚡',
    'Dernières secondes : mental d\'acier ! 🧠',
    '{newLoad}kg qui t\'attend - tempo contrôlé ! 🎯',
    'Presque prêt ? Tu vas tout déchirer à {newLoad}kg ! 🔥',
    'C\'est reparti bientôt avec {newLoad}kg, reste focus !'
  ]),

  'step3-transition-ready': createMessageTemplate([
    'Prêt ! 💪',
    'Focus !',
    'Go ! 🔥',
    'C\'est maintenant !',
    'Allez !'
  ]),

  'step3-rpe-feedback-easy': createMessageTemplate([
    'RPE faible ? On peut augmenter la prochaine fois ! 💪',
    'Trop facile ? Tu progresses, c\'est le moment d\'augmenter !',
    'Si c\'était facile, on va corser ça la prochaine ! 🔥',
    'Belle marge, on va pouvoir pousser plus fort !'
  ]),

  'step3-rpe-feedback-moderate': createMessageTemplate([
    'RPE parfait ! Zone de progression optimale ! 🎯',
    'Intensité idéale pour progresser ! Continue comme ça !',
    'Zone Goldilocks, c\'est exactement ce qu\'il faut ! 💪',
    'Parfait équilibre intensité/récupération ! Top !'
  ]),

  'step3-rpe-feedback-hard': createMessageTemplate([
    'RPE élevé mais tu as tenu ! Bravo champion ! 💪',
    'Intensité max, respect ! Récup importante ! 🙏',
    'Wow, tu t\'es surpassé ! Écoute ton corps ! 🔥',
    'Performance solide ! Veille à bien récupérer ! 👍'
  ]),

  'step3-exercise-complete': createMessageTemplate([
    'Exercice terminé ! Tu déchires tout ! 🔥',
    'Excellent travail sur celui-là ! 💪',
    'Parfait ! Prochain exercice, même énergie !',
    'Tu gères de ouf ! Continue comme ça ! 🎯',
    'Top performance ! On enchaîne ! 💥'
  ]),

  'step3-session-paused': createMessageTemplate([
    'Pause activée. Prends le temps qu\'il te faut ! 🙏',
    'En pause. Respire, hydrate-toi ! 💧',
    'Pause. Écoute ton corps, c\'est important !',
    'Session en pause. Repos bien mérité ! 😌',
    'Pause prise. Reviens quand tu es prêt ! 👍'
  ]),

  'step3-session-resumed': createMessageTemplate([
    'Reparti ! On continue ! 💪',
    'Session reprise ! Let\'s go ! 🔥',
    'C\'est reparti ! Tu vas cartonner !',
    'On reprend ! Reste focus ! 🎯',
    'Reprise ! Allez, on y va ! ⚡'
  ]),

  'step3-rest-paused': createMessageTemplate([
    'Repos en pause. Prends ton temps ! 😊',
    'Pause sur le repos. Pas de stress !',
    'Timer en pause. Récupère bien ! 💆',
    'Temps de repos suspendu. Tranquille ! 🧘'
  ]),

  'step3-rest-resumed': createMessageTemplate([
    'Timer de repos relancé ! ⏱️',
    'Repos repris ! Profite bien ! 💤',
    'Compteur de repos réactivé !',
    'Timer reparti, finis ta récup ! ✨'
  ]),

  'step4-arrival-welcome': createMessageTemplate([
    'Bravo ! Séance terminée avec succès ! 💪',
    'Excellent travail ! Analysons ça ensemble ! 🎯'
  ]),

  'step4-analysis-ready': createMessageTemplate([
    'Analyse de ta performance en cours... 📊',
    'Je regarde ce que tu as accompli... 🔍'
  ]),

  'step4-insights-highlight': createMessageTemplate([
    'Découvre tes insights de progression ! 📈',
    'Voici ce que je retiens de ta séance ! ✨'
  ])
};

export const getCoachMessage = (
  id: TrainingNotificationId,
  context?: TrainingNotificationContext
): string => {
  const messageTemplate = TRAINING_COACH_MESSAGES[id];
  return messageTemplate.getRandomMessage(context);
};
