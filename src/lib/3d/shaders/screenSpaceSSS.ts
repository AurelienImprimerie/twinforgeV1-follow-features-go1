/**
 * Screen-Space Subsurface Scattering (SSSS)
 * Based on Jorge Jimenez 2011 technique (Separable SSS)
 * Industry standard used by UE4/UE5 and AAA games
 */

import * as THREE from 'three';
import logger from '../../utils/logger';

/**
 * SSS Blur Shader - Separable Gaussian blur for subsurface scattering
 * Performs directional blur in screen space to simulate light diffusion through skin
 */
export const SSSBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    resolution: { value: new THREE.Vector2(512, 512) },
    direction: { value: new THREE.Vector2(1.0, 0.0) },
    sssWidth: { value: 0.012 },
    kernelRadius: { value: 13 },
    distanceToProjectionWindow: { value: 5.0 },
    // Skin tone specific
    translucency: { value: 0.8 },
    ambient: { value: new THREE.Vector3(0.3, 0.3, 0.3) },
    // Adaptive SSS based on skin tone
    scatterColor: { value: new THREE.Vector3(1.0, 0.4, 0.3) }, // Red channel scatters most
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
    uniform vec2 direction;
    uniform float sssWidth;
    uniform int kernelRadius;
    uniform float distanceToProjectionWindow;
    uniform float translucency;
    uniform vec3 ambient;
    uniform vec3 scatterColor;

    varying vec2 vUv;

    // Gaussian kernel weights for 13-tap blur
    const float kernel[7] = float[7](
      0.028532,
      0.067234,
      0.124009,
      0.179044,
      0.20236,
      0.179044,
      0.124009
    );

    float getDepth(vec2 uv) {
      return texture2D(tDepth, uv).r;
    }

    void main() {
      vec2 pixelSize = 1.0 / resolution;
      vec4 colorM = texture2D(tDiffuse, vUv);
      float depthM = getDepth(vUv);

      // Early exit if depth is at far plane (background)
      if (depthM > 0.9999) {
        gl_FragColor = colorM;
        return;
      }

      // Calculate blur amount based on depth
      // Objects closer to camera get more blur (more pronounced SSS)
      float blurAmount = sssWidth * (1.0 / (depthM * distanceToProjectionWindow));

      vec4 colorBlurred = vec4(0.0);
      float totalWeight = 0.0;

      // Separable Gaussian blur
      for (int i = -6; i <= 6; i++) {
        if (i == 0) {
          colorBlurred += colorM * kernel[0];
          totalWeight += kernel[0];
          continue;
        }

        int kernelIndex = abs(i);
        if (kernelIndex >= 7) continue;

        float weight = kernel[kernelIndex];
        vec2 offset = direction * float(i) * pixelSize * blurAmount;
        vec2 sampleUv = vUv + offset;

        // Sample depth at offset position
        float sampleDepth = getDepth(sampleUv);

        // Depth-aware blur: only blur if depth difference is small
        // This prevents bleeding across edges
        float depthDiff = abs(depthM - sampleDepth);
        float depthWeight = exp(-depthDiff * 100.0);

        // Sample color
        vec4 sampleColor = texture2D(tDiffuse, sampleUv);

        // Combine weights
        float finalWeight = weight * depthWeight;

        colorBlurred += sampleColor * finalWeight;
        totalWeight += finalWeight;
      }

      // Normalize
      colorBlurred /= totalWeight;

      // Apply subsurface scattering color tint
      // Red light scatters more through skin than blue
      vec3 sssEffect = colorBlurred.rgb * scatterColor;

      // Blend between original and scattered light based on translucency
      vec3 finalColor = mix(colorM.rgb, sssEffect, translucency);

      // Add ambient term to prevent pure black in shadows
      finalColor = max(finalColor, ambient);

      gl_FragColor = vec4(finalColor, colorM.a);
    }
  `
};

/**
 * Create SSS post-processing passes
 * Returns horizontal and vertical blur passes
 */
export function createSSSPasses(
  resolution: THREE.Vector2,
  skinToneLuminance: number
): {
  horizontalPass: THREE.ShaderPass;
  verticalPass: THREE.ShaderPass;
  depthTarget: THREE.WebGLRenderTarget;
} {
  // Create depth render target
  const depthTarget = new THREE.WebGLRenderTarget(
    resolution.x,
    resolution.y,
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: true,
      stencilBuffer: false
    }
  );

  // Calculate adaptive SSS parameters based on skin tone
  const isDarkSkin = skinToneLuminance < 0.3;
  const isLightSkin = skinToneLuminance > 0.7;

  // Dark skin: less transmission, more absorption
  // Light skin: more transmission, less absorption
  let sssWidth = 0.012;
  let translucency = 0.8;
  let scatterColor = new THREE.Vector3(1.0, 0.4, 0.3);

  if (isDarkSkin) {
    sssWidth = 0.008; // Tighter scatter
    translucency = 0.6; // Less translucent
    scatterColor = new THREE.Vector3(0.8, 0.35, 0.25); // Less red scatter
  } else if (isLightSkin) {
    sssWidth = 0.015; // Wider scatter
    translucency = 0.9; // More translucent
    scatterColor = new THREE.Vector3(1.0, 0.5, 0.35); // More pronounced scatter
  }

  // Horizontal pass (left-right blur)
  const horizontalPass = new THREE.ShaderPass(SSSBlurShader);
  horizontalPass.uniforms.resolution.value = resolution;
  horizontalPass.uniforms.direction.value = new THREE.Vector2(1.0, 0.0);
  horizontalPass.uniforms.sssWidth.value = sssWidth;
  horizontalPass.uniforms.translucency.value = translucency;
  horizontalPass.uniforms.scatterColor.value = scatterColor;

  // Vertical pass (up-down blur)
  const verticalPass = new THREE.ShaderPass(SSSBlurShader);
  verticalPass.uniforms.resolution.value = resolution;
  verticalPass.uniforms.direction.value = new THREE.Vector2(0.0, 1.0);
  verticalPass.uniforms.sssWidth.value = sssWidth;
  verticalPass.uniforms.translucency.value = translucency;
  verticalPass.uniforms.scatterColor.value = scatterColor;

  logger.info('SCREEN_SPACE_SSS', 'SSS passes created', {
    resolution: `${resolution.x}x${resolution.y}`,
    skinToneLuminance: skinToneLuminance.toFixed(3),
    skinCategory: isDarkSkin ? 'dark' : isLightSkin ? 'light' : 'medium',
    adaptiveParams: {
      sssWidth,
      translucency,
      scatterColor: `rgb(${scatterColor.x}, ${scatterColor.y}, ${scatterColor.z})`
    },
    philosophy: 'separable_sss_jorge_jimenez_technique'
  });

  return { horizontalPass, verticalPass, depthTarget };
}

/**
 * Update SSS parameters when skin tone changes
 */
export function updateSSSParameters(
  horizontalPass: THREE.ShaderPass,
  verticalPass: THREE.ShaderPass,
  skinToneLuminance: number
): void {
  const isDarkSkin = skinToneLuminance < 0.3;
  const isLightSkin = skinToneLuminance > 0.7;

  let sssWidth = 0.012;
  let translucency = 0.8;
  let scatterColor = new THREE.Vector3(1.0, 0.4, 0.3);

  if (isDarkSkin) {
    sssWidth = 0.008;
    translucency = 0.6;
    scatterColor = new THREE.Vector3(0.8, 0.35, 0.25);
  } else if (isLightSkin) {
    sssWidth = 0.015;
    translucency = 0.9;
    scatterColor = new THREE.Vector3(1.0, 0.5, 0.35);
  }

  // Update both passes
  [horizontalPass, verticalPass].forEach(pass => {
    pass.uniforms.sssWidth.value = sssWidth;
    pass.uniforms.translucency.value = translucency;
    pass.uniforms.scatterColor.value = scatterColor;
  });

  logger.info('SCREEN_SPACE_SSS', 'SSS parameters updated', {
    skinToneLuminance: skinToneLuminance.toFixed(3),
    sssWidth,
    translucency,
    philosophy: 'adaptive_sss_update'
  });
}

/**
 * Calculate SSS kernel radius based on skin tone and quality
 */
export function calculateSSSKernelRadius(
  skinToneLuminance: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
): number {
  const baseRadius = quality === 'low' ? 7 : quality === 'medium' ? 13 : 19;

  // Adjust based on skin tone
  const luminanceMultiplier = 0.8 + (skinToneLuminance * 0.4);

  return Math.floor(baseRadius * luminanceMultiplier);
}
