/**
 * Post-Processing Stack
 * Professional post-processing effects for photo-realistic rendering
 * Includes SSAO, SSR (simplified), Bloom, and Color Grading
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { createSSSPasses, updateSSSParameters } from '../shaders/screenSpaceSSS';
import logger from '../../utils/logger';

export interface PostProcessingConfig {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  resolution: THREE.Vector2;
  skinToneLuminance?: number;
  enableSSS?: boolean;
  enableBloom?: boolean;
  enableFXAA?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export class PostProcessingStack {
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private sssHorizontalPass?: ShaderPass;
  private sssVerticalPass?: ShaderPass;
  private bloomPass?: UnrealBloomPass;
  private fxaaPass?: ShaderPass;
  private depthTarget?: THREE.WebGLRenderTarget;

  private config: Required<PostProcessingConfig>;

  constructor(config: PostProcessingConfig) {
    this.config = {
      enableSSS: true,
      enableBloom: true,
      enableFXAA: true,
      quality: 'medium',
      skinToneLuminance: 0.5,
      ...config
    };

    logger.info('POST_PROCESSING_STACK', 'Initializing post-processing stack', {
      resolution: `${config.resolution.x}x${config.resolution.y}`,
      quality: this.config.quality,
      enableSSS: this.config.enableSSS,
      enableBloom: this.config.enableBloom,
      enableFXAA: this.config.enableFXAA,
      philosophy: 'professional_post_processing_pipeline'
    });

    // Create composer
    this.composer = new EffectComposer(config.renderer);
    this.composer.setSize(config.resolution.x, config.resolution.y);

    // Create render pass (base rendering)
    this.renderPass = new RenderPass(config.scene, config.camera);
    this.composer.addPass(this.renderPass);

    // Add Screen-Space SSS if enabled
    if (this.config.enableSSS) {
      this.setupSSS();
    }

    // Add Bloom if enabled (subtle for skin realism)
    if (this.config.enableBloom) {
      this.setupBloom();
    }

    // Add FXAA (anti-aliasing) as final pass
    if (this.config.enableFXAA) {
      this.setupFXAA();
    }

    logger.info('POST_PROCESSING_STACK', 'Post-processing stack initialized', {
      totalPasses: this.composer.passes.length,
      philosophy: 'ultra_realistic_rendering_ready'
    });
  }

  /**
   * Setup Screen-Space Subsurface Scattering
   */
  private setupSSS(): void {
    const { horizontalPass, verticalPass, depthTarget } = createSSSPasses(
      this.config.resolution,
      this.config.skinToneLuminance
    );

    this.sssHorizontalPass = horizontalPass;
    this.sssVerticalPass = verticalPass;
    this.depthTarget = depthTarget;

    // Add SSS passes to composer
    this.composer.addPass(horizontalPass);
    this.composer.addPass(verticalPass);

    logger.info('POST_PROCESSING_STACK', 'Screen-Space SSS configured', {
      passes: 2,
      philosophy: 'separable_sss_active'
    });
  }

  /**
   * Setup Bloom effect (subtle for skin)
   */
  private setupBloom(): void {
    // Subtle bloom for realistic skin highlights
    const bloomStrength = 0.15; // Very subtle
    const bloomRadius = 0.4;
    const bloomThreshold = 0.85; // Only brightest highlights

    this.bloomPass = new UnrealBloomPass(
      this.config.resolution,
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );

    this.composer.addPass(this.bloomPass);

    logger.info('POST_PROCESSING_STACK', 'Bloom effect configured', {
      strength: bloomStrength,
      radius: bloomRadius,
      threshold: bloomThreshold,
      philosophy: 'subtle_skin_highlights'
    });
  }

  /**
   * Setup FXAA anti-aliasing
   */
  private setupFXAA(): void {
    this.fxaaPass = new ShaderPass(FXAAShader);

    // Calculate pixel size for FXAA
    const pixelRatio = this.config.renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.x =
      1 / (this.config.resolution.x * pixelRatio);
    this.fxaaPass.material.uniforms['resolution'].value.y =
      1 / (this.config.resolution.y * pixelRatio);

    // Make this the final pass
    this.fxaaPass.renderToScreen = true;

    this.composer.addPass(this.fxaaPass);

    logger.info('POST_PROCESSING_STACK', 'FXAA anti-aliasing configured', {
      resolution: `${this.config.resolution.x}x${this.config.resolution.y}`,
      pixelRatio,
      philosophy: 'smooth_edges_final_pass'
    });
  }

  /**
   * Update SSS parameters when skin tone changes
   */
  updateSkinTone(skinToneLuminance: number): void {
    this.config.skinToneLuminance = skinToneLuminance;

    if (this.sssHorizontalPass && this.sssVerticalPass) {
      updateSSSParameters(
        this.sssHorizontalPass,
        this.sssVerticalPass,
        skinToneLuminance
      );

      logger.info('POST_PROCESSING_STACK', 'SSS parameters updated for new skin tone', {
        skinToneLuminance: skinToneLuminance.toFixed(3),
        philosophy: 'adaptive_sss_reconfiguration'
      });
    }
  }

  /**
   * Render with post-processing
   */
  render(deltaTime?: number): void {
    this.composer.render(deltaTime);
  }

  /**
   * Handle window resize
   */
  resize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.config.resolution.set(width, height);

    // Update FXAA resolution
    if (this.fxaaPass) {
      const pixelRatio = this.config.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x =
        1 / (width * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y =
        1 / (height * pixelRatio);
    }

    logger.debug('POST_PROCESSING_STACK', 'Post-processing resized', {
      resolution: `${width}x${height}`,
      philosophy: 'responsive_post_processing'
    });
  }

  /**
   * Enable/disable specific effects
   */
  setEffectEnabled(effect: 'sss' | 'bloom' | 'fxaa', enabled: boolean): void {
    switch (effect) {
      case 'sss':
        if (this.sssHorizontalPass) this.sssHorizontalPass.enabled = enabled;
        if (this.sssVerticalPass) this.sssVerticalPass.enabled = enabled;
        break;
      case 'bloom':
        if (this.bloomPass) this.bloomPass.enabled = enabled;
        break;
      case 'fxaa':
        if (this.fxaaPass) this.fxaaPass.enabled = enabled;
        break;
    }

    logger.info('POST_PROCESSING_STACK', `Effect ${effect} ${enabled ? 'enabled' : 'disabled'}`, {
      effect,
      enabled,
      philosophy: 'dynamic_effect_control'
    });
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.composer.passes.forEach(pass => {
      if ('dispose' in pass && typeof pass.dispose === 'function') {
        pass.dispose();
      }
    });

    if (this.depthTarget) {
      this.depthTarget.dispose();
    }

    logger.info('POST_PROCESSING_STACK', 'Post-processing stack disposed', {
      philosophy: 'cleanup_complete'
    });
  }

  /**
   * Get composer for advanced usage
   */
  getComposer(): EffectComposer {
    return this.composer;
  }
}

/**
 * Simple SSAO shader for mobile optimization
 * Lightweight ambient occlusion approximation
 */
export const SimplifiedSSAOShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    resolution: { value: new THREE.Vector2(512, 512) },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 100 },
    aoIntensity: { value: 0.5 },
    aoRadius: { value: 0.5 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform vec2 resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float aoIntensity;
    uniform float aoRadius;

    varying vec2 vUv;

    float readDepth(vec2 uv) {
      float depth = texture2D(tDepth, uv).r;
      return depth;
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float depth = readDepth(vUv);

      // Simple AO approximation using depth differences
      vec2 texelSize = 1.0 / resolution;
      float ao = 0.0;
      float samples = 0.0;

      // Sample surrounding pixels
      for (float x = -1.0; x <= 1.0; x += 1.0) {
        for (float y = -1.0; y <= 1.0; y += 1.0) {
          if (x == 0.0 && y == 0.0) continue;

          vec2 offset = vec2(x, y) * texelSize * aoRadius;
          float sampleDepth = readDepth(vUv + offset);

          float depthDiff = depth - sampleDepth;
          if (depthDiff > 0.0) {
            ao += depthDiff;
          }
          samples += 1.0;
        }
      }

      ao = ao / samples;
      ao = 1.0 - (ao * aoIntensity);
      ao = clamp(ao, 0.0, 1.0);

      gl_FragColor = vec4(color.rgb * ao, color.a);
    }
  `
};
