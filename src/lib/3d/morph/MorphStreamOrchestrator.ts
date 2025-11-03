/**
 * MorphStreamOrchestrator
 *
 * Progressive morph application system that applies morphs in batches
 * to prevent UI freezing and enable real-time visual feedback.
 *
 * Benefits:
 * - Smooth visual transitions instead of instant application
 * - No UI blocking during heavy morph calculations
 * - Real-time feedback showing the avatar adjusting
 * - Prioritized application (structure → details → fine-tuning)
 */

import * as THREE from 'three';
import logger from '../../utils/logger';

export interface MorphApplicationTask {
  morphKey: string;
  targetValue: number;
  priority: 'structural' | 'detail' | 'fine';
}

export interface MorphStreamConfig {
  batchSize?: number; // Number of morphs to apply per frame (default: 8)
  delayBetweenBatches?: number; // Delay in ms between batches (default: 0 - uses RAF)
  enableSmoothing?: boolean; // Smooth transition to target value (default: true)
  smoothingSteps?: number; // Number of steps for smoothing (default: 3)
  onProgress?: (current: number, total: number) => void;
  onComplete?: () => void;
  onBatchComplete?: (batchIndex: number, totalBatches: number) => void;
}

export interface MorphStreamState {
  isStreaming: boolean;
  currentBatch: number;
  totalBatches: number;
  appliedMorphs: number;
  totalMorphs: number;
}

/**
 * Classify morph by priority based on its impact on overall shape
 */
function classifyMorphPriority(morphKey: string): 'structural' | 'detail' | 'fine' {
  const structuralMorphs = [
    'height', 'bodyWeight', 'bodybuilderSize', 'athleteFigure',
    'shoulderWidth', 'hipWidth', 'legLength', 'torsoLength'
  ];

  const detailMorphs = [
    'pearFigure', 'appleShape', 'muscularity', 'chestSize',
    'waistSize', 'gluteSize', 'thighSize', 'calfSize', 'armSize'
  ];

  // Everything else is fine-tuning
  const lowerKey = morphKey.toLowerCase();

  if (structuralMorphs.some(key => lowerKey.includes(key.toLowerCase()))) {
    return 'structural';
  }

  if (detailMorphs.some(key => lowerKey.includes(key.toLowerCase()))) {
    return 'detail';
  }

  return 'fine';
}

/**
 * MorphStreamOrchestrator - Progressive morph application manager
 */
export class MorphStreamOrchestrator {
  private mesh: THREE.SkinnedMesh | null = null;
  private config: Required<MorphStreamConfig>;
  private state: MorphStreamState;
  private animationFrameId: number | null = null;
  private currentTasks: MorphApplicationTask[] = [];
  private smoothingProgress: Map<string, number> = new Map();
  private isAborted: boolean = false;

  constructor(config: MorphStreamConfig = {}) {
    this.config = {
      batchSize: config.batchSize ?? 8,
      delayBetweenBatches: config.delayBetweenBatches ?? 0,
      enableSmoothing: config.enableSmoothing ?? true,
      smoothingSteps: config.smoothingSteps ?? 3,
      onProgress: config.onProgress ?? (() => {}),
      onComplete: config.onComplete ?? (() => {}),
      onBatchComplete: config.onBatchComplete ?? (() => {}),
    };

    this.state = {
      isStreaming: false,
      currentBatch: 0,
      totalBatches: 0,
      appliedMorphs: 0,
      totalMorphs: 0,
    };
  }

  /**
   * Start streaming morphs to the mesh
   */
  public async streamMorphs(
    mesh: THREE.SkinnedMesh,
    targetMorphs: Record<string, number>
  ): Promise<void> {
    // Abort any existing stream
    this.abort();

    this.mesh = mesh;
    this.isAborted = false;

    // Validate mesh
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
      logger.error('MORPH_STREAM', 'Invalid mesh - missing morph targets', {
        hasDictionary: !!mesh.morphTargetDictionary,
        hasInfluences: !!mesh.morphTargetInfluences,
        philosophy: 'invalid_mesh'
      });
      return;
    }

    // Create prioritized task list
    this.currentTasks = this.createTaskList(targetMorphs, mesh);

    if (this.currentTasks.length === 0) {
      logger.debug('MORPH_STREAM', 'No morphs to apply', {
        philosophy: 'empty_task_list'
      });
      this.config.onComplete();
      return;
    }

    // Calculate batches
    const totalBatches = Math.ceil(this.currentTasks.length / this.config.batchSize);

    this.state = {
      isStreaming: true,
      currentBatch: 0,
      totalBatches,
      appliedMorphs: 0,
      totalMorphs: this.currentTasks.length,
    };

    logger.info('MORPH_STREAM', 'Starting progressive morph application', {
      totalMorphs: this.currentTasks.length,
      batchSize: this.config.batchSize,
      totalBatches,
      enableSmoothing: this.config.enableSmoothing,
      smoothingSteps: this.config.smoothingSteps,
      philosophy: 'progressive_stream_start'
    });

    // Start streaming
    await this.processNextBatch();
  }

  /**
   * Create prioritized task list from target morphs
   */
  private createTaskList(
    targetMorphs: Record<string, number>,
    mesh: THREE.SkinnedMesh
  ): MorphApplicationTask[] {
    const tasks: MorphApplicationTask[] = [];

    Object.entries(targetMorphs).forEach(([morphKey, targetValue]) => {
      // Check if morph exists in mesh
      if (!(morphKey in mesh.morphTargetDictionary!)) {
        logger.debug('MORPH_STREAM', 'Skipping unknown morph', {
          morphKey,
          philosophy: 'unknown_morph_skip'
        });
        return;
      }

      const priority = classifyMorphPriority(morphKey);
      tasks.push({ morphKey, targetValue, priority });
    });

    // Sort by priority: structural → detail → fine
    const priorityOrder = { structural: 0, detail: 1, fine: 2 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    logger.debug('MORPH_STREAM', 'Task list created and prioritized', {
      totalTasks: tasks.length,
      structural: tasks.filter(t => t.priority === 'structural').length,
      detail: tasks.filter(t => t.priority === 'detail').length,
      fine: tasks.filter(t => t.priority === 'fine').length,
      philosophy: 'task_prioritization'
    });

    return tasks;
  }

  /**
   * Process next batch of morphs
   */
  private async processNextBatch(): Promise<void> {
    if (this.isAborted || !this.mesh) {
      this.cleanup();
      return;
    }

    const startIndex = this.state.currentBatch * this.config.batchSize;
    const endIndex = Math.min(startIndex + this.config.batchSize, this.currentTasks.length);
    const batch = this.currentTasks.slice(startIndex, endIndex);

    if (batch.length === 0) {
      // All batches processed
      this.complete();
      return;
    }

    logger.debug('MORPH_STREAM', 'Processing batch', {
      batchIndex: this.state.currentBatch,
      batchSize: batch.length,
      startIndex,
      endIndex,
      philosophy: 'batch_processing'
    });

    // Apply batch
    this.applyBatch(batch);

    // Update state
    this.state.appliedMorphs += batch.length;
    this.config.onProgress(this.state.appliedMorphs, this.state.totalMorphs);
    this.config.onBatchComplete(this.state.currentBatch, this.state.totalBatches);

    this.state.currentBatch++;

    // Schedule next batch
    if (this.config.delayBetweenBatches > 0) {
      setTimeout(() => this.processNextBatch(), this.config.delayBetweenBatches);
    } else {
      // Use requestAnimationFrame for smooth application
      this.animationFrameId = requestAnimationFrame(() => this.processNextBatch());
    }
  }

  /**
   * Apply a batch of morphs to the mesh
   */
  private applyBatch(batch: MorphApplicationTask[]): void {
    if (!this.mesh || !this.mesh.morphTargetDictionary || !this.mesh.morphTargetInfluences) {
      return;
    }

    batch.forEach(task => {
      const morphIndex = this.mesh!.morphTargetDictionary![task.morphKey];

      if (morphIndex === undefined) {
        logger.warn('MORPH_STREAM', 'Morph index not found', {
          morphKey: task.morphKey,
          philosophy: 'morph_index_missing'
        });
        return;
      }

      if (this.config.enableSmoothing) {
        // Apply smoothed value
        const currentValue = this.mesh!.morphTargetInfluences![morphIndex];
        const progress = (this.smoothingProgress.get(task.morphKey) || 0) + 1;
        const smoothedValue = currentValue + (task.targetValue - currentValue) * (progress / this.config.smoothingSteps);

        this.mesh!.morphTargetInfluences![morphIndex] = smoothedValue;
        this.smoothingProgress.set(task.morphKey, progress);
      } else {
        // Apply directly
        this.mesh!.morphTargetInfluences![morphIndex] = task.targetValue;
      }
    });

    // Force mesh update
    this.mesh!.morphTargetInfluences = [...this.mesh!.morphTargetInfluences];
    this.mesh!.updateMorphTargets();
  }

  /**
   * Complete streaming
   */
  private complete(): void {
    logger.info('MORPH_STREAM', 'Progressive morph application completed', {
      totalMorphsApplied: this.state.appliedMorphs,
      totalBatches: this.state.currentBatch,
      philosophy: 'stream_complete'
    });

    this.state.isStreaming = false;
    this.config.onComplete();
    this.cleanup();
  }

  /**
   * Abort streaming
   */
  public abort(): void {
    if (this.state.isStreaming) {
      logger.info('MORPH_STREAM', 'Aborting progressive morph application', {
        appliedMorphs: this.state.appliedMorphs,
        totalMorphs: this.state.totalMorphs,
        philosophy: 'stream_aborted'
      });
    }

    this.isAborted = true;
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.currentTasks = [];
    this.smoothingProgress.clear();
    this.mesh = null;

    this.state = {
      isStreaming: false,
      currentBatch: 0,
      totalBatches: 0,
      appliedMorphs: 0,
      totalMorphs: 0,
    };
  }

  /**
   * Get current streaming state
   */
  public getState(): MorphStreamState {
    return { ...this.state };
  }

  /**
   * Check if currently streaming
   */
  public isActive(): boolean {
    return this.state.isStreaming;
  }
}
