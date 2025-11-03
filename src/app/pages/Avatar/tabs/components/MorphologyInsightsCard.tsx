import React from 'react';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface MorphologyInsightsCardProps {
  finalShapeParams: Record<string, number>;
  resolvedGender: 'male' | 'female';
  userProfile: {
    sex: 'male' | 'female';
    height_cm: number;
    weight_kg: number;
  };
}

interface MorphInsight {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof ICONS;
  color: string;
  value: string;
  category: 'silhouette' | 'composition' | 'development' | 'balance';
}

function analyzeMorphology(
  shapeParams: Record<string, number>,
  gender: 'male' | 'female',
  userProfile: { height_cm: number; weight_kg: number }
): MorphInsight[] {
  const insights: MorphInsight[] = [];
  
  const bmi = userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2);
  
  const pearFigure = shapeParams.pearFigure || 0;
  const narrowWaist = Math.abs(shapeParams.narrowWaist || 0);
  const bigHips = shapeParams.bigHips || 0;
  
  let silhouetteInsight: MorphInsight;
  
  if (pearFigure > 0.3 || bigHips > 0.3) {
    silhouetteInsight = {
      id: 'silhouette-curves',
      title: 'Silhouette Harmonieuse',
      description: 'Vos courbes naturelles créent une silhouette équilibrée et féminine',
      icon: 'Heart',
      color: '#EC4899',
      value: 'Courbes',
      category: 'silhouette'
    };
  } else if (narrowWaist > 0.3) {
    silhouetteInsight = {
      id: 'silhouette-athletic',
      title: 'Taille Définie',
      description: 'Votre taille marquée révèle une silhouette athlétique et structurée',
      icon: 'Target',
      color: '#10B981',
      value: 'Athlétique',
      category: 'silhouette'
    };
  } else {
    silhouetteInsight = {
      id: 'silhouette-balanced',
      title: 'Silhouette Équilibrée',
      description: 'Vos proportions naturelles créent une harmonie corporelle parfaite',
      icon: 'Circle',
      color: '#06B6D4',
      value: 'Équilibrée',
      category: 'silhouette'
    };
  }
  
  insights.push(silhouetteInsight);
  
  const bodybuilderSize = shapeParams.bodybuilderSize || 0;
  const bodybuilderDetails = shapeParams.bodybuilderDetails || 0;
  const emaciated = shapeParams.emaciated || 0;
  
  let developmentInsight: MorphInsight;
  
  if (bodybuilderSize > 0.3 || bodybuilderDetails > 0.3) {
    developmentInsight = {
      id: 'development-muscular',
      title: 'Développement Musculaire',
      description: 'Votre masse musculaire témoigne d\'un excellent travail physique',
      icon: 'Zap',
      color: '#8B5CF6',
      value: 'Développé',
      category: 'development'
    };
  } else if (emaciated < -0.3) {
    developmentInsight = {
      id: 'development-lean',
      title: 'Composition Lean',
      description: 'Votre physique fin révèle une excellente définition musculaire',
      icon: 'TrendingUp',
      color: '#F59E0B',
      value: 'Défini',
      category: 'development'
    };
  } else {
    developmentInsight = {
      id: 'development-natural',
      title: 'Tonus Naturel',
      description: 'Votre développement musculaire naturel offre une base solide',
      icon: 'Activity',
      color: '#22C55E',
      value: 'Naturel',
      category: 'development'
    };
  }
  
  insights.push(developmentInsight);
  
  let compositionInsight: MorphInsight;
  
  if (bmi < 18.5) {
    compositionInsight = {
      id: 'composition-lean',
      title: 'Métabolisme Rapide',
      description: 'Votre composition révèle un métabolisme efficace et dynamique',
      icon: 'Zap',
      color: '#06B6D4',
      value: 'Dynamique',
      category: 'composition'
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    compositionInsight = {
      id: 'composition-optimal',
      title: 'Composition Optimale',
      description: 'Votre équilibre masse/taille se situe dans la zone idéale',
      icon: 'Check',
      color: '#10B981',
      value: 'Optimale',
      category: 'composition'
    };
  } else if (bmi >= 25 && bmi < 30) {
    compositionInsight = {
      id: 'composition-robust',
      title: 'Constitution Robuste',
      description: 'Votre morphologie révèle une constitution solide et puissante',
      icon: 'Shield',
      color: '#F59E0B',
      value: 'Robuste',
      category: 'composition'
    };
  } else {
    compositionInsight = {
      id: 'composition-powerful',
      title: 'Potentiel de Transformation',
      description: 'Votre morphologie actuelle offre un excellent potentiel d\'évolution',
      icon: 'TrendingUp',
      color: '#8B5CF6',
      value: 'Évolutif',
      category: 'composition'
    };
  }
  
  insights.push(compositionInsight);
  
  const assLarge = shapeParams.assLarge || 0;
  const superBreast = shapeParams.superBreast || 0;
  const breastsSmall = shapeParams.breastsSmall || 0;
  
  let balanceInsight: MorphInsight;
  
  if (gender === 'female' && (superBreast > 0.2 || breastsSmall > 0.2)) {
    balanceInsight = {
      id: 'balance-feminine',
      title: 'Féminité Naturelle',
      description: 'Vos attributs féminins créent une harmonie corporelle unique',
      icon: 'Heart',
      color: '#EC4899',
      value: 'Féminine',
      category: 'balance'
    };
  } else if (assLarge > 0.2) {
    balanceInsight = {
      id: 'balance-curves',
      title: 'Équilibre des Volumes',
      description: 'La répartition de vos volumes crée une silhouette harmonieuse',
      icon: 'Circle',
      color: 'var(--color-body-scan-primary)',
      value: 'Harmonieuse',
      category: 'balance'
    };
  } else {
    balanceInsight = {
      id: 'balance-symmetrical',
      title: 'Symétrie Parfaite',
      description: 'Votre morphologie présente un équilibre naturel remarquable',
      icon: 'GitCompare',
      color: 'var(--color-body-scan-accent)',
      value: 'Symétrique',
      category: 'balance'
    };
  }
  
  insights.push(balanceInsight);
  
  return insights;
}

const MorphologyInsightsCard: React.FC<MorphologyInsightsCardProps> = React.memo(({
  finalShapeParams,
  resolvedGender,
  userProfile
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  const insights = React.useMemo(() =>
    analyzeMorphology(finalShapeParams, resolvedGender, userProfile),
    [finalShapeParams, resolvedGender, userProfile]
  );

  return (
    <GlassCard 
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity-base)
        `,
        borderColor: 'color-mix(in srgb, #06B6D4 25%, transparent)',
        boxShadow: `
          var(--glass-shadow-sm),
          0 0 16px color-mix(in srgb, #06B6D4 10%, transparent)
        `
      }}
    >
      <ConditionalMotion
        className="slide-enter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: isPerformanceMode ? 0 : 0.3 }}
      >
        <div className="bodyscan-flex-between mb-6">
          <h4 className="text-white font-semibold bodyscan-flex-center bodyscan-gap-sm">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #06B6D4 35%, transparent), color-mix(in srgb, #06B6D4 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #06B6D4 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #06B6D4 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Zap} size={20} style={{ color: '#06B6D4' }} variant="pure" />
            </div>
            Votre Profil Morphologique
          </h4>
          
          <div className="bodyscan-status-badge bodyscan-status-badge--active">
            <div className="bodyscan-status-icon" />
            <span className="bodyscan-status-text">Analyse Spatiale</span>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="morphology-insights-grid">
          {insights.map((insight, index) => (
            <ConditionalMotion
              key={insight.id}
              className="morphology-insight-item"
              style={{
                '--insight-color': insight.color
              } as React.CSSProperties}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: isPerformanceMode ? 0 : 0.1 + index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="morphology-insight-icon-container">
                <SpatialIcon Icon={ICONS[insight.icon]} size={20} color={insight.color} />
              </div>
              
              <div className="morphology-insight-value">
                {insight.value}
              </div>
              
              <div className="morphology-insight-title">
                {insight.title}
              </div>
            </ConditionalMotion>
          ))}
        </div>

        {/* Encouraging Summary */}
        <ConditionalMotion
          className="morphology-summary-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: isPerformanceMode ? 0 : 0.6 }}
          style={{
            borderRadius: '24px',
            overflow: 'hidden'
          }}
        >
          <p className="text-white/80 text-sm leading-relaxed">
            Votre morphologie unique révèle un potentiel extraordinaire. 
            Chaque caractéristique de votre corps raconte l'histoire de votre parcours 
            et offre des opportunités d'optimisation personnalisées.
          </p>
        </ConditionalMotion>
      </ConditionalMotion>
    </GlassCard>
  );
});

MorphologyInsightsCard.displayName = 'MorphologyInsightsCard';

export default MorphologyInsightsCard;