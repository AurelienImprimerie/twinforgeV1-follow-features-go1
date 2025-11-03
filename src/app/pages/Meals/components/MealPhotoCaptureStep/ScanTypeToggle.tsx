// src/app/pages/Meals/components/MealPhotoCaptureStep/ScanTypeToggle.tsx
/**
 * Scan Type Toggle Component
 * Allows switching between photo analysis and barcode scan modes
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { ScanType } from './types';

interface ScanTypeToggleProps {
  scanType: ScanType;
  onSelectScanType: (scanType: ScanType) => void;
}

const ScanTypeToggle: React.FC<ScanTypeToggleProps> = ({ scanType, onSelectScanType }) => {
  return (
    <div className="flex gap-3 mb-6">
      <motion.button
        onClick={() => onSelectScanType('photo-analysis')}
        className="flex-1 p-4 rounded-xl transition-all touch-feedback-css relative overflow-hidden"
        style={{
          background:
            scanType === 'photo-analysis'
              ? `radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 60%),
                 radial-gradient(circle at 70% 80%, rgba(5, 150, 105, 0.2) 0%, transparent 50%),
                 linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))`
              : `linear-gradient(135deg, rgba(107, 114, 128, 0.08), rgba(75, 85, 99, 0.06))`,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor:
            scanType === 'photo-analysis'
              ? 'rgba(16, 185, 129, 0.6)'
              : 'rgba(107, 114, 128, 0.25)',
          boxShadow:
            scanType === 'photo-analysis'
              ? `0 8px 32px rgba(16, 185, 129, 0.25),
                 0 0 40px rgba(16, 185, 129, 0.15),
                 inset 0 2px 0 rgba(255, 255, 255, 0.15)`
              : 'none',
        }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                scanType === 'photo-analysis'
                  ? `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                     linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.3))`
                  : 'rgba(107, 114, 128, 0.15)',
              border:
                scanType === 'photo-analysis'
                  ? '2px solid rgba(16, 185, 129, 0.5)'
                  : '1px solid rgba(107, 114, 128, 0.3)',
              boxShadow:
                scanType === 'photo-analysis' ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
            }}
          >
            <SpatialIcon
              Icon={ICONS.Camera}
              size={24}
              className={scanType === 'photo-analysis' ? 'text-white' : 'text-gray-400'}
              style={{
                filter:
                  scanType === 'photo-analysis' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
              }}
            />
          </div>
          <div className="space-y-0.5">
            <span
              className={`font-bold text-sm block ${
                scanType === 'photo-analysis' ? 'text-white' : 'text-gray-400'
              }`}
              style={{
                textShadow:
                  scanType === 'photo-analysis' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              Scan Repas IA
            </span>
            {scanType === 'photo-analysis' && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-200 text-xs font-medium block"
              >
                Recommandé
              </motion.span>
            )}
          </div>
        </div>
        {scanType === 'photo-analysis' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              pointerEvents: 'none',
            }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </motion.button>

      <motion.button
        onClick={() => onSelectScanType('barcode-scan')}
        className="flex-1 p-4 rounded-xl transition-all touch-feedback-css relative overflow-hidden"
        style={{
          background:
            scanType === 'barcode-scan'
              ? `radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 60%),
                 radial-gradient(circle at 70% 80%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
                 linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15))`
              : `linear-gradient(135deg, rgba(107, 114, 128, 0.08), rgba(75, 85, 99, 0.06))`,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor:
            scanType === 'barcode-scan' ? 'rgba(99, 102, 241, 0.6)' : 'rgba(107, 114, 128, 0.25)',
          boxShadow:
            scanType === 'barcode-scan'
              ? `0 8px 32px rgba(99, 102, 241, 0.25),
                 0 0 40px rgba(99, 102, 241, 0.15),
                 inset 0 2px 0 rgba(255, 255, 255, 0.15)`
              : 'none',
        }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                scanType === 'barcode-scan'
                  ? `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                     linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(79, 70, 229, 0.3))`
                  : 'rgba(107, 114, 128, 0.15)',
              border:
                scanType === 'barcode-scan'
                  ? '2px solid rgba(99, 102, 241, 0.5)'
                  : '1px solid rgba(107, 114, 128, 0.3)',
              boxShadow: scanType === 'barcode-scan' ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            <SpatialIcon
              Icon={ICONS.ScanBarcode}
              size={24}
              className={scanType === 'barcode-scan' ? 'text-white' : 'text-gray-400'}
              style={{
                filter:
                  scanType === 'barcode-scan' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
              }}
            />
          </div>
          <div className="space-y-0.5">
            <span
              className={`font-bold text-sm block ${
                scanType === 'barcode-scan' ? 'text-white' : 'text-gray-400'
              }`}
              style={{
                textShadow: scanType === 'barcode-scan' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              Code-Barre
            </span>
            {scanType === 'barcode-scan' && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-indigo-200 text-xs font-medium block"
              >
                Rapide
              </motion.span>
            )}
          </div>
        </div>
        {scanType === 'barcode-scan' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'rgba(99, 102, 241, 0.05)',
              pointerEvents: 'none',
            }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default ScanTypeToggle;
