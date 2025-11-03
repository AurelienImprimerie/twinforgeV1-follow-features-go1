import { create } from 'zustand';

type Period = 'week' | 'month' | 'quarter';
type ApiPeriod = 'last7Days' | 'last30Days' | 'last3Months';

interface ActivityPeriodState {
  selectedPeriod: Period;
  setSelectedPeriod: (period: Period) => void;
  getApiPeriod: () => ApiPeriod;
}

const PERIOD_MAPPING: Record<Period, ApiPeriod> = {
  'week': 'last7Days',
  'month': 'last30Days',
  'quarter': 'last3Months',
};

/**
 * Store Zustand pour partager la période d'analyse entre les onglets Insights et Progression
 * Permet à l'onglet Insights d'utiliser la dernière période sélectionnée dans Progression
 */
export const useActivityPeriodStore = create<ActivityPeriodState>((set, get) => ({
  // Période par défaut: semaine (pour éviter les appels API coûteux automatiques)
  selectedPeriod: 'week',

  setSelectedPeriod: (period: Period) => {
    set({ selectedPeriod: period });
  },

  getApiPeriod: () => {
    const { selectedPeriod } = get();
    return PERIOD_MAPPING[selectedPeriod];
  },
}));
