/**
 * Environment variables configuration
 * Client-side environment variables only
 *
 * SECURITY NOTE:
 * - Only PUBLIC keys should be here (Supabase anon key is safe)
 * - Private keys MUST be in Edge Functions only
 * - All variables are validated at startup
 */

import logger from '../lib/utils/logger';

/**
 * Environment type detection
 */
export const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (import.meta.env.DEV) return 'development';
  if (window.location.hostname.includes('deploy-preview') || window.location.hostname.includes('staging')) {
    return 'staging';
  }
  return 'production';
};

/**
 * Required environment variables with validation
 */
export const env = {
  // Supabase Configuration
  supabaseUrl: (() => {
    const url = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
    // Ensure HTTPS protocol for Supabase domains to prevent mixed content errors
    if (url && (url.includes('supabase.co') || url.includes('supabase.in'))) {
      return url.replace(/^http:\/\//, 'https://');
    }
    return url;
  })(),
  supabaseAnon: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '',

  // Feature Flags (optional with defaults)
  enableVoiceCoach: import.meta.env.VITE_ENABLE_VOICE_COACH !== 'false',
  enable3DAvatar: import.meta.env.VITE_ENABLE_3D_AVATAR !== 'false',
  enableWearables: import.meta.env.VITE_ENABLE_WEARABLES !== 'false',

  // Development Settings
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' && import.meta.env.DEV,

  // Environment Info
  environment: getEnvironment(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate environment variables with graceful fallbacks
export const isSupabaseConfigured = () => {
  const hasUrl = env.supabaseUrl && env.supabaseUrl.length > 0;
  const hasKey = env.supabaseAnon && env.supabaseAnon.length > 0;
  const isValidUrl = hasUrl && (env.supabaseUrl.includes('supabase.co') || env.supabaseUrl.includes('supabase.in'));

  return hasUrl && hasKey && isValidUrl;
};

/**
 * Validate all required environment variables at startup
 * Throws error in production if critical variables are missing
 */
export const validateEnvironment = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical validations
  if (!env.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required');
  } else if (!env.supabaseUrl.includes('supabase.co') && !env.supabaseUrl.includes('supabase.in')) {
    errors.push('VITE_SUPABASE_URL must be a valid Supabase URL');
  }

  if (!env.supabaseAnon) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  } else if (env.supabaseAnon.length < 100) {
    warnings.push('VITE_SUPABASE_ANON_KEY seems too short, verify it is correct');
  }

  // Security check: ensure no private keys are exposed
  const allEnvVars = Object.keys(import.meta.env);
  const dangerousKeys = allEnvVars.filter(key =>
    key.includes('SECRET') ||
    key.includes('PRIVATE') ||
    key.includes('SERVICE_ROLE') ||
    key.includes('OPENAI_API_KEY') ||
    key.includes('STRIPE_SECRET')
  );

  if (dangerousKeys.length > 0) {
    errors.push(`SECURITY RISK: Private keys detected in client bundle: ${dangerousKeys.join(', ')}`);
  }

  // Log results
  if (errors.length > 0) {
    logger.error('ENV_VALIDATION', 'Critical environment variable errors detected', {
      errors,
      environment: env.environment,
    });

    if (env.isProduction) {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }

  if (warnings.length > 0) {
    logger.warn('ENV_VALIDATION', 'Environment variable warnings', {
      warnings,
      environment: env.environment,
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    logger.info('ENV_VALIDATION', 'Environment variables validated successfully', {
      environment: env.environment,
      supabaseConfigured: isSupabaseConfigured(),
      featuresEnabled: {
        voiceCoach: env.enableVoiceCoach,
        avatar3D: env.enable3DAvatar,
        wearables: env.enableWearables,
      },
    });
  }
};

// Log environment configuration
export const logEnvConfig = () => {
  const hasUrl = env.supabaseUrl && env.supabaseUrl.length > 0;
  const hasKey = env.supabaseAnon && env.supabaseAnon.length > 0;
  const isValidUrl = hasUrl && (env.supabaseUrl.includes('supabase.co') || env.supabaseUrl.includes('supabase.in'));

  logger.debug('Supabase configuration check', { hasUrl, hasKey, isValidUrl });

  // Log environment info for production debugging
  if (import.meta.env.PROD) {
    if (isSupabaseConfigured()) {
      logger.info('Supabase Production: Client configured successfully');
    } else {
      logger.error('Supabase Production: Configuration missing!', { hasUrl: !!env.supabaseUrl, hasKey: !!env.supabaseAnon });
    }
  }
};