/**
 * Device Performance Detection Service
 * Détecte automatiquement les capacités du device et recommande le mode optimal
 */

import logger from '../../lib/utils/logger';

export type PerformanceMode = 'high-performance' | 'balanced' | 'quality';
export type DeviceCategory = 'flagship' | 'mid-range' | 'budget' | 'legacy';

export interface DeviceSpecs {
  memoryGB: number;
  cores: number;
  isMobile: boolean;
  isTablet: boolean;
  supportsHover: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  gpuTier: 'high' | 'medium' | 'low' | 'unknown';
  estimatedYear: number;
  deviceModel: string;
}

export interface PerformanceRecommendation {
  recommendedMode: PerformanceMode;
  deviceCategory: DeviceCategory;
  deviceSpecs: DeviceSpecs;
  performanceScore: number;
  shouldShowAlert: boolean;
  reasons: string[];
}

class DevicePerformanceDetectionService {
  /**
   * Détecte les specs complètes du device
   */
  private detectDeviceSpecs(): DeviceSpecs {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const memoryGB = (navigator as any).deviceMemory || this.estimateMemory();
    const cores = navigator.hardwareConcurrency || 4;

    const connection = (navigator as any).connection;
    let connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';

    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionSpeed = 'slow';
      } else if (effectiveType === '3g') {
        connectionSpeed = 'medium';
      } else if (effectiveType === '4g' || effectiveType === '5g') {
        connectionSpeed = 'fast';
      }
    }

    const gpuTier = this.detectGPUTier();
    const { estimatedYear, deviceModel } = this.detectDeviceModel();

    return {
      memoryGB,
      cores,
      isMobile,
      isTablet,
      supportsHover,
      screenWidth: width,
      screenHeight: height,
      devicePixelRatio: dpr,
      connectionSpeed,
      gpuTier,
      estimatedYear,
      deviceModel,
    };
  }

  /**
   * Estime la mémoire RAM si l'API n'est pas disponible
   */
  private estimateMemory(): number {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);

    if (isMobile) {
      if (/iphone 1[5-9]|iphone 2\d/i.test(ua)) return 8;
      if (/iphone 1[2-4]/i.test(ua)) return 6;
      if (/iphone [8-9]|iphone 1[0-1]|iphone x/i.test(ua)) return 3;
      if (/iphone [5-7]/i.test(ua)) return 2;
      return 4;
    }

    return 8;
  }

  /**
   * Détecte le tier GPU via WebGL
   */
  private detectGPUTier(): 'high' | 'medium' | 'low' | 'unknown' {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) return 'unknown';

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'medium';

      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

      if (/apple|nvidia|adreno [6-9]|mali-g[7-9]|immortalis/i.test(renderer)) {
        return 'high';
      }
      if (/adreno [4-5]|mali-g[5-6]|powervr/i.test(renderer)) {
        return 'medium';
      }
      if (/adreno [2-3]|mali-[4t]/i.test(renderer)) {
        return 'low';
      }

      return 'medium';
    } catch (error) {
      logger.error('DEVICE_DETECTION', 'Failed to detect GPU', { error });
      return 'unknown';
    }
  }

  /**
   * Détecte le modèle de device et estime l'année
   */
  private detectDeviceModel(): { estimatedYear: number; deviceModel: string } {
    const ua = navigator.userAgent;
    let estimatedYear = new Date().getFullYear();
    let deviceModel = 'Unknown Device';

    const iPhoneMatch = ua.match(/iPhone(\d+),(\d+)/);
    if (iPhoneMatch) {
      const major = parseInt(iPhoneMatch[1]);
      deviceModel = `iPhone (Model ${major},${iPhoneMatch[2]})`;

      if (major >= 16) estimatedYear = 2024;
      else if (major >= 14) estimatedYear = 2022;
      else if (major >= 13) estimatedYear = 2021;
      else if (major >= 12) estimatedYear = 2020;
      else if (major >= 11) estimatedYear = 2018;
      else if (major >= 10) estimatedYear = 2017;
      else estimatedYear = 2016;
    }

    const iPadMatch = ua.match(/iPad(\d+),(\d+)/);
    if (iPadMatch) {
      const major = parseInt(iPadMatch[1]);
      deviceModel = `iPad (Model ${major},${iPadMatch[2]})`;

      if (major >= 14) estimatedYear = 2023;
      else if (major >= 13) estimatedYear = 2021;
      else if (major >= 11) estimatedYear = 2020;
      else estimatedYear = 2018;
    }

    const androidMatch = ua.match(/Android\s([\d.]+)/);
    if (androidMatch && !iPhoneMatch && !iPadMatch) {
      const version = parseFloat(androidMatch[1]);
      deviceModel = `Android ${version}`;

      if (version >= 14) estimatedYear = 2024;
      else if (version >= 13) estimatedYear = 2023;
      else if (version >= 12) estimatedYear = 2022;
      else if (version >= 11) estimatedYear = 2021;
      else estimatedYear = 2020;
    }

    return { estimatedYear, deviceModel };
  }

  /**
   * Calcule un score de performance de 0 à 100
   */
  private calculatePerformanceScore(specs: DeviceSpecs): number {
    let score = 0;

    score += Math.min(specs.memoryGB * 10, 30);
    score += Math.min(specs.cores * 3, 20);

    if (specs.gpuTier === 'high') score += 20;
    else if (specs.gpuTier === 'medium') score += 12;
    else if (specs.gpuTier === 'low') score += 5;
    else score += 8;

    const deviceAge = new Date().getFullYear() - specs.estimatedYear;
    if (deviceAge <= 1) score += 15;
    else if (deviceAge <= 2) score += 12;
    else if (deviceAge <= 3) score += 8;
    else if (deviceAge <= 4) score += 4;

    if (!specs.isMobile) score += 10;
    else if (specs.isTablet) score += 5;

    if (specs.connectionSpeed === 'fast') score += 5;
    else if (specs.connectionSpeed === 'medium') score += 3;

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Détermine la catégorie du device
   */
  private categorizeDevice(score: number, specs: DeviceSpecs): DeviceCategory {
    const deviceAge = new Date().getFullYear() - specs.estimatedYear;

    if (score >= 80 && deviceAge <= 2) return 'flagship';
    if (score >= 60 && deviceAge <= 3) return 'mid-range';
    if (score >= 40 || deviceAge <= 5) return 'budget';
    return 'legacy';
  }

  /**
   * Recommande le mode optimal basé sur le score et les specs
   */
  private recommendMode(score: number, specs: DeviceSpecs, category: DeviceCategory): PerformanceMode {
    const deviceAge = new Date().getFullYear() - specs.estimatedYear;

    if (specs.isMobile && deviceAge >= 5) {
      return 'high-performance';
    }

    if (category === 'legacy' || score < 40) {
      return 'high-performance';
    }

    if (category === 'budget' || (score >= 40 && score < 60)) {
      return 'high-performance';
    }

    if (category === 'mid-range' || (score >= 60 && score < 80)) {
      return 'balanced';
    }

    if (specs.isMobile && score >= 70) {
      return 'balanced';
    }

    return 'quality';
  }

  /**
   * Génère les raisons pour la recommandation
   */
  private generateReasons(mode: PerformanceMode, specs: DeviceSpecs, score: number): string[] {
    const reasons: string[] = [];
    const deviceAge = new Date().getFullYear() - specs.estimatedYear;

    if (mode === 'high-performance') {
      if (deviceAge >= 5) {
        reasons.push(`Votre appareil a ${deviceAge} ans - optimisation recommandée`);
      }
      if (specs.memoryGB < 4) {
        reasons.push(`RAM limitée (${specs.memoryGB}GB) - fluidité prioritaire`);
      }
      if (specs.cores < 4) {
        reasons.push(`Processeur limité (${specs.cores} cœurs) - performance maximale`);
      }
      if (specs.gpuTier === 'low') {
        reasons.push('GPU peu puissant - effets visuels désactivés');
      }
      if (specs.isMobile) {
        reasons.push('Mobile détecté - optimisation batterie et fluidité');
      }
    } else if (mode === 'balanced') {
      reasons.push('Configuration équilibrée détectée');
      reasons.push('Bon compromis entre performance et design');
      if (specs.isMobile) {
        reasons.push('Optimisé pour mobile avec effets essentiels');
      }
    } else {
      reasons.push('Appareil performant détecté - expérience premium disponible');
      reasons.push('Tous les effets visuels activés');
      if (!specs.isMobile) {
        reasons.push('Desktop - rendu haute qualité optimal');
      }
    }

    return reasons;
  }

  /**
   * Détermine si l'alerte doit être affichée
   */
  private shouldShowAlert(mode: PerformanceMode, category: DeviceCategory, score: number): boolean {
    if (mode === 'high-performance' && (category === 'legacy' || category === 'budget')) {
      return true;
    }

    if (score < 50) {
      return true;
    }

    return false;
  }

  /**
   * Analyse complète et génère une recommandation
   */
  public analyzeDevice(): PerformanceRecommendation {
    logger.info('DEVICE_DETECTION', 'Starting device analysis');

    const specs = this.detectDeviceSpecs();
    const score = this.calculatePerformanceScore(specs);
    const category = this.categorizeDevice(score, specs);
    const recommendedMode = this.recommendMode(score, specs, category);
    const shouldShowAlert = this.shouldShowAlert(recommendedMode, category, score);
    const reasons = this.generateReasons(recommendedMode, specs, score);

    const recommendation: PerformanceRecommendation = {
      recommendedMode,
      deviceCategory: category,
      deviceSpecs: specs,
      performanceScore: score,
      shouldShowAlert,
      reasons,
    };

    logger.info('DEVICE_DETECTION', 'Device analysis complete', {
      category,
      score,
      recommendedMode,
      shouldShowAlert,
    });

    return recommendation;
  }

  /**
   * Obtient une description lisible de la catégorie
   */
  public getCategoryLabel(category: DeviceCategory): string {
    const labels: Record<DeviceCategory, string> = {
      flagship: 'Haut de gamme',
      'mid-range': 'Milieu de gamme',
      budget: 'Entrée de gamme',
      legacy: 'Ancien modèle',
    };
    return labels[category];
  }

  /**
   * Obtient une description lisible du mode
   */
  public getModeLabel(mode: PerformanceMode): string {
    const labels: Record<PerformanceMode, string> = {
      'high-performance': 'Performance Maximale',
      balanced: 'Équilibré',
      quality: 'Qualité Premium',
    };
    return labels[mode];
  }
}

export const devicePerformanceDetectionService = new DevicePerformanceDetectionService();
