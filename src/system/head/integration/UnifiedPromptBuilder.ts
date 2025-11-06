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

        // Show last 2 sessions with exercise details
        const lastSessions = user.training.recentSessions.slice(0, 2);
        lastSessions.forEach((session, idx) => {
          const date = new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' });
          const statusEmoji = session.completed ? '✅' : '🕒';
          parts.push(`\n${statusEmoji} Séance ${idx + 1}: ${session.sessionName || session.discipline} - ${date}`);
          parts.push(`   Durée: ${session.duration}min | Exercices: ${session.exerciseCount} | RPE: ${session.avgRPE || session.expectedRpe || 'N/A'}`);

          // Show exercises if available
          if (session.exercises && session.exercises.length > 0) {
            parts.push(`   Exercices:`);
            session.exercises.slice(0, 3).forEach(ex => {
              const loadStr = Array.isArray(ex.load)
                ? ex.load.join('/')
                : ex.load
                ? `${ex.load}kg`
                : 'poids de corps';
              parts.push(`     • ${ex.name}: ${ex.sets} x ${ex.reps} @ ${loadStr}`);
              if (ex.muscleGroups && ex.muscleGroups.length > 0) {
                parts.push(`       Muscles: ${ex.muscleGroups.slice(0, 2).join(', ')}`);
              }
            });

            if (session.exercises.length > 3) {
              parts.push(`     ... et ${session.exercises.length - 3} autres exercices`);
            }
          }
        });
      }
      if (user.training.personalRecords && user.training.personalRecords.length > 0) {
        parts.push(`\nRecords personnels: ${user.training.personalRecords.length} établis`);
      }
      if (user.training.activeGoals && user.training.activeGoals.length > 0) {
        parts.push(`\nObjectifs actifs: ${user.training.activeGoals.length}`);
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

    // Nutrition & Culinary Context
    if (user.nutrition.hasData) {
      parts.push('\n### NUTRITION & CONTEXTE CULINAIRE');

      // Meals - Repas Scannés
      if (user.nutrition.recentMeals.length > 0) {
        parts.push(`\n  🍽️ Repas Scannés:`);
        parts.push(`    • Total récents: ${user.nutrition.recentMeals.length} enregistrés`);

        // Show last 3 meals with details
        const lastMeals = user.nutrition.recentMeals.slice(0, 3);
        lastMeals.forEach((meal, idx) => {
          const date = new Date(meal.date).toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' });
          parts.push(`    ${idx + 1}. ${meal.name} (${meal.mealType}) - ${date}`);
          parts.push(`       Calories: ${meal.calories} kcal | Protéines: ${Math.round(meal.protein)}g | Glucides: ${Math.round(meal.carbs)}g | Lipides: ${Math.round(meal.fats)}g`);

          // Show items if available
          if (meal.items && meal.items.length > 0) {
            const itemNames = meal.items.map(item => item.name).join(', ');
            parts.push(`       Aliments: ${itemNames}`);
          }
        });
      }
      if (user.nutrition.averageCalories > 0) {
        parts.push(`    • Apport moyen: ${Math.round(user.nutrition.averageCalories)} kcal/jour`);
      }
      if (user.nutrition.averageProtein > 0) {
        parts.push(`    • Protéines moyennes: ${Math.round(user.nutrition.averageProtein)}g/jour`);
      }
      if (user.nutrition.dietaryPreferences.length > 0) {
        parts.push(`    • Préférences alimentaires: ${user.nutrition.dietaryPreferences.join(', ')}`);
      }
      if (user.nutrition.scanFrequency > 0) {
        parts.push(`    • Fréquence de scan: ${user.nutrition.scanFrequency} repas/30 jours`);
      }

      // Meal Plans
      if (user.nutrition.mealPlans.hasData) {
        parts.push('\n  📋 Plans Alimentaires:');
        if (user.nutrition.mealPlans.hasActivePlan) {
          parts.push(`    • Plans actifs: ${user.nutrition.mealPlans.activePlans.length}`);
          if (user.nutrition.mealPlans.currentWeekPlan) {
            const plan = user.nutrition.mealPlans.currentWeekPlan;
            parts.push(`    • Plan de la semaine: "${plan.title}" (${plan.weekNumber}e semaine)`);
            if (plan.batchCookingEnabled) {
              parts.push(`    • Batch cooking activé`);
            }
            if (plan.nutritionalSummary.averageCaloriesPerDay) {
              parts.push(`    • Cible: ${Math.round(plan.nutritionalSummary.averageCaloriesPerDay)} kcal/jour`);
            }

            // Display all recipes from current week plan
            if (plan.recipes && plan.recipes.length > 0) {
              parts.push(`    • Recettes du plan (${plan.recipes.length} au total):`);

              // Group by date for better organization
              const recipesByDate: Record<string, typeof plan.recipes> = {};
              plan.recipes.forEach(recipe => {
                if (!recipesByDate[recipe.date]) {
                  recipesByDate[recipe.date] = [];
                }
                recipesByDate[recipe.date].push(recipe);
              });

              // Display recipes organized by date (limit to 3 days for brevity)
              const dates = Object.keys(recipesByDate).sort().slice(0, 3);
              dates.forEach(date => {
                const dayRecipes = recipesByDate[date];
                const recipeTitles = dayRecipes.map(r => `${r.title} (${r.mealType})`).join(', ');
                parts.push(`      - ${date}: ${recipeTitles}`);
              });

              if (Object.keys(recipesByDate).length > 3) {
                parts.push(`      ... et ${Object.keys(recipesByDate).length - 3} autres jours`);
              }
            }
          }
        }
        parts.push(`    • Total générés: ${user.nutrition.mealPlans.totalPlansGenerated}`);
        parts.push(`    • Complétés: ${user.nutrition.mealPlans.totalPlansCompleted}`);
        if (user.nutrition.mealPlans.averageWeeklyPlans > 0) {
          parts.push(`    • Fréquence: ${user.nutrition.mealPlans.averageWeeklyPlans.toFixed(1)} plans/semaine`);
        }
      }

      // Shopping Lists
      if (user.nutrition.shoppingLists.hasData) {
        parts.push('\n  🛒 Listes de Courses:');
        if (user.nutrition.shoppingLists.hasActiveList) {
          const list = user.nutrition.shoppingLists.activeList!;
          const progress = list.totalItems > 0
            ? Math.round((list.completedCount / list.totalItems) * 100)
            : 0;
          parts.push(`    • Liste active: "${list.title}" (${list.completedCount}/${list.totalItems} items, ${progress}%)`);
          if (list.estimatedBudgetCents > 0) {
            const budget = (list.estimatedBudgetCents / 100).toFixed(2);
            parts.push(`    • Budget estimé: ${budget}€`);
          }

          // Show critical items (high priority, not checked)
          const criticalItems = list.items.filter(item => item.priority === 'high' && !item.isChecked);
          if (criticalItems.length > 0) {
            parts.push(`    • Items prioritaires restants: ${criticalItems.slice(0, 3).map(i => i.itemName).join(', ')}`);
          }
        }
        parts.push(`    • Total générées: ${user.nutrition.shoppingLists.totalListsGenerated}`);
        parts.push(`    • Complétées: ${user.nutrition.shoppingLists.totalListsCompleted}`);
        if (user.nutrition.shoppingLists.averageCompletionRate > 0) {
          const rate = (user.nutrition.shoppingLists.averageCompletionRate * 100).toFixed(0);
          parts.push(`    • Taux de complétion: ${rate}%`);
        }
      }

      // Fridge Scans & Inventory
      if (user.nutrition.fridgeScans.hasData) {
        parts.push('\n  🧊 Inventaire Frigo:');
        if (user.nutrition.fridgeScans.hasInventory) {
          parts.push(`    • Items disponibles: ${user.nutrition.fridgeScans.totalItemsInFridge}`);

          // Organize items by category
          if (user.nutrition.fridgeScans.currentInventory.length > 0) {
            const itemsByCategory: Record<string, string[]> = {};

            user.nutrition.fridgeScans.currentInventory.forEach(item => {
              const category = item.category || 'autre';
              if (!itemsByCategory[category]) {
                itemsByCategory[category] = [];
              }
              itemsByCategory[category].push(item.name);
            });

            // Display by category with limit of 30 items total
            const categoryEmojis: Record<string, string> = {
              'proteine': '🍗',
              'legume': '🥬',
              'fruit': '🍎',
              'feculent': '🌾',
              'produit_laitier': '🥛',
              'condiment': '🧂',
              'autre': '📦'
            };

            let totalDisplayed = 0;
            const maxDisplay = 30;

            Object.entries(itemsByCategory).forEach(([category, items]) => {
              if (totalDisplayed >= maxDisplay) return;

              const emoji = categoryEmojis[category] || '📦';
              const displayItems = items.slice(0, Math.min(items.length, maxDisplay - totalDisplayed));
              totalDisplayed += displayItems.length;

              parts.push(`    ${emoji} ${category} (${items.length}): ${displayItems.join(', ')}`);
            });

            if (user.nutrition.fridgeScans.totalItemsInFridge > maxDisplay) {
              const remaining = user.nutrition.fridgeScans.totalItemsInFridge - maxDisplay;
              parts.push(`    ... et ${remaining} autres items`);
            }
          }
        }

        if (user.nutrition.fridgeScans.hasActiveSession) {
          parts.push(`    • Scan en cours: ${user.nutrition.fridgeScans.currentSession?.stage}`);
        }

        parts.push(`    • Scans complétés: ${user.nutrition.fridgeScans.totalScansCompleted}`);

        if (user.nutrition.fridgeScans.generatedRecipes.length > 0) {
          parts.push(`    • Recettes générées: ${user.nutrition.fridgeScans.generatedRecipes.length}`);
          const topRecipes = user.nutrition.fridgeScans.generatedRecipes
            .slice(0, 3)
            .map(r => r.title)
            .join(', ');
          parts.push(`    • Récentes: ${topRecipes}`);
        }
      }

      // Culinary Preferences
      if (user.nutrition.culinaryPreferences.favoriteCuisines.length > 0) {
        parts.push('\n  👨‍🍳 Préférences Culinaires:');
        parts.push(`    • Cuisines favorites: ${user.nutrition.culinaryPreferences.favoriteCuisines.join(', ')}`);
        parts.push(`    • Niveau de cuisine: ${user.nutrition.culinaryPreferences.cookingSkillLevel}`);
        parts.push(`    • Temps disponible: ${user.nutrition.culinaryPreferences.mealPrepTime.weekday}min (semaine), ${user.nutrition.culinaryPreferences.mealPrepTime.weekend}min (weekend)`);
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

    // Body Scan & Composition
    if (user.bodyScan.hasData || user.profile.hasCompletedBodyScan) {
      parts.push('\n### COMPOSITION CORPORELLE');

      // Body Scan Status
      if (user.profile.hasCompletedBodyScan) {
        parts.push(`🎯 Scan corporel complet: Réalisé`);
      }

      // Body Scan Data
      if (user.bodyScan.recentScans.length > 0) {
        const lastScanDate = user.bodyScan.lastScanDate
          ? new Date(user.bodyScan.lastScanDate).toLocaleDateString('fr-FR')
          : 'N/A';
        parts.push(`📊 Scans récents: ${user.bodyScan.recentScans.length} (dernier: ${lastScanDate})`);
      }

      // Latest Measurements with Context
      if (user.bodyScan.latestMeasurements) {
        const m = user.bodyScan.latestMeasurements;
        parts.push('📏 Mesures actuelles:');
        if (m.weight) {
          const weightDiff = user.profile.targetWeight
            ? (m.weight - user.profile.targetWeight).toFixed(1)
            : null;
          parts.push(`  - Poids: ${m.weight}kg${weightDiff ? ` (objectif: ${weightDiff > 0 ? '+' : ''}${weightDiff}kg)` : ''}`);
        }
        if (m.bodyFat) {
          const bfCategory = m.bodyFat < 10 ? 'très faible' :
                            m.bodyFat < 15 ? 'athlétique' :
                            m.bodyFat < 20 ? 'normal' :
                            m.bodyFat < 25 ? 'modéré' : 'élevé';
          parts.push(`  - Masse grasse: ${m.bodyFat}% (${bfCategory})`);
        }
        if (m.muscleMass) parts.push(`  - Masse musculaire: ${m.muscleMass}kg`);
        if (m.waist) parts.push(`  - Tour de taille: ${m.waist}cm`);
        if (m.chest) parts.push(`  - Tour de poitrine: ${m.chest}cm`);
        if (m.arms) parts.push(`  - Tour de bras: ${m.arms}cm`);
        if (m.legs) parts.push(`  - Tour de cuisses: ${m.legs}cm`);
      }

      // Progression Trend with Coaching Advice
      if (user.bodyScan.progressionTrend) {
        const trendText = user.bodyScan.progressionTrend === 'improving' ? '📈 En amélioration (continue comme ça!)' :
                          user.bodyScan.progressionTrend === 'declining' ? '📉 En baisse (ajuste ton approche)' :
                          '➡️ Stable (maintiens le cap)';
        parts.push(`Tendance: ${trendText}`);
      }

      // Coaching Context from Avatar Data
      if (user.profile.objective) {
        const objectiveMap = {
          'fat_loss': 'Tu veux perdre du gras - focus cardio et déficit calorique',
          'muscle_gain': 'Tu veux prendre du muscle - focus force et surplus calorique',
          'recomp': 'Tu veux recomposer ton corps - équilibre force et cardio'
        };
        parts.push(`🎯 Objectif actuel: ${objectiveMap[user.profile.objective] || user.profile.objective}`);
      }
    }

    // Energy / Biometrics (Enhanced with Proactive Alerts)
    if (user.energy && user.energy.hasData) {
      parts.push('\n### ⚡ ÉNERGIE & BIOMÉTRIE');
      if (user.energy.hasWearableConnected) {
        parts.push(`💪 Wearable connecté: ${user.energy.connectedDevices[0]?.deviceName || 'Oui'}`);
      }

      // Heart Rate Context
      if (user.energy.biometrics.hrResting || user.energy.biometrics.hrMax) {
        parts.push('❤️ Fréquence cardiaque:');
        if (user.energy.biometrics.hrResting) {
          const hrRestingStatus = user.energy.biometrics.hrResting < 60 ? '(excellent)' :
                                  user.energy.biometrics.hrResting < 70 ? '(bon)' : '(normal)';
          parts.push(`  - Repos: ${user.energy.biometrics.hrResting} bpm ${hrRestingStatus}`);
        }
        if (user.energy.biometrics.hrMax) {
          parts.push(`  - Max observée: ${user.energy.biometrics.hrMax} bpm`);
        }
        if (user.energy.biometrics.hrAvg) {
          parts.push(`  - Moyenne effort: ${user.energy.biometrics.hrAvg} bpm`);
        }
      }

      // HRV with Interpretation
      if (user.energy.biometrics.hrvAvg) {
        const hrvStatus = user.energy.biometrics.hrvAvg > 70 ? '(excellente récupération)' :
                         user.energy.biometrics.hrvAvg > 50 ? '(bonne récupération)' :
                         user.energy.biometrics.hrvAvg > 30 ? '(récupération moyenne)' : '(fatigue détectée)';
        parts.push(`🫀 HRV moyen: ${user.energy.biometrics.hrvAvg} ms ${hrvStatus}`);
      }

      // VO2max with Fitness Level
      if (user.energy.biometrics.vo2maxEstimated) {
        const vo2Status = user.energy.biometrics.vo2maxEstimated > 50 ? '(niveau excellent)' :
                         user.energy.biometrics.vo2maxEstimated > 40 ? '(niveau bon)' :
                         user.energy.biometrics.vo2maxEstimated > 30 ? '(niveau moyen)' : '(niveau à améliorer)';
        parts.push(`🏃 VO2max estimé: ${user.energy.biometrics.vo2maxEstimated} ml/kg/min ${vo2Status}`);
      }

      // Recovery & Fatigue with Proactive Coaching
      const recoveryEmoji = user.energy.recoveryScore >= 70 ? '💚' :
                            user.energy.recoveryScore >= 50 ? '🟡' : '🔴';
      const fatigueEmoji = user.energy.fatigueScore <= 30 ? '💚' :
                          user.energy.fatigueScore <= 60 ? '🟡' : '🔴';

      parts.push(`${recoveryEmoji} Score récupération: ${user.energy.recoveryScore}/100`);
      parts.push(`${fatigueEmoji} Score fatigue: ${user.energy.fatigueScore}/100`);

      // PROACTIVE COACHING ALERTS
      if (user.energy.fatigueScore > 70) {
        parts.push('⚠️ ALERTE: Fatigue élevée détectée - recommande repos ou séance légère');
      } else if (user.energy.recoveryScore < 30) {
        parts.push('⚠️ ALERTE: Récupération faible - propose étirements ou mobilité');
      } else if (user.energy.recoveryScore >= 80 && user.energy.fatigueScore <= 30) {
        parts.push('✅ OPTIMAL: Forme excellente - parfait pour pousser intensité');
      }

      // Training Load with Context
      if (user.energy.trainingLoad7d > 0) {
        const loadStatus = user.energy.trainingLoad7d > 2000 ? 'très élevée' :
                          user.energy.trainingLoad7d > 1500 ? 'élevée' :
                          user.energy.trainingLoad7d > 1000 ? 'modérée' : 'légère';
        const loadEmoji = user.energy.trainingLoad7d > 2000 ? '🔥' :
                         user.energy.trainingLoad7d > 1000 ? '💪' : '📊';
        parts.push(`${loadEmoji} Charge d'entraînement 7j: ${user.energy.trainingLoad7d} (${loadStatus})`);

        if (user.energy.trainingLoad7d > 2500) {
          parts.push('⚠️ Charge très élevée - surveille les signes de surentraînement');
        }
      }

      if (user.energy.recentActivities.length > 0) {
        const lastActivityDate = user.energy.lastActivityDate
          ? new Date(user.energy.lastActivityDate).toLocaleDateString('fr-FR')
          : 'N/A';
        parts.push(`📱 Activités récentes: ${user.energy.recentActivities.length} (dernière: ${lastActivityDate})`);
      }
    }

    // Temporal / Planning (Enhanced with Proactive Suggestions)
    if (user.temporal && user.temporal.hasData) {
      parts.push('\n### ⏰ PATTERNS TEMPORELS & PLANIFICATION');

      // Weekly Frequency with Coaching
      if (user.temporal.weeklyFrequency > 0) {
        const frequencyStatus = user.temporal.weeklyFrequency >= 5 ? '(très actif)' :
                                user.temporal.weeklyFrequency >= 3 ? '(bon rythme)' :
                                user.temporal.weeklyFrequency >= 2 ? '(modéré)' : '(à augmenter)';
        parts.push(`📊 Fréquence hebdomadaire: ${user.temporal.weeklyFrequency} séances/semaine ${frequencyStatus}`);
      }

      // Preferred Time with Context
      if (user.temporal.preferredTimeOfDay) {
        const timeMap = { morning: 'matin', afternoon: 'après-midi', evening: 'soir' };
        const timeEmoji = { morning: '🌅', afternoon: '☀️', evening: '🌙' };
        parts.push(`${timeEmoji[user.temporal.preferredTimeOfDay]} Horaire préféré: ${timeMap[user.temporal.preferredTimeOfDay]}`);
      }

      // Session Duration
      if (user.temporal.averageSessionDuration > 0) {
        const durationStatus = user.temporal.averageSessionDuration >= 60 ? '(séances complètes)' :
                               user.temporal.averageSessionDuration >= 45 ? '(durée optimale)' : '(séances courtes)';
        parts.push(`⏱️ Durée moyenne séance: ${user.temporal.averageSessionDuration} min ${durationStatus}`);
      }

      // Consistency Score with Motivation
      if (user.temporal.consistencyScore > 0) {
        const consistencyEmoji = user.temporal.consistencyScore >= 70 ? '🏆' :
                                 user.temporal.consistencyScore >= 50 ? '💪' : '📈';
        const consistencyText = user.temporal.consistencyScore >= 70 ? 'excellente - continue!' :
                                user.temporal.consistencyScore >= 50 ? 'bonne - maintiens le cap' : 'à améliorer - reste régulier';
        parts.push(`${consistencyEmoji} Consistance: ${user.temporal.consistencyScore}/100 (${consistencyText})`);
      }

      // Main Training Pattern
      if (user.temporal.trainingPatterns.length > 0) {
        const topPattern = user.temporal.trainingPatterns[0];
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const timeMap = { morning: 'matin', afternoon: 'après-midi', evening: 'soir' };
        parts.push(`📅 Pattern principal: ${dayNames[topPattern.dayOfWeek]} ${timeMap[topPattern.timeOfDay]} (${topPattern.frequency}x)`);

        // PROACTIVE SCHEDULING SUGGESTION
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();

        if (topPattern.dayOfWeek === currentDay) {
          const isOptimalTime = (topPattern.timeOfDay === 'morning' && currentHour >= 6 && currentHour < 12) ||
                               (topPattern.timeOfDay === 'afternoon' && currentHour >= 12 && currentHour < 17) ||
                               (topPattern.timeOfDay === 'evening' && currentHour >= 17 && currentHour < 22);
          if (isOptimalTime) {
            parts.push('⏰ SUGGESTION: C\'est ton créneau habituel - bon moment pour t\'entraîner!');
          }
        }
      }

      // Rest Days Pattern
      if (user.temporal.restDayPatterns.preferredRestDays.length > 0) {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const restDays = user.temporal.restDayPatterns.preferredRestDays
          .map(d => dayNames[d])
          .join(', ');
        parts.push(`😴 Jours de repos habituels: ${restDays}`);
      }

      // Optimal Training Times
      if (user.temporal.optimalTrainingTimes && user.temporal.optimalTrainingTimes.length > 0) {
        parts.push('\n🎯 Créneaux optimaux détectés:');
        user.temporal.optimalTrainingTimes.slice(0, 3).forEach((optimal, idx) => {
          const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          const timeMap = { morning: 'matin', afternoon: 'après-midi', evening: 'soir' };
          parts.push(`  ${idx + 1}. ${dayNames[optimal.dayOfWeek]} ${timeMap[optimal.timeOfDay]} (score: ${optimal.score})`);
        });
      }
    }

    // Enhanced Nutrition with Fridge & Culinary
    if (user.nutrition && user.nutrition.fridgeInventory && user.nutrition.fridgeInventory.length > 0) {
      parts.push('\n### CUISINE & FRIGO');
      parts.push(`Inventaire frigo: ${user.nutrition.fridgeInventory.length} items`);
      if (user.nutrition.lastFridgeScanDate) {
        const scanDate = new Date(user.nutrition.lastFridgeScanDate).toLocaleDateString('fr-FR');
        parts.push(`Dernier scan: ${scanDate}`);
      }
      if (user.nutrition.generatedRecipes.length > 0) {
        parts.push(`Recettes générées: ${user.nutrition.generatedRecipes.length}`);
      }
      if (user.nutrition.culinaryPreferences.favoriteCuisines.length > 0) {
        parts.push(`Cuisines préférées: ${user.nutrition.culinaryPreferences.favoriteCuisines.join(', ')}`);
      }
      parts.push(`Niveau cuisine: ${user.nutrition.culinaryPreferences.cookingSkillLevel}`);
      parts.push(`Temps préparation: ${user.nutrition.culinaryPreferences.mealPrepTime.weekday}min (semaine), ${user.nutrition.culinaryPreferences.mealPrepTime.weekend}min (week-end)`);
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
