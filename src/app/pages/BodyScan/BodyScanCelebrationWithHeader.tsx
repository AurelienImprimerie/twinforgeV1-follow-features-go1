/**
 * Body Scan Celebration with Progress Header
 * Wrapper component that displays the progress header during celebration
 */

import React from 'react';
import { useProgressStore } from '../../../system/store/progressStore';
import BodyScanProgressHeader from './BodyScanProgressHeader';
import BodyScanCelebrationStep from './BodyScanCelebrationStep';

const BodyScanCelebrationWithHeader: React.FC = () => {
  const { isActive, steps, currentStep, progress, message, subMessage } = useProgressStore();

  return (
    <div className="max-w-4xl mx-auto mt-4 space-y-6 pb-4 forge-body-page-container">
      {/* Progress Header - Hidden during celebration phase as requested */}

      {/* Celebration Content */}
      <BodyScanCelebrationStep />
    </div>
  );
};

export default BodyScanCelebrationWithHeader;
