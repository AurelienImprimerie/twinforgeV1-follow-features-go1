import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';
import { useToast } from '../../../ui/components/ToastProvider';
import PerformanceModeCard from '../../../ui/components/PerformanceModeCard';
import { devicePerformanceDetectionService, PerformanceRecommendation } from '../../../system/services/devicePerformanceDetectionService';
import { PerformanceMode } from '../../../system/store/performanceModeStore';

const GeneralSettingsTab: React.FC = () => {
  const { mode, recommendedMode, isLoading, setMode } = usePerformanceMode();
  const { showToast } = useToast();
  const [deviceRecommendation, setDeviceRecommendation] = useState<PerformanceRecommendation | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const recommendation = devicePerformanceDetectionService.analyzeDevice();
    setDeviceRecommendation(recommendation);
  }, []);

  const handleModeChange = async (newMode: PerformanceMode) => {
    if (isChanging || isLoading) return;

    setIsChanging(true);
    try {
      await setMode(newMode);

      const modeLabels: Record<PerformanceMode, string> = {
        'high-performance': 'Performance Maximale',
        'balanced': 'Équilibré',
        'quality': 'Qualité Premium',
      };

      showToast({
        type: 'success',
        title: `Mode ${modeLabels[newMode]} activé`,
        message: 'La page va se recharger pour appliquer les changements',
        duration: 2000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de modifier le mode performance',
        duration: 3000,
      });
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      {deviceRecommendation && (
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <SpatialIcon
              Icon={ICONS.Smartphone}
              size={28}
              color="#60A5FA"
              variant="pure"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Votre Appareil
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Modèle</span>
                  <span className="text-sm text-white font-medium">{deviceRecommendation.deviceSpecs.deviceModel}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Catégorie</span>
                  <span className="text-sm text-white font-medium">
                    {devicePerformanceDetectionService.getCategoryLabel(deviceRecommendation.deviceCategory)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">RAM</span>
                  <span className="text-sm text-white font-medium">{deviceRecommendation.deviceSpecs.memoryGB}GB</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Score</span>
                  <span className="text-sm text-white font-medium">{deviceRecommendation.performanceScore}/100</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${deviceRecommendation.performanceScore}%` }}
                      transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: deviceRecommendation.performanceScore >= 70
                          ? 'linear-gradient(90deg, #10B981, #34D399)'
                          : deviceRecommendation.performanceScore >= 50
                          ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                          : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            Choisissez votre mode de performance
          </h3>
          <p className="text-sm text-slate-400">
            Nous avons conçu 3 niveaux de qualité visuelle pour adapter l'expérience à votre appareil.
            Vous pouvez changer de mode à tout moment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PerformanceModeCard
            mode="high-performance"
            isSelected={mode === 'high-performance'}
            isRecommended={recommendedMode === 'high-performance'}
            onClick={() => handleModeChange('high-performance')}
            disabled={isChanging || isLoading}
          />
          <PerformanceModeCard
            mode="balanced"
            isSelected={mode === 'balanced'}
            isRecommended={recommendedMode === 'balanced'}
            onClick={() => handleModeChange('balanced')}
            disabled={isChanging || isLoading}
          />
          <PerformanceModeCard
            mode="quality"
            isSelected={mode === 'quality'}
            isRecommended={recommendedMode === 'quality'}
            onClick={() => handleModeChange('quality')}
            disabled={isChanging || isLoading}
          />
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-start gap-3">
          <SpatialIcon
            Icon={ICONS.Info}
            size={20}
            color="#60A5FA"
            variant="pure"
          />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-2">
              À propos des modes de performance
            </h4>
            <ul className="text-xs text-slate-400 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>
                  <strong className="text-slate-300">Performance Maximale:</strong> Désactive tous les effets visuels coûteux pour garantir 60fps.
                  Idéal pour les appareils anciens (iPhone 8-10) ou si vous privilégiez la fluidité et la batterie.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>
                  <strong className="text-slate-300">Équilibré:</strong> Active les animations essentielles et un design soigné.
                  Compromis idéal entre performance et esthétique. Recommandé pour iPhone 11-12 et appareils mid-range.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>
                  <strong className="text-slate-300">Qualité Premium:</strong> Active tous les effets visuels pour une expérience immersive complète.
                  Nécessite un appareil performant (iPhone 13+ ou desktop récent).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default GeneralSettingsTab;
