/**
 * Head System - Core Types
 * Central type definitions for the brain system
 */

// ============================================
// Core Brain Types
// ============================================

export type ForgeType = 'training' | 'nutrition' | 'fasting' | 'body-scan' | 'equipment';

export type ActivityState =
  | 'idle'
  | 'navigation'
  | 'training-active'
  | 'training-rest'
  | 'post-training'
  | 'meal-scan'
  | 'fridge-scan'
  | 'body-scan'
  | 'profile-editing';

export interface AppContext {
  currentRoute: string;
  previousRoute: string | null;
  pageContext: PageContext;
  activityState: ActivityState;
  timestamp: number;
}

export interface PageContext {
  type: 'home' | 'training' | 'profile' | 'settings' | 'other';
  subContext?: string; // e.g., 'pipeline-step-3', 'profile-health-tab'
  parameters?: Record<string, any>;
}

// ============================================
// User Knowledge Types
// ============================================

export interface UserKnowledge {
  profile: ProfileKnowledge;
  training: TrainingKnowledge;
  equipment: EquipmentKnowledge;
  nutrition: NutritionKnowledge;
  fasting: FastingKnowledge;
  bodyScan: BodyScanKnowledge;
  lastUpdated: Record<ForgeType, number>;
  completeness: Record<ForgeType, number>; // 0-100%
}

export interface ProfileKnowledge {
  // Core Identity
  userId: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;

  // Physical Attributes
  age?: number;
  sex?: 'male' | 'female' | 'other';
  birthdate?: string; // ISO date
  height?: number; // height_cm
  weight?: number; // weight_kg
  targetWeight?: number; // target_weight_kg
  bodyFatPerc?: number; // body_fat_perc

  // Objectives & Activity
  objectives: string[]; // Legacy support
  objective?: 'fat_loss' | 'recomp' | 'muscle_gain'; // New structured field
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  jobCategory?: 'office' | 'field' | 'shift' | 'manual' | 'student' | 'other';

  // Training Preferences
  preferredDisciplines: string[];
  defaultDiscipline?: string;
  level?: string; // Legacy support
  equipment?: string[]; // Legacy support

  // Localization
  country?: string;
  language?: string;
  preferredLanguage?: 'fr' | 'en';

  // Avatar/Body Scan Status (for coaching awareness)
  hasCompletedBodyScan?: boolean;
  avatarStatus?: 'none' | 'pending' | 'ready' | 'error';
  portraitUrl?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingKnowledge {
  recentSessions: TrainingSessionSummary[];
  currentLoads: Record<string, number>; // exerciseName -> currentLoad
  exercisePreferences: ExercisePreference[];
  progressionPatterns: ProgressionPattern[];
  avgRPE: number;
  weeklyVolume: number;
  lastSessionDate: string | null;
  personalRecords: PersonalRecord[];
  activeGoals: TrainingGoal[];
  hasData: boolean;
}

export interface PersonalRecord {
  exerciseName: string;
  load: number;
  reps: number;
  date: string;
  discipline: string;
}

export interface TrainingGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null;
  isActive: boolean;
}

export interface TrainingSessionSummary {
  sessionId: string;
  date: string;
  discipline: string;
  exerciseCount: number;
  duration: number;
  completed: boolean;
  avgRPE?: number;
}

export interface ExercisePreference {
  exerciseName: string;
  enjoymentScore: number; // 1-5
  frequencyLast30Days: number;
  avgLoad: number;
}

export interface ProgressionPattern {
  exerciseName: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  loadProgression: number; // % change over last month
  volumeProgression: number;
}

export interface EquipmentKnowledge {
  locations: TrainingLocation[];
  availableEquipment: string[];
  defaultLocationId: string | null;
  lastScanDate: string | null;
}

export interface TrainingLocation {
  id: string;
  name: string;
  type: string;
  equipment: string[];
}

export interface NutritionKnowledge {
  recentMeals: MealSummary[];
  mealPlan: MealPlanSummary | null;
  scanFrequency: number;
  lastScanDate: string | null;
  averageCalories: number;
  averageProtein: number;
  dietaryPreferences: string[];
  hasData: boolean;
}

export interface MealSummary {
  id: string;
  name: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: string;
}

export interface MealPlanSummary {
  id: string;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  mealsPlanned: number;
}

export interface FastingKnowledge {
  recentSessions: FastingSessionSummary[];
  currentSession: FastingSessionSummary | null;
  averageFastingDuration: number;
  totalSessionsCompleted: number;
  preferredProtocol: string | null;
  lastSessionDate: string | null;
  hasData: boolean;
}

export interface FastingSessionSummary {
  id: string;
  startTime: string;
  endTime: string | null;
  targetDuration: number;
  actualDuration: number | null;
  protocol: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  quality?: number;
}

export interface BodyScanKnowledge {
  recentScans: BodyScanSummary[];
  lastScanDate: string | null;
  latestMeasurements: BodyMeasurements | null;
  progressionTrend: 'improving' | 'stable' | 'declining' | null;
  hasData: boolean;
}

export interface BodyScanSummary {
  id: string;
  scanDate: string;
  scanType: string;
  measurements: BodyMeasurements;
}

export interface BodyMeasurements {
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  legs?: number;
}

// ============================================
// Session Awareness Types
// ============================================

export interface SessionAwareness {
  isActive: boolean;
  sessionType: 'training' | 'nutrition' | 'fasting' | 'body-scan' | null;
  trainingSession?: TrainingSessionContext;
  timestamp: number;
}

export interface TrainingSessionContext {
  sessionId: string;
  currentExerciseIndex: number;
  totalExercises: number;
  currentExercise?: ExerciseContext;
  nextExercise?: ExerciseContext;
  currentSet: number;
  totalSets: number;
  isResting: boolean;
  restTimeRemaining: number;
  sessionTimeElapsed: number;
  lastRPE?: number;
  discipline: string;
}

export interface ExerciseContext {
  name: string;
  variant?: string;
  load?: number;
  reps: string;
  sets: number;
  rest: number;
  coachTips?: string[];
  muscleGroups?: string[];
}

// ============================================
// Brain Context Types
// ============================================

export interface BrainContext {
  user: UserKnowledge;
  app: AppContext;
  session: SessionAwareness;
  missingData: MissingDataReport;
  todayData?: TodayData | null;
  timestamp: number;
  cacheKey: string;
}

export interface TodayData {
  trainingSessions: TodayTrainingSession[];
  meals: TodayMeal[];
  fastingSession: TodayFastingSession | null;
  bodyScans: TodayBodyScan[];
  hasTraining: boolean;
  hasNutrition: boolean;
  hasFasting: boolean;
  hasBodyScan: boolean;
  totalActivities: number;
}

export interface TodayTrainingSession {
  id: string;
  discipline: string;
  startTime: string;
  endTime: string | null;
  status: 'planned' | 'in_progress' | 'completed';
  exerciseCount: number;
}

export interface TodayMeal {
  id: string;
  name: string;
  mealType: string;
  consumedAt: string;
  calories: number;
  protein: number;
}

export interface TodayFastingSession {
  id: string;
  startTime: string;
  targetDuration: number;
  currentDuration: number;
  status: 'in_progress' | 'completed';
}

export interface TodayBodyScan {
  id: string;
  scanType: string;
  scanTime: string;
}

export interface MissingDataReport {
  hasIncompletProfile: boolean;
  missingForges: ForgeType[];
  suggestions: ProactiveSuggestion[];
  priority: 'high' | 'medium' | 'low';
}

export interface ProactiveSuggestion {
  id: string;
  forge: ForgeType;
  action: string;
  message: string;
  priority: number;
  reason: string;
  timing: 'now' | 'after-training' | 'morning' | 'evening' | 'weekly';
}

// ============================================
// Prompt Building Types
// ============================================

export interface PromptEnrichment {
  systemPromptAdditions: string[];
  contextualInstructions: string[];
  userKnowledgeSummary: string;
  currentActivityContext: string;
  suggestedResponseStyle: ResponseStyle;
}

export interface ResponseStyle {
  length: 'ultra-short' | 'short' | 'medium' | 'detailed';
  tone: 'motivational' | 'technical' | 'informative' | 'conversational';
  formality: 'casual' | 'professional';
  emoji: boolean;
}

// ============================================
// Forge Module Interface
// ============================================

export interface IForgeModule {
  forgeType: ForgeType;

  /**
   * Collect data for this forge
   */
  collectData(userId: string): Promise<any>;

  /**
   * Get context summary for prompts
   */
  getContextSummary(data: any): string;

  /**
   * Detect missing or incomplete data
   */
  detectMissingData(data: any): MissingDataReport;

  /**
   * Get enrichment for prompts
   */
  getPromptEnrichment(data: any, context: AppContext): PromptEnrichment;

  /**
   * Check if data is fresh
   */
  isDataFresh(lastUpdate: number): boolean;
}

// ============================================
// Feedback Types
// ============================================

export interface TrainingFeedbackRecord {
  id: string;
  sessionId: string;
  userId: string;
  exerciseName?: string;
  setNumber?: number;
  category: FeedbackCategory;
  isKeyMoment: boolean;
  message: string;
  context: FeedbackContext;
  timestamp: number;
}

export type FeedbackCategory =
  | 'motivation'
  | 'technique'
  | 'difficulty'
  | 'pain'
  | 'progression'
  | 'question'
  | 'general';

export interface FeedbackContext {
  exerciseIndex: number;
  exerciseName: string;
  setNumber: number;
  load: number;
  rpe?: number;
  timeElapsed: number;
}

// ============================================
// Cache Types
// ============================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheInvalidationRule {
  forge: ForgeType;
  events: string[]; // Supabase table names or event types
  ttl: number; // milliseconds
}

// ============================================
// Sync Types
// ============================================

export interface SyncEvent {
  type: 'insert' | 'update' | 'delete';
  table: string;
  userId: string;
  recordId: string;
  timestamp: number;
  affectedForges: ForgeType[];
}

export interface SyncStatus {
  isHealthy: boolean;
  lastSync: number;
  failedAttempts: number;
  affectedForges: ForgeType[];
}

// ============================================
// Monitoring Types
// ============================================

export interface PerformanceMetrics {
  dataCollectionLatency: number;
  contextBuildingLatency: number;
  promptGenerationLatency: number;
  cacheHitRate: number;
  totalLatency: number;
}

export interface HealthStatus {
  brain: 'healthy' | 'degraded' | 'down';
  supabase: 'connected' | 'disconnected';
  cache: 'fresh' | 'stale';
  lastCheck: number;
}

// ============================================
// Event System Types
// ============================================

export type { EventType, TrainingEvent, EventListener, EventSubscription } from './events/types';

// ============================================
// Conversation Memory Types
// ============================================

export interface ConversationMessage {
  id: string;
  userId: string;
  sessionId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'text' | 'voice' | 'system';
  context?: {
    currentRoute?: string;
    activityState?: string;
    sessionType?: string;
    exerciseName?: string;
    setNumber?: number;
  };
  metadata?: Record<string, any>;
  timestamp: number;
  createdAt: string;
}

export interface ConversationSummary {
  totalMessages: number;
  textMessages: number;
  voiceMessages: number;
  systemMessages: number;
  firstMessageAt?: string;
  lastMessageAt?: string;
}
