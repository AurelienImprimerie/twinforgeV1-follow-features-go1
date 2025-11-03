/**
 * Debug Flags Configuration
 * Controls debug features across the application
 */

// Detect if we're in development mode
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const DEBUG_FLAGS = {
  avatar: {
    showBones: false,
    showMesh: true,
    showLights: false,
    enablePostProcessing: true,
  },
  performance: {
    monitorFPS: false,
    logRenderTime: false,
  },
  general: {
    verboseLogging: false,
  },
  // Diagnostic logs control
  diagnostics: {
    // Enable diagnostic logs only in development
    enabled: isDevelopment,
    // Specific module controls (all respect the global 'enabled' flag)
    activity: isDevelopment,
    progression: isDevelopment,
    insights: isDevelopment,
    fasting: isDevelopment,
    meals: isDevelopment,
    voice: false, // Voice diagnostics are always opt-in due to verbosity
    performance: false, // Performance diagnostics are always opt-in
    avatar: false, // Avatar diagnostics are always opt-in
  },
  // Face clipping debug flags
  DISABLE_FACE_CLIPPING: false,
  SHOW_FULL_BODY_IN_FACE_MODE: false,
  FORCE_MESH_VISIBLE: false,
} as const;

export type DebugFlags = typeof DEBUG_FLAGS;

/**
 * Helper to check if diagnostic logs should be shown for a category
 */
export const shouldLogDiagnostic = (category: keyof typeof DEBUG_FLAGS.diagnostics): boolean => {
  if (!DEBUG_FLAGS.diagnostics.enabled) return false;
  return DEBUG_FLAGS.diagnostics[category] === true;
};
