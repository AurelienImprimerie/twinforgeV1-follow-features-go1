/**
 * Device Capability Manager
 * Real-time device detection and performance adaptation
 * Optimized for 60fps on all mobile devices
 */

export type PerformanceLevel = 'high' | 'medium' | 'low';
export type MotionPreference = 'full' | 'reduced' | 'minimal';

interface DeviceCapabilities {
  performanceLevel: PerformanceLevel;
  gpuAvailable: boolean;
  ram: number;
  cores: number;
  isMobile: boolean;
  hasTouch: boolean;
  prefersReducedMotion: boolean;
  networkSpeed: 'slow' | 'medium' | 'fast';
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

interface PerformanceConfig {
  glassBlur: number;
  animationDuration: number;
  enableShimmer: boolean;
  enablePulse: boolean;
  enableGlow: boolean;
  maxAnimations: number;
  useFramerMotion: boolean;
  virtualizeThreshold: number;
}

class DeviceCapabilityManager {
  private capabilities: DeviceCapabilities;
  private config: PerformanceConfig;
  private performanceObserver: PerformanceObserver | null = null;
  private frameRateHistory: number[] = [];
  private lastFrameTime = performance.now();
  private rafId: number | null = null;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.config = this.generateConfig();
    this.startMonitoring();
  }

  private detectCapabilities(): DeviceCapabilities {
    const isMobile = this.detectMobile();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // GPU Detection via WebGL
    const gpuAvailable = this.detectGPU();

    // RAM Detection (approximation)
    const ram = (navigator as any).deviceMemory || this.estimateRAM();

    // CPU Cores
    const cores = navigator.hardwareConcurrency || 2;

    // Network Speed
    const networkSpeed = this.detectNetworkSpeed();

    // Battery Status (if available)
    const batteryLevel = this.detectBatteryLevel();
    const isLowPowerMode = this.detectLowPowerMode();

    // Calculate Performance Level
    const performanceLevel = this.calculatePerformanceLevel(
      gpuAvailable,
      ram,
      cores,
      isMobile
    );

    return {
      performanceLevel,
      gpuAvailable,
      ram,
      cores,
      isMobile,
      hasTouch,
      prefersReducedMotion,
      networkSpeed,
      batteryLevel,
      isLowPowerMode,
    };
  }

  private detectMobile(): boolean {
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isSmallScreen = window.innerWidth < 768;
    return isMobileUA || isSmallScreen;
  }

  private detectGPU(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return false;

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // Low-end GPUs detection
        const isLowEndGPU = /Mali|Adreno [34]|PowerVR|VideoCore/i.test(renderer);
        return !isLowEndGPU;
      }
      return true;
    } catch {
      return false;
    }
  }

  private estimateRAM(): number {
    // Fallback RAM estimation based on device characteristics
    if (this.detectMobile()) {
      return 4; // Assume 4GB for modern mobile
    }
    return 8; // Assume 8GB for desktop
  }

  private detectNetworkSpeed(): 'slow' | 'medium' | 'fast' {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (!connection) return 'medium';

    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    return 'fast';
  }

  private detectBatteryLevel(): number | undefined {
    // Battery API is deprecated but still available in some browsers
    return undefined;
  }

  private detectLowPowerMode(): boolean {
    // No reliable API for this, use heuristics
    return false;
  }

  private calculatePerformanceLevel(
    gpuAvailable: boolean,
    ram: number,
    cores: number,
    isMobile: boolean
  ): PerformanceLevel {
    let score = 0;

    if (gpuAvailable) score += 3;
    if (ram >= 8) score += 3;
    else if (ram >= 4) score += 2;
    else score += 1;

    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else score += 1;

    if (!isMobile) score += 2;

    // Scoring:
    // 11-12: high
    // 7-10: medium
    // 0-6: low
    if (score >= 11) return 'high';
    if (score >= 7) return 'medium';
    return 'low';
  }

  private generateConfig(): PerformanceConfig {
    const level = this.capabilities.performanceLevel;
    const isMobile = this.capabilities.isMobile;
    const prefersReduced = this.capabilities.prefersReducedMotion;

    // Force minimal config if reduced motion preferred
    if (prefersReduced) {
      return {
        glassBlur: 6,
        animationDuration: 150,
        enableShimmer: false,
        enablePulse: false,
        enableGlow: false,
        maxAnimations: 2,
        useFramerMotion: false,
        virtualizeThreshold: 20,
      };
    }

    if (level === 'high' && !isMobile) {
      return {
        glassBlur: 16,
        animationDuration: 300,
        enableShimmer: true,
        enablePulse: true,
        enableGlow: true,
        maxAnimations: 8,
        useFramerMotion: true,
        virtualizeThreshold: 50,
      };
    }

    if (level === 'medium' || (level === 'high' && isMobile)) {
      return {
        glassBlur: 12,
        animationDuration: 250,
        enableShimmer: false,
        enablePulse: true,
        enableGlow: true,
        maxAnimations: 4,
        useFramerMotion: false,
        virtualizeThreshold: 30,
      };
    }

    // Low-end config - optimized for 60fps
    return {
      glassBlur: 6,
      animationDuration: 200,
      enableShimmer: false,
      enablePulse: false,
      enableGlow: false,
      maxAnimations: 2,
      useFramerMotion: false,
      virtualizeThreshold: 15,
    };
  }

  private startMonitoring() {
    // Monitor frame rate
    this.monitorFrameRate();

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('[DeviceCapability] Long task detected:', entry.duration, 'ms');
              this.degradePerformanceIfNeeded();
            }
          }
        });
        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // PerformanceObserver not fully supported
      }
    }

    // Listen for battery changes
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            this.enableLowPowerMode();
          }
        });
      });
    }

    // Listen for visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseMonitoring();
      } else {
        this.resumeMonitoring();
      }
    });
  }

  private monitorFrameRate() {
    let lowFPSCount = 0;
    const DEGRADATION_THRESHOLD = 5; // Require 5 consecutive bad frames before degrading

    const measureFrame = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      const fps = 1000 / delta;

      this.frameRateHistory.push(fps);
      if (this.frameRateHistory.length > 120) { // Increased history window
        this.frameRateHistory.shift();
      }

      // Check average FPS with more lenient threshold
      const avgFPS = this.frameRateHistory.reduce((a, b) => a + b, 0) / this.frameRateHistory.length;

      // Only degrade if we have sustained poor performance (not just a spike)
      if (avgFPS < 45 && this.frameRateHistory.length >= 120) {
        lowFPSCount++;
        if (lowFPSCount >= DEGRADATION_THRESHOLD) {
          this.degradePerformanceIfNeeded();
          lowFPSCount = 0; // Reset counter after degrading
        }
      } else {
        // Reset counter if performance is acceptable
        lowFPSCount = 0;
      }

      this.lastFrameTime = now;
      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  private degradePerformanceIfNeeded() {
    const currentLevel = this.capabilities.performanceLevel;
    if (currentLevel === 'high') {
      this.capabilities.performanceLevel = 'medium';
      this.config = this.generateConfig();
      this.applyConfigToDOM();
      console.log('[DeviceCapability] Degraded to medium performance due to sustained low FPS');
    } else if (currentLevel === 'medium') {
      this.capabilities.performanceLevel = 'low';
      this.config = this.generateConfig();
      this.applyConfigToDOM();
      console.log('[DeviceCapability] Degraded to low performance due to sustained low FPS');
    }
  }

  private enableLowPowerMode() {
    this.capabilities.isLowPowerMode = true;
    this.capabilities.performanceLevel = 'low';
    this.config = this.generateConfig();
    this.applyConfigToDOM();
    console.info('[DeviceCapability] Low power mode enabled');
  }

  private applyConfigToDOM() {
    document.documentElement.style.setProperty('--glass-blur-adaptive', `${this.config.glassBlur}px`);
    document.documentElement.style.setProperty('--animation-duration-adaptive', `${this.config.animationDuration}ms`);

    document.documentElement.classList.remove('perf-high', 'perf-medium', 'perf-low');
    document.documentElement.classList.add(`perf-${this.capabilities.performanceLevel}`);

    if (!this.config.enableShimmer) {
      document.documentElement.classList.add('disable-shimmer');
    }
    if (!this.config.enablePulse) {
      document.documentElement.classList.add('disable-pulse');
    }
    if (!this.config.enableGlow) {
      document.documentElement.classList.add('disable-glow');
    }
  }

  private pauseMonitoring() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private resumeMonitoring() {
    if (this.rafId === null) {
      this.lastFrameTime = performance.now();
      this.monitorFrameRate();
    }
  }

  public getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }

  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  public shouldUseFramerMotion(): boolean {
    return this.config.useFramerMotion;
  }

  public shouldVirtualize(itemCount: number): boolean {
    return itemCount > this.config.virtualizeThreshold;
  }

  public getGlassBlur(): number {
    return this.config.glassBlur;
  }

  public getAnimationDuration(): number {
    return this.config.animationDuration;
  }

  public canUseEffect(effect: 'shimmer' | 'pulse' | 'glow'): boolean {
    switch (effect) {
      case 'shimmer':
        return this.config.enableShimmer;
      case 'pulse':
        return this.config.enablePulse;
      case 'glow':
        return this.config.enableGlow;
      default:
        return false;
    }
  }

  public destroy() {
    this.pauseMonitoring();
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Singleton instance
export const deviceCapabilityManager = new DeviceCapabilityManager();

// React hook
export function useDeviceCapability() {
  return {
    capabilities: deviceCapabilityManager.getCapabilities(),
    config: deviceCapabilityManager.getConfig(),
    shouldUseFramerMotion: deviceCapabilityManager.shouldUseFramerMotion(),
    shouldVirtualize: (count: number) => deviceCapabilityManager.shouldVirtualize(count),
    canUseEffect: (effect: 'shimmer' | 'pulse' | 'glow') => deviceCapabilityManager.canUseEffect(effect),
    getGlassBlur: () => deviceCapabilityManager.getGlassBlur(),
    getAnimationDuration: () => deviceCapabilityManager.getAnimationDuration(),
  };
}
