/**
 * PerformanceMonitor
 *
 * Comprehensive performance tracking and debugging system for 3D viewer operations.
 * Tracks timing, detects anomalies, and provides actionable insights.
 *
 * Features:
 * - Operation timing with automatic threshold detection
 * - Reload detection and prevention
 * - Memory usage tracking
 * - Performance regression detection
 * - Real-time alerts for performance issues
 */

import logger from './logger';

export interface OperationTiming {
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, any>;
}

export interface PerformanceAlert {
  type: 'slow_operation' | 'unexpected_reload' | 'memory_leak' | 'regression';
  message: string;
  severity: 'warning' | 'error' | 'critical';
  details: Record<string, any>;
  timestamp: number;
}

export interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  slowestOperation: OperationTiming | null;
  fastestOperation: OperationTiming | null;
  reloadCount: number;
  alertCount: number;
  memoryUsageMB: number;
}

export interface OperationThresholds {
  sceneInit: number; // ms
  modelLoad: number;
  morphApply: number;
  textureGeneration: number;
  materialConfig: number;
}

/**
 * PerformanceMonitor - Tracks and analyzes viewer performance
 */
export class PerformanceMonitor {
  private operationHistory: OperationTiming[] = [];
  private activeOperations: Map<string, OperationTiming> = new Map();
  private alerts: PerformanceAlert[] = [];
  private reloadDetectionMap: Map<string, number> = new Map();
  private sessionStartTime: number = Date.now();

  private thresholds: OperationThresholds = {
    sceneInit: 2000, // 2s
    modelLoad: 1500, // 1.5s
    morphApply: 500, // 500ms
    textureGeneration: 400, // 400ms
    materialConfig: 300, // 300ms
  };

  private maxHistorySize: number = 500;
  private maxAlertSize: number = 100;

  constructor(customThresholds?: Partial<OperationThresholds>) {
    if (customThresholds) {
      this.thresholds = { ...this.thresholds, ...customThresholds };
    }

    logger.info('PERFORMANCE_MONITOR', 'PerformanceMonitor initialized', {
      thresholds: this.thresholds,
      philosophy: 'performance_tracking_enabled'
    });
  }

  /**
   * Start tracking an operation
   */
  public startOperation(operationName: string, tags?: Record<string, any>): string {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const timing: OperationTiming = {
      operationName,
      startTime: performance.now(),
      tags: tags || {},
    };

    this.activeOperations.set(operationId, timing);

    logger.debug('PERFORMANCE_MONITOR', `⏱️ Operation started: ${operationName}`, {
      operationId,
      tags,
      philosophy: 'operation_tracking_start'
    });

    return operationId;
  }

  /**
   * End tracking an operation
   */
  public endOperation(operationId: string): void {
    const timing = this.activeOperations.get(operationId);

    if (!timing) {
      logger.warn('PERFORMANCE_MONITOR', 'Attempted to end unknown operation', {
        operationId,
        philosophy: 'unknown_operation_end'
      });
      return;
    }

    const endTime = performance.now();
    const duration = endTime - timing.startTime;

    timing.endTime = endTime;
    timing.duration = duration;

    // Move to history
    this.operationHistory.push(timing);
    this.activeOperations.delete(operationId);

    // Trim history if needed
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift();
    }

    // Check against thresholds
    this.checkOperationThreshold(timing);

    logger.debug('PERFORMANCE_MONITOR', `✅ Operation completed: ${timing.operationName}`, {
      duration: `${duration.toFixed(2)}ms`,
      tags: timing.tags,
      philosophy: 'operation_tracking_end'
    });
  }

  /**
   * Check if operation exceeded threshold
   */
  private checkOperationThreshold(timing: OperationTiming): void {
    if (!timing.duration) return;

    let threshold: number | undefined;
    const name = timing.operationName.toLowerCase();

    if (name.includes('scene') && name.includes('init')) {
      threshold = this.thresholds.sceneInit;
    } else if (name.includes('model') && name.includes('load')) {
      threshold = this.thresholds.modelLoad;
    } else if (name.includes('morph') && name.includes('apply')) {
      threshold = this.thresholds.morphApply;
    } else if (name.includes('texture') && name.includes('generat')) {
      threshold = this.thresholds.textureGeneration;
    } else if (name.includes('material') && name.includes('config')) {
      threshold = this.thresholds.materialConfig;
    }

    if (threshold && timing.duration > threshold) {
      this.addAlert({
        type: 'slow_operation',
        message: `Operation "${timing.operationName}" exceeded threshold`,
        severity: timing.duration > threshold * 2 ? 'error' : 'warning',
        details: {
          operationName: timing.operationName,
          duration: timing.duration,
          threshold,
          exceedBy: timing.duration - threshold,
          tags: timing.tags,
        },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Detect and track reloads
   */
  public trackReload(componentName: string): void {
    const currentCount = this.reloadDetectionMap.get(componentName) || 0;
    const newCount = currentCount + 1;

    this.reloadDetectionMap.set(componentName, newCount);

    logger.warn('PERFORMANCE_MONITOR', `🔄 Reload detected: ${componentName}`, {
      reloadCount: newCount,
      sessionTime: `${((Date.now() - this.sessionStartTime) / 1000).toFixed(1)}s`,
      philosophy: 'reload_detection'
    });

    // Alert if multiple reloads detected
    if (newCount > 1) {
      this.addAlert({
        type: 'unexpected_reload',
        message: `Multiple reloads detected for ${componentName}`,
        severity: newCount > 3 ? 'critical' : 'error',
        details: {
          componentName,
          reloadCount: newCount,
          sessionTime: Date.now() - this.sessionStartTime,
        },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Trim alerts if needed
    if (this.alerts.length > this.maxAlertSize) {
      this.alerts.shift();
    }

    // Log alert
    const logLevel = alert.severity === 'critical' ? 'error' : alert.severity === 'error' ? 'error' : 'warn';

    logger[logLevel]('PERFORMANCE_MONITOR', `🚨 ${alert.type.toUpperCase()}: ${alert.message}`, {
      ...alert.details,
      philosophy: 'performance_alert'
    });
  }

  /**
   * Get performance statistics
   */
  public getStats(): PerformanceStats {
    const completedOps = this.operationHistory.filter(op => op.duration !== undefined);

    let totalDuration = 0;
    let slowestOp: OperationTiming | null = null;
    let fastestOp: OperationTiming | null = null;

    completedOps.forEach(op => {
      if (op.duration) {
        totalDuration += op.duration;

        if (!slowestOp || op.duration > (slowestOp.duration || 0)) {
          slowestOp = op;
        }

        if (!fastestOp || op.duration < (fastestOp.duration || Infinity)) {
          fastestOp = op;
        }
      }
    });

    const averageDuration = completedOps.length > 0 ? totalDuration / completedOps.length : 0;
    const reloadCount = Array.from(this.reloadDetectionMap.values()).reduce((a, b) => a + b, 0);

    // Estimate memory usage (approximate)
    const memoryUsageMB = performance.memory
      ? performance.memory.usedJSHeapSize / (1024 * 1024)
      : 0;

    return {
      totalOperations: completedOps.length,
      averageDuration,
      slowestOperation: slowestOp,
      fastestOperation: fastestOp,
      reloadCount,
      alertCount: this.alerts.length,
      memoryUsageMB,
    };
  }

  /**
   * Get all alerts
   */
  public getAlerts(severity?: PerformanceAlert['severity']): PerformanceAlert[] {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity);
    }
    return [...this.alerts];
  }

  /**
   * Get operation history
   */
  public getOperationHistory(operationName?: string, limit?: number): OperationTiming[] {
    let history = operationName
      ? this.operationHistory.filter(op => op.operationName === operationName)
      : [...this.operationHistory];

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Get reload counts by component
   */
  public getReloadCounts(): Map<string, number> {
    return new Map(this.reloadDetectionMap);
  }

  /**
   * Log comprehensive report
   */
  public logReport(): void {
    const stats = this.getStats();

    logger.info('PERFORMANCE_MONITOR', '📊 Performance Report', {
      sessionDuration: `${((Date.now() - this.sessionStartTime) / 1000).toFixed(1)}s`,
      totalOperations: stats.totalOperations,
      averageDuration: `${stats.averageDuration.toFixed(2)}ms`,
      slowestOperation: stats.slowestOperation
        ? `${stats.slowestOperation.operationName} (${stats.slowestOperation.duration?.toFixed(2)}ms)`
        : 'N/A',
      fastestOperation: stats.fastestOperation
        ? `${stats.fastestOperation.operationName} (${stats.fastestOperation.duration?.toFixed(2)}ms)`
        : 'N/A',
      reloadCount: stats.reloadCount,
      alertCount: stats.alertCount,
      criticalAlerts: this.getAlerts('critical').length,
      errorAlerts: this.getAlerts('error').length,
      warningAlerts: this.getAlerts('warning').length,
      memoryUsageMB: stats.memoryUsageMB.toFixed(2),
      philosophy: 'performance_report'
    });

    // Log reload breakdown
    if (stats.reloadCount > 0) {
      const reloadBreakdown: Record<string, number> = {};
      this.reloadDetectionMap.forEach((count, component) => {
        reloadBreakdown[component] = count;
      });

      logger.warn('PERFORMANCE_MONITOR', '🔄 Reload Breakdown', {
        ...reloadBreakdown,
        totalReloads: stats.reloadCount,
        philosophy: 'reload_breakdown'
      });
    }
  }

  /**
   * Clear all tracking data
   */
  public reset(): void {
    this.operationHistory = [];
    this.activeOperations.clear();
    this.alerts = [];
    this.reloadDetectionMap.clear();
    this.sessionStartTime = Date.now();

    logger.info('PERFORMANCE_MONITOR', 'Performance monitor reset', {
      philosophy: 'monitor_reset'
    });
  }

  /**
   * Dispose and cleanup
   */
  public dispose(): void {
    this.logReport();
    this.reset();

    logger.info('PERFORMANCE_MONITOR', 'Performance monitor disposed', {
      philosophy: 'monitor_disposed'
    });
  }
}

// Global singleton instance
let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * Get global performance monitor instance
 */
export function getGlobalPerformanceMonitor(): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor();
  }
  return globalPerformanceMonitor;
}

/**
 * Dispose global performance monitor
 */
export function disposeGlobalPerformanceMonitor(): void {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.dispose();
    globalPerformanceMonitor = null;
  }
}
