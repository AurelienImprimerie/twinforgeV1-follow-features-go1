/**
 * Circuit Colors System - Phase VisionOS 26+++
 * Optimisé UI, UX, perfs et cohérence visuelle
 */

export const CIRCUIT_COLORS = {
  home: 'var(--color-plasma-cyan)',       // Home - Plasma Cyan
  track: 'var(--color-plasma-cyan)',      // Track - Plasma Cyan
  fasting: 'var(--circuit-fasting)',      // Fasting - Orange chaud
  activity: 'var(--circuit-activity)',    // Activity - Bleu vif
  training: 'var(--circuit-training)',    // Training - Bleu saillant
  emotions: 'var(--circuit-emotions)',    // Emotions - Rose doux
  videos: 'var(--circuit-videos)',        // Videos - Orange rouge
  health: 'var(--circuit-health)',        // Health - Rouge médical
  preferences: 'var(--circuit-fridge)',   // Preferences - Cyan (alias)
  'coach-videos': 'var(--circuit-videos)', // Coach Videos - Orange rouge
  'coach-clients': 'var(--brand-accent)',  // Coach Clients - Accent
  'coach-branding': 'var(--brand-accent)', // Coach Branding - Accent
} as const satisfies Record<CircuitKey, string>;

/**
 * Resolve and cache path normalization for better perf
 */
function normalizePath(path: string): string {
  return path.replace(/^\//, '').replace(/\/.*$/, '');
}

/**
 * Get circuit color by route path (fast path resolution)
 */
export function getCircuitColor(path: string): string {
  if (path === '/') return CIRCUIT_COLORS.home;

  if (path.startsWith('/coach/')) {
    const subPath = path.replace('/coach/', '');
    return CIRCUIT_COLORS[`coach-${subPath}` as CircuitKey] || CIRCUIT_COLORS['coach-clients'];
  }


  const normalized = normalizePath(path);
  if (path.includes('coach-')) {
    return CIRCUIT_COLORS[normalized as CircuitKey] || CIRCUIT_COLORS['coach-clients'];
  }

  return CIRCUIT_COLORS[normalized as CircuitKey] || CIRCUIT_COLORS.home;
}

/**
 * Get circuit key from route path
 */
function getCircuitKey(path: string): CircuitKey {
  if (path === '/') return 'home';
  return (normalizePath(path) as CircuitKey) || 'home';
}

/**
 * Create a GPU-friendly circuit-aware background style
 */
function createCircuitBackground(
  circuit: CircuitKey,
  opacity: number = 0.15
): React.CSSProperties {
  const color = CIRCUIT_COLORS[circuit];
  const opacityPercent = Math.min(Math.max(opacity, 0), 1) * 100;

  return {
    background: `var(--glass-hover-color)`,
    borderColor: `var(--glass-hover-border)`,
    boxShadow: `var(--glass-hover-shadow)`,
    backdropFilter: `var(--glass-hover-blur)`,
    willChange: 'background, border-color',
    transform: 'translateZ(0)',
  };
}

/**
 * Create a GPU-friendly circuit-aware glow effect
 */
function createCircuitGlow(
  circuit: CircuitKey,
  intensity: number = 0.4
): React.CSSProperties {
  const color = CIRCUIT_COLORS[circuit];
  const intensityPercent = Math.min(Math.max(intensity, 0), 1) * 100;

  return {
    boxShadow: `0 0 16px color-mix(in srgb, ${color} ${intensityPercent}%, transparent)`,
    willChange: 'box-shadow',
    transform: 'translateZ(0)',
  };
}