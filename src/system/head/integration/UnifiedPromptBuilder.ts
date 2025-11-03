/**
 * UnifiedPromptBuilder - Build Context-Rich Prompts
 * Generates prompts enriched with user knowledge and current context
 */

import logger from '../../../lib/utils/logger';
import type { BrainContext, PromptEnrichment, ResponseStyle } from '../types';

export class UnifiedPromptBuilder {
  /**
   * Build enriched system prompt
   */
  buildSystemPrompt(context: BrainContext, basePrompt: string): string {
    const enrichment = this.buildEnrichment(context);

    const sections = [
      basePrompt,
      '',
      '## CONTEXTE UTILISATEUR',
      enrichment.userKnowledgeSummary,
      '',
      '## ACTIVITÉ ACTUELLE',
      enrichment.currentActivityContext,
      '',
      '## STYLE DE RÉPONSE',
      this.formatResponseStyle(enrichment.suggestedResponseStyle)
    ];

    if (enrichment.systemPromptAdditions.length > 0) {
      sections.push('', '## INSTRUCTIONS SUPPLÉMENTAIRES');
      sections.push(...enrichment.systemPromptAdditions);
    }

    return sections.join('\n');
  }

  /**
   * Build contextual enrichment
   */
  private buildEnrichment(context: BrainContext): PromptEnrichment {
    const systemPromptAdditions: string[] = [];
    const contextualInstructions: string[] = [];

    // Add training context if in session
    if (context.session.isActive && context.session.trainingSession) {
      const training = context.session.trainingSession;

      // Ultra-precise Step3 context
      const exerciseName = training.currentExercise?.name || 'inconnu';
      const exerciseLoad = training.currentExercise?.load ? `${training.currentExercise.load}kg` : 'poids de corps';
      const exerciseReps = training.currentExercise?.reps || '?';
      const exerciseSets = training.currentExercise?.sets || '?';

      contextualInstructions.push(
        `🔥 SÉANCE LIVE (${training.discipline}): ` +
        `Exercice ${training.currentExerciseIndex + 1}/${training.totalExercises} - ${exerciseName} ` +
        `(${exerciseLoad}, ${exerciseReps} reps × ${exerciseSets} séries), ` +
        `série ${training.currentSet}/${training.totalSets}`
      );

      if (training.isResting) {
        contextualInstructions.push(`⏸️ REPOS ACTIF: ${training.restTimeRemaining}s restantes avant prochaine série.`);
        systemPromptAdditions.push(
          '⏸️ PÉRIODE DE REPOS (15-30 mots):',
          '• Profite du repos pour donner conseils techniques',
          '• Explique la progression ou la logique de l\'exercice',
          '• Réponds aux questions en détail',
          '• Encourage pour la prochaine série',
          '• Rappelle les points techniques importants'
        );
      } else {
        contextualInstructions.push(`💪 EFFORT EN COURS: Série ${training.currentSet}/${training.totalSets} active.`);
        systemPromptAdditions.push(
          '💪 EFFORT ACTIF - ULTRA-COURT (5-15 mots MAX):',
          '• Motivation explosive et encouragement',
          '• Corrections techniques CRITIQUES uniquement',
          '• Alertes sécurité si nécessaire',
          '• PAS de détails, PAS d\'explications',
          '• Exemples: "Allez! Pousse!", "Dos droit!", "Expire!", "2 de plus!"'
        );
      }

      // Add exercise-specific guidance
      if (training.currentExercise) {
        systemPromptAdditions.push(
          `📋 EXERCICE ACTUEL: ${exerciseName}`,
          `   Charge: ${exerciseLoad}`,
          `   Répétitions: ${exerciseReps}`,
          `   Série: ${training.currentSet}/${exerciseSets}`,
          `   Temps écoulé: ${Math.floor(training.sessionTimeElapsed / 60)}min`
        );
      }
    }

    // Add missing data suggestions
    if (context.missingData.suggestions.length > 0) {
      const topSuggestion = context.missingData.suggestions[0];
      systemPromptAdditions.push(
        `Suggestion proactive disponible: ${topSuggestion.message}`
      );
    }

    // Build user knowledge summary
    const userKnowledgeSummary = this.buildUserKnowledgeSummary(context);

    // Build activity context
    const currentActivityContext = this.buildActivityContext(context);

    // Determine response style
    const suggestedResponseStyle = this.determineResponseStyle(context);

    return {
      systemPromptAdditions,
      contextualInstructions,
      userKnowledgeSummary,
      currentActivityContext,
      suggestedResponseStyle
    };
  }

  /**
   * Build user knowledge summary
   */
  private buildUserKnowledgeSummary(context: BrainContext): string {
    const user = context.user;
    const parts: string[] = [];

    // Profile
    if (user.profile.displayName) {
      parts.push(`Nom: ${user.profile.displayName}`);
    }
    if (user.profile.age) {
      parts.push(`Âge: ${user.profile.age} ans`);
    }
    if (user.profile.weight && user.profile.height) {
      const bmi = (user.profile.weight / Math.pow(user.profile.height / 100, 2)).toFixed(1);
      parts.push(`Morphologie: ${user.profile.height}cm, ${user.profile.weight}kg (IMC: ${bmi})`);
    }
    if (user.profile.objectives.length > 0) {
      parts.push(`Objectifs: ${user.profile.objectives.join(', ')}`);
    }
    if (user.profile.preferredDisciplines.length > 0) {
      parts.push(`Disciplines préférées: ${user.profile.preferredDisciplines.join(', ')}`);
    }
    if (user.profile.level) {
      parts.push(`Niveau: ${user.profile.level}`);
    }

    // Training
    if (user.training.hasData) {
      parts.push('\n### ENTRAÎNEMENT');
      if (user.training.lastSessionDate) {
        parts.push(`Dernière séance: ${new Date(user.training.lastSessionDate).toLocaleDateString('fr-FR')}`);
      }
      if (user.training.avgRPE > 0) {
        parts.push(`RPE moyen: ${user.training.avgRPE.toFixed(1)}/10`);
      }
      if (user.training.weeklyVolume > 0) {
        parts.push(`Volume hebdomadaire: ${user.training.weeklyVolume} exercices`);
      }
      if (user.training.recentSessions.length > 0) {
        const completedCount = user.training.recentSessions.filter(s => s.completed).length;
        parts.push(`Séances récentes: ${completedCount}/${user.training.recentSessions.length} complétées`);
      }
      if (user.training.personalRecords && user.training.personalRecords.length > 0) {
        parts.push(`Records personnels: ${user.training.personalRecords.length} établis`);
      }
      if (user.training.activeGoals && user.training.activeGoals.length > 0) {
        parts.push(`Objectifs actifs: ${user.training.activeGoals.length}`);
        user.training.activeGoals.slice(0, 2).forEach(goal => {
          const progress = goal.currentValue && goal.targetValue
            ? Math.round((goal.currentValue / goal.targetValue) * 100)
            : 0;
          parts.push(`  - ${goal.title}: ${progress}% (${goal.currentValue || 0}/${goal.targetValue} ${goal.unit})`);
        });
      }
    }

    // Equipment
    if (user.equipment.locations.length > 0) {
      parts.push('\n### ÉQUIPEMENT');
      parts.push(`Lieux d'entraînement: ${user.equipment.locations.length}`);
      parts.push(`Équipements disponibles: ${user.equipment.availableEquipment.length} types`);
      if (user.equipment.defaultLocationId) {
        const defaultLoc = user.equipment.locations.find(l => l.id === user.equipment.defaultLocationId);
        if (defaultLoc) {
          parts.push(`Lieu par défaut: ${defaultLoc.name}`);
        }
      }
    }

    // Nutrition
    if (user.nutrition.hasData) {
      parts.push('\n### NUTRITION');
      if (user.nutrition.recentMeals.length > 0) {
        parts.push(`Repas récents: ${user.nutrition.recentMeals.length} enregistrés`);
      }
      if (user.nutrition.averageCalories > 0) {
        parts.push(`Apport moyen: ${Math.round(user.nutrition.averageCalories)} kcal/jour`);
      }
      if (user.nutrition.averageProtein > 0) {
        parts.push(`Protéines moyennes: ${Math.round(user.nutrition.averageProtein)}g/jour`);
      }
      if (user.nutrition.dietaryPreferences.length > 0) {
        parts.push(`Préférences alimentaires: ${user.nutrition.dietaryPreferences.join(', ')}`);
      }
      if (user.nutrition.scanFrequency > 0) {
        parts.push(`Fréquence de scan: ${user.nutrition.scanFrequency} repas/semaine`);
      }
    }

    // Fasting
    if (user.fasting.hasData) {
      parts.push('\n### JEÛNE INTERMITTENT');
      if (user.fasting.currentSession) {
        parts.push(`Jeûne en cours: ${user.fasting.currentSession.actualDuration}h/${user.fasting.currentSession.targetDuration}h (${user.fasting.currentSession.protocol})`);
      }
      if (user.fasting.totalSessionsCompleted > 0) {
        parts.push(`Sessions complétées: ${user.fasting.totalSessionsCompleted}`);
      }
      if (user.fasting.averageFastingDuration > 0) {
        parts.push(`Durée moyenne: ${user.fasting.averageFastingDuration}h`);
      }
      if (user.fasting.preferredProtocol) {
        parts.push(`Protocole préféré: ${user.fasting.preferredProtocol}`);
      }
    }

    // Body Scan
    if (user.bodyScan.hasData) {
      parts.push('\n### COMPOSITION CORPORELLE');
      if (user.bodyScan.recentScans.length > 0) {
        parts.push(`Scans récents: ${user.bodyScan.recentScans.length}`);
      }
      if (user.bodyScan.latestMeasurements) {
        const m = user.bodyScan.latestMeasurements;
        if (m.weight) parts.push(`Poids actuel: ${m.weight}kg`);
        if (m.bodyFat) parts.push(`Masse grasse: ${m.bodyFat}%`);
        if (m.muscleMass) parts.push(`Masse musculaire: ${m.muscleMass}kg`);
      }
      if (user.bodyScan.progressionTrend) {
        const trendText = user.bodyScan.progressionTrend === 'improving' ? 'en amélioration' :
                          user.bodyScan.progressionTrend === 'declining' ? 'en baisse' : 'stable';
        parts.push(`Tendance: ${trendText}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Build activity context
   */
  private buildActivityContext(context: BrainContext): string {
    const parts: string[] = [];

    parts.push(`Page actuelle: ${context.app.pageContext.type}`);
    if (context.app.pageContext.subContext) {
      parts.push(`Sous-contexte: ${context.app.pageContext.subContext}`);
    }
    parts.push(`État d'activité: ${context.app.activityState}`);

    if (context.session.isActive) {
      parts.push(`Session active: ${context.session.sessionType}`);
    }

    // Add today's activity summary from UserKnowledgeBase
    const todayData = context.todayData;
    if (todayData) {
      parts.push('\n### ACTIVITÉS DU JOUR');

      if (todayData.hasTraining) {
        parts.push(`Entraînements: ${todayData.trainingSessions.length}`);
        todayData.trainingSessions.forEach(session => {
          parts.push(`  - ${session.discipline} (${session.status}, ${session.exerciseCount} exercices)`);
        });
      }

      if (todayData.hasNutrition) {
        const totalCalories = todayData.meals.reduce((sum, m) => sum + m.calories, 0);
        const totalProtein = todayData.meals.reduce((sum, m) => sum + m.protein, 0);
        parts.push(`Nutrition: ${todayData.meals.length} repas (${Math.round(totalCalories)} kcal, ${Math.round(totalProtein)}g protéines)`);
      }

      if (todayData.hasFasting && todayData.fastingSession) {
        parts.push(`Jeûne en cours: ${todayData.fastingSession.currentDuration}h/${todayData.fastingSession.targetDuration}h`);
      }

      if (todayData.hasBodyScan) {
        parts.push(`Scans corporels: ${todayData.bodyScans.length}`);
      }

      if (todayData.totalActivities === 0) {
        parts.push('Aucune activité enregistrée aujourd\'hui');
      }
    }

    return parts.join('\n');
  }

  /**
   * Determine appropriate response style
   */
  private determineResponseStyle(context: BrainContext): ResponseStyle {
    // Ultra-short during active exercise
    if (
      context.session.isActive &&
      context.session.trainingSession &&
      !context.session.trainingSession.isResting
    ) {
      return {
        length: 'ultra-short',
        tone: 'motivational',
        formality: 'casual',
        emoji: true
      };
    }

    // Short during rest
    if (
      context.session.isActive &&
      context.session.trainingSession &&
      context.session.trainingSession.isResting
    ) {
      return {
        length: 'short',
        tone: 'motivational',
        formality: 'casual',
        emoji: true
      };
    }

    // Normal for general chat
    return {
      length: 'medium',
      tone: 'conversational',
      formality: 'casual',
      emoji: false
    };
  }

  /**
   * Format response style for prompt
   */
  private formatResponseStyle(style: ResponseStyle): string {
    const lengthMap = {
      'ultra-short': '5-15 mots maximum',
      'short': '1-2 phrases courtes',
      'medium': '2-4 phrases',
      'detailed': 'Réponse détaillée'
    };

    const toneMap = {
      'motivational': 'Motivant et énergique',
      'technical': 'Technique et précis',
      'informative': 'Informatif et pédagogue',
      'conversational': 'Naturel et conversationnel'
    };

    return `Longueur: ${lengthMap[style.length]}\nTone: ${toneMap[style.tone]}\nÉmojis: ${style.emoji ? 'Oui' : 'Non'}`;
  }
}
