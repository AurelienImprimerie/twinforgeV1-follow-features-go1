/**
 * Mobile Detection and Performance Classification
 * Détecte les appareils mobiles et leur niveau de performance pour adapter le rendu 3D
 */

import logger from '../../utils/logger';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type PerformanceLevel = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  type: DeviceType;
  performanceLevel: PerformanceLevel;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  gpuTier: number; // 1-3: 1=low, 2=medium, 3=high
  maxTextureSize: number;
  supportsWebGL2: boolean;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  hardwareConcurrency: number;
  deviceMemory: number | null; // GB, null if not available
  isLowEndDevice: boolean;
}

export interface PerformanceConfig {
  pixelRatio: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  maxLights: number;
  targetFPS: number;
  enablePostProcessing: boolean;
  enableProceduralTextures: boolean;
  textureQuality: 'low' | 'medium' | 'high';
  geometryLOD: 'low' | 'medium' | 'high';
  enableAutoRotate: boolean;
  enableEnvironmentMap: boolean;
  maxMorphTargets: number;
  throttleControlsMs: number;
}

/**
 * Détecte le type d'appareil basé sur le user agent et les dimensions d'écran
 */
function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();
  const isTabletUA = /ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua);
  const isMobileUA = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);

  // Check screen size for more accurate detection
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const minDimension = Math.min(screenWidth, screenHeight);

  if (isTabletUA || (minDimension >= 768 && minDimension < 1024)) {
    return 'tablet';
  } else if (isMobileUA || minDimension < 768) {
    return 'mobile';
  } else {
    return 'desktop';
  }
}

/**
 * Estime le tier GPU basé sur le renderer WebGL et d'autres métriques
 */
function estimateGPUTier(gl: WebGLRenderingContext | WebGL2RenderingContext): number {
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) {
    // Fallback: Assume medium tier if we can't detect
    return 2;
  }

  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

  // High-end GPUs (Desktop)
  if (
    renderer.includes('nvidia') ||
    renderer.includes('geforce') ||
    renderer.includes('radeon') ||
    renderer.includes('apple m1') ||
    renderer.includes('apple m2') ||
    renderer.includes('apple m3')
  ) {
    return 3;
  }

  // High-end Mobile GPUs (iPhone 13+, Samsung Galaxy S21+, etc.)
  if (
    renderer.includes('apple a15') ||
    renderer.includes('apple a16') ||
    renderer.includes('apple a17') ||
    renderer.includes('apple a18') ||
    renderer.includes('adreno 6') || // Adreno 600+ series (Snapdragon 845+)
    renderer.includes('adreno 7') || // Adreno 700+ series (Snapdragon 8 Gen)
    renderer.includes('mali-g7') || // Mali-G76+
    renderer.includes('mali-g78') ||
    renderer.includes('mali-g710') ||
    renderer.includes('xclipse') // Samsung Exynos with AMD GPU
  ) {
    return 3;
  }

  // Medium-tier Mobile GPUs
  if (
    renderer.includes('adreno 5') || // Adreno 500 series
    renderer.includes('mali-g5') || // Mali-G52, G57
    renderer.includes('mali-g6') || // Mali-G68
    renderer.includes('apple a12') ||
    renderer.includes('apple a13') ||
    renderer.includes('apple a14')
  ) {
    return 2;
  }

  // Low-end GPUs
  if (
    renderer.includes('intel hd') ||
    renderer.includes('intel uhd') ||
    renderer.includes('mali-t') || // Older Mali-T series
    renderer.includes('mali-g31') ||
    renderer.includes('mali-g51') ||
    renderer.includes('adreno 3') ||
    renderer.includes('adreno 4') ||
    renderer.includes('powervr') ||
    renderer.includes('apple a9') ||
    renderer.includes('apple a10') ||
    renderer.includes('apple a11')
  ) {
    return 1;
  }

  // Medium tier by default
  return 2;
}

/**
 * Détecte les capacités de l'appareil pour le rendu 3D
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const deviceType = detectDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Create temporary canvas to test WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL not supported on this device');
  }

  const supportsWebGL2 = !!(canvas.getContext('webgl2'));
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const gpuTier = estimateGPUTier(gl);

  // Get device metrics
  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  // Get device memory if available (Chrome only)
  const deviceMemory = (navigator as any).deviceMemory || null;

  // Determine performance level based on multiple factors
  let performanceLevel: PerformanceLevel;

  if (isDesktop) {
    performanceLevel = gpuTier >= 2 ? 'high' : 'medium';
  } else if (isTablet) {
    performanceLevel = gpuTier >= 3 ? 'high' : gpuTier >= 2 ? 'medium' : 'low';
  } else {
    // Mobile - Amélioration de la classification
    if (gpuTier >= 3 && hardwareConcurrency >= 6 && (!deviceMemory || deviceMemory >= 4)) {
      performanceLevel = 'high'; // High-end mobiles (iPhone 13+, Galaxy S21+) get high
    } else if (gpuTier >= 2 && hardwareConcurrency >= 4) {
      performanceLevel = 'medium'; // Mid-range mobiles
    } else {
      performanceLevel = 'low'; // Low-end mobiles
    }
  }

  // Identify low-end devices that need aggressive optimization
  const isLowEndDevice =
    performanceLevel === 'low' ||
    (isMobile && hardwareConcurrency < 4) ||
    (deviceMemory !== null && deviceMemory < 2) ||
    maxTextureSize < 2048;

  const capabilities: DeviceCapabilities = {
    type: deviceType,
    performanceLevel,
    isMobile,
    isTablet,
    isDesktop,
    gpuTier,
    maxTextureSize,
    supportsWebGL2,
    devicePixelRatio,
    screenWidth,
    screenHeight,
    hardwareConcurrency,
    deviceMemory,
    isLowEndDevice
  };

  logger.info('MOBILE_DETECTION', 'Device capabilities detected', {
    deviceType,
    performanceLevel,
    gpuTier,
    isLowEndDevice,
    hardwareConcurrency,
    deviceMemory,
    maxTextureSize,
    supportsWebGL2,
    philosophy: 'device_capability_detection'
  });

  return capabilities;
}

/**
 * Génère une configuration de performance optimale basée sur les capacités de l'appareil
 */
export function getOptimalPerformanceConfig(capabilities: DeviceCapabilities): PerformanceConfig {
  const { performanceLevel, isMobile, isLowEndDevice, devicePixelRatio } = capabilities;

  let config: PerformanceConfig;

  if (isLowEndDevice || (isMobile && performanceLevel === 'low')) {
    // Configuration ultra-performance pour appareils faibles
    config = {
      pixelRatio: 1, // Force 1x resolution
      shadowsEnabled: false,
      shadowMapSize: 0,
      maxLights: 3, // Ambient + Key + Fill
      targetFPS: 30,
      enablePostProcessing: false,
      enableProceduralTextures: false,
      textureQuality: 'low',
      geometryLOD: 'low',
      enableAutoRotate: false, // Disabled by default, user can enable
      enableEnvironmentMap: false,
      maxMorphTargets: 15, // Reduced from all
      throttleControlsMs: 100 // 10 updates per second
    };
  } else if (isMobile && performanceLevel === 'medium') {
    // Configuration équilibrée pour mobiles moyens
    config = {
      pixelRatio: 1.25, // AMÉLIORÉ: 1.25x pour meilleure qualité
      shadowsEnabled: false,
      shadowMapSize: 0,
      maxLights: 4, // Ambient + Key + Fill + Rim
      targetFPS: 30,
      enablePostProcessing: false,
      enableProceduralTextures: false,
      textureQuality: 'medium',
      geometryLOD: 'medium',
      enableAutoRotate: false,
      enableEnvironmentMap: true, // Low-res environment
      maxMorphTargets: 25,
      throttleControlsMs: 50 // 20 updates per second
    };
  } else if (isMobile && performanceLevel === 'high') {
    // NOUVEAU: Configuration pour mobiles hauts de gamme (iPhone 13+, Galaxy S21+)
    config = {
      pixelRatio: Math.min(devicePixelRatio, 1.5), // AMÉLIORÉ: 1.5x max pour excellent rendu
      shadowsEnabled: false, // Toujours désactivé sur mobile pour batterie
      shadowMapSize: 0,
      maxLights: 5, // Plus de lumières pour meilleure qualité
      targetFPS: 60, // 60 FPS possible sur hauts de gamme
      enablePostProcessing: false, // Sera ajouté dans une prochaine étape
      enableProceduralTextures: true, // Meilleurs matériaux
      textureQuality: 'high',
      geometryLOD: 'high',
      enableAutoRotate: false,
      enableEnvironmentMap: true, // Environment map haute qualité
      maxMorphTargets: 40,
      throttleControlsMs: 16 // 60 updates per second
    };
  } else if (capabilities.isTablet) {
    // Configuration pour tablettes
    config = {
      pixelRatio: Math.min(devicePixelRatio, 1.5),
      shadowsEnabled: performanceLevel === 'high',
      shadowMapSize: 1024,
      maxLights: 6,
      targetFPS: 60,
      enablePostProcessing: false,
      enableProceduralTextures: performanceLevel === 'high',
      textureQuality: performanceLevel === 'high' ? 'high' : 'medium',
      geometryLOD: performanceLevel === 'high' ? 'high' : 'medium',
      enableAutoRotate: true,
      enableEnvironmentMap: true,
      maxMorphTargets: 40,
      throttleControlsMs: 16 // 60 updates per second
    };
  } else {
    // Configuration pour desktop (haute performance)
    config = {
      pixelRatio: Math.min(devicePixelRatio, 2),
      shadowsEnabled: true,
      shadowMapSize: 2048,
      maxLights: 10, // All lights
      targetFPS: 60,
      enablePostProcessing: true,
      enableProceduralTextures: true,
      textureQuality: 'high',
      geometryLOD: 'high',
      enableAutoRotate: true,
      enableEnvironmentMap: true,
      maxMorphTargets: -1, // All morphs
      throttleControlsMs: 16
    };
  }

  logger.info('MOBILE_DETECTION', 'Performance config generated', {
    performanceLevel,
    isMobile,
    isLowEndDevice,
    config,
    philosophy: 'performance_config_optimization'
  });

  return config;
}

/**
 * Classe pour monitorer les performances en temps réel
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private currentFPS = 60;
  private fpsHistory: number[] = [];
  private readonly maxHistoryLength = 60; // 1 second at 60fps
  private isOverheating = false;

  /**
   * Met à jour le compteur FPS
   */
  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsHistory.push(this.currentFPS);

      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = currentTime;

      // Check for overheating (sustained low FPS)
      if (this.fpsHistory.length >= 30) {
        const recentAverage = this.fpsHistory.slice(-30).reduce((a, b) => a + b, 0) / 30;
        this.isOverheating = recentAverage < 20; // Less than 20 FPS = overheating
      }
    }
  }

  /**
   * Obtient le FPS actuel
   */
  getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Obtient le FPS moyen sur la période récente
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  /**
   * Vérifie si l'appareil surchauffe
   */
  isDeviceOverheating(): boolean {
    return this.isOverheating;
  }

  /**
   * Réinitialise les statistiques
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.currentFPS = 60;
    this.fpsHistory = [];
    this.isOverheating = false;
  }
}
