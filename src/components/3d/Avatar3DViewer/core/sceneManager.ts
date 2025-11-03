import * as THREE from 'three';
import { OrbitTouchControls } from '../../../../lib/3d/camera/OrbitTouchControls';
import { setupLighting } from '../../../../lib/3d/setup/lightingSetup';
import { setupAdaptiveLighting } from '../../../../lib/3d/setup/lightingSetupMobile';
import { setupStudioEnvironment, calculateEnvMapIntensity } from '../../../../lib/3d/setup/environmentSetup';
import logger from '../../../../lib/utils/logger';
import { detectDeviceCapabilities, getOptimalPerformanceConfig, type PerformanceConfig } from '../../../../lib/3d/performance/mobileDetection';
import { deviceCapabilityManager } from '../../../../lib/device/deviceCapabilityManager';

export interface SceneInstance {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitTouchControls;
  containerId: string;
}


interface SceneCreationOptions {
  container: HTMLDivElement;
  finalGender: 'male' | 'female';
  faceOnly?: boolean;
  serverScanId?: string;
  performanceConfig?: PerformanceConfig; // ADDED: Optional performance config override
}

/**
 * Create complete Three.js scene with renderer, camera, and controls
 */
export function createScene(options: SceneCreationOptions): SceneInstance {
  const { container, finalGender, faceOnly, serverScanId, performanceConfig: customConfig } = options;

  // MOBILE OPTIMIZATION: Use unified deviceCapabilityManager for consistent performance detection
  const globalCapabilities = deviceCapabilityManager.getCapabilities();
  const deviceCapabilities = detectDeviceCapabilities();
  const performanceConfig = customConfig || getOptimalPerformanceConfig(deviceCapabilities);

  logger.info('SCENE_MANAGER', 'Creating Three.js scene with unified performance optimizations', {
    gender: finalGender,
    faceOnly,
    serverScanId,
    containerSize: { width: container.clientWidth, height: container.clientHeight },
    deviceType: deviceCapabilities.type,
    globalPerformanceLevel: globalCapabilities.performanceLevel,
    localPerformanceLevel: deviceCapabilities.performanceLevel,
    isMobile: deviceCapabilities.isMobile,
    isLowEndDevice: deviceCapabilities.isLowEndDevice,
    optimizedPixelRatio: performanceConfig.pixelRatio,
    shadowsEnabled: performanceConfig.shadowsEnabled,
    maxLights: performanceConfig.maxLights,
    targetFPS: performanceConfig.targetFPS,
    philosophy: 'unified_performance_management'
  });

  // MOBILE OPTIMIZATION: Create renderer with adaptive settings
  // AMÉLIORATION: Activer l'antialiasing sur mobiles hauts de gamme
  const enableAntialias = deviceCapabilities.isDesktop ||
    (deviceCapabilities.isMobile && deviceCapabilities.performanceLevel === 'high');

  const renderer = new THREE.WebGLRenderer({
    antialias: enableAntialias, // AMÉLIORÉ: Antialiasing sur hauts de gamme
    alpha: true,
    powerPreference: deviceCapabilities.isMobile ? 'default' : 'high-performance', // Battery-friendly on mobile
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
  });

  renderer.setSize(container.clientWidth, container.clientHeight);

  // CRITICAL: Use optimized pixelRatio from performance config (1 on mobile)
  renderer.setPixelRatio(performanceConfig.pixelRatio);

  // CRITICAL: Disable shadows on mobile for massive performance gain
  renderer.shadowMap.enabled = performanceConfig.shadowsEnabled;
  if (performanceConfig.shadowsEnabled) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = deviceCapabilities.isMobile ? THREE.LinearToneMapping : THREE.ACESFilmicToneMapping; // Simpler tone mapping on mobile
  renderer.toneMappingExposure = 1.25;
  renderer.physicallyCorrectLights = !deviceCapabilities.isMobile; // Disable expensive calculations on mobile

  // Store performance config on renderer for later access
  (renderer as any)._performanceConfig = performanceConfig;
  (renderer as any)._deviceCapabilities = deviceCapabilities;
  
  container.appendChild(renderer.domElement);

  // Create scene
  const scene = new THREE.Scene();
  scene.background = null; // MODIFIÉ : Définir le fond de la scène à null pour qu'il soit transparent

  // MOBILE OPTIMIZATION: Replace expensive rotating GridHelper with lightweight shadow
  if (!faceOnly) {
    if (deviceCapabilities.isMobile) {
      // Mobile: Use lightweight circular shadow plane (non-rotating)
      const shadowGeometry = new THREE.CircleGeometry(0.5, 32);
      const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadowMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      shadowMesh.position.y = 0.01; // Slightly above ground
      shadowMesh.name = 'avatar-shadow'; // Name for easy identification
      scene.add(shadowMesh);

      logger.info('SCENE_MANAGER', 'Lightweight shadow added for mobile (non-rotating)', {
        philosophy: 'mobile_optimization_static_shadow',
        shadowRadius: 0.5,
        gpuFriendly: true
      });
    } else {
      // Desktop: Keep grid helper for reference
      const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      gridHelper.position.y = -0.1;
      scene.add(gridHelper);

      logger.info('SCENE_MANAGER', 'Grid helper added (desktop only)', {
        philosophy: 'desktop_debug_grid'
      });
    }
  }

  // Create camera with optimized FOV
  const fov = faceOnly ? 35 : 40; // Plus serré pour le visage pour réduire distorsion
  const camera = new THREE.PerspectiveCamera(
    fov,
    container.clientWidth / container.clientHeight,
    0.01, // Closer near plane
    100   // Adjusted far plane
  );
  
  // Enhanced responsive camera positioning
  const containerAspect = container.clientWidth / container.clientHeight;
  const isWideScreen = containerAspect > 1.5;
  const isTallScreen = containerAspect < 0.8;
  
  // Adjust initial camera position based on mode and aspect ratio
  let initialDistance: number;
  let initialHeight: number;

  if (faceOnly) {
    // Position optimisée pour le visage uniquement (tête et cou)
    initialDistance = 0.65;  // 65 cm de distance - plus proche pour cadrage tête/cou
    initialHeight = 1.65;    // Légèrement plus haut pour centrer sur le visage
  } else {
    // Position pour le corps entier
    initialDistance = isWideScreen ? 3.8 : isTallScreen ? 3.2 : 3.5;
    initialHeight = isWideScreen ? 0.8 : isTallScreen ? 0.6 : 0.7;
  }

  camera.position.set(0, initialHeight, initialDistance);

  // Create controls
  const controls = new OrbitTouchControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = false; // Pan is generally not needed for avatar viewing
  
  if (faceOnly) {
    // Distances optimisées pour cadrage tête/cou uniquement
    controls.minDistance = 0.4;  // 40 cm - évite distorsion extrême
    controls.maxDistance = 1.2;  // 1.2 m - limite pour garder focus sur visage
  } else {
    // Enhanced responsive control limits for full body
    controls.minDistance = isWideScreen ? 2.2 : isTallScreen ? 1.8 : 2.0;
    controls.maxDistance = isWideScreen ? 12 : isTallScreen ? 10 : 11;
  }
  if (faceOnly) {
    // Mode visage: limiter la rotation pour garder le focus sur tête et cou
    controls.minPolarAngle = Math.PI * 0.35;  // Empêche vue du dessous
    controls.maxPolarAngle = Math.PI * 0.65;  // Empêche vue du dessus extrême
    controls.setTarget(new THREE.Vector3(0, 1.65, 0)); // Cibler le centre du visage
  } else {
    controls.minPolarAngle = Math.PI * 0.05; // Allow more upward viewing
    controls.maxPolarAngle = Math.PI * 0.95; // Allow more downward viewing
    controls.setTarget(new THREE.Vector3(0, 1.0, 0)); // Higher target for full body view
  }

  // MOBILE OPTIMIZATION: Setup adaptive lighting based on device capabilities
  if (deviceCapabilities.isMobile || deviceCapabilities.isTablet) {
    setupAdaptiveLighting(scene, {
      performanceLevel: deviceCapabilities.performanceLevel,
      maxLights: performanceConfig.maxLights,
      enableShadows: performanceConfig.shadowsEnabled
    });
  } else {
    // Desktop: Use full lighting system
    setupLighting(scene);
  }

  // MOBILE OPTIMIZATION: Setup environment only if enabled in performance config
  if (performanceConfig.enableEnvironmentMap) {
    setupStudioEnvironment(scene, renderer);
    logger.info('SCENE_MANAGER', 'IBL environment configured', {
      hasEnvironment: !!scene.environment,
      philosophy: 'photo_realistic_ibl_active'
    });
  } else {
    logger.info('SCENE_MANAGER', 'IBL environment skipped for mobile performance', {
      philosophy: 'mobile_no_environment_map'
    });
  }


  // Store renderer and camera globally for material compilation
  (window as any).__THREE_RENDERER__ = renderer;
  (window as any).__THREE_CAMERA__ = camera;
  (window as any).__THREE_SCENE__ = scene;

  const sceneInstance: SceneInstance = {
    renderer,
    scene,
    camera,
    controls,
    containerId: `viewer_${Date.now()}`
  };

  logger.info('SCENE_MANAGER', 'Scene creation completed', {
    containerId: sceneInstance.containerId,
    serverScanId,
    philosophy: 'core_scene_created'
  });

  return sceneInstance;
}

/**
 * Create resize handler for scene
 */
export function createResizeHandler(
  container: HTMLDivElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): () => void {
  return () => {
    if (!container || !camera || !renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
}

/**
 * Start animation loop with mobile optimizations
 * MOBILE OPTIMIZATION: FPS throttling and pause when not visible
 */
export function startAnimationLoop(
  sceneInstance: SceneInstance,
  autoRotate: boolean = false,
  onFirstFrame?: () => void
): () => void {
  const { scene, renderer, camera, controls } = sceneInstance;
  let firstFrameRendered = false;
  let animationId: number | null = null;
  let isPaused = false;

  // Get performance config from renderer
  const performanceConfig = (renderer as any)._performanceConfig;
  const deviceCapabilities = (renderer as any)._deviceCapabilities;
  const targetFPS = performanceConfig?.targetFPS || 60;
  const frameInterval = 1000 / targetFPS; // ms per frame
  let lastFrameTime = performance.now();

  controls.setAutoRotate(autoRotate);

  // MOBILE OPTIMIZATION: Pause rendering when page is not visible
  const handleVisibilityChange = () => {
    if (document.hidden) {
      isPaused = true;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      logger.info('SCENE_MANAGER', 'Animation loop paused (page hidden)', {
        philosophy: 'mobile_battery_optimization'
      });
    } else {
      isPaused = false;
      lastFrameTime = performance.now(); // Reset timing
      animationId = requestAnimationFrame(animate);
      logger.info('SCENE_MANAGER', 'Animation loop resumed (page visible)', {
        philosophy: 'mobile_resume_rendering'
      });
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // MOBILE OPTIMIZATION: FPS-throttled animation loop
  const animate = (currentTime: number) => {
    if (isPaused) return;

    animationId = requestAnimationFrame(animate);

    // FPS throttling for mobile devices
    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) {
      return; // Skip this frame
    }

    // Update lastFrameTime for next frame
    lastFrameTime = currentTime - (elapsed % frameInterval);

    controls.update();
    renderer.render(scene, camera);

    // Track first frame rendered
    if (!firstFrameRendered) {
      firstFrameRendered = true;
      onFirstFrame?.();
    }
  };

  animationId = requestAnimationFrame(animate);

  logger.info('SCENE_MANAGER', 'Animation loop started with mobile optimizations', {
    autoRotate,
    containerId: sceneInstance.containerId,
    isMobile: deviceCapabilities?.isMobile,
    targetFPS,
    frameInterval,
    philosophy: 'mobile_optimized_animation_loop'
  });

  // Return cleanup function
  return () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    isPaused = true;

    logger.info('SCENE_MANAGER', 'Animation loop stopped and cleaned up', {
      philosophy: 'animation_loop_cleanup'
    });
  };
}

/**
 * Dispose of all scene resources
 */
export function disposeSceneResources(sceneInstance: SceneInstance): void {
  const { renderer, scene, controls } = sceneInstance;

  logger.info('SCENE_MANAGER', 'Starting scene resource disposal', {
    containerId: sceneInstance.containerId,
    philosophy: 'core_resource_cleanup'
  });

  // Dispose controls
  if (controls) {
    controls.dispose();
  }

  // Dispose scene resources
  if (scene) {
    scene.traverse((obj: THREE.Object3D) => {
      // Dispose geometries
      const geometry = (obj as any).geometry;
      if (geometry) {
        geometry.dispose();
      }

      // Dispose materials
      const material = (obj as any).material;
      if (material) {
        const materials = Array.isArray(material) ? material : [material];
        materials.forEach((mat: THREE.Material) => {
          // Dispose textures
          Object.values(mat).forEach((value: any) => {
            if (value && typeof value.dispose === 'function') {
              value.dispose();
            }
          });
          mat.dispose();
        });
      }
    });
    scene.clear();
  }

  // Force WebGL context loss and dispose renderer
  if (renderer) {
    const gl = renderer.getContext() as WebGLRenderingContext;
    const loseContextExt = gl.getExtension('WEBGL_lose_context');
    
    renderer.dispose();
    
    if (loseContextExt) {
      loseContextExt.loseContext();
    }

    // Remove DOM element
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    // Cleanup global references
    const cleanup = (renderer as any)._cleanup;
    if (cleanup) {
      cleanup();
    }
  }

  // Clear global references
  delete (window as any).__THREE_RENDERER__;
  delete (window as any).__THREE_CAMERA__;
  delete (window as any).__THREE_SCENE__;

  logger.info('SCENE_MANAGER', 'Scene resource disposal completed', {
    containerId: sceneInstance.containerId,
    philosophy: 'core_webgl_context_freed'
  });
}
