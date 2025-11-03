// src/app/pages/Avatar/tabs/AvatarTab.tsx
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Lazy load Avatar3DViewer (Three.js = 30MB, lazy loading = initial bundle -30%)
const Avatar3DViewer = lazy(() => import('../../../../components/3d/Avatar3DViewer'));
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useUserStore } from '../../../../system/store/userStore';
import { useBodyScanData } from '../../../../hooks/useBodyScanData';
import MorphologyInsightsCard from './components/MorphologyInsightsCard';
import BodyMetricsCard from './components/BodyMetricsCard';
import AvatarTabSkeleton from '../../../../ui/components/skeletons/AvatarTabSkeleton';
import EmptyAvatarTabState from './EmptyAvatarTabState';
import logger from '../../../../lib/utils/logger';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import { ConditionalMotion } from '../../../../lib/motion/ConditionalMotion';

/**
 * Avatar Tab - Viewer 3D avec ajustements fins
 * Permet la visualisation et l'ajustement subtil de l'avatar corporel
 */
const AvatarTab: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const { isPerformanceMode } = usePerformanceMode();

  // Use the same robust hook as ProjectionTab
  const { bodyScanData: latestScanData, isLoading, error } = useBodyScanData();

  // Enhanced loading state management for smooth UX
  const [isComponentMounting, setIsComponentMounting] = useState(true);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const previousScanIdRef = useRef<string | undefined>(undefined);

  // Minimum display time for skeleton (400ms) to avoid flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentMounting(false);
      logger.debug('AVATAR_TAB', 'Component mounting delay complete', {
        philosophy: 'minimum_skeleton_display_time'
      });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Reset viewer ready state ONLY when scan data changes to a DIFFERENT scan
  useEffect(() => {
    if (latestScanData?.id && latestScanData.id !== previousScanIdRef.current) {
      setIsViewerReady(false);
      previousScanIdRef.current = latestScanData.id;
      logger.debug('AVATAR_TAB', 'Scan data changed to different scan, resetting viewer ready state', {
        scanId: latestScanData.id,
        previousScanId: previousScanIdRef.current,
        philosophy: 'reset_viewer_on_scan_change'
      });
    }
  }, [latestScanData?.id]);

  // Callback when the 3D viewer is fully initialized with morphs applied
  const handleViewerReady = useCallback(() => {
    logger.info('AVATAR_TAB', 'Avatar 3D viewer ready callback triggered', {
      currentlyReady: isViewerReady,
      scanId: latestScanData?.id,
      philosophy: 'viewer_ready_callback_triggered'
    });
    setIsViewerReady(true);
    logger.info('AVATAR_TAB', 'Avatar 3D viewer fully initialized and state updated', {
      philosophy: 'viewer_ready_state_updated'
    });
  }, [isViewerReady, latestScanData?.id]);

  // Validation plus souple: accepter les scans avec données partielles
  const hasMinimalData = latestScanData &&
    latestScanData.morph_values &&
    Object.keys(latestScanData.morph_values).length > 0 &&
    latestScanData.limb_masses &&
    Object.keys(latestScanData.limb_masses).length > 0;

  // Add timeout safety to prevent infinite skeleton - MUST BE BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    if (!isViewerReady && latestScanData?.id) {
      const safetyTimer = setTimeout(() => {
        if (!isViewerReady) {
          logger.warn('AVATAR_TAB', 'Safety timeout: forcing viewer ready after 10s', {
            scanId: latestScanData.id,
            isLoading,
            isComponentMounting,
            philosophy: 'safety_timeout_force_ready'
          });
          setIsViewerReady(true);
        }
      }, 10000); // 10 seconds safety timeout

      return () => clearTimeout(safetyTimer);
    }
  }, [isViewerReady, latestScanData?.id, isLoading, isComponentMounting]);

  // Log diagnostic information
  logger.info('AVATAR_TAB', 'Scan data loaded', {
    hasScan: !!latestScanData,
    scanId: latestScanData?.id,
    hasMorphValues: !!latestScanData?.morph_values,
    morphValuesCount: latestScanData?.morph_values ? Object.keys(latestScanData.morph_values).length : 0,
    hasLimbMasses: !!latestScanData?.limb_masses,
    limbMassesCount: latestScanData?.limb_masses ? Object.keys(latestScanData.limb_masses).length : 0,
    hasResolvedGender: !!latestScanData?.resolved_gender,
    resolvedGender: latestScanData?.resolved_gender,
    hasWeight: !!latestScanData?.weight,
    weight: latestScanData?.weight,
    philosophy: 'avatar_tab_diagnostics'
  });

  // Handle error state - AFTER ALL HOOKS
  if (error) {
    return (
      // Removed 'profile-section-container' and added 'p-8' directly to GlassCard for consistent padding
      <GlassCard className="text-center p-8">
        <ConditionalMotion
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <SpatialIcon Icon={ICONS.AlertCircle} size={32} color="#EF4444" />
        </ConditionalMotion>

        <h3 className="text-xl font-bold text-white mb-3">Erreur de chargement</h3>
        <p className="text-red-300 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          {error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement de votre avatar.'}
        </p>

        <button
          className="btn-glass px-6 py-3"
          onClick={() => window.location.reload()}
        >
          <div className="flex items-center justify-center gap-2">
            <SpatialIcon Icon={ICONS.RotateCcw} size={16} />
            <span>Actualiser</span>
          </div>
        </button>
      </GlassCard>
    );
  }

  // Log validation result
  if (latestScanData && !hasMinimalData) {
    logger.warn('AVATAR_TAB', 'Scan data incomplete', {
      scanId: latestScanData.id,
      morphValuesCount: latestScanData.morph_values ? Object.keys(latestScanData.morph_values).length : 0,
      limbMassesCount: latestScanData.limb_masses ? Object.keys(latestScanData.limb_masses).length : 0,
      missingMorphs: !latestScanData.morph_values || Object.keys(latestScanData.morph_values).length === 0,
      missingLimbMasses: !latestScanData.limb_masses || Object.keys(latestScanData.limb_masses).length === 0,
      philosophy: 'incomplete_scan_validation'
    });
  }

  // Handle no saved avatar (onboarding) - BEFORE checking loading states
  // This ensures we show empty state immediately when there's no data, without showing skeleton first
  if (!latestScanData || !hasMinimalData) {
    return <EmptyAvatarTabState />;
  }

  // Combined loading state: show skeleton until ALL conditions are met
  // Only show skeleton when we have data but it's still loading/initializing
  const isFullyLoading = isLoading || isComponentMounting || !isViewerReady;

  // Handle loading state - show skeleton until viewer is fully ready
  // At this point we know we have data (checked above), so skeleton is appropriate
  if (isFullyLoading && !error) {
    return <AvatarTabSkeleton />;
  }

  // Extract data directly from scan (no mapper needed)
  const displayMorphData = latestScanData.morph_values || {};
  const displayLimbMasses = latestScanData.limb_masses || {};
  const displaySkinTone = latestScanData.skin_tone || null;
  const displayGender = latestScanData.resolved_gender || profile?.sex || 'male';

  // Build user profile for viewer
  const userProfile = {
    sex: displayGender,
    height_cm: profile?.height_cm || 170,
    weight_kg: latestScanData.weight || profile?.weight_kg || 70
  };

  // Log final data being passed to viewer
  logger.info('AVATAR_TAB', 'Rendering avatar with data', {
    scanId: latestScanData.id,
    morphDataKeys: Object.keys(displayMorphData).length,
    limbMassesKeys: Object.keys(displayLimbMasses).length,
    hasSkinTone: !!displaySkinTone,
    resolvedGender: displayGender,
    userProfile,
    philosophy: 'avatar_render_data'
  });

  // Récupérer les morphs faciaux depuis le profil utilisateur
  const faceMorphData = profile?.preferences?.face?.final_face_params || {};
  const faceSkinTone = profile?.preferences?.face?.skin_tone || null;

  return (
    // Removed 'profile-section-container' class from here.
    // The padding will now be handled by the parent of AvatarTab (Tabs.Panel),
    // allowing GlassCard to expand to the full width of the Tabs.Panel.
    <ConditionalMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* 3D Avatar Viewer */}
      <GlassCard className="bodyscan-card p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(6, 182, 212, 0.25))
                `,
                border: '2px solid rgba(6, 182, 212, 0.5)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
              }}
            >
              <SpatialIcon Icon={ICONS.Eye} size={20} style={{ color: '#06B6D4' }} variant="pure" />
            </div>
            <span className="glowing-title-text">Votre Avatar 3D</span>
          </h3>
        </div>

        <div className="avatar-3d-viewer-container h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 relative overflow-hidden">
          <Suspense fallback={<AvatarTabSkeleton />}>
            <Avatar3DViewer
              userProfile={userProfile}
              morphData={displayMorphData}
              limbMasses={displayLimbMasses}
              skinTone={displaySkinTone}
              resolvedGender={displayGender}
              faceMorphData={faceMorphData}
              faceSkinTone={faceSkinTone}
              className="w-full h-full"
              autoRotate={true}
              showControls={true}
              onViewerReady={handleViewerReady}
            />
          </Suspense>
        </div>
      </GlassCard>
      
      {/* Body Metrics */}
      <BodyMetricsCard scan={latestScanData} />

      {/* Morphology Insights */}
      {displayMorphData && Object.keys(displayMorphData).length > 0 && (
        <MorphologyInsightsCard
          finalShapeParams={displayMorphData}
          resolvedGender={displayGender}
          userProfile={userProfile}
        />
      )}

      {/* Nouveau Scan Button - GlassCard Violet avec effet de respiration */}
      <GlassCard
        className="p-0 overflow-hidden relative"
        interactive
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.10) 0%, transparent 50%),
            var(--glass-opacity-base)
          `,
          borderColor: 'rgba(139, 92, 246, 0.4)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 40px rgba(139, 92, 246, 0.25),
            inset 0 2px 0 rgba(255, 255, 255, 0.2)
          `
        }}
      >
        {/* Effet de respiration en fond */}
        {!isPerformanceMode && (
          <div
            className="absolute inset-0 rounded-inherit pointer-events-none urgent-forge-glow-css"
            style={{
              background: `radial-gradient(circle at center, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 70%)`,
              filter: 'blur(20px)',
              transform: 'scale(1.2)',
              zIndex: 0
            }}
          />
        )}
        <ConditionalMotion
          as="button"
          onClick={() => navigate('/body-scan')}
          className="w-full px-8 py-4 rounded-2xl font-bold text-lg text-white relative overflow-hidden min-h-[64px] z-10"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(139, 92, 246, 0.25),
                rgba(139, 92, 246, 0.15)
              )
            `,
            border: 'none',
            backdropFilter: 'blur(20px) saturate(160%)'
          }}
          whileHover={{
            scale: 1.01,
            y: -1
          }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Shimmer Effect */}
          {!isPerformanceMode && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent)',
                animation: 'celebration-cta-shimmer-movement 2s ease-in-out infinite',
                borderRadius: 'inherit'
              }}
            />
          )}

          <div className="relative z-10 flex items-center justify-center gap-3">
            <SpatialIcon
              Icon={ICONS.Scan}
              size={24}
              style={{
                color: '#8B5CF6',
                filter: 'drop-shadow(0 2px 6px rgba(139, 92, 246, 0.5))'
              }}
              variant="pure"
            />
            <span style={{
              textShadow: '0 2px 8px rgba(139, 92, 246, 0.6)',
              color: 'white'
            }}>
              Nouveau scan corporel
            </span>
          </div>
        </ConditionalMotion>
      </GlassCard>
    </ConditionalMotion>
  );
};


export default AvatarTab;
