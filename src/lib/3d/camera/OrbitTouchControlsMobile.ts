/**
 * Mobile-Optimized OrbitTouchControls Wrapper
 * Ajoute throttling et optimisations pour améliorer les performances sur mobile
 */

import { OrbitTouchControls } from './OrbitTouchControls';
import * as THREE from 'three';
import logger from '../../utils/logger';

export interface MobileControlsConfig {
  throttleMs: number; // Milliseconds between updates
  enableDamping: boolean;
  dampingFactor: number;
  enableAutoRotate: boolean;
  autoRotateSpeed: number;
}

/**
 * Wrapper mobile-optimized pour OrbitTouchControls
 * Implémente le throttling des événements tactiles pour réduire la charge CPU
 */
export class MobileOptimizedOrbitControls extends OrbitTouchControls {
  private throttleMs: number;
  private lastUpdateTime: number = 0;
  private pendingUpdate: boolean = false;
  private rafId: number | null = null;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    config?: Partial<MobileControlsConfig>
  ) {
    super(camera, domElement);

    // Apply mobile-optimized config
    const defaultConfig: MobileControlsConfig = {
      throttleMs: 50, // 20 updates per second by default
      enableDamping: true,
      dampingFactor: 0.1, // Faster damping for better responsiveness
      enableAutoRotate: false,
      autoRotateSpeed: 0.5
    };

    const finalConfig = { ...defaultConfig, ...config };
    this.throttleMs = finalConfig.throttleMs;

    // Apply configuration
    this.enableDamping = finalConfig.enableDamping;
    this.dampingFactor = finalConfig.dampingFactor;
    this.setAutoRotate(finalConfig.enableAutoRotate);
    this.autoRotateSpeed = finalConfig.autoRotateSpeed;

    logger.info('MOBILE_CONTROLS', 'Mobile-optimized controls initialized', {
      throttleMs: this.throttleMs,
      enableDamping: this.enableDamping,
      dampingFactor: this.dampingFactor,
      philosophy: 'mobile_controls_optimization'
    });

    // Override the update method with throttled version
    this.setupThrottledUpdate();
  }

  /**
   * Configure le système de throttling pour les mises à jour
   */
  private setupThrottledUpdate(): void {
    const originalUpdate = this.update.bind(this);

    // Replace update method with throttled version
    this.update = (): boolean => {
      const now = performance.now();
      const elapsed = now - this.lastUpdateTime;

      // If not enough time has passed, schedule an update and return
      if (elapsed < this.throttleMs) {
        if (!this.pendingUpdate) {
          this.pendingUpdate = true;

          // Schedule next update
          if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
          }

          this.rafId = requestAnimationFrame(() => {
            this.lastUpdateTime = performance.now();
            this.pendingUpdate = false;
            this.rafId = null;
            originalUpdate();
          });
        }

        return false; // Update not performed
      }

      // Enough time has passed, perform update
      this.lastUpdateTime = now;
      this.pendingUpdate = false;
      return originalUpdate();
    };
  }

  /**
   * Ajuste le throttling dynamiquement
   */
  public setThrottling(throttleMs: number): void {
    this.throttleMs = Math.max(16, Math.min(throttleMs, 200)); // Clamp between 16ms (60fps) and 200ms (5fps)

    logger.debug('MOBILE_CONTROLS', 'Throttling adjusted', {
      throttleMs: this.throttleMs,
      philosophy: 'dynamic_throttling_adjustment'
    });
  }

  /**
   * Active/désactive le mode ultra-performance
   */
  public setUltraPerformanceMode(enabled: boolean): void {
    if (enabled) {
      this.setThrottling(100); // 10 updates per second
      this.dampingFactor = 0.15; // Even faster damping
      this.enableDamping = true;

      logger.info('MOBILE_CONTROLS', 'Ultra-performance mode enabled', {
        philosophy: 'ultra_low_end_mobile_optimization'
      });
    } else {
      this.setThrottling(50); // 20 updates per second
      this.dampingFactor = 0.1;

      logger.info('MOBILE_CONTROLS', 'Normal performance mode restored', {
        philosophy: 'normal_mobile_optimization'
      });
    }
  }

  /**
   * Cleanup et dispose des ressources
   */
  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.pendingUpdate = false;

    super.dispose();

    logger.debug('MOBILE_CONTROLS', 'Mobile controls disposed', {
      philosophy: 'controls_cleanup'
    });
  }
}

/**
 * Factory function pour créer des contrôles optimisés selon l'appareil
 */
export function createOptimizedControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  isMobile: boolean,
  isLowEndDevice: boolean
): OrbitTouchControls | MobileOptimizedOrbitControls {
  if (!isMobile) {
    // Desktop: Use standard controls
    const controls = new OrbitTouchControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    logger.info('MOBILE_CONTROLS', 'Standard desktop controls created', {
      philosophy: 'desktop_controls'
    });

    return controls;
  }

  // Mobile: Use mobile-optimized controls
  const config: Partial<MobileControlsConfig> = isLowEndDevice
    ? {
        throttleMs: 100, // Ultra-throttled for low-end
        enableDamping: true,
        dampingFactor: 0.15,
        enableAutoRotate: false, // Disabled by default on low-end
        autoRotateSpeed: 0.3
      }
    : {
        throttleMs: 50, // Normal throttling for mid-range
        enableDamping: true,
        dampingFactor: 0.1,
        enableAutoRotate: false,
        autoRotateSpeed: 0.5
      };

  const controls = new MobileOptimizedOrbitControls(camera, domElement, config);

  logger.info('MOBILE_CONTROLS', 'Mobile-optimized controls created', {
    isLowEndDevice,
    throttleMs: config.throttleMs,
    philosophy: 'mobile_optimized_controls'
  });

  return controls;
}
