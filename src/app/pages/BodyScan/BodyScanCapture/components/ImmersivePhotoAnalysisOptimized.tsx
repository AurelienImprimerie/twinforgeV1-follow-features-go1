/**
 * Immersive Photo Analysis - Optimized Body Forge Edition
 * GPU-accelerated Stage 2 analysis with unified CSS system
 * Replaces Framer Motion with pure CSS for superior performance
 */

import React, { useEffect, useState, useMemo } from 'react';
import { usePreferredMotion } from '../../../../../system/device/DeviceProvider';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { CapturedPhotoEnhanced } from '../../../../../domain/types';
import logger from '../../../../../lib/utils/logger';

interface ImmersivePhotoAnalysisProps {
  capturedPhotos: CapturedPhotoEnhanced[];
  currentProgress: number;
  currentMessage: string;
  currentSubMessage: string;
}

/**
 * Immersive Photo Analysis - Body Forge
 * Uses forge-immersive-analysis.css for all animations
 * GPU-optimized with Body Forge color theme
 */
const ImmersivePhotoAnalysis: React.FC<ImmersivePhotoAnalysisProps> = ({
  capturedPhotos,
  currentProgress,
  currentMessage,
  currentSubMessage,
}) => {
  const preferredMotion = usePreferredMotion();
  const shouldAnimate = preferredMotion === 'full';

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
    logger.warn('IMMERSIVE_PHOTO_ANALYSIS', 'Photos manquantes pour l\'analyse immersive', {
      hasFrontPhoto: !!frontPhoto,
      hasProfilePhoto: !!profilePhoto,
      totalPhotos: capturedPhotos.length,
    });
    return null;
  }

  // Key points for body analysis
  const frontKeypoints = useMemo(
    () => [
      { x: 50, y: 12, label: 'Tête' },
      { x: 40, y: 25, label: 'Épaule G' },
      { x: 60, y: 25, label: 'Épaule D' },
      { x: 50, y: 45, label: 'Taille' },
      { x: 45, y: 65, label: 'Hanche G' },
      { x: 55, y: 65, label: 'Hanche D' },
      { x: 45, y: 90, label: 'Pied G' },
      { x: 55, y: 90, label: 'Pied D' },
    ],
    []
  );

  const profileKeypoints = useMemo(
    () => [
      { x: 50, y: 15, label: 'Tête' },
      { x: 45, y: 35, label: 'Épaule' },
      { x: 50, y: 50, label: 'Taille' },
      { x: 48, y: 70, label: 'Hanche' },
      { x: 50, y: 90, label: 'Pied' },
    ],
    []
  );

  return (
    <div className="forge-analysis-container">
      {/* Photo Grid - Uses CSS animations */}
      <div className="forge-photo-grid">
        {/* Front Photo Card */}
        <div className="forge-photo-card">
          <img
            src={frontPhoto.url}
            alt="Photo de face en cours d'analyse"
            loading="eager"
            decoding="async"
          />
          <div className="forge-photo-overlay">
            <span className="forge-photo-label">Photo de Face</span>
          </div>
        </div>

        {/* Profile Photo Card */}
        <div className="forge-photo-card">
          <img
            src={profilePhoto.url}
            alt="Photo de profil en cours d'analyse"
            loading="eager"
            decoding="async"
          />
          <div className="forge-photo-overlay">
            <span className="forge-photo-label">Photo de Profil</span>
          </div>
        </div>
      </div>

      {/* Analysis Modules Grid - Inspired by Activity Tracker */}
      <div className="forge-analysis-modules">
        {/* Module 1: Morphologie Détectée */}
        <div className="forge-analysis-module forge-analysis-module--body forge-analysis-module--processing">
          <div className="forge-module-header">
            <div className="forge-module-icon forge-module-icon--body">
              <SpatialIcon Icon={ICONS.User} size={20} />
            </div>
            <h4 className="forge-module-title">Morphologie Détectée</h4>
          </div>
          <div className="forge-module-content">
            <div className="forge-module-label">Points clés identifiés</div>
            <div className="forge-module-value forge-module-value--body">
              {frontKeypoints.length + profileKeypoints.length}
            </div>
            <div className="forge-module-progress">
              <div
                className="forge-module-progress-fill forge-module-progress-fill--body"
                style={{ width: `${Math.min(currentProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module 2: Analyse Tissulaire */}
        <div className="forge-analysis-module forge-analysis-module--body forge-analysis-module--processing">
          <div className="forge-module-header">
            <div className="forge-module-icon forge-module-icon--body">
              <SpatialIcon Icon={ICONS.Zap} size={20} />
            </div>
            <h4 className="forge-module-title">Analyse Tissulaire</h4>
          </div>
          <div className="forge-module-content">
            <div className="forge-module-label">Zones analysées</div>
            <div className="forge-module-value forge-module-value--body">12/16</div>
            <div className="forge-module-progress">
              <div
                className="forge-module-progress-fill forge-module-progress-fill--body"
                style={{ width: '75%' }}
              />
            </div>
          </div>
        </div>

        {/* Module 3: Proportion & Symétrie */}
        <div className="forge-analysis-module forge-analysis-module--body forge-analysis-module--processing">
          <div className="forge-module-header">
            <div className="forge-module-icon forge-module-icon--body">
              <SpatialIcon Icon={ICONS.Target} size={20} />
            </div>
            <h4 className="forge-module-title">Proportion & Symétrie</h4>
          </div>
          <div className="forge-module-content">
            <div className="forge-module-label">Précision</div>
            <div className="forge-module-value forge-module-value--body">94%</div>
            <div className="forge-module-progress">
              <div
                className="forge-module-progress-fill forge-module-progress-fill--body"
                style={{ width: '94%' }}
              />
            </div>
          </div>
        </div>

        {/* Module 4: Estimation Masse */}
        <div className="forge-analysis-module forge-analysis-module--body forge-analysis-module--processing">
          <div className="forge-module-header">
            <div className="forge-module-icon forge-module-icon--body">
              <SpatialIcon Icon={ICONS.Activity} size={20} />
            </div>
            <h4 className="forge-module-title">Estimation Masse</h4>
          </div>
          <div className="forge-module-content">
            <div className="forge-module-label">Segments calculés</div>
            <div className="forge-module-value forge-module-value--body">8/8</div>
            <div className="forge-module-progress">
              <div
                className="forge-module-progress-fill forge-module-progress-fill--body"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Central Analysis Loader - Only shown during initial processing */}
      {currentProgress < 30 && (
        <div className="forge-analysis-loader">
          <div className="forge-analysis-spinner forge-analysis-spinner--body" />
          <div className="forge-analysis-text">
            <h3 className="forge-analysis-title">{currentMessage}</h3>
            <p className="forge-analysis-subtitle">{currentSubMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImmersivePhotoAnalysis;
