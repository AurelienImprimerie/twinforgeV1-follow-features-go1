import React, { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mealsRepo } from '../../../system/data/repositories/mealsRepo';
import { useUserStore } from '../../../system/store/userStore';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { InsightCards } from './components/MealInsights/AIInsightCards';
import AnalysisLoadingSkeleton from './components/MealInsights/AILoadingSkeleton';

// Lazy load Recharts components (5.6MB)
const MacroDistributionChart = lazy(() => import('./components/MealInsights/MacroDistributionChart'));
import { getChartData } from './components/MealInsights/chartDataUtils';
import EmptyMealInsightsState from './components/MealInsights/EmptyMealInsightsState';

/**
 * Meal Insights Tab - Intelligence Nutritionnelle
 * Analyses et conseils personnalisés générés par l'IA TwinForge
 */
interface MealInsightsTabProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

const MealInsightsTab: React.FC<MealInsightsTabProps> = ({ onLoadingChange }) => {
  const navigate = useNavigate();
  const { session, profile } = useUserStore();
  const userId = session?.user?.id;

  // Récupérer les repas des 7 derniers jours pour l'analyse de tendances
  const { data: weekMeals, isLoading: isWeekLoading } = useQuery({
    queryKey: ['meals-week', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const weekAgo = startOfDay(subDays(new Date(), 7));
      const today = endOfDay(new Date());
      return mealsRepo.getUserMeals(userId, weekAgo, today);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupérer les repas des 30 derniers jours pour les graphiques de tendances
  const { data: monthMeals, isLoading: isMonthLoading } = useQuery({
    queryKey: ['meals-month', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const monthAgo = startOfDay(subDays(new Date(), 30));
      const today = endOfDay(new Date());
      return mealsRepo.getUserMeals(userId, monthAgo, today, 100); // Limite plus élevée pour 30 jours
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Récupérer l'analyse des tendances (GPT-5 mini)
  const { data: trendAnalysis, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['ai-trend-analysis', userId, format(new Date(), 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!userId || !weekMeals || weekMeals.length < 3) return null;
      return mealsRepo.generateTrendAnalysis(userId, weekMeals, profile);
    },
    enabled: !!userId && !!weekMeals && weekMeals.length >= 3,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Notify parent about loading state changes
  React.useEffect(() => {
    onLoadingChange?.(isAnalysisLoading);
  }, [isAnalysisLoading, onLoadingChange]);

  // Préparer les données pour le graphique de distribution des macros
  const chartData = React.useMemo(() => getChartData(monthMeals), [monthMeals]);

  // État de chargement initial
  if (isWeekLoading || isMonthLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/10 rounded w-1/3"></div>
              <div className="h-32 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  // État vide - Pas assez de données pour l'IA
  if (!weekMeals || weekMeals.length < 3) {
    console.log('INSIGHTS_DEBUG', 'Not enough meals', {
      weekMealsLength: weekMeals?.length,
      weekMeals: weekMeals,
      userId,
      timestamp: new Date().toISOString()
    });
    return <EmptyMealInsightsState />;
  }

  console.log('INSIGHTS_DEBUG', 'Sufficient meals found', {
    weekMealsLength: weekMeals.length,
    userId,
    isAnalysisLoading,
    hasTrendAnalysis: !!trendAnalysis,
    timestamp: new Date().toISOString()
  });

  // Afficher le squelette de chargement seulement si l'analyse est en cours ET qu'on n'a pas encore de résultats
  if (isAnalysisLoading && !trendAnalysis) {
    return <AnalysisLoadingSkeleton />;
  }

  // Vérifier si l'analyse a produit des insights utilisables
  const hasAnalysisInsights = trendAnalysis && (
    (trendAnalysis.trends && trendAnalysis.trends.length > 0) ||
    (trendAnalysis.strategic_advice && trendAnalysis.strategic_advice.length > 0) ||
    (trendAnalysis.diet_compliance)
  );

  // Si l'analyse a fini de charger mais n'a pas produit d'insights utilisables
  if (!isAnalysisLoading && !hasAnalysisInsights) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.Info} size={40} className="text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Insights en Cours d'Analyse
          </h3>
          <div className="text-orange-200 mb-6">
            Analyse de vos patterns nutritionnels en cours. 
            Les insights personnalisés seront disponibles sous peu.
          </div>
          <div className="text-orange-300 text-sm mb-6 text-center">
            Continuez à scanner vos repas pour enrichir l'analyse
          </div>
        </GlassCard>
        
        <GlassCard className="p-8 text-center">
          {/* CTA pour scanner un repas */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/meals/scan')}
              className="btn-glass--primary px-8 py-4 text-lg font-semibold"
              style={{
                background: `
                  linear-gradient(135deg, 
                    color-mix(in srgb, #F59E0B 80%, transparent), 
                    color-mix(in srgb, #F97316 60%, transparent)
                  )
                `,
                backdropFilter: 'blur(20px) saturate(160%)',
                boxShadow: `
                  0 12px 40px color-mix(in srgb, #F59E0B 40%, transparent),
                  0 0 60px color-mix(in srgb, #F59E0B 30%, transparent),
                  inset 0 3px 0 rgba(255,255,255,0.4),
                  inset 0 -3px 0 rgba(0,0,0,0.2)
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 60%, transparent)',
              }}
            >
              <div className="flex items-center gap-3">
                <SpatialIcon Icon={ICONS.Camera} size={20} className="text-white" />
                <span>Scanner un Repas</span>
              </div>
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6 w-full"
    >
      {/* Conformité Alimentaire - Insight IA */}
      {trendAnalysis?.diet_compliance && (
        <GlassCard 
          className="p-6"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(245, 158, 11, 0.2)'
          }}
        >
          {/* Header néo-onglo intégré */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 30%, transparent), color-mix(in srgb, #F59E0B 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Shield} size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Conformité Alimentaire</h2>
              <div className="text-orange-200 text-sm">Analyse de votre adhérence au régime déclaré</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {trendAnalysis.diet_compliance.overall_score}
              </div>
              <div className="text-blue-300 text-sm font-medium">Score Global</div>
              <div className="text-white/50 text-xs mt-1">Sur 100</div>
            </div>
          
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {Math.round(trendAnalysis.diet_compliance.compliance_rate * 100)}%
              </div>
              <div className="text-green-300 text-sm font-medium">Taux de Conformité</div>
              <div className="text-white/50 text-xs mt-1">Adhérence régime</div>
            </div>
          
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {trendAnalysis.diet_compliance.deviations?.length || 0}
              </div>
              <div className="text-purple-300 text-sm font-medium">Écarts Détectés</div>
              <div className="text-white/50 text-xs mt-1">Cette semaine</div>
            </div>
          </div>
        
          {trendAnalysis.diet_compliance.suggestions && trendAnalysis.diet_compliance.suggestions.length > 0 && (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/20">
              <h4 className="text-orange-300 font-medium text-sm mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Info} size={12} />
                Suggestions d'Amélioration
              </h4>
              <div className="space-y-2">
                {trendAnalysis.diet_compliance.suggestions.map((suggestion, index) => (
                  <div key={index} className="text-orange-200 text-sm flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Distribution des Macronutriments */}
      <Suspense fallback={<GlassCard className="p-6"><div className="text-center text-gray-400">Chargement du graphique...</div></GlassCard>}>
        <MacroDistributionChart
          data={chartData.macroDistribution}
          profile={profile}
        />
      </Suspense>

      {/* Insights - Patterns et Conseils Stratégiques */}
      <InsightCards 
        trendAnalysis={trendAnalysis}
        weekMeals={weekMeals}
        monthMeals={monthMeals}
      />
    </motion.div>
  );
};

export default MealInsightsTab;