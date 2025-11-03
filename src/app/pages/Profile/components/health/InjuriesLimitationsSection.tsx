/**
 * InjuriesLimitationsSection Component
 * Manages physical injuries and limitations
 */

import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { ArrayItemManager } from '../ProfileHealthComponents';

interface InjuriesLimitationsSectionProps {
  physicalLimitations: string[];
  newPhysicalLimitation: string;
  setNewPhysicalLimitation: (value: string) => void;
  onAddPhysicalLimitation: () => void;
  onRemovePhysicalLimitation: (index: number) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

export const InjuriesLimitationsSection: React.FC<InjuriesLimitationsSectionProps> = ({
  physicalLimitations,
  newPhysicalLimitation,
  setNewPhysicalLimitation,
  onAddPhysicalLimitation,
  onRemovePhysicalLimitation,
  onSave,
  isSaving,
  isDirty,
}) => {
  return (
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #EF4444 35%, transparent), color-mix(in srgb, #EF4444 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #EF4444 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #EF4444 30%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.AlertTriangle} size={20} style={{ color: '#EF4444' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Blessures et Limitations</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">
              Douleurs, blessures et limitations physiques
            </div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-red-300 text-sm font-medium">Important</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/20">
          <div className="flex items-start gap-3">
            <SpatialIcon Icon={ICONS.Info} size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-200 text-sm leading-relaxed mb-2">
                Indiquez vos blessures passées, douleurs chroniques ou limitations physiques pour adapter
                vos programmes d'entraînement et éviter les mouvements à risque.
              </p>
              <div className="text-red-300 text-xs">
                <strong>Exemples :</strong> "Douleur au genou gauche", "Problème de dos", "Épaule fragile",
                "Tendinite du coude", "Entorse cheville droite"
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">
            Limitations physiques et blessures
          </label>
          <ArrayItemManager
            items={physicalLimitations}
            newItem={newPhysicalLimitation}
            setNewItem={setNewPhysicalLimitation}
            onAdd={onAddPhysicalLimitation}
            onRemove={onRemovePhysicalLimitation}
            placeholder="Ex: Douleur au genou, problème de dos..."
            itemColor="rgba(239, 68, 68"
            itemLabel="limitation"
          />
        </div>
      </div>

      {isDirty && onSave && (
        <div className="flex justify-end mt-4">
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
    </GlassCard>
  );
};
