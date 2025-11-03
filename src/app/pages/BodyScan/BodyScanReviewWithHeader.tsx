/**
 * Body Scan Review with Progress Header
 * Wrapper component that displays the progress header during 3D viewer review
 */

import React from 'react';
import { useProgressStore } from '../../../system/store/progressStore';
import BodyScanProgressHeader from './BodyScanProgressHeader';
import BodyScanReview from './BodyScanReview';

const BodyScanReviewWithHeader: React.FC = () => {
  const { isActive, steps, currentStep, progress, message, subMessage } = useProgressStore();

  return (
    <div className="max-w-7xl mx-auto mt-4 space-y-6 pb-4 forge-body-page-container">
      {/* Progress Header - Always visible, at 100% */}
      {isActive && steps.length > 0 && (
        <BodyScanProgressHeader
          steps={steps}
          currentStepId="avatar"
          progress={100}
          message="Avatar 3D Prêt"
          subMessage="Ajustez et sauvegardez votre reflet numérique"
        />
      )}

      {/* 3D Viewer Review Content */}
      <BodyScanReview />
    </div>
  );
};

export default BodyScanReviewWithHeader;
