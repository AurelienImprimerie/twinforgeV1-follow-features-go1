/**
 * Vital Signs Section Component
 * Blood pressure, heart rate, and other vital measurements
 */

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { HealthFormV2 } from '../../validation/profileHealthValidationV2';

interface VitalSignsSectionProps {
  register: UseFormRegister<HealthFormV2>;
  errors: FieldErrors<HealthFormV2>;
}

export const VitalSignsSection: React.FC<VitalSignsSectionProps> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 mb-4">
        <div className="flex items-start gap-2">
          <SpatialIcon Icon={ICONS.Info} size={16} className="text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Ces mesures permettent un suivi précis de votre santé cardiovasculaire et métabolique.
            </p>
            <p className="text-blue-300 text-xs mt-1">
              Mesurez vos constantes au repos pour des résultats fiables.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vital_signs.blood_pressure_systolic" className="block text-white/90 text-sm font-medium mb-2">
            Tension systolique (mmHg)
          </label>
          <input
            {...register('vital_signs.blood_pressure_systolic', { valueAsNumber: true })}
            type="number"
            id="vital_signs.blood_pressure_systolic"
            min="50"
            max="250"
            step="1"
            className="glass-input"
            placeholder="120"
          />
          {errors.vital_signs?.blood_pressure_systolic && (
            <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.vital_signs.blood_pressure_systolic.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="vital_signs.blood_pressure_diastolic" className="block text-white/90 text-sm font-medium mb-2">
            Tension diastolique (mmHg)
          </label>
          <input
            {...register('vital_signs.blood_pressure_diastolic', { valueAsNumber: true })}
            type="number"
            id="vital_signs.blood_pressure_diastolic"
            min="30"
            max="150"
            step="1"
            className="glass-input"
            placeholder="80"
          />
          {errors.vital_signs?.blood_pressure_diastolic && (
            <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.vital_signs.blood_pressure_diastolic.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="vital_signs.resting_heart_rate" className="block text-white/90 text-sm font-medium mb-2">
            Fréquence cardiaque au repos (bpm)
          </label>
          <input
            {...register('vital_signs.resting_heart_rate', { valueAsNumber: true })}
            type="number"
            id="vital_signs.resting_heart_rate"
            min="30"
            max="200"
            step="1"
            className="glass-input"
            placeholder="60"
          />
          {errors.vital_signs?.resting_heart_rate && (
            <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.vital_signs.resting_heart_rate.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="vital_signs.blood_glucose_mg_dl" className="block text-white/90 text-sm font-medium mb-2">
            Glycémie à jeun (mg/dL)
          </label>
          <input
            {...register('vital_signs.blood_glucose_mg_dl', { valueAsNumber: true })}
            type="number"
            id="vital_signs.blood_glucose_mg_dl"
            min="40"
            max="600"
            step="1"
            className="glass-input"
            placeholder="90"
          />
          {errors.vital_signs?.blood_glucose_mg_dl && (
            <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.vital_signs.blood_glucose_mg_dl.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="vital_signs.last_measured" className="block text-white/90 text-sm font-medium mb-2">
            Date de dernière mesure
          </label>
          <input
            {...register('vital_signs.last_measured')}
            type="date"
            id="vital_signs.last_measured"
            className="glass-input"
          />
          {errors.vital_signs?.last_measured && (
            <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.vital_signs.last_measured.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
