/**
 * UserKnowledgeBase - Central User Data Repository
 * Aggregates all user data from Supabase into unified knowledge structure
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '../../../lib/utils/logger';
import { calculateAge } from '../../../lib/utils/dateUtils';
import type {
  UserKnowledge,
  ProfileKnowledge,
  TrainingKnowledge,
  EquipmentKnowledge,
  NutritionKnowledge,
  FastingKnowledge,
  BodyScanKnowledge,
  EnergyKnowledge,
  TemporalKnowledge,
  ForgeType
} from '../types';
import type { CacheManager } from '../core/CacheManager';
import { TrainingDataCollector } from './collectors/TrainingDataCollector';
import { EquipmentDataCollector } from './collectors/EquipmentDataCollector';
import { NutritionDataCollector } from './collectors/NutritionDataCollector';
import { FastingDataCollector } from './collectors/FastingDataCollector';
import { BodyScanDataCollector } from './collectors/BodyScanDataCollector';
import { EnergyDataCollector } from './collectors/EnergyDataCollector';
import { TemporalDataCollector } from './collectors/TemporalDataCollector';
import { TodayDataCollector, type TodayData } from './collectors/TodayDataCollector';
import { BreastfeedingDataCollector, type BreastfeedingKnowledge } from './collectors/BreastfeedingDataCollector';

export class UserKnowledgeBase {
  private supabase: SupabaseClient;
  private cacheManager: CacheManager;
  private currentKnowledge: UserKnowledge | null = null;
  private rawProfile: any | null = null; // Store complete raw profile from Supabase
  private trainingCollector: TrainingDataCollector;
  private equipmentCollector: EquipmentDataCollector;
  private nutritionCollector: NutritionDataCollector;
  private fastingCollector: FastingDataCollector;
  private bodyScanCollector: BodyScanDataCollector;
  private energyCollector: EnergyDataCollector;
  private temporalCollector: TemporalDataCollector;
  private todayCollector: TodayDataCollector;
  private breastfeedingCollector: BreastfeedingDataCollector;
  private todayData: TodayData | null = null;

  constructor(supabase: SupabaseClient, cacheManager: CacheManager) {
    this.supabase = supabase;
    this.cacheManager = cacheManager;
    this.trainingCollector = new TrainingDataCollector(supabase);
    this.equipmentCollector = new EquipmentDataCollector(supabase);
    this.nutritionCollector = new NutritionDataCollector(supabase);
    this.fastingCollector = new FastingDataCollector(supabase);
    this.bodyScanCollector = new BodyScanDataCollector(supabase);
    this.energyCollector = new EnergyDataCollector(supabase);
    this.temporalCollector = new TemporalDataCollector(supabase);
    this.todayCollector = new TodayDataCollector(supabase);
    this.breastfeedingCollector = new BreastfeedingDataCollector(supabase);
  }

  /**
   * Load complete user knowledge
   */
  async loadUserKnowledge(userId: string): Promise<UserKnowledge> {
    const startTime = Date.now();

    try {
      logger.info('USER_KNOWLEDGE_BASE', 'Loading user knowledge', { userId });

      // Check cache first
      const cacheKey = `knowledge:${userId}`;
      const cached = this.cacheManager.get<UserKnowledge>(cacheKey);

      if (cached) {
        logger.info('USER_KNOWLEDGE_BASE', 'Knowledge loaded from cache', { userId });
        this.currentKnowledge = cached;
        return cached;
      }

      // Load data in parallel with graceful error handling
      const results = await Promise.allSettled([
        this.loadProfileKnowledge(userId),
        this.trainingCollector.collect(userId),
        this.equipmentCollector.collect(userId),
        this.nutritionCollector.collect(userId),
        this.fastingCollector.collect(userId),
        this.bodyScanCollector.collect(userId),
        this.energyCollector.collect(userId),
        this.temporalCollector.collect(userId),
        this.todayCollector.collect(userId),
        this.breastfeedingCollector.collect(userId)
      ]);

      const profile = results[0].status === 'fulfilled'
        ? results[0].value
        : this.getDefaultProfileKnowledge(userId);

      const training = results[1].status === 'fulfilled'
        ? results[1].value
        : this.getDefaultTrainingKnowledge();

      const equipment = results[2].status === 'fulfilled'
        ? results[2].value
        : this.getDefaultEquipmentKnowledge();

      const nutrition = results[3].status === 'fulfilled'
        ? results[3].value
        : this.getDefaultNutritionKnowledge();

      const fasting = results[4].status === 'fulfilled'
        ? results[4].value
        : this.getDefaultFastingKnowledge();

      const bodyScan = results[5].status === 'fulfilled'
        ? results[5].value
        : this.getDefaultBodyScanKnowledge();

      const energy = results[6].status === 'fulfilled'
        ? results[6].value
        : this.getDefaultEnergyKnowledge();

      const temporal = results[7].status === 'fulfilled'
        ? results[7].value
        : this.getDefaultTemporalKnowledge();

      this.todayData = results[8].status === 'fulfilled'
        ? results[8].value
        : null;

      const breastfeeding = results[9].status === 'fulfilled'
        ? results[9].value
        : this.getDefaultBreastfeedingKnowledge();

      // Log any failures
      const failures = [
        { index: 0, name: 'profile' },
        { index: 1, name: 'training' },
        { index: 2, name: 'equipment' },
        { index: 3, name: 'nutrition' },
        { index: 4, name: 'fasting' },
        { index: 5, name: 'bodyScan' },
        { index: 6, name: 'energy' },
        { index: 7, name: 'temporal' },
        { index: 8, name: 'today' },
        { index: 9, name: 'breastfeeding' }
      ];

      failures.forEach(({ index, name }) => {
        if (results[index].status === 'rejected') {
          logger.warn('USER_KNOWLEDGE_BASE', `Failed to load ${name} data, using defaults`, {
            error: results[index].reason
          });
        }
      });

      // Forges now fully implemented with real data

      const knowledge: UserKnowledge = {
        profile,
        training,
        equipment,
        nutrition,
        fasting,
        bodyScan,
        energy,
        temporal,
        lastUpdated: {
          training: Date.now(),
          equipment: Date.now(),
          nutrition: Date.now(),
          fasting: Date.now(),
          'body-scan': Date.now(),
          energy: Date.now(),
          temporal: Date.now()
        },
        completeness: {
          training: this.calculateCompleteness(training),
          equipment: this.calculateCompleteness(equipment),
          nutrition: this.calculateCompleteness(nutrition),
          fasting: this.calculateCompleteness(fasting),
          'body-scan': this.calculateCompleteness(bodyScan),
          energy: this.calculateCompleteness(energy),
          temporal: this.calculateCompleteness(temporal)
        }
      };

      // Cache the knowledge
      this.cacheManager.set(cacheKey, knowledge, 5 * 60 * 1000); // 5 minutes TTL

      this.currentKnowledge = knowledge;

      const loadTime = Date.now() - startTime;
      logger.info('USER_KNOWLEDGE_BASE', 'Knowledge loaded successfully', {
        userId,
        loadTime: `${loadTime}ms`,
        trainingCompleteness: knowledge.completeness.training,
        equipmentCompleteness: knowledge.completeness.equipment,
        nutritionCompleteness: knowledge.completeness.nutrition,
        fastingCompleteness: knowledge.completeness.fasting,
        bodyScanCompleteness: knowledge.completeness['body-scan'],
        energyCompleteness: knowledge.completeness.energy,
        temporalCompleteness: knowledge.completeness.temporal,
        todayActivities: this.todayData?.totalActivities || 0
      });

      return knowledge;
    } catch (error) {
      logger.error('USER_KNOWLEDGE_BASE', 'Failed to load knowledge', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get current user knowledge (cached)
   */
  async getUserKnowledge(): Promise<UserKnowledge> {
    if (!this.currentKnowledge) {
      throw new Error('Knowledge not loaded. Call loadUserKnowledge first.');
    }

    return this.currentKnowledge;
  }

  /**
   * Get raw profile data from Supabase (for adapters)
   * This is used by ProfileKnowledgeAdapter to access all profile fields
   */
  getRawProfile(): any | null {
    return this.rawProfile;
  }

  /**
   * Refresh specific forge data
   */
  async refreshForge(userId: string, forgeType: ForgeType): Promise<void> {
    logger.info('USER_KNOWLEDGE_BASE', 'Refreshing forge data', { userId, forgeType });

    if (!this.currentKnowledge) {
      await this.loadUserKnowledge(userId);
      return;
    }

    switch (forgeType) {
      case 'training':
        this.currentKnowledge.training = await this.trainingCollector.collect(userId);
        this.currentKnowledge.lastUpdated.training = Date.now();
        this.currentKnowledge.completeness.training = this.calculateCompleteness(
          this.currentKnowledge.training
        );
        break;
      case 'equipment':
        this.currentKnowledge.equipment = await this.equipmentCollector.collect(userId);
        this.currentKnowledge.lastUpdated.equipment = Date.now();
        this.currentKnowledge.completeness.equipment = this.calculateCompleteness(
          this.currentKnowledge.equipment
        );
        break;
      case 'nutrition':
        this.currentKnowledge.nutrition = await this.nutritionCollector.collect(userId);
        this.currentKnowledge.lastUpdated.nutrition = Date.now();
        this.currentKnowledge.completeness.nutrition = this.calculateCompleteness(
          this.currentKnowledge.nutrition
        );
        break;
      case 'fasting':
        this.currentKnowledge.fasting = await this.fastingCollector.collect(userId);
        this.currentKnowledge.lastUpdated.fasting = Date.now();
        this.currentKnowledge.completeness.fasting = this.calculateCompleteness(
          this.currentKnowledge.fasting
        );
        break;
      case 'body-scan':
        this.currentKnowledge.bodyScan = await this.bodyScanCollector.collect(userId);
        this.currentKnowledge.lastUpdated['body-scan'] = Date.now();
        this.currentKnowledge.completeness['body-scan'] = this.calculateCompleteness(
          this.currentKnowledge.bodyScan
        );
        break;
      case 'energy':
        this.currentKnowledge.energy = await this.energyCollector.collect(userId);
        this.currentKnowledge.lastUpdated.energy = Date.now();
        this.currentKnowledge.completeness.energy = this.calculateCompleteness(
          this.currentKnowledge.energy
        );
        break;
      case 'temporal':
        this.currentKnowledge.temporal = await this.temporalCollector.collect(userId);
        this.currentKnowledge.lastUpdated.temporal = Date.now();
        this.currentKnowledge.completeness.temporal = this.calculateCompleteness(
          this.currentKnowledge.temporal
        );
        break;
      default:
        logger.warn('USER_KNOWLEDGE_BASE', 'Unknown forge type', { forgeType });
    }

    // Invalidate cache
    this.cacheManager.invalidateForge(forgeType);

    logger.info('USER_KNOWLEDGE_BASE', 'Forge data refreshed', { userId, forgeType });
  }

  /**
   * Load profile knowledge
   */
  private async loadProfileKnowledge(userId: string): Promise<ProfileKnowledge> {
    const { data: profile, error } = await this.supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('USER_KNOWLEDGE_BASE', 'Failed to load profile', { userId, error });
      throw error;
    }

    // If no profile exists, return default
    if (!profile) {
      logger.warn('USER_KNOWLEDGE_BASE', 'No profile found, using defaults', { userId });
      this.rawProfile = null;
      return this.getDefaultProfileKnowledge(userId);
    }

    // Store raw profile for adapters (important for ProfileKnowledgeAdapter)
    this.rawProfile = profile;

    return {
      // Core Identity
      userId,
      displayName: profile.display_name,
      fullName: profile.full_name,
      email: profile.email,

      // Physical Attributes
      age: calculateAge(profile.birthdate),
      sex: profile.sex,
      birthdate: profile.birthdate,
      height: profile.height_cm,
      weight: profile.weight_kg,
      targetWeight: profile.target_weight_kg,
      bodyFatPerc: profile.body_fat_perc,

      // Objectives & Activity
      objectives: profile.objectives || [], // Legacy support
      objective: profile.objective,
      activityLevel: profile.activity_level,
      jobCategory: profile.job_category,

      // Training Preferences
      preferredDisciplines: profile.preferred_disciplines || [],
      defaultDiscipline: profile.default_discipline,
      level: profile.level, // Legacy support
      equipment: profile.equipment || [], // Legacy support

      // Localization
      country: profile.country,
      language: profile.language,
      preferredLanguage: profile.preferred_language,

      // Body Scan Status (for coaching awareness)
      hasCompletedBodyScan: profile.has_completed_body_scan,

      // Metadata
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  }

  /**
   * Get default profile knowledge when loading fails
   */
  private getDefaultProfileKnowledge(userId: string): ProfileKnowledge {
    return {
      // Core Identity
      userId,
      displayName: undefined,
      fullName: undefined,
      email: undefined,

      // Physical Attributes
      age: undefined,
      sex: undefined,
      birthdate: undefined,
      height: undefined,
      weight: undefined,
      targetWeight: undefined,
      bodyFatPerc: undefined,

      // Objectives & Activity
      objectives: [], // Legacy support
      objective: undefined,
      activityLevel: undefined,
      jobCategory: undefined,

      // Training Preferences
      preferredDisciplines: [],
      defaultDiscipline: undefined,
      level: undefined, // Legacy support
      equipment: [], // Legacy support

      // Localization
      country: undefined,
      language: undefined,
      preferredLanguage: undefined,

      // Body Scan Status
      hasCompletedBodyScan: false,

      // Metadata
      createdAt: undefined,
      updatedAt: undefined
    };
  }

  /**
   * Get default training knowledge when loading fails
   */
  private getDefaultTrainingKnowledge(): TrainingKnowledge {
    return {
      recentSessions: [],
      currentLoads: {},
      exercisePreferences: [],
      progressionPatterns: [],
      avgRPE: 0,
      weeklyVolume: 0,
      lastSessionDate: null
    };
  }

  /**
   * Get default equipment knowledge when loading fails
   */
  private getDefaultEquipmentKnowledge(): EquipmentKnowledge {
    return {
      locations: [],
      availableEquipment: [],
      defaultLocationId: null,
      lastScanDate: null
    };
  }

  /**
   * Get default nutrition knowledge when loading fails
   */
  private getDefaultNutritionKnowledge(): NutritionKnowledge {
    return {
      recentMeals: [],
      mealPlans: {
        activePlans: [],
        recentPlans: [],
        currentWeekPlan: null,
        totalPlansGenerated: 0,
        totalPlansCompleted: 0,
        lastPlanDate: null,
        averageWeeklyPlans: 0,
        hasActivePlan: false,
        hasData: false
      },
      shoppingLists: {
        activeList: null,
        recentLists: [],
        totalListsGenerated: 0,
        totalListsCompleted: 0,
        lastListDate: null,
        averageItemsPerList: 0,
        averageCompletionRate: 0,
        totalBudgetSpent: 0,
        hasActiveList: false,
        hasData: false
      },
      fridgeScans: {
        currentSession: null,
        recentSessions: [],
        currentInventory: [],
        totalItemsInFridge: 0,
        lastScanDate: null,
        totalScansCompleted: 0,
        averageItemsPerScan: 0,
        generatedRecipes: [],
        hasActiveSession: false,
        hasInventory: false,
        hasData: false
      },
      scanFrequency: 0,
      lastScanDate: null,
      averageCalories: 0,
      averageProtein: 0,
      dietaryPreferences: [],
      culinaryPreferences: {
        favoriteCuisines: [],
        cookingSkillLevel: 'intermediate',
        mealPrepTime: { weekday: 30, weekend: 60 }
      },
      hasData: false
    };
  }

  /**
   * Get default fasting knowledge when loading fails
   */
  private getDefaultFastingKnowledge(): FastingKnowledge {
    return {
      recentSessions: [],
      currentSession: null,
      averageFastingDuration: 0,
      totalSessionsCompleted: 0,
      preferredProtocol: null,
      lastSessionDate: null,
      hasData: false
    };
  }

  /**
   * Get default body scan knowledge when loading fails
   */
  private getDefaultBodyScanKnowledge(): BodyScanKnowledge {
    return {
      recentScans: [],
      lastScanDate: null,
      latestMeasurements: null,
      progressionTrend: null,
      hasData: false
    };
  }

  /**
   * Get default energy knowledge when loading fails
   */
  private getDefaultEnergyKnowledge(): EnergyKnowledge {
    return {
      recentActivities: [],
      connectedDevices: [],
      hasWearableConnected: false,
      biometrics: {
        hrResting: null,
        hrMax: null,
        hrAvg: null,
        hrvAvg: null,
        vo2maxEstimated: null
      },
      recoveryScore: 50,
      fatigueScore: 50,
      trainingLoad7d: 0,
      lastActivityDate: null,
      hasData: false
    };
  }

  /**
   * Get default temporal knowledge when loading fails
   */
  private getDefaultTemporalKnowledge(): TemporalKnowledge {
    return {
      trainingPatterns: [],
      availabilityWindows: [],
      optimalTrainingTimes: [],
      restDayPatterns: {
        preferredRestDays: [],
        averageRestDaysBetweenSessions: 0
      },
      weeklyFrequency: 0,
      preferredTimeOfDay: null,
      averageSessionDuration: 0,
      consistencyScore: 0,
      hasData: false
    };
  }

  private getDefaultBreastfeedingKnowledge(): BreastfeedingKnowledge {
    return {
      hasData: false,
      isBreastfeeding: false,
      breastfeedingType: null,
      babyAgeMonths: null,
      startDate: null,
      durationMonths: null,
      nutritionalNeeds: {
        extraCalories: 0,
        extraProtein: 0,
        calciumNeed: 1000,
        ironNeed: 18,
        omega3Need: 250,
        waterIntake: 2.0,
      },
      recommendations: {
        priorityFoods: [],
        limitedFoods: [],
        avoidFoods: [],
        mealFrequency: 'Standard',
      },
      notes: null,
    };
  }

  /**
   * Get today's data
   */
  getTodayData(): TodayData | null {
    return this.todayData;
  }

  /**
   * Calculate completeness score (0-100)
   */
  private calculateCompleteness(data: any): number {
    if (!data) return 0;

    let score = 0;
    let maxScore = 0;

    // Generic completeness calculation
    const keys = Object.keys(data);
    for (const key of keys) {
      maxScore++;
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if (Array.isArray(data[key])) {
          if (data[key].length > 0) score++;
        } else {
          score++;
        }
      }
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }
}
