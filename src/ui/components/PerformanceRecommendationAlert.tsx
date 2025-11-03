import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { devicePerformanceDetectionService, PerformanceRecommendation } from '../../system/services/devicePerformanceDetectionService';
import { useToast } from './ToastProvider';
import { supabase } from '../../system/supabase/client';
import { useUserStore } from '../../system/store/userStore';
import logger from '../../lib/utils/logger';

interface PerformanceRecommendationAlertProps {
  recommendation: PerformanceRecommendation;
  onDismiss: () => void;
  onNavigateToSettings: () => void;
}

const PerformanceRecommendationAlert: React.FC<PerformanceRecommendationAlertProps> = ({
  recommendation,
  onDismiss,
  onNavigateToSettings,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleDismiss = async () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleGoToSettings = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate('/settings');
      onNavigateToSettings();
    }, 300);
  };

  const getModeIcon = () => {
    switch (recommendation.recommendedMode) {
      case 'high-performance':
        return ICONS.Zap;
      case 'balanced':
        return ICONS.Scale;
      case 'quality':
        return ICONS.Sparkles;
      default:
        return ICONS.Settings;
    }
  };

  const getModeColor = () => {
    switch (recommendation.recommendedMode) {
      case 'high-performance':
        return '#10B981';
      case 'balanced':
        return '#3B82F6';
      case 'quality':
        return '#A855F7';
      default:
        return '#94A3B8';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <SpatialIcon
                      Icon={getModeIcon()}
                      size={40}
                      color={getModeColor()}
                      variant="pure"
                    />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Optimisation Détectée
                    </h2>
                    <p className="text-sm text-slate-400">
                      Configuration de performance recommandée
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white transition-colors p-2"
                  aria-label="Fermer"
                >
                  <SpatialIcon Icon={ICONS.X} size={24} variant="pure" />
                </button>
              </div>

              <div className="space-y-6">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <SpatialIcon
                      Icon={ICONS.Smartphone}
                      size={24}
                      color="#60A5FA"
                      variant="pure"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Votre Appareil
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-400">Modèle:</span>
                          <span className="text-white ml-2">{recommendation.deviceSpecs.deviceModel}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Catégorie:</span>
                          <span className="text-white ml-2">
                            {devicePerformanceDetectionService.getCategoryLabel(recommendation.deviceCategory)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">RAM:</span>
                          <span className="text-white ml-2">{recommendation.deviceSpecs.memoryGB}GB</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Processeur:</span>
                          <span className="text-white ml-2">{recommendation.deviceSpecs.cores} cœurs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Score de Performance</span>
                        <span className="font-semibold" style={{ color: getScoreColor(recommendation.performanceScore) }}>
                          {recommendation.performanceScore}/100
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${recommendation.performanceScore}%` }}
                          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${getScoreColor(recommendation.performanceScore)} 0%, ${getScoreColor(recommendation.performanceScore)}CC 100%)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${getModeColor()}20 0%, ${getModeColor()}10 100%)`,
                    border: `1px solid ${getModeColor()}40`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <SpatialIcon
                      Icon={getModeIcon()}
                      size={28}
                      color={getModeColor()}
                      variant="pure"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Mode Recommandé: {devicePerformanceDetectionService.getModeLabel(recommendation.recommendedMode)}
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {recommendation.reasons.map((reason, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <SpatialIcon
                          Icon={ICONS.CheckCircle}
                          size={16}
                          color={getModeColor()}
                          variant="pure"
                          className="mt-0.5"
                        />
                        <span className="text-slate-300">{reason}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <SpatialIcon
                      Icon={ICONS.Info}
                      size={20}
                      color="#60A5FA"
                      variant="pure"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Nous avons conçu l'application avec soin pour offrir 3 niveaux de qualité visuelle.
                        Vous pouvez choisir le mode qui vous convient et profiter d'une expérience fluide
                        adaptée à votre appareil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-6 py-3 rounded-2xl font-medium transition-all"
                  style={{
                    background: 'rgba(71, 85, 105, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    color: '#CBD5E1',
                  }}
                >
                  Plus tard
                </button>
                <button
                  onClick={handleGoToSettings}
                  className="flex-1 px-6 py-3 rounded-2xl font-medium transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${getModeColor()} 0%, ${getModeColor()}CC 100%)`,
                    border: `1px solid ${getModeColor()}`,
                    color: 'white',
                    boxShadow: `0 4px 12px ${getModeColor()}40`,
                  }}
                >
                  Choisir mon mode
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PerformanceRecommendationAlert;

export function usePerformanceRecommendationAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [recommendation, setRecommendation] = useState<PerformanceRecommendation | null>(null);
  const { profile } = useUserStore();

  useEffect(() => {
    const checkAndShowAlert = async () => {
      if (!profile?.id) return;

      try {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('performance_alert_shown')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (preferences?.performance_alert_shown) {
          logger.debug('PERFORMANCE_ALERT', 'Alert already shown to user');
          return;
        }

        const deviceRecommendation = devicePerformanceDetectionService.analyzeDevice();

        if (deviceRecommendation.shouldShowAlert) {
          setRecommendation(deviceRecommendation);
          setShowAlert(true);

          await supabase
            .from('user_preferences')
            .upsert({
              user_id: profile.id,
              performance_alert_shown: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });

          logger.info('PERFORMANCE_ALERT', 'Showing performance recommendation alert', {
            recommendedMode: deviceRecommendation.recommendedMode,
            score: deviceRecommendation.performanceScore,
          });
        }
      } catch (error) {
        logger.error('PERFORMANCE_ALERT', 'Failed to check alert status', { error });
      }
    };

    checkAndShowAlert();
  }, [profile?.id]);

  const dismissAlert = () => {
    setShowAlert(false);
    setRecommendation(null);
  };

  return {
    showAlert,
    recommendation,
    dismissAlert,
  };
}
