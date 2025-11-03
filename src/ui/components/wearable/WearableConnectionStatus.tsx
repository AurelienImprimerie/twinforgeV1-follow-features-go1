import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { useUserStore } from '../../../system/store/userStore';
import { useWearableSync } from '../../../hooks/useWearableSync';
import type { ConnectedDevice } from '../../../domain/connectedDevices';
import { PROVIDER_CONFIGS } from '../../../domain/connectedDevices';
import logger from '../../../lib/utils/logger';
import './WearableConnectionStatus.css';

interface WearableConnectionStatusProps {
  variant?: 'compact' | 'detailed';
  showSyncButton?: boolean;
  className?: string;
}

const WearableConnectionStatus: React.FC<WearableConnectionStatusProps> = ({
  variant = 'compact',
  showSyncButton = false,
  className = '',
}) => {
  const { user } = useUserStore();
  const { devices, loading, syncing, syncDevice, refreshDevices } = useWearableSync(user?.id || null);
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (user?.id) {
      refreshDevices();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || devices.length === 0) return;

    const interval = setInterval(() => {
      refreshDevices();
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id, devices.length]);

  const handleSync = async (deviceId: string) => {
    try {
      setLastSyncStatus('syncing');
      logger.info('[WEARABLE_STATUS] Manual sync initiated', { deviceId });
      await syncDevice(deviceId);
      setLastSyncStatus('success');
      logger.info('[WEARABLE_STATUS] Manual sync completed', { deviceId });

      setTimeout(() => {
        setLastSyncStatus('idle');
      }, 3000);
    } catch (error) {
      setLastSyncStatus('error');
      logger.error('[WEARABLE_STATUS] Manual sync failed', {
        deviceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      setTimeout(() => {
        setLastSyncStatus('idle');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className={`wearable-status-loading ${className}`}>
        <SpatialIcon Icon={ICONS.Loader2} size={20} className="animate-spin" color="#60A5FA" />
        <span>Vérification des appareils...</span>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className={`wearable-status-empty ${className}`}>
        <div className="wearable-status-icon">
          <SpatialIcon Icon={ICONS.Watch} size={24} color="#64748B" />
        </div>
        <div className="wearable-status-text">
          <h4>Aucun appareil connecté</h4>
          <p>Connectez votre montre pour synchroniser vos données</p>
        </div>
      </div>
    );
  }

  const connectedDevices = devices.filter((d) => d.status === 'connected');
  const hasActiveConnection = connectedDevices.length > 0;

  if (variant === 'compact') {
    return (
      <div className={`wearable-status-compact ${className}`}>
        <div className="wearable-status-indicator">
          <div
            className={`status-dot ${hasActiveConnection ? 'connected' : 'disconnected'}`}
            title={hasActiveConnection ? 'Connecté' : 'Déconnecté'}
          />
          <span className="status-label">
            {hasActiveConnection
              ? `${connectedDevices.length} appareil${connectedDevices.length > 1 ? 's' : ''} connecté${connectedDevices.length > 1 ? 's' : ''}`
              : 'Appareils déconnectés'}
          </span>
        </div>

        {hasActiveConnection && connectedDevices[0].lastSyncAt && (
          <span className="last-sync-time">
            Dernière synchro:{' '}
            {new Date(connectedDevices[0].lastSyncAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`wearable-status-detailed ${className}`}>
      <div className="wearable-status-header">
        <div className="status-title">
          <SpatialIcon
            Icon={ICONS.Watch}
            size={24}
            color={hasActiveConnection ? '#10B981' : '#64748B'}
          />
          <h3>Appareils Connectés</h3>
        </div>
        {showSyncButton && hasActiveConnection && (
          <motion.button
            onClick={() => handleSync(connectedDevices[0].id)}
            disabled={syncing || lastSyncStatus === 'syncing'}
            className="sync-all-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SpatialIcon
              Icon={ICONS.RefreshCw}
              size={18}
              className={syncing || lastSyncStatus === 'syncing' ? 'animate-spin' : ''}
            />
            <span>Synchroniser</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {lastSyncStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sync-status-message success"
          >
            <SpatialIcon Icon={ICONS.CheckCircle} size={18} color="#10B981" />
            <span>Synchronisation réussie</span>
          </motion.div>
        )}

        {lastSyncStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sync-status-message error"
          >
            <SpatialIcon Icon={ICONS.AlertCircle} size={18} color="#EF4444" />
            <span>Échec de la synchronisation</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="devices-list">
        {devices.map((device) => {
          const config = PROVIDER_CONFIGS[device.provider];
          const isExpanded = expandedDevice === device.id;
          const isConnected = device.status === 'connected';

          return (
            <motion.div
              key={device.id}
              className={`device-item ${isConnected ? 'connected' : 'disconnected'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="device-main">
                <div className="device-icon-wrapper" style={{ background: `${config.color}20` }}>
                  <SpatialIcon Icon={ICONS[config.icon]} size={24} color={config.color} />
                </div>

                <div className="device-info">
                  <div className="device-name">{device.displayName || config.name}</div>
                  <div className="device-meta">
                    <span className={`device-status-badge ${device.status}`}>
                      {device.status === 'connected' && 'Connecté'}
                      {device.status === 'syncing' && 'Synchronisation...'}
                      {device.status === 'error' && 'Erreur'}
                      {device.status === 'disconnected' && 'Déconnecté'}
                    </span>
                    {device.lastSyncAt && (
                      <span className="device-last-sync">
                        {new Date(device.lastSyncAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setExpandedDevice(isExpanded ? null : device.id)}
                  className="expand-button"
                  aria-label={isExpanded ? 'Réduire' : 'Développer'}
                >
                  <SpatialIcon
                    Icon={isExpanded ? ICONS.ChevronUp : ICONS.ChevronDown}
                    size={20}
                  />
                </button>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="device-details"
                  >
                    <div className="detail-item">
                      <span className="detail-label">Connecté depuis</span>
                      <span className="detail-value">
                        {new Date(device.connectedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {device.lastError && (
                      <div className="detail-item error">
                        <span className="detail-label">Dernière erreur</span>
                        <span className="detail-value">{device.lastError}</span>
                      </div>
                    )}

                    <div className="detail-actions">
                      {isConnected && (
                        <button
                          onClick={() => handleSync(device.id)}
                          disabled={syncing}
                          className="detail-action-button primary"
                        >
                          <SpatialIcon
                            Icon={ICONS.RefreshCw}
                            size={16}
                            className={syncing ? 'animate-spin' : ''}
                          />
                          <span>Synchroniser</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WearableConnectionStatus;
