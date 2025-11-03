/**
 * Basic Health Section Component
 * Blood type and basic measurements
 * Optimized version with simplified labels and enhanced blood type display
 */

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { HealthFormV2 } from '../../validation/profileHealthValidationV2';

interface BasicHealthSectionProps {
  register: UseFormRegister<HealthFormV2>;
  errors: FieldErrors<HealthFormV2>;
}

export const BasicHealthSection: React.FC<BasicHealthSectionProps> = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      {/* Blood Type Section - Optimized Display */}
      <div>
        <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
          <SpatialIcon Icon={ICONS.Droplet} size={16} className="text-red-400" />
          Groupe sanguin
        </h4>
        <select
          {...register('basic.bloodType')}
          id="basic.bloodType"
          className="glass-input w-full md:w-48"
        >
          <option value="">Sélectionnez</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        {errors.basic?.bloodType && (
          <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
            <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
            {errors.basic.bloodType.message}
          </p>
        )}
      </div>

      {/* Vaccinations Section */}
      <div>
        <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
          <SpatialIcon Icon={ICONS.Shield} size={16} className="text-green-400" />
          Vaccinations
        </h4>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('vaccinations.up_to_date')}
              type="checkbox"
              className="glass-checkbox"
            />
            <span className="text-white/70 text-sm">Vaccins à jour</span>
          </label>
        </div>
        {errors.vaccinations?.up_to_date && (
          <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
            <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
            {errors.vaccinations.up_to_date.message}
          </p>
        )}
      </div>
    </div>
  );
};
