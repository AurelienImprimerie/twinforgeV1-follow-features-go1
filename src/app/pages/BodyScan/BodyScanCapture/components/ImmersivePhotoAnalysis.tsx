import React, { useEffect, useState, useMemo } from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../../hooks/useBodyScanPerformance';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useProgressStore } from '../../../../../system/store/progressStore';
import type { CapturedPhotoEnhanced } from '../../../../../domain/types';
import logger from '../../../../../lib/utils/logger';
import AnalysisInsightsGrid from '../../../../../ui/components/forge/AnalysisInsightsGrid';

interface ImmersivePhotoAnalysisProps {
  capturedPhotos: CapturedPhotoEnhanced[];
  currentProgress: number;
  currentMessage: string;
  currentSubMessage: string;
}

/**
 * Immersive Photo Analysis – VisionOS26 / TwinForge
 * - Relié aux CSS existantes (classes analysis-*, glass-card, etc.)
 * - Toutes les décos sont CLIPPÉES (rounded + overflow-hidden)
 * - Couleur d’analyse via --analysis-color (par défaut: var(--color-body-scan-primary))
 * - Respect de prefers-reduced-motion (animations off si pas "full")
 */
const ImmersivePhotoAnalysis: React.FC<ImmersivePhotoAnalysisProps> = ({
  capturedPhotos,
  currentProgress,
  currentMessage,
  currentSubMessage,
}) => {
  const performanceConfig = useBodyScanPerformance();
  const shouldAnimate = performanceConfig.enableCSSAnimations;

  // Photos
  const frontPhoto = useMemo(
    () => capturedPhotos.find((p) => p.type === 'front'),
    [capturedPhotos]
  );
  const profilePhoto = useMemo(
    () => capturedPhotos.find((p) => p.type === 'profile'),
    [capturedPhotos]
  );

  if (!frontPhoto || !profilePhoto) {
    logger.warn('IMMERSIVE_PHOTO_ANALYSIS', 'Photos manquantes pour l’analyse immersive', {
      hasFrontPhoto: !!frontPhoto,
      hasProfilePhoto: !!profilePhoto,
      totalPhotos: capturedPhotos.length,
    });
    return null;
  }

  // Points clés (statiques) - Reduced count in performance mode
  const frontKeypoints = useMemo(
    () => {
      const allPoints = [
        { x: 50, y: 12, label: 'Tête' },
        { x: 40, y: 25, label: 'Épaule G' },
        { x: 60, y: 25, label: 'Épaule D' },
        { x: 50, y: 45, label: 'Taille' },
        { x: 45, y: 65, label: 'Hanche G' },
        { x: 55, y: 65, label: 'Hanche D' },
        { x: 45, y: 90, label: 'Pied G' },
        { x: 55, y: 90, label: 'Pied D' },
      ];
      // Reduce to 5 keypoints in performance mode (head, shoulders, waist, feet)
      return performanceConfig.mode === 'high-performance'
        ? [allPoints[0], allPoints[1], allPoints[2], allPoints[3], allPoints[6]]
        : allPoints;
    },
    [performanceConfig.mode]
  );

  const profileKeypoints = useMemo(
    () => {
      const allPoints = [
        { x: 50, y: 15, label: 'Tête' },
        { x: 45, y: 35, label: 'Épaule' },
        { x: 50, y: 50, label: 'Taille' },
        { x: 48, y: 70, label: 'Hanche' },
        { x: 50, y: 90, label: 'Pied' },
      ];
      // Reduce to 3 keypoints in performance mode (head, waist, foot)
      return performanceConfig.mode === 'high-performance'
        ? [allPoints[0], allPoints[2], allPoints[4]]
        : allPoints;
    },
    [performanceConfig.mode]
  );

  // Zones d'analyse dynamiques - DÉSACTIVÉES en mode performance
  const [analysisZones, setAnalysisZones] = useState<
    Array<{ x: number; y: number; intensity: number; id: string }>
  >([]);

  useEffect(() => {
    // OPTIMIZATION: Désactiver complètement la génération en mode performance
    if (!shouldAnimate || !performanceConfig.enableParticleEffects) {
      setAnalysisZones([]); // Clear zones immediately
      return;
    }

    const generateZones = () => {
      // Reduce zone count: 3 → 2 in balanced mode
      const zoneCount = performanceConfig.mode === 'quality' ? 3 : 2;
      const zones = Array.from({ length: zoneCount }, (_, i) => ({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        intensity: Math.random() * 0.8 + 0.2,
        id: `zone-${Date.now()}-${i}`,
      }));
      setAnalysisZones(zones);
    };

    generateZones();
    // Increase interval: 2s → 3s for better performance
    const interval = setInterval(generateZones, 3000);
    return () => clearInterval(interval);
  }, [shouldAnimate, performanceConfig.enableParticleEffects, performanceConfig.mode]);

  // Particules de flux de données (positions fixes par montage)
  type Particle = {
    id: string;
    x: number;   // en %
    y: number;   // en %
    dx: number;  // dérive horizontale finale (en % du conteneur)
    dy: number;  // déplacement vertical (px, négatif = monte)
    speed: number; // s
    size: number;  // px
    delay: number; // s
  };

  const dataParticles: Particle[] = useMemo(() => {
    // Reduce particle count based on performance mode
    const particleCount = performanceConfig.mode === 'quality' ? 6 :
                          performanceConfig.mode === 'balanced' ? 4 : 0;

    if (particleCount === 0) return [];

    // Répartir sur toute la largeur, démarrage vers le bas pour une montée visible
    return Array.from({ length: particleCount }, (_, i) => {
      const x = 12 + Math.random() * 76;            // 12% → 88% (évite les bords)
      const y = 70 + Math.random() * 25;            // zone inférieure (70% → 95%)
      const dx = (Math.random() - 0.5) * 30;        // dérive horizontale -15% → +15%
      const dy = -120 - Math.random() * 120;        // monte de 120 → 240 px
      const speed = 3 + Math.random() * 3;          // 3s → 6s
      const size = 8 + Math.round(Math.random() * 6); // 8px → 14px
      const delay = i * 0.3;                         // décalage progressif
      return { id: `p-${i}`, x, y, dx, dy, speed, size, delay };
    });
  }, [performanceConfig.mode]);

  // Animation basique - conditionnelle selon mode performance
  const cardEnter = performanceConfig.enableInitialAnimations ? { opacity: 0, scale: 0.94 } : false;
  const cardShow  = { opacity: 1, scale: 1 };
  const ease      = [0.25, 0.1, 0.25, 1];

  // Couleur d'analyse pour les effets de lueur
  const analysisColor = 'var(--color-body-scan-primary)';

  // Modules d'analyse pour la grille informative
  const analysisModules = [
    {
      icon: 'Scan' as const,
      label: 'Détection Morphologique',
      sublabel: 'Extraction des points clés corporels',
      color: '#8B5CF6',
      activeThreshold: 10
    },
    {
      icon: 'Zap' as const,
      label: 'Analyse IA Avancée',
      sublabel: 'Matching archetypes et affinement',
      color: '#A855F7',
      activeThreshold: 40
    },
    {
      icon: 'Box' as const,
      label: 'Génération 3D',
      sublabel: 'Construction avatar personnalisé',
      color: '#C084FC',
      activeThreshold: 70
    }
  ];

  return (
    <div
      className="immersive-analysis-container twinforge visionos-26 space-y-8 -mt-2"
      style={{ '--analysis-color': analysisColor } as React.CSSProperties}
    >
      {/* Patient Message - Always visible */}
      <ConditionalMotion
        initial={cardEnter}
        animate={cardShow}
        transition={performanceConfig.enableFramerMotion ? { duration: 0.5, ease } : undefined}
      >
        <GlassCard className="p-5 border-2 border-purple-400/30">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))
                `,
                border: '3px solid color-mix(in srgb, #8B5CF6 70%, transparent)',
                boxShadow: '0 0 30px color-mix(in srgb, #8B5CF6 50%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Clock} size={20} style={{ color: '#8B5CF6' }} variant="pure" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-1">
                Analyse IA en cours...
              </h3>
              <p className="text-white/70 text-sm">
                L'analyse morphologique prend environ 1 à 2 minutes. Restez patient, la précision en vaut la peine.
              </p>
            </div>
          </div>
          {/* Progress percentage */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Progression</span>
              <span className="text-white font-medium">{Math.round(currentProgress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${currentProgress}%`,
                  background: 'linear-gradient(90deg, #8B5CF6, #A855F7)',
                  boxShadow: '0 0 10px #8B5CF6'
                }}
              />
            </div>
          </div>
        </GlassCard>
      </ConditionalMotion>
      {/* Photos d'analyse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Face */}
        <ConditionalMotion
          initial={cardEnter}
          animate={cardShow}
          transition={performanceConfig.enableFramerMotion ? { duration: 0.7, ease } : undefined}
        >
          <GlassCard className="glass-card analysis-photo-card analysis-photo-card--front p-4 relative overflow-hidden rounded-2xl border-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center breathing-icon"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, var(--color-plasma-cyan) 35%, transparent), color-mix(in srgb, var(--color-plasma-cyan) 25%, transparent))
                    `,
                    border: '3px solid color-mix(in srgb, var(--color-plasma-cyan) 70%, transparent)',
                    boxShadow: `
                      0 0 40px color-mix(in srgb, var(--color-plasma-cyan) 60%, transparent),
                      0 0 80px color-mix(in srgb, var(--color-plasma-cyan) 40%, transparent),
                      0 0 120px color-mix(in srgb, var(--brand-primary) 30%, transparent),
                      inset 0 3px 0 rgba(255,255,255,0.4),
                      inset 0 -2px 0 rgba(0,0,0,0.2)
                    `,
                    backdropFilter: 'blur(20px) saturate(170%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(170%)',
                    '--icon-color': 'var(--color-plasma-cyan)' as any,
                  } as React.CSSProperties}
                >
                  <SpatialIcon Icon={ICONS.User} size={16} style={{ color: 'var(--color-plasma-cyan)' }} variant="pure" />
                </div>
                Photo de Face
              </h4>
              <div className="analysis-status-badge">
                <div className="w-2 h-2 rounded-full status-dot" />
                <span className="text-xs font-medium">Analyse IA</span>
              </div>
            </div>

            <figure
              className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/20"
              role="group"
              aria-label="Analyse de la photo de face"
            >
              <img
                src={frontPhoto.url}
                alt="Photo de face en cours d’analyse"
                className="w-full h-full object-contain analysis-photo"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />

              {/* Lightweight scan animation - Always visible */}
              <div className="lightweight-scan-overlay" aria-hidden="true">
                <div className="lightweight-scan-line" />
              </div>

              {/* Full overlays - Only in quality mode */}
              {shouldAnimate && performanceConfig.enableScanLineOverlays && (
                <>
                  <div className="scan-line-vertical" aria-hidden="true" />

                  <div className="analysis-grid" aria-hidden="true">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="grid-cell"
                        style={{ ['--cell-index' as any]: i } as React.CSSProperties}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <div className="body-keypoints body-keypoints--front" aria-hidden="true">
                    {frontKeypoints.map((pt, index) => (
                      <div
                        key={pt.label}
                        className="keypoint"
                        style={
                          {
                            left: `${pt.x}%`,
                            top: `${pt.y}%`,
                            ['--keypoint-index' as any]: index,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </div>

                  {analysisZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="analysis-zone"
                      style={
                        {
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          ['--zone-intensity' as any]: zone.intensity,
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                  ))}

                  <div className="ai-focus-overlay ai-focus-overlay--front" aria-hidden="true" />
                </>
              )}
              <figcaption className="sr-only">Repérage des articulations et analyse de surface</figcaption>
            </figure>
          </GlassCard>
        </ConditionalMotion>

        {/* Profil */}
        <ConditionalMotion
          initial={cardEnter}
          animate={cardShow}
          transition={performanceConfig.enableFramerMotion ? { duration: 0.7, delay: 0.15, ease } : undefined}
        >
          <GlassCard className="glass-card analysis-photo-card analysis-photo-card--profile p-4 relative overflow-hidden rounded-2xl border-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center breathing-icon"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, #A855F7 35%, transparent), color-mix(in srgb, #A855F7 25%, transparent))
                    `,
                    border: '3px solid color-mix(in srgb, #A855F7 70%, transparent)',
                    boxShadow: `
                      0 0 40px color-mix(in srgb, #A855F7 60%, transparent),
                      0 0 80px color-mix(in srgb, #A855F7 40%, transparent),
                      0 0 120px color-mix(in srgb, var(--brand-primary) 30%, transparent),
                      inset 0 3px 0 rgba(255,255,255,0.4),
                      inset 0 -2px 0 rgba(0,0,0,0.2)
                    `,
                    backdropFilter: 'blur(20px) saturate(170%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(170%)',
                    '--icon-color': '#A855F7' as any,
                  } as React.CSSProperties}
                >
                  <SpatialIcon Icon={ICONS.RotateCcw} size={16} style={{ color: '#A855F7' }} variant="pure" />
                </div>
                Photo de Profil
              </h4>
              <div className="analysis-status-badge">
                <div className="w-2 h-2 rounded-full status-dot" />
                <span className="text-xs font-medium">Analyse IA</span>
              </div>
            </div>

            <figure
              className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/20"
              role="group"
              aria-label="Analyse de la photo de profil"
            >
              <img
                src={profilePhoto.url}
                alt="Photo de profil en cours d’analyse"
                className="w-full h-full object-contain analysis-photo"
                loading={performanceConfig.imageLoadingStrategy}
                decoding="async"
              />

              {/* Lightweight scan animation - Always visible */}
              <div className="lightweight-scan-overlay" aria-hidden="true">
                <div className="lightweight-scan-line" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Full overlays - Only in quality mode */}
              {shouldAnimate && performanceConfig.enableScanLineOverlays && (
                <>
                  <div className="scan-line-horizontal" aria-hidden="true" />

                  <div className="analysis-grid" aria-hidden="true">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="grid-cell"
                        style={{ ['--cell-index' as any]: i } as React.CSSProperties}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <div className="body-keypoints body-keypoints--profile" aria-hidden="true">
                    {profileKeypoints.map((pt, index) => (
                      <div
                        key={pt.label}
                        className="keypoint"
                        style={
                          {
                            left: `${pt.x}%`,
                            top: `${pt.y}%`,
                            ['--keypoint-index' as any]: index,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </div>

                  {analysisZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="analysis-zone"
                      style={
                        {
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          ['--zone-intensity' as any]: zone.intensity,
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                  ))}

                  <div className="ai-focus-overlay ai-focus-overlay--profile" aria-hidden="true" />
                </>
              )}
              <figcaption className="sr-only">Analyse latérale et maillage de contrôle</figcaption>
            </figure>
          </GlassCard>
        </ConditionalMotion>
      </div>

      {/* Analysis Insights Grid */}
      <AnalysisInsightsGrid
        modules={analysisModules}
        progress={currentProgress}
        themeColor="#8B5CF6"
        reduceMotion={!shouldAnimate}
        className="mt-8"
      />

      {/* Flux de données (particules) - DÉSACTIVÉ en mode performance */}
      {shouldAnimate && performanceConfig.enableDataParticles && (
        <div className="data-flow-container" aria-hidden="true">
          {dataParticles.map((p, i) => (
            <div
              key={p.id}
              className="data-particle"
              style={
                {
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  ['--particle-index' as any]: i,
                  ['--data-particle-speed' as any]: `${p.speed}s`,
                  ['--particle-dx' as any]: `${p.dx}%`,
                  ['--particle-dy' as any]: `${p.dy}px`,
                  ['--data-particle-size' as any]: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImmersivePhotoAnalysis;