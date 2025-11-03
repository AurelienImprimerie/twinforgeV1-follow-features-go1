/**
 * Training AI System - Central Exports
 * Phase 1: Infrastructure and Services
 */

// Core service
export { trainingGenerationService, TrainingGenerationService } from './trainingGenerationService';

// Types
export type {
  AgentType,
  CoachCategory,
  ReasoningEffort,
  Verbosity,
  ModelType,
  GPT5Config,
  AgentContext,
  AgentResponse,
  UserContext,
  PreparerContext,
  SessionPrescription,
  ExercisePrescription,
  PerformanceAnalysis,
  ProgressiveAdaptation,
  StrategicAdvice,
  GenerationState,
  GenerationProgress,
  AgentMetrics,
  GenerationMetrics,
  TrainingAIError,
  RateLimitError,
  TimeoutError,
  ValidationError
} from '../../../domain/ai/trainingAiTypes';

// Prompt system
export {
  promptRegistry,
  createPrompt,
  initializeTrainingPrompts
} from '../../../config/prompts/training';

export type { PromptTemplate } from '../../../config/prompts/training';
