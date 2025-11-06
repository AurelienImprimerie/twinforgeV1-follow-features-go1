/**
 * TrainingDataCollector - Collects Training Data
 * Aggregates training sessions, loads, preferences, and patterns
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '../../../../lib/utils/logger';
import type {
  TrainingKnowledge,
  TrainingSessionSummary,
  TrainingExerciseDetail,
  ExercisePreference,
  ProgressionPattern,
  PersonalRecord,
  TrainingGoal
} from '../../types';

export class TrainingDataCollector {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async collect(userId: string): Promise<TrainingKnowledge> {
    try {
      logger.debug('TRAINING_COLLECTOR', 'Collecting training data', { userId });

      const [sessions, loads, preferences, personalRecords, activeGoals] = await Promise.all([
        this.getRecentSessions(userId),
        this.getCurrentLoads(userId),
        this.getExercisePreferences(userId),
        this.getPersonalRecords(userId),
        this.getActiveGoals(userId)
      ]);

      const patterns = this.analyzeProgressionPatterns(sessions, loads);
      const avgRPE = this.calculateAverageRPE(sessions);
      const weeklyVolume = this.calculateWeeklyVolume(sessions);
      const lastSessionDate = sessions.length > 0 ? sessions[0].date : null;

      return {
        recentSessions: sessions,
        currentLoads: loads,
        exercisePreferences: preferences,
        progressionPatterns: patterns,
        avgRPE,
        weeklyVolume,
        lastSessionDate,
        personalRecords,
        activeGoals,
        hasData: sessions.length > 0
      };
    } catch (error) {
      logger.error('TRAINING_COLLECTOR', 'Failed to collect training data', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async getRecentSessions(userId: string): Promise<TrainingSessionSummary[]> {
    const { data, error } = await this.supabase
      .from('training_sessions')
      .select('id, created_at, discipline, prescription, duration_actual_min, status, completed_at, feedback')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('TRAINING_COLLECTOR', 'Failed to get sessions', { error });
      return [];
    }

    return (data || []).map(session => {
      // Extract exercise count and details from prescription JSONB
      let exerciseCount = 0;
      let exercises: TrainingExerciseDetail[] = [];
      let sessionName: string | undefined;
      let expectedRpe: number | undefined;

      if (session.prescription && typeof session.prescription === 'object') {
        const prescription = session.prescription as any;
        sessionName = prescription.sessionName;
        expectedRpe = prescription.expectedRpe;

        if (Array.isArray(prescription.exercises)) {
          exerciseCount = prescription.exercises.length;
          // Extract detailed exercises
          exercises = prescription.exercises.map((ex: any) => ({
            id: ex.id || '',
            name: ex.name || 'Unknown',
            sets: ex.sets || 0,
            reps: ex.reps || 0,
            load: ex.load,
            rest: ex.rest || 0,
            muscleGroups: ex.muscleGroups || [],
            coachTips: ex.coachTips || [],
            executionCues: ex.executionCues || []
          }));
        } else if (Array.isArray(prescription.blocks)) {
          // For endurance sessions with blocks
          exerciseCount = prescription.blocks.length;
        }
      }

      return {
        sessionId: session.id,
        date: session.created_at,
        discipline: session.discipline || 'force',
        exerciseCount,
        duration: session.duration_actual_min || 0,
        completed: session.status === 'completed' || !!session.completed_at,
        avgRPE: session.feedback?.avg_rpe,
        exercises,
        sessionName,
        expectedRpe
      };
    });
  }

  private async getCurrentLoads(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.supabase
        .from('training_exercise_load_history')
        .select('exercise_name, load_completed, performed_at')
        .eq('user_id', userId)
        .order('performed_at', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('TRAINING_COLLECTOR', 'Failed to get loads', { error });
        return {};
      }

      const loads: Record<string, number> = {};
      (data || []).forEach(item => {
        if (!loads[item.exercise_name] && item.load_completed) {
          // Extract load from JSONB (can be number or array)
          let loadValue = 0;
          if (typeof item.load_completed === 'number') {
            loadValue = item.load_completed;
          } else if (Array.isArray(item.load_completed)) {
            // Take average of array
            const validLoads = item.load_completed.filter((l: any) => typeof l === 'number');
            if (validLoads.length > 0) {
              loadValue = validLoads.reduce((sum: number, l: number) => sum + l, 0) / validLoads.length;
            }
          }
          if (loadValue > 0) {
            loads[item.exercise_name] = loadValue;
          }
        }
      });

      return loads;
    } catch (error) {
      logger.error('TRAINING_COLLECTOR', 'Exception getting loads', { error });
      return {};
    }
  }

  private async getExercisePreferences(userId: string): Promise<ExercisePreference[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_exercise_preferences')
        .select(`
          exercise_id,
          avg_enjoyment_rating,
          times_completed,
          preference_score,
          exercises!inner(name)
        `)
        .eq('user_id', userId)
        .order('preference_score', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('TRAINING_COLLECTOR', 'Failed to get preferences', { error });
        return [];
      }

      return (data || []).map(pref => ({
        exerciseName: (pref.exercises as any)?.name || 'Unknown',
        enjoymentScore: pref.avg_enjoyment_rating || 3,
        frequencyLast30Days: pref.times_completed || 0,
        avgLoad: 0 // Not available in this table
      }));
    } catch (error) {
      logger.error('TRAINING_COLLECTOR', 'Exception getting preferences', { error });
      return [];
    }
  }

  private analyzeProgressionPatterns(
    sessions: TrainingSessionSummary[],
    loads: Record<string, number>
  ): ProgressionPattern[] {
    // Simplified pattern analysis
    const patterns: ProgressionPattern[] = [];

    Object.keys(loads).forEach(exerciseName => {
      patterns.push({
        exerciseName,
        trend: 'stable',
        loadProgression: 0,
        volumeProgression: 0
      });
    });

    return patterns.slice(0, 20);
  }

  private calculateAverageRPE(sessions: TrainingSessionSummary[]): number {
    const rpes = sessions
      .map(s => s.avgRPE)
      .filter((rpe): rpe is number => rpe !== undefined);

    if (rpes.length === 0) return 0;

    return rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length;
  }

  private calculateWeeklyVolume(sessions: TrainingSessionSummary[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentSessions = sessions.filter(
      s => new Date(s.date) >= oneWeekAgo && s.completed
    );

    return recentSessions.reduce((sum, s) => sum + s.exerciseCount, 0);
  }

  private async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from('training_personal_records')
        .select('exercise_name, value, unit, achieved_at, discipline, record_type')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('TRAINING_COLLECTOR', 'Failed to get personal records', { error });
        return [];
      }

      return (data || []).map(record => ({
        exerciseName: record.exercise_name,
        load: record.value || 0,
        reps: record.record_type === '1RM' ? 1 : 0,
        date: record.achieved_at,
        discipline: record.discipline || 'force'
      }));
    } catch (error) {
      logger.error('TRAINING_COLLECTOR', 'Exception getting personal records', { error });
      return [];
    }
  }

  private async getActiveGoals(userId: string): Promise<TrainingGoal[]> {
    try {
      const { data, error } = await this.supabase
        .from('training_goals')
        .select('id, name, description, target_value, current_value, unit, deadline, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        logger.error('TRAINING_COLLECTOR', 'Failed to get training goals', { error });
        return [];
      }

      return (data || []).map(goal => ({
        id: goal.id,
        title: goal.name || goal.description || 'Objectif',
        targetValue: goal.target_value,
        currentValue: goal.current_value,
        unit: goal.unit || '',
        deadline: goal.deadline,
        isActive: goal.is_active
      }));
    } catch (error) {
      logger.error('TRAINING_COLLECTOR', 'Exception getting training goals', { error });
      return [];
    }
  }
}
