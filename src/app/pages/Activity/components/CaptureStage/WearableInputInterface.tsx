import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import { useWearableSync } from '../../../../../hooks/useWearableSync';
import { useUserStore } from '../../../../../system/store/userStore';
import React from 'react';

interface WearableInputInterfaceProps {
  connectedDevicesCount: number;
}

const WearableInputInterface: React.FC<WearableInputInterfaceProps> = ({
  connectedDevicesCount
}) => {
  const navigate = useNavigate();
  const { click } = useFeedback();
  const { session } = useUserStore();
  const { devices, loading, syncing, syncDevice } = useWearableSync(session?.user?.id || null);

  const handleNavigateToSettings = () => {
    click();
    navigate('/settings');
  };

  const handleSyncNow = async () => {
    click();
    if (devices.length > 0) {
      try {
        await syncDevice(devices[0].id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  };

  return (
    <motion.div
      key="wearable-interface"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-4 capture-input-interface"
    >
      <GlassCard className="p-6">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center relative"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.25) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))
                `,
                border: '2px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.2)'
              }}
            >
              <SpatialIcon
                Icon={ICONS.Watch}
                size={48}
                style={{ color: '#22C55E' }}
              />
              <div
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white/20 flex items-center justify-center"
                style={{
                  boxShadow: '0 0 16px rgba(34, 197, 94, 0.6)'
                }}
              >
                <span className="text-white text-xs font-bold">{connectedDevicesCount}</span>
              </div>
            </div>

            {[...Array(3)].map((_, i) => {
              const angle = (i * 120) - 90;
              const radius = 50;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-green-400"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-4px',
                    marginTop: '-4px',
                    boxShadow: '0 0 12px rgba(34, 197, 94, 0.8)'
                  }}
                  animate={{
                    x: [0, x, 0],
                    y: [0, y, 0],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.66,
                    ease: "easeInOut"
                  }}
                />
              );
            })}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Synchronisation Active
            </h3>
            <p className="text-white/70 text-base">
              Vos activités sont automatiquement trackées par votre montre connectée
            </p>
          </div>

          {!loading && devices.length > 0 && (
            <div className="space-y-3">
              {devices.slice(0, 3).map((device) => (
                <div
                  key={device.id}
                  className="p-4 rounded-xl text-left"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                        border: '1px solid rgba(34, 197, 94, 0.3)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Watch} size={20} style={{ color: '#22C55E' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">
                        {device.displayName || device.provider.toUpperCase()}
                      </h4>
                      <p className="text-white/50 text-xs">
                        {device.lastSyncAt
                          ? `Dernière synchro: ${new Date(device.lastSyncAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Pas encore synchronisé'}
                      </p>
                    </div>
                    <div
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#22C55E'
                      }}
                    >
                      {device.status === 'connected' && 'Connecté'}
                      {device.status === 'syncing' && 'Synchro...'}
                      {device.status === 'error' && 'Erreur'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            className="p-4 rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--color-plasma-cyan) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-plasma-cyan) 20%, transparent)'
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-plasma-cyan) 25%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: 'var(--color-plasma-cyan)' }} />
              </div>
              <div className="text-left">
                <h5 className="text-cyan-300 font-semibold text-sm mb-1">Tracking Automatique</h5>
                <p className="text-cyan-200/80 text-xs leading-relaxed">
                  Vos activités sont automatiquement enregistrées. Pas besoin de saisie manuelle !
                  Les données sont synchronisées en temps réel depuis votre montre.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSyncNow}
              disabled={syncing || loading}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
              style={{
                background: syncing
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.2))',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                boxShadow: syncing ? 'none' : '0 4px 16px rgba(34, 197, 94, 0.2)'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <SpatialIcon
                  Icon={ICONS.RefreshCw}
                  size={20}
                  className={syncing ? 'animate-spin' : ''}
                />
                <span>{syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}</span>
              </div>
            </button>

            <button
              onClick={handleNavigateToSettings}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <SpatialIcon Icon={ICONS.Settings} size={20} />
                <span>Gérer</span>
              </div>
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default WearableInputInterface;
