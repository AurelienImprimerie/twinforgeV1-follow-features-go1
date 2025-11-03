/**
 * Privacy Settings Tab
 * Complete RGPD compliance with data export and account deletion
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  Clock,
  Lock,
  Eye,
  Check,
} from 'lucide-react';
import { useDataPrivacyStore } from '../../../system/store/dataPrivacyStore';
import { useUserStore } from '../../../system/store/userStore';
import { dataExportService } from '../../../system/services/dataExportService';
import { accountDeletionService } from '../../../system/services/accountDeletionService';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import {
  SettingsToggle,
  SettingsInfoCard,
  SettingsButton,
} from '../../../ui/components/settings';
import {
  DATA_CATEGORY_CONFIGS,
  RETENTION_POLICIES,
  getDaysUntilDeletion,
  getExportSizeFormatted,
} from '../../../domain/privacy';
import type { DataRetentionPreference, ExportableDataCategory } from '../../../domain/privacy';

export const PrivacySettingsTab: React.FC = () => {
  const { profile } = useUserStore();
  const userId = profile?.id;

  const {
    preferences,
    activeDeletionRequest,
    recentExportRequests,
    isLoading,
    isSaving,
    error,
    loadPrivacyPreferences,
    updatePrivacyPreference,
    loadExportRequests,
    requestDataExport,
    loadDeletionRequest,
    requestAccountDeletion,
    cancelAccountDeletion,
    clearError,
  } = useDataPrivacyStore();

  const [selectedExportCategories, setSelectedExportCategories] = useState<ExportableDataCategory[]>(
    DATA_CATEGORY_CONFIGS.filter((c) => c.includeByDefault).map((c) => c.category)
  );
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;

      try {
        await Promise.all([
          loadPrivacyPreferences(userId),
          loadExportRequests(userId),
          loadDeletionRequest(userId),
        ]);
      } catch (err) {
        console.error('Failed to load privacy settings:', err);
      }
    };

    loadData();
  }, [userId]);

  // Handle data export
  const handleRequestExport = async () => {
    if (!userId) return;

    await requestDataExport(
      {
        request_type: 'partial_export',
        export_format: 'json',
        included_data: selectedExportCategories,
      },
      userId
    );
  };

  // Handle account deletion request
  const handleRequestDeletion = async () => {
    if (!userId) return;

    const requestId = await requestAccountDeletion(
      {
        delete_all_data: true,
        anonymize_only: false,
        reason: deletionReason || undefined,
      },
      userId
    );

    if (requestId) {
      setShowDeletionConfirm(false);
      setDeletionReason('');
    }
  };

  // Handle deletion cancellation
  const handleCancelDeletion = async () => {
    if (!userId) return;

    const success = await cancelAccountDeletion(
      {
        reason: 'Annulation par l\'utilisateur',
      },
      userId
    );

    if (success) {
      await loadDeletionRequest(userId);
    }
  };

  // Handle export download
  const handleDownloadExport = async (requestId: string) => {
    await dataExportService.downloadExport(requestId);
  };

  // Toggle export category
  const toggleExportCategory = (category: ExportableDataCategory) => {
    setSelectedExportCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Calculate estimated export size
  const estimatedSize = dataExportService.estimateExportSize(selectedExportCategories);

  // Get deletion warning info if exists
  const deletionInfo = activeDeletionRequest
    ? accountDeletionService.getDeletionWarningInfo(activeDeletionRequest)
    : null;

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

      {/* Active Deletion Warning */}
      {activeDeletionRequest && deletionInfo && (
        <SettingsInfoCard
          type={deletionInfo.warningLevel}
          title="Suppression de compte programmée"
          message={
            <div>
              <p>{deletionInfo.message}</p>
              <p style={{ marginTop: '0.5rem' }}>
                <strong>Date prévue:</strong>{' '}
                {deletionInfo.scheduledDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          }
          actions={
            deletionInfo.canCancel && (
              <SettingsButton
                variant="secondary"
                onClick={handleCancelDeletion}
                loading={isSaving}
                icon={<Clock size={18} />}
              >
                Annuler la suppression
              </SettingsButton>
            )
          }
        />
      )}

      {/* Security Reassurance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <SpatialIcon
                Icon={ICONS.Shield}
                size={32}
                color="#22C55E"
                variant="pure"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-3">
                Vos données sont strictement confidentielles et ultra-protégées
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Chiffrement de bout en bout:</strong> Toutes vos données sensibles sont chiffrées avant stockage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Accès strictement limité:</strong> Seul vous avez accès à vos données personnelles et métriques</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Conformité RGPD:</strong> Nous respectons vos droits d'accès, de rectification et de suppression</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Aucun partage:</strong> Vos données ne sont jamais partagées avec des tiers à des fins commerciales</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Contrôle total:</strong> Vous pouvez exporter ou supprimer vos données à tout moment</span>
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Header Description */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Gérer votre confidentialité
        </h3>
        <p className="text-sm text-slate-400">
          Contrôlez vos préférences de confidentialité et gérez vos données personnelles en toute transparence.
        </p>
      </div>

      {/* Privacy Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <SpatialIcon
              Icon={ICONS.Shield}
              size={24}
              color="#18E3FF"
              variant="pure"
            />
            <div className="flex-1">
              <h4 className="text-base font-semibold text-white mb-1">
                Préférences de confidentialité
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contrôlez comment vos données sont utilisées
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Data Retention Preference */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <label className="block text-sm font-medium text-white mb-2">
                Durée de conservation des données
              </label>
              <select
                value={preferences.data_retention_preference}
                onChange={(e) =>
                  updatePrivacyPreference(
                    'data_retention_preference',
                    e.target.value as DataRetentionPreference,
                    userId
                  )
                }
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="minimal">Minimale (30 jours)</option>
                <option value="standard">Standard (2 ans)</option>
                <option value="extended">Étendue (indéfinie)</option>
              </select>
              <p className="text-xs text-slate-400 mt-2">
                Choisissez combien de temps nous conservons vos données historiques
              </p>
            </div>

            {/* Analytics Toggle */}
            <SettingsToggle
              label="Suivi analytique"
              description="Nous aide à améliorer l'application en analysant votre utilisation de manière anonymisée"
              enabled={preferences.analytics_tracking_enabled}
              onChange={(value) => updatePrivacyPreference('analytics_tracking_enabled', value, userId)}
              disabled={isLoading}
              loading={isSaving}
            />

            {/* Marketing Communications Toggle */}
            <SettingsToggle
              label="Communications marketing"
              description="Recevez des actualités, conseils et offres promotionnelles"
              enabled={preferences.marketing_communications_enabled}
              onChange={(value) =>
                updatePrivacyPreference('marketing_communications_enabled', value, userId)
              }
              disabled={isLoading}
              loading={isSaving}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Data Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <SpatialIcon
              Icon={ICONS.Download}
              size={24}
              color="#60A5FA"
              variant="pure"
            />
            <div className="flex-1">
              <h4 className="text-base font-semibold text-white mb-1">
                Export de vos données
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Téléchargez une copie complète de vos données (droit à la portabilité RGPD)
              </p>
            </div>
          </div>

          <div className="mb-4">
            <SettingsInfoCard
              type="info"
              message="Sélectionnez les catégories de données que vous souhaitez exporter. Le fichier sera disponible pendant 7 jours."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {DATA_CATEGORY_CONFIGS.map((config) => (
              <label
                key={config.category}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              >
                <input
                  type="checkbox"
                  checked={selectedExportCategories.includes(config.category)}
                  onChange={() => toggleExportCategory(config.category)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{config.label}</span>
                    <span className="text-xs text-slate-400">{config.estimatedSize}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {config.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Taille estimée:</span>
              <span className="font-semibold text-white">{estimatedSize}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-400">Format:</span>
              <span className="font-semibold text-white">JSON</span>
            </div>
          </div>

          <SettingsButton
            onClick={handleRequestExport}
            loading={isSaving}
            disabled={selectedExportCategories.length === 0}
            icon={<Download size={18} />}
            fullWidth
          >
            Demander un export
          </SettingsButton>

          {/* Recent Exports */}
          {recentExportRequests.length > 0 && (
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-white mb-3">Exports récents</h5>
              <div className="space-y-2">
                {recentExportRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-white">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            request.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : request.status === 'processing'
                              ? 'bg-blue-500/20 text-blue-400'
                              : request.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {request.status === 'completed' && 'Prêt'}
                          {request.status === 'processing' && 'En cours'}
                          {request.status === 'pending' && 'En attente'}
                          {request.status === 'failed' && 'Échec'}
                        </span>
                      </div>
                      {request.file_size_bytes && (
                        <span className="text-xs text-slate-400">
                          {getExportSizeFormatted(request.file_size_bytes)}
                        </span>
                      )}
                    </div>
                    {request.status === 'completed' && request.file_url && (
                      <SettingsButton
                        variant="secondary"
                        onClick={() => handleDownloadExport(request.id)}
                        icon={<Download size={16} />}
                      >
                        Télécharger
                      </SettingsButton>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Account Deletion */}
      {!activeDeletionRequest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <GlassCard className="p-6 border border-red-500/20">
            <div className="flex items-start gap-3 mb-6">
              <SpatialIcon
                Icon={ICONS.Trash}
                size={24}
                color="#EF4444"
                variant="pure"
              />
              <div className="flex-1">
                <h4 className="text-base font-semibold text-white mb-1">
                  Suppression de compte
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Supprimer définitivement votre compte et toutes vos données
                </p>
              </div>
            </div>

            <SettingsInfoCard
              type="warning"
              title="Action irréversible"
              message={
                <div>
                  <p className="mb-2">La suppression de votre compte entraînera:</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Suppression de toutes vos données personnelles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Perte définitive de votre progression</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Annulation de vos abonnements</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-xs">
                    <strong>Délai de grâce:</strong> Vous aurez 30 jours pour annuler cette demande.
                  </p>
                </div>
              }
            />

            {!showDeletionConfirm ? (
              <SettingsButton
                variant="danger"
                onClick={() => setShowDeletionConfirm(true)}
                icon={<AlertTriangle size={18} />}
                fullWidth
              >
                Demander la suppression du compte
              </SettingsButton>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Pourquoi souhaitez-vous supprimer votre compte? (optionnel)
                  </label>
                  <textarea
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="Raison de la suppression..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-slate-500"
                  />
                </div>
                <div className="flex gap-3">
                  <SettingsButton
                    variant="ghost"
                    onClick={() => {
                      setShowDeletionConfirm(false);
                      setDeletionReason('');
                    }}
                    fullWidth
                  >
                    Annuler
                  </SettingsButton>
                  <SettingsButton
                    variant="danger"
                    onClick={handleRequestDeletion}
                    loading={isSaving}
                    icon={<Trash2 size={18} />}
                    fullWidth
                  >
                    Confirmer la suppression
                  </SettingsButton>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Info Card */}
      <GlassCard className="p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <div className="flex items-start gap-3">
          <SpatialIcon
            Icon={ICONS.Info}
            size={20}
            color="#60A5FA"
            variant="pure"
          />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-2">
              Vos droits RGPD
            </h4>
            <ul className="text-xs text-slate-400 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  <strong>Droit d'accès:</strong> Consultez toutes vos données stockées à tout moment
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  <strong>Droit de rectification:</strong> Modifiez vos informations personnelles depuis votre profil
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  <strong>Droit à la portabilité:</strong> Exportez vos données dans un format standard
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>
                  <strong>Droit à l'oubli:</strong> Supprimez votre compte et toutes vos données définitivement
                </span>
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Loading State */}
      {isLoading && !error && (
        <SettingsInfoCard type="info" message="Chargement des paramètres de confidentialité..." />
      )}
    </div>
  );
};
