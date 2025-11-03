/**
 * Photo Capture Status Component
 * Displays photo capture status and validation badges
 */

import React from 'react';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface CapturedPhotoEnhanced {
  type: 'front' | 'profile';
  url: string;
  validationResult?: {
    isValid: boolean;
    issues: string[];
  };
}

interface PhotoCaptureStatusProps {
  photo: CapturedPhotoEnhanced | undefined;
  photoType: 'front' | 'profile';
  isValidating: boolean;
}

const PhotoCaptureStatus: React.FC<PhotoCaptureStatusProps> = ({
  photo,
  photoType,
  isValidating,
}) => {
  const getStatusColor = () => {
    return photoType === 'front' ? 'var(--color-nutrition-primary)' : '#A855F7';
  };

  const statusColor = getStatusColor();

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Status Principal */}
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          background: photo 
            ? `color-mix(in srgb, ${statusColor} 15%, transparent)`
            : `color-mix(in srgb, #60A5FA 15%, transparent)`,
          border: photo
            ? `1px solid color-mix(in srgb, ${statusColor} 30%, transparent)`
            : '1px solid color-mix(in srgb, #60A5FA 30%, transparent)',
          color: photo ? statusColor : '#60A5FA',
          backdropFilter: 'blur(8px) saturate(120%)'
        }}
      >
        <div className="w-3 h-3 rounded-full bg-current opacity-60 flex items-center justify-center">
        </div>
        <span>{photo ? (photo.validationResult?.isValid ? 'Capturée & Validée' : 'Capturée') : 'En attente'}</span>
      </div>
    </div>
  );
};

export default PhotoCaptureStatus;