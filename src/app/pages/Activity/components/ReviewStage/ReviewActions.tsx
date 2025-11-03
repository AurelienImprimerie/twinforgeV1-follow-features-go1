import { motion } from 'framer-motion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import React from 'react';

interface ReviewActionsProps {
  onCancel: () => void;
  handleSave: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

/**
 * Review Actions - Actions de Revue
 * Boutons d'action pour annuler ou sauvegarder la session d'activité
 */
const ReviewActions: React.FC<ReviewActionsProps> = ({
  onCancel,
  handleSave,
  isSaving,
  isEditing
}) => {
  return (
    <>
      {/* Indicateur de modifications */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 p-4 rounded-xl"
          style={{
            background: 'color-mix(in srgb, #F59E0B 8%, transparent)',
            border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, #F59E0B 15%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 25%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Edit} size={14} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <div className="text-orange-300 font-semibold">Modifications détectées</div>
              <div className="text-orange-200 text-sm">Vos ajustements seront sauvegardés</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions de Revue */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-3 text-lg font-semibold rounded-full"
          style={{
            background: 'color-mix(in srgb, #6B7280 15%, transparent)',
            border: '1px solid color-mix(in srgb, #6B7280 25%, transparent)',
            color: '#9CA3AF',
            backdropFilter: 'blur(12px) saturate(130%)'
          }}
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.X} size={18} />
            <span>Annuler</span>
          </div>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 text-lg font-bold rounded-full relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
              color-mix(in srgb, #22C55E 80%, transparent), 
              color-mix(in srgb, #10B981 60%, transparent)
            )`,
            border: '2px solid color-mix(in srgb, #22C55E 60%, transparent)',
            boxShadow: `
              0 12px 40px color-mix(in srgb, #22C55E 40%, transparent),
              0 0 60px color-mix(in srgb, #22C55E 30%, transparent),
              inset 0 3px 0 rgba(255,255,255,0.4)
            `,
            backdropFilter: 'blur(20px) saturate(160%)',
            color: '#fff',
            transition: 'all 0.2s ease',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          <div className="flex items-center gap-2">
            {isSaving ? (
              <SpatialIcon Icon={ICONS.Loader2} size={20} className="text-white animate-spin" />
            ) : (
              <SpatialIcon Icon={ICONS.Save} size={20} className="text-white" />
            )}
            <span>{isSaving ? 'Sauvegarde...' : 'Enregistrer ma Forge'}</span>
          </div>
        </button>
      </div>
    </>
  );
};

export default ReviewActions;