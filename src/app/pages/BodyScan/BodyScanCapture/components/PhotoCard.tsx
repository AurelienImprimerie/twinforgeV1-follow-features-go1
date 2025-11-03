/**
 * Photo Card Component
 * Individual photo card for front or profile photo capture
 */

import React from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../../hooks/useBodyScanPerformance';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import PhotoGuideOverlay from '../../PhotoGuideOverlay';
import CapturedPhotoDisplay from './CapturedPhotoDisplay';
import PhotoCaptureStatus from './PhotoCaptureStatus';
import PhotoCaptureControls from './PhotoCaptureControls';
import type { UserGender } from '../../constants';

interface CapturedPhotoEnhanced {
  type: 'front' | 'profile';
  url: string;
  validationResult?: {
    isValid: boolean;
    issues: string[];
  };
}

interface PhotoCardProps {
  photoType: 'front' | 'profile';
  step: 'front-photo' | 'profile-photo';
  capturedPhotos: CapturedPhotoEnhanced[];
  userGender?: UserGender;
  isFaceScan?: boolean;
  isValidating: boolean;
  showSuccessAnimation: 'front' | 'profile' | null;
  isProgressInitialized?: boolean;
  onRetake: (type: 'front' | 'profile') => void;
  onCameraClick: () => void;
  onGalleryClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photoType,
  step,
  capturedPhotos,
  userGender,
  isFaceScan = false,
  isValidating,
  showSuccessAnimation,
  isProgressInitialized,
  onRetake,
  onCameraClick,
  onGalleryClick,
  fileInputRef,
  onFileSelect,
}) => {
  const performanceConfig = useBodyScanPerformance();
  const existingPhoto = capturedPhotos.find(p => p.type === photoType);
  const isCurrentStep =
    (photoType === 'front' && step === 'front-photo') ||
    (photoType === 'profile' && step === 'profile-photo');

  // Theme logic: Face scan = cyan theme for both cards, Body scan = cyan front / purple profile
  const cardColor = isFaceScan
    ? 'var(--color-plasma-cyan)' // Face scan: cyan for both front and profile
    : photoType === 'front'
      ? 'var(--color-plasma-cyan)' // Body scan: cyan for front
      : '#A855F7'; // Body scan: purple for profile

  const cardIcon = photoType === 'front' ? ICONS.User : ICONS.RotateCcw;
  const cardTitle = photoType === 'front' ? 'Photo de face' : 'Photo de profil';

  return (
    <ConditionalMotion
      data-photo-type={photoType}
      initial={performanceConfig.enableInitialAnimations ? { opacity: 0, x: photoType === 'front' ? -20 : 20 } : false}
      animate={performanceConfig.enableInitialAnimations ? { opacity: 1, x: 0 } : { opacity: 1 }}
      transition={performanceConfig.enableFramerMotion ? {
        duration: 0.6,
        delay: photoType === 'front' ? 0 : 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      } : undefined}
      className="w-full max-w-2xl"
    >
      <GlassCard
        className={`p-6 h-full relative photo-card photo-card--${photoType}`}
        style={{
          background: `radial-gradient(circle at 30% 20%, color-mix(in srgb, ${cardColor} 8%, transparent) 0%, transparent 60%), var(--glass-opacity-base)`,
          borderColor: `color-mix(in srgb, ${cardColor} 25%, transparent)`,
          borderRadius: '24px',
          overflow: 'hidden',
        }}
      >
        <div className="flex items-start justify-between mb-6 min-h-[3rem]">
          <h4 className="text-white text-lg font-semibold flex items-center gap-3">
            {/* IMPORTANT: on pousse la couleur dans --icon-color pour styler le conteneur & la lueur */}
            <div
              className="glowing-icon-container"
              style={
                {
                  // rend le conteneur et sa lueur cohérents avec la carte
                  '--icon-color': cardColor,
                } as React.CSSProperties
              }
            >
              <SpatialIcon
                Icon={cardIcon}
                size={16}
                style={{
                  color: cardColor,
                  // halo de l’icône synchronisé
                  filter: `drop-shadow(0 0 8px ${cardColor}80) drop-shadow(0 0 16px ${cardColor}60)`,
                }}
                variant="pure"
              />
            </div>
            <span className="glowing-title-text">{cardTitle}</span>
          </h4>

          <PhotoCaptureStatus
            photo={existingPhoto}
            photoType={photoType}
            isValidating={isValidating}
          />
        </div>

        {existingPhoto ? (
          <CapturedPhotoDisplay
            photo={existingPhoto}
            showSuccessAnimation={showSuccessAnimation === photoType}
            onRetake={() => onRetake(photoType)}
          />
        ) : (
          <div className="space-y-6">
            <PhotoGuideOverlay type={photoType} isFaceScan={isFaceScan} gender={userGender} />

            {isCurrentStep && (
              <PhotoCaptureControls
                photoType={photoType}
                isValidating={isValidating}
                isProgressInitialized={isProgressInitialized}
                onCameraClick={onCameraClick}
                onGalleryClick={onGalleryClick}
                fileInputRef={fileInputRef}
                onFileSelect={onFileSelect}
              />
            )}

            {!isCurrentStep && !existingPhoto && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="space-y-3">
                  <SpatialIcon Icon={ICONS.Clock} size={24} className="text-white/60" />
                  <p className="text-sm text-white/60">
                    {photoType === 'profile'
                      ? "Complétez d'abord la photo de face"
                      : 'En attente'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </ConditionalMotion>
  );
};

export default PhotoCard;