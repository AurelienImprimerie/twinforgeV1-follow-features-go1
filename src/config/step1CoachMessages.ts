/**
 * Step 1 Coach Messages Configuration
 * Templates de messages variés pour la phase de préparation
 */

export type Step1NotificationId =
  | 'step1-time-selection'
  | 'step1-time-short'
  | 'step1-time-long'
  | 'step1-energy-high'
  | 'step1-energy-moderate'
  | 'step1-energy-low'
  | 'step1-location-selected'
  | 'step1-location-photo-mode'
  | 'step1-location-manual-mode'
  | 'step1-fatigue-checked'
  | 'step1-pain-checked'
  | 'step1-short-version-enabled'
  | 'step1-ready-to-continue';

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

export const STEP1_COACH_MESSAGES: Record<Step1NotificationId, MessageTemplate> = {
  'step1-time-selection': createMessageTemplate([
    'Parfait ! Je vais adapter la séance à ton temps disponible 👍',
    'Ok, je note combien de temps tu as ! On va optimiser ça 💪',
    'Super, je prends en compte ta disponibilité !',
    'Bien reçu ! Je vais créer une séance qui colle à ton timing ⏱️',
    'Noté ! On va faire un max avec le temps que tu as 🎯'
  ]),

  'step1-time-short': createMessageTemplate([
    'Session rapide ? Challenge accepté ! On va être efficace 💪',
    'Pas de temps à perdre, on va faire un truc intense ! 🔥',
    'Court mais intense, c\'est parti pour du concentré ! ⚡',
    'Session express ! Je vais te proposer l\'essentiel 🎯',
    'Mode efficacité maximale activé ! ⚡'
  ]),

  'step1-time-long': createMessageTemplate([
    'Belle session en perspective ! On va pouvoir bien travailler 💪',
    'Super, on a le temps de faire les choses bien ! 🎯',
    'Excellent ! On va pouvoir explorer plusieurs exercices 🔥',
    'Top, on va faire une séance complète et variée ! 💯',
    'Parfait ! Le temps de vraiment progresser aujourd\'hui 🚀'
  ]),

  'step1-energy-high': createMessageTemplate([
    'Wow, plein d\'énergie ! On va pouvoir pousser fort ! 🔥',
    'Super forme ! Prépare-toi à une séance intense 💪',
    'Énergie au max ? Parfait, on va tout déchirer ! ⚡',
    'Top niveau ! Je vais te proposer un truc qui envoie 🚀',
    'Belle énergie ! On va exploiter ça à fond aujourd\'hui 💥'
  ]),

  'step1-energy-moderate': createMessageTemplate([
    'Énergie modérée ? On va trouver le bon équilibre ! 👍',
    'Pas de souci, on adapte l\'intensité parfaitement 🎯',
    'Ok ! Séance équilibrée et progressive, c\'est parti 💪',
    'Bien reçu ! On va doser intelligemment l\'effort 🧠',
    'Compris ! Une séance adaptée à ton état du jour 💯'
  ]),

  'step1-energy-low': createMessageTemplate([
    'Fatigue aujourd\'hui ? On va faire une séance adaptée 🌱',
    'Pas de souci ! L\'important c\'est de bouger intelligemment 👍',
    'Ok ! Session récupération active, ça va faire du bien 💚',
    'Je comprends ! On va travailler en douceur et en contrôle 🧘',
    'Reçu ! Une séance douce mais efficace, promis 🌿'
  ]),

  'step1-location-selected': createMessageTemplate([
    'Lieu d\'entraînement enregistré ! Je sais quoi te proposer 📍',
    'Parfait ! Je connais ton setup, ça va être top 💪',
    'Super choix ! Je vais adapter les exercices à ton lieu 🎯',
    'Bien reçu ! Je sais exactement quoi te donner 🔥',
    'Ok ! Exercices adaptés à ton environnement en route 🚀'
  ]),

  'step1-location-photo-mode': createMessageTemplate([
    'Mode photo activé ! La Forge va analyser tes équipements 📸',
    'Super ! Ton environnement sera scanné automatiquement 🤖',
    'Photos enregistrées ! Je vais détecter tout ce qui est dispo ✨',
    'Excellent ! Analyse automatique de ton setup en cours 🔍',
    'Mode intelligent ! Je vais voir ce que tu as sous la main 🎯'
  ]),

  'step1-location-manual-mode': createMessageTemplate([
    'Équipements sélectionnés ! Je vais utiliser ça intelligemment 🛠️',
    'Parfait ! Je sais avec quoi on va bosser aujourd\'hui 💪',
    'Super setup ! Je vais créer une séance adaptée à ton matos 🎯',
    'Bien reçu ! Exercices optimisés pour tes équipements 🔥',
    'Ok ! Je connais ton arsenal, on va cartonner 💥'
  ]),

  'step1-fatigue-checked': createMessageTemplate([
    'Fatigue notée ! Je vais ajuster l\'intensité en conséquence 🌙',
    'Ok ! On va y aller progressivement et intelligemment 👍',
    'Compris ! Séance adaptée à ton niveau de récup 💚',
    'Pas de souci ! L\'important c\'est d\'écouter ton corps 🧠',
    'Bien reçu ! On va travailler mais sans forcer outre mesure 🌱'
  ]),

  'step1-pain-checked': createMessageTemplate([
    'Douleur signalée ! Je vais éviter cette zone 🩹',
    'Ok ! Je vais adapter pour ne pas solliciter cette partie 👨‍⚕️',
    'Compris ! Exercices modifiés pour respecter ta douleur 💚',
    'Pas de risque ! Je vais travailler autour intelligemment 🎯',
    'Bien noté ! On va bosser sans aggraver quoi que ce soit 🛡️'
  ]),

  'step1-short-version-enabled': createMessageTemplate([
    'Version courte activée ! Session express ultra efficace ⚡',
    'Mode rapide ! On va à l\'essentiel, maximum d\'intensité 🔥',
    '15-25 min chrono ! Concentré et percutant, c\'est parti 💪',
    'Express mode ON ! Chaque seconde va compter 🎯',
    'Court mais intense ! Tu vas transpirer, promis 💦'
  ]),

  'step1-ready-to-continue': createMessageTemplate([
    'Tout est prêt ! Direction la création de ton plan 🚀',
    'Parfait ! Je vais te concocter une séance sur mesure 💪',
    'Super ! Toutes les infos sont là, c\'est parti 🎯',
    'Ok ! Ton coach prépare quelque chose de top 🔥',
    'Bien ! Place à la génération de ta séance perso 💯'
  ])
};

export const getStep1Message = (id: Step1NotificationId): string => {
  const messageTemplate = STEP1_COACH_MESSAGES[id];
  return messageTemplate.getRandomMessage();
};
