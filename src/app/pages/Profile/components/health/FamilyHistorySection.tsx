/**
 * Family History Section Component
 * Family medical history for genetic risk assessment
 */

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { HealthFormV2 } from '../../validation/profileHealthValidationV2';

interface FamilyHistorySectionProps {
  register: UseFormRegister<HealthFormV2>;
  errors: FieldErrors<HealthFormV2>;
  watch: UseFormWatch<HealthFormV2>;
  setValue: UseFormSetValue<HealthFormV2>;
}

export const FamilyHistorySection: React.FC<FamilyHistorySectionProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const [newCancerType, setNewCancerType] = React.useState('');
  const [newGeneticCondition, setNewGeneticCondition] = React.useState('');

  const cancerHistory = watch('medical_history.family_history.cancer') || [];
  const geneticConditions = watch('medical_history.family_history.genetic_conditions') || [];

  const addCancerType = () => {
    if (newCancerType.trim()) {
      setValue('medical_history.family_history.cancer', [...cancerHistory, newCancerType.trim()], {
        shouldDirty: true,
      });
      setNewCancerType('');
    }
  };

  const removeCancerType = (index: number) => {
    setValue(
      'medical_history.family_history.cancer',
      cancerHistory.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const addGeneticCondition = () => {
    if (newGeneticCondition.trim()) {
      setValue(
        'medical_history.family_history.genetic_conditions',
        [...geneticConditions, newGeneticCondition.trim()],
        { shouldDirty: true }
      );
      setNewGeneticCondition('');
    }
  };

  const removeGeneticCondition = (index: number) => {
    setValue(
      'medical_history.family_history.genetic_conditions',
      geneticConditions.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
        <div className="flex items-start gap-3">
          <SpatialIcon Icon={ICONS.Info} size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-cyan-200 text-sm leading-relaxed mb-2">
              <strong>Antécédents familiaux:</strong> Ces informations aident à identifier les prédispositions génétiques et facteurs de risque héréditaires.
            </p>
            <p className="text-cyan-300 text-xs">
              Cochez si un membre de votre famille proche (parents, frères, sœurs) a été diagnostiqué avec ces conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <input
              {...register('medical_history.family_history.cardiovascular')}
              type="checkbox"
              id="family_history.cardiovascular"
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-red-500 focus:ring-red-500"
            />
            <label htmlFor="family_history.cardiovascular" className="text-white/90 text-sm font-medium flex-1">
              Maladies cardiovasculaires
            </label>
            <SpatialIcon Icon={ICONS.Heart} size={16} className="text-red-400" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <input
              {...register('medical_history.family_history.diabetes')}
              type="checkbox"
              id="family_history.diabetes"
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="family_history.diabetes" className="text-white/90 text-sm font-medium flex-1">
              Diabète
            </label>
            <SpatialIcon Icon={ICONS.Droplet} size={16} className="text-blue-400" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <input
              {...register('medical_history.family_history.hypertension')}
              type="checkbox"
              id="family_history.hypertension"
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="family_history.hypertension" className="text-white/90 text-sm font-medium flex-1">
              Hypertension
            </label>
            <SpatialIcon Icon={ICONS.Activity} size={16} className="text-orange-400" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <input
              {...register('medical_history.family_history.alzheimers')}
              type="checkbox"
              id="family_history.alzheimers"
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="family_history.alzheimers" className="text-white/90 text-sm font-medium flex-1">
              Alzheimer / Démence
            </label>
            <SpatialIcon Icon={ICONS.Brain} size={16} className="text-cyan-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Types de cancer dans la famille
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCancerType}
                onChange={(e) => setNewCancerType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCancerType();
                  }
                }}
                className="glass-input flex-1"
                placeholder="Ex: Cancer du sein, cancer colorectal..."
              />
              <button
                type="button"
                onClick={addCancerType}
                disabled={!newCancerType.trim()}
                className="btn-glass px-4"
              >
                <SpatialIcon Icon={ICONS.Plus} size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {cancerHistory.map((cancer, index) => (
                  <motion.div
                    key={`cancer-${index}`}
                    className="chip chip--on flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <span className="text-red-300">{cancer}</span>
                    <button
                      type="button"
                      onClick={() => removeCancerType(index)}
                      className="hover:opacity-80 transition-opacity text-red-300"
                    >
                      <SpatialIcon Icon={ICONS.X} size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Conditions génétiques connues
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newGeneticCondition}
                onChange={(e) => setNewGeneticCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGeneticCondition();
                  }
                }}
                className="glass-input flex-1"
                placeholder="Ex: Hémophilie, mucoviscidose..."
              />
              <button
                type="button"
                onClick={addGeneticCondition}
                disabled={!newGeneticCondition.trim()}
                className="btn-glass px-4"
              >
                <SpatialIcon Icon={ICONS.Plus} size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {geneticConditions.map((condition, index) => (
                  <motion.div
                    key={`genetic-${index}`}
                    className="chip chip--on flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                    }}
                  >
                    <span className="text-cyan-300">{condition}</span>
                    <button
                      type="button"
                      onClick={() => removeGeneticCondition(index)}
                      className="hover:opacity-80 transition-opacity text-cyan-300"
                    >
                      <SpatialIcon Icon={ICONS.X} size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
