/**
 * Body Scan Celebration Step - Étape de Célébration avec Confettis
 * Remplace l'étape de traitement par une expérience de célébration premium
 */

import React from 'react';
import { ConditionalMotion } from '../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../hooks/useBodyScanPerformance';
import { useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useFeedback } from '../../../hooks/useFeedback';
import { useProgressStore } from '../../../system/store/progressStore';
import logger from '../../../lib/utils/logger';

/**
 * Body Scan Celebration Step - VisionOS 26 Premium
 * Affiche une célébration avec confettis après le traitement réussi
 */
const BodyScanCelebrationStep: React.FC = () => {
  const performanceConfig = useBodyScanPerformance();
  const location = useLocation();
  const navigate = useNavigate();
  const { successMajor, success } = useFeedback();
  const { completeProgress } = useProgressStore();
  
  // Prevent infinite loops by tracking initialization
  const hasInitialized = React.useRef(false);
  
  // Get scan results from navigation state
  const scanResults = location.state?.scanResults;
  // NOUVEAU: Détecter si c'est un scan facial
  const isFaceScan = location.state?.isFaceScan || false;

  // Redirect if no scan results
  React.useEffect(() => {
    // Prevent multiple executions
    if (hasInitialized.current) return;
    
    if (!scanResults) {
      // MODIFIED: Redirection conditionnelle
      navigate(isFaceScan ? '/avatar#avatar' : '/body-scan', { replace: true });
      return;
    }
    
    // Trigger celebration effects only once
    successMajor();
    completeProgress();
    hasInitialized.current = true;
    
    logger.info('CELEBRATION', 'Celebration step mounted with scan results', {
      hasResults: !!scanResults,
      confidence: getConfidenceFromScanResults(scanResults),
      isFaceScan: isFaceScan // NOUVEAU: Log isFaceScan
    });
  }, [scanResults, navigate, successMajor, completeProgress, isFaceScan]);

  if (!scanResults) {
    return null;
  }

  // FIXED: Extract confidence from multiple possible sources
  const confidence = getConfidenceFromScanResults(scanResults);
  const score = confidence;

  const getCelebrationContent = () => {
    // Adjust particle count based on performance mode
    const getParticleCount = (base: number) => {
      if (performanceConfig.mode === 'high-performance') return 0;
      if (performanceConfig.mode === 'balanced') return Math.ceil(base / 2);
      return base;
    };

    if (score >= 0.9) {
      return {
        title: '🌟 Scan Absolument Parfait !',
        subtitle: 'Votre morphologie a été capturée avec une précision exceptionnelle',
        celebrationMessage: 'Qualité Légendaire Atteinte',
        motivationalQuote: 'Votre reflet numérique sera d\'une fidélité saisissante',
        color: '#10B981',
        icon: ICONS.Zap,
        particleCount: getParticleCount(12),
        celebrationLevel: 'legendary'
      };
    } else if (score >= 0.7) {
      return {
        title: '✨ Scan Exceptionnel !',
        subtitle: 'Votre avatar sera d\'une qualité remarquable',
        celebrationMessage: 'Excellence Morphologique Détectée',
        motivationalQuote: 'Préparez-vous à découvrir votre double numérique parfait',
        color: '#22C55E',
        icon: ICONS.Check,
        particleCount: getParticleCount(10),
        celebrationLevel: 'exceptional'
      };
    } else if (score >= 0.5) {
      return {
        title: '🎯 Scan de Haute Qualité !',
        subtitle: 'Votre morphologie a été analysée avec précision',
        celebrationMessage: 'Analyse Premium Réussie',
        motivationalQuote: 'Votre avatar 3D sera fidèle à votre silhouette unique',
        color: '#10B981',
        icon: ICONS.Target,
        particleCount: getParticleCount(8),
        celebrationLevel: 'high'
      };
    } else if (score > 0) {
      return {
        title: '🚀 Scan Réussi avec Brio !',
        subtitle: 'Votre avatar est prêt avec des optimisations intelligentes',
        celebrationMessage: 'Analyse Avancée Activée',
        motivationalQuote: 'Votre scan a été optimisé avec précision',
        color: '#F59E0B',
        icon: ICONS.Zap,
        particleCount: getParticleCount(6),
        celebrationLevel: 'optimized'
      };
    } else {
      // No confidence data available
      return {
        title: '🎉 Avatar 3D Créé !',
        subtitle: 'Votre reflet numérique est prêt à être découvert',
        celebrationMessage: 'Scan Terminé avec Succès',
        motivationalQuote: 'Explorez votre avatar 3D personnalisé',
        color: '#8B5CF6',
        icon: ICONS.Eye,
        particleCount: getParticleCount(6),
        celebrationLevel: 'complete'
      };
    }
  };

  const celebration = getCelebrationContent();

  const handleDiscoverAvatar = () => {
    success();
    // MODIFIED: Redirection conditionnelle
    navigate(isFaceScan ? '/avatar#avatar' : '/body-scan/review', { 
      state: { scanResults },
      replace: false
    });
  };

  return (
    <div className="relative overflow-visible pt-4 pb-6 md:pb-8">
      {/* Modern Success Card */}
      <ConditionalMotion
        initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 30, scale: 0.95 } : false}
        animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1 }}
        transition={performanceConfig.enableFramerMotion ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } : undefined}
        className="mb-8"
      >
        <GlassCard className="p-8 border-2" style={{
          borderColor: `${celebration.color}40`,
          background: `radial-gradient(ellipse at top, ${celebration.color}15 0%, transparent 60%)`
        }}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Icon Circle */}
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${celebration.color}40, ${celebration.color}20)`,
                  border: `3px solid ${celebration.color}`,
                  boxShadow: `0 0 40px ${celebration.color}60, 0 8px 32px rgba(0,0,0,0.3), inset 0 4px 0 rgba(255,255,255,0.3)`
                }}
              >
                <SpatialIcon Icon={celebration.icon} size={48} style={{ color: celebration.color }} />
              </div>
              {/* Pulse rings */}
              {performanceConfig.enablePulseAnimations && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 animate-ping"
                    style={{
                      borderColor: `${celebration.color}40`,
                      animationDuration: '2s'
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      borderColor: `${celebration.color}30`,
                      animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
                      animationDelay: '0.5s'
                    }}
                  />
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ color: celebration.color }}>
                {celebration.title}
              </h2>
              <p className="text-lg text-white/80 mb-2">
                {celebration.subtitle}
              </p>
              <p className="text-sm text-white/60">
                {celebration.motivationalQuote}
              </p>
            </div>
          </div>

          {/* Score badge if confidence available */}
          {score > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/70 font-medium">Score de qualité</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-48 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${score * 100}%`,
                        background: `linear-gradient(90deg, ${celebration.color}, ${celebration.color}CC)`,
                        boxShadow: `0 0 10px ${celebration.color}`
                      }}
                    />
                  </div>
                  <span className="text-xl font-bold" style={{ color: celebration.color }}>
                    {Math.round(score * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </ConditionalMotion>
      {/* Celebration Background Effects - Simplified */}
      {performanceConfig.mode !== 'high-performance' && (
        <div className="celebration-background-effects absolute inset-0 pointer-events-none overflow-visible -z-10">
        {/* Ambient Glow Background */}
        <div
          className="celebration-ambient-glow absolute inset-0 rounded-3xl"
          style={{
            background: `radial-gradient(circle at center, ${celebration.color}15, transparent 70%)`,
            '--celebration-color': celebration.color
          }}
        />

        {/* Floating Celebration Particles */}
        {[...Array(celebration.particleCount)].map((_, i) => (
          <div
            key={i}
            className={`celebration-particle celebration-particle--${i + 1} absolute w-3 h-3 rounded-full`}
            style={{
              background: `radial-gradient(circle, ${celebration.color}, ${celebration.color}80)`,
              left: `${15 + i * 8}%`,
              top: `${20 + (i % 4) * 15}%`,
              boxShadow: `0 0 12px ${celebration.color}80, 0 0 24px ${celebration.color}40`,
              '--celebration-color': celebration.color,
              '--particle-index': i
            }}
          />
        ))}

        {/* Celebration Rays */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`ray-${i}`}
            className={`celebration-ray celebration-ray--${i + 1} absolute w-1 h-20 rounded-full`}
            style={{
              background: `linear-gradient(180deg, ${celebration.color}60, transparent)`,
              left: `${30 + i * 12}%`,
              top: '10%',
              transformOrigin: 'bottom center',
              '--celebration-color': celebration.color
            }}
          />
        ))}
        </div>
      )}

      {/* Stats Grid */}
      {score > 0 && (
        <ConditionalMotion
          initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 20 } : false}
          animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
          transition={performanceConfig.enableFramerMotion ? { delay: 0.3, duration: 0.5 } : undefined}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-6 text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: celebration.color }}>
                {Math.round(score * 100)}%
              </div>
              <div className="text-sm text-white/70">Précision</div>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: celebration.color }}>
                {celebration.celebrationLevel === 'legendary' ? 'A+' : celebration.celebrationLevel === 'exceptional' ? 'A' : 'B+'}
              </div>
              <div className="text-sm text-white/70">Qualité</div>
            </GlassCard>
          </div>
        </ConditionalMotion>
      )}

      {/* Call to Action - Modern Style */}
      <ConditionalMotion
        className="flex justify-center relative z-10 mt-6"
        initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 20 } : false}
        animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
        transition={performanceConfig.enableFramerMotion ? { delay: 0.5, duration: 0.6 } : undefined}
      >
        <button
          onClick={handleDiscoverAvatar}
          className="w-full max-w-md text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
          style={performanceConfig.mode === 'high-performance' ? {
            background: `linear-gradient(145deg, ${celebration.color}90, ${celebration.color}70)`,
            border: `2px solid ${celebration.color}`,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
          } : {
            background: `linear-gradient(135deg, ${celebration.color}80, ${celebration.color}60)`,
            backdropFilter: 'blur(20px) saturate(160%)',
            border: `2px solid ${celebration.color}`,
            boxShadow: `
              0 12px 40px ${celebration.color}40,
              0 0 60px ${celebration.color}30,
              inset 0 3px 0 rgba(255, 255, 255, 0.4),
              inset 0 -3px 0 rgba(0, 0, 0, 0.2),
              inset 2px 0 0 rgba(255, 255, 255, 0.1),
              inset -2px 0 0 rgba(0, 0, 0, 0.1)
            `,
            transform: 'translateZ(0)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)'
          }}
        >
          <SpatialIcon Icon={ICONS.Eye} size={24} />
          <span className="text-lg">Découvrir mon Avatar 3D</span>
        </button>
      </ConditionalMotion>

      {/* Celebration Confetti Effect - disabled in performance mode, reduced in balanced */}
      {performanceConfig.enableParticleEffects && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[
            ...Array(performanceConfig.mode === 'quality' ? 8 : performanceConfig.mode === 'balanced' ? 4 : 0)
          ].map((_, i) => (
            <div
              key={`confetti-${i}`}
              className={`celebration-confetti celebration-confetti--${i + 1} absolute w-2 h-6 rounded-full`}
              style={{
                background: `linear-gradient(180deg, ${celebration.color}, ${celebration.color}60)`,
                left: `${10 + i * 10}%`,
                top: '-10%',
                '--celebration-color': celebration.color
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Extract confidence from scan results with fallback strategy
 */
function getConfidenceFromScanResults(scanResults: any): number {
  // PRIORITY 1: AI refinement confidence (most accurate after complete processing)
  const aiRefinementConfidence = scanResults?.match?.ai_refinement?.ai_confidence;
  if (typeof aiRefinementConfidence === 'number' && Number.isFinite(aiRefinementConfidence) && aiRefinementConfidence > 0 && aiRefinementConfidence <= 1) {
    logger.debug('CELEBRATION', 'Using AI refinement confidence (highest priority)', {
      confidence: aiRefinementConfidence,
      source: 'ai_refinement.ai_confidence',
      clientScanId: scanResults?.clientScanId,
      serverScanId: scanResults?.serverScanId,
      philosophy: 'ai_refinement_confidence_priority'
    });
    return aiRefinementConfidence;
  }
  
  // Try other sources for confidence with proper validation (fallback hierarchy)
  const sources = [
    scanResults?.match?.semantic_coherence_score,
    scanResults?.estimate?.extracted_data?.processing_confidence,
    scanResults?.insights?.confidence,
    scanResults?.estimate?.confidence?.vision,
    scanResults?.semantic?.semantic_confidence,
    scanResults?.commit?.confidence,
    scanResults?.blending?.confidence
  ];
  
  for (const source of sources) {
    if (typeof source === 'number' && Number.isFinite(source) && source > 0 && source <= 1) {
      logger.debug('CELEBRATION', 'Found valid confidence from fallback source', {
        confidence: source,
        source: 'fallback_hierarchy',
        clientScanId: scanResults?.clientScanId,
        serverScanId: scanResults?.serverScanId,
        philosophy: 'fallback_confidence_used'
      });
      return source;
    }
  }
  
  logger.warn('CELEBRATION', 'No valid confidence found in scan results (including AI refinement)', {
    clientScanId: scanResults?.clientScanId,
    serverScanId: scanResults?.serverScanId,
    sourcesChecked: [
      { source: 'ai_refinement.ai_confidence', value: aiRefinementConfidence, type: typeof aiRefinementConfidence, isValid: typeof aiRefinementConfidence === 'number' && Number.isFinite(aiRefinementConfidence) && aiRefinementConfidence > 0 && aiRefinementConfidence <= 1 },
      ...sources.map((s, i) => ({ index: i, value: s, type: typeof s, isValid: typeof s === 'number' && Number.isFinite(s) && s > 0 && s <= 1 }))
    ],
    philosophy: 'no_confidence_found_comprehensive_check'
  });
  
  // Return 0 if no valid confidence found (will hide score display in UI)
  return 0;
}

export default BodyScanCelebrationStep;
