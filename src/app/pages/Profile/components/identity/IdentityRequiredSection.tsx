/**
 * Identity Required Section
 * Essential information section for profile identity
 */

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import SectionModifiedBadge from '../../../../../ui/components/SectionModifiedBadge';
import { ProfileIdentityForm } from '../../validation/profileIdentityValidation';

interface IdentityRequiredSectionProps {
  register: UseFormRegister<ProfileIdentityForm>;
  errors: FieldErrors<ProfileIdentityForm>;
  isDirty: boolean;
}

const IdentityRequiredSection: React.FC<IdentityRequiredSectionProps> = ({
  register,
  errors,
  isDirty,
}) => {
  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(96, 165, 250, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(96, 165, 250, 0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #60A5FA 35%, transparent), color-mix(in srgb, #60A5FA 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #60A5FA 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #60A5FA 30%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.User} size={20} style={{ color: '#60A5FA' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Informations Essentielles</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">
              Vos données de base et mesures corporelles
            </div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          {isDirty ? (
            <SectionModifiedBadge visible={isDirty} />
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-300 text-sm font-medium">Requis</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-white/90 text-sm font-medium mb-3">
            Nom d'affichage *
          </label>
          <input
            {...register('displayName')}
            type="text"
            id="displayName"
            className="glass-input"
            placeholder="Votre nom"
          />
          {errors.displayName && (
            <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.displayName.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="sex" className="block text-white/90 text-sm font-medium mb-3">
            Genre *
          </label>
          <select {...register('sex')} id="sex" className="glass-input">
            <option value="">Sélectionnez votre genre</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
          </select>
          {errors.sex && (
            <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.sex.message}
            </div>
          )}
        </div>

        {/* Height */}
        <div>
          <label htmlFor="height_cm" className="block text-white/90 text-sm font-medium mb-3">
            Taille (cm) *
          </label>
          <input
            {...register('height_cm', { valueAsNumber: true })}
            type="number"
            id="height_cm"
            min="120"
            max="230"
            step="1"
            className="glass-input"
            placeholder="175"
          />
          {errors.height_cm && (
            <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.height_cm.message}
            </div>
          )}
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight_kg" className="block text-white/90 text-sm font-medium mb-3">
            Poids (kg) *
          </label>
          <input
            {...register('weight_kg', { valueAsNumber: true })}
            type="number"
            id="weight_kg"
            min="30"
            max="300"
            step="0.1"
            className="glass-input"
            placeholder="70"
          />
          {errors.weight_kg && (
            <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
              {errors.weight_kg.message}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default IdentityRequiredSection;
