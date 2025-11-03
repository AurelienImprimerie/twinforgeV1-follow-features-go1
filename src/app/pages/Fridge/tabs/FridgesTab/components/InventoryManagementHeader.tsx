import React from 'react';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface InventoryManagementHeaderProps {
  onDeleteAllInventories: () => void;
  onRefresh?: () => void;
}

const InventoryManagementHeader: React.FC<InventoryManagementHeaderProps> = ({
  onDeleteAllInventories,
  onRefresh
}) => {
  return (
    <div
      className="glass-card rounded-3xl"
      style={{
        background: 'color-mix(in srgb, var(--color-plasma-cyan) 8%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-plasma-cyan) 30%, transparent)',
        borderRadius: '1.5rem',
        boxShadow: `
          0 8px 32px color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent),
          0 2px 8px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        overflow: 'visible',
        isolation: 'isolate',
        padding: 0,
        paddingBottom: '1rem'
      }}
    >
      {/* Header Content */}
      <div className="p-6">
        <div className="flex items-center gap-5">
          {/* Icône ronde glass premium */}
          <div
            className="flex-shrink-0"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent) 0%, transparent 60%),
                linear-gradient(135deg,
                  color-mix(in srgb, var(--color-plasma-cyan) 25%, transparent),
                  color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent))
              `,
              border: '2px solid color-mix(in srgb, var(--color-plasma-cyan) 45%, transparent)',
              boxShadow: `
                0 8px 32px color-mix(in srgb, var(--color-plasma-cyan) 25%, transparent),
                0 0 40px color-mix(in srgb, var(--color-plasma-cyan) 18%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.25)
              `,
              backdropFilter: 'blur(16px) saturate(150%)',
              WebkitBackdropFilter: 'blur(16px) saturate(150%)',
              transform: 'translateZ(0)',
              overflow: 'visible'
            }}
          >
            <SpatialIcon
              Icon={ICONS.Archive}
              size={28}
              style={{
                color: '#06B6D4',
                filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'
              }}
            />
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight">
              Gestion des Inventaires
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Vos inventaires de frigo sauvegardés
            </p>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex-shrink-0 p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)'
              }}
              title="Rafraîchir les inventaires"
            >
              <SpatialIcon
                Icon={ICONS.RefreshCw}
                size={20}
                style={{ color: '#06B6D4' }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagementHeader;