import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface MenstrualCycleSectionProps {
  value: {
    lastPeriodDate: string;
    averageCycleLength: number;
    averagePeriodDuration: number;
  };
  onChange: (value: any) => void;
  errors?: Record<string, string>;
}

const MenstrualCycleSection: React.FC<MenstrualCycleSectionProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  const handleChange = (field: string, fieldValue: string | number) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <GlassCard className="p-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'rgba(236, 72, 153, 0.2)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #EC4899 35%, transparent), color-mix(in srgb, #EC4899 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #EC4899 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #EC4899 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Calendar} size={20} style={{ color: '#EC4899' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Informations du Cycle</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Dates et durées de votre cycle menstruel</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <span className="text-pink-300 text-sm font-medium">Requis</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Date des dernières règles
          </label>
          <input
            type="date"
            value={value.lastPeriodDate || ''}
            onChange={(e) => handleChange('lastPeriodDate', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--circuit-health)]/50 transition-colors"
          />
          {errors.lastPeriodDate && (
            <p className="mt-1 text-sm text-red-400">{errors.lastPeriodDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Durée moyenne du cycle (jours)
          </label>
          <input
            type="number"
            min="21"
            max="45"
            value={value.averageCycleLength || 28}
            onChange={(e) => handleChange('averageCycleLength', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--circuit-health)]/50 transition-colors"
          />
          <p className="mt-1 text-xs text-white/40">
            Entre 21 et 45 jours (moyenne: 28 jours)
          </p>
          {errors.averageCycleLength && (
            <p className="mt-1 text-sm text-red-400">{errors.averageCycleLength}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Durée moyenne des règles (jours)
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={value.averagePeriodDuration || 5}
            onChange={(e) => handleChange('averagePeriodDuration', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--circuit-health)]/50 transition-colors"
          />
          <p className="mt-1 text-xs text-white/40">
            Entre 2 et 10 jours (moyenne: 5 jours)
          </p>
          {errors.averagePeriodDuration && (
            <p className="mt-1 text-sm text-red-400">{errors.averagePeriodDuration}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default MenstrualCycleSection;
