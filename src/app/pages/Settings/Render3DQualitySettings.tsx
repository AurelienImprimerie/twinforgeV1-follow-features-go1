import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useToast } from '../../../ui/components/ToastProvider';
import { useUserStore } from '../../../system/store/userStore';
import { useRender3DQualityStore, type Render3DQuality } from '../../../system/store/render3DQualityStore';
import { detectDeviceCapabilities } from '../../../lib/3d/performance/mobileDetection';

interface QualityOption {
  id: Render3DQuality;
  name: string;
  description: string;
  details: string;
  pixelRatio: string;
  antialiasing: string;
  recommended?: string;
  icon: any;
  iconColor: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    id: 'auto',
    name: 'Automatique',
    description: 'Détection intelligente selon votre appareil',
    details: 'Laissez le système choisir la meilleure qualité pour votre appareil',
    pixelRatio: 'Variable',
    antialiasing: 'Variable',
    recommended: 'Recommandé pour la plupart des utilisateurs',
    icon: ICONS.Sparkles,
    iconColor: '#18E3FF'
  },
  {
    id: 'low',
    name: 'Économie',
    description: 'Performances maximales, batterie optimisée',
    details: 'Idéal pour les appareils plus anciens ou pour économiser la batterie',
    pixelRatio: '1.0x',
    antialiasing: 'Désactivé',
    icon: ICONS.Zap,
    iconColor: '#10B981'
  },
  {
    id: 'medium',
    name: 'Équilibré',
    description: 'Bon compromis qualité/performance',
    details: 'Rendu amélioré avec un impact minimal sur les performances',
    pixelRatio: '1.25x',
    antialiasing: 'Désactivé',
    icon: ICONS.Target,
    iconColor: '#60A5FA'
  },
  {
    id: 'high',
    name: 'Qualité',
    description: 'Meilleur rendu visuel possible',
    details: 'Antialiasing activé, résolution maximale - réservé aux appareils performants',
    pixelRatio: '1.5x',
    antialiasing: 'Activé',
    recommended: 'Nécessite un appareil récent (iPhone 13+, Galaxy S21+)',
    icon: ICONS.Star,
    iconColor: '#F59E0B'
  }
];

const Render3DQualitySettings: React.FC = () => {
  const { user } = useUserStore();
  const { quality, setQuality, getEffectiveQuality, detectedQuality } = useRender3DQualityStore();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  useEffect(() => {
    // Detect device capabilities on mount
    try {
      const capabilities = detectDeviceCapabilities();
      const deviceName = capabilities.isDesktop ? 'Desktop' :
                        capabilities.isTablet ? 'Tablette' :
                        'Mobile';
      const performanceName = capabilities.performanceLevel === 'high' ? 'Haut de gamme' :
                             capabilities.performanceLevel === 'medium' ? 'Milieu de gamme' :
                             'Entrée de gamme';
      setDeviceInfo(`${deviceName} - ${performanceName}`);
    } catch (error) {
      setDeviceInfo('Non détecté');
    }
  }, []);

  const handleQualitySelect = async (newQuality: Render3DQuality) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await setQuality(newQuality, user?.id);

      const effective = newQuality === 'auto' ? (detectedQuality || 'medium') : newQuality;
      const qualityName = QUALITY_OPTIONS.find(opt => opt.id === newQuality)?.name || newQuality;

      showToast({
        type: 'success',
        title: 'Qualité 3D modifiée',
        message: `${qualityName} - Les changements seront appliqués au prochain chargement 3D`,
        duration: 4000,
      });

      // Warn user if they selected high quality on a low-end device
      if (newQuality === 'high' && detectedQuality === 'low') {
        showToast({
          type: 'warning',
          title: 'Attention',
          message: 'Votre appareil pourrait avoir des difficultés avec cette qualité. Vous pouvez revenir à "Automatique" si vous constatez des ralentissements.',
          duration: 6000,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder la préférence de qualité 3D',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const effectiveQuality = getEffectiveQuality();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Qualité de rendu 3D
        </h3>
        <p className="text-sm text-slate-400 mb-3">
          Contrôlez la qualité visuelle des modèles 3D (avatars, morphologie).
          Une qualité plus élevée améliore le rendu mais peut impacter les performances.
        </p>
        {deviceInfo && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/30 rounded-lg px-3 py-2 border border-slate-700/30">
            <SpatialIcon
              Icon={ICONS.Info}
              size={14}
              color="#64748B"
              variant="pure"
            />
            <span>Appareil détecté: {deviceInfo}</span>
            {detectedQuality && quality === 'auto' && (
              <span className="ml-auto text-cyan-400">
                → Qualité appliquée: {QUALITY_OPTIONS.find(opt => opt.id === effectiveQuality)?.name}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUALITY_OPTIONS.map((option) => {
          const isSelected = quality === option.id;
          const isEffective = effectiveQuality === option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10'
                    : option.recommended
                    ? 'border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-white/5'
                    : 'hover:bg-white/5'
                } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => !isSaving && handleQualitySelect(option.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <SpatialIcon
                      Icon={option.icon}
                      size={24}
                      color={option.iconColor}
                      variant="pure"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-white">
                          {option.name}
                        </h4>
                        {isEffective && quality === 'auto' && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                            Appliqué
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-cyan-400">
                          <SpatialIcon
                            Icon={ICONS.Check}
                            size={14}
                            color="#18E3FF"
                            variant="pure"
                          />
                          <span>Sélectionné</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 mb-3">
                      {option.description}
                    </p>

                    <p className="text-xs text-slate-500 mb-3">
                      {option.details}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <SpatialIcon
                          Icon={ICONS.Maximize}
                          size={12}
                          color="#94A3B8"
                          variant="pure"
                        />
                        <span>Résolution: {option.pixelRatio}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <SpatialIcon
                          Icon={ICONS.Sparkles}
                          size={12}
                          color="#94A3B8"
                          variant="pure"
                        />
                        <span>AA: {option.antialiasing}</span>
                      </div>
                    </div>

                    {option.recommended && (
                      <div className="mt-3 pt-3 border-t border-slate-700/30">
                        <div className="flex items-start gap-1.5 text-xs text-cyan-400/70">
                          <SpatialIcon
                            Icon={ICONS.Info}
                            size={12}
                            color="#22D3EE"
                            variant="pure"
                            className="mt-0.5 flex-shrink-0"
                          />
                          <span>{option.recommended}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-cyan-500/20">
        <div className="flex items-start gap-3">
          <SpatialIcon
            Icon={ICONS.Info}
            size={20}
            color="#18E3FF"
            variant="pure"
            className="flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 text-sm">
            <p className="text-slate-300 mb-2">
              <strong className="text-white">À propos de la qualité 3D:</strong>
            </p>
            <ul className="text-slate-400 space-y-1 text-xs">
              <li>• <strong>Résolution (pixelRatio)</strong>: Plus élevée = moins de pixélisation mais plus gourmand en ressources</li>
              <li>• <strong>Antialiasing (AA)</strong>: Lisse les bords mais consomme plus de batterie</li>
              <li>• Le mode <strong>Automatique</strong> détecte votre appareil et choisit la meilleure qualité</li>
              <li>• Les changements prennent effet au prochain chargement d'un modèle 3D</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Render3DQualitySettings;
