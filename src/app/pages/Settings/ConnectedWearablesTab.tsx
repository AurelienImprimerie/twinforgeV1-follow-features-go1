import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useUserStore } from '../../../system/store/userStore';
import { wearableDataService } from '../../../system/services/wearableDataService';
import { activityWearableEnrichmentService } from '../../../system/services/activityWearableEnrichmentService';
import { wearableOAuthService } from '../../../system/services/wearableOAuthService';
import { useToast } from '../../../ui/components/ToastProvider';
import { useFeedback } from '../../../hooks/useFeedback';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConnectedDevice, Provider, PROVIDER_CONFIGS as ProviderConfigsType } from '../../../domain/connectedDevices';
import { MVP_PROVIDERS, PROVIDER_CONFIGS } from '../../../domain/connectedDevices';
import logger from '../../../lib/utils/logger';

const ConnectedWearablesTab: React.FC = () => {
  const { session } = useUserStore();
  const { showToast } = useToast();
  const { click } = useFeedback();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Fetch connected devices
  const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ['connected-devices', userId],
    queryFn: async () => {
      if (!userId) return [];
      return wearableDataService.getConnectedDevices(userId);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // Check for unused wearable data
  const { data: unusedDataInfo } = useQuery({
    queryKey: ['unused-wearable-data', userId],
    queryFn: async () => {
      if (!userId) return null;
      return activityWearableEnrichmentService.checkUnusedWearableData(userId);
    },
    enabled: !!userId,
  });

  // Mutation for syncing device
  const syncMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return wearableDataService.triggerSync(deviceId);
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Synchronisation réussie',
        message: 'Vos données ont été synchronisées avec succès',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['connected-devices'] });
      queryClient.invalidateQueries({ queryKey: ['unused-wearable-data'] });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Erreur de synchronisation',
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        duration: 4000,
      });
    },
  });

  // Mutation for disconnecting device
  const disconnectMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return wearableDataService.disconnectDevice(deviceId);
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Appareil déconnecté',
        message: 'L\'appareil a été déconnecté avec succès',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['connected-devices'] });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Erreur de déconnexion',
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        duration: 4000,
      });
    },
  });

  // Mutation for enriching activities
  const enrichMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return activityWearableEnrichmentService.enrichAllUserActivities(userId, 50);
    },
    onSuccess: (results) => {
      const enrichedCount = results.filter(r => r.enriched).length;
      showToast({
        type: 'success',
        title: 'Enrichissement terminé',
        message: `${enrichedCount} activités ont été enrichies avec vos données wearables`,
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['unused-wearable-data'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Erreur d\'enrichissement',
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        duration: 4000,
      });
    },
  });

  // Mutation for backfilling historical data
  const backfillMutation = useMutation({
    mutationFn: async ({ deviceId, days }: { deviceId: string; days: number }) => {
      return wearableDataService.triggerSync(deviceId, undefined);
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Récupération historique lancée',
        message: 'Vos données historiques sont en cours de récupération. Cela peut prendre quelques minutes.',
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['connected-devices'] });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Erreur de récupération',
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        duration: 4000,
      });
    },
  });

  const handleConnect = async (provider: Provider) => {
    click();
    logger.info('WEARABLES_TAB', 'Connect button clicked', { provider });

    // Special handling for Apple Health (requires native app)
    if (provider === 'apple_health') {
      showToast({
        type: 'info',
        title: 'Apple Health',
        message: 'Apple Health nécessite l\'application iOS. Veuillez utiliser l\'app mobile pour connecter votre Apple Watch.',
        duration: 5000,
      });
      return;
    }

    try {
      // Show loading toast
      showToast({
        type: 'info',
        title: 'Connexion en cours',
        message: `Redirection vers ${PROVIDER_CONFIGS[provider].name}...`,
        duration: 2000,
      });

      // Initialize OAuth flow
      await wearableOAuthService.initOAuthFlow(provider);
    } catch (error) {
      logger.error('WEARABLES_TAB', 'OAuth initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        provider,
      });

      showToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: error instanceof Error
          ? error.message
          : 'Impossible d\'initialiser la connexion. Veuillez réessayer.',
        duration: 5000,
      });
    }
  };

  const handleSync = (deviceId: string) => {
    click();
    syncMutation.mutate(deviceId);
  };

  const handleDisconnect = (deviceId: string) => {
    click();
    if (window.confirm('Êtes-vous sûr de vouloir déconnecter cet appareil ?')) {
      disconnectMutation.mutate(deviceId);
    }
  };

  const handleEnrichActivities = () => {
    click();
    enrichMutation.mutate();
  };

  const handleBackfill = (deviceId: string, days: number = 7) => {
    click();
    backfillMutation.mutate({ deviceId, days });
  };

  // Get MVP providers that are not yet connected
  const availableProviders = MVP_PROVIDERS.filter(
    (provider) => !devices.some((d) => d.provider === provider && d.status === 'connected')
  );

  // Get connected devices from MVP providers
  const connectedDevices = devices.filter((d) => MVP_PROVIDERS.includes(d.provider as any));

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, #3B82F6 25%, transparent), color-mix(in srgb, #3B82F6 15%, transparent))',
              border: '1px solid color-mix(in srgb, #3B82F6 35%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #3B82F6 20%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Activity} size={24} style={{ color: '#3B82F6' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Objets Connectés</h2>
            <p className="text-white/70 text-base leading-relaxed">
              Connectez vos montres et capteurs pour enrichir automatiquement vos activités avec des données biométriques
              (fréquence cardiaque, VO2max, zones cardio, etc.)
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Unused Data Alert */}
      {unusedDataInfo?.hasUnusedData && (
        <GlassCard
          className="p-6"
          style={{
            background: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 10%, transparent), transparent 60%), var(--glass-opacity)',
            borderColor: 'color-mix(in srgb, #F59E0B 30%, transparent)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'color-mix(in srgb, #F59E0B 20%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 40%, transparent)',
              }}
            >
              <SpatialIcon Icon={ICONS.AlertCircle} size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Données non exploitées détectées</h3>
              <p className="text-white/80 text-sm mb-4">
                Vous avez {unusedDataInfo.potentialActivitiesCount} activités qui pourraient être enrichies avec vos données wearables.
              </p>
              <button
                onClick={handleEnrichActivities}
                disabled={enrichMutation.isPending}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: 'white',
                  opacity: enrichMutation.isPending ? 0.6 : 1,
                }}
              >
                {enrichMutation.isPending ? 'Enrichissement en cours...' : 'Enrichir maintenant'}
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Appareils connectés</h3>
          <div className="grid grid-cols-1 gap-4">
            {connectedDevices.map((device) => {
              const config = PROVIDER_CONFIGS[device.provider];
              return (
                <GlassCard key={device.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${config.color} 20%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${config.color} 40%, transparent)`,
                      }}
                    >
                      <SpatialIcon Icon={ICONS[config.icon as keyof typeof ICONS] || ICONS.Activity} size={20} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{config.name}</h4>
                      <p className="text-white/60 text-sm">{device.displayName || config.description}</p>
                      {device.lastSyncAt && (
                        <p className="text-white/40 text-xs mt-1">
                          Dernière sync: {new Date(device.lastSyncAt).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSync(device.id)}
                        disabled={syncMutation.isPending || device.status === 'syncing'}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                        style={{
                          background: 'color-mix(in srgb, #3B82F6 20%, transparent)',
                          border: '1px solid color-mix(in srgb, #3B82F6 40%, transparent)',
                          color: '#3B82F6',
                        }}
                      >
                        {device.status === 'syncing' ? 'Sync...' : 'Synchroniser'}
                      </button>
                      {!device.lastSyncAt && (
                        <button
                          onClick={() => handleBackfill(device.id, 7)}
                          disabled={backfillMutation.isPending}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                          style={{
                            background: 'color-mix(in srgb, #10B981 20%, transparent)',
                            border: '1px solid color-mix(in srgb, #10B981 40%, transparent)',
                            color: '#10B981',
                          }}
                        >
                          {backfillMutation.isPending ? 'Récup...' : 'Récupérer historique'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDisconnect(device.id)}
                        disabled={disconnectMutation.isPending}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                        style={{
                          background: 'color-mix(in srgb, #EF4444 20%, transparent)',
                          border: '1px solid color-mix(in srgb, #EF4444 40%, transparent)',
                          color: '#EF4444',
                        }}
                      >
                        Déconnecter
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Providers */}
      {availableProviders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Connecter un appareil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProviders.map((provider) => {
              const config = PROVIDER_CONFIGS[provider];
              return (
                <GlassCard key={provider} className="p-6 cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: `color-mix(in srgb, ${config.color} 20%, transparent)`,
                        border: `2px solid color-mix(in srgb, ${config.color} 40%, transparent)`,
                        boxShadow: `0 0 20px color-mix(in srgb, ${config.color} 20%, transparent)`,
                      }}
                    >
                      <SpatialIcon Icon={ICONS[config.icon as keyof typeof ICONS] || ICONS.Activity} size={28} style={{ color: config.color }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{config.name}</h4>
                      <p className="text-white/60 text-sm">{config.description}</p>
                    </div>
                    <button
                      onClick={() => handleConnect(provider)}
                      className="w-full px-4 py-2 rounded-lg font-medium text-sm transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${config.color}, color-mix(in srgb, ${config.color} 80%, #000))`,
                        color: 'white',
                      }}
                    >
                      Connecter
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {connectedDevices.length === 0 && (
        <GlassCard className="p-12 text-center">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, #3B82F6 20%, transparent), color-mix(in srgb, #3B82F6 10%, transparent))',
              border: '1px solid color-mix(in srgb, #3B82F6 30%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Watch} size={40} style={{ color: '#3B82F6' }} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Aucun appareil connecté</h3>
          <p className="text-white/70 text-base max-w-md mx-auto leading-relaxed">
            Connectez votre premier appareil pour commencer à enrichir vos activités avec des données biométriques précises.
          </p>
        </GlassCard>
      )}
    </div>
  );
};

export default ConnectedWearablesTab;
