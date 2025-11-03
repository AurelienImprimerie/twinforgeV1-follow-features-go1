import { ActivityContext } from './contextAnalysis';

export interface CTAMessage {
  title: string;
  subtitle: string;
  buttonText: string;
  encouragement?: string;
}

/**
 * Générer un message CTA personnalisé basé sur le contexte d'activité
 */
export function generateCTAMessage(context: ActivityContext): CTAMessage {
  const {
    urgencyLevel,
    daysSinceLastActivity,
    hasActivitiesToday,
    totalActivitiesToday,
    contextMessage,
    lastActivityType
  } = context;

  // Cas: Aucune activité jamais enregistrée
  if (urgencyLevel === 'critical' && daysSinceLastActivity === Infinity) {
    return {
      title: 'Commencez votre voyage énergétique',
      subtitle: contextMessage,
      buttonText: 'Enregistrer ma première activité',
      encouragement: 'Chaque grand voyage commence par un premier pas'
    };
  }

  // Cas: Plus de 7 jours sans activité
  if (urgencyLevel === 'critical' && daysSinceLastActivity > 7) {
    return {
      title: 'Reprenez le contrôle de votre énergie',
      subtitle: contextMessage,
      buttonText: 'Reprendre en douceur',
      encouragement: 'Il n\'est jamais trop tard pour recommencer'
    };
  }

  // Cas: 2-7 jours sans activité
  if (urgencyLevel === 'high' && daysSinceLastActivity >= 2) {
    return {
      title: 'Votre corps attend du mouvement',
      subtitle: contextMessage,
      buttonText: 'Forger mon énergie maintenant',
      encouragement: 'Brisez la routine sédentaire avec une session aujourd\'hui'
    };
  }

  // Cas: 1 jour sans activité (hier)
  if (urgencyLevel === 'medium' && daysSinceLastActivity === 1) {
    return {
      title: 'Maintenez votre dynamique',
      subtitle: 'Dernière activité: hier - Ne perdez pas votre élan !',
      buttonText: 'Continuer ma progression',
      encouragement: 'La régularité est la clé du succès'
    };
  }

  // Cas: Activité aujourd'hui mais moins de 2 activités
  if (hasActivitiesToday && totalActivitiesToday === 1) {
    return {
      title: 'Excellente session aujourd\'hui !',
      subtitle: `Dernière activité: ${lastActivityType || 'enregistrée'} - Ajoutez-en une autre ?`,
      buttonText: 'Ajouter une session',
      encouragement: 'Doublez votre impact énergétique aujourd\'hui'
    };
  }

  // Cas: Plusieurs activités aujourd'hui
  if (hasActivitiesToday && totalActivitiesToday >= 2) {
    return {
      title: 'Journée énergétique exceptionnelle !',
      subtitle: `${totalActivitiesToday} activités aujourd'hui - Performance remarquable`,
      buttonText: 'Ajouter une activité',
      encouragement: 'Vous êtes sur une lancée formidable !'
    };
  }

  // Cas: Activité récente (dans la journée, moins de 6h)
  if (urgencyLevel === 'low' && daysSinceLastActivity === 0) {
    return {
      title: 'Gardez votre élan du jour',
      subtitle: contextMessage,
      buttonText: 'Enregistrer une activité',
      encouragement: 'Profitez de votre dynamique actuelle'
    };
  }

  // Cas: Activité modérément récente (dans la journée, plus de 6h)
  if (urgencyLevel === 'medium' && daysSinceLastActivity === 0) {
    return {
      title: 'Forgez votre énergie aujourd\'hui',
      subtitle: contextMessage,
      buttonText: 'Enregistrer une activité',
      encouragement: 'Il est encore temps de bouger aujourd\'hui'
    };
  }

  // Message par défaut (fallback)
  return {
    title: 'Forgez votre énergie',
    subtitle: 'Enregistrez votre prochaine session d\'activité',
    buttonText: 'Enregistrer une activité',
    encouragement: 'Chaque mouvement compte pour votre bien-être'
  };
}
