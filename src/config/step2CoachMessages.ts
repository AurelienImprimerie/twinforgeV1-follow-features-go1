/**
 * Step 2 Coach Messages Configuration
 * Messages pour la phase d'activation et d'ajustement du training
 */

import type { TrainingNotificationContext } from '../domain/trainingCoachNotification';

type Step2NotificationId =
  | 'step2-generation-start'
  | 'step2-generation-analyzing'
  | 'step2-generation-selecting'
  | 'step2-generation-calculating'
  | 'step2-generation-complete'
  | 'step2-welcome-intro'
  | 'step2-welcome-help'
  | 'step2-sets-increased'
  | 'step2-sets-decreased'
  | 'step2-reps-increased'
  | 'step2-reps-decreased'
  | 'step2-load-increased'
  | 'step2-load-decreased'
  | 'step2-alternative-selected'
  | 'step2-exercise-regenerating'
  | 'step2-exercise-regenerated'
  | 'step2-exercise-error'
  | 'step2-draft-saved'
  | 'step2-regeneration-started'
  | 'step2-regeneration-complete'
  | 'step2-endurance-intensity-increased'
  | 'step2-endurance-intensity-decreased'
  | 'step2-endurance-adjustment-limit';

interface MessageTemplate {
  templates: string[];
  getRandomMessage: (context?: TrainingNotificationContext) => string;
}

const interpolate = (template: string, context?: TrainingNotificationContext): string => {
  if (!context) return template;

  return template
    .replace('{exerciseName}', context.exerciseName || '')
    .replace('{sets}', context.sets?.toString() || '')
    .replace('{reps}', context.reps?.toString() || '')
    .replace('{oldLoad}', context.oldLoad?.toString() || '')
    .replace('{newLoad}', context.newLoad?.toString() || '')
    .replace('{loadAdjustment}', context.loadAdjustment?.toString() || '')
    .replace('{substitutionName}', context.substitutionName || '')
    .replace('{newExerciseName}', context.newExerciseName || '')
    .replace('{customName}', context.customName || 'Training');
};

const createMessageTemplate = (templates: string[]): MessageTemplate => ({
  templates,
  getRandomMessage: (context?: TrainingNotificationContext) => {
    const randomIndex = Math.floor(Math.random() * templates.length);
    const template = templates[randomIndex];
    return interpolate(template, context);
  }
});

export const STEP2_COACH_MESSAGES: Record<Step2NotificationId, MessageTemplate> = {
  'step2-generation-start': createMessageTemplate([
    'Je commence à créer ton plan personnalisé ! 🎯',
    'Préparation de ta séance sur mesure ! 💪',
    'Je m\'attelle à ton programme ! ⚡',
    'C\'est parti pour la conception de ta séance ! 🔥'
  ]),

  'step2-generation-analyzing': createMessageTemplate([
    'J\'analyse ton profil : niveau, objectifs, historique... 🧠',
    'Étude approfondie de tes capacités actuelles... 📊',
    'Je passe en revue tes dernières performances... 🔍',
    'Analyse de ton énergie et de ta récupération... 📈',
    'J\'examine tes préférences et tes contraintes... 💡',
    'Évaluation de ta progression globale... 🎯'
  ]),

  'step2-generation-selecting': createMessageTemplate([
    'Sélection des exercices parfaits pour ton équipement... 🏋️',
    'Je compose ton programme avec les meilleurs mouvements... 🎯',
    'Optimisation selon ton lieu et ton matériel... 📍',
    'Choix stratégique des exercices pour ta progression... ✨',
    'Je bâtis un programme équilibré et efficace... 💪',
    'Assemblage des mouvements complémentaires... 🔄'
  ]),

  'step2-generation-calculating': createMessageTemplate([
    'Calcul précis des charges pour ta progression... ⚖️',
    'Ajustement intelligent des séries et répétitions... 📊',
    'Je dose l\'intensité selon ton niveau d\'énergie... 💯',
    'Personnalisation des paramètres pour ton objectif... 🎚️',
    'Calibrage des charges pour stimuler ta croissance... 📈',
    'Équilibrage volume/intensité pour résultats optimaux... ⚡'
  ]),

  'step2-generation-complete': createMessageTemplate([
    'Ton plan sur-mesure est prêt ! Check-le ! 🎉',
    'Programme hyper personnalisé généré ! 💪',
    'Voilà ta séance calibrée pour progresser ! 🔥',
    'Plan optimisé créé ! Tu vas cartonner ! ✨',
    'Séance prête ! Chaque détail compte pour ton succès ! 🎯',
    'Programme finalisé ! Adapté à 100% pour toi ! 💯'
  ]),

  'step2-welcome-intro': createMessageTemplate([
    'Voici ta séance personnalisée ! 💪',
    'Ton plan d\'entraînement est prêt ! 🔥',
    'J\'ai créé une séance parfaite pour toi ! 🎯',
    'Check ton programme, il est top ! 💯'
  ]),

  'step2-welcome-help': createMessageTemplate([
    'Utilise les +/- pour ajuster facilement ! 🎚️',
    'Tu peux tout modifier avec les boutons +/- ! 👆',
    'Ajuste chaque exercice comme tu veux ! ⚙️',
    'Les contrôles +/- sont là pour personnaliser ! 🎛️'
  ]),

  'step2-sets-increased': createMessageTemplate([
    '{exerciseName} : {sets} séries ! Tu en veux plus ! 💪',
    'Une série de plus pour {exerciseName} ! 🔥',
    '{exerciseName} passe à {sets} séries ! ⚡',
    'Volume augmenté : {sets} séries sur {exerciseName} ! 📈'
  ]),

  'step2-sets-decreased': createMessageTemplate([
    '{exerciseName} : {sets} séries, qualité optimale ! ✓',
    'Réduction à {sets} séries pour {exerciseName} ! 👍',
    '{exerciseName} ajusté à {sets} séries ! 🎯',
    'Volume adapté : {sets} séries sur {exerciseName} ! 💡'
  ]),

  'step2-reps-increased': createMessageTemplate([
    '{exerciseName} : {reps} reps par série ! Plus d\'intensité ! 🔥',
    'Montée à {reps} reps sur {exerciseName} ! 💪',
    '{exerciseName} : {reps} reps pour plus de volume ! 📈',
    'Challenge relevé : {reps} reps sur {exerciseName} ! ⚡'
  ]),

  'step2-reps-decreased': createMessageTemplate([
    '{exerciseName} : {reps} reps, focus sur la qualité ! ✓',
    'Ajustement à {reps} reps pour {exerciseName} ! 👍',
    '{exerciseName} : {reps} reps pour optimiser ! 🎯',
    'Réduction intelligente : {reps} reps sur {exerciseName} ! 💡'
  ]),

  'step2-load-increased': createMessageTemplate([
    '{exerciseName} : Charge à {newLoad}kg ! Tu progresses ! 💪',
    'Montée à {newLoad}kg sur {exerciseName} ! 🔥',
    '{exerciseName} : +{loadAdjustment}kg ! ({newLoad}kg) ⚡',
    'Challenge accepté : {newLoad}kg sur {exerciseName} ! 📈'
  ]),

  'step2-load-decreased': createMessageTemplate([
    '{exerciseName} : {newLoad}kg pour une technique parfaite ! ✓',
    'Ajustement à {newLoad}kg sur {exerciseName} ! 👍',
    '{exerciseName} : {newLoad}kg, qualité avant tout ! 🎯',
    'Adaptation intelligente : {newLoad}kg sur {exerciseName} ! 💡'
  ]),

  'step2-alternative-selected': createMessageTemplate([
    'Alternative choisie : {substitutionName} ! 🔄',
    'Changement validé : {substitutionName} ! ✓',
    'Nouvel exercice : {substitutionName} ! 💪',
    '{substitutionName} à la place, parfait ! 🎯'
  ]),

  'step2-exercise-regenerating': createMessageTemplate([
    'Je cherche un nouvel exercice pour toi... 🔍',
    'Génération d\'une nouvelle option... ⚡',
    'Je trouve quelque chose de différent... 🎯',
    'Recherche d\'un exercice alternatif... 🔄'
  ]),

  'step2-exercise-regenerated': createMessageTemplate([
    'Voici {newExerciseName} ! Tu vas kiffer ! 🔥',
    'Nouvel exercice trouvé : {newExerciseName} ! 💪',
    '{newExerciseName} devrait te plaire ! ✨',
    'J\'ai trouvé : {newExerciseName} ! Let\'s go ! ⚡'
  ]),

  'step2-exercise-error': createMessageTemplate([
    'Oups, petit souci. Réessaie ! 🔄',
    'Erreur de génération. Retry ! ⚠️',
    'Problème technique. On réessaie ? 🔧',
    'Connexion perdue. Retente ! 📡'
  ]),

  'step2-draft-saved': createMessageTemplate([
    'Training sauvegardé ! Reviens quand tu veux ! 💾',
    'C\'est dans la poche ! Tu le retrouveras ici ! ✅',
    'Sauvegarde OK ! Prends ton temps ! ⏰',
    'Bien reçu ! Le training t\'attend ! 🎯'
  ]),

  'step2-regeneration-started': createMessageTemplate([
    'Je te prépare quelque chose de différent ! 🔄',
    'Nouvelle génération en cours... Patience ! ⚡',
    'Je change tout ça ! Une seconde ! 🎨',
    'Allez, on repart sur autre chose ! 🚀'
  ]),

  'step2-regeneration-complete': createMessageTemplate([
    'Voilà un nouveau plan ! Regarde ça ! 🎉',
    'Training V2 prêt ! Check ça ! 💪',
    'Nouvelle séance générée ! Let\'s go ! 🔥',
    'Fresh training ready ! Vas-y ! ✨'
  ]),

  'step2-endurance-intensity-increased': createMessageTemplate([
    'Intensité augmentée ! Prêt pour le challenge ? 💪',
    'On monte d\'un cran ! Tu vas cartonner ! 🔥',
    'Plus difficile maintenant ! Let\'s go ! ⚡',
    'Challenge level up ! Tu gères ! 🚀'
  ]),

  'step2-endurance-intensity-decreased': createMessageTemplate([
    'Intensité réduite ! Plus accessible maintenant ! 👍',
    'On ajuste à ton niveau ! Parfait ! ✅',
    'Plus doux maintenant ! Tu vas bien gérer ! 😊',
    'Séance adaptée ! C\'est bon pour toi ! 🎯'
  ]),

  'step2-endurance-adjustment-limit': createMessageTemplate([
    'On est à la limite ! Ça devrait être nickel ! ✨',
    'Maximum atteint ! Cette intensité est parfaite ! 🎯',
    'Limite de réglage ! Ça colle maintenant ! 👌',
    'On peut pas aller plus loin ! Prêt comme ça ! 💪'
  ])
};

export const getStep2CoachMessage = (
  id: Step2NotificationId,
  context?: TrainingNotificationContext
): string => {
  const messageTemplate = STEP2_COACH_MESSAGES[id];
  return messageTemplate.getRandomMessage(context);
};

export type { Step2NotificationId };
