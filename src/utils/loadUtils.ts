/**
 * Load Utilities
 * Safe handling of exercise loads (single number or ramping sets array)
 */

/**
 * Get the load for a specific set (1-indexed)
 * Handles both single loads and ramping sets (load arrays)
 */
export function getLoadForSet(load: number | number[] | undefined, setNumber: number): number | null {
  if (load === undefined || load === null) {
    return null;
  }

  if (typeof load === 'number') {
    return load;
  }

  if (Array.isArray(load)) {
    const index = setNumber - 1;
    if (index >= 0 && index < load.length) {
      return load[index];
    }
    return load[load.length - 1] || null;
  }

  return null;
}

/**
 * Check if load is a ramping set (array of progressive loads)
 */
export function isRampingSet(load: number | number[] | undefined): load is number[] {
  return Array.isArray(load) && load.length > 0;
}

/**
 * Get the initial/first load value for display
 */
export function getInitialLoad(load: number | number[] | undefined): number {
  if (load === undefined || load === null) {
    return 0;
  }

  if (typeof load === 'number') {
    return load;
  }

  if (Array.isArray(load) && load.length > 0) {
    return load[0];
  }

  return 0;
}

/**
 * Format load display for current set
 */
export function formatLoadDisplay(load: number | number[] | undefined, currentSet: number): string {
  const currentLoad = getLoadForSet(load, currentSet);

  if (currentLoad === null) {
    return 'PDC';
  }

  return `${currentLoad}kg`;
}

/**
 * Get load progression summary for display
 * Returns null if single load, formatted string if ramping
 */
export function getLoadProgressionSummary(load: number | number[] | undefined): string | null {
  if (!isRampingSet(load)) {
    return null;
  }

  return load.map((l, idx) => `S${idx + 1}: ${l}kg`).join(', ');
}

/**
 * Update load value (handles both single and array)
 * For arrays, updates the specific set's load
 */
export function updateLoadForSet(
  load: number | number[] | undefined,
  setNumber: number,
  newLoad: number
): number | number[] {
  if (load === undefined || load === null) {
    return newLoad;
  }

  if (typeof load === 'number') {
    return newLoad;
  }

  if (Array.isArray(load)) {
    const updatedLoads = [...load];
    const index = setNumber - 1;

    if (index >= 0 && index < updatedLoads.length) {
      updatedLoads[index] = newLoad;
    }

    return updatedLoads;
  }

  return newLoad;
}

/**
 * Validate load array matches number of sets
 */
export function validateLoadArray(load: number | number[] | undefined, sets: number): boolean {
  if (!Array.isArray(load)) {
    return true;
  }

  return load.length === sets;
}

/**
 * Get top set (maximum load) for display
 */
export function getTopSet(load: number | number[] | undefined): number | null {
  if (load === undefined || load === null) {
    return null;
  }

  if (typeof load === 'number') {
    return load;
  }

  if (Array.isArray(load) && load.length > 0) {
    return Math.max(...load);
  }

  return null;
}

/**
 * Normalize load to a single average value for calculations
 * Used for calorie and volume calculations where we need one number
 */
export function normalizeLoadToAverage(load: number | number[] | undefined): number {
  if (load === undefined || load === null) {
    return 0;
  }

  if (typeof load === 'number') {
    return load;
  }

  if (Array.isArray(load) && load.length > 0) {
    const sum = load.reduce((acc, curr) => acc + curr, 0);
    return sum / load.length;
  }

  return 0;
}

/**
 * Calculate total volume for an exercise
 * Volume = sum of (reps × load) for all sets
 */
export function calculateExerciseVolume(
  repsActual: number[],
  loadUsed: number | number[] | undefined
): number {
  if (!repsActual || repsActual.length === 0) {
    return 0;
  }

  // Handle ramping sets where each set has different load
  if (Array.isArray(loadUsed)) {
    let totalVolume = 0;
    for (let i = 0; i < repsActual.length; i++) {
      const setLoad = loadUsed[i] || 0;
      totalVolume += repsActual[i] * setLoad;
    }
    return totalVolume;
  }

  // Handle single load for all sets
  const load = typeof loadUsed === 'number' ? loadUsed : 0;
  const totalReps = repsActual.reduce((sum, reps) => sum + reps, 0);
  return totalReps * load;
}

/**
 * Calculate total volume for a session (all exercises)
 * CRITICAL: Defensive validation to prevent crashes
 */
export function calculateSessionVolume(
  exercises: Array<{
    repsActual: number[];
    loadUsed: number | number[] | undefined;
  }> | undefined | null
): number {
  // CRITICAL GUARD: Validate exercises array exists and is not empty
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    console.warn('[loadUtils] calculateSessionVolume: exercises array is invalid', {
      isNull: exercises === null,
      isUndefined: exercises === undefined,
      isArray: Array.isArray(exercises),
      length: Array.isArray(exercises) ? exercises.length : 'N/A'
    });
    return 0;
  }

  return exercises.reduce((total, exercise) => {
    // Guard against undefined/null exercise
    if (!exercise) {
      console.warn('[loadUtils] calculateSessionVolume: exercise is null/undefined');
      return total;
    }
    return total + calculateExerciseVolume(exercise.repsActual, exercise.loadUsed);
  }, 0);
}
