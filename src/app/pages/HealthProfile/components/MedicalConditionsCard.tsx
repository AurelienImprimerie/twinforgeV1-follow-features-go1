/**
 * MedicalConditionsCard Component
 * Manages current medical conditions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { ArrayItemManager } from '../../Profile/components/ProfileHealthComponents';

interface MedicalConditionsCardProps {
  conditions: string[];
  newCondition: string;
  setNewCondition: (value: string) => void;
  onAddCondition: () => void;
  onRemoveCondition: (index: number) => void;
  onDeclareNoConditions?: () => void;
  hasDeclaredNoConditions?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

const COMMON_CONDITIONS = [
  'Diabète Type 1',
  'Diabète Type 2',
  'Hypertension',
  'Asthme',
  'Arthrite',
  'Migraine chronique',
  'Apnée du sommeil',
  'Cholestérol élevé',
  'Thyroïde',
  'Reflux gastro-oesophagien',
];

export const MedicalConditionsCard: React.FC<MedicalConditionsCardProps> = ({
  conditions,
  newCondition,
  setNewCondition,
  onAddCondition,
  onRemoveCondition,
  onDeclareNoConditions,
  hasDeclaredNoConditions,
  onSave,
  isSaving,
  isDirty,
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const filteredSuggestions = COMMON_CONDITIONS.filter(
    (condition) =>
      condition.toLowerCase().includes(newCondition.toLowerCase()) &&
      !conditions.includes(condition)
  );

  const handleSuggestionClick = (condition: string) => {
    setNewCondition(condition);
    setShowSuggestions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(239, 68, 68, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(239, 68, 68, 0.2)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(239, 68, 68, 0.2))
              `,
              border: '2px solid rgba(239, 68, 68, 0.5)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
            }}
          >
            <SpatialIcon Icon={ICONS.AlertCircle} size={24} style={{ color: '#EF4444' }} variant="pure" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-xl">Conditions Médicales</h3>
            <p className="text-white/60 text-sm mt-1">Maladies chroniques et conditions actuelles</p>
          </div>
          {conditions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20">
              <span className="text-red-300 font-bold text-sm">{conditions.length}</span>
            </div>
          )}
        </div>


        {/* Conditions Input with Suggestions */}
        <div className="relative mb-4">
          <label className="block text-white/90 text-sm font-medium mb-3">
            Ajouter une condition médicale
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => {
                  setNewCondition(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="glass-input w-full"
                placeholder="Ex: Diabète Type 2, Asthme..."
              />
            </div>
            <button
              type="button"
              onClick={onAddCondition}
              disabled={!newCondition.trim()}
              className="btn-glass py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <SpatialIcon Icon={ICONS.Plus} size={14} className="inline mr-1" />
              Ajouter
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && newCondition.length > 0 && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-gray-900/95 border border-white/10 backdrop-blur-xl shadow-2xl"
            >
              <div className="p-2">
                <div className="text-white/50 text-xs px-3 py-2">Suggestions courantes:</div>
                {filteredSuggestions.map((condition, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(condition)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Conditions List */}
        {conditions.length > 0 && (
          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-400/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-white font-medium text-sm">{condition}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCondition(index)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2"
                >
                  <SpatialIcon Icon={ICONS.X} size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {conditions.length === 0 && !hasDeclaredNoConditions && (
          <div className="text-center py-6 text-white/50 text-sm">
            <SpatialIcon Icon={ICONS.AlertCircle} size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucune condition médicale ajoutée</p>
          </div>
        )}

        {/* Save Button */}
        <AnimatePresence>
          {isDirty && onSave && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-end mt-6"
            >
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="btn-glass px-6 py-2.5 text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                }}
              >
                <div className="flex items-center gap-2">
                  {isSaving ? (
                    <SpatialIcon Icon={ICONS.Loader2} size={16} className="animate-spin" />
                  ) : (
                    <SpatialIcon Icon={ICONS.Save} size={16} />
                  )}
                  <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
          <div className="flex items-start gap-2">
            <SpatialIcon Icon={ICONS.Info} size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-white/70 text-xs leading-relaxed">
              Ces informations permettent de personnaliser vos programmes d'entraînement et d'éviter les exercices contre-indiqués.
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
