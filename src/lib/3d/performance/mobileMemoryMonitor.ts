/**
 * Mobile Memory Monitor
 * Prevents crashes by monitoring memory usage and triggering cleanup
 */

import logger from '../../utils/logger';
import * as THREE from 'three';

interface MemoryStats {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  usagePercentage?: number;
  isNearLimit: boolean;
  isCritical: boolean;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

class MobileMemoryMonitor {
  private isMonitoring = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 2000; // Check every 2 seconds
  private readonly WARNING_THRESHOLD = 0.75; // 75% of limit
  private readonly CRITICAL_THRESHOLD = 0.90; // 90% of limit
  private lastCleanupTime = 0;
  private readonly MIN_CLEANUP_INTERVAL = 10000; // 10 seconds minimum between cleanups
  private cleanupCallbacks: Array<() => void> = [];

  /**
   * Start monitoring memory usage
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    // Only monitor on mobile devices
    const isMobile = /mobile|android|iphone|ipod/i.test(navigator.userAgent);
    if (!isMobile) {
      logger.info('MEMORY_MONITOR', 'Skipping memory monitoring (desktop device)', {
        philosophy: 'desktop_skip_memory_monitor'
      });
      return;
    }

    // Check if performance.memory API is available (Chrome only)
    if (!(performance as any).memory) {
      logger.warn('MEMORY_MONITOR', 'Performance.memory API not available', {
        philosophy: 'memory_api_unavailable'
      });
      return;
    }

    this.isMonitoring = true;
    logger.info('MEMORY_MONITOR', 'Starting mobile memory monitoring', {
      checkInterval: this.CHECK_INTERVAL_MS,
      warningThreshold: this.WARNING_THRESHOLD,
      criticalThreshold: this.CRITICAL_THRESHOLD,
      philosophy: 'memory_monitoring_started'
    });

    this.checkInterval = setInterval(() => {
      this.checkMemory();
    }, this.CHECK_INTERVAL_MS);

    // Initial check
    this.checkMemory();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    logger.info('MEMORY_MONITOR', 'Memory monitoring stopped', {
      philosophy: 'memory_monitoring_stopped'
    });
  }

  /**
   * Register a cleanup callback to be called when memory is high
   */
  onMemoryPressure(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Get current memory stats
   */
  getMemoryStats(): MemoryStats {
    const memory = (performance as any).memory as PerformanceMemory | undefined;

    if (!memory) {
      return {
        isNearLimit: false,
        isCritical: false
      };
    }

    const usagePercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    const isNearLimit = usagePercentage >= this.WARNING_THRESHOLD;
    const isCritical = usagePercentage >= this.CRITICAL_THRESHOLD;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage,
      isNearLimit,
      isCritical
    };
  }

  /**
   * Check memory and trigger cleanup if needed
   */
  private checkMemory(): void {
    const stats = this.getMemoryStats();

    if (!stats.usagePercentage) return;

    // Log only on significant memory pressure
    if (stats.isNearLimit) {
      logger.warn('MEMORY_MONITOR', 'Memory pressure detected', {
        usedMB: (stats.usedJSHeapSize! / 1024 / 1024).toFixed(2),
        limitMB: (stats.jsHeapSizeLimit! / 1024 / 1024).toFixed(2),
        usagePercentage: (stats.usagePercentage * 100).toFixed(1) + '%',
        isCritical: stats.isCritical,
        philosophy: 'memory_pressure_detected'
      });

      // Trigger cleanup if critical and enough time has passed
      if (stats.isCritical) {
        this.triggerCleanup();
      }
    }
  }

  /**
   * Trigger cleanup callbacks
   */
  private triggerCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanupTime < this.MIN_CLEANUP_INTERVAL) {
      return; // Too soon, skip
    }

    this.lastCleanupTime = now;

    logger.warn('MEMORY_MONITOR', '🧹 Triggering memory cleanup', {
      registeredCallbacks: this.cleanupCallbacks.length,
      philosophy: 'memory_cleanup_triggered'
    });

    // Call all registered cleanup callbacks
    this.cleanupCallbacks.forEach((callback, index) => {
      try {
        callback();
      } catch (error) {
        logger.error('MEMORY_MONITOR', `Cleanup callback ${index} failed`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Force garbage collection if available (only in development)
    if (import.meta.env.DEV && (window as any).gc) {
      (window as any).gc();
      logger.info('MEMORY_MONITOR', 'Forced garbage collection', {
        philosophy: 'forced_gc'
      });
    }
  }

  /**
   * Manual cleanup trigger
   */
  forceCleanup(): void {
    logger.info('MEMORY_MONITOR', 'Manual cleanup requested', {
      philosophy: 'manual_cleanup'
    });
    this.triggerCleanup();
  }
}

// Global singleton
export const mobileMemoryMonitor = new MobileMemoryMonitor();

/**
 * Cleanup Three.js resources aggressively
 */
export function cleanupThreeJSResources(scene?: THREE.Scene): void {
  if (!scene) return;

  logger.info('MEMORY_CLEANUP', 'Cleaning up Three.js resources', {
    philosophy: 'threejs_resource_cleanup'
  });

  let disposedTextures = 0;
  let disposedGeometries = 0;
  let disposedMaterials = 0;

  scene.traverse((object) => {
    // Dispose geometries
    if ((object as any).geometry) {
      const geometry = (object as any).geometry as THREE.BufferGeometry;
      if (geometry && typeof geometry.dispose === 'function') {
        geometry.dispose();
        disposedGeometries++;
      }
    }

    // Dispose materials
    if ((object as any).material) {
      const materials = Array.isArray((object as any).material)
        ? (object as any).material
        : [(object as any).material];

      materials.forEach((material: THREE.Material) => {
        if (material && typeof material.dispose === 'function') {
          // Dispose textures
          Object.keys(material).forEach((key) => {
            const value = (material as any)[key];
            if (value && value.isTexture) {
              value.dispose();
              disposedTextures++;
            }
          });

          material.dispose();
          disposedMaterials++;
        }
      });
    }
  });

  logger.info('MEMORY_CLEANUP', 'Three.js cleanup complete', {
    disposedTextures,
    disposedGeometries,
    disposedMaterials,
    philosophy: 'threejs_cleanup_stats'
  });
}
