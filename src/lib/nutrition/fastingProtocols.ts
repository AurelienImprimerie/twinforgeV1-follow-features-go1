/**
 * Fasting Protocols - Protocoles de jeûne intermittent
 * Définitions et logique pour les protocoles de jeûne courants
 */

export interface FastingProtocol {
  id: string;
  name: string;
  description: string;
  windowHours: number;
  eatingHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  suggestedTimes: {
    morning: { start: string; end: string };
    evening: { start: string; end: string };
    intermediate: { start: string; end: string };
  };
}

/**
 * Protocoles de jeûne prédéfinis
 */
export const FASTING_PROTOCOLS: FastingProtocol[] = [
  {
    id: '16:8',
    name: '16:8 (Classique)',
    description: '16h de jeûne, 8h d\'alimentation - Le plus populaire et accessible',
    windowHours: 16,
    eatingHours: 8,
    difficulty: 'beginner',
    benefits: ['Facile à maintenir', 'Améliore la sensibilité à l\'insuline', 'Favorise la perte de graisse'],
    suggestedTimes: {
      morning: { start: '20:00', end: '12:00' },
      evening: { start: '22:00', end: '14:00' },
      intermediate: { start: '21:00', end: '13:00' }
    }
  },
  {
    id: '18:6',
    name: '18:6 (Intermédiaire)',
    description: '18h de jeûne, 6h d\'alimentation - Plus strict, résultats accélérés',
    windowHours: 18,
    eatingHours: 6,
    difficulty: 'intermediate',
    benefits: ['Autophagie renforcée', 'Perte de graisse accélérée', 'Clarté mentale'],
    suggestedTimes: {
      morning: { start: '19:00', end: '13:00' },
      evening: { start: '21:00', end: '15:00' },
      intermediate: { start: '20:00', end: '14:00' }
    }
  },
  {
    id: '20:4',
    name: '20:4 (Warrior)',
    description: '20h de jeûne, 4h d\'alimentation - Protocole avancé type "Warrior Diet"',
    windowHours: 20,
    eatingHours: 4,
    difficulty: 'advanced',
    benefits: ['Autophagie maximale', 'Discipline mentale', 'Optimisation hormonale'],
    suggestedTimes: {
      morning: { start: '18:00', end: '14:00' },
      evening: { start: '20:00', end: '16:00' },
      intermediate: { start: '19:00', end: '15:00' }
    }
  },
  {
    id: '14:10',
    name: '14:10 (Débutant)',
    description: '14h de jeûne, 10h d\'alimentation - Idéal pour commencer en douceur',
    windowHours: 14,
    eatingHours: 10,
    difficulty: 'beginner',
    benefits: ['Introduction douce', 'Facile à adapter', 'Moins de contraintes'],
    suggestedTimes: {
      morning: { start: '21:00', end: '11:00' },
      evening: { start: '23:00', end: '13:00' },
      intermediate: { start: '22:00', end: '12:00' }
    }
  }
];

/**
 * Obtenir un protocole par ID
 */
export function getProtocolById(id: string): FastingProtocol | null {
  return FASTING_PROTOCOLS.find(protocol => protocol.id === id) || null;
}

/**
 * Suggérer des horaires de jeûne basés sur le chronotype
 */
export function suggestFastingTimes(
  protocol: FastingProtocol,
  chronotype?: 'morning' | 'evening' | 'intermediate'
): { start: string; end: string } {
  const chrono = chronotype || 'intermediate';
  return protocol.suggestedTimes[chrono];
}

/**
 * Calculer les horaires de jeûne personnalisés
 */
export function calculateCustomFastingWindow(
  windowHours: number,
  chronotype?: 'morning' | 'evening' | 'intermediate',
  preferredEatingStart?: string
): { start: string; end: string } {
  // Si l'utilisateur a une préférence d'heure de début de repas
  if (preferredEatingStart) {
    const [hours, minutes] = preferredEatingStart.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    
    // Calculer l'heure de fin (début + fenêtre de jeûne)
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() - windowHours);
    
    return {
      start: endTime.toTimeString().slice(0, 5),
      end: startTime.toTimeString().slice(0, 5)
    };
  }

  // Suggestions par défaut selon le chronotype
  const suggestions = {
    morning: { 
      // Matinaux : finissent de manger tôt, commencent tôt
      start: '19:00', 
      end: String((19 + (24 - windowHours)) % 24).padStart(2, '0') + ':00'
    },
    evening: { 
      // Tardifs : finissent de manger tard, commencent tard
      start: '22:00', 
      end: String((22 + (24 - windowHours)) % 24).padStart(2, '0') + ':00'
    },
    intermediate: { 
      // Intermédiaires : horaires standards
      start: '20:00', 
      end: String((20 + (24 - windowHours)) % 24).padStart(2, '0') + ':00'
    }
  };

  return suggestions[chronotype || 'intermediate'];
}

/**
 * Valider une fenêtre de jeûne
 */
export function validateFastingWindow(
  start: string,
  end: string,
  windowHours: number
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!start || !end) {
    issues.push('Les heures de début et fin sont requises');
    return { isValid: false, issues };
  }

  // Calculer la durée réelle
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  let actualWindow = startMinutes - endMinutes;
  if (actualWindow < 0) actualWindow += 24 * 60; // Gérer le passage de minuit
  
  const actualHours = actualWindow / 60;
  
  if (Math.abs(actualHours - windowHours) > 0.5) {
    issues.push(`La durée calculée (${actualHours.toFixed(1)}h) ne correspond pas à la fenêtre choisie (${windowHours}h)`);
  }

  if (windowHours < 12) {
    issues.push('Une fenêtre de jeûne de moins de 12h n\'est pas considérée comme du jeûne intermittent');
  }

  if (windowHours > 23) {
    issues.push('Une fenêtre de jeûne de plus de 23h peut être dangereuse sans supervision médicale');
  }

  return { isValid: issues.length === 0, issues };
}