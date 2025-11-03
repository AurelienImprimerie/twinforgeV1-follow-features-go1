import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface FridgeSession {
  id: string;
  created_at: string;
  inventory_final: any[];
  status: string;
}

interface InventoryInfoCardProps {
  loading: boolean;
  sessions: FridgeSession[];
}

const InventoryInfoCard: React.FC<InventoryInfoCardProps> = ({
  loading,
  sessions
}) => {
  if (loading || sessions.length === 0) {
    return null;
  }

  return (
    <GlassCard
      className="p-4 relative overflow-hidden rounded-3xl transform-gpu preserve-3d will-transform transition-all duration-300"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
          rgba(255, 255, 255, 0.06)
        `,
        borderColor: 'color-mix(in srgb, #06B6D4 20%, transparent)',
        backdropFilter: 'blur(20px) saturate(160%)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.2),
          0 0 20px color-mix(in srgb, #06B6D4 10%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `
      }}
    >
      <div className="flex items-center gap-3">
        <SpatialIcon 
          Icon={ICONS.Info} 
          size={16}
          style={{ 
            color: '#06B6D4',
            filter: 'drop-shadow(0 0 6px color-mix(in srgb, #06B6D4 30%, transparent))'
          }}
          variant="pure"
        />
        <div className="text-sm">
          <span className="text-cyan-300 font-medium">Inventaires disponibles : </span>
          <span className="text-white/80">
            {sessions.length} inventaire{sessions.length > 1 ? 's' : ''} sauvegardé{sessions.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default InventoryInfoCard;