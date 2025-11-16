/**
 * Hook: useStreakMilestoneAudio
 * Détecte les milestones de streak et joue les sons appropriés
 */

import { useEffect, useRef } from 'react';
import { GamingSounds } from '@/audio';
import logger from '@/lib/utils/logger';

const STREAK_MILESTONES = [7, 14, 30, 60, 90];

/**
 * Hook pour jouer les sons de streak milestone automatiquement
 * @param currentStreak - Nombre de jours de streak actuel
 */
export function useStreakMilestoneAudio(currentStreak: number | undefined) {
  const previousStreak = useRef<number>(0);
  const playedMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (currentStreak === undefined || currentStreak === previousStreak.current) {
      return;
    }

    // Check if we crossed a milestone
    const newMilestones = STREAK_MILESTONES.filter(milestone => {
      return (
        currentStreak >= milestone &&
        previousStreak.current < milestone &&
        !playedMilestones.current.has(milestone)
      );
    });

    // Play sound for each new milestone reached
    newMilestones.forEach(milestone => {
      logger.info('STREAK_MILESTONE', 'Milestone reached', {
        milestone,
        currentStreak,
        previousStreak: previousStreak.current
      });

      // Add a slight delay between milestones if multiple crossed at once
      const delay = newMilestones.indexOf(milestone) * 800;
      setTimeout(() => {
        GamingSounds.streakMilestone(milestone);
      }, delay);

      playedMilestones.current.add(milestone);
    });

    previousStreak.current = currentStreak;
  }, [currentStreak]);

  // Reset played milestones if streak drops below milestone
  useEffect(() => {
    if (currentStreak === undefined) return;

    const milestonesToRemove = Array.from(playedMilestones.current).filter(
      milestone => currentStreak < milestone
    );

    milestonesToRemove.forEach(milestone => {
      playedMilestones.current.delete(milestone);
    });
  }, [currentStreak]);
}

/**
 * Hook pour jouer un son de multiplicateur activé
 * @param multiplier - Valeur du multiplicateur actif
 */
export function useMultiplierAudio(multiplier: number | undefined) {
  const previousMultiplier = useRef<number>(1.0);

  useEffect(() => {
    if (multiplier === undefined || multiplier === previousMultiplier.current) {
      return;
    }

    // Only play if multiplier increased significantly
    if (multiplier > previousMultiplier.current && multiplier >= 1.5) {
      logger.info('MULTIPLIER_ACTIVATED', 'Multiplier activated', {
        multiplier,
        previousMultiplier: previousMultiplier.current
      });

      GamingSounds.multiplierActivated(multiplier);
    }

    previousMultiplier.current = multiplier;
  }, [multiplier]);
}
