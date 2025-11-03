import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface Props {
  hasWearableData: boolean;
  dataCompletenessScore?: number | null;
  deviceName?: string;
  className?: string;
}

export default function WearableBadge({
  hasWearableData,
  dataCompletenessScore,
  deviceName,
  className = '',
}: Props) {
  if (!hasWearableData) return null;

  const completeness = dataCompletenessScore || 0;
  const color =
    completeness >= 80 ? '#22C55E' : completeness >= 50 ? '#3B82F6' : '#F59E0B';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 10%, transparent))`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        boxShadow: `0 0 12px color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      <SpatialIcon Icon={ICONS.Watch} size={12} style={{ color }} />
      <span style={{ color }}>Enrichi par wearable</span>
      {deviceName && <span className="text-white/60">• {deviceName}</span>}
      {dataCompletenessScore && (
        <span className="text-white/60">• {Math.round(completeness)}%</span>
      )}
    </motion.div>
  );
}
