import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { calculateCalories } from './ActivityUtils';
import React from 'react';

interface Activity {
  id?: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
}

interface AddActivityFormProps {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  newActivity: Partial<Activity>;
  setNewActivity: (activity: Partial<Activity>) => void;
  addNewActivity: () => void;
  profile?: any;
}

/**
 * Add Activity Form - Formulaire d'Ajout d'Activité
 * Interface pour ajouter manuellement une nouvelle activité
 */
const AddActivityForm: React.FC<AddActivityFormProps> = ({
  showAddForm,
  setShowAddForm,
  newActivity,
  setNewActivity,
  addNewActivity,
  profile
}) => {
  return (
    <AnimatePresence>
      {!showAddForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <button
            onClick={() => setShowAddForm(true)}
            className="add-activity-cta-3d"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="add-activity-icon-3d">
                <SpatialIcon Icon={ICONS.Plus} size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <div className="text-white font-semibold text-lg">Ajouter un Mouvement</div>
                <div className="text-white/60 text-sm">Enrichissez votre forge énergétique</div>
              </div>
            </div>
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <GlassCard 
            className="p-6"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 60%),
                var(--glass-opacity)
              `,
              borderColor: 'color-mix(in srgb, #8B5CF6 25%, transparent)'
            }}
          >
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 30%, transparent), color-mix(in srgb, #8B5CF6 20%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Plus} size={16} style={{ color: '#8B5CF6' }} />
              </div>
              Nouveau Mouvement
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Type d'activité */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Type d'activité
                </label>
                <input
                  type="text"
                  value={newActivity.type || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="Ex: Course à pied, Musculation..."
                />
              </div>

              {/* Durée */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={newActivity.duration_min || 30}
                  onChange={(e) => setNewActivity(prev => ({ 
                    ...prev, 
                    duration_min: parseInt(e.target.value) || 30 
                  }))}
                  className="glass-input w-full"
                  min="5"
                  max="300"
                />
              </div>

              {/* Intensité */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Intensité
                </label>
                <select
                  value={newActivity.intensity || 'medium'}
                  onChange={(e) => setNewActivity(prev => ({ 
                    ...prev, 
                    intensity: e.target.value as Activity['intensity'] 
                  }))}
                  className="glass-input w-full"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Modérée</option>
                  <option value="high">Intense</option>
                  <option value="very_high">Très Intense</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Notes (optionnel)
                </label>
                <input
                  type="text"
                  value={newActivity.notes || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="Détails supplémentaires..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addNewActivity}
                className="flex-1 add-form-submit-button-3d"
              >
                <div className="flex items-center justify-center gap-2">
                  <SpatialIcon Icon={ICONS.Check} size={16} className="text-white" />
                  <span>Ajouter</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewActivity({
                    type: '',
                    duration_min: 30,
                    intensity: 'medium',
                    calories_est: 0
                  });
                }}
                className="add-form-cancel-button-3d"
              >
                <div className="flex items-center gap-2">
                  <SpatialIcon Icon={ICONS.X} size={16} />
                  <span>Annuler</span>
                </div>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddActivityForm;