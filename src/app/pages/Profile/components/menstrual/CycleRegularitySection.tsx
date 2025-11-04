import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface CycleRegularitySectionProps {
  value: {
    cycleRegularity: 'regular' | 'irregular' | 'very_irregular';
  };
  onChange: (value: any) => void;
}

const CycleRegularitySection: React.FC<CycleRegularitySectionProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (field: string, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const regularityOptions = [
    { value: 'regular', label: 'Régulier', description: 'Cycle stable, variations < 3 jours' },
    { value: 'irregular', label: 'Irrégulier', description: 'Variations de 3-7 jours' },
    { value: 'very_irregular', label: 'Très irrégulier', description: 'Variations > 7 jours' },
  ];

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
            <SpatialIcon Icon={ICONS.Activity} size={20} style={{ color: '#EC4899' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Régularité du Cycle</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Caractéristiques de votre cycle</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <span className="text-pink-300 text-sm font-medium">Important</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Comment décririez-vous votre cycle?
          </label>
          <div className="space-y-2">
            {regularityOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-start p-4 rounded-lg border cursor-pointer transition-all
                  ${
                    value.cycleRegularity === option.value
                      ? 'bg-pink-500/10 border-pink-400/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <input
                  type="radio"
                  name="cycleRegularity"
                  value={option.value}
                  checked={value.cycleRegularity === option.value}
                  onChange={(e) => handleChange('cycleRegularity', e.target.value)}
                  className="mt-1 text-pink-400"
                />
                <div className="ml-3 flex-1">
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-sm text-white/60 mt-1">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default CycleRegularitySection;
