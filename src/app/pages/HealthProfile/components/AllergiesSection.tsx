/**
 * AllergiesSection Component
 * Manages allergies with categories and severity levels
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface Allergy {
  name: string;
  category: 'food' | 'medication' | 'environmental';
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
}

interface AllergiesSectionProps {
  allergies: Allergy[];
  onAddAllergy: (allergy: Allergy) => void;
  onRemoveAllergy: (index: number) => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
}

const COMMON_FOOD_ALLERGIES = [
  'Arachides',
  'Fruits à coque',
  'Lait',
  'Œufs',
  'Soja',
  'Blé/Gluten',
  'Poisson',
  'Fruits de mer',
  'Sésame',
];

const COMMON_MEDICATION_ALLERGIES = [
  'Pénicilline',
  'Aspirine',
  'Ibuprofène',
  'Codéine',
  'Morphine',
  'Sulfamides',
];

const COMMON_ENVIRONMENTAL_ALLERGIES = [
  'Pollen',
  'Acariens',
  'Poils de chat',
  'Poils de chien',
  'Moisissures',
  'Latex',
  'Piqûres d\'insectes',
];

const SEVERITY_INFO = {
  mild: { label: 'Légère', color: '#10B981', icon: ICONS.Info },
  moderate: { label: 'Modérée', color: '#F59E0B', icon: ICONS.AlertCircle },
  severe: { label: 'Sévère', color: '#EF4444', icon: ICONS.AlertTriangle },
  anaphylaxis: { label: 'Anaphylaxie', color: '#991B1B', icon: ICONS.AlertTriangle },
};

export const AllergiesSection: React.FC<AllergiesSectionProps> = ({
  allergies,
  onAddAllergy,
  onRemoveAllergy,
  onSave,
  isSaving,
  isDirty,
}) => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newAllergyName, setNewAllergyName] = React.useState('');
  const [newAllergyCategory, setNewAllergyCategory] = React.useState<'food' | 'medication' | 'environmental'>('food');
  const [newAllergySeverity, setNewAllergySeverity] = React.useState<'mild' | 'moderate' | 'severe' | 'anaphylaxis'>('mild');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const getSuggestions = () => {
    switch (newAllergyCategory) {
      case 'food':
        return COMMON_FOOD_ALLERGIES;
      case 'medication':
        return COMMON_MEDICATION_ALLERGIES;
      case 'environmental':
        return COMMON_ENVIRONMENTAL_ALLERGIES;
    }
  };

  const filteredSuggestions = getSuggestions().filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(newAllergyName.toLowerCase()) &&
      !allergies.some(a => a.name === suggestion && a.category === newAllergyCategory)
  );

  const handleAddAllergy = () => {
    if (!newAllergyName.trim()) return;

    onAddAllergy({
      name: newAllergyName.trim(),
      category: newAllergyCategory,
      severity: newAllergySeverity,
    });

    setNewAllergyName('');
    setNewAllergySeverity('mild');
    setShowAddForm(false);
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'food':
        return { label: 'Alimentaire', icon: ICONS.Apple, color: '#F59E0B' };
      case 'medication':
        return { label: 'Médicament', icon: ICONS.Pill, color: '#EF4444' };
      case 'environmental':
        return { label: 'Environnement', icon: ICONS.Wind, color: '#10B981' };
      default:
        return { label: 'Autre', icon: ICONS.AlertCircle, color: '#6B7280' };
    }
  };

  const allergiesByCategory = {
    food: allergies.filter(a => a.category === 'food'),
    medication: allergies.filter(a => a.category === 'medication'),
    environmental: allergies.filter(a => a.category === 'environmental'),
  };

  const hasAnaphylaxisRisk = allergies.some(a => a.severity === 'anaphylaxis');

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
            <SpatialIcon Icon={ICONS.AlertTriangle} size={24} style={{ color: '#EF4444' }} variant="pure" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-xl">Allergies</h3>
            <p className="text-white/60 text-sm mt-1">Allergies alimentaires, médicamenteuses et environnementales</p>
          </div>
          {allergies.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/20">
              <span className="text-orange-300 font-bold text-sm">{allergies.length}</span>
            </div>
          )}
        </div>

        {/* Anaphylaxis Alert */}
        {hasAnaphylaxisRisk && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-900/30 border-2 border-red-500/50"
          >
            <div className="flex items-start gap-3">
              <SpatialIcon Icon={ICONS.AlertTriangle} size={20} className="text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <div className="text-red-300 font-bold text-sm mb-1">RISQUE D'ANAPHYLAXIE</div>
                <p className="text-white/70 text-xs">
                  Vous avez déclaré des allergies pouvant causer une réaction anaphylactique. Assurez-vous d'avoir toujours votre EpiPen accessible.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Simple Add Form */}
        <div className="relative mb-4">
          <label className="block text-white/90 text-sm font-medium mb-3">
            Ajouter une allergie
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newAllergyName}
                onChange={(e) => {
                  setNewAllergyName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="glass-input w-full"
                placeholder="Ex: Arachides, Pénicilline..."
              />

              {/* Suggestions */}
              {showSuggestions && newAllergyName.length > 0 && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 mt-2 w-full max-h-48 overflow-y-auto rounded-lg bg-gray-900/95 border border-white/10 backdrop-blur-xl shadow-2xl">
                  <div className="p-2">
                    <div className="text-white/50 text-xs px-3 py-2">Suggestions courantes:</div>
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setNewAllergyName(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-glass py-2 px-4 text-sm flex-shrink-0"
            >
              <SpatialIcon Icon={showAddForm ? ICONS.ChevronUp : ICONS.ChevronDown} size={14} className="inline mr-1" />
              {showAddForm ? 'Masquer' : 'Options'}
            </button>
          </div>
        </div>

        {/* Advanced Options (collapsible) */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Catégorie</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['food', 'medication', 'environmental'] as const).map((category) => {
                      const info = getCategoryInfo(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setNewAllergyCategory(category)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            newAllergyCategory === category
                              ? 'bg-white/10 border-white/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <SpatialIcon Icon={info.icon} size={20} style={{ color: info.color }} className="mx-auto mb-1" />
                          <div className="text-white text-xs">{info.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Severity Selection */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Sévérité</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.entries(SEVERITY_INFO) as [keyof typeof SEVERITY_INFO, typeof SEVERITY_INFO[keyof typeof SEVERITY_INFO]][]).map(([severity, info]) => (
                      <button
                        key={severity}
                        type="button"
                        onClick={() => setNewAllergySeverity(severity)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          newAllergySeverity === severity
                            ? 'border-white/30'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        style={{
                          background: newAllergySeverity === severity ? `${info.color}20` : 'transparent',
                        }}
                      >
                        <div className="text-xs font-medium" style={{ color: info.color }}>
                          {info.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddAllergy}
                  disabled={!newAllergyName.trim()}
                  className="btn-glass w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SpatialIcon Icon={ICONS.Plus} size={14} className="inline mr-2" />
                  Ajouter avec ces options
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Allergies List by Category */}
        <div className="space-y-6">
          {(['food', 'medication', 'environmental'] as const).map((category) => {
            const categoryAllergies = allergiesByCategory[category];
            if (categoryAllergies.length === 0) return null;

            const categoryInfo = getCategoryInfo(category);

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <SpatialIcon Icon={categoryInfo.icon} size={16} style={{ color: categoryInfo.color }} />
                  <h4 className="text-white/90 font-medium text-sm">{categoryInfo.label}s</h4>
                  <span className="text-white/50 text-xs">({categoryAllergies.length})</span>
                </div>
                <div className="space-y-2">
                  {categoryAllergies.map((allergy, index) => {
                    const severityInfo = SEVERITY_INFO[allergy.severity];
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: severityInfo.color }}
                          />
                          <div className="flex-1">
                            <span className="text-white font-medium text-sm">{allergy.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  background: `${severityInfo.color}20`,
                                  color: severityInfo.color,
                                }}
                              >
                                {severityInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveAllergy(allergies.indexOf(allergy))}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                        >
                          <SpatialIcon Icon={ICONS.Trash2} size={16} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {allergies.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-white/50 text-sm">
            <SpatialIcon Icon={ICONS.Shield} size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucune allergie enregistrée</p>
            <p className="text-xs mt-1">Ajoutez vos allergies pour une meilleure personnalisation</p>
          </div>
        )}

        {/* Save Button */}
        {isDirty && (
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="btn-glass px-4 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <SpatialIcon Icon={ICONS.Loader2} size={14} className="animate-spin" />
                ) : (
                  <SpatialIcon Icon={ICONS.Save} size={14} />
                )}
                <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </div>
            </button>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-400/20">
          <div className="flex items-start gap-2">
            <SpatialIcon Icon={ICONS.Info} size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-white/70 text-xs leading-relaxed">
              Ces informations sont essentielles pour votre sécurité. Elles seront utilisées pour adapter vos plans nutritionnels et alerter en cas d'urgence médicale.
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
