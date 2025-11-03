import React from 'react';
import { useReducedMotion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface ProgressionMetricsProps {
  metrics: {
    avgDailyCalories: number;
    targetCalories: number;
    calorieAdherence: number;
    proteinAdherence: number;
    mealsScanned: number;
    consistency: number;
    avgMacros: {
      proteins: number;
      carbs: number;
      fats: number;
      fiber: number;
    };
    proteinTarget: number;
    daysWithMeals: number;
  };
  profile?: any;
}

/**
 * Metric Card Component - Carte de métrique individuelle
 */
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof ICONS;
  color: string;
  progress?: number;
  target?: number;
  status?: 'excellent' | 'good' | 'needs_improvement';
  index: number;
}> = ({ title, value, subtitle, icon, color, progress, target, status, index }) => {
  const reduceMotion = useReducedMotion();
  const { isPerformanceMode } = usePerformanceMode();

  const statusConfig = {
    excellent: { bgColor: 'rgba(34, 197, 94, 0.12)', borderColor: 'rgba(34, 197, 94, 0.3)', textColor: '#22C55E' },
    good: { bgColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)', textColor: '#F59E0B' },
    needs_improvement: { bgColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)', textColor: '#EF4444' },
  };

  const statusStyle = status ? statusConfig[status] : {
    bgColor: `color-mix(in srgb, ${color} 8%, transparent)`,
    borderColor: `color-mix(in srgb, ${color} 20%, transparent)`,
    textColor: color
  };

  return (
    <div
      className={isPerformanceMode ? '' : 'metric-card-enter'}
      style={isPerformanceMode ? {} : { animationDelay: `${index * 0.1}s` }}
    >
      <GlassCard 
        className="p-6 text-center relative overflow-visible"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, ${statusStyle.bgColor} 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: statusStyle.borderColor,
          boxShadow: status === 'excellent' ? `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px color-mix(in srgb, ${statusStyle.textColor} 15%, transparent)
          ` : undefined
        }}
      >
        {/* Icône avec Halo */}
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center relative ${
            status === 'excellent' && !reduceMotion && !isPerformanceMode ? 'metric-icon-glow-css' : 'metric-icon-static'
          }`}
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, ${statusStyle.textColor} 30%, transparent), color-mix(in srgb, ${statusStyle.textColor} 20%, transparent))
            `,
            border: `2px solid color-mix(in srgb, ${statusStyle.textColor} 40%, transparent)`,
            boxShadow: `0 0 20px color-mix(in srgb, ${statusStyle.textColor} 30%, transparent)`
          }}
        >
          <SpatialIcon 
            Icon={ICONS[icon]} 
            size={24} 
            style={{ color: statusStyle.textColor }}
          />
          
          {/* Particules de statut */}
          {status === 'excellent' && !reduceMotion && !isPerformanceMode && [...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full metric-particle-css metric-particle-css--${i + 1}`}
              style={{
                background: statusStyle.textColor,
                left: `${20 + i * 25}%`,
                top: `${25 + (i % 2) * 50}%`,
                boxShadow: `0 0 6px ${statusStyle.textColor}80`
              }}
            />
          ))}
        </div>

        {/* Valeur Principale */}
        <div
          className={isPerformanceMode ? 'text-3xl font-bold mb-2' : 'text-3xl font-bold mb-2 metric-value-enter'}
          style={{ color: statusStyle.textColor }}
        >
          {value}
        </div>

        {/* Titre et Sous-titre */}
        <div className="space-y-1">
          <h4 className="text-white font-semibold text-sm">{title}</h4>
          <p className="text-white/60 text-xs">{subtitle}</p>
        </div>

        {/* Barre de Progression (si applicable) */}
        {progress !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full progress-fill-css"
                style={{
                  background: `linear-gradient(90deg, ${statusStyle.textColor}, color-mix(in srgb, ${statusStyle.textColor} 80%, white))`,
                  boxShadow: `0 0 8px ${statusStyle.textColor}60`,
                  '--progress-value': `${Math.min(100, progress) / 100}`,
                  width: `${Math.min(100, progress)}%`,
                  transition: 'width 1.2s ease-out'
                }}
              />
            </div>
            {target && (
              <div className="flex justify-between mt-1 text-xs text-white/50">
                <span>0</span>
                <span>{target}</span>
              </div>
            )}
          </div>
        )}

        {/* Badge de Statut */}
        {status && (
          <div
            className={isPerformanceMode ? 'absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium' : 'absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium status-badge-enter'}
            style={{
              background: statusStyle.bgColor,
              border: `1px solid ${statusStyle.borderColor}`,
              color: statusStyle.textColor,
              backdropFilter: isPerformanceMode ? 'none' : 'blur(8px) saturate(120%)',
              ...(!isPerformanceMode && { animationDelay: `${0.8 + index * 0.1}s` })
            }}
          >
            {status === 'excellent' ? '🏆' : 
             status === 'good' ? '👍' : '📈'}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

/**
 * Progression Metrics - Métriques de Progression VisionOS 26
 * Dashboard principal avec métriques clés et indicateurs de performance
 */
const ProgressionMetrics: React.FC<ProgressionMetricsProps> = ({
  metrics,
  profile,
}) => {
  const reduceMotion = useReducedMotion();
  const { isPerformanceMode } = usePerformanceMode();

  // Déterminer les statuts basés sur les métriques
  const getCalorieStatus = (adherence: number) => {
    if (adherence >= 90 && adherence <= 110) return 'excellent';
    if (adherence >= 80 && adherence <= 120) return 'good';
    return 'needs_improvement';
  };

  const getProteinStatus = (adherence: number) => {
    if (adherence >= 90) return 'excellent';
    if (adherence >= 70) return 'good';
    return 'needs_improvement';
  };

  const getConsistencyStatus = (consistency: number) => {
    if (consistency >= 85) return 'excellent';
    if (consistency >= 60) return 'good';
    return 'needs_improvement';
  };

  return (
    <div className="space-y-6">
      {/* Hero Metrics - Section Principale */}
      <div className={isPerformanceMode ? '' : 'hero-metrics-enter'}>
        <GlassCard 
          className="p-6 relative"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(8, 145, 178, 0.12) 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 70%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(6, 182, 212, 0.4)',
            boxShadow: `
              0 16px 48px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(6, 182, 212, 0.25),
              0 0 80px rgba(8, 145, 178, 0.15),
              inset 0 2px 0 rgba(255, 255, 255, 0.2)
            `,
          }}
        >
          {/* Halo de Forge Progression */}
          {!isPerformanceMode && (
            <div
              className="absolute inset-0 rounded-inherit pointer-events-none progression-glow-css"
            style={{
              background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
              filter: 'blur(20px)',
              transform: 'scale(1.3)',
              zIndex: -1
            }}
            />
          )}

          {/* Header néo-onglo intégré */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #06B6D4 35%, transparent), color-mix(in srgb, #06B6D4 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #06B6D4 50%, transparent)',
                boxShadow: '0 0 30px color-mix(in srgb, #06B6D4 40%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.TrendingUp} size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Métriques de Progression</h3>
              <p className="text-cyan-200 text-sm">Évolution de vos habitudes alimentaires</p>
            </div>
          </div>

          {/* Métriques Principales - Même style que DailyRecap */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div
                className={isPerformanceMode ? 'text-4xl font-bold text-green-400 mb-2' : 'text-4xl font-bold text-green-400 mb-2 metric-value-enter'}
                style={isPerformanceMode ? {} : { animationDelay: '0.2s' }}
              >
                {metrics.avgDailyCalories}
              </div>
              <div className="text-green-300 text-sm font-medium">Kcal/jour</div>
              <div className="text-white/50 text-xs mt-1">
                Cible: {metrics.targetCalories}
              </div>
            </div>
            
            <div className="text-center">
              <div
                className={isPerformanceMode ? 'text-4xl font-bold text-blue-400 mb-2' : 'text-4xl font-bold text-blue-400 mb-2 metric-value-enter'}
                style={isPerformanceMode ? {} : { animationDelay: '0.3s' }}
              >
                {metrics.calorieAdherence}%
              </div>
              <div className="text-blue-300 text-sm font-medium">Adhérence</div>
              <div className="text-white/50 text-xs mt-1">Objectif calorique</div>
            </div>
            
            <div className="text-center">
              <div
                className={isPerformanceMode ? 'text-4xl font-bold text-purple-400 mb-2' : 'text-4xl font-bold text-purple-400 mb-2 metric-value-enter'}
                style={isPerformanceMode ? {} : { animationDelay: '0.4s' }}
              >
                {metrics.consistency}%
              </div>
              <div className="text-purple-300 text-sm font-medium">Régularité</div>
              <div className="text-white/50 text-xs mt-1">
                {metrics.daysWithMeals}/7 jours
              </div>
            </div>
            
            <div className="text-center">
              <div
                className={isPerformanceMode ? 'text-4xl font-bold text-red-400 mb-2' : 'text-4xl font-bold text-red-400 mb-2 metric-value-enter'}
                style={isPerformanceMode ? {} : { animationDelay: '0.5s' }}
              >
                {metrics.proteinAdherence}%
              </div>
              <div className="text-red-300 text-sm font-medium">Protéines</div>
              <div className="text-white/50 text-xs mt-1">
                {metrics.avgMacros.proteins}g/{metrics.proteinTarget}g
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Métriques Détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Calories Quotidiennes"
          value={metrics.avgDailyCalories}
          subtitle="Moyenne sur 7 jours"
          icon="Zap"
          color="#10B981"
          progress={metrics.calorieAdherence}
          target={metrics.targetCalories}
          status={getCalorieStatus(metrics.calorieAdherence)}
          index={0}
        />
        
        <MetricCard
          title="Apport Protéique"
          value={`${metrics.avgMacros.proteins}g`}
          subtitle="Moyenne quotidienne"
          icon="Activity"
          color="#EF4444"
          progress={metrics.proteinAdherence}
          target={metrics.proteinTarget}
          status={getProteinStatus(metrics.proteinAdherence)}
          index={1}
        />
        
        <MetricCard
          title="Régularité Scan"
          value={`${metrics.consistency}%`}
          subtitle={`${metrics.daysWithMeals} jours actifs`}
          icon="Calendar"
          color="#8B5CF6"
          progress={metrics.consistency}
          status={getConsistencyStatus(metrics.consistency)}
          index={2}
        />
        
        <MetricCard
          title="Repas Analysés"
          value={metrics.mealsScanned}
          subtitle="Cette semaine"
          icon="Utensils"
          color="#F59E0B"
          index={3}
        />
      </div>
    </div>
  );
};

export default ProgressionMetrics;