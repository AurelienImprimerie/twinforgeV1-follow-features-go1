import React from 'react';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { ComponentBodyScan } from '../../../../../lib/utils/bodyScanMapper';
import { formatBodyMetrics } from '../../../../../lib/utils/bodyScanMapper';

interface BodyMetricsCardProps {
  scan: ComponentBodyScan;
}

interface MetricConfig {
  id: string;
  label: string;
  icon: keyof typeof ICONS;
  color: string;
  getValue: (scan: ComponentBodyScan) => string;
  getSubtext?: (scan: ComponentBodyScan) => string;
  getTooltip?: (scan: ComponentBodyScan) => string | undefined;
}

const METRICS: MetricConfig[] = [
  {
    id: 'weight',
    label: 'Poids',
    icon: 'Scale',
    color: '#10B981',
    getValue: (scan) => scan.weight ? `${scan.weight.toFixed(1)} kg` : 'N/A'
  },
  {
    id: 'bmi',
    label: 'IMC',
    icon: 'Activity',
    color: '#06B6D4',
    getValue: (scan) => scan.bmi ? scan.bmi.toFixed(1) : 'N/A',
    getSubtext: (scan) => {
      if (!scan.bmi) return '';
      if (scan.bmi < 18.5) return 'Léger';
      if (scan.bmi < 25) return 'Normal';
      if (scan.bmi < 30) return 'Surpoids';
      return 'Obèse';
    }
  },
  {
    id: 'bodyFat',
    label: 'Masse Grasse',
    icon: 'Droplet',
    color: '#F59E0B',
    getValue: (scan) => {
      if (scan.bodyFatPercentage) {
        return `${scan.bodyFatPercentage.toFixed(1)}%`;
      }
      // Estimate body fat from BMI if not available (Deurenberg formula)
      // Age estimation: assume 30 years old if not available (mid-adult)
      const age = 30; // Default age for estimation
      const sex = scan.userProfile?.sex || scan.resolvedGender || 'male';

      if (scan.bmi) {
        const genderFactor = sex === 'male' ? 1 : 0;
        const estimatedBF = (1.20 * scan.bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
        return `${Math.max(5, Math.min(50, estimatedBF)).toFixed(1)}%`;
      }
      return 'N/A';
    },
    getSubtext: (scan) => {
      if (!scan.bodyFatPercentage && scan.bmi) {
        return 'Estimé';
      }
      return '';
    },
    getTooltip: (scan) => {
      if (!scan.bodyFatPercentage && scan.bmi) {
        return 'Estimation basée sur l\'IMC et le sexe biologique (formule de Deurenberg)';
      }
      if (!scan.bodyFatPercentage) {
        return 'Métrique non disponible pour ce scan';
      }
      return undefined;
    }
  },
  {
    id: 'leanMass',
    label: 'Masse Maigre',
    icon: 'Zap',
    color: '#06B6D4',
    getValue: (scan) => {
      // Calculate lean body mass (weight - fat mass)
      const weight = scan.weight || scan.userProfile?.weight_kg;
      const bodyFat = scan.bodyFatPercentage;

      if (weight && bodyFat) {
        const leanMass = weight * ((100 - bodyFat) / 100);
        return `${leanMass.toFixed(1)} kg`;
      }

      // Fallback: estimate using BMI if body fat not available
      const height = scan.userProfile?.height_cm;
      const sex = scan.userProfile?.sex || scan.resolvedGender || 'male';

      if (weight && height && scan.bmi) {
        // Boer formula approximation for lean body mass
        if (sex === 'male') {
          const leanMass = (0.407 * weight) + (0.267 * height) - 19.2;
          return `${leanMass.toFixed(1)} kg`;
        } else {
          const leanMass = (0.252 * weight) + (0.473 * height) - 48.3;
          return `${leanMass.toFixed(1)} kg`;
        }
      }

      return 'N/A';
    },
    getSubtext: (scan) => {
      const hasDirectData = scan.weight && scan.bodyFatPercentage;
      if (!hasDirectData && scan.weight && scan.userProfile?.height_cm) {
        return 'Estimé';
      }
      return '';
    },
    getTooltip: (scan) => {
      const hasDirectData = scan.weight && scan.bodyFatPercentage;
      if (hasDirectData) {
        return 'Masse maigre = poids total - masse grasse. Inclut muscles, os, organes et eau corporelle.';
      }
      if (scan.weight && scan.userProfile?.height_cm) {
        return 'Estimation basée sur la formule de Boer utilisant le poids, la taille et le sexe biologique.';
      }
      return 'Métrique non disponible pour ce scan';
    }
  }
];

const BodyMetricsCard: React.FC<BodyMetricsCardProps> = React.memo(({ scan }) => {
  const { isPerformanceMode } = usePerformanceMode();

  const formattedMetrics = React.useMemo(() => formatBodyMetrics(scan), [scan]);

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #06B6D4 35%, transparent), color-mix(in srgb, #06B6D4 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #06B6D4 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #06B6D4 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.BarChart3} size={16} style={{ color: '#06B6D4' }} variant="pure" />
            </div>
            <span>Métriques Corporelles</span>
          </h4>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-300 text-xs font-medium">Scan du {formattedMetrics?.scanDate}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map((metric, index) => {
            const value = metric.getValue(scan);
            const subtext = metric.getSubtext?.(scan);
            const tooltip = metric.getTooltip?.(scan);
            const isAvailable = value !== 'N/A';

            return (
              <ConditionalMotion
                key={metric.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: isPerformanceMode ? 0 : 0.1 + index * 0.1 }}
                whileHover={{ y: -2 }}
                className="relative p-4 rounded-xl border transition-all duration-300 group"
                style={{
                  background: isAvailable
                    ? `linear-gradient(135deg, color-mix(in srgb, ${metric.color} 10%, transparent), color-mix(in srgb, ${metric.color} 5%, transparent))`
                    : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isAvailable
                    ? `color-mix(in srgb, ${metric.color} 30%, transparent)`
                    : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: isAvailable
                        ? `color-mix(in srgb, ${metric.color} 20%, transparent)`
                        : 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <SpatialIcon
                      Icon={ICONS[metric.icon]}
                      size={16}
                      color={isAvailable ? metric.color : 'rgba(255, 255, 255, 0.3)'}
                    />
                  </div>
                  <span className="text-white/60 text-xs font-medium">{metric.label}</span>
                  {tooltip && (
                    <div className="relative ml-auto">
                      <SpatialIcon Icon={ICONS.Info} size={12} className="text-white/40" />
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10 w-48">
                        <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                          {tooltip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-white text-xl font-bold mb-1">
                  {value}
                </div>

                {subtext && isAvailable && (
                  <div
                    className="text-xs font-medium"
                    style={{ color: metric.color }}
                  >
                    {subtext}
                  </div>
                )}
              </ConditionalMotion>
            );
          })}
        </div>

        {/* Additional Info */}
        {scan.rawMeasurements && Object.keys(scan.rawMeasurements).length > 0 && (
          <ConditionalMotion
            className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: isPerformanceMode ? 0 : 0.6 }}
          >
            <div className="flex items-start gap-3">
              <SpatialIcon Icon={ICONS.Ruler} size={16} className="text-white/40 mt-1" />
              <div className="flex-1">
                <p className="text-white/60 text-xs font-medium mb-2">Mesures détaillées</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(scan.rawMeasurements).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-white/40">{key.replace(/_/g, ' ')}:</span>{' '}
                      <span className="text-white/70 font-medium">{value} cm</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ConditionalMotion>
        )}

      </ConditionalMotion>
    </GlassCard>
  );
});

BodyMetricsCard.displayName = 'BodyMetricsCard';

export default BodyMetricsCard;
