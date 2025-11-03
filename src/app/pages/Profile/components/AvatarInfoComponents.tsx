/**
 * Avatar Information Components
 * Status, Last Scan, Next Scan, and Quick Actions cards
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import type { AvatarData } from '../hooks/useAvatarData';

interface AvatarStatusCardProps {
  data: AvatarData;
}

export const AvatarStatusCard: React.FC<AvatarStatusCardProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #A855F7 35%, transparent), color-mix(in srgb, #A855F7 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #A855F7 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #A855F7 30%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Eye} size={20} style={{ color: '#A855F7' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Statut Avatar</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">État de votre reflet numérique 3D</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              data.completionPercentage === 100 ? 'bg-green-400' : data.completionPercentage > 0 ? 'bg-purple-400' : 'bg-gray-400'
            }`}
          />
          <span className={`text-sm font-medium ${
            data.completionPercentage === 100 ? 'text-green-300' : data.completionPercentage > 0 ? 'text-purple-300' : 'text-gray-400'
          }`}>
            {data.completionPercentage === 100 ? 'Complet' : data.completionPercentage > 0 ? 'Partiel' : 'Vide'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              data.completionPercentage === 100
                ? 'bg-green-500/20 border-green-400/40'
                : data.completionPercentage > 0
                ? 'bg-purple-500/20 border-purple-400/40'
                : 'bg-gray-500/20 border-gray-400/40'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <SpatialIcon
              Icon={data.completionPercentage === 100 ? ICONS.CheckCircle : data.completionPercentage > 0 ? ICONS.Circle : ICONS.XCircle}
              size={24}
              className={
                data.completionPercentage === 100
                  ? 'text-green-400'
                  : data.completionPercentage > 0
                  ? 'text-purple-400'
                  : 'text-gray-400'
              }
            />
          </motion.div>

          <div>
            <h4 className="text-white font-semibold">
              {data.completionPercentage === 100
                ? 'Avatar Complet'
                : data.completionPercentage > 0
                ? 'Avatar Partiel'
                : 'Aucun Avatar'}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              {data.hasBodyScan && (
                <div className="flex items-center gap-1 text-xs text-purple-300">
                  <SpatialIcon Icon={ICONS.User} size={12} />
                  <span>Corps 3D</span>
                </div>
              )}
              {!data.hasBodyScan && (
                <span className="text-xs text-gray-400">Aucun scan disponible</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-white mb-1">{data.completionPercentage}%</div>
          <div className="text-purple-300 text-xs">Complété</div>
        </div>
      </div>

      {data.completionPercentage < 100 && (
        <button
          onClick={() => navigate('/body-scan')}
          className="btn-glass--primary mt-6 w-full"
        >
          <div className="flex items-center justify-center gap-2">
            <SpatialIcon Icon={ICONS.Scan} size={16} />
            <span>Scanner mon corps</span>
          </div>
        </button>
      )}
    </GlassCard>
  );
};

interface LastScanCardProps {
  data: AvatarData;
}

export const LastScanCard: React.FC<LastScanCardProps> = ({ data }) => {
  const navigate = useNavigate();

  if (!data.lastScanDate) {
    return (
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(168, 85, 247, 0.2)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #A855F7 35%, transparent), color-mix(in srgb, #A855F7 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #A855F7 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #A855F7 30%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Clock} size={20} style={{ color: '#A855F7' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl text-white font-semibold">Dernier Scan</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Aucun scan disponible</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/20">
          <div className="flex items-start gap-3">
            <SpatialIcon Icon={ICONS.Info} size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-purple-200 text-sm leading-relaxed">
                Vous n'avez pas encore effectué de scan corporel.
                Commencez par scanner votre corps pour créer votre avatar numérique 3D.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/body-scan')}
          className="btn-glass--primary mt-4 w-full"
        >
          <div className="flex items-center justify-center gap-2">
            <SpatialIcon Icon={ICONS.Scan} size={16} />
            <span>Commencer un scan</span>
          </div>
        </button>
      </GlassCard>
    );
  }

  const timeAgo = formatDistanceToNow(data.lastScanDate, { locale: fr, addSuffix: true });

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #A855F7 35%, transparent), color-mix(in srgb, #A855F7 25%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #A855F7 50%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #A855F7 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Clock} size={20} style={{ color: '#A855F7' }} variant="pure" />
        </div>
        <div>
          <div className="text-xl text-white font-semibold">Dernier Scan</div>
          <div className="text-white/60 text-sm font-normal mt-0.5">{timeAgo}</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <SpatialIcon Icon={ICONS.User} size={14} className="text-purple-400" />
          <span className="text-white font-medium text-sm">Scans Corporels</span>
        </div>
        <div className="text-white/60 text-xs">
          {data.hasBodyScan ? `${data.bodyScanCount} scan${data.bodyScanCount > 1 ? 's' : ''}` : 'Aucun scan'}
        </div>
      </div>
    </GlassCard>
  );
};

interface QuickActionsCardProps {
  data: AvatarData;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #A855F7 35%, transparent), color-mix(in srgb, #A855F7 25%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #A855F7 50%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #A855F7 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Zap} size={20} style={{ color: '#A855F7' }} variant="pure" />
        </div>
        <div>
          <div className="text-xl text-white font-semibold">Actions Rapides</div>
          <div className="text-white/60 text-sm font-normal mt-0.5">Gérez votre avatar</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/body-scan')}
          className="btn-glass p-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-start gap-3">
            <SpatialIcon Icon={ICONS.Scan} size={18} className="text-purple-400 mt-0.5" />
            <div>
              <div className="text-white font-medium text-sm mb-1">Scanner mon corps</div>
              <div className="text-white/60 text-xs">Créer ou mettre à jour votre scan corporel</div>
            </div>
          </div>
        </button>

        {data.hasBodyScan && (
          <button
            onClick={() => navigate('/avatar')}
            className="btn-glass p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start gap-3">
              <SpatialIcon Icon={ICONS.Eye} size={18} className="text-purple-400 mt-0.5" />
              <div>
                <div className="text-white font-medium text-sm mb-1">Voir mon avatar</div>
                <div className="text-white/60 text-xs">Visualiser votre reflet numérique 3D</div>
              </div>
            </div>
          </button>
        )}

        {data.hasBodyScan && (
          <button
            onClick={() => navigate('/avatar?tab=projection')}
            className="btn-glass p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start gap-3">
              <SpatialIcon Icon={ICONS.TrendingUp} size={18} className="text-purple-400 mt-0.5" />
              <div>
                <div className="text-white font-medium text-sm mb-1">Projections</div>
                <div className="text-white/60 text-xs">Visualiser l'évolution possible</div>
              </div>
            </div>
          </button>
        )}
      </div>
    </GlassCard>
  );
};
