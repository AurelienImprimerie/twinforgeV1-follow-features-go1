/**
 * Lifestyle Section Component
 * Smoking, alcohol, sleep, stress, and physical activity habits
 */

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { HealthFormV2 } from '../../validation/profileHealthValidationV2';

interface LifestyleSectionProps {
  register: UseFormRegister<HealthFormV2>;
  errors: FieldErrors<HealthFormV2>;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-400/20">
        <div className="flex items-start gap-2">
          <SpatialIcon Icon={ICONS.Info} size={16} className="text-orange-400 mt-0.5" />
          <p className="text-orange-200 text-sm leading-relaxed">
            Ces informations sur votre mode de vie sont essentielles pour évaluer vos risques de santé et personnaliser les recommandations préventives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-white/90 font-medium text-sm flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Cigarette} size={16} />
            Tabagisme
          </h4>

          <div>
            <label htmlFor="lifestyle.smoking_status" className="block text-white/90 text-sm font-medium mb-2">
              Statut fumeur
            </label>
            <select
              {...register('lifestyle.smoking_status')}
              id="lifestyle.smoking_status"
              className="glass-input"
            >
              <option value="">Sélectionnez</option>
              <option value="never">Jamais fumé</option>
              <option value="former">Ancien fumeur</option>
              <option value="current">Fumeur actuel</option>
            </select>
          </div>

          <div>
            <label htmlFor="lifestyle.smoking_years" className="block text-white/90 text-sm font-medium mb-2">
              Années de tabagisme
            </label>
            <input
              {...register('lifestyle.smoking_years', { valueAsNumber: true })}
              type="number"
              id="lifestyle.smoking_years"
              min="0"
              max="100"
              step="1"
              className="glass-input"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-white/90 font-medium text-sm flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Wine} size={16} />
            Consommation d'alcool
          </h4>

          <div>
            <label htmlFor="lifestyle.alcohol_frequency" className="block text-white/90 text-sm font-medium mb-2">
              Fréquence de consommation
            </label>
            <select
              {...register('lifestyle.alcohol_frequency')}
              id="lifestyle.alcohol_frequency"
              className="glass-input"
            >
              <option value="">Sélectionnez</option>
              <option value="never">Jamais</option>
              <option value="occasional">Occasionnel (moins d'1 fois/semaine)</option>
              <option value="moderate">Modéré (1-3 fois/semaine)</option>
              <option value="frequent">Fréquent (4+ fois/semaine)</option>
            </select>
          </div>

          <div>
            <label htmlFor="lifestyle.alcohol_units_per_week" className="block text-white/90 text-sm font-medium mb-2">
              Unités par semaine
            </label>
            <input
              {...register('lifestyle.alcohol_units_per_week', { valueAsNumber: true })}
              type="number"
              id="lifestyle.alcohol_units_per_week"
              min="0"
              max="200"
              step="1"
              className="glass-input"
              placeholder="0"
            />
            <p className="text-white/50 text-xs mt-1">
              1 unité = 1 verre standard (10g d'alcool pur)
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="lifestyle.sleep_hours_avg" className="block text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Moon} size={14} />
            Heures de sommeil moyennes par nuit
          </label>
          <input
            {...register('lifestyle.sleep_hours_avg', { valueAsNumber: true })}
            type="number"
            id="lifestyle.sleep_hours_avg"
            min="0"
            max="24"
            step="0.5"
            className="glass-input"
            placeholder="7.5"
          />
        </div>

        <div>
          <label htmlFor="lifestyle.sleep_quality" className="block text-white/90 text-sm font-medium mb-2">
            Qualité du sommeil (1-10)
          </label>
          <input
            {...register('lifestyle.sleep_quality', { valueAsNumber: true })}
            type="number"
            id="lifestyle.sleep_quality"
            min="1"
            max="10"
            step="1"
            className="glass-input"
            placeholder="7"
          />
          <p className="text-white/50 text-xs mt-1">
            1 = Très mauvais, 10 = Excellent
          </p>
        </div>

        <div>
          <label htmlFor="lifestyle.stress_level" className="block text-white/90 text-sm font-medium mb-2 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Activity} size={14} />
            Niveau de stress quotidien (1-10)
          </label>
          <input
            {...register('lifestyle.stress_level', { valueAsNumber: true })}
            type="number"
            id="lifestyle.stress_level"
            min="1"
            max="10"
            step="1"
            className="glass-input"
            placeholder="5"
          />
          <p className="text-white/50 text-xs mt-1">
            1 = Très faible, 10 = Très élevé
          </p>
        </div>
      </div>
    </div>
  );
};
