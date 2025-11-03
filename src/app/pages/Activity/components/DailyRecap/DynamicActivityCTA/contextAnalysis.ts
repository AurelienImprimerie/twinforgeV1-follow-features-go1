import { differenceInDays, differenceInHours, format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Calculer le nombre de jours depuis la dernière activité
 */
export function getDaysSinceLastActivity(lastActivityDate: Date | string | null): number {
  if (!lastActivityDate) return Infinity;

  const lastDate = typeof lastActivityDate === 'string' ? new Date(lastActivityDate) : lastActivityDate;
  const now = new Date();

  return differenceInDays(now, lastDate);
}

/**
 * Calculer le nombre d'heures depuis la dernière activité
 */
export function getHoursSinceLastActivity(lastActivityDate: Date | string | null): number {
  if (!lastActivityDate) return Infinity;

  const lastDate = typeof lastActivityDate === 'string' ? new Date(lastActivityDate) : lastActivityDate;
  const now = new Date();

  return differenceInHours(now, lastDate);
}

/**
 * Formater la date de la dernière activité de manière contextuelle
 */
export function formatLastActivityDate(lastActivityDate: Date | string | null): string {
  if (!lastActivityDate) return 'jamais';

  const lastDate = typeof lastActivityDate === 'string' ? new Date(lastActivityDate) : lastActivityDate;
  const daysSince = getDaysSinceLastActivity(lastDate);
  const hoursSince = getHoursSinceLastActivity(lastDate);

  // Activité très récente (moins de 1 heure)
  if (hoursSince < 1) {
    return 'il y a quelques instants';
  }

  // Activité aujourd'hui
  if (daysSince === 0) {
    return `aujourd'hui à ${format(lastDate, 'HH:mm')}`;
  }

  // Activité hier
  if (daysSince === 1) {
    return `hier à ${format(lastDate, 'HH:mm')}`;
  }

  // Activité cette semaine (2-6 jours)
  if (daysSince <= 6) {
    return `il y a ${daysSince} jours`;
  }

  // Activité plus ancienne
  return format(lastDate, 'dd MMM yyyy', { locale: fr });
}

/**
 * Obtenir un message de contexte basé sur l'historique d'activité
 */
export interface ActivityContext {
  daysSinceLastActivity: number;
  hasActivitiesThisWeek: boolean;
  hasActivitiesToday: boolean;
  totalActivitiesToday: number;
  totalCaloriesToday: number;
  lastActivityDate: Date | null;
  lastActivityType: string | null;
  urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  contextMessage: string;
}

export function analyzeActivityContext(
  todayStats: {
    totalCalories: number;
    activitiesCount: number;
    totalDuration: number;
  } | null,
  lastActivity: {
    timestamp: string;
    type: string;
  } | null
): ActivityContext {
  const daysSince = getDaysSinceLastActivity(lastActivity?.timestamp || null);
  const hasActivitiesToday = (todayStats?.activitiesCount || 0) > 0;
  const totalActivitiesToday = todayStats?.activitiesCount || 0;
  const totalCaloriesToday = todayStats?.totalCalories || 0;

  let urgencyLevel: ActivityContext['urgencyLevel'] = 'none';
  let contextMessage = '';

  // CORRECTION CRITIQUE: Déterminer le niveau d'urgence et le message contextuel
  // Prendre en compte l'historique global, pas seulement aujourd'hui
  if (!lastActivity) {
    // Aucune activité jamais enregistrée (vraiment aucune activité globale)
    urgencyLevel = 'critical';
    contextMessage = 'Vous n\'avez pas encore enregistré d\'activité. Commencez votre voyage énergétique !';
  } else if (daysSince === 0 && hasActivitiesToday) {
    // Activité aujourd'hui
    if (totalActivitiesToday === 1) {
      urgencyLevel = 'low';
      contextMessage = `Dernière activité: ${formatLastActivityDate(lastActivity.timestamp)}`;
    } else {
      urgencyLevel = 'none';
      contextMessage = `${totalActivitiesToday} activités aujourd'hui - Excellent rythme !`;
    }
  } else if (daysSince === 0 && !hasActivitiesToday) {
    // Aucune activité aujourd'hui mais activité très récente (dans les dernières heures)
    const hoursSince = getHoursSinceLastActivity(lastActivity.timestamp);
    if (hoursSince < 6) {
      urgencyLevel = 'low';
      contextMessage = `Dernière activité: ${formatLastActivityDate(lastActivity.timestamp)}`;
    } else {
      urgencyLevel = 'medium';
      contextMessage = `Dernière activité: ${formatLastActivityDate(lastActivity.timestamp)}`;
    }
  } else if (daysSince === 1) {
    // Dernière activité hier
    urgencyLevel = 'medium';
    contextMessage = `Dernière activité: hier - Reprenez votre rythme aujourd'hui !`;
  } else if (daysSince <= 3) {
    // 2-3 jours sans activité
    urgencyLevel = 'high';
    contextMessage = `Cela fait ${daysSince} jours sans activité - Il est temps de bouger !`;
  } else if (daysSince <= 7) {
    // 4-7 jours sans activité
    urgencyLevel = 'high';
    contextMessage = `${daysSince} jours d'inactivité - Votre corps a besoin de mouvement !`;
  } else {
    // Plus de 7 jours sans activité
    urgencyLevel = 'critical';
    contextMessage = `Plus de ${daysSince > 14 ? '2 semaines' : `${daysSince} jours`} sans activité - Recommencez en douceur !`;
  }

  return {
    daysSinceLastActivity: daysSince,
    hasActivitiesThisWeek: daysSince <= 7,
    hasActivitiesToday,
    totalActivitiesToday,
    totalCaloriesToday,
    lastActivityDate: lastActivity ? new Date(lastActivity.timestamp) : null,
    lastActivityType: lastActivity?.type || null,
    urgencyLevel,
    contextMessage
  };
}
