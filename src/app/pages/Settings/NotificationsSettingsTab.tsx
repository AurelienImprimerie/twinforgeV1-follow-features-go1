/**
 * Notifications Settings Tab
 * Modern notification preferences management with Web Push support
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Smartphone, Mail, Volume2, Vibrate, Check } from 'lucide-react';
import { useNotificationPreferencesStore } from '../../../system/store/notificationPreferencesStore';
import { useUserStore } from '../../../system/store/userStore';
import { webPushService } from '../../../system/services/webPushService';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import {
  SettingsToggle,
  SettingsInfoCard,
  SettingsButton,
} from '../../../ui/components/settings';
import { NOTIFICATION_CATEGORY_CONFIGS } from '../../../domain/notifications';
import type { NotificationCategory } from '../../../domain/notifications';

export const NotificationsSettingsTab: React.FC = () => {
  const { profile } = useUserStore();
  const userId = profile?.id;

  const {
    globalSettings,
    categoryPreferences,
    pushSubscriptions,
    activePushSubscription,
    isLoading,
    isSaving,
    error,
    loadGlobalSettings,
    updateGlobalSetting,
    loadCategoryPreferences,
    updateCategoryPreference,
    loadPushSubscriptions,
    subscribeToPush,
    unsubscribeFromPush,
    clearError,
  } = useNotificationPreferencesStore();

  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadGlobalSettings(userId),
          loadCategoryPreferences(userId),
          loadPushSubscriptions(userId),
          checkPushPermission(),
        ]);
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  // Check push permission
  const checkPushPermission = async () => {
    try {
      if (!('Notification' in window)) {
        setPushPermission('denied');
        return;
      }
      const permission = Notification.permission;
      setPushPermission(permission);
    } catch (err) {
      console.error('Failed to check push permission:', err);
      setPushPermission('denied');
    }
  };

  // Handle push subscription toggle
  const handlePushSubscribe = async () => {
    if (!userId) return;

    setIsSubscribing(true);
    try {
      const subscription = await webPushService.subscribe(userId);
      if (subscription) {
        await subscribeToPush(subscription, userId);
        await checkPushPermission();
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePushUnsubscribe = async () => {
    if (!activePushSubscription || !userId) return;

    setIsSubscribing(true);
    try {
      await unsubscribeFromPush(activePushSubscription.id, userId);
      await webPushService.unsubscribe();
      await checkPushPermission();
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle global setting changes
  const handleGlobalToggle = async (key: keyof typeof globalSettings, value: boolean) => {
    await updateGlobalSetting(key, value, userId);
  };

  // Handle category preference changes
  const handleCategoryToggle = async (category: NotificationCategory, field: string, value: boolean) => {
    await updateCategoryPreference(category, { [field]: value }, userId);
  };

  const isPushEnabled = globalSettings.push_notifications_enabled;
  const hasActivePush = !!activePushSubscription;
  const pushNotSupported = !('Notification' in window) || !('serviceWorker' in navigator);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <SettingsInfoCard
          type="error"
          message={error}
          actions={
            <SettingsButton variant="ghost" onClick={clearError}>
              Fermer
            </SettingsButton>
          }
        />
      )}

      {/* Header Description */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Gérer vos notifications
        </h3>
        <p className="text-sm text-slate-400">
          Personnalisez vos préférences de notifications pour rester informé sans être submergé.
        </p>
      </div>

      {/* Global Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <SpatialIcon
              Icon={ICONS.Bell}
              size={24}
              color="#18E3FF"
              variant="pure"
            />
            <div className="flex-1">
              <h4 className="text-base font-semibold text-white mb-1">
                Paramètres globaux
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contrôlez tous vos types de notifications
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <SettingsToggle
              label="Notifications push"
              description="Recevez des notifications sur votre appareil même quand l'app est fermée"
              enabled={isPushEnabled}
              onChange={(enabled) => handleGlobalToggle('push_notifications_enabled', enabled)}
              disabled={isLoading}
              loading={isSaving}
            />

            <SettingsToggle
              label="Notifications in-app"
              description="Affichez les notifications quand vous utilisez l'application"
              enabled={globalSettings.in_app_notifications_enabled}
              onChange={(enabled) => handleGlobalToggle('in_app_notifications_enabled', enabled)}
              disabled={isLoading}
              loading={isSaving}
            />

            <SettingsToggle
              label="Notifications email"
              description="Recevez des emails pour les notifications importantes"
              enabled={globalSettings.email_notifications_enabled}
              onChange={(enabled) => handleGlobalToggle('email_notifications_enabled', enabled)}
              disabled={isLoading}
              loading={isSaving}
            />

            <SettingsToggle
              label="Son des notifications"
              description="Jouez un son lors de la réception d'une notification"
              enabled={globalSettings.notification_sound_enabled}
              onChange={(enabled) => handleGlobalToggle('notification_sound_enabled', enabled)}
              disabled={isLoading}
              loading={isSaving}
            />

            <SettingsToggle
              label="Vibration"
              description="Faites vibrer l'appareil lors de la réception d'une notification"
              enabled={globalSettings.notification_vibration_enabled}
              onChange={(enabled) => handleGlobalToggle('notification_vibration_enabled', enabled)}
              disabled={isLoading}
              loading={isSaving}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Web Push Configuration */}
      {isPushEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <SpatialIcon
                Icon={ICONS.Smartphone}
                size={24}
                color="#60A5FA"
                variant="pure"
              />
              <div className="flex-1">
                <h4 className="text-base font-semibold text-white mb-1">
                  Configuration Web Push
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gérez vos abonnements aux notifications push
                </p>
              </div>
            </div>

            {pushNotSupported && (
              <SettingsInfoCard
                type="warning"
                message="Les notifications push ne sont pas supportées par votre navigateur."
              />
            )}

            {!pushNotSupported && pushPermission === 'denied' && (
              <SettingsInfoCard
                type="error"
                title="Permission refusée"
                message="Vous avez refusé les notifications. Vous devez autoriser les notifications dans les paramètres de votre navigateur."
              />
            )}

            {!pushNotSupported && pushPermission === 'granted' && !hasActivePush && (
              <SettingsInfoCard
                type="info"
                title="Activez les notifications push"
                message="Abonnez-vous aux notifications push pour recevoir des alertes même quand l'app est fermée."
                actions={
                  <SettingsButton
                    onClick={handlePushSubscribe}
                    loading={isSubscribing}
                    icon={<Bell size={18} />}
                  >
                    Activer les notifications push
                  </SettingsButton>
                }
              />
            )}

            {!pushNotSupported && pushPermission === 'default' && (
              <SettingsInfoCard
                type="info"
                message="Cliquez sur le bouton ci-dessous pour autoriser les notifications push."
                actions={
                  <SettingsButton
                    onClick={handlePushSubscribe}
                    loading={isSubscribing}
                    icon={<Bell size={18} />}
                  >
                    Demander l'autorisation
                  </SettingsButton>
                }
              />
            )}

            {hasActivePush && (
              <SettingsInfoCard
                type="success"
                title="Notifications push actives"
                message={`Abonné depuis ${new Date(activePushSubscription.created_at).toLocaleDateString()}`}
                actions={
                  <SettingsButton
                    variant="danger"
                    onClick={handlePushUnsubscribe}
                    loading={isSubscribing}
                    icon={<BellOff size={18} />}
                  >
                    Désactiver les notifications push
                  </SettingsButton>
                }
              />
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Category-Specific Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="mb-4">
          <h4 className="text-base font-semibold text-white mb-2">
            Notifications par catégorie
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Personnalisez vos préférences pour chaque type de notification
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {NOTIFICATION_CATEGORY_CONFIGS.map((config) => {
            const preference = categoryPreferences.get(config.category);

            return (
              <motion.div
                key={config.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-4">
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-white mb-1">
                      {config.label}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {config.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-xs text-slate-400">Push</span>
                      <button
                        onClick={() => handleCategoryToggle(config.category, 'push_enabled', !(preference?.push_enabled ?? true))}
                        disabled={isLoading || !config.canDisable}
                        className={`w-8 h-4 rounded-full transition-all ${
                          preference?.push_enabled ?? true
                            ? 'bg-cyan-500'
                            : 'bg-slate-600'
                        } ${!config.canDisable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full transition-transform ${
                            preference?.push_enabled ?? true ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-xs text-slate-400">In-app</span>
                      <button
                        onClick={() => handleCategoryToggle(config.category, 'in_app_enabled', !(preference?.in_app_enabled ?? true))}
                        disabled={isLoading || !config.canDisable}
                        className={`w-8 h-4 rounded-full transition-all ${
                          preference?.in_app_enabled ?? true
                            ? 'bg-cyan-500'
                            : 'bg-slate-600'
                        } ${!config.canDisable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full transition-transform ${
                            preference?.in_app_enabled ?? true ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-xs text-slate-400">Email</span>
                      <button
                        onClick={() => handleCategoryToggle(config.category, 'email_enabled', !(preference?.email_enabled ?? false))}
                        disabled={isLoading || !config.canDisable}
                        className={`w-8 h-4 rounded-full transition-all ${
                          preference?.email_enabled ?? false
                            ? 'bg-cyan-500'
                            : 'bg-slate-600'
                        } ${!config.canDisable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full transition-transform ${
                            preference?.email_enabled ?? false ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info Card */}
      <GlassCard className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
        <div className="flex items-start gap-3">
          <SpatialIcon
            Icon={ICONS.Info}
            size={20}
            color="#60A5FA"
            variant="pure"
          />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-2">
              À propos des notifications
            </h4>
            <ul className="text-xs text-slate-400 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  Les notifications push vous permettent de rester informé même quand l'application est fermée
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  Vous pouvez désactiver les notifications pour des catégories spécifiques tout en gardant les autres actives
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  Les notifications importantes (sécurité, mises à jour critiques) ne peuvent pas être désactivées
                </span>
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Loading State */}
      {isLoading && !error && (
        <SettingsInfoCard
          type="info"
          message="Chargement des préférences de notifications..."
        />
      )}
    </div>
  );
};
