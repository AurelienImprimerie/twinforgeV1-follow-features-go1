import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useHasConnectedWearable } from '../../../../hooks/useHasConnectedWearable';
import { useFeedback } from '../../../../hooks/useFeedback';

const WearableStatusCard: React.FC = () => {
  const navigate = useNavigate();
  const { click } = useFeedback();
  const { hasConnectedWearable, connectedDevicesCount, loading } = useHasConnectedWearable();

  const handleClick = () => {
    click();
    navigate('/settings');
  };

  if (loading) {
    return (
      <div
        className="p-4 rounded-xl"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
            linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))
          `,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 min-w-12 min-h-12 flex-shrink-0 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #94A3B8 35%, transparent), color-mix(in srgb, #94A3B8 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #94A3B8 50%, transparent)',
              boxShadow: `
                0 4px 12px color-mix(in srgb, #94A3B8 40%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.3)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.Loader2}
              size={24}
              className="text-white/60 animate-spin"
              variant="pure"
            />
          </div>
          <div>
            <h4 className="text-white font-semibold text-base">Vérification...</h4>
            <p className="text-white/60 text-sm">Chargement des appareils</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasConnectedWearable) {
    return (
      <button
        onClick={handleClick}
        className="w-full text-left p-4 rounded-xl transition-all duration-300"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
            linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))
          `,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 min-w-12 min-h-12 flex-shrink-0 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
              boxShadow: `
                0 4px 12px color-mix(in srgb, #F59E0B 40%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.3)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.Watch}
              size={24}
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              variant="pure"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-base">Aucune montre connectée</h4>
            <p className="text-white/60 text-sm">Connectez un appareil pour suivre vos performances</p>
          </div>
          <SpatialIcon
            Icon={ICONS.ChevronRight}
            size={20}
            className="text-white/40 flex-shrink-0"
          />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 rounded-xl transition-all duration-300"
      style={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.15) 0%, transparent 60%),
          linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))
        `,
        border: '2px solid color-mix(in srgb, #22C55E 40%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 0 20px color-mix(in srgb, #22C55E 20%, transparent)'
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 min-w-12 min-h-12 flex-shrink-0 rounded-full flex items-center justify-center relative"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #22C55E 35%, transparent), color-mix(in srgb, #22C55E 25%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #22C55E 50%, transparent)',
            boxShadow: `
              0 4px 12px color-mix(in srgb, #22C55E 40%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.3)
            `
          }}
        >
          <SpatialIcon
            Icon={ICONS.Watch}
            size={24}
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            variant="pure"
          />
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white/20"
            style={{
              boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)'
            }}
          />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-base">
            {connectedDevicesCount} appareil{connectedDevicesCount > 1 ? 's' : ''} connecté{connectedDevicesCount > 1 ? 's' : ''}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-green-300 text-sm font-medium">Synchronisation active</p>
          </div>
        </div>
        <SpatialIcon
          Icon={ICONS.ChevronRight}
          size={20}
          className="text-white/40 flex-shrink-0"
        />
      </div>
    </button>
  );
};

export default WearableStatusCard;
