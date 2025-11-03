import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import React from 'react';

interface Activity {
  id: string;
  type: string;
  duration_min: number;
  calories_est: number;
  intensity: string;
  timestamp: string;
  notes?: string;
}

interface CalorieProgressCardProps {
  todayStats?: {
    totalCalories: number;
    activitiesCount: number;
    totalDuration: number;
  };
  profile?: any;
  todayActivities?: Activity[];
}

interface ActivityProgress {
  status: 'low' | 'optimal' | 'high';
  color: string;
  message: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  mainMetricLabel: string;
  subMetricLabel: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  icon: keyof typeof ICONS;
  progressPercentage: number;
}

/**
 * Calculer les minutes de musculation à partir des activités
 */
function calculateStrengthMinutes(activities: Activity[]): number {
  const strengthTypes = ['musculation', 'crossfit', 'bodyweight', 'weight', 'force', 'strength'];
  
  return activities
    .filter(activity => 
      strengthTypes.some(type => 
        activity.type.toLowerCase().includes(type)
      )
    )
    .reduce((total, activity) => total + activity.duration_min, 0);
}

/**
 * Analyser la progression d'activité selon l'objectif utilisateur
 */
function analyzeActivityProgress(todayStats?: any, profile?: any, todayActivities: Activity[] = []): ActivityProgress {
  const objective = profile?.objective;
  const activityLevel = profile?.activity_level;
  
  // Logique spécifique selon l'objectif
  switch (objective) {
    case 'muscle_gain': {
      const strengthMinutes = calculateStrengthMinutes(todayActivities);
      const targetMinutes = getTargetStrengthMinutes(activityLevel);
      const progressPercentage = (strengthMinutes / targetMinutes) * 100;
      
      if (progressPercentage < 50) {
        return {
          status: 'low',
          color: '#A855F7',
          message: 'Volume de force insuffisant',
          recommendation: 'Ajoutez des exercices de musculation pour stimuler la croissance',
          priority: 'high',
          mainMetricLabel: 'Volume de Force',
          subMetricLabel: 'Minutes de musculation',
          currentValue: strengthMinutes,
          targetValue: targetMinutes,
          unit: 'min',
          icon: 'Dumbbell',
          progressPercentage
        };
      }
      
      if (progressPercentage >= 50 && progressPercentage < 100) {
        return {
          status: 'optimal',
          color: '#A855F7',
          message: 'Bon volume d\'entraînement',
          recommendation: 'Continuez pour atteindre votre volume optimal de force',
          priority: 'medium',
          mainMetricLabel: 'Volume de Force',
          subMetricLabel: 'Minutes de musculation',
          currentValue: strengthMinutes,
          targetValue: targetMinutes,
          unit: 'min',
          icon: 'Dumbbell',
          progressPercentage
        };
      }
      
      return {
        status: 'high',
        color: '#A855F7',
        message: 'Objectif de force atteint !',
        recommendation: 'Excellent volume d\'entraînement, maintenez cette intensité',
        priority: 'low',
        mainMetricLabel: 'Volume de Force',
        subMetricLabel: 'Minutes de musculation',
        currentValue: strengthMinutes,
        targetValue: targetMinutes,
        unit: 'min',
        icon: 'Dumbbell',
        progressPercentage
      };
    }
    
    case 'fat_loss': {
      const totalCalories = todayStats?.totalCalories || 0;
      const targetCalories = getTargetCalories(activityLevel, 'fat_loss');
      const progressPercentage = (totalCalories / targetCalories) * 100;
      
      if (progressPercentage < 50) {
        return {
          status: 'low',
          color: '#EF4444',
          message: 'Déficit énergétique insuffisant',
          recommendation: 'Augmentez le cardio et la musculation pour brûler plus de calories',
          priority: 'high',
          mainMetricLabel: 'Énergie Brûlée',
          subMetricLabel: 'Calories de perte',
          currentValue: totalCalories,
          targetValue: targetCalories,
          unit: 'kcal',
          icon: 'Fire',
          progressPercentage
        };
      }
      
      if (progressPercentage >= 50 && progressPercentage < 100) {
        return {
          status: 'optimal',
          color: '#EF4444',
          message: 'Bon déficit énergétique',
          recommendation: 'Continuez ce rythme pour optimiser la perte de graisse',
          priority: 'medium',
          mainMetricLabel: 'Énergie Brûlée',
          subMetricLabel: 'Calories de perte',
          currentValue: totalCalories,
          targetValue: targetCalories,
          unit: 'kcal',
          icon: 'Fire',
          progressPercentage
        };
      }
      
      return {
        status: 'high',
        color: '#EF4444',
        message: 'Objectif de perte atteint !',
        recommendation: 'Excellent déficit énergétique, vous êtes sur la bonne voie',
        priority: 'low',
        mainMetricLabel: 'Énergie Brûlée',
        subMetricLabel: 'Calories de perte',
        currentValue: totalCalories,
        targetValue: targetCalories,
        unit: 'kcal',
        icon: 'Fire',
        progressPercentage
      };
    }
    
    case 'recomp': {
      const totalCalories = todayStats?.totalCalories || 0;
      const strengthMinutes = calculateStrengthMinutes(todayActivities);
      const targetCalories = getTargetCalories(activityLevel, 'recomp');
      const targetStrength = getTargetStrengthMinutes(activityLevel) * 0.7; // Objectif réduit pour recomp
      
      // Score combiné : 60% calories + 40% force
      const calorieScore = Math.min(100, (totalCalories / targetCalories) * 100);
      const strengthScore = Math.min(100, (strengthMinutes / targetStrength) * 100);
      const combinedScore = (calorieScore * 0.6) + (strengthScore * 0.4);
      
      if (combinedScore < 50) {
        return {
          status: 'low',
          color: '#F59E0B',
          message: 'Équilibre énergétique insuffisant',
          recommendation: 'Combinez cardio et musculation pour une recomposition optimale',
          priority: 'high',
          mainMetricLabel: 'Équilibre Énergétique',
          subMetricLabel: 'Calories & Force',
          currentValue: totalCalories,
          targetValue: targetCalories,
          unit: 'kcal',
          icon: 'GitCompare',
          progressPercentage: combinedScore
        };
      }
      
      if (combinedScore >= 50 && combinedScore < 100) {
        return {
          status: 'optimal',
          color: '#F59E0B',
          message: 'Bon équilibre énergétique',
          recommendation: 'Maintenez ce mix cardio-force pour la recomposition',
          priority: 'medium',
          mainMetricLabel: 'Équilibre Énergétique',
          subMetricLabel: 'Calories & Force',
          currentValue: totalCalories,
          targetValue: targetCalories,
          unit: 'kcal',
          icon: 'GitCompare',
          progressPercentage: combinedScore
        };
      }
      
      return {
        status: 'high',
        color: '#F59E0B',
        message: 'Équilibre optimal atteint !',
        recommendation: 'Parfait équilibre pour la recomposition corporelle',
        priority: 'low',
        mainMetricLabel: 'Équilibre Énergétique',
        subMetricLabel: 'Calories & Force',
        currentValue: totalCalories,
        targetValue: targetCalories,
        unit: 'kcal',
        icon: 'GitCompare',
        progressPercentage: combinedScore
      };
    }
    
    default: {
      // Logique par défaut (calories)
      const totalCalories = todayStats?.totalCalories || 0;
      const targetCalories = getTargetCalories(activityLevel, 'maintenance');
      const progressPercentage = (totalCalories / targetCalories) * 100;
      
      if (progressPercentage < 50) {
        return {
          status: 'low',
          color: '#3B82F6',
          message: 'Énergie faiblement forgée',
          recommendation: 'Ajoutez des activités pour atteindre votre objectif',
          priority: 'high',
          mainMetricLabel: 'Énergie Quotidienne',
          subMetricLabel: 'Calories forgées',
          currentValue: totalCalories,
          targetValue: targetCalories,
          unit: 'kcal',
          icon: 'Zap',
          progressPercentage
        };
      }
      
      if (progressPercentage >= 50 && progressPercentage < 100) {
        return {
          status: 'optimal',
          color: '#3B82F6',
          message: 'Bonne progression énergétique',
          recommendation: 'Continuez pour atteindre votre objectif quotidien',
          priority: 'medium',
          mainMetricLabel: 'Énergie Quotidienne',
          subMetricLabel: 'Calories forgées',
          currentValue: totalCalories,
          targetValue: targetCalories,
          unit: 'kcal',
          icon: 'Zap',
          progressPercentage
        };
      }
      
      return {
        status: 'high',
        color: '#3B82F6',
        message: 'Objectif énergétique atteint !',
        recommendation: 'Excellente journée active, maintenez ce rythme',
        priority: 'low',
        mainMetricLabel: 'Énergie Quotidienne',
        subMetricLabel: 'Calories forgées',
        currentValue: totalCalories,
        targetValue: targetCalories,
        unit: 'kcal',
        icon: 'Zap',
        progressPercentage
      };
    }
  }
}

/**
 * Obtenir l'objectif de calories selon le niveau d'activité et l'objectif
 */
function getTargetCalories(activityLevel?: string, objective?: string): number {
  let baseTarget = 300;
  
  // Ajustement selon le niveau d'activité
  switch (activityLevel) {
    case 'athlete': baseTarget = 500; break;
    case 'active': baseTarget = 400; break;
    case 'moderate': baseTarget = 350; break;
    case 'light': baseTarget = 250; break;
    case 'sedentary': baseTarget = 200; break;
  }
  
  // Ajustement selon l'objectif
  switch (objective) {
    case 'fat_loss': return baseTarget + 100; // Plus de calories pour la perte
    case 'recomp': return baseTarget + 50;    // Légèrement plus pour la recomp
    case 'maintenance': return baseTarget;
    default: return baseTarget;
  }
}

/**
 * Obtenir l'objectif de minutes de musculation selon le niveau d'activité
 */
function getTargetStrengthMinutes(activityLevel?: string): number {
  // Objectifs basés sur les recommandations de volume d'entraînement
  // Convertis en objectif quotidien (180 min/semaine = ~26 min/jour)
  switch (activityLevel) {
    case 'athlete': return 40;     // ~280 min/semaine
    case 'active': return 30;      // ~210 min/semaine  
    case 'moderate': return 25;    // ~175 min/semaine
    case 'light': return 20;       // ~140 min/semaine
    case 'sedentary': return 15;   // ~105 min/semaine
    default: return 25;            // ~175 min/semaine par défaut
  }
}

/**
 * Calorie Progress Card - Suivi de progression dynamique selon l'objectif
 * Affiche différentes métriques selon l'objectif fitness de l'utilisateur
 */
const CalorieProgressCard: React.FC<CalorieProgressCardProps> = ({ 
  todayStats, 
  profile, 
  todayActivities = [] 
}) => {
  const activityProgress = analyzeActivityProgress(todayStats, profile, todayActivities);
  
  return (
    <GlassCard
      className="calorie-progress-card"
      style={{
        '--recommendation-color': activityProgress.color
      }}
    >
      <div className="calorie-progress-header">
        <div className="calorie-progress-icon">
          <SpatialIcon
            Icon={ICONS[activityProgress.icon]}
            size={36}
            style={{ color: activityProgress.color }}
          />
        </div>
        <div className="calorie-progress-info">
          <h3 className="calorie-progress-title">{activityProgress.mainMetricLabel} Aujourd'hui</h3>
          <p className="calorie-progress-subtitle">Progression vers votre objectif {activityProgress.subMetricLabel.toLowerCase()} du jour</p>
        </div>
        <div className="calorie-progress-percentage">
          <div className="calorie-progress-percentage-value">{Math.round(activityProgress.progressPercentage)}%</div>
          <div className="calorie-progress-percentage-label">Complété</div>
        </div>
      </div>

      <div className="calorie-progress-message">
        <div className="calorie-progress-message-header">
          <SpatialIcon
            Icon={activityProgress.priority === 'high' ? ICONS.AlertCircle :
                  activityProgress.priority === 'medium' ? ICONS.Info : ICONS.Check}
            size={16}
            style={{ color: activityProgress.color }}
            className="mt-0.5"
          />
          <div className="calorie-progress-message-content">
            <p className="calorie-progress-message-title" style={{ color: activityProgress.color }}>
              {activityProgress.message}
            </p>
            <p className="calorie-progress-message-description">
              {activityProgress.recommendation}
            </p>
          </div>
        </div>
      </div>

      <div className="calorie-progress-bar-container">
        <div
          className="calorie-progress-bar-fill"
          style={{
            width: `${Math.min(100, activityProgress.progressPercentage)}%`,
            background: `linear-gradient(90deg, ${activityProgress.color}, color-mix(in srgb, ${activityProgress.color} 80%, white))`
          }}
        >
          <div className="calorie-progress-bar-shimmer" />
        </div>
      </div>

      <div className="calorie-progress-values">
        <span>{activityProgress.currentValue} {activityProgress.unit}</span>
        <span>{activityProgress.targetValue} {activityProgress.unit}</span>
      </div>

      <div className="calorie-progress-objective">
        Objectif d'aujourd'hui : {activityProgress.subMetricLabel.toLowerCase()}
        {profile?.objective && ` • Cible: ${
          profile.objective === 'fat_loss' ? 'Perte de graisse' :
          profile.objective === 'muscle_gain' ? 'Prise de muscle' :
          profile.objective === 'recomp' ? 'Recomposition' : 'Maintenance'
        }`}
      </div>

      {/* Détails supplémentaires pour la recomposition */}
      {profile?.objective === 'recomp' && (
        <div className="calorie-progress-details-grid">
          <div className="calorie-progress-detail-card" style={{
            background: 'color-mix(in srgb, #EF4444 8%, transparent)',
            border: '1px solid color-mix(in srgb, #EF4444 15%, transparent)'
          }}>
            <div className="calorie-progress-detail-value text-red-400">{todayStats?.totalCalories || 0}</div>
            <div className="calorie-progress-detail-label text-red-300">Calories</div>
          </div>
          <div className="calorie-progress-detail-card" style={{
            background: 'color-mix(in srgb, #A855F7 8%, transparent)',
            border: '1px solid color-mix(in srgb, #A855F7 15%, transparent)'
          }}>
            <div className="calorie-progress-detail-value text-purple-400">{calculateStrengthMinutes(todayActivities)}</div>
            <div className="calorie-progress-detail-label text-purple-300">Min Force</div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default CalorieProgressCard;