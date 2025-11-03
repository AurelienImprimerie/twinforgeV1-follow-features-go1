export class PerformanceMonitoring {
  private static instance: PerformanceMonitoring;
  private fpsHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private isMonitoring: boolean = false;
  private rafId: number | null = null;

  private constructor() {}

  static getInstance(): PerformanceMonitoring {
    if (!PerformanceMonitoring.instance) {
      PerformanceMonitoring.instance = new PerformanceMonitoring();
    }
    return PerformanceMonitoring.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.measureFPS();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private measureFPS(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const delta = now - this.lastFrameTime;
    const fps = 1000 / delta;

    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    this.lastFrameTime = now;
    this.rafId = requestAnimationFrame(() => this.measureFPS());
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  isPerformanceGood(): boolean {
    return this.getAverageFPS() >= 50;
  }

  shouldReduceEffects(): boolean {
    return this.getAverageFPS() < 40;
  }
}

export const detectDeviceCapabilities = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isTablet = /(iPad|Android(?!.*Mobile))/i.test(navigator.userAgent);

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const isSaveData = connection?.saveData || false;
  const isSlowConnection = connection?.effectiveType ? ['slow-2g', '2g', '3g'].includes(connection.effectiveType) : false;

  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const isLowEndCPU = hardwareConcurrency < 4;

  const deviceMemory = (navigator as any).deviceMemory;
  const isLowMemory = deviceMemory ? deviceMemory < 4 : false;

  const supportsWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  })();

  const gpuTier = (() => {
    if (!supportsWebGL) return 'low';
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return 'low';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'medium';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

    if (renderer.includes('nvidia') || renderer.includes('radeon') || renderer.includes('geforce')) {
      return 'high';
    } else if (renderer.includes('intel')) {
      return 'medium';
    }
    return 'low';
  })();

  const isLowEndDevice = isLowEndCPU || isLowMemory || gpuTier === 'low';
  const shouldReduceAnimations = isSaveData || isSlowConnection || isLowEndDevice;

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isSaveData,
    isSlowConnection,
    isLowEndCPU,
    isLowMemory,
    isLowEndDevice,
    shouldReduceAnimations,
    gpuTier,
    hardwareConcurrency,
    deviceMemory,
    supportsWebGL,
  };
};

export const getBatteryInfo = async () => {
  if (!('getBattery' in navigator)) {
    return { level: 1, charging: true, available: false };
  }

  try {
    const battery = await (navigator as any).getBattery();
    return {
      level: battery.level,
      charging: battery.charging,
      available: true,
    };
  } catch {
    return { level: 1, charging: true, available: false };
  }
};

export const shouldEnableScrollReveal = async () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return false;

  const capabilities = detectDeviceCapabilities();
  if (capabilities.shouldReduceAnimations) return false;

  const battery = await getBatteryInfo();
  if (battery.available && !battery.charging && battery.level < 0.2) {
    return false;
  }

  return true;
};
