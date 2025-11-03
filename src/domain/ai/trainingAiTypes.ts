/**
 * Training AI System - Core Types
 * Types and interfaces for the multi-agent training generation system using GPT-5
 */

// ============================================================================
// GPT-5 Configuration Types
// ============================================================================

export type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
export type Verbosity = 'low' | 'medium' | 'high';
export type ModelType = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano';

export interface GPT5Config {
  model: ModelType;
  reasoningEffort: ReasoningEffort;
  verbosity: Verbosity;
  maxOutputTokens?: number;
  temperature?: never;
  topP?: never;
}

// ============================================================================
// Agent Types and Categories
// ============================================================================

export type AgentType =
  | 'context-collector'
  | 'morphology-analyzer'
  | 'coach-force'
  | 'coach-functional'
  | 'coach-competitions'
  | 'coach-calisthenics'
  | 'coach-combat'
  | 'coach-endurance'
  | 'coach-wellness'
  | 'coach-sports'
  | 'coach-mixed'
  | 'context-adapter'
  | 'coach-chat'
  | 'performance-analyzer'
  | 'progressive-adapter'
  | 'strategic-advisor';

export type CoachCategory =
  | 'force-powerbuilding'
  | 'functional-crosstraining'
  | 'fitness-competitions'
  | 'calisthenics-street'
  | 'combat-sports'
  | 'endurance'
  | 'wellness-mobility'
  | 'sports-specifiques'
  | 'mixed-custom';

export interface AgentMetadata {
  agentType: AgentType;
  version: string;
  timestamp: string;
  previousResponseId?: string;
  reasoningSummary?: string;
}

// ============================================================================
// Agent Context and Input Types
// ============================================================================

export interface UserContext {
  userId: string;

  // Profile data
  identity: {
    sex?: string;
    age?: number;
    height_cm?: number;
    weight_kg?: number;
    objective?: string;
    activityLevel?: string;
  };

  // Training profile
  training: {
    type?: string;
    category?: CoachCategory;
    fitnessLevel?: string;
    sessionsPerWeek?: number;
    preferredDuration?: number;
    availableEquipment?: string[];
    currentInjuries?: any[];
    movementsToAvoid?: string[];
  };

  // Wearable recovery metrics (from connected devices)
  recovery?: {
    hasWearableData: boolean;
    deviceName?: string;
    restingHeartRate?: number;
    hrv?: number;
    sleepHours?: number;
    recoveryScore?: number;
    bodyBattery?: number;
    lastSyncAt?: string;
    dataQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  };

  // Nutrition data
  nutrition?: {
    macroTargets?: any;
    restrictions?: string[];
    preferences?: string[];
  };

  // Fasting data
  fasting?: {
    protocol?: string;
    currentWindow?: any;
  };

  // Health data
  health?: {
    injuries?: any[];
    painHistory?: any[];
    medicalNotes?: string;
  };

  // Body scan data
  bodyScan?: {
    composition?: any;
    asymmetries?: any[];
    strengths?: string[];
    weaknesses?: string[];
    scanDate?: string;
  };

  // Training history (last 30 sessions)
  history: {
    sessions: any[];
    totalSessions: number;
    avgRpe: number;
    recentPerformance: any;
  };
}

export interface PreparerContext {
  availableTime: number;
  wantsShortVersion: boolean;
  locationId: string;
  locationName: string;
  locationPhotos: string[];
  availableEquipment: string[];
  energyLevel: number;
  hasFatigue: boolean;
  hasPain: boolean;
  painDetails?: string;
  tempSport?: string;
}

export interface AgentContext {
  userContext: UserContext;
  preparerContext?: PreparerContext;
  metadata: AgentMetadata;
  cacheKey?: string;
}

// ============================================================================
// Agent Response Types
// ============================================================================

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    agentType: AgentType;
    modelUsed: ModelType;
    reasoningEffort: ReasoningEffort;
    verbosity: Verbosity;
    tokensUsed?: number;
    costUsd?: number;
    latencyMs: number;
    responseId?: string;
    reasoningSummary?: string;
    cached?: boolean;
  };
}

// ============================================================================
// Specific Agent Output Types
// ============================================================================

export interface ContextCollectorOutput {
  userContext: UserContext;
  summary: string;
  keyFactors: string[];
  warnings: string[];
}

export interface MorphologyAnalysis {
  composition: {
    bodyFat: number;
    muscleMass: number;
    leanMass: number;
  };
  asymmetries: Array<{
    area: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    category: string;
    exercises: string[];
    variants: string[];
    reasoning: string;
  }>;
  biomechanicalNotes: string[];
}

export interface ExercisePrescription {
  id: string;
  name: string;
  variant?: string;
  sets: number;
  reps: number | string;
  load?: number;
  tempo?: string;
  rest: number;
  rpeTarget?: number;
  movementPattern: string;
  substitutions: string[];
  intensificationTechnique?: string;
  intensificationDetails?: string;
  executionCues: string[];
  coachNotes: string;
  coachTips: string[];
  safetyNotes: string[];
  commonMistakes: string[];
  targetHeartRateZone?: {
    minBpm: number;
    maxBpm: number;
    zoneLabel: string;
    zonePurpose: string;
  };
}

export interface SessionPrescription {
  sessionId: string;
  type: string;
  category: CoachCategory;
  durationTarget: number;
  focus: string[];
  warmup: {
    duration: number;
    exercises: string[];
    notes: string;
  };
  exercises: ExercisePrescription[];
  cooldown: {
    duration: number;
    exercises: string[];
    notes: string;
  };
  overallNotes: string;
  expectedRpe: number;
  coachRationale: string;
  wearableGuidance?: {
    recommendedZones?: string[];
    hrMonitoringEnabled: boolean;
    intensityAdjustment?: 'reduce' | 'maintain' | 'increase';
    recoveryNotes?: string;
  };
}

export interface PerformanceAnalysis {
  sessionId: string;
  metrics: {
    volumeTotal: number;
    intensityAverage: number;
    completionRate: number;
    techniqueScore: number;
    recoveryIndicators: any;
  };
  exerciseAnalysis: Array<{
    exerciseId: string;
    exerciseName: string;
    status: 'excellent' | 'good' | 'needs-adjustment' | 'problematic';
    recommendation: string;
  }>;
  fatigueSignals: string[];
  technicalIssues: string[];
  comparisonToPrevious: any;
  overallAssessment: string;
}

export interface ProgressiveAdaptation {
  id: string;
  exerciseId: string;
  exerciseName: string;
  type: 'progression' | 'maintenance' | 'deload' | 'substitution';
  changeDescription: string;
  reason: string;
  beforeValue?: string;
  afterValue?: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

export interface StrategicAdvice {
  weeklyPatterns: any;
  volumeIntensityBalance: {
    status: 'optimal' | 'high-volume' | 'high-intensity' | 'needs-rest';
    recommendation: string;
  };
  progressionTrends: any[];
  muscleGroupAnalysis: any[];
  recommendations: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionable: boolean;
    actionLabel?: string;
    estimatedImpact: string;
  }>;
  nextWeekPlan: {
    suggestedSessions: number;
    intensityDistribution: {
      light: number;
      moderate: number;
      intense: number;
    };
    focusAreas: string[];
    restDaysRecommended: number;
  };
}

// ============================================================================
// Wearable Integration Types
// ============================================================================

/**
 * Heart rate data point with timestamp
 */
export interface HeartRateDataPoint {
  timestamp: string;
  bpm: number;
  zone?: number;
}

/**
 * Time spent in each heart rate zone
 */
export interface HeartRateZoneDistribution {
  zone1: number; // seconds in Zone 1 (50-60% FCMax)
  zone2: number; // seconds in Zone 2 (60-70% FCMax)
  zone3: number; // seconds in Zone 3 (70-80% FCMax)
  zone4: number; // seconds in Zone 4 (80-90% FCMax)
  zone5: number; // seconds in Zone 5 (90-100% FCMax)
}

/**
 * Wearable metrics collected during a training session
 */
export interface WearableSessionMetrics {
  // Raw heart rate data
  heartRateData: HeartRateDataPoint[];

  // Aggregated metrics
  avgHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;

  // Zone distribution
  timeInZones: HeartRateZoneDistribution;

  // Additional metrics
  caloriesBurned: number;
  effortScore: number; // 0-100 calculated from HR data

  // Data quality indicator
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';

  // Device info
  deviceName: string;
  deviceId: string;

  // Session timing
  sessionStartTime: string;
  sessionEndTime: string;
  durationSeconds: number;
}

/**
 * Wearable analysis results for post-session insights
 */
export interface WearableAnalysis {
  // Overall effort assessment
  effortAccuracy: {
    score: number; // 0-100
    rating: 'excellent' | 'good' | 'moderate' | 'poor';
    analysis: string;
    rpeVsHrCorrelation: number; // -1 to 1
  };

  // Zone compliance (for endurance sessions)
  zoneCompliance?: {
    overallCompliance: number; // 0-100%
    targetZones: string[];
    actualDistribution: HeartRateZoneDistribution;
    deviations: Array<{
      period: string;
      expectedZone: string;
      actualZone: string;
      duration: number;
    }>;
    recommendation: string;
  };

  // Recovery impact assessment
  recoveryImpact: {
    estimatedRecoveryHours: number;
    intensityLevel: 'light' | 'moderate' | 'hard' | 'very-hard';
    suggestedNextSessionDelay: number; // hours
    warnings: string[];
  };

  // Insights & recommendations
  insights: string[];
  recommendations: string[];
}

/**
 * Wearable tracking state for UI hook
 */
export interface WearableTrackingState {
  isTracking: boolean;
  deviceName?: string;
  deviceId?: string;
  currentHeartRate?: number;
  currentZone?: number;
  connectionStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSyncTime?: string;
  error?: string;
}

// ============================================================================
// Pipeline State Types
// ============================================================================

export type GenerationState =
  | 'idle'
  | 'collecting-context'
  | 'analyzing-morphology'
  | 'generating-prescription'
  | 'adapting-context'
  | 'completed'
  | 'error';

export interface GenerationProgress {
  state: GenerationState;
  currentAgent?: AgentType;
  progress: number;
  message: string;
  error?: string;
}

// ============================================================================
// Cache Types
// ============================================================================

export type CacheType = 'context' | 'morphology' | 'prescription' | 'advice';

export interface CacheEntry {
  key: string;
  type: CacheType;
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================================================
// Monitoring and Metrics Types
// ============================================================================

export interface AgentMetrics {
  agentType: AgentType;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: Date;
}

export interface GenerationMetrics {
  generationId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalLatencyMs: number;
  totalCostUsd: number;
  agentMetrics: AgentMetrics[];
  success: boolean;
  error?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class TrainingAIError extends Error {
  constructor(
    message: string,
    public agentType: AgentType,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TrainingAIError';
  }
}

export class RateLimitError extends TrainingAIError {
  constructor(agentType: AgentType, details?: any) {
    super('Rate limit exceeded', agentType, 'RATE_LIMIT', details);
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends TrainingAIError {
  constructor(agentType: AgentType, details?: any) {
    super('Request timeout', agentType, 'TIMEOUT', details);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends TrainingAIError {
  constructor(agentType: AgentType, message: string, details?: any) {
    super(message, agentType, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
