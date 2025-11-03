import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../cards/GlassCard';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';
import {
  calculateProfileCompletenessForForge,
  getProfileStatusMessageForForge,
  type ForgeContext
} from '../../../lib/profile/profileCompleteness';
import logger from '../../../lib/utils/logger';
import { navigateWithScroll } from '../../../utils/navigationUtils';
import { useFeedback } from '../../../hooks';

interface ProfileCompletenessAlertProps {
  profile: any;
  forgeContext: ForgeContext;
}

interface AlertStyle {
  bg: string;
  border: string;
  text: string;
  icon: keyof typeof ICONS;
}

/**
 * ProfileCompletenessAlert - Composant Unifié pour Toutes les Forges
 *
 * Affiche une alerte si les champs critiques du profil sont manquants
 * pour le contexte de forge spécifique.
 *
 * Design:
 * - Ne s'affiche QUE si des champs critiques sont manquants
 * - Disparaît automatiquement dès que le profil est complet
 * - Messages contextualisés par forge
 * - Style cohérent avec le design system
 */
const ProfileCompletenessAlert: React.FC<ProfileCompletenessAlertProps> = ({
  profile,
  forgeContext,
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const navigate = useNavigate();
  const { click, success } = useFeedback();

  // Calculer la complétude du profil pour cette forge spécifique
  const profileAnalysis = React.useMemo(() => {
    logger.debug('PROFILE_COMPLETENESS_ALERT', 'Calculating profile completeness', {
      forgeContext,
      profileExists: !!profile,
      profileId: profile?.id,
      timestamp: new Date().toISOString()
    });

    const completeness = calculateProfileCompletenessForForge(profile, forgeContext);

    logger.debug('PROFILE_COMPLETENESS_ALERT', 'Profile completeness calculated', {
      forgeContext,
      percentage: completeness.percentage,
      canProvideAccurateAnalysis: completeness.canProvideAccurateAnalysis,
      missingCriticalCount: completeness.missingCritical.length,
      missingCritical: completeness.missingCritical,
      timestamp: new Date().toISOString()
    });

    return completeness;
  }, [
    profile,
    forgeContext,
    profile?.sex,
    profile?.height_cm,
    profile?.weight_kg,
    profile?.objective,
    profile?.activity_level,
    profile?.birthdate,
    profile?._immutabilityMarker,
    profile?.updated_at
  ]);

  const statusMessage = getProfileStatusMessageForForge(profileAnalysis, forgeContext);

  // CRITIQUE: Ne pas afficher si le profil est complet
  // L'alerte ne doit pas devenir un composant parasite
  if (profileAnalysis.canProvideAccurateAnalysis || profileAnalysis.percentage >= 100) {
    return null;
  }

  // Style en fonction de la sévérité
  const alertStyle: AlertStyle = {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
    text: '#EF4444',
    icon: 'AlertCircle'
  };

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
      })}
    >
      <GlassCard
        className="p-4"
        style={{
          background: isPerformanceMode
            ? `linear-gradient(145deg, ${alertStyle.bg}, transparent)`
            : `radial-gradient(circle at 30% 20%, ${alertStyle.bg} 0%, transparent 60%), var(--glass-opacity)`,
          borderColor: alertStyle.border,
          boxShadow: isPerformanceMode
            ? '0 4px 16px rgba(0, 0, 0, 0.5)'
            : `0 0 20px ${alertStyle.text}15`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `${alertStyle.text}20`,
                border: `1px solid ${alertStyle.text}40`
              }}
            >
              <SpatialIcon
                Icon={ICONS[alertStyle.icon]}
                size={12}
                style={{ color: alertStyle.text }}
              />
            </div>
            <div>
              <span className="text-white font-medium text-sm">
                {statusMessage.title}
              </span>
              <div className="text-white/60 text-xs mt-1">
                {profileAnalysis.missingCritical.length > 0
                  ? `${profileAnalysis.missingCritical.length} champs critiques manquants`
                  : `${profileAnalysis.percentage}% complété`}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              click();
              navigateWithScroll(navigate, '/profile', {
                tab: 'identity',
                smooth: true,
                delay: 150
              });
              success();
            }}
            className="btn-glass--secondary-nav px-3 py-1.5 text-xs"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              color: '#3B82F6'
            }}
          >
            <div className="flex items-center gap-1">
              <SpatialIcon Icon={ICONS.User} size={12} />
              <span>{statusMessage.actionText || 'Compléter'}</span>
            </div>
          </button>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default ProfileCompletenessAlert;
