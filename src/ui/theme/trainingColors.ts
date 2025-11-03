/**
 * Training Color System
 * Centralized color palette for Training tabs components
 */

export const TRAINING_COLORS = {
  action: '#18E3FF',
  motivation: '#8B5CF6',
  performance: '#3B82F6',
  progress: '#10B981',
  recovery: '#22C55E',
  wellness: '#06B6D4',
  intensity: '#EF4444',
  strategy: '#F59E0B',
  goals: '#EC4899',
  insights: '#6366F1',
  history: '#8B5CF6',
  metrics: '#06B6D4',
  recommendations: '#10B981',
  adaptive: '#3B82F6',
  wearable: '#06B6D4',
  energy: '#F59E0B'
} as const;

export type TrainingColorKey = keyof typeof TRAINING_COLORS;

export const getTrainingColor = (key: TrainingColorKey): string => {
  return TRAINING_COLORS[key];
};

export const getTrainingColorWithOpacity = (key: TrainingColorKey, opacity: number): string => {
  const color = TRAINING_COLORS[key];
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const TRAINING_COLOR_GRADIENTS = {
  action: `linear-gradient(135deg, ${TRAINING_COLORS.action}22 0%, ${TRAINING_COLORS.action}11 100%)`,
  motivation: `linear-gradient(135deg, ${TRAINING_COLORS.motivation}22 0%, ${TRAINING_COLORS.motivation}11 100%)`,
  performance: `linear-gradient(135deg, ${TRAINING_COLORS.performance}22 0%, ${TRAINING_COLORS.performance}11 100%)`,
  progress: `linear-gradient(135deg, ${TRAINING_COLORS.progress}22 0%, ${TRAINING_COLORS.progress}11 100%)`,
  recovery: `linear-gradient(135deg, ${TRAINING_COLORS.recovery}22 0%, ${TRAINING_COLORS.recovery}11 100%)`,
  wellness: `linear-gradient(135deg, ${TRAINING_COLORS.wellness}22 0%, ${TRAINING_COLORS.wellness}11 100%)`,
  intensity: `linear-gradient(135deg, ${TRAINING_COLORS.intensity}22 0%, ${TRAINING_COLORS.intensity}11 100%)`,
  strategy: `linear-gradient(135deg, ${TRAINING_COLORS.strategy}22 0%, ${TRAINING_COLORS.strategy}11 100%)`,
  goals: `linear-gradient(135deg, ${TRAINING_COLORS.goals}22 0%, ${TRAINING_COLORS.goals}11 100%)`,
  insights: `linear-gradient(135deg, ${TRAINING_COLORS.insights}22 0%, ${TRAINING_COLORS.insights}11 100%)`,
  history: `linear-gradient(135deg, ${TRAINING_COLORS.history}22 0%, ${TRAINING_COLORS.history}11 100%)`,
  metrics: `linear-gradient(135deg, ${TRAINING_COLORS.metrics}22 0%, ${TRAINING_COLORS.metrics}11 100%)`,
  recommendations: `linear-gradient(135deg, ${TRAINING_COLORS.recommendations}22 0%, ${TRAINING_COLORS.recommendations}11 100%)`,
  adaptive: `linear-gradient(135deg, ${TRAINING_COLORS.adaptive}22 0%, ${TRAINING_COLORS.adaptive}11 100%)`,
  wearable: `linear-gradient(135deg, ${TRAINING_COLORS.wearable}22 0%, ${TRAINING_COLORS.wearable}11 100%)`,
  energy: `linear-gradient(135deg, ${TRAINING_COLORS.energy}22 0%, ${TRAINING_COLORS.energy}11 100%)`
} as const;
