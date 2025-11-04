import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import { getBreastfeedingEmoji, getBreastfeedingTypeLabel, getBabyAgeCategory } from '../../../../../domain/breastfeeding';
import type { BreastfeedingType } from '../../../../../domain/breastfeeding';

interface BreastfeedingSectionProps {
  value: {
    is_breastfeeding: boolean;
    breastfeeding_type: BreastfeedingType | null;
    baby_age_months: string;
    start_date: string;
    notes: string;
  };
  onChange: (value: Partial<BreastfeedingSectionProps['value']>) => void;
  errors?: Record<string, string>;
}

const BreastfeedingSection: React.FC<BreastfeedingSectionProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  const isBreastfeeding = value.is_breastfeeding;

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
            {getBreastfeedingEmoji(isBreastfeeding)} Allaitement
          </h3>
          <p className="text-white/60 text-sm">
            Indiquez si vous allaitez pour recevoir des recommandations nutritionnelles adaptées
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isBreastfeeding}
                onChange={(e) => onChange({ is_breastfeeding: e.target.checked })}
                className="sr-only"
              />
              <div
                className="w-12 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: isBreastfeeding ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: `2px solid ${isBreastfeeding ? '#EC4899' : 'rgba(255, 255, 255, 0.2)'}`,
                }}
              >
                <div
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: isBreastfeeding ? 'translateX(24px)' : 'translateX(0)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                />
              </div>
            </div>
            <span className="text-white font-medium">
              J'allaite actuellement
            </span>
          </label>

          {isBreastfeeding && (
            <div className="space-y-4 pl-4 border-l-2 border-pink-500/30">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Type d'allaitement
                </label>
                <select
                  value={value.breastfeeding_type || ''}
                  onChange={(e) => onChange({ breastfeeding_type: e.target.value as BreastfeedingType || null })}
                  className="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <option value="">Sélectionnez le type</option>
                  <option value="exclusive">Allaitement exclusif</option>
                  <option value="mixed">Allaitement mixte (sein + biberon/solides)</option>
                  <option value="weaning">Sevrage en cours</option>
                </select>
                {errors.breastfeeding_type && (
                  <p className="text-red-400 text-sm mt-1">{errors.breastfeeding_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Âge de votre bébé (en mois)
                </label>
                <input
                  type="number"
                  min="0"
                  max="36"
                  value={value.baby_age_months || ''}
                  onChange={(e) => onChange({ baby_age_months: e.target.value })}
                  placeholder="Ex: 6"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
                {value.baby_age_months && (
                  <p className="text-white/60 text-sm mt-1">
                    {getBabyAgeCategory(parseInt(value.baby_age_months))}
                  </p>
                )}
                {errors.baby_age_months && (
                  <p className="text-red-400 text-sm mt-1">{errors.baby_age_months}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Date de début de l'allaitement (optionnel)
                </label>
                <input
                  type="date"
                  value={value.start_date || ''}
                  onChange={(e) => onChange({ start_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    colorScheme: 'dark',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Notes personnelles (optionnel)
                </label>
                <textarea
                  value={value.notes || ''}
                  onChange={(e) => onChange({ notes: e.target.value })}
                  placeholder="Informations complémentaires, observations..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {isBreastfeeding && (
          <div className="p-4 rounded-lg" style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <p className="text-white/80 text-sm">
              <strong className="text-pink-400">💡 Impact sur vos recommandations :</strong><br />
              Vos besoins nutritionnels sont augmentés pendant l'allaitement. Toutes nos recommandations (repas, activités, jeûne) seront automatiquement adaptées pour garantir votre santé et la qualité de votre lait maternel.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default BreastfeedingSection;
