// src/components/3d/FaceViewer3D.tsx
import React from 'react';
import Avatar3DViewer from './Avatar3DViewer';
import type { UserProfile } from '../../domain/types';
import logger from '../../lib/utils/logger';

interface FaceViewer3DProps {
  faceMorphData: Record<string, number>;
  faceSkinTone?: any;
  userProfile?: UserProfile;
  resolvedGender: 'male' | 'female';
  className?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

/**
 * FaceViewer3D - Viewer spécialisé pour afficher uniquement la tête en 3D
 * Wrapper autour de Avatar3DViewer avec faceOnly=true et configuration optimisée
 */
const FaceViewer3D: React.FC<FaceViewer3DProps> = ({
  faceMorphData,
  faceSkinTone,
  userProfile,
  resolvedGender,
  className = '',
  autoRotate = true,
  showControls = true,
}) => {
  // Validation des données faciales avant le rendu
  React.useEffect(() => {
    if (!faceMorphData || Object.keys(faceMorphData).length === 0) {
      logger.error('FACE_VIEWER_3D', 'FaceViewer3D called with empty or missing faceMorphData', {
        hasFaceMorphData: !!faceMorphData,
        faceMorphDataKeys: Object.keys(faceMorphData || {}).length,
        philosophy: 'critical_missing_face_data'
      });
    } else {
      // Identify which keys might be from body scan (for monitoring)
      const potentialBodyKeys = [
        'pearFigure', 'appleShape', 'bodyWeight', 'shoulderWidth', 'neckLength',
        'neckThickness', 'athleteFigure', 'bodybuilderSize', 'height', 'chestSize',
        'torsoLength', 'muscularity', 'muscleDefinition', 'upperBodyWeight', 'lowerBodyWeight'
      ];
      const bodyKeysPresent = Object.keys(faceMorphData).filter(key => potentialBodyKeys.includes(key));

      logger.info('FACE_VIEWER_3D', 'Rendering FaceViewer3D with morph data', {
        hasFaceMorphData: !!faceMorphData,
        faceMorphDataKeys: Object.keys(faceMorphData).length,
        hasFaceSkinTone: !!faceSkinTone,
        resolvedGender,
        faceMorphDataSample: Object.keys(faceMorphData).slice(0, 10),
        bodyKeysPresent: bodyKeysPresent.length > 0 ? bodyKeysPresent : 'none',
        includesBodyMorphs: bodyKeysPresent.length > 0,
        philosophy: 'face_viewer_with_potential_body_keys'
      });
    }
  }, [faceMorphData, faceSkinTone, resolvedGender]);

  // Si pas de données faciales, afficher un message d'erreur
  if (!faceMorphData || Object.keys(faceMorphData).length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Données faciales manquantes</h3>
          <p className="text-white/60 text-sm">
            Les paramètres de morphologie faciale sont introuvables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Avatar3DViewer
      // Props spécifiques au visage
      faceMorphData={faceMorphData}
      faceSkinTone={faceSkinTone}
      faceOnly={true} // CRITIQUE: Active le mode face uniquement

      // Props utilisateur
      userProfile={userProfile}
      resolvedGender={resolvedGender}

      // Props de configuration
      className={className}
      autoRotate={autoRotate}
      showControls={showControls}

      // Props vides pour le corps (non utilisés en mode faceOnly)
      morphData={{}}
      limbMasses={{}}
    />
  );
};

export default FaceViewer3D;
