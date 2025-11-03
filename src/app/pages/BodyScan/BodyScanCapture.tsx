import React from 'react';
import BodyScanCapture from './BodyScanCapture/BodyScanCapture';

/**
 * Body Scan Capture - Entry Point
 * Delegates to the modularized BodyScanCapture component
 * The actual component handles all progress tracking internally
 */
const BodyScanCaptureEntry: React.FC = () => {
  return <BodyScanCapture />;
};

export default BodyScanCaptureEntry;